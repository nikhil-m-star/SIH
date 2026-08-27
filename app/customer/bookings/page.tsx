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
    PENDING: "bg-amber-500/10 text-amber-400",
    ACCEPTED: "bg-blue-500/10 text-blue-400",
    IN_PROGRESS: "bg-purple-500/10 text-purple-400",
    COMPLETED: "bg-emerald-500/10 text-emerald-400",
    CANCELLED: "bg-zinc-800 text-zinc-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Bookings</h1>
          <p className="text-xs text-zinc-400 mt-1">Active dispatches and completed services</p>
        </div>
        <Link
          href="/customer/book"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full text-xs font-bold transition-all shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New booking</span>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-[#12131d] rounded-2xl text-xs text-zinc-500">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/customer/bookings/${booking.id}`}
              className="flex items-center justify-between bg-[#12131d] hover:bg-[#181a26] rounded-2xl p-4 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1d1f2c] flex items-center justify-center text-zinc-400">
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
                    <span>{booking.worker?.name || "Pending worker"}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyles[booking.status]}`}
                >
                  {booking.status.replace("_", " ")}
                </span>
                <p className="font-mono text-xs font-bold text-white mt-1">
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
