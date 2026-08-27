"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#0b0c10]/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="container-main flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            SevaConnect
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/#how-it-works"
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/#cooperative"
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Cooperative model
          </Link>

          {isSignedIn ? (
            <div className="flex items-center pl-2">
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <SignInButton mode="modal">
                <button className="text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#181a24] transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-4 py-2 rounded-full transition-all shadow-sm">
                  Get started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Navigation"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[#13141d] px-6 py-4 space-y-3 rounded-b-2xl shadow-xl">
          <Link
            href="/#how-it-works"
            className="block text-xs text-zinc-300 py-1"
            onClick={() => setMenuOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/#cooperative"
            className="block text-xs text-zinc-300 py-1"
            onClick={() => setMenuOpen(false)}
          >
            Cooperative model
          </Link>
          {isSignedIn ? (
            <div className="pt-2">
              <UserButton />
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <SignInButton mode="modal">
                <button className="text-xs text-zinc-300 bg-[#1e202d] px-3.5 py-1.5 rounded-lg">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-xs bg-emerald-500 text-zinc-950 font-semibold px-4 py-1.5 rounded-full">
                  Get started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
