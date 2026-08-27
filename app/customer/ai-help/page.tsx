"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
        setError(data.error || "Service unavailable. You can select a service directly.");
        return;
      }

      setResult(data.result);
      setServiceId(data.serviceId || "");
    } catch {
      setError("AI diagnosis unreachable. Please select service manually.");
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
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI Service Diagnosis</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Identify the service category from your problem description
          </p>
        </div>
        <Link
          href="/customer/book"
          className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Manual book</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            Problem Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            placeholder="E.g., Water is leaking from beneath the kitchen sink onto the floor cabinet..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || description.length < 10}
          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? "Analyzing..." : "Diagnose Service"}</span>
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p>{error}</p>
            <Link
              href="/customer/book"
              className="text-emerald-400 underline mt-1 inline-block"
            >
              Choose service manually
            </Link>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <span className="text-zinc-500 font-medium">Recommended Service</span>
            <span className="font-semibold text-emerald-400">
              {result.service}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Diagnosed Issue</span>
            <span className="text-zinc-200 text-right max-w-[65%]">
              {result.problem}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Urgency</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                result.urgency === "HIGH"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : result.urgency === "MEDIUM"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              {result.urgency}
            </span>
          </div>
          <p className="text-zinc-400 pt-1 text-[11px] leading-relaxed">
            {result.explanation}
          </p>

          <button
            onClick={handleBookService}
            disabled={!serviceId}
            className="mt-2 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Proceed to Book {result.service}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
