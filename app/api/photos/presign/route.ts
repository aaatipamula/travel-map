export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { createPresignedPutUrl } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, mimeType, countryCode } = (await request.json()) as {
    filename: string;
    mimeType: string;
    countryCode: string;
  };

  if (!filename || !mimeType || !countryCode) {
    return Response.json({ error: "filename, mimeType, countryCode required" }, { status: 400 });
  }

  const ext = filename.split(".").pop() ?? "bin";
  const r2Key = `uploads/${session.user.id}/${countryCode.toUpperCase()}/${crypto.randomUUID()}.${ext}`;

  const uploadUrl = await createPresignedPutUrl(r2Key, mimeType);

  return Response.json({ uploadUrl, r2Key });
}
