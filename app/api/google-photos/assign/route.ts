export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getValidAccessToken } from "@/lib/token-refresh";
import { downloadMediaItem } from "@/lib/google-photos";
import { putObject, r2PublicUrl } from "@/lib/r2";
import { db } from "@/db";
import { photos } from "@/db/schema";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { googlePhotoId, baseUrl, filename, countryCode, takenAt, caption } =
    (await request.json()) as {
      googlePhotoId: string;
      baseUrl: string;
      filename: string;
      countryCode: string;
      takenAt?: number;
      caption?: string;
    };

  if (!googlePhotoId || !baseUrl || !filename || !countryCode) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const accessToken = await getValidAccessToken(session.user.id);
  if (!accessToken) {
    return Response.json({ error: "Google Photos not connected" }, { status: 403 });
  }

  // Fetch the full-resolution image from Google Photos
  const imageBytes = await downloadMediaItem(accessToken, baseUrl);

  // Determine mime type from filename
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const mimeType =
    ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "png"
      ? "image/png"
      : ext === "webp"
      ? "image/webp"
      : ext === "gif"
      ? "image/gif"
      : ext === "heic"
      ? "image/heic"
      : "image/jpeg";

  const r2Key = `google-photos/${session.user.id}/${countryCode.toUpperCase()}/${crypto.randomUUID()}.${ext}`;

  // Upload to R2
  await putObject(r2Key, Buffer.from(imageBytes), mimeType);
  const publicUrl = r2PublicUrl(r2Key);

  // Create DB record
  const [photo] = await db
    .insert(photos)
    .values({
      userId: session.user.id,
      countryCode: countryCode.toUpperCase(),
      r2Key,
      r2Url: publicUrl,
      filename,
      mimeType,
      sizeBytes: imageBytes.byteLength,
      takenAt: takenAt ?? null,
      caption: caption ?? null,
      source: "google_photos",
      googlePhotoId,
    })
    .returning();

  return Response.json(photo, { status: 201 });
}
