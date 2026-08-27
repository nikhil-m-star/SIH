"use client";

import { useState } from "react";
import { verifyWorker } from "@/lib/actions";
import { useRouter } from "next/navigation";

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
    <div className="flex flex-col gap-1">
      {currentStatus !== "VERIFIED" && (
        <button
          onClick={() => handleAction("VERIFIED")}
          disabled={loading}
          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
        >
          Verify
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          onClick={() => handleAction("REJECTED")}
          disabled={loading}
          className="px-3 py-1.5 border border-red-300 text-red-700 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50"
        >
          Reject
        </button>
      )}
    </div>
  );
}
