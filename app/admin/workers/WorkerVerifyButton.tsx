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
    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
      {currentStatus !== "VERIFIED" && (
        <button
          onClick={() => handleAction("VERIFIED")}
          disabled={loading}
          className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-zinc-950 rounded-full text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Verify</span>
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          onClick={() => handleAction("REJECTED")}
          disabled={loading}
          className="px-3.5 py-1.5 bg-red-950/30 hover:bg-red-600/30 text-red-400 rounded-full text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reject</span>
        </button>
      )}
    </div>
  );
}
