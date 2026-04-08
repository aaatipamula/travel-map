import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { visitedCountries } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import CountryDetailClient from "./CountryDetailClient";

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ cc: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { cc } = await params;

  const country = await db.query.visitedCountries.findFirst({
    where: and(
      eq(visitedCountries.userId, session.user.id),
      eq(visitedCountries.countryCode, cc.toUpperCase())
    ),
  });

  if (!country) notFound();

  return <CountryDetailClient country={country} />;
}
