import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      workerProfile: {
        include: {
          skills: { include: { service: true } },
        },
      },
    },
  });

  if (!user?.workerProfile) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    bio: user.workerProfile.bio,
    latitude: user.workerProfile.latitude,
    longitude: user.workerProfile.longitude,
    rating: user.workerProfile.rating,
    completedJobs: user.workerProfile.completedJobs,
    totalEarnings: user.workerProfile.totalEarnings,
    isAvailable: user.workerProfile.isAvailable,
    verificationStatus: user.workerProfile.verificationStatus,
    skills: user.workerProfile.skills.map((s) => ({
      serviceId: s.serviceId,
      serviceName: s.service.name,
      experienceYears: s.experienceYears,
    })),
  });
}
