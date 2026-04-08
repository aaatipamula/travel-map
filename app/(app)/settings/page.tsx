import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/db";
import { googlePhotosTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";

export const metadata: Metadata = { title: "Settings — Mom's Travels" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ google_photos?: string; google_photos_error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  const googleToken = session
    ? await db.query.googlePhotosTokens.findFirst({
        where: eq(googlePhotosTokens.userId, session!.user.id),
      })
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Settings
      </h1>

      {/* Profile */}
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="mb-4 text-base font-semibold text-zinc-800 dark:text-zinc-100">
          Account
        </h2>
        <div className="flex items-center gap-4">
          {session?.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {session?.user.name}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {session?.user.email}
            </p>
          </div>
        </div>
      </section>

      {/* Google Photos */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="mb-1 text-base font-semibold text-zinc-800 dark:text-zinc-100">
          Google Photos
        </h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Connect your Google Photos library to import photos into your travel
          galleries by date range.
        </p>

        {params.google_photos === "connected" && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
            Google Photos connected successfully.
          </div>
        )}
        {params.google_photos_error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
            Failed to connect: {params.google_photos_error}
          </div>
        )}

        {googleToken ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Connected
            </span>
            <a
              href="/api/google-photos/connect"
              className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Reconnect
            </a>
          </div>
        ) : (
          <a
            href="/api/google-photos/connect"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-600"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Connect Google Photos
          </a>
        )}
      </section>
    </div>
  );
}
