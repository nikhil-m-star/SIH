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
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isAvailable
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isAvailable ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      {isAvailable ? "Available" : "Unavailable"}
    </button>
  );
}
