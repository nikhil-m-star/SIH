"use client";

import { toggleWorkerAvailability } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
        isAvailable
          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
          : "bg-[#181926] text-zinc-500 hover:bg-[#202232]"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isAvailable ? "bg-emerald-400" : "bg-zinc-600"
        }`}
      />
      <span>{isAvailable ? "Available" : "Offline"}</span>
    </button>
  );
}
