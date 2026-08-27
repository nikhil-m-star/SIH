import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentDbUser();

  // If user already registered with a role, bypass onboarding immediately
  if (user) {
    if (user.role === "CUSTOMER") redirect("/customer");
    if (user.role === "WORKER") redirect("/worker");
    if (user.role === "ADMIN") redirect("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 text-neutral-100">
      <OnboardingForm />
    </div>
  );
}
