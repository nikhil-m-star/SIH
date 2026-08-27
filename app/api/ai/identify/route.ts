import { auth } from "@clerk/nextjs/server";
import { identifyService, isAIConfigured } from "@/lib/nvidia";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { aiHelpSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI service is not configured. Please select a service manually." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parsed = aiHelpSchema.parse(body);

    const result = await identifyService(parsed.description);

    if (!result) {
      return NextResponse.json(
        { error: "Could not identify service. Please try again or select manually." },
        { status: 422 }
      );
    }

    // Find matching service in database
    const service = await prisma.service.findFirst({
      where: {
        name: { contains: result.service, mode: "insensitive" },
        isActive: true,
      },
    });

    return NextResponse.json({
      result,
      serviceId: service?.id || null,
    });
  } catch (error) {
    console.error("AI identify error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
