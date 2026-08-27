"use client";

import { useState } from "react";
import { submitRating } from "@/lib/actions";
import { useRouter } from "next/navigation";

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
      setError(e instanceof Error ? e.message : "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-3">Rate this service</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              onMouseEnter={() => setHoverScore(star)}
              onMouseLeave={() => setHoverScore(0)}
              className="text-2xl transition-colors"
            >
              <span
                className={
                  star <= (hoverScore || score)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="Optional comment..."
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={score === 0 || loading}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Rating"}
        </button>
      </form>
    </div>
  );
}
