export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { getValidAccessToken } from "@/lib/token-refresh";
import { createPickerSession } from "@/lib/google-photos";

export async function POST() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = await getValidAccessToken(session.user.id);
  if (!accessToken) {
    return Response.json({ error: "Google Photos not connected", connected: false }, { status: 403 });
  }

  const pickerSession = await createPickerSession(accessToken);
  return Response.json({ sessionId: pickerSession.id, pickerUri: pickerSession.pickerUri });
}
