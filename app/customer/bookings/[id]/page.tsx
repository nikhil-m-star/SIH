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
    PENDING: "bg-amber-500/10 text-amber-400",
    ACCEPTED: "bg-blue-500/10 text-blue-400",
    IN_PROGRESS: "bg-purple-500/10 text-purple-400",
    COMPLETED: "bg-emerald-500/10 text-emerald-400",
    CANCELLED: "bg-zinc-800 text-zinc-400",
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Booking Details</h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{booking.id}</p>
        </div>
        <Link
          href="/customer/bookings"
          className="text-xs text-zinc-400 hover:text-white bg-[#141520] px-3 py-1.5 rounded-full inline-flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All bookings</span>
        </Link>
      </div>

      {/* Status timeline */}
      {booking.status !== "CANCELLED" && (
        <div className="flex items-center justify-between bg-[#12131d] rounded-2xl p-5">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i <= currentStepIndex
                      ? "bg-emerald-500 text-zinc-950 shadow-md"
                      : "bg-[#1c1e2b] text-zinc-600"
                  }`}
                >
                  {i <= currentStepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">
                  {step.replace("_", " ")}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-1 mx-1 rounded-full ${
                    i < currentStepIndex ? "bg-emerald-500/40" : "bg-[#1c1e2b]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking info */}
      <div className="bg-[#12131d] rounded-2xl p-6 space-y-3 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#1c1e2b]">
          <span className="text-zinc-500 font-medium">Status</span>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyles[booking.status]}`}
          >
            {booking.status.replace("_", " ")}
          </span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-zinc-500">Service</span>
          <span className="font-bold text-white flex items-center gap-2">
            <ServiceIcon name={booking.service.name} className="w-4 h-4 text-emerald-400" />
            <span>{booking.service.name}</span>
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-zinc-500">Description</span>
          <span className="text-zinc-200 text-right max-w-[65%] font-medium">
            {booking.description}
          </span>
        </div>
        {booking.worker && (
          <div className="flex justify-between py-1">
            <span className="text-zinc-500">Assigned Worker</span>
            <span className="text-white font-bold">{booking.worker.name}</span>
          </div>
        )}
        <div className="flex justify-between py-1">
          <span className="text-zinc-500">Scheduled Time</span>
          <span className="text-zinc-200">
            {new Date(booking.preferredTime).toLocaleString()}
          </span>
        </div>
        {booking.address && (
          <div className="flex justify-between py-1">
            <span className="text-zinc-500">Service Location</span>
            <span className="text-zinc-200">{booking.address}</span>
          </div>
        )}
        <div className="pt-3 border-t border-[#1c1e2b] flex justify-between items-center">
          <span className="font-bold text-zinc-300">Total Price</span>
          <span className="font-mono font-extrabold text-base text-emerald-400">
            ₹{booking.actualPrice || booking.estimatedPrice}
          </span>
        </div>
      </div>

      {/* Payment breakdown */}
      {booking.payment && (
        <div className="bg-[#12131d] rounded-2xl p-6 space-y-2.5 text-xs">
          <h3 className="font-bold text-white mb-2">
            Cooperative Fund Distribution
          </h3>
          <div className="flex justify-between text-zinc-400">
            <span>Worker Direct Payout (90%)</span>
            <span className="font-mono font-bold text-emerald-400">
              ₹{booking.payment.workerAmount}
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Welfare Allocation</span>
            <span className="font-mono text-blue-400">
              ₹{booking.payment.welfareFund}
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Training Allocation</span>
            <span className="font-mono text-purple-400">
              ₹{booking.payment.trainingFund}
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Cooperative Operations</span>
            <span className="font-mono text-zinc-400">
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
        <div className="bg-[#12131d] rounded-2xl p-6 space-y-2 text-xs">
          <h3 className="font-bold text-white">Your Service Rating</h3>
          <div className="flex items-center gap-1 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= booking.rating!.score
                    ? "text-amber-400 fill-amber-400"
                    : "text-zinc-700"
                }`}
              />
            ))}
          </div>
          {booking.rating.comment && (
            <p className="text-zinc-300 pt-2 bg-[#1a1c29] p-3 rounded-xl">
              {booking.rating.comment}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
