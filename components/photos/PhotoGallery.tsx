"use client";

import { useState } from "react";
import useSWR from "swr";
import PhotoCard from "./PhotoCard";
import PhotoUploader from "./PhotoUploader";
import GooglePhotosBrowser from "./GooglePhotosBrowser";
import type { Photo } from "@/db/schema";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type AddTab = "upload" | "google";

interface Props {
  countryCode: string;
}

export default function PhotoGallery({ countryCode }: Props) {
  const { data: photosData, mutate } = useSWR<Photo[]>(
    `/api/photos?countryCode=${countryCode}`,
    fetcher
  );
  const [addTab, setAddTab] = useState<AddTab | null>(null);

  function handleDelete(id: string) {
    mutate((prev) => prev?.filter((p) => p.id !== id), false);
  }

  return (
    <div className="space-y-4">
      {/* Add photos controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setAddTab(addTab === "upload" ? null : "upload")}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Upload
        </button>
        <button
          onClick={() => setAddTab(addTab === "google" ? null : "google")}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" />
          </svg>
          Google Photos
        </button>
      </div>

      {/* Add panel */}
      {addTab === "upload" && (
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
          <PhotoUploader
            countryCode={countryCode}
            onUploaded={() => {
              mutate();
              setTimeout(() => setAddTab(null), 500);
            }}
          />
        </div>
      )}
      {addTab === "google" && (
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
          <GooglePhotosBrowser
            countryCode={countryCode}
            onAssigned={() => mutate()}
          />
        </div>
      )}

      {/* Gallery grid */}
      {!photosData ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : photosData.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No photos yet. Upload some or import from Google Photos.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {photosData.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
