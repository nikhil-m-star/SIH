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

  // Find all verified, available workers with matching skill
  const workers = await prisma.workerProfile.findMany({
    where: {
      verificationStatus: "VERIFIED",
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

      // Filter out workers too far away (50km max)
      if (distance > 50) return null;

      const currentWorkload = workloadMap.get(worker.userId) ?? 0;
      const experienceYears = worker.skills[0]?.experienceYears ?? 0;

      // Calculate score (higher is better)
      const distanceScore = Math.max(0, 100 - distance * 2); // 0-100
      const ratingScore = worker.rating * 20; // 0-100
      const workloadScore = Math.max(0, 100 - currentWorkload * 25); // penalize busy workers
      const experienceScore = Math.min(experienceYears * 10, 50); // 0-50
      const jobsScore = Math.min(worker.completedJobs * 2, 50); // 0-50

      const score =
        distanceScore * 0.3 +
        ratingScore * 0.25 +
        workloadScore * 0.2 +
        experienceScore * 0.15 +
        jobsScore * 0.1;

      // Estimate price based on distance and experience
      const priceMultiplier = 1 + distance * 0.02 + experienceYears * 0.05;
      const estimatedPrice = Math.round(service.basePrice * priceMultiplier);

      return {
        id: worker.id,
        userId: worker.userId,
        userName: worker.user.name,
        bio: worker.bio,
        rating: worker.rating,
        completedJobs: worker.completedJobs,
        distance: Math.round(distance * 10) / 10,
        estimatedPrice,
        estimatedArrival: estimateArrival(distance),
        score,
      };
    })
    .filter((w): w is MatchedWorker => w !== null)
    .sort((a, b) => b.score - a.score);

  return scored;
}
