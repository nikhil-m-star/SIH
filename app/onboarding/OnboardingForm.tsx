"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { completeOnboarding } from "@/lib/actions";
import { User, Wrench, ArrowRight } from "lucide-react";

export default function OnboardingForm() {
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
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-base text-neutral-400 mt-2">Select your account role</p>
      </div>

      {error && (
        <div className="mb-6 p-5 bg-red-950/30 rounded-3xl text-sm text-red-400 font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={() => handleRoleSelect("CUSTOMER")}
          disabled={loading}
          className="w-full bg-[#0e0e0e] hover:bg-[#181818] rounded-3xl p-7 text-left transition-all disabled:opacity-50 group flex items-center justify-between"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center text-neutral-200 group-hover:text-emerald-400 transition-colors">
              <User className="w-7 h-7" />
            </div>
            <div>
              <p className="font-extrabold text-lg text-white">Customer</p>
              <p className="text-sm text-neutral-400 mt-1">
                Book and track verified local services
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-emerald-400 transition-colors" />
        </button>

        <button
          onClick={() => handleRoleSelect("WORKER")}
          disabled={loading}
          className="w-full bg-[#0e0e0e] hover:bg-[#181818] rounded-3xl p-7 text-left transition-all disabled:opacity-50 group flex items-center justify-between"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center text-neutral-200 group-hover:text-emerald-400 transition-colors">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <p className="font-extrabold text-lg text-white">Service Worker</p>
              <p className="text-sm text-neutral-400 mt-1">
                Receive local jobs with 90% direct payout
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-emerald-400 transition-colors" />
        </button>
      </div>

      {loading && (
        <p className="text-center text-sm text-neutral-500 mt-6 font-medium">
          Setting up your profile...
        </p>
      )}
    </div>
  );
}
