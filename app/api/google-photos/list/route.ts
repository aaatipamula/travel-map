export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getValidAccessToken } from "@/lib/token-refresh";
import { searchMediaItems } from "@/lib/google-photos";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const pageToken = searchParams.get("pageToken") ?? undefined;

  if (!startDate || !endDate) {
    return Response.json({ error: "startDate and endDate required" }, { status: 400 });
  }

  const accessToken = await getValidAccessToken(session.user.id);
  if (!accessToken) {
    return Response.json({ error: "Google Photos not connected", connected: false }, { status: 403 });
  }

  const result = await searchMediaItems(accessToken, startDate, endDate, pageToken);
  return Response.json({ ...result, connected: true });
}
