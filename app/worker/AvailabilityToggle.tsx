"use client";

import { toggleWorkerAvailability } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Radio } from "lucide-react";

export default function AvailabilityToggle({
  isAvailable,
}: {
  isAvailable: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    try {
      await toggleWorkerAvailability();
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        isAvailable
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
          : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-850"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isAvailable ? "bg-emerald-400" : "bg-zinc-600"
        }`}
      />
      <span>{isAvailable ? "Available" : "Offline"}</span>
    </button>
  );
}
