import { prisma } from "./prisma";

interface MatchingParams {
  serviceId: string;
  latitude: number;
  longitude: number;
  preferredTime: Date;
}

interface MatchedWorker {
  id: string;
  userId: string;
  userName: string;
  bio: string | null;
  rating: number;
  completedJobs: number;
  distance: number;
  estimatedPrice: number;
  estimatedArrival: string;
  score: number;
}

// Haversine distance in km
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate arrival time based on distance
function estimateArrival(distanceKm: number): string {
  if (distanceKm < 2) return "15-20 min";
  if (distanceKm < 5) return "20-30 min";
  if (distanceKm < 10) return "30-45 min";
  if (distanceKm < 20) return "45-60 min";
  return "1-2 hours";
}

export async function findMatchingWorkers(
  params: MatchingParams
): Promise<MatchedWorker[]> {
  const { serviceId, latitude, longitude } = params;

  // Get the service for base price
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });
  if (!service) return [];

  // Find all available workers who are not rejected
  // Prioritize workers with matching skills; fallback to all available workers if none found
  let workers = await prisma.workerProfile.findMany({
    where: {
      verificationStatus: { not: "REJECTED" },
      isAvailable: true,
      skills: {
        some: { serviceId },
      },
    },
    include: {
      user: true,
      skills: {
        where: { serviceId },
      },
    },
  });

  // If no worker has explicitly tagged this skill, include all active available workers
  if (workers.length === 0) {
    workers = await prisma.workerProfile.findMany({
      where: {
        verificationStatus: { not: "REJECTED" },
        isAvailable: true,
      },
      include: {
        user: true,
        skills: true,
      },
    });
  }

  if (workers.length === 0) return [];

  // Get active bookings count for workload calculation
  const activeBookingCounts = await prisma.booking.groupBy({
    by: ["workerId"],
    where: {
      workerId: { in: workers.map((w) => w.userId) },
      status: { in: ["ACCEPTED", "IN_PROGRESS"] },
    },
    _count: { id: true },
  });

  const workloadMap = new Map(
    activeBookingCounts.map((b) => [b.workerId, b._count.id])
  );

  // Score and rank workers
  const scored: MatchedWorker[] = workers
    .map((worker) => {
      const workerLat = worker.latitude ?? latitude;
      const workerLon = worker.longitude ?? longitude;
      const distance = haversineDistance(
        latitude,
        longitude,
        workerLat,
        workerLon
      );

      const currentWorkload = workloadMap.get(worker.userId) ?? 0;
      const matchingSkill = worker.skills.find((s) => s.serviceId === serviceId);
      const experienceYears = matchingSkill?.experienceYears ?? 1;

      // Verified workers get bonus score
      const verifiedBonus = worker.verificationStatus === "VERIFIED" ? 25 : 10;
      const distanceScore = Math.max(0, 100 - distance * 2);
      const ratingScore = (worker.rating || 4.5) * 20;
      const workloadScore = Math.max(0, 100 - currentWorkload * 25);
      const experienceScore = Math.min(experienceYears * 10, 50);
      const jobsScore = Math.min(worker.completedJobs * 2, 50);

      const score =
        distanceScore * 0.3 +
        ratingScore * 0.2 +
        workloadScore * 0.2 +
        experienceScore * 0.15 +
        jobsScore * 0.1 +
        verifiedBonus;

      // Estimate price based on distance and experience
      const priceMultiplier = 1 + Math.min(distance, 20) * 0.01 + Math.min(experienceYears, 10) * 0.03;
      const estimatedPrice = Math.round(service.basePrice * priceMultiplier);

      return {
        id: worker.id,
        userId: worker.userId,
        userName: worker.user.name,
        bio: worker.bio || "Verified local service professional",
        rating: worker.rating || 5.0,
        completedJobs: worker.completedJobs,
        distance: Math.max(0.5, Math.round(distance * 10) / 10),
        estimatedPrice,
        estimatedArrival: estimateArrival(distance),
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored;
}
