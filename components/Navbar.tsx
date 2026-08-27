"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-black sticky top-0 z-50">
      <div className="container-main flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-tight text-white">
            SevaConnect
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/#cooperative"
            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cooperative model
          </Link>

          {isSignedIn ? (
            <div className="flex items-center pl-2">
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-4 pl-2">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm bg-white hover:bg-neutral-200 text-black font-bold px-5 py-2 rounded-full transition-all">
                  Get started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-neutral-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Navigation"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-neutral-950 px-8 py-6 space-y-4">
          <Link
            href="/#how-it-works"
            className="block text-sm font-medium text-neutral-300 py-1"
            onClick={() => setMenuOpen(false)}
          >
            How it works
          </Link>
          <Link
            href="/#cooperative"
            className="block text-sm font-medium text-neutral-300 py-1"
            onClick={() => setMenuOpen(false)}
          >
            Cooperative model
          </Link>
          {isSignedIn ? (
            <div className="pt-2">
              <UserButton />
            </div>
          ) : (
            <div className="flex gap-3 pt-3">
              <SignInButton mode="modal">
                <button className="text-sm text-neutral-300 bg-neutral-900 px-5 py-2.5 rounded-full font-medium">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm bg-white text-black font-bold px-5 py-2.5 rounded-full">
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
