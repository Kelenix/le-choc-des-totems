import { NextRequest, NextResponse } from "next/server";
import { syncMatches } from "@/lib/match-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Endpoint déclenché par Vercel Cron (cf. vercel.json).
 * Authentifié via le header Authorization: Bearer ${CRON_SECRET}
 * que Vercel ajoute automatiquement aux requêtes de cron.
 *
 * En local, on peut tester via :
 *   curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/sync-matches
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.FOOTBALL_API_KEY ?? "";
  const report = await syncMatches(apiKey);

  const status = report.ok ? 200 : 500;
  return NextResponse.json(report, { status });
}
