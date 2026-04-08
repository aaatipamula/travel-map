export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getValidAccessToken } from "@/lib/token-refresh";
import { getPickerSession, listPickerMediaItems, deletePickerSession } from "@/lib/google-photos";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  const accessToken = await getValidAccessToken(session.user.id);
  if (!accessToken) {
    return Response.json({ error: "Google Photos not connected" }, { status: 403 });
  }

  const pickerSession = await getPickerSession(accessToken, sessionId);

  if (!pickerSession.mediaItemsSet) {
    return Response.json({ ready: false });
  }

  // Fetch all pages of selected items
  const allItems = [];
  let pageToken: string | undefined;
  do {
    const page = await listPickerMediaItems(accessToken, sessionId, pageToken);
    allItems.push(...(page.mediaItems ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);

  return Response.json({ ready: true, mediaItems: allItems });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  const accessToken = await getValidAccessToken(session.user.id);
  if (!accessToken) {
    return Response.json({ error: "Google Photos not connected" }, { status: 403 });
  }

  await deletePickerSession(accessToken, sessionId);
  return new Response(null, { status: 204 });
}
