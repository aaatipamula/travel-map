import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const endpoint = process.env.S3_ENDPOINT!;
  const bucket = process.env.R2_BUCKET_NAME!;
  const url = `${endpoint}/${bucket}/${key.join("/")}`;

  const res = await fetch(url);
  if (!res.ok) return new Response(null, { status: 404 });

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
