"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/map"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          ✈️ Mom&apos;s Travels
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/map"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Map
          </Link>
          <Link
            href="/countries"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Countries
          </Link>

          {session?.user && (
            <div className="relative" onBlur={() => setMenuOpen(false)}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium dark:bg-zinc-700">
                    {session.user.name?.[0] ?? "?"}
                  </span>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex items-center sm:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6 text-zinc-700 dark:text-zinc-300"
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
        <div className="border-t border-zinc-200 bg-white px-4 pb-4 dark:border-zinc-800 dark:bg-zinc-950 sm:hidden">
          <Link
            href="/map"
            className="block py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
            onClick={() => setMenuOpen(false)}
          >
            Map
          </Link>
          <Link
            href="/countries"
            className="block py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
            onClick={() => setMenuOpen(false)}
          >
            Countries
          </Link>
          <Link
            href="/settings"
            className="block py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
            onClick={() => setMenuOpen(false)}
          >
            Settings
          </Link>
          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="block py-2 text-sm font-medium text-red-600 dark:text-red-400"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
