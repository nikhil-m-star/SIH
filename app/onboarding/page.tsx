"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { completeOnboarding } from "@/lib/actions";
import { User, Wrench, Shield, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c10] px-4 text-zinc-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-white">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Select your account type</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/30 rounded-xl text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleRoleSelect("CUSTOMER")}
            disabled={loading}
            className="w-full bg-[#13141d] hover:bg-[#1c1e2b] rounded-2xl p-5 text-left transition-all disabled:opacity-50 group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1d1f2c] flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Customer</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Book and track verified local services
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </button>

          <button
            onClick={() => handleRoleSelect("WORKER")}
            disabled={loading}
            className="w-full bg-[#13141d] hover:bg-[#1c1e2b] rounded-2xl p-5 text-left transition-all disabled:opacity-50 group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1d1f2c] flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Service Worker</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Receive local jobs with 90% direct payout
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </button>
        </div>

        {loading && (
          <p className="text-center text-xs text-zinc-500 mt-4">
            Setting up your profile...
          </p>
        )}
      </div>
    </div>
  );
}
