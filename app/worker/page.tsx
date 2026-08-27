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
    PENDING: { text: "Verification Pending", class: "bg-amber-500/15 text-amber-400" },
    VERIFIED: { text: "Verified Professional", class: "bg-emerald-500/15 text-emerald-400" },
    REJECTED: { text: "Verification Rejected", class: "bg-red-500/15 text-red-400" },
  };

  const vBadge = verificationBadge[profile.verificationStatus];

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {user.name}
            </h1>
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${vBadge.class}`}>
              {vBadge.text}
            </span>
          </div>
          <p className="text-base text-neutral-400 mt-2">Worker Queue & Earnings Overview</p>
        </div>
        <AvailabilityToggle isAvailable={profile.isAvailable} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e0e0e] rounded-3xl p-8">
          <p className="text-xs text-neutral-500 font-extrabold uppercase tracking-widest">Total Earnings</p>
          <p className="text-3xl sm:text-4xl font-black text-emerald-400 mt-3">
            ₹{profile.totalEarnings.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#0e0e0e] rounded-3xl p-8">
          <p className="text-xs text-neutral-500 font-extrabold uppercase tracking-widest">Completed Jobs</p>
          <p className="text-3xl sm:text-4xl font-black text-white mt-3">
            {profile.completedJobs}
          </p>
        </div>
        <div className="bg-[#0e0e0e] rounded-3xl p-8">
          <p className="text-xs text-neutral-500 font-extrabold uppercase tracking-widest">Rating Score</p>
          <p className="text-3xl sm:text-4xl font-black text-amber-400 mt-3 flex items-center gap-2">
            <Star className="w-7 h-7 fill-amber-400" />
            <span>{profile.rating.toFixed(1)}</span>
          </p>
        </div>
      </div>

      {/* Pending jobs */}
      {pendingJobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-white">
            Incoming Job Requests ({pendingJobs.length})
          </h2>
          <div className="space-y-3">
            {pendingJobs.map((job) => (
              <Link
                key={job.id}
                href={`/worker/jobs/${job.id}`}
                className="block bg-[#121212] hover:bg-[#1a1a1a] rounded-3xl p-7 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#1e1e1e] flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <ServiceIcon name={job.service.name} className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">
                        {job.service.name}
                      </p>
                      <p className="text-sm text-neutral-400 mt-1" suppressHydrationWarning>
                        {job.customer.name} · {new Date(job.preferredTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-neutral-300 mt-2 line-clamp-1">
                        {job.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-emerald-400">
                      ₹{job.estimatedPrice}
                    </p>
                    <span className="inline-block text-xs uppercase font-extrabold text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full mt-2">
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
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-white">
            Active Jobs ({activeJobs.length})
          </h2>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <Link
                key={job.id}
                href={`/worker/jobs/${job.id}`}
                className="flex items-center justify-between bg-[#0e0e0e] hover:bg-[#161616] rounded-3xl p-6 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-neutral-300">
                    <ServiceIcon name={job.service.name} className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">
                      {job.service.name}
                    </p>
                    <p className="text-sm text-neutral-400 mt-0.5">
                      {job.customer.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400">
                    {job.status.replace("_", " ")}
                  </span>
                  <ArrowRight className="w-5 h-5 text-neutral-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pendingJobs.length === 0 && activeJobs.length === 0 && (
        <div className="text-center py-20 bg-[#0e0e0e] rounded-3xl text-sm text-neutral-500">
          <p className="font-semibold text-base text-neutral-400">No active jobs in queue.</p>
          <p className="text-sm text-neutral-500 mt-1">
            {profile.isAvailable
              ? "You will receive notifications when customers request services matching your skills."
              : "Toggle your status to Available to accept new assignments."}
          </p>
        </div>
      )}
    </div>
  );
}
