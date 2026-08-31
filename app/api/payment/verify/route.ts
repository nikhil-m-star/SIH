import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = await req.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }


    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }


    const config = await prisma.cooperativeConfig.findFirst();

    const workerSharePct = config?.workerSharePct ?? 90;
    const welfarePct = config?.welfarePct ?? 5;
    const trainingPct = config?.trainingPct ?? 2;
    const cooperativePct = config?.cooperativePct ?? 3;

    const amount = booking.estimatedPrice;

    const workerAmount = amount * (workerSharePct / 100);
    const welfareFund = amount * (welfarePct / 100);
    const trainingFund = amount * (trainingPct / 100);
    const cooperativeShare = amount * (cooperativePct / 100);

    const payment = await prisma.payment.upsert({
      where: {
        bookingId: booking.id,
      },
      update: {
        status: "COMPLETED",
      },
      create: {
        bookingId: booking.id,
        amount,
        status: "COMPLETED",
        workerAmount,
        welfareFund,
        trainingFund,
        cooperativeShare,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: payment.id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}