"use client";

import { useState } from "react";
import { updateCooperativeConfig } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

interface ConfigProps {
  config: {
    workerSharePct: number;
    welfarePct: number;
    trainingPct: number;
    cooperativePct: number;
  };
}

export default function ConfigForm({ config }: ConfigProps) {
  const [workerSharePct, setWorkerSharePct] = useState(config.workerSharePct);
  const [welfarePct, setWelfarePct] = useState(config.welfarePct);
  const [trainingPct, setTrainingPct] = useState(config.trainingPct);
  const [cooperativePct, setCooperativePct] = useState(config.cooperativePct);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const total = workerSharePct + welfarePct + trainingPct + cooperativePct;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (total !== 100) return;
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      await updateCooperativeConfig({
        workerSharePct,
        welfarePct,
        trainingPct,
        cooperativePct,
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save policy");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-[#12131d] rounded-2xl p-6 space-y-4 text-xs"
    >
      {[
        { label: "Worker Payout Share %", value: workerSharePct, set: setWorkerSharePct },
        { label: "Welfare Fund %", value: welfarePct, set: setWelfarePct },
        { label: "Skills Training Fund %", value: trainingPct, set: setTrainingPct },
        { label: "Cooperative Reserve %", value: cooperativePct, set: setCooperativePct },
      ].map((field) => (
        <div key={field.label} className="flex items-center justify-between py-1">
          <label className="text-zinc-400 font-medium">{field.label}</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={field.value}
            onChange={(e) => field.set(parseFloat(e.target.value) || 0)}
            className="w-16 bg-[#1a1c29] rounded-xl px-3 py-1.5 text-right text-white font-mono font-bold focus:outline-none focus:bg-[#222536]"
          />
        </div>
      ))}

      <div className="flex items-center justify-between pt-3 border-t border-[#1c1e2b]">
        <span className="font-bold text-zinc-300">Total Allocation</span>
        <span
          className={`font-mono font-extrabold text-sm ${
            total === 100 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {total}%
        </span>
      </div>

      {total !== 100 && (
        <p className="text-red-400 text-[11px]">Total percentages must equal 100%</p>
      )}
      {error && <p className="text-red-400 text-[11px]">{error}</p>}
      {saved && (
        <p className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          <span>Allocation policy updated successfully</span>
        </p>
      )}

      <button
        type="submit"
        disabled={total !== 100 || loading}
        className="w-full px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full text-xs font-bold disabled:opacity-50 transition-all shadow-md"
      >
        {loading ? "Saving policy..." : "Update policy"}
      </button>
    </form>
  );
}
