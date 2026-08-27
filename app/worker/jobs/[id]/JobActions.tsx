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
    <div className="space-y-3">
      {error && (
        <div className="p-4 bg-red-950/30 rounded-2xl text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {status === "PENDING" && (
          <>
            <button
              onClick={() => handleAction(acceptBooking, "accept")}
              disabled={!!loading}
              className="flex-1 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full text-xs font-bold disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{loading === "accept" ? "Accepting..." : "Accept job"}</span>
            </button>
            <button
              onClick={() => handleAction(rejectBooking, "reject")}
              disabled={!!loading}
              className="px-5 py-3 bg-[#181a27] hover:bg-red-950/40 text-zinc-400 hover:text-red-400 rounded-full text-xs font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>{loading === "reject" ? "..." : "Decline"}</span>
            </button>
          </>
        )}

        {status === "ACCEPTED" && (
          <button
            onClick={() => handleAction(startJob, "start")}
            disabled={!!loading}
            className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>{loading === "start" ? "Starting..." : "Start job"}</span>
          </button>
        )}

        {status === "IN_PROGRESS" && (
          <button
            onClick={() => handleAction(completeJob, "complete")}
            disabled={!!loading}
            className="flex-1 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full text-xs font-bold disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{loading === "complete" ? "Completing..." : "Complete & trigger payout"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
