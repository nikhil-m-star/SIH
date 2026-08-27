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
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Hello, {user.name.split(" ")[0]}
        </h1>
        <p className="text-base text-neutral-400 mt-2">
          Select a service to dispatch a verified local worker
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/customer/book?serviceId=${service.id}`}
            className="bg-[#0e0e0e] hover:bg-[#161616] rounded-3xl p-7 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center text-neutral-300 group-hover:text-emerald-400 mb-6 transition-colors">
              <ServiceIcon name={service.name} className="w-7 h-7" />
            </div>
            <p className="font-extrabold text-xl text-white">{service.name}</p>
            <p className="text-sm text-neutral-400 mt-1 font-mono">
              From ₹{service.basePrice}
            </p>
          </Link>
        ))}
      </div>

      {/* AI Help Banner */}
      <Link
        href="/customer/ai-help"
        className="flex items-center justify-between bg-[#0e0e0e] hover:bg-[#161616] rounded-3xl p-8 transition-all group"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-white">
              Not sure which service you need?
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              Describe your problem for automatic AI diagnosis and instant worker dispatch
            </p>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 text-neutral-500 group-hover:text-emerald-400 transition-colors shrink-0 ml-4" />
      </Link>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white">
              Recent Bookings
            </h2>
            <Link
              href="/customer/bookings"
              className="text-sm text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/customer/bookings/${booking.id}`}
                className="flex items-center justify-between bg-[#0e0e0e] hover:bg-[#161616] rounded-3xl p-6 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center text-neutral-300">
                    <ServiceIcon name={booking.service.name} className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">
                      {booking.service.name}
                    </p>
                    <p className="text-sm text-neutral-400 flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{booking.worker?.name || "Assigning worker"}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-lg font-mono font-extrabold text-white">
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
    PENDING: "bg-amber-500/15 text-amber-400",
    ACCEPTED: "bg-blue-500/15 text-blue-400",
    IN_PROGRESS: "bg-purple-500/15 text-purple-400",
    COMPLETED: "bg-emerald-500/15 text-emerald-400",
    CANCELLED: "bg-neutral-800 text-neutral-400",
  };

  return (
    <span
      className={`text-xs font-bold px-3.5 py-1.5 rounded-full ${styles[status] || "bg-neutral-800 text-neutral-400"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
