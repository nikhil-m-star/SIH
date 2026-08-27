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
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3 text-xs"
    >
      {[
        { label: "Worker Payout Share %", value: workerSharePct, set: setWorkerSharePct },
        { label: "Worker Welfare Fund %", value: welfarePct, set: setWelfarePct },
        { label: "Skills Training Fund %", value: trainingPct, set: setTrainingPct },
        { label: "Cooperative Retained %", value: cooperativePct, set: setCooperativePct },
      ].map((field) => (
        <div key={field.label} className="flex items-center justify-between">
          <label className="text-zinc-400">{field.label}</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={field.value}
            onChange={(e) => field.set(parseFloat(e.target.value) || 0)}
            className="w-16 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-right text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      ))}

      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        <span className="font-medium text-zinc-300">Total Allocation</span>
        <span
          className={`font-mono font-bold ${
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
        <p className="text-emerald-400 text-[11px] flex items-center gap-1">
          <Check className="w-3 h-3" />
          <span>Allocation policy updated</span>
        </p>
      )}

      <button
        type="submit"
        disabled={total !== 100 || loading}
        className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
      >
        {loading ? "Saving..." : "Update Policy"}
      </button>
    </form>
  );
}
