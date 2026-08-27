"use client";

import { useState } from "react";
import { submitRating } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function RatingForm({ bookingId }: { bookingId: string }) {
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score === 0) return;
    setLoading(true);
    setError("");

    try {
      await submitRating({ bookingId, score, comment: comment || undefined });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rating submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#12131d] rounded-2xl p-6 space-y-4 text-xs">
      <h3 className="font-bold text-white">Rate Service Experience</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              onMouseEnter={() => setHoverScore(star)}
              onMouseLeave={() => setHoverScore(0)}
              className="p-1 text-zinc-600 hover:text-amber-400 transition-colors"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= (hoverScore || score)
                    ? "text-amber-400 fill-amber-400"
                    : "text-zinc-700"
                }`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="w-full bg-[#1a1c29] rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:bg-[#202334]"
          placeholder="Optional feedback..."
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={score === 0 || loading}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full text-xs font-bold disabled:opacity-50 transition-all shadow-md"
        >
          {loading ? "Submitting rating..." : "Submit rating"}
        </button>
      </form>
    </div>
  );
}
