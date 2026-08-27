"use client";

import { useState } from "react";
import { verifyWorker } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export default function WorkerVerifyButton({
  workerId,
  currentStatus,
}: {
  workerId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction(status: "VERIFIED" | "REJECTED") {
    setLoading(true);
    try {
      await verifyWorker(workerId, status);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
      {currentStatus !== "VERIFIED" && (
        <button
          onClick={() => handleAction("VERIFIED")}
          disabled={loading}
          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded text-[11px] font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
        >
          <Check className="w-3 h-3" />
          <span>Verify</span>
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          onClick={() => handleAction("REJECTED")}
          disabled={loading}
          className="px-2.5 py-1 bg-red-950/20 hover:bg-red-600/30 text-red-400 border border-red-800/40 rounded text-[11px] font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
        >
          <X className="w-3 h-3" />
          <span>Reject</span>
        </button>
      )}
    </div>
  );
}
