import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AvailabilityToggle from "./AvailabilityToggle";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Star, CheckCircle2, Clock, ArrowRight } from "lucide-react";

export default async function WorkerDashboardPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");
  if (user.role !== "WORKER") redirect("/");

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: user.id },
    include: { skills: { include: { service: true } } },
  });

  if (!profile) redirect("/onboarding");

  // Pending jobs for this worker
  const pendingJobs = await prisma.booking.findMany({
    where: { workerId: user.id, status: "PENDING" },
    include: { service: true, customer: true },
    orderBy: { createdAt: "desc" },
  });

  // Active jobs
  const activeJobs = await prisma.booking.findMany({
    where: {
      workerId: user.id,
      status: { in: ["ACCEPTED", "IN_PROGRESS"] },
    },
    include: { service: true, customer: true },
    orderBy: { createdAt: "desc" },
  });

  const verificationBadge: Record<string, { text: string; class: string }> = {
    PENDING: { text: "Pending Verification", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    VERIFIED: { text: "Verified Professional", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    REJECTED: { text: "Rejected", class: "bg-red-500/10 text-red-400 border-red-500/20" },
  };

  const vBadge = verificationBadge[profile.verificationStatus];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {user.name}
            </h1>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${vBadge.class}`}>
              {vBadge.text}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Worker Dashboard & Job Queue</p>
        </div>
        <AvailabilityToggle isAvailable={profile.isAvailable} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <p className="text-xs text-zinc-500 font-medium">Earnings</p>
          <p className="text-lg md:text-xl font-mono font-bold text-emerald-400 mt-1">
            ₹{profile.totalEarnings.toLocaleString()}
          </p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <p className="text-xs text-zinc-500 font-medium">Completed</p>
          <p className="text-lg md:text-xl font-mono font-bold text-white mt-1">
            {profile.completedJobs}
          </p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
          <p className="text-xs text-zinc-500 font-medium">Rating</p>
          <p className="text-lg md:text-xl font-mono font-bold text-amber-400 mt-1 flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{profile.rating.toFixed(1)}</span>
          </p>
        </div>
      </div>

      {/* New Jobs */}
      {pendingJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Incoming Job Requests ({pendingJobs.length})
          </h2>
          <div className="space-y-2.5">
            {pendingJobs.map((job) => (
              <Link
                key={job.id}
                href={`/worker/jobs/${job.id}`}
                className="block bg-zinc-900/80 border border-amber-500/30 rounded-xl p-4 hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mt-0.5">
                      <ServiceIcon name={job.service.name} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {job.service.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {job.customer.name} · {new Date(job.preferredTime).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                        {job.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xs text-white">
                      ₹{job.estimatedPrice}
                    </p>
                    <span className="inline-block text-[9px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded mt-1">
                      New
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Active Jobs ({activeJobs.length})
          </h2>
          <div className="space-y-2.5">
            {activeJobs.map((job) => (
              <Link
                key={job.id}
                href={`/worker/jobs/${job.id}`}
                className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <ServiceIcon name={job.service.name} className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-200">
                      {job.service.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {job.customer.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {job.status.replace("_", " ")}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pendingJobs.length === 0 && activeJobs.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/40 rounded-xl border border-zinc-800 text-xs text-zinc-500">
          <p>No active jobs at the moment.</p>
          <p className="text-[11px] text-zinc-600 mt-1">
            {profile.isAvailable
              ? "You will receive matches when customers request your skill categories."
              : "Toggle status to Available to receive new dispatches."}
          </p>
        </div>
      )}
    </div>
  );
}
