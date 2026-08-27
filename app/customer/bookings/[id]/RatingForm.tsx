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
    <div className="bg-[#0e0e0e] rounded-3xl p-8 space-y-5 text-sm">
      <h3 className="font-extrabold text-white text-base">Rate Service Experience</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              onMouseEnter={() => setHoverScore(star)}
              onMouseLeave={() => setHoverScore(0)}
              className="p-1 text-neutral-700 hover:text-amber-400 transition-colors"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverScore || score)
                    ? "text-amber-400 fill-amber-400"
                    : "text-neutral-700"
                }`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full bg-[#181818] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:bg-[#202020]"
          placeholder="Optional feedback on quality, punctuality, and professionalism..."
        />
        {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}
        <button
          type="submit"
          disabled={score === 0 || loading}
          className="px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-sm font-black disabled:opacity-50 transition-all"
        >
          {loading ? "Submitting rating..." : "Submit rating"}
        </button>
      </form>
    </div>
  );
}
