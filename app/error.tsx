"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 text-center">
      <div className="max-w-md bg-[#0e0e0e] rounded-3xl p-8 md:p-10 space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-black">
          !
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">Something went wrong</h2>
          <p className="text-sm text-neutral-400 mt-2">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-sm font-black transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try again</span>
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-[#181818] hover:bg-[#222222] text-white rounded-full text-sm font-bold transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
