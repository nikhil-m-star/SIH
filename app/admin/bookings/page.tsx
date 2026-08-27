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
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ACCEPTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_PROGRESS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">All System Bookings</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Platform service ledger</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/40 rounded-xl border border-zinc-800 text-xs text-zinc-500">
          <p>No bookings registered.</p>
        </div>
      ) : (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="py-2.5 px-3 font-semibold">Service</th>
                <th className="py-2.5 px-3 font-semibold">Customer</th>
                <th className="py-2.5 px-3 font-semibold">Worker</th>
                <th className="py-2.5 px-3 font-semibold">Amount</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                    <ServiceIcon name={booking.service.name} className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{booking.service.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400">{booking.customer.name}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{booking.worker?.name || "—"}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-white">
                    ₹{booking.actualPrice || booking.estimatedPrice}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border ${statusStyles[booking.status]}`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-500 text-[11px] font-mono">
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
