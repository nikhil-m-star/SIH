import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import WorkerVerifyButton from "./WorkerVerifyButton";

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
    PENDING: "bg-yellow-100 text-yellow-800",
    VERIFIED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Worker Management</h1>

      {workers.length === 0 ? (
        <div className="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No workers registered yet</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {worker.user.name}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[worker.verificationStatus]}`}
                    >
                      {worker.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {worker.user.email}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      ⭐ {worker.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {worker.completedJobs} jobs
                    </span>
                    <span className="text-xs text-gray-500">
                      ₹{worker.totalEarnings.toLocaleString()} earned
                    </span>
                    <span
                      className={`text-xs ${worker.isAvailable ? "text-green-600" : "text-gray-400"}`}
                    >
                      {worker.isAvailable ? "● Available" : "○ Unavailable"}
                    </span>
                  </div>
                  {worker.skills.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {worker.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                        >
                          {skill.service.name}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
