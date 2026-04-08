import type { Metadata } from "next";
import CountryList from "@/components/countries/CountryList";

export const metadata: Metadata = { title: "Countries — Mom's Travels" };

export default function CountriesPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Countries Visited
      </h1>
      <CountryList />
    </div>
  );
}
