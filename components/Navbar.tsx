"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-main flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-lg text-gray-900">
            SevaConnect
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/#how-it-works"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#cooperative"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cooperative Model
          </Link>

          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <button className="text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-2 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-primary-light)] transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link
            href="/#how-it-works"
            className="block text-sm text-gray-600"
            onClick={() => setMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="/#cooperative"
            className="block text-sm text-gray-600"
            onClick={() => setMenuOpen(false)}
          >
            Cooperative Model
          </Link>
          {isSignedIn ? (
            <div className="pt-2">
              <UserButton />
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <SignInButton mode="modal">
                <button className="text-sm text-gray-700 font-medium px-3 py-2">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium">
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
