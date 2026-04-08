"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import CountryForm from "@/components/countries/CountryForm";
import PhotoGallery from "@/components/photos/PhotoGallery";
import type { VisitedCountry } from "@/db/schema";

export default function CountryDetailClient({
  country,
}: {
  country: VisitedCountry;
}) {
  const router = useRouter();

  async function handleSave(data: { visitedDates: string[]; notes: string }) {
    await fetch(`/api/countries/${country.countryCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Remove ${country.countryName} from your travels?`)) return;
    await fetch(`/api/countries/${country.countryCode}`, { method: "DELETE" });
    router.push("/countries");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/countries"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Countries
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <h1 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {country.countryName}
        </h1>
        <CountryForm
          countryCode={country.countryCode}
          countryName={country.countryName}
          existing={country}
          onSave={handleSave}
          onCancel={() => router.back()}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Photos
        </h2>
      </div>
      <PhotoGallery countryCode={country.countryCode} />

      <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <button
          onClick={handleDelete}
          className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          Remove this country from my travels
        </button>
      </div>
    </div>
  );
}
