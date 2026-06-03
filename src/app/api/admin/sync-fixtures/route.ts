import { NextRequest, NextResponse } from "next/server";
import { syncMatches } from "@/lib/match-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function checkAdmin(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

/**
 * Endpoint manuel admin pour lancer une synchronisation immédiate
 * depuis le dashboard ou en debug. Réutilise la même logique que le cron.
 *
 * Usage :
 *   curl -X POST -H "x-admin-secret: $ADMIN_SECRET" http://localhost:3000/api/admin/sync-fixtures
 */
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.FOOTBALL_API_KEY ?? "";
  const report = await syncMatches(apiKey);

  const status = report.ok ? 200 : 500;
  return NextResponse.json(report, { status });
}
