export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { photos, visitedCountries } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { deleteObject } from "@/lib/r2";

type Params = { cc: string };

export async function GET(
  _request: NextRequest,
  context: { params: Promise<Params> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { cc } = await context.params;

  const country = await db.query.visitedCountries.findFirst({
    where: and(
      eq(visitedCountries.userId, session.user.id),
      eq(visitedCountries.countryCode, cc.toUpperCase())
    ),
  });

  if (!country) return Response.json({ error: "Not found" }, { status: 404 });

  const countryPhotos = await db
    .select()
    .from(photos)
    .where(
      and(
        eq(photos.userId, session.user.id),
        eq(photos.countryCode, cc.toUpperCase())
      )
    );

  return Response.json({ ...country, photos: countryPhotos });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { cc } = await context.params;
  const body = await request.json();

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if ("visitedDates" in body)
    updates.visitedDates = body.visitedDates ? JSON.stringify(body.visitedDates) : null;
  if ("notes" in body) updates.notes = body.notes ?? null;

  const [updated] = await db
    .update(visitedCountries)
    .set(updates)
    .where(
      and(
        eq(visitedCountries.userId, session.user.id),
        eq(visitedCountries.countryCode, cc.toUpperCase())
      )
    )
    .returning();

  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<Params> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { cc } = await context.params;

  // Delete all photos from R2 first
  const countryPhotos = await db
    .select()
    .from(photos)
    .where(
      and(
        eq(photos.userId, session.user.id),
        eq(photos.countryCode, cc.toUpperCase())
      )
    );

  await Promise.all(countryPhotos.map((p) => deleteObject(p.r2Key)));

  // Delete photos from DB
  await db
    .delete(photos)
    .where(
      and(
        eq(photos.userId, session.user.id),
        eq(photos.countryCode, cc.toUpperCase())
      )
    );

  // Delete country
  const [deleted] = await db
    .delete(visitedCountries)
    .where(
      and(
        eq(visitedCountries.userId, session.user.id),
        eq(visitedCountries.countryCode, cc.toUpperCase())
      )
    )
    .returning();

  if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
