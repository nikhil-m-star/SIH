import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AvailabilityToggle from "./AvailabilityToggle";

export default async function WorkerDashboardPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");
  if (user.role !== "WORKER") redirect("/");

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: user.id },
    include: { skills: { include: { service: true } } },
  });

  if (!profile) redirect("/onboarding");

  // Get pending jobs for this worker
  const pendingJobs = await prisma.booking.findMany({
    where: { workerId: user.id, status: "PENDING" },
    include: { service: true, customer: true },
    orderBy: { createdAt: "desc" },
  });

  // Get active jobs
  const activeJobs = await prisma.booking.findMany({
    where: {
      workerId: user.id,
      status: { in: ["ACCEPTED", "IN_PROGRESS"] },
    },
    include: { service: true, customer: true },
    orderBy: { createdAt: "desc" },
  });

  const statusBadge: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
  };

  const verificationBadge: Record<string, { text: string; class: string }> = {
    PENDING: { text: "Pending Verification", class: "bg-yellow-100 text-yellow-800" },
    VERIFIED: { text: "Verified", class: "bg-green-100 text-green-800" },
    REJECTED: { text: "Rejected", class: "bg-red-100 text-red-800" },
  };

  const vBadge = verificationBadge[profile.verificationStatus];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${vBadge.class}`}>
            {vBadge.text}
          </span>
        </div>
        <AvailabilityToggle isAvailable={profile.isAvailable} />
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">
            ₹{profile.totalEarnings.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">
            {profile.completedJobs}
          </p>
          <p className="text-xs text-gray-500 mt-1">Completed Jobs</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-gray-900">
            ⭐ {profile.rating.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Rating</p>
        </div>
      </div>

      {/* New Jobs */}
      {pendingJobs.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            New Jobs ({pendingJobs.length})
          </h2>
          <div className="space-y-2">
            {pendingJobs.map((job) => (
              <Link
                key={job.id}
                href={`/worker/jobs/${job.id}`}
                className="block bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {job.service.icon} {job.service.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {job.customer.name} · {new Date(job.preferredTime).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {job.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{job.estimatedPrice}
                    </p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge.PENDING}`}>
                      NEW
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
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Active Jobs ({activeJobs.length})
          </h2>
          <div className="space-y-2">
            {activeJobs.map((job) => (
              <Link
                key={job.id}
                href={`/worker/jobs/${job.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {job.service.icon} {job.service.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {job.customer.name}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge[job.status]}`}>
                    {job.status.replace("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pendingJobs.length === 0 && activeJobs.length === 0 && (
        <div className="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No jobs right now</p>
          <p className="text-xs text-gray-400 mt-1">
            {profile.isAvailable
              ? "You'll be notified when new jobs match your skills"
              : "Toggle availability to start receiving jobs"}
          </p>
        </div>
      )}
    </div>
  );
}
