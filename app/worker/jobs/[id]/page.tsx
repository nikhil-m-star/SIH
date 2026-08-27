import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import JobActions from "./JobActions";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function WorkerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");
  if (user.role !== "WORKER") redirect("/");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
      customer: true,
      payment: true,
      rating: true,
    },
  });

  if (!booking || booking.workerId !== user.id) notFound();

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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Job Dispatch</h1>
          <p className="text-sm text-neutral-400 font-mono mt-1">{booking.id}</p>
        </div>
        <Link
          href="/worker/jobs"
          className="text-sm text-neutral-400 hover:text-white bg-[#141414] px-4 py-2 rounded-full inline-flex items-center gap-1.5 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All jobs</span>
        </Link>
      </div>

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
          <span className="text-neutral-400">Customer</span>
          <span className="text-white font-extrabold text-base">{booking.customer.name}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-neutral-400">Problem</span>
          <span className="text-white text-right max-w-[65%] font-medium">
            {booking.description}
          </span>
        </div>
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
          <span className="font-extrabold text-white text-base">Total Booking Price</span>
          <span className="font-mono font-black text-2xl text-emerald-400">
            ₹{booking.actualPrice || booking.estimatedPrice}
          </span>
        </div>
      </div>

      <JobActions bookingId={booking.id} status={booking.status} />

      {booking.payment && (
        <div className="bg-[#0e0e0e] rounded-3xl p-8 space-y-2 text-sm">
          <h3 className="font-extrabold text-white text-base">Your Direct Worker Share (90%)</h3>
          <p className="text-4xl font-mono font-black text-emerald-400 pt-2">
            ₹{booking.payment.workerAmount}
          </p>
          <p className="text-xs text-neutral-400">
            From ₹{booking.payment.amount} total customer payment
          </p>
        </div>
      )}

      {booking.rating && (
        <div className="bg-[#0e0e0e] rounded-3xl p-8 space-y-3 text-sm">
          <h3 className="font-extrabold text-white text-base">Customer Rating</h3>
          <div className="flex items-center gap-1.5 pt-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= booking.rating!.score ? "fill-amber-400" : "text-neutral-700"
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
