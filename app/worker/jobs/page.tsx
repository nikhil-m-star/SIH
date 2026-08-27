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
    PENDING: "bg-amber-500/15 text-amber-400",
    ACCEPTED: "bg-blue-500/15 text-blue-400",
    IN_PROGRESS: "bg-purple-500/15 text-purple-400",
    COMPLETED: "bg-emerald-500/15 text-emerald-400",
    CANCELLED: "bg-neutral-800 text-neutral-400",
  };

  const groups = {
    pending: bookings.filter((b) => b.status === "PENDING"),
    active: bookings.filter((b) => ["ACCEPTED", "IN_PROGRESS"].includes(b.status)),
    completed: bookings.filter((b) => b.status === "COMPLETED"),
    cancelled: bookings.filter((b) => b.status === "CANCELLED"),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Jobs Log</h1>
        <p className="text-base text-neutral-400 mt-2">Assignments, active jobs and completed history</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-[#0e0e0e] rounded-3xl text-base text-neutral-500">
          <p>No job assignments recorded.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(
            ([group, items]) =>
              items.length > 0 && (
                <div key={group} className="space-y-4">
                  <h2 className="text-sm font-extrabold text-neutral-500 uppercase tracking-widest">
                    {group} ({items.length})
                  </h2>
                  <div className="space-y-3">
                    {items.map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/worker/jobs/${booking.id}`}
                        className="flex items-center justify-between bg-[#0e0e0e] hover:bg-[#161616] rounded-3xl p-6 transition-colors"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-neutral-300">
                            <ServiceIcon name={booking.service.name} className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-white">
                              {booking.service.name}
                            </p>
                            <p className="text-sm text-neutral-400 flex items-center gap-2 mt-1">
                              <Clock className="w-4 h-4" />
                              <span>{booking.customer.name}</span>
                              <span>·</span>
                              <span suppressHydrationWarning>{new Date(booking.createdAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <span
                            className={`text-xs font-bold px-3.5 py-1.5 rounded-full ${statusStyles[booking.status]}`}
                          >
                            {booking.status.replace("_", " ")}
                          </span>
                          <span className="text-base font-extrabold text-white">
                            ₹{booking.actualPrice || booking.estimatedPrice}
                          </span>
                          <ArrowRight className="w-5 h-5 text-neutral-600" />
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
