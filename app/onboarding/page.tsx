"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { completeOnboarding } from "@/lib/actions";

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
      setError("Something went wrong. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[var(--color-primary)] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="mt-2 text-gray-600">
            How would you like to use SevaConnect?
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleRoleSelect("CUSTOMER")}
            disabled={loading}
            className="w-full bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-[var(--color-primary)] hover:shadow-sm transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">🏠</span>
              <div>
                <p className="font-semibold text-gray-900">
                  I need a service
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Find and book trusted local workers for home services
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("WORKER")}
            disabled={loading}
            className="w-full bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-[var(--color-primary)] hover:shadow-sm transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">🔧</span>
              <div>
                <p className="font-semibold text-gray-900">
                  I provide services
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Join the cooperative and earn fairly from your skills
                </p>
              </div>
            </div>
          </button>
        </div>

        {loading && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Setting up your account...
          </p>
        )}
      </div>
    </div>
  );
}
