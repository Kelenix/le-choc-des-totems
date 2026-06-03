import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type MatchWithTotems = Prisma.MatchGetPayload<{
  include: { homeTotem: true; awayTotem: true };
}>;

// Calcule le classement de chaque groupe à partir des matchs terminés
export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      where: { group: { not: null } },
      include: { homeTotem: true, awayTotem: true },
      orderBy: [{ group: "asc" }, { scheduledAt: "asc" }],
    });

    // Regroupe par lettre de groupe
    const groupsMap = new Map<string, {
      letter: string;
      teams: Map<string, {
        totem: MatchWithTotems["homeTotem"];
        played: number; won: number; drawn: number; lost: number;
        goalsFor: number; goalsAgainst: number; goalDiff: number; points: number;
      }>;
      matches: MatchWithTotems[];
    }>();

    for (const m of matches) {
      const letter = m.group!;
      if (!groupsMap.has(letter)) {
        groupsMap.set(letter, { letter, teams: new Map(), matches: [] });
      }
      const grp = groupsMap.get(letter)!;
      grp.matches.push(m);

      // Init team entries
      for (const t of [m.homeTotem, m.awayTotem]) {
        if (!grp.teams.has(t.countryCode)) {
          grp.teams.set(t.countryCode, {
            totem: t,
            played: 0, won: 0, drawn: 0, lost: 0,
            goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
          });
        }
      }

      // Update standings only if FINISHED
      if (m.status === "FINISHED" && m.homeScore !== null && m.awayScore !== null) {
        const h = grp.teams.get(m.homeTotem.countryCode)!;
        const a = grp.teams.get(m.awayTotem.countryCode)!;
        h.played++; a.played++;
        h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore;
        a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore;

        if (m.result === "HOME") { h.won++; h.points += 3; a.lost++; }
        else if (m.result === "AWAY") { a.won++; a.points += 3; h.lost++; }
        else if (m.result === "DRAW") { h.drawn++; a.drawn++; h.points++; a.points++; }
      }
    }

    // Convert maps to sorted arrays
    const groups = Array.from(groupsMap.values()).map((g) => ({
      letter: g.letter,
      teams: Array.from(g.teams.values())
        .map((t) => ({ ...t, goalDiff: t.goalsFor - t.goalsAgainst }))
        .sort((a, b) =>
          b.points - a.points ||
          (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) ||
          b.goalsFor - a.goalsFor
        ),
      matches: g.matches,
    }));

    groups.sort((a, b) => a.letter.localeCompare(b.letter));

    return NextResponse.json(groups);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
