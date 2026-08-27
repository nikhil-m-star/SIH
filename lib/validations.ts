import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["CUSTOMER", "WORKER"]),
});

export const bookingSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  description: z.string().min(1, "Please enter a description").default("Service requested"),
  latitude: z.number().min(-90).max(90).default(12.9716),
  longitude: z.number().min(-180).max(180).default(77.5946),
  address: z.string().optional(),
  preferredTime: z.string().min(1, "Preferred time is required"),
  workerId: z.string().min(1, "Please select a worker"),
  estimatedPrice: z.number().positive().default(500),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  aiUsed: z.boolean().default(false),
});

export const ratingSchema = z.object({
  bookingId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const workerProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  skills: z
    .array(
      z.object({
        serviceId: z.string(),
        experienceYears: z.number().int().min(0).max(50),
      })
    )
    .optional(),
});

export const cooperativeConfigSchema = z.object({
  workerSharePct: z.number().min(0).max(100),
  welfarePct: z.number().min(0).max(100),
  trainingPct: z.number().min(0).max(100),
  cooperativePct: z.number().min(0).max(100),
});

export const aiHelpSchema = z.object({
  description: z
    .string()
    .min(3, "Please describe your problem in more detail"),
});
