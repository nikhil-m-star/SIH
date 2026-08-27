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
    PENDING: "bg-amber-500/10 text-amber-400",
    VERIFIED: "bg-emerald-500/10 text-emerald-400",
    REJECTED: "bg-red-500/10 text-red-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Worker Management</h1>
        <p className="text-xs text-zinc-400 mt-1">Verification queue and cooperative roster</p>
      </div>

      {workers.length === 0 ? (
        <div className="text-center py-16 bg-[#12131d] rounded-2xl text-xs text-zinc-500">
          <p>No workers registered yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-[#12131d] hover:bg-[#181a27] rounded-2xl p-5 flex items-center justify-between transition-colors"
            >
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm">
                    {worker.user.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusStyles[worker.verificationStatus]}`}
                  >
                    {worker.verificationStatus}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {worker.user.email}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{worker.rating.toFixed(1)}</span>
                  </span>
                  <span>·</span>
                  <span>{worker.completedJobs} completed jobs</span>
                  <span>·</span>
                  <span className="font-mono font-bold text-white">
                    ₹{worker.totalEarnings.toLocaleString()} earned
                  </span>
                  <span>·</span>
                  <span className={worker.isAvailable ? "text-emerald-400 font-semibold" : "text-zinc-500"}>
                    {worker.isAvailable ? "Available" : "Offline"}
                  </span>
                </div>
                {worker.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {worker.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="text-[10px] bg-[#1c1e2d] text-zinc-300 px-2 py-0.5 rounded-lg font-medium"
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
