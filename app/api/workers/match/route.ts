import { auth } from "@clerk/nextjs/server";
import { findMatchingWorkers } from "@/lib/matching";
import { NextResponse } from "next/server";
import { z } from "zod";

const matchSchema = z.object({
  serviceId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  preferredTime: z.string(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = matchSchema.parse(body);

    const workers = await findMatchingWorkers({
      serviceId: parsed.serviceId,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      preferredTime: new Date(parsed.preferredTime),
    });

    return NextResponse.json(workers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
