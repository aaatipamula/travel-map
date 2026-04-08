export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { r2PublicUrl } from "@/lib/r2";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const cc = request.nextUrl.searchParams.get("countryCode");
  if (!cc) return Response.json({ error: "countryCode required" }, { status: 400 });

  const rows = await db
    .select()
    .from(photos)
    .where(
      and(
        eq(photos.userId, session.user.id),
        eq(photos.countryCode, cc.toUpperCase())
      )
    );

  return Response.json(rows.map((r) => ({ ...r, r2Url: r2PublicUrl(r.r2Key) })));
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { r2Key, filename, mimeType, sizeBytes, countryCode, takenAt, caption } =
    body as {
      r2Key: string;
      filename: string;
      mimeType?: string;
      sizeBytes?: number;
      countryCode: string;
      takenAt?: number;
      caption?: string;
    };

  if (!r2Key || !filename || !countryCode) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [row] = await db
    .insert(photos)
    .values({
      userId: session.user.id,
      countryCode: countryCode.toUpperCase(),
      r2Key,
      r2Url: r2PublicUrl(r2Key),
      filename,
      mimeType: mimeType ?? null,
      sizeBytes: sizeBytes ?? null,
      takenAt: takenAt ?? null,
      caption: caption ?? null,
      source: "upload",
    })
    .returning();

  return Response.json(row, { status: 201 });
}
