import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {user.name.split(" ")[0]}
      </h1>
      <p className="text-gray-500 mt-1">What do you need help with today?</p>

      {/* Services Grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/customer/book?serviceId=${service.id}`}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[var(--color-primary)] hover:shadow-sm transition-all"
          >
            <span className="text-2xl">{service.icon}</span>
            <p className="mt-2 font-medium text-sm text-gray-900">
              {service.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              From ₹{service.basePrice}
            </p>
          </Link>
        ))}
      </div>

      {/* AI Help */}
      <Link
        href="/customer/ai-help"
        className="mt-4 block bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-xl p-4 hover:bg-[var(--color-primary)]/10 transition-colors"
      >
        <p className="font-medium text-[var(--color-primary)] text-sm">
          🤖 Not sure what service you need?
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Describe your problem and AI will help identify the right service
        </p>
      </Link>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Bookings
            </h2>
            <Link
              href="/customer/bookings"
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/customer/bookings/${booking.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>{booking.service.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.service.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
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
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
