"use client";

import { useState } from "react";
import { updateCooperativeConfig } from "@/lib/actions";
import { useRouter } from "next/navigation";

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
      className="bg-white border border-gray-200 rounded-xl p-5 space-y-3"
    >
      {[
        { label: "Worker Share %", value: workerSharePct, set: setWorkerSharePct },
        { label: "Welfare %", value: welfarePct, set: setWelfarePct },
        { label: "Training %", value: trainingPct, set: setTrainingPct },
        { label: "Cooperative %", value: cooperativePct, set: setCooperativePct },
      ].map((field) => (
        <div key={field.label} className="flex items-center justify-between">
          <label className="text-sm text-gray-600">{field.label}</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={field.value}
            onChange={(e) => field.set(parseFloat(e.target.value) || 0)}
            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
      ))}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-sm font-medium text-gray-700">Total</span>
        <span
          className={`text-sm font-bold ${total === 100 ? "text-green-600" : "text-red-600"}`}
        >
          {total}%
        </span>
      </div>

      {total !== 100 && (
        <p className="text-xs text-red-600">Percentages must sum to 100%</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {saved && (
        <p className="text-xs text-green-600">Configuration saved!</p>
      )}

      <button
        type="submit"
        disabled={total !== 100 || loading}
        className="w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] disabled:opacity-50 transition-colors"
      >
        {loading ? "Saving..." : "Save Configuration"}
      </button>
    </form>
  );
}
