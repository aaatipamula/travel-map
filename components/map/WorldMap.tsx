"use client";

import { useState, useCallback } from "react";
import { ComposableMap, ZoomableGroup } from "react-simple-maps";
import useSWR from "swr";
import CountryLayer from "./CountryLayer";
import CountryPopup from "./CountryPopup";
import type { VisitedCountry } from "@/db/schema";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function WorldMap() {
  const { data, mutate } = useSWR<VisitedCountry[]>("/api/countries", fetcher);
  const [selected, setSelected] = useState<{
    code: string;
    name: string;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  const visitedCodes = new Set((data ?? []).map((c) => c.countryCode));

  const handleCountryClick = useCallback((code: string, name: string) => {
    setSelected({ code, name });
  }, []);

  return (
    <div className="relative flex h-full w-full flex-1 overflow-hidden bg-sky-50 dark:bg-zinc-900">
      {/* Zoom controls */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.5, 8))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow dark:bg-zinc-800 dark:text-zinc-100"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z / 1.5, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow dark:bg-zinc-800 dark:text-zinc-100"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setCenter([0, 20]);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow text-xs dark:bg-zinc-800 dark:text-zinc-100"
          aria-label="Reset view"
        >
          ⌖
        </button>
      </div>

      <ComposableMap
        projectionConfig={{ scale: 147 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={({ zoom: z, coordinates }) => {
            setZoom(z);
            setCenter(coordinates);
          }}
        >
          <CountryLayer
            visitedCodes={visitedCodes}
            onCountryClick={handleCountryClick}
          />
        </ZoomableGroup>
      </ComposableMap>

      {selected && (
        <CountryPopup
          countryCode={selected.code}
          countryName={selected.name}
          isVisited={visitedCodes.has(selected.code)}
          onClose={() => setSelected(null)}
          onVisitChange={() => mutate()}
        />
      )}
    </div>
  );
}
