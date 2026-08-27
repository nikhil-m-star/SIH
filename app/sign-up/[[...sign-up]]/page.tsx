import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <SignUp />
    </div>
  );
}
