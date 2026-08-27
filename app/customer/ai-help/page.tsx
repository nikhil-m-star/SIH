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
        setError(data.error || "AI service is currently busy. You can book manually.");
        return;
      }

      setResult(data.result);
      setServiceId(data.serviceId || "");
    } catch {
      setError("AI diagnosis unreachable. Please pick a category directly.");
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>AI Service Diagnosis</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Automated service category identification powered by NVIDIA NIM
          </p>
        </div>
        <Link
          href="/customer/book"
          className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1 font-medium bg-[#14151f] px-3 py-1.5 rounded-full"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Manual</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-[#12131d] p-6 rounded-2xl">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-zinc-300">
            What is the issue?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-[#1a1c29] rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:bg-[#202334]"
            placeholder="E.g., Water is dripping from under the kitchen sink and flooding the cabinet floor..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || description.length < 10}
          className="w-full px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full text-xs font-bold disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? "Diagnosing with NVIDIA NIM..." : "Diagnose service"}</span>
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-950/30 rounded-2xl text-xs text-red-400 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p>{error}</p>
            <Link
              href="/customer/book"
              className="text-emerald-400 font-semibold underline mt-1.5 inline-block"
            >
              Choose service manually
            </Link>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-[#12131d] rounded-2xl p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e202d]">
            <span className="text-zinc-500 font-medium">Recommended Category</span>
            <span className="font-extrabold text-sm text-emerald-400">
              {result.service}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Diagnosed Issue</span>
            <span className="text-zinc-200 font-semibold text-right max-w-[65%]">
              {result.problem}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Urgency</span>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                result.urgency === "HIGH"
                  ? "bg-red-500/15 text-red-400"
                  : result.urgency === "MEDIUM"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-emerald-500/15 text-emerald-400"
              }`}
            >
              {result.urgency}
            </span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed pt-1 bg-[#181a26] p-3 rounded-xl">
            {result.explanation}
          </p>

          <button
            onClick={handleBookService}
            disabled={!serviceId}
            className="w-full px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full text-xs font-bold disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Proceed to book {result.service}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
