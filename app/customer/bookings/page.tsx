import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-600",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <Link
          href="/customer/book"
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] transition-colors"
        >
          New Booking
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No bookings yet</p>
          <Link
            href="/customer/book"
            className="mt-3 inline-block text-sm text-[var(--color-primary)] hover:underline"
          >
            Book your first service
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/customer/bookings/${booking.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{booking.service.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.service.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(booking.createdAt).toLocaleDateString()} ·{" "}
                      {booking.worker?.name || "Pending worker"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[booking.status]}`}
                  >
                    {booking.status.replace("_", " ")}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    ₹{booking.actualPrice || booking.estimatedPrice}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
