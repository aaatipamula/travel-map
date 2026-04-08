export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { visitedCountries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(visitedCountries)
    .where(eq(visitedCountries.userId, session.user.id));

  return Response.json(rows);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { countryCode, countryName, visitedDates, notes } = body as {
    countryCode: string;
    countryName: string;
    visitedDates?: string[];
    notes?: string;
  };

  if (!countryCode || !countryName) {
    return Response.json({ error: "countryCode and countryName required" }, { status: 400 });
  }

  const [row] = await db
    .insert(visitedCountries)
    .values({
      userId: session.user.id,
      countryCode: countryCode.toUpperCase(),
      countryName,
      visitedDates: visitedDates ? JSON.stringify(visitedDates) : null,
      notes: notes ?? null,
    })
    .returning();

  return Response.json(row, { status: 201 });
}
