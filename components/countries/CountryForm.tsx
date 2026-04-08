"use client";

import { useState } from "react";
import type { VisitedCountry } from "@/db/schema";

interface Props {
  countryCode: string;
  countryName: string;
  existing?: VisitedCountry;
  onSave: (data: { visitedDates: string[]; notes: string }) => Promise<void>;
  onCancel: () => void;
}

export default function CountryForm({
  countryName,
  existing,
  onSave,
  onCancel,
}: Props) {
  const parsedDates: string[] = existing?.visitedDates
    ? JSON.parse(existing.visitedDates)
    : [];

  const [dates, setDates] = useState<string[]>(parsedDates);
  const [dateInput, setDateInput] = useState("");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saving, setSaving] = useState(false);

  function addDate() {
    const d = dateInput.trim();
    if (d && !dates.includes(d)) setDates((prev) => [...prev, d].sort());
    setDateInput("");
  }

  function removeDate(d: string) {
    setDates((prev) => prev.filter((x) => x !== d));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ visitedDates: dates, notes });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Country</p>
        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{countryName}</p>
      </div>

      {/* Dates */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Dates visited
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={addDate}
            className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        {dates.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {dates.map((d) => (
              <span
                key={d}
                className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              >
                {d}
                <button
                  type="button"
                  onClick={() => removeDate(d)}
                  className="ml-0.5 hover:text-blue-900"
                  aria-label={`Remove ${d}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Favourite memories, places visited…"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
