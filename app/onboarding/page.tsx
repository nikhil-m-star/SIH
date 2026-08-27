"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { completeOnboarding } from "@/lib/actions";
import { User, Wrench, Shield } from "lucide-react";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useUser();

  async function handleRoleSelect(role: "CUSTOMER" | "WORKER") {
    setLoading(true);
    setError("");
    try {
      const result = await completeOnboarding(role);
      if (result.success) {
        if (result.role === "CUSTOMER") router.push("/customer");
        else if (result.role === "WORKER") router.push("/worker/profile");
        else router.push("/");
      }
    } catch (e) {
      setError("Setup error. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-white">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Select your account type</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleRoleSelect("CUSTOMER")}
            disabled={loading}
            className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 rounded-xl p-4 text-left transition-all disabled:opacity-50 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 border border-zinc-700/60">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-xs text-white">Customer</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Book and track local service professionals
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("WORKER")}
            disabled={loading}
            className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 rounded-xl p-4 text-left transition-all disabled:opacity-50 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 border border-zinc-700/60">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-xs text-white">Service Worker</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Receive local jobs and earn 90% direct payout
                </p>
              </div>
            </div>
          </button>
        </div>

        {loading && (
          <p className="text-center text-xs text-zinc-500 mt-4">
            Setting up account...
          </p>
        )}
      </div>
    </div>
  );
}
