import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getCurrentDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { workerProfile: true },
  });

  return user;
}

export async function requireAuth() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");
  return clerkId;
}

export async function requireRole(role: UserRole) {
  const clerkId = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { workerProfile: true },
  });

  if (!user) redirect("/onboarding");
  if (user.role !== role) redirect("/");

  return user;
}

export async function syncUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (existingUser) return existingUser;

  // Don't auto-create — redirect to onboarding
  return null;
}

export async function createDbUser(
  clerkId: string,
  email: string,
  name: string,
  role: UserRole
) {
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

  return user;
}
