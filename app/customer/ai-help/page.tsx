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
        setError(data.error || "AI service is busy. You can book manually.");
        return;
      }

      setResult(data.result);
      setServiceId(data.serviceId || "");
    } catch {
      setError("AI diagnosis unreachable. Please choose a service directly.");
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
    <div className="space-y-8 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-400" />
            <span>AI Service Diagnosis</span>
          </h1>
          <p className="text-base text-neutral-400 mt-2">
            Automated service category identification powered by NVIDIA NIM
          </p>
        </div>
        <Link
          href="/customer/book"
          className="text-sm text-neutral-400 hover:text-white inline-flex items-center gap-1.5 font-bold bg-[#141414] px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Manual</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-[#0e0e0e] p-8 md:p-10 rounded-3xl">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-neutral-200">
            What is the issue?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-[#181818] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:bg-[#202020]"
            placeholder="E.g., Water is dripping from under the kitchen sink onto the wooden cabinet..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || description.length < 10}
          className="w-full px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-base font-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{loading ? "Diagnosing with NVIDIA NIM..." : "Diagnose service"}</span>
        </button>
      </form>

      {error && (
        <div className="p-6 bg-red-950/40 rounded-3xl text-sm text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p>{error}</p>
            <Link
              href="/customer/book"
              className="text-emerald-400 font-bold underline mt-2 inline-block"
            >
              Choose service category manually
            </Link>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-[#0e0e0e] rounded-3xl p-8 md:p-10 space-y-5 text-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#1c1c1c]">
            <span className="text-neutral-400 font-medium">Recommended Category</span>
            <span className="font-extrabold text-xl text-emerald-400">
              {result.service}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Diagnosed Issue</span>
            <span className="text-white font-bold text-base text-right max-w-[65%]">
              {result.problem}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Urgency</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
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
          <p className="text-neutral-300 text-sm leading-relaxed pt-2 bg-[#161616] p-4 rounded-2xl">
            {result.explanation}
          </p>

          <button
            onClick={handleBookService}
            disabled={!serviceId}
            className="w-full px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-base font-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to book {result.service}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
