"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";
import {
  bookingSchema,
  ratingSchema,
  workerProfileSchema,
  cooperativeConfigSchema,
} from "./validations";
import { revalidatePath } from "next/cache";

// ─── Onboarding ──────────────────────────────────────────

export async function completeOnboarding(role: UserRole) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const clerkUser = await currentUser();
    if (!clerkUser) return { success: false, error: "Unauthorized" };

    const email =
      clerkUser.emailAddresses[0]?.emailAddress || `${clerkId}@placeholder.com`;
    const name =
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      "User";

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { name, role },
      create: { clerkId, email, name, role },
    });

    if (role === "WORKER") {
      await prisma.workerProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    }

    return { success: true, role: user.role };
  } catch (error) {
    console.error("completeOnboarding error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Onboarding failed",
    };
  }
}

// ─── Bookings ────────────────────────────────────────────

export async function createBooking(data: unknown) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      // Auto-create user if missing
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress || `${clerkId}@user.com`;
      const name = `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || "Customer";
      user = await prisma.user.create({
        data: { clerkId, email, name, role: "CUSTOMER" },
      });
    }

    const parsed = bookingSchema.parse(data);

    const booking = await prisma.booking.create({
      data: {
        customerId: user.id,
        workerId: parsed.workerId,
        serviceId: parsed.serviceId,
        description: parsed.description,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        address: parsed.address || "Bengaluru",
        preferredTime: new Date(parsed.preferredTime),
        estimatedPrice: parsed.estimatedPrice,
        urgency: parsed.urgency,
        aiUsed: parsed.aiUsed,
        status: "PENDING",
      },
    });

    revalidatePath("/customer/bookings");
    revalidatePath("/worker");
    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("createBooking error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create booking",
    };
  }
}

export async function acceptBooking(bookingId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || user.role !== "WORKER") return { success: false, error: "Unauthorized" };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.workerId !== user.id || booking.status !== "PENDING")
      return { success: false, error: "Invalid booking state" };

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "ACCEPTED" },
    });

    revalidatePath("/worker");
    revalidatePath("/customer/bookings");
    return { success: true };
  } catch (error) {
    console.error("acceptBooking error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept booking",
    };
  }
}

export async function rejectBooking(bookingId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || user.role !== "WORKER") return { success: false, error: "Unauthorized" };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.workerId !== user.id || booking.status !== "PENDING")
      return { success: false, error: "Invalid booking state" };

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", workerId: null },
    });

    revalidatePath("/worker");
    revalidatePath("/customer/bookings");
    return { success: true };
  } catch (error) {
    console.error("rejectBooking error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject booking",
    };
  }
}

export async function startJob(bookingId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || user.role !== "WORKER") return { success: false, error: "Unauthorized" };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (
      !booking ||
      booking.workerId !== user.id ||
      booking.status !== "ACCEPTED"
    )
      return { success: false, error: "Invalid booking state" };

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "IN_PROGRESS" },
    });

    revalidatePath("/worker");
    revalidatePath("/customer/bookings");
    return { success: true };
  } catch (error) {
    console.error("startJob error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start job",
    };
  }
}

export async function completeJob(bookingId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || user.role !== "WORKER") return { success: false, error: "Unauthorized" };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (
      !booking ||
      booking.workerId !== user.id ||
      booking.status !== "IN_PROGRESS"
    )
      return { success: false, error: "Invalid booking state" };

    // Get cooperative config
    const config = await prisma.cooperativeConfig.findFirst({
      orderBy: { createdAt: "desc" },
    });

    const amount = booking.actualPrice || booking.estimatedPrice;
    const workerPct = config?.workerSharePct ?? 90;
    const welfarePct = config?.welfarePct ?? 5;
    const trainingPct = config?.trainingPct ?? 2;
    const cooperativePct = config?.cooperativePct ?? 3;

    const workerAmount = Math.round((amount * workerPct) / 100);
    const welfareFund = Math.round((amount * welfarePct) / 100);
    const trainingFund = Math.round((amount * trainingPct) / 100);
    const cooperativeShare = amount - workerAmount - welfareFund - trainingFund;

    // Transaction: update booking, create payment, update worker stats
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED", actualPrice: amount },
      });

      const payment = await tx.payment.create({
        data: {
          bookingId,
          amount,
          status: "COMPLETED",
          workerAmount,
          welfareFund,
          trainingFund,
          cooperativeShare,
        },
      });

      // Create cooperative transactions
      await tx.cooperativeTransaction.createMany({
        data: [
          {
            paymentId: payment.id,
            type: "WORKER_PAYOUT",
            amount: workerAmount,
            description: `Worker payout for booking ${bookingId}`,
          },
          {
            paymentId: payment.id,
            type: "WELFARE_FUND",
            amount: welfareFund,
            description: `Welfare contribution for booking ${bookingId}`,
          },
          {
            paymentId: payment.id,
            type: "TRAINING_FUND",
            amount: trainingFund,
            description: `Training contribution for booking ${bookingId}`,
          },
          {
            paymentId: payment.id,
            type: "COOPERATIVE_SHARE",
            amount: cooperativeShare,
            description: `Cooperative share for booking ${bookingId}`,
          },
        ],
      });

      // Update worker profile stats
      await tx.workerProfile.update({
        where: { userId: user.id },
        data: {
          completedJobs: { increment: 1 },
          totalEarnings: { increment: workerAmount },
        },
      });
    });

    revalidatePath("/worker");
    revalidatePath("/customer/bookings");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("completeJob error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete job",
    };
  }
}

// ─── Ratings ─────────────────────────────────────────────

export async function submitRating(data: unknown) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || user.role !== "CUSTOMER") return { success: false, error: "Unauthorized" };

    const parsed = ratingSchema.parse(data);

    const booking = await prisma.booking.findUnique({
      where: { id: parsed.bookingId },
    });
    if (
      !booking ||
      booking.customerId !== user.id ||
      booking.status !== "COMPLETED"
    )
      return { success: false, error: "Invalid booking" };
    if (!booking.workerId) return { success: false, error: "No worker assigned" };

    // Check if already rated
    const existing = await prisma.rating.findUnique({
      where: { bookingId: parsed.bookingId },
    });
    if (existing) return { success: false, error: "Already rated" };

    await prisma.$transaction(async (tx) => {
      await tx.rating.create({
        data: {
          bookingId: parsed.bookingId,
          customerId: user.id,
          workerId: booking.workerId!,
          score: parsed.score,
          comment: parsed.comment,
        },
      });

      // Recalculate worker rating
      const ratings = await tx.rating.findMany({
        where: { workerId: booking.workerId! },
      });
      const avgRating =
        ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

      const workerProfile = await tx.workerProfile.findFirst({
        where: { userId: booking.workerId! },
      });
      if (workerProfile) {
        await tx.workerProfile.update({
          where: { id: workerProfile.id },
          data: { rating: Math.round(avgRating * 10) / 10 },
        });
      }
    });

    revalidatePath("/customer/bookings");
    revalidatePath("/worker");
    return { success: true };
  } catch (error) {
    console.error("submitRating error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit rating",
    };
  }
}

// ─── Worker Profile ──────────────────────────────────────

export async function updateWorkerProfile(data: unknown) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { workerProfile: true },
    });
    if (!user || user.role !== "WORKER" || !user.workerProfile)
      return { success: false, error: "Unauthorized" };

    const parsed = workerProfileSchema.parse(data);

    await prisma.workerProfile.update({
      where: { id: user.workerProfile.id },
      data: {
        bio: parsed.bio,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      },
    });

    if (parsed.skills) {
      await prisma.workerSkill.deleteMany({
        where: { workerId: user.workerProfile.id },
      });

      if (parsed.skills.length > 0) {
        await prisma.workerSkill.createMany({
          data: parsed.skills.map((s) => ({
            workerId: user.workerProfile!.id,
            serviceId: s.serviceId,
            experienceYears: s.experienceYears,
          })),
        });
      }
    }

    revalidatePath("/worker/profile");
    return { success: true };
  } catch (error) {
    console.error("updateWorkerProfile error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function toggleWorkerAvailability() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { workerProfile: true },
    });
    if (!user || user.role !== "WORKER" || !user.workerProfile)
      return { success: false, error: "Unauthorized" };

    await prisma.workerProfile.update({
      where: { id: user.workerProfile.id },
      data: { isAvailable: !user.workerProfile.isAvailable },
    });

    revalidatePath("/worker");
    return { success: true };
  } catch (error) {
    console.error("toggleWorkerAvailability error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle availability",
    };
  }
}

// ─── Admin Actions ───────────────────────────────────────

export async function verifyWorker(
  workerId: string,
  status: "VERIFIED" | "REJECTED"
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    await prisma.workerProfile.update({
      where: { id: workerId },
      data: { verificationStatus: status },
    });

    revalidatePath("/admin/workers");
    return { success: true };
  } catch (error) {
    console.error("verifyWorker error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify worker",
    };
  }
}

export async function updateCooperativeConfig(data: unknown) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user || user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const parsed = cooperativeConfigSchema.parse(data);

    const total =
      parsed.workerSharePct +
      parsed.welfarePct +
      parsed.trainingPct +
      parsed.cooperativePct;
    if (total !== 100)
      return { success: false, error: "Percentages must sum to 100" };

    const existing = await prisma.cooperativeConfig.findFirst();
    if (existing) {
      await prisma.cooperativeConfig.update({
        where: { id: existing.id },
        data: parsed,
      });
    } else {
      await prisma.cooperativeConfig.create({ data: parsed });
    }

    revalidatePath("/admin/treasury");
    return { success: true };
  } catch (error) {
    console.error("updateCooperativeConfig error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update config",
    };
  }
}
