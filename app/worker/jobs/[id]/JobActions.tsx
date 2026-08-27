"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptBooking, rejectBooking, startJob, completeJob } from "@/lib/actions";

export default function JobActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleAction(
    action: (id: string) => Promise<{ success: boolean }>,
    actionName: string
  ) {
    setLoading(actionName);
    setError("");
    try {
      await action(bookingId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading("");
    }
  }

  if (status === "COMPLETED" || status === "CANCELLED") return null;

  return (
    <div className="mt-4">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {status === "PENDING" && (
          <>
            <button
              onClick={() => handleAction(acceptBooking, "accept")}
              disabled={!!loading}
              className="flex-1 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] disabled:opacity-50 transition-colors"
            >
              {loading === "accept" ? "Accepting..." : "Accept Job"}
            </button>
            <button
              onClick={() => handleAction(rejectBooking, "reject")}
              disabled={!!loading}
              className="px-4 py-2.5 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {loading === "reject" ? "..." : "Reject"}
            </button>
          </>
        )}

        {status === "ACCEPTED" && (
          <button
            onClick={() => handleAction(startJob, "start")}
            disabled={!!loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading === "start" ? "Starting..." : "Start Job"}
          </button>
        )}

        {status === "IN_PROGRESS" && (
          <button
            onClick={() => handleAction(completeJob, "complete")}
            disabled={!!loading}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading === "complete" ? "Completing..." : "Mark as Completed"}
          </button>
        )}
      </div>
    </div>
  );
}
