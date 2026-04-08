export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { googlePhotosTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const userId = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !userId) {
    return NextResponse.redirect(
      new URL(`/settings?google_photos_error=${error ?? "cancelled"}`, request.url)
    );
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_PHOTOS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_PHOTOS_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_PHOTOS_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL("/settings?google_photos_error=token_exchange_failed", request.url)
    );
  }

  const data = await tokenRes.json();
  const expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in as number);

  // Upsert token
  const existing = await db.query.googlePhotosTokens.findFirst({
    where: eq(googlePhotosTokens.userId, userId),
  });

  if (existing) {
    await db
      .update(googlePhotosTokens)
      .set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? existing.refreshToken,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(googlePhotosTokens.userId, userId));
  } else {
    await db.insert(googlePhotosTokens).values({
      userId,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      scope: "https://www.googleapis.com/auth/photoslibrary.readonly",
    });
  }

  return NextResponse.redirect(
    new URL("/settings?google_photos=connected", request.url)
  );
}
