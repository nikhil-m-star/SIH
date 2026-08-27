import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function WorkerJobsPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");
  if (user.role !== "WORKER") redirect("/");

  const bookings = await prisma.booking.findMany({
    where: { workerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { service: true, customer: true, payment: true },
  });

  const statusStyles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-600",
  };

  const groups = {
    pending: bookings.filter((b) => b.status === "PENDING"),
    active: bookings.filter((b) => ["ACCEPTED", "IN_PROGRESS"].includes(b.status)),
    completed: bookings.filter((b) => b.status === "COMPLETED"),
    cancelled: bookings.filter((b) => b.status === "CANCELLED"),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>

      {bookings.length === 0 ? (
        <div className="mt-8 text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No jobs yet</p>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {Object.entries(groups).map(
            ([group, items]) =>
              items.length > 0 && (
                <div key={group}>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {group} ({items.length})
                  </h2>
                  <div className="space-y-2">
                    {items.map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/worker/jobs/${booking.id}`}
                        className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.service.icon} {booking.service.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {booking.customer.name} ·{" "}
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                              {booking.description}
                            </p>
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
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
