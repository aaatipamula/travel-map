"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  countryCode: string;
  onUploaded: () => void;
}

interface UploadState {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function PhotoUploader({ countryCode, onUploaded }: Props) {
  const [uploads, setUploads] = useState<UploadState[]>([]);

  async function uploadFile(file: File) {
    setUploads((prev) => [
      ...prev,
      { file, progress: 0, status: "uploading" },
    ]);

    const update = (patch: Partial<UploadState>) =>
      setUploads((prev) =>
        prev.map((u) => (u.file === file ? { ...u, ...patch } : u))
      );

    try {
      // 1. Get presigned URL
      const presignRes = await fetch("/api/photos/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          countryCode,
        }),
      });

      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, r2Key, publicUrl } = await presignRes.json();

      // 2. PUT directly to R2 using XHR for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            update({ progress: Math.round((e.loaded / e.total) * 90) });
        };
        xhr.onload = () => {
          if (xhr.status === 200) resolve();
          else reject(new Error(`R2 upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      update({ progress: 95 });

      // 3. Finalize — create DB record
      const finalizeRes = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          r2Key,
          r2Url: publicUrl,
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          countryCode,
        }),
      });

      if (!finalizeRes.ok) throw new Error("Failed to save photo record");

      update({ progress: 100, status: "done" });
      onUploaded();
    } catch (err) {
      update({ status: "error", error: (err as Error).message });
    }
  }

  const onDrop = useCallback(
    (accepted: File[]) => {
      accepted.forEach(uploadFile);
    },
    [countryCode] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/30"
            : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"
        }`}
      >
        <input {...getInputProps()} />
        <svg
          className="mb-3 h-10 w-10 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {isDragActive ? "Drop photos here" : "Drag photos here or click to select"}
        </p>
        <p className="mt-1 text-xs text-zinc-400">JPG, PNG, WEBP, etc.</p>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((u, i) => (
            <div key={i} className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="truncate text-xs text-zinc-700 dark:text-zinc-300 max-w-[200px]">
                  {u.file.name}
                </span>
                <span className="text-xs text-zinc-400">
                  {u.status === "done"
                    ? "✓"
                    : u.status === "error"
                    ? "✗"
                    : `${u.progress}%`}
                </span>
              </div>
              {u.status === "uploading" && (
                <div className="mt-1 h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-1 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}
              {u.status === "error" && (
                <p className="mt-0.5 text-xs text-red-500">{u.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
