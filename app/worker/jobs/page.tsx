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
    PENDING: "bg-amber-500/10 text-amber-400",
    ACCEPTED: "bg-blue-500/10 text-blue-400",
    IN_PROGRESS: "bg-purple-500/10 text-purple-400",
    COMPLETED: "bg-emerald-500/10 text-emerald-400",
    CANCELLED: "bg-zinc-800 text-zinc-400",
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
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Jobs Log</h1>
        <p className="text-xs text-zinc-400 mt-1">Assignments, active jobs and completed history</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-[#12131d] rounded-2xl text-xs text-zinc-500">
          <p>No job assignments recorded.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(
            ([group, items]) =>
              items.length > 0 && (
                <div key={group} className="space-y-2.5">
                  <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    {group} ({items.length})
                  </h2>
                  <div className="space-y-2">
                    {items.map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/worker/jobs/${booking.id}`}
                        className="flex items-center justify-between bg-[#12131d] hover:bg-[#181a27] rounded-2xl p-4 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#1d1f2d] flex items-center justify-center text-zinc-400">
                            <ServiceIcon name={booking.service.name} className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">
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
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyles[booking.status]}`}
                          >
                            {booking.status.replace("_", " ")}
                          </span>
                          <span className="font-mono text-xs font-bold text-white">
                            ₹{booking.actualPrice || booking.estimatedPrice}
                          </span>
                          <ArrowRight className="w-4 h-4 text-zinc-600" />
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
