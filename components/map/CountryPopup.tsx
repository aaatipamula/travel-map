"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import CountryForm from "@/components/countries/CountryForm";
import PhotoGallery from "@/components/photos/PhotoGallery";
import type { VisitedCountry } from "@/db/schema";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  countryCode: string;
  countryName: string;
  isVisited: boolean;
  onClose: () => void;
  onVisitChange: () => void;
}

type Tab = "gallery" | "edit";

export default function CountryPopup({
  countryCode,
  countryName,
  isVisited,
  onClose,
  onVisitChange,
}: Props) {
  const [tab, setTab] = useState<Tab>(isVisited ? "gallery" : "edit");
  const { data: detail, mutate } = useSWR<VisitedCountry & { photos: unknown[] }>(
    isVisited ? `/api/countries/${countryCode}` : null,
    fetcher
  );

  // Reset tab when country changes
  useEffect(() => {
    setTab(isVisited ? "gallery" : "edit");
  }, [countryCode, isVisited]);

  async function handleSave(formData: { visitedDates: string[]; notes: string }) {
    if (isVisited) {
      await fetch(`/api/countries/${countryCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch("/api/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, countryName, ...formData }),
      });
    }
    await mutate();
    onVisitChange();
    setTab("gallery");
  }

  async function handleRemove() {
    if (!confirm(`Remove ${countryName} from your travels?`)) return;
    await fetch(`/api/countries/${countryCode}`, { method: "DELETE" });
    onVisitChange();
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel — full-screen sheet on mobile, side panel on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-xl dark:bg-zinc-900 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-96 sm:max-h-full sm:rounded-none sm:rounded-l-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-700">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {countryName}
            </h2>
            {isVisited && detail && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {detail.visitedDates
                  ? `${JSON.parse(detail.visitedDates).length} visit date(s)`
                  : "No dates added"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isVisited && (
              <button
                onClick={() => setTab(tab === "edit" ? "gallery" : "edit")}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                {tab === "edit" ? "Photos" : "Edit"}
              </button>
            )}
            {isVisited && (
              <button
                onClick={handleRemove}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Remove
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!isVisited || tab === "edit" ? (
            <CountryForm
              countryCode={countryCode}
              countryName={countryName}
              existing={detail as VisitedCountry | undefined}
              onSave={handleSave}
              onCancel={isVisited ? () => setTab("gallery") : onClose}
            />
          ) : (
            <PhotoGallery countryCode={countryCode} />
          )}
        </div>
      </div>
    </>
  );
}
