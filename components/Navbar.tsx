"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-50">
      <div className="container-main flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100">
            SevaConnect
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/#how-it-works"
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/#cooperative"
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cooperative model
          </Link>

          {isSignedIn ? (
            <div className="flex items-center gap-3 pl-2">
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <SignInButton mode="modal">
                <button className="text-xs text-zinc-300 hover:text-white px-3 py-1.5 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-md font-medium transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-200"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-3">
          <Link
            href="/#how-it-works"
            className="block text-xs text-zinc-400"
            onClick={() => setMenuOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/#cooperative"
            className="block text-xs text-zinc-400"
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
                <button className="text-xs text-zinc-300 px-3 py-1.5 border border-zinc-800 rounded-md">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-xs bg-emerald-600 text-white px-3.5 py-1.5 rounded-md font-medium">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
