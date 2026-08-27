import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import JobActions from "./JobActions";

export default async function WorkerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");
  if (user.role !== "WORKER") redirect("/");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
      customer: true,
      payment: true,
      rating: true,
    },
  });

  if (!booking || booking.workerId !== user.id) notFound();

  const statusStyles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-600",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[booking.status]}`}
          >
            {booking.status.replace("_", " ")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Service</span>
          <span className="font-medium">
            {booking.service.icon} {booking.service.name}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Customer</span>
          <span className="font-medium">{booking.customer.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Description</span>
          <span className="font-medium text-right max-w-[60%]">
            {booking.description}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Preferred time</span>
          <span className="font-medium">
            {new Date(booking.preferredTime).toLocaleString()}
          </span>
        </div>
        {booking.address && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Address</span>
            <span className="font-medium">{booking.address}</span>
          </div>
        )}
        <hr className="border-gray-100" />
        <div className="flex justify-between">
          <span className="font-medium">Price</span>
          <span className="font-bold text-lg">
            ₹{booking.actualPrice || booking.estimatedPrice}
          </span>
        </div>
      </div>

      <JobActions bookingId={booking.id} status={booking.status} />

      {booking.payment && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Your Earnings</h3>
          <p className="text-2xl font-bold text-[var(--color-primary)]">
            ₹{booking.payment.workerAmount}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            from ₹{booking.payment.amount} total
          </p>
        </div>
      )}

      {booking.rating && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Customer Rating</h3>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xl ${
                  star <= booking.rating!.score
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          {booking.rating.comment && (
            <p className="text-sm text-gray-600 mt-2">
              {booking.rating.comment}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
