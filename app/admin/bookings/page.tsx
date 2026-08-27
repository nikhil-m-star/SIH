import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ServiceIcon } from "@/components/ServiceIcon";

export default async function AdminBookingsPage() {
  await requireRole("ADMIN");

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      service: true,
      customer: true,
      worker: true,
      payment: true,
    },
  });

  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-400",
    ACCEPTED: "bg-blue-500/15 text-blue-400",
    IN_PROGRESS: "bg-purple-500/15 text-purple-400",
    COMPLETED: "bg-emerald-500/15 text-emerald-400",
    CANCELLED: "bg-neutral-800 text-neutral-400",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">System Bookings</h1>
        <p className="text-base text-neutral-400 mt-2">Audit log of all platform service dispatches</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-[#0e0e0e] rounded-3xl text-base text-neutral-500">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="bg-[#0e0e0e] rounded-3xl overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1c1c1c] text-neutral-400">
                <th className="py-4 px-5 font-extrabold uppercase tracking-widest text-xs">Service</th>
                <th className="py-4 px-5 font-extrabold uppercase tracking-widest text-xs">Customer</th>
                <th className="py-4 px-5 font-extrabold uppercase tracking-widest text-xs">Worker</th>
                <th className="py-4 px-5 font-extrabold uppercase tracking-widest text-xs">Price</th>
                <th className="py-4 px-5 font-extrabold uppercase tracking-widest text-xs">Status</th>
                <th className="py-4 px-5 font-extrabold uppercase tracking-widest text-xs">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616] text-neutral-300">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#161616] transition-colors">
                  <td className="py-4 px-5 font-extrabold text-white flex items-center gap-3">
                    <ServiceIcon name={booking.service.name} className="w-5 h-5 text-emerald-400" />
                    <span>{booking.service.name}</span>
                  </td>
                  <td className="py-4 px-5 text-neutral-300 font-medium">{booking.customer.name}</td>
                  <td className="py-4 px-5 text-neutral-300 font-medium">{booking.worker?.name || "—"}</td>
                  <td className="py-4 px-5 font-extrabold text-white text-base">
                    ₹{booking.actualPrice || booking.estimatedPrice}
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[booking.status]}`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-neutral-500 text-xs" suppressHydrationWarning>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
