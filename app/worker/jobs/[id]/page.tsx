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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Job Dispatch</h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{booking.id}</p>
        </div>
        <Link
          href="/worker/jobs"
          className="text-xs text-zinc-400 hover:text-white bg-[#141520] px-3 py-1.5 rounded-full inline-flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All jobs</span>
        </Link>
      </div>

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
          <span className="text-zinc-500">Customer</span>
          <span className="text-white font-bold">{booking.customer.name}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-zinc-500">Problem Description</span>
          <span className="text-zinc-200 text-right max-w-[65%] font-medium">
            {booking.description}
          </span>
        </div>
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
          <span className="font-bold text-zinc-300">Total Booking Price</span>
          <span className="font-mono font-extrabold text-base text-emerald-400">
            ₹{booking.actualPrice || booking.estimatedPrice}
          </span>
        </div>
      </div>

      <JobActions bookingId={booking.id} status={booking.status} />

      {booking.payment && (
        <div className="bg-[#12131d] rounded-2xl p-6 space-y-1 text-xs">
          <h3 className="font-bold text-white">Your Direct Worker Share (90%)</h3>
          <p className="text-3xl font-mono font-extrabold text-emerald-400 pt-1">
            ₹{booking.payment.workerAmount}
          </p>
          <p className="text-[11px] text-zinc-500">
            From ₹{booking.payment.amount} total customer payment
          </p>
        </div>
      )}

      {booking.rating && (
        <div className="bg-[#12131d] rounded-2xl p-6 space-y-2 text-xs">
          <h3 className="font-bold text-white">Customer Rating</h3>
          <div className="flex items-center gap-1 text-amber-400 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= booking.rating!.score ? "fill-amber-400" : "text-zinc-700"
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
