import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Clock, ArrowRight } from "lucide-react";

export default async function WorkerJobsPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");
  if (user.role !== "WORKER") redirect("/");

  const bookings = await prisma.booking.findMany({
    where: { workerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { service: true, customer: true, payment: true },
  });

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ACCEPTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_PROGRESS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  const groups = {
    pending: bookings.filter((b) => b.status === "PENDING"),
    active: bookings.filter((b) => ["ACCEPTED", "IN_PROGRESS"].includes(b.status)),
    completed: bookings.filter((b) => b.status === "COMPLETED"),
    cancelled: bookings.filter((b) => b.status === "CANCELLED"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Jobs Log</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Assigned dispatches and service history</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/40 rounded-xl border border-zinc-800 text-xs text-zinc-500">
          <p>No job assignments recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(
            ([group, items]) =>
              items.length > 0 && (
                <div key={group} className="space-y-2">
                  <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {group} ({items.length})
                  </h2>
                  <div className="space-y-2">
                    {items.map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/worker/jobs/${booking.id}`}
                        className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <ServiceIcon name={booking.service.name} className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-zinc-200">
                              {booking.service.name}
                            </p>
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{booking.customer.name}</span>
                              <span>·</span>
                              <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded border ${statusStyles[booking.status]}`}
                          >
                            {booking.status.replace("_", " ")}
                          </span>
                          <span className="font-mono text-xs font-semibold text-zinc-200">
                            ₹{booking.actualPrice || booking.estimatedPrice}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
