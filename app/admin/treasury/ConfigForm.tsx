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
      className="bg-[#0e0e0e] rounded-3xl p-8 space-y-5 text-sm"
    >
      {[
        { label: "Worker Payout Share %", value: workerSharePct, set: setWorkerSharePct },
        { label: "Welfare Fund %", value: welfarePct, set: setWelfarePct },
        { label: "Skills Training Fund %", value: trainingPct, set: setTrainingPct },
        { label: "Cooperative Reserve %", value: cooperativePct, set: setCooperativePct },
      ].map((field) => (
        <div key={field.label} className="flex items-center justify-between py-1.5">
          <label className="text-neutral-300 font-medium text-base">{field.label}</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={field.value}
            onChange={(e) => field.set(parseFloat(e.target.value) || 0)}
            className="w-20 bg-[#181818] rounded-2xl px-4 py-2.5 text-right text-white font-mono font-bold text-base focus:outline-none focus:bg-[#202020]"
          />
        </div>
      ))}

      <div className="flex items-center justify-between pt-4 border-t border-[#1c1c1c]">
        <span className="font-extrabold text-white text-base">Total Allocation</span>
        <span
          className={`font-mono font-black text-xl ${
            total === 100 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {total}%
        </span>
      </div>

      {total !== 100 && (
        <p className="text-red-400 text-sm font-semibold">Total percentages must equal 100%</p>
      )}
      {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}
      {saved && (
        <p className="text-emerald-400 text-sm font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Allocation policy updated successfully</span>
        </p>
      )}

      <button
        type="submit"
        disabled={total !== 100 || loading}
        className="w-full px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-base font-black disabled:opacity-50 transition-all"
      >
        {loading ? "Saving policy..." : "Update policy"}
      </button>
    </form>
  );
}
