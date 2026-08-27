import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <SignIn />
    </div>
  );
}
