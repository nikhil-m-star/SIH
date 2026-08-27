import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Sparkles, ArrowRight, Clock } from "lucide-react";

export default async function CustomerHomePage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");
  if (user.role !== "CUSTOMER") redirect("/");

  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const recentBookings = await prisma.booking.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { service: true, worker: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Welcome, {user.name.split(" ")[0]}
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">Select a service to book a worker</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/customer/book?serviceId=${service.id}`}
            className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 hover:border-emerald-500/40 hover:bg-zinc-900 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 mb-3 transition-colors">
              <ServiceIcon name={service.name} className="w-4 h-4" />
            </div>
            <p className="font-medium text-xs text-zinc-200">{service.name}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
              From ₹{service.basePrice}
            </p>
          </Link>
        ))}
      </div>

      {/* AI Help Banner */}
      <Link
        href="/customer/ai-help"
        className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 hover:border-emerald-500/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-200">
              Not sure which service you need?
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Describe your issue in plain language for automated recommendation
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
      </Link>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Recent Bookings
            </h2>
            <Link
              href="/customer/bookings"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/customer/bookings/${booking.id}`}
                className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <ServiceIcon name={booking.service.name} className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-200">
                      {booking.service.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{booking.worker?.name || "Assigning worker"}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-medium text-zinc-300">
                    ₹{booking.actualPrice || booking.estimatedPrice}
                  </span>
                  <StatusBadge status={booking.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ACCEPTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_PROGRESS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  return (
    <span
      className={`text-[10px] font-medium px-2 py-0.5 rounded border ${styles[status] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
