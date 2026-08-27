import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

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
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-600",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>

      {bookings.length === 0 ? (
        <div className="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No bookings yet</p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Service
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Customer
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Worker
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Amount
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-2">
                    {booking.service.icon} {booking.service.name}
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    {booking.customer.name}
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    {booking.worker?.name || "—"}
                  </td>
                  <td className="py-3 px-2 font-medium">
                    ₹{booking.actualPrice || booking.estimatedPrice}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[booking.status]}`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500 text-xs">
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
