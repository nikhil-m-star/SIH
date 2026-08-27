"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptBooking, rejectBooking, startJob, completeJob } from "@/lib/actions";
import { Check, X, Play, CheckCircle } from "lucide-react";

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
    <div className="space-y-4">
      {error && (
        <div className="p-5 bg-red-950/40 rounded-3xl text-sm text-red-400 font-semibold">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {status === "PENDING" && (
          <>
            <button
              onClick={() => handleAction(acceptBooking, "accept")}
              disabled={!!loading}
              className="flex-1 px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-base font-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>{loading === "accept" ? "Accepting..." : "Accept job"}</span>
            </button>
            <button
              onClick={() => handleAction(rejectBooking, "reject")}
              disabled={!!loading}
              className="px-8 py-4 bg-[#141414] hover:bg-red-950/40 text-neutral-400 hover:text-red-400 rounded-full text-base font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              <span>{loading === "reject" ? "..." : "Decline"}</span>
            </button>
          </>
        )}

        {status === "ACCEPTED" && (
          <button
            onClick={() => handleAction(startJob, "start")}
            disabled={!!loading}
            className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-base font-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            <span>{loading === "start" ? "Starting..." : "Start job"}</span>
          </button>
        )}

        {status === "IN_PROGRESS" && (
          <button
            onClick={() => handleAction(completeJob, "complete")}
            disabled={!!loading}
            className="flex-1 px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-base font-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{loading === "complete" ? "Completing..." : "Complete & trigger payout"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
