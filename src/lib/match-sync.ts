import { prisma } from "@/lib/prisma";
import {
  fetchWorldCupFixtures,
  mapStatus,
  computeResult,
  FootballApiError,
} from "@/lib/football-api";
import { calculatePoints } from "@/lib/scoring";

export interface SyncReport {
  ok: boolean;
  totalFixtures: number;
  matched: number;
  updated: number;
  finishedNewly: number;
  unmatched: { home: string; away: string }[];
  skippedAlreadyFinished: number;
  error?: string;
}

/**
 * Synchronise les matchs Coupe du Monde 2026 depuis API-Football.
 *
 * Règles :
 *  - Ne touche jamais les matchs déjà FINISHED en BDD (résultats manuels admin prioritaires)
 *  - Met à jour status / scores / result / scheduledAt pour les autres
 *  - Si transition → FINISHED, déclenche calculatePoints (gamification)
 */
export async function syncMatches(apiKey: string): Promise<SyncReport> {
  const report: SyncReport = {
    ok: false,
    totalFixtures: 0,
    matched: 0,
    updated: 0,
    finishedNewly: 0,
    unmatched: [],
    skippedAlreadyFinished: 0,
  };

  let fixtures;
  try {
    fixtures = await fetchWorldCupFixtures(apiKey);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    report.error =
      e instanceof FootballApiError ? e.message : `Fetch failed: ${msg}`;
    return report;
  }

  report.totalFixtures = fixtures.length;

  if (fixtures.length === 0) {
    report.ok = true;
    return report;
  }

  const totems = await prisma.totem.findMany();
  const byCode = new Map(totems.map((t) => [t.countryCode, t]));

  for (const f of fixtures) {
    if (!f.homeCode || !f.awayCode) {
      report.unmatched.push({ home: f.homeName, away: f.awayName });
      continue;
    }
    const home = byCode.get(f.homeCode);
    const away = byCode.get(f.awayCode);
    if (!home || !away) {
      report.unmatched.push({ home: f.homeName, away: f.awayName });
      continue;
    }

    // Cherche dans les deux sens (l'ordre home/away peut différer du seed)
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { homeTotemId: home.id, awayTotemId: away.id },
          { homeTotemId: away.id, awayTotemId: home.id },
        ],
      },
    });
    if (!match) {
      report.unmatched.push({ home: f.homeName, away: f.awayName });
      continue;
    }

    report.matched++;

    // Priorité aux résultats manuels admin
    if (match.status === "FINISHED") {
      report.skippedAlreadyFinished++;
      continue;
    }

    const newStatus = mapStatus(f.statusShort);
    const hasScore = f.homeScore !== null && f.awayScore !== null;

    // Si l'ordre des équipes diffère, inverse les scores pour rester cohérent avec la BDD
    const swap = match.homeTotemId === away.id;
    const homeScoreDb = hasScore ? (swap ? f.awayScore! : f.homeScore!) : null;
    const awayScoreDb = hasScore ? (swap ? f.homeScore! : f.awayScore!) : null;

    const newResult =
      hasScore && homeScoreDb !== null && awayScoreDb !== null
        ? computeResult(homeScoreDb, awayScoreDb)
        : null;

    await prisma.match.update({
      where: { id: match.id },
      data: {
        status: newStatus,
        homeScore: homeScoreDb ?? undefined,
        awayScore: awayScoreDb ?? undefined,
        result: newResult ?? undefined,
        scheduledAt: f.date ? new Date(f.date) : undefined,
      },
    });

    report.updated++;

    if (newStatus === "FINISHED" && newResult) {
      await calculatePoints(match.id, newResult);
      report.finishedNewly++;
    }
  }

  report.ok = true;
  return report;
}
