import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import RatingForm from "./RatingForm";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");
  if (user.role !== "CUSTOMER") redirect("/");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
      worker: { include: { workerProfile: true } },
      payment: true,
      rating: true,
    },
  });

  if (!booking || booking.customerId !== user.id) notFound();

  const statusSteps = ["PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];
  const currentStepIndex = statusSteps.indexOf(booking.status);

  const statusStyles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-gray-100 text-gray-600",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>

      {/* Status Timeline */}
      {booking.status !== "CANCELLED" && (
        <div className="mt-6 flex items-center justify-between max-w-md">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStepIndex
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i <= currentStepIndex ? "✓" : i + 1}
                </div>
                <span className="text-[10px] text-gray-500 mt-1">
                  {step.replace("_", " ")}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-1 ${
                    i < currentStepIndex
                      ? "bg-[var(--color-primary)]"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Info */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5 space-y-3">
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
          <span className="text-gray-500">Description</span>
          <span className="font-medium text-right max-w-[60%]">
            {booking.description}
          </span>
        </div>
        {booking.worker && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Worker</span>
            <span className="font-medium">{booking.worker.name}</span>
          </div>
        )}
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

      {/* Payment Breakdown */}
      {booking.payment && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-3">
            Payment Breakdown
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Worker payout</span>
              <span>₹{booking.payment.workerAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Welfare fund</span>
              <span>₹{booking.payment.welfareFund}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Training fund</span>
              <span>₹{booking.payment.trainingFund}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cooperative share</span>
              <span>₹{booking.payment.cooperativeShare}</span>
            </div>
          </div>
        </div>
      )}

      {/* Rating */}
      {booking.status === "COMPLETED" && !booking.rating && (
        <RatingForm bookingId={booking.id} />
      )}

      {booking.rating && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Your Rating</h3>
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
