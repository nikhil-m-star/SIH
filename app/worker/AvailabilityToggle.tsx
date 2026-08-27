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
      className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-extrabold transition-colors ${
        isAvailable
          ? "bg-emerald-400/15 text-emerald-400 hover:bg-emerald-400/25"
          : "bg-[#141414] text-neutral-500 hover:bg-[#1f1f1f]"
      }`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          isAvailable ? "bg-emerald-400" : "bg-neutral-600"
        }`}
      />
      <span>{isAvailable ? "Available" : "Offline"}</span>
    </button>
  );
}
