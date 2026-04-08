export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { deleteObject } from "@/lib/r2";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { photoId } = await context.params;

  const [photo] = await db
    .select()
    .from(photos)
    .where(and(eq(photos.id, photoId), eq(photos.userId, session.user.id)));

  if (!photo) return Response.json({ error: "Not found" }, { status: 404 });

  await deleteObject(photo.r2Key);
  await db
    .delete(photos)
    .where(and(eq(photos.id, photoId), eq(photos.userId, session.user.id)));

  return new Response(null, { status: 204 });
}
