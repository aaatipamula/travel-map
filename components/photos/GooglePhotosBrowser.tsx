"use client";

import { useState } from "react";
import Image from "next/image";
import type { MediaItem } from "@/lib/google-photos";

interface Props {
  countryCode: string;
  onAssigned: () => void;
}

interface SearchResult {
  mediaItems?: MediaItem[];
  nextPageToken?: string;
  connected?: boolean;
}

export default function GooglePhotosBrowser({ countryCode, onAssigned }: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  async function search(pageToken?: string) {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      if (pageToken) params.set("pageToken", pageToken);
      const res = await fetch(`/api/google-photos/list?${params}`);
      const data: SearchResult = await res.json();

      if (res.status === 403) {
        setConnected(false);
        return;
      }

      setConnected(true);
      if (pageToken) {
        setItems((prev) => [...prev, ...(data.mediaItems ?? [])]);
      } else {
        setItems(data.mediaItems ?? []);
      }
      setNextPageToken(data.nextPageToken);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function assignSelected() {
    setAssigning(true);
    const toAssign = items.filter((item) => selected.has(item.id));
    try {
      await Promise.all(
        toAssign.map((item) =>
          fetch("/api/google-photos/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              googlePhotoId: item.id,
              baseUrl: item.baseUrl,
              filename: item.filename,
              countryCode,
              takenAt: item.mediaMetadata?.creationTime
                ? Math.floor(
                    new Date(item.mediaMetadata.creationTime).getTime() / 1000
                  )
                : undefined,
            }),
          })
        )
      );
      setSelected(new Set());
      onAssigned();
    } finally {
      setAssigning(false);
    }
  }

  if (connected === false) {
    return (
      <div className="rounded-xl bg-zinc-50 p-6 text-center dark:bg-zinc-800">
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Connect your Google Photos account to import photos.
        </p>
        <a
          href="/api/google-photos/connect"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Connect Google Photos
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Date filter */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => search()}
            disabled={!startDate || !endDate || loading}
            className="rounded-lg bg-blue-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {/* Results grid */}
      {items.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {items.map((item) => {
              const isSelected = selected.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                    isSelected
                      ? "border-blue-500"
                      : "border-transparent hover:border-zinc-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${item.baseUrl}=w200-h200-c`}
                    alt={item.filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500/30">
                      <div className="rounded-full bg-blue-500 p-0.5 text-white">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {nextPageToken && (
            <button
              onClick={() => search(nextPageToken)}
              disabled={loading}
              className="w-full rounded-lg border border-zinc-300 py-2 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          )}

          {selected.size > 0 && (
            <button
              onClick={assignSelected}
              disabled={assigning}
              className="w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {assigning
                ? `Importing ${selected.size} photo${selected.size > 1 ? "s" : ""}…`
                : `Add ${selected.size} photo${selected.size > 1 ? "s" : ""} to ${countryCode}`}
            </button>
          )}
        </>
      )}

      {!loading && items.length === 0 && connected === true && (
        <p className="py-4 text-center text-sm text-zinc-400">
          No photos found for the selected date range.
        </p>
      )}
    </div>
  );
}
