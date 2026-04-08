"use client";

import Link from "next/link";
import useSWR from "swr";
import type { VisitedCountry } from "@/db/schema";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CountryList() {
  const { data, isLoading } = useSWR<VisitedCountry[]>("/api/countries", fetcher);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
        <p className="text-zinc-500 dark:text-zinc-400">
          No countries visited yet. Click on a country on the{" "}
          <Link href="/map" className="text-blue-500 underline">
            map
          </Link>{" "}
          to add one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((country) => {
        const dates: string[] = country.visitedDates
          ? JSON.parse(country.visitedDates)
          : [];
        return (
          <Link
            key={country.id}
            href={`/countries/${country.countryCode}`}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
          >
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {country.countryName}
              </p>
              {dates.length > 0 && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {dates.join(", ")}
                </p>
              )}
            </div>
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
              {country.countryCode}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
