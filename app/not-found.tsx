import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 text-center">
      <div className="max-w-md bg-[#0e0e0e] rounded-3xl p-8 md:p-10 space-y-6">
        <h1 className="text-6xl font-black text-emerald-400">404</h1>
        <div>
          <h2 className="text-2xl font-extrabold text-white">Page Not Found</h2>
          <p className="text-sm text-neutral-400 mt-2">
            The booking or page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-sm font-black transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
