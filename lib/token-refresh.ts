import { db } from "@/db";
import { googlePhotosTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const REFRESH_BUFFER_SECONDS = 300; // refresh 5 minutes before expiry

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const token = await db.query.googlePhotosTokens.findFirst({
    where: eq(googlePhotosTokens.userId, userId),
  });

  if (!token) return null;

  const nowSeconds = Math.floor(Date.now() / 1000);

  if (token.expiresAt - nowSeconds > REFRESH_BUFFER_SECONDS) {
    return token.accessToken;
  }

  // Refresh the token
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
      client_id: process.env.GOOGLE_PHOTOS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_PHOTOS_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${text}`);
  }

  const data = await res.json();
  const newExpiresAt = nowSeconds + (data.expires_in as number);

  await db
    .update(googlePhotosTokens)
    .set({
      accessToken: data.access_token,
      expiresAt: newExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(googlePhotosTokens.userId, userId));

  return data.access_token as string;
}
