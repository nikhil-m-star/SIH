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
    PENDING: "bg-amber-500/10 text-amber-400",
    ACCEPTED: "bg-blue-500/10 text-blue-400",
    IN_PROGRESS: "bg-purple-500/10 text-purple-400",
    COMPLETED: "bg-emerald-500/10 text-emerald-400",
    CANCELLED: "bg-zinc-800 text-zinc-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Bookings</h1>
        <p className="text-xs text-zinc-400 mt-1">Audit log of all platform service dispatches</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-[#12131d] rounded-2xl text-xs text-zinc-500">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="bg-[#12131d] rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1c1e2b] text-zinc-400">
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Service</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Worker</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Price</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181a26] text-zinc-300">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#181a27] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <ServiceIcon name={booking.service.name} className="w-4 h-4 text-emerald-400" />
                    <span>{booking.service.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300">{booking.customer.name}</td>
                  <td className="py-3.5 px-4 text-zinc-300">{booking.worker?.name || "—"}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ₹{booking.actualPrice || booking.estimatedPrice}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyles[booking.status]}`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-500 text-[11px] font-mono">
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
