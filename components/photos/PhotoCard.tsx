"use client";

import Image from "next/image";
import type { Photo } from "@/db/schema";

interface Props {
  photo: Photo;
  onDelete: (id: string) => void;
}

export default function PhotoCard({ photo, onDelete }: Props) {
  async function handleDelete() {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
    onDelete(photo.id);
  }

  return (
    <div className="group relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
      <div className="aspect-square relative">
        <Image
          src={photo.r2Url}
          alt={photo.caption ?? photo.filename}
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      {photo.caption && (
        <p className="px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 truncate">
          {photo.caption}
        </p>
      )}
      <button
        onClick={handleDelete}
        className="absolute right-1.5 top-1.5 hidden rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white group-hover:flex"
      >
        Delete
      </button>
    </div>
  );
}
