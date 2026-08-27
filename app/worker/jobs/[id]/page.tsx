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
          <h1 className="text-xl font-bold text-white tracking-tight">Job Dispatch</h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{booking.id}</p>
        </div>
        <Link
          href="/worker/jobs"
          className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Jobs</span>
        </Link>
      </div>

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
          <span className="text-zinc-500">Customer</span>
          <span className="text-zinc-200 font-medium">{booking.customer.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Problem</span>
          <span className="text-zinc-200 text-right max-w-[65%]">
            {booking.description}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Scheduled Time</span>
          <span className="text-zinc-200">
            {new Date(booking.preferredTime).toLocaleString()}
          </span>
        </div>
        {booking.address && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Location</span>
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

      <JobActions bookingId={booking.id} status={booking.status} />

      {booking.payment && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-1 text-xs">
          <h3 className="font-semibold text-zinc-300 mb-1">Your Direct Payout (90%)</h3>
          <p className="text-2xl font-mono font-bold text-emerald-400">
            ₹{booking.payment.workerAmount}
          </p>
          <p className="text-[11px] text-zinc-500">
            From ₹{booking.payment.amount} total customer payment
          </p>
        </div>
      )}

      {booking.rating && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2 text-xs">
          <h3 className="font-semibold text-zinc-300">Customer Rating</h3>
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= booking.rating!.score ? "fill-amber-400" : "text-zinc-700"
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
