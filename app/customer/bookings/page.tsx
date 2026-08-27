import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ServiceIcon } from "@/components/ServiceIcon";
import { PlusCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/format";

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
    PENDING: "bg-neutral-800 text-neutral-300",
    ACCEPTED: "bg-emerald-500/20 text-emerald-300",
    IN_PROGRESS: "bg-emerald-500/30 text-emerald-200",
    COMPLETED: "bg-emerald-500/15 text-emerald-400",
    CANCELLED: "bg-neutral-900 text-neutral-500",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">My Bookings</h1>
          <p className="text-base text-neutral-400 mt-2">Active dispatches and completed services</p>
        </div>
        <Link
          href="/customer/book"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-sm font-black transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New booking</span>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-[#0e0e0e] rounded-3xl text-base text-neutral-500">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/customer/bookings/${booking.id}`}
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
                    <span>{formatDate(booking.createdAt)}</span>
                    <span>·</span>
                    <span>{booking.worker?.name || "Pending worker"}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block text-xs font-bold px-3.5 py-1.5 rounded-full ${statusStyles[booking.status]}`}
                >
                  {booking.status.replace("_", " ")}
                </span>
                <p className="text-base font-extrabold text-white mt-2">
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
