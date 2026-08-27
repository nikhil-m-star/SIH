import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import WorkerVerifyButton from "./WorkerVerifyButton";
import { Star, MapPin } from "lucide-react";

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
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    VERIFIED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Worker Management</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Verification status and roster audit</p>
      </div>

      {workers.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/40 rounded-xl border border-zinc-800 text-xs text-zinc-500">
          <p>No workers registered in cooperative yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    {worker.user.name}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.2 rounded border ${statusStyles[worker.verificationStatus]}`}
                  >
                    {worker.verificationStatus}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {worker.user.email}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
                  <span className="flex items-center gap-0.5 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{worker.rating.toFixed(1)}</span>
                  </span>
                  <span>·</span>
                  <span>{worker.completedJobs} jobs</span>
                  <span>·</span>
                  <span className="font-mono">
                    ₹{worker.totalEarnings.toLocaleString()} earned
                  </span>
                  <span>·</span>
                  <span className={worker.isAvailable ? "text-emerald-400" : "text-zinc-500"}>
                    {worker.isAvailable ? "Available" : "Offline"}
                  </span>
                </div>
                {worker.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {worker.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700/50"
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
