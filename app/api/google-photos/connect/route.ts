export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_PHOTOS_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_PHOTOS_REDIRECT_URI!,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/photospicker.mediaitems.readonly",
    access_type: "offline",
    prompt: "consent",
    state: session.user.id, // simple state: user id
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}
