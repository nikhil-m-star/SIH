import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import RatingForm from "./RatingForm";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Check, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");
  if (user.role !== "CUSTOMER") redirect("/");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
      worker: { include: { workerProfile: true } },
      payment: true,
      rating: true,
    },
  });

  if (!booking || booking.customerId !== user.id) notFound();

  const statusSteps = ["PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];
  const currentStepIndex = statusSteps.indexOf(booking.status);

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-400",
    ACCEPTED: "bg-blue-500/15 text-blue-400",
    IN_PROGRESS: "bg-purple-500/15 text-purple-400",
    COMPLETED: "bg-emerald-500/15 text-emerald-400",
    CANCELLED: "bg-neutral-800 text-neutral-400",
  };

  return (
    <div className="space-y-8 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Booking Details</h1>
          <p className="text-sm text-neutral-400 font-mono mt-1">{booking.id}</p>
        </div>
        <Link
          href="/customer/bookings"
          className="text-sm text-neutral-400 hover:text-white bg-[#141414] px-4 py-2 rounded-full inline-flex items-center gap-1.5 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All bookings</span>
        </Link>
      </div>

      {/* Status timeline */}
      {booking.status !== "CANCELLED" && (
        <div className="flex items-center justify-between bg-[#0e0e0e] rounded-3xl p-6 md:p-8">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                    i <= currentStepIndex
                      ? "bg-emerald-400 text-black shadow-md"
                      : "bg-[#1c1c1c] text-neutral-600"
                  }`}
                >
                  {i <= currentStepIndex ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-[10px] text-neutral-400 mt-2 uppercase font-extrabold tracking-wider">
                  {step.replace("_", " ")}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-1 mx-2 rounded-full ${
                    i < currentStepIndex ? "bg-emerald-400/40" : "bg-[#1c1c1c]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking info */}
      <div className="bg-[#0e0e0e] rounded-3xl p-8 space-y-4 text-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#1c1c1c]">
          <span className="text-neutral-400 font-medium">Status</span>
          <span
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full ${statusStyles[booking.status]}`}
          >
            {booking.status.replace("_", " ")}
          </span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-neutral-400">Service</span>
          <span className="font-extrabold text-white text-base flex items-center gap-2">
            <ServiceIcon name={booking.service.name} className="w-5 h-5 text-emerald-400" />
            <span>{booking.service.name}</span>
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-neutral-400">Description</span>
          <span className="text-white text-right max-w-[65%] font-medium">
            {booking.description}
          </span>
        </div>
        {booking.worker && (
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Assigned Worker</span>
            <span className="text-white font-extrabold text-base">{booking.worker.name}</span>
          </div>
        )}
        <div className="flex justify-between py-1">
          <span className="text-neutral-400">Scheduled Time</span>
          <span className="text-neutral-200">
            {new Date(booking.preferredTime).toLocaleString()}
          </span>
        </div>
        {booking.address && (
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">Service Location</span>
            <span className="text-neutral-200">{booking.address}</span>
          </div>
        )}
        <div className="pt-4 border-t border-[#1c1c1c] flex justify-between items-center">
          <span className="font-extrabold text-white text-base">Total Price</span>
          <span className="font-mono font-black text-2xl text-emerald-400">
            ₹{booking.actualPrice || booking.estimatedPrice}
          </span>
        </div>
      </div>

      {/* Payment breakdown */}
      {booking.payment && (
        <div className="bg-[#0e0e0e] rounded-3xl p-8 space-y-3.5 text-sm">
          <h3 className="font-extrabold text-white text-base mb-1">
            Cooperative Fund Distribution
          </h3>
          <div className="flex justify-between text-neutral-300">
            <span>Worker Direct Payout (90%)</span>
            <span className="font-mono font-extrabold text-emerald-400 text-base">
              ₹{booking.payment.workerAmount}
            </span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Welfare Allocation</span>
            <span className="font-mono text-blue-400">
              ₹{booking.payment.welfareFund}
            </span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Training Allocation</span>
            <span className="font-mono text-purple-400">
              ₹{booking.payment.trainingFund}
            </span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Cooperative Operations</span>
            <span className="font-mono text-neutral-400">
              ₹{booking.payment.cooperativeShare}
            </span>
          </div>
        </div>
      )}

      {/* Rating */}
      {booking.status === "COMPLETED" && !booking.rating && (
        <RatingForm bookingId={booking.id} />
      )}

      {booking.rating && (
        <div className="bg-[#0e0e0e] rounded-3xl p-8 space-y-3 text-sm">
          <h3 className="font-extrabold text-white text-base">Your Service Rating</h3>
          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= booking.rating!.score
                    ? "text-amber-400 fill-amber-400"
                    : "text-neutral-700"
                }`}
              />
            ))}
          </div>
          {booking.rating.comment && (
            <p className="text-neutral-200 pt-2 bg-[#161616] p-4 rounded-2xl">
              {booking.rating.comment}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
