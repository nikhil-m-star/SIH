import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import WorkerVerifyButton from "./WorkerVerifyButton";
import { Star } from "lucide-react";

export default async function AdminWorkersPage() {
  await requireRole("ADMIN");

  const workers = await prisma.workerProfile.findMany({
    include: {
      user: true,
      skills: { include: { service: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-400",
    VERIFIED: "bg-emerald-500/15 text-emerald-400",
    REJECTED: "bg-red-500/15 text-red-400",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Worker Management</h1>
        <p className="text-base text-neutral-400 mt-2">Verification queue and cooperative roster</p>
      </div>

      {workers.length === 0 ? (
        <div className="text-center py-20 bg-[#0e0e0e] rounded-3xl text-base text-neutral-500">
          <p>No workers registered yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-[#0e0e0e] hover:bg-[#161616] rounded-3xl p-7 flex items-center justify-between transition-colors"
            >
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-white text-lg">
                    {worker.user.name}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[worker.verificationStatus]}`}
                  >
                    {worker.verificationStatus}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  {worker.user.email}
                </p>
                <div className="flex items-center gap-4 text-sm text-neutral-400 pt-2">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{worker.rating.toFixed(1)}</span>
                  </span>
                  <span>·</span>
                  <span>{worker.completedJobs} jobs</span>
                  <span>·</span>
                  <span className="font-mono font-bold text-white">
                    ₹{worker.totalEarnings.toLocaleString()} earned
                  </span>
                  <span>·</span>
                  <span className={worker.isAvailable ? "text-emerald-400 font-bold" : "text-neutral-500"}>
                    {worker.isAvailable ? "Available" : "Offline"}
                  </span>
                </div>
                {worker.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {worker.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="text-xs bg-[#1a1a1a] text-neutral-200 px-3 py-1 rounded-xl font-semibold"
                      >
                        {skill.service.name} ({skill.experienceYears}y)
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <WorkerVerifyButton
                workerId={worker.id}
                currentStatus={worker.verificationStatus}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
