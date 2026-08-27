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
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {status === "PENDING" && (
          <>
            <button
              onClick={() => handleAction(acceptBooking, "accept")}
              disabled={!!loading}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading === "accept" ? "Accepting..." : "Accept Job"}</span>
            </button>
            <button
              onClick={() => handleAction(rejectBooking, "reject")}
              disabled={!!loading}
              className="px-3.5 py-2 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-800/60 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>{loading === "reject" ? "..." : "Decline"}</span>
            </button>
          </>
        )}

        {status === "ACCEPTED" && (
          <button
            onClick={() => handleAction(startJob, "start")}
            disabled={!!loading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{loading === "start" ? "Starting..." : "Start Service"}</span>
          </button>
        )}

        {status === "IN_PROGRESS" && (
          <button
            onClick={() => handleAction(completeJob, "complete")}
            disabled={!!loading}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{loading === "complete" ? "Completing..." : "Complete & Receive Payment"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
