import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AvailabilityToggle from "./AvailabilityToggle";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Star, ArrowRight } from "lucide-react";

export default async function WorkerDashboardPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");
  if (user.role !== "WORKER") redirect("/");

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: user.id },
    include: { skills: { include: { service: true } } },
  });

  if (!profile) redirect("/onboarding");

  const pendingJobs = await prisma.booking.findMany({
    where: { workerId: user.id, status: "PENDING" },
    include: { service: true, customer: true },
    orderBy: { createdAt: "desc" },
  });

  const activeJobs = await prisma.booking.findMany({
    where: {
      workerId: user.id,
      status: { in: ["ACCEPTED", "IN_PROGRESS"] },
    },
    include: { service: true, customer: true },
    orderBy: { createdAt: "desc" },
  });

  const verificationBadge: Record<string, { text: string; class: string }> = {
    PENDING: { text: "Verification Pending", class: "bg-amber-500/10 text-amber-400" },
    VERIFIED: { text: "Verified Professional", class: "bg-emerald-500/10 text-emerald-400" },
    REJECTED: { text: "Verification Rejected", class: "bg-red-500/10 text-red-400" },
  };

  const vBadge = verificationBadge[profile.verificationStatus];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {user.name}
            </h1>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${vBadge.class}`}>
              {vBadge.text}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Worker Queue & Earnings Overview</p>
        </div>
        <AvailabilityToggle isAvailable={profile.isAvailable} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#12131d] rounded-2xl p-5">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Earnings</p>
          <p className="text-xl md:text-2xl font-mono font-extrabold text-emerald-400 mt-2">
            ₹{profile.totalEarnings.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#12131d] rounded-2xl p-5">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Completed Jobs</p>
          <p className="text-xl md:text-2xl font-mono font-extrabold text-white mt-2">
            {profile.completedJobs}
          </p>
        </div>
        <div className="bg-[#12131d] rounded-2xl p-5">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Rating Score</p>
          <p className="text-xl md:text-2xl font-mono font-extrabold text-amber-400 mt-2 flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{profile.rating.toFixed(1)}</span>
          </p>
        </div>
      </div>

      {/* Pending incoming jobs */}
      {pendingJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Incoming Job Requests ({pendingJobs.length})
          </h2>
          <div className="space-y-2.5">
            {pendingJobs.map((job) => (
              <Link
                key={job.id}
                href={`/worker/jobs/${job.id}`}
                className="block bg-[#161826] hover:bg-[#1e2032] rounded-2xl p-5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#222538] flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <ServiceIcon name={job.service.name} className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {job.service.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {job.customer.name} · {new Date(job.preferredTime).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                        {job.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-extrabold text-sm text-emerald-400">
                      ₹{job.estimatedPrice}
                    </p>
                    <span className="inline-block text-[9px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full mt-1">
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
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Active Jobs ({activeJobs.length})
          </h2>
          <div className="space-y-2.5">
            {activeJobs.map((job) => (
              <Link
                key={job.id}
                href={`/worker/jobs/${job.id}`}
                className="flex items-center justify-between bg-[#12131d] hover:bg-[#181a27] rounded-2xl p-4 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1d1f2d] flex items-center justify-center text-zinc-300">
                    <ServiceIcon name={job.service.name} className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {job.service.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {job.customer.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400">
                    {job.status.replace("_", " ")}
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pendingJobs.length === 0 && activeJobs.length === 0 && (
        <div className="text-center py-16 bg-[#12131d] rounded-2xl text-xs text-zinc-500">
          <p>No active jobs in queue.</p>
          <p className="text-[11px] text-zinc-600 mt-1">
            {profile.isAvailable
              ? "You will receive notifications when customers request services matching your skills."
              : "Toggle your status to Available to accept new assignments."}
          </p>
        </div>
      )}
    </div>
  );
}
