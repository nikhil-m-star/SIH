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
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ACCEPTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_PROGRESS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Booking Details</h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{booking.id}</p>
        </div>
        <Link
          href="/customer/bookings"
          className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Bookings</span>
        </Link>
      </div>

      {/* Status timeline */}
      {booking.status !== "CANCELLED" && (
        <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                    i <= currentStepIndex
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-zinc-900 text-zinc-600 border-zinc-800"
                  }`}
                >
                  {i <= currentStepIndex ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className="text-[9px] text-zinc-500 mt-1 uppercase font-medium">
                  {step.replace("_", " ")}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-[1px] mx-1 ${
                    i < currentStepIndex ? "bg-emerald-600" : "bg-zinc-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking info card */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <span className="text-zinc-500">Status</span>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded border ${statusStyles[booking.status]}`}
          >
            {booking.status.replace("_", " ")}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-500">Service</span>
          <span className="font-medium text-zinc-200 flex items-center gap-1.5">
            <ServiceIcon name={booking.service.name} className="w-3.5 h-3.5" />
            <span>{booking.service.name}</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Description</span>
          <span className="text-zinc-200 text-right max-w-[65%]">
            {booking.description}
          </span>
        </div>
        {booking.worker && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Worker</span>
            <span className="text-zinc-200 font-medium">{booking.worker.name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-zinc-500">Preferred Time</span>
          <span className="text-zinc-200">
            {new Date(booking.preferredTime).toLocaleString()}
          </span>
        </div>
        {booking.address && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Address</span>
            <span className="text-zinc-200">{booking.address}</span>
          </div>
        )}
        <div className="border-t border-zinc-800 pt-2 flex justify-between">
          <span className="font-medium text-zinc-300">Total Price</span>
          <span className="font-mono font-bold text-sm text-emerald-400">
            ₹{booking.actualPrice || booking.estimatedPrice}
          </span>
        </div>
      </div>

      {/* Payment breakdown */}
      {booking.payment && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2 text-xs">
          <h3 className="font-semibold text-zinc-300 mb-2">
            Cooperative Fund Distribution
          </h3>
          <div className="flex justify-between text-zinc-400">
            <span>Worker Direct Payout</span>
            <span className="font-mono text-emerald-400">
              ₹{booking.payment.workerAmount}
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Welfare Fund</span>
            <span className="font-mono text-blue-400">
              ₹{booking.payment.welfareFund}
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Skills Training Fund</span>
            <span className="font-mono text-purple-400">
              ₹{booking.payment.trainingFund}
            </span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Cooperative Share</span>
            <span className="font-mono text-zinc-400">
              ₹{booking.payment.cooperativeShare}
            </span>
          </div>
        </div>
      )}

      {/* Rating section */}
      {booking.status === "COMPLETED" && !booking.rating && (
        <RatingForm bookingId={booking.id} />
      )}

      {booking.rating && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2 text-xs">
          <h3 className="font-semibold text-zinc-300">Your Rating</h3>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= booking.rating!.score
                    ? "text-amber-400 fill-amber-400"
                    : "text-zinc-700"
                }`}
              />
            ))}
          </div>
          {booking.rating.comment && (
            <p className="text-zinc-400 pt-1">{booking.rating.comment}</p>
          )}
        </div>
      )}
    </div>
  );
}
