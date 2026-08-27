"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AIHelpPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    service: string;
    problem: string;
    urgency: string;
    explanation: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [serviceId, setServiceId] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || description.length < 10) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "AI service is currently unavailable");
        return;
      }

      setResult(data.result);
      setServiceId(data.serviceId || "");
    } catch {
      setError("Failed to connect to AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBookService() {
    if (!serviceId) return;
    const params = new URLSearchParams({
      serviceId,
      description,
      urgency: result?.urgency || "MEDIUM",
      aiUsed: "true",
    });
    router.push(`/customer/book?${params.toString()}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">AI Help</h1>
      <p className="text-gray-500 mt-1">
        Describe your problem and AI will identify the right service for you.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What&apos;s the problem?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            placeholder="E.g., Water is leaking from underneath my kitchen sink and there's a puddle on the floor..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Be as specific as possible for better results
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || description.length < 10}
          className="w-full px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] disabled:opacity-50 transition-colors"
        >
          {loading ? "Analyzing..." : "Identify Service"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
          <p className="mt-1 text-xs">
            You can always{" "}
            <a
              href="/customer/book"
              className="underline font-medium"
            >
              select a service manually
            </a>
            .
          </p>
        </div>
      )}

      {result && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-3">
            AI Recommendation
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500">Service</span>
              <span className="text-sm font-semibold text-[var(--color-primary)]">
                {result.service}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500">Problem</span>
              <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
                {result.problem}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500">Urgency</span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  result.urgency === "HIGH"
                    ? "bg-red-100 text-red-800"
                    : result.urgency === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                {result.urgency}
              </span>
            </div>
            <hr className="border-gray-100" />
            <p className="text-sm text-gray-600">{result.explanation}</p>
          </div>

          <button
            onClick={handleBookService}
            disabled={!serviceId}
            className="mt-4 w-full px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] disabled:opacity-50 transition-colors"
          >
            Book {result.service} Service →
          </button>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400 text-center">
        AI recommendations are suggestions only. You can always choose a
        different service.
      </p>
    </div>
  );
}
