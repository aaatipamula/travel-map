"use client";

import { useState } from "react";
import type { PickerMediaItem } from "@/lib/google-photos";

interface Props {
  countryCode: string;
  onAssigned: () => void;
}

type Step = "idle" | "picking" | "selected" | "assigning";

export default function GooglePhotosBrowser({ countryCode, onAssigned }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [items, setItems] = useState<PickerMediaItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState<boolean | null>(null);
  const [notReady, setNotReady] = useState(false);

  async function openPicker() {
    const res = await fetch("/api/google-photos/session", { method: "POST" });

    if (res.status === 403) {
      setConnected(false);
      return;
    }

    const data = await res.json();
    setSessionId(data.sessionId);
    setConnected(true);
    setStep("picking");
    window.open(data.pickerUri, "_blank", "noopener,noreferrer");
  }

  async function checkDone() {
    if (!sessionId) return;
    setNotReady(false);

    const res = await fetch(`/api/google-photos/session/${sessionId}`);
    const data = await res.json();

    if (!data.ready) {
      setNotReady(true);
      return;
    }

    const mediaItems: PickerMediaItem[] = data.mediaItems ?? [];
    setItems(mediaItems);
    // Pre-select all
    setSelected(new Set(mediaItems.map((i) => i.id)));
    setStep("selected");
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
    setStep("assigning");
    const toAssign = items.filter((item) => selected.has(item.id));
    try {
      await Promise.all(
        toAssign.map((item) =>
          fetch("/api/google-photos/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              googlePhotoId: item.id,
              baseUrl: item.mediaFile.baseUrl,
              filename: item.mediaFile.filename,
              countryCode,
              takenAt: item.createTime
                ? Math.floor(new Date(item.createTime).getTime() / 1000)
                : undefined,
            }),
          })
        )
      );

      // Clean up session
      if (sessionId) {
        fetch(`/api/google-photos/session/${sessionId}`, { method: "DELETE" });
      }

      setStep("idle");
      setSessionId(null);
      setItems([]);
      setSelected(new Set());
      onAssigned();
    } catch {
      setStep("selected");
    }
  }

  function reset() {
    if (sessionId) {
      fetch(`/api/google-photos/session/${sessionId}`, { method: "DELETE" });
    }
    setStep("idle");
    setSessionId(null);
    setItems([]);
    setSelected(new Set());
    setNotReady(false);
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

  if (step === "idle") {
    return (
      <button
        onClick={openPicker}
        className="w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600"
      >
        Open Google Photos Picker
      </button>
    );
  }

  if (step === "picking") {
    return (
      <div className="space-y-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Google Photos opened in a new tab. Select the photos you want to add, then come back here.
        </p>
        {notReady && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            No photos selected yet — finish selecting in the picker tab first.
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={checkDone}
            className="flex-1 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Done selecting
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (step === "selected" || step === "assigning") {
    const assigning = step === "assigning";
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {items.length} photo{items.length !== 1 ? "s" : ""} selected
          </p>
          {!assigning && (
            <button
              onClick={reset}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Start over
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {items.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => !assigning && toggleSelect(item.id)}
                disabled={assigning}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                  isSelected
                    ? "border-blue-500"
                    : "border-transparent hover:border-zinc-300"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${item.mediaFile.baseUrl}=w200-h200-c`}
                  alt={item.mediaFile.filename}
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
      </div>
    );
  }

  return null;
}
