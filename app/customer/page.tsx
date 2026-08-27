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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Select a category to dispatch a verified worker</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/customer/book?serviceId=${service.id}`}
            className="bg-[#12131d] hover:bg-[#1a1c29] rounded-2xl p-5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1d1f2d] flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 group-hover:bg-[#25283a] mb-4 transition-colors">
              <ServiceIcon name={service.name} className="w-5 h-5" />
            </div>
            <p className="font-bold text-xs text-white">{service.name}</p>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">
              From ₹{service.basePrice}
            </p>
          </Link>
        ))}
      </div>

      {/* AI Help Banner */}
      <Link
        href="/customer/ai-help"
        className="flex items-center justify-between bg-[#141622] hover:bg-[#1a1c2c] rounded-2xl p-5 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              Not sure which service you need?
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Describe your problem for automatic AI diagnosis and dispatch
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
      </Link>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Recent Bookings
            </h2>
            <Link
              href="/customer/bookings"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/customer/bookings/${booking.id}`}
                className="flex items-center justify-between bg-[#12131c] hover:bg-[#181a26] rounded-2xl p-4 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1d1f2c] flex items-center justify-center text-zinc-400">
                    <ServiceIcon name={booking.service.name} className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
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
                  <span className="text-xs font-mono font-bold text-white">
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
    PENDING: "bg-amber-500/10 text-amber-400",
    ACCEPTED: "bg-blue-500/10 text-blue-400",
    IN_PROGRESS: "bg-purple-500/10 text-purple-400",
    COMPLETED: "bg-emerald-500/10 text-emerald-400",
    CANCELLED: "bg-zinc-800 text-zinc-400",
  };

  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${styles[status] || "bg-zinc-800 text-zinc-400"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
