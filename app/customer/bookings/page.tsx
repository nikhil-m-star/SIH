import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ServiceIcon } from "@/components/ServiceIcon";
import { PlusCircle, Clock } from "lucide-react";

export default async function CustomerBookingsPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");
  if (user.role !== "CUSTOMER") redirect("/");

  const bookings = await prisma.booking.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { service: true, worker: true, payment: true, rating: true },
  });

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ACCEPTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_PROGRESS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">My Bookings</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Booking history and active dispatches</p>
        </div>
        <Link
          href="/customer/book"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Booking</span>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/40 rounded-xl border border-zinc-800 text-xs text-zinc-500">
          <p>No bookings created yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/customer/bookings/${booking.id}`}
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
                    <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{booking.worker?.name || "Pending Worker"}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded border ${statusStyles[booking.status]}`}
                >
                  {booking.status.replace("_", " ")}
                </span>
                <p className="font-mono text-xs font-semibold text-zinc-200 mt-1">
                  ₹{booking.actualPrice || booking.estimatedPrice}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
