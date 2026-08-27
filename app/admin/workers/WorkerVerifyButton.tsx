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
    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
      {currentStatus !== "VERIFIED" && (
        <button
          onClick={() => handleAction("VERIFIED")}
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-400/20 hover:bg-emerald-400 text-emerald-300 hover:text-black rounded-full text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Verify</span>
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          onClick={() => handleAction("REJECTED")}
          disabled={loading}
          className="px-5 py-2.5 bg-red-950/40 hover:bg-red-600/40 text-red-400 rounded-full text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <X className="w-4 h-4" />
          <span>Reject</span>
        </button>
      )}
    </div>
  );
}
