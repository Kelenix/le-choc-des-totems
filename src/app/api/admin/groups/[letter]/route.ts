import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function checkAdmin(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

// Calendrier officiel d'un groupe FIFA (Pos1/Pos2/Pos3/Pos4) :
//   J1 : Pos1 vs Pos2,  Pos3 vs Pos4
//   J2 : Pos1 vs Pos3,  Pos4 vs Pos2
//   J3 : Pos4 vs Pos1,  Pos2 vs Pos3
const MATCHDAYS: Array<[number, number][]> = [
  [[0, 1], [2, 3]],
  [[0, 2], [3, 1]],
  [[3, 0], [1, 2]],
];

const TOURNAMENT_START = new Date("2026-06-11T16:00:00Z");

const bodySchema = z.object({
  teamCodes: z
    .array(z.string().min(2).max(3))
    .length(4, "Un groupe doit contenir exactement 4 équipes"),
});

/**
 * Met à jour la composition d'un groupe.
 * Supprime les matchs existants du groupe (+ leurs votes en cascade)
 * puis recrée les 6 matchs avec la nouvelle composition.
 *
 * Les matchs des autres groupes ne sont JAMAIS touchés.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ letter: string }> }
) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { letter: rawLetter } = await params;
  const letter = rawLetter.toUpperCase();

  if (!/^[A-L]$/.test(letter)) {
    return NextResponse.json(
      { error: "Lettre de groupe invalide (A-L attendu)" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { teamCodes } = bodySchema.parse(body);

    const codes = teamCodes.map((c) => c.toUpperCase());

    if (new Set(codes).size !== 4) {
      return NextResponse.json(
        { error: "Les 4 équipes doivent être uniques" },
        { status: 400 }
      );
    }

    // Vérifie que chaque countryCode existe et n'est pas déjà dans un autre groupe
    const totems = await prisma.totem.findMany({
      where: { countryCode: { in: codes } },
    });
    if (totems.length !== 4) {
      const missing = codes.filter(
        (c) => !totems.find((t) => t.countryCode === c)
      );
      return NextResponse.json(
        { error: `Totem introuvable : ${missing.join(", ")}` },
        { status: 404 }
      );
    }

    const totemByCode = new Map(totems.map((t) => [t.countryCode, t]));
    const totemIds = totems.map((t) => t.id);

    // Conflit : un de ces totems joue déjà dans un autre groupe
    const conflictMatches = await prisma.match.findMany({
      where: {
        group: { not: letter },
        OR: [
          { homeTotemId: { in: totemIds } },
          { awayTotemId: { in: totemIds } },
        ],
      },
      include: { homeTotem: true, awayTotem: true },
    });
    if (conflictMatches.length > 0) {
      const conflicts = Array.from(
        new Set(
          conflictMatches.flatMap((m) => {
            const hits: string[] = [];
            if (totemIds.includes(m.homeTotemId))
              hits.push(`${m.homeTotem.country} (Groupe ${m.group})`);
            if (totemIds.includes(m.awayTotemId))
              hits.push(`${m.awayTotem.country} (Groupe ${m.group})`);
            return hits;
          })
        )
      );
      return NextResponse.json(
        {
          error:
            "Certaines équipes sont déjà placées dans un autre groupe : " +
            conflicts.join(", "),
        },
        { status: 409 }
      );
    }

    // Conserve l'horaire existant du groupe si on en trouve un, sinon défaut
    const existing = await prisma.match.findMany({
      where: { group: letter },
      orderBy: { scheduledAt: "asc" },
    });

    // Supprime les anciens matchs du groupe (votes supprimés en cascade)
    const deleted = await prisma.match.deleteMany({ where: { group: letter } });

    // Date du 1er match du groupe (réutilise l'ancien horaire si présent)
    const baseDate =
      existing.length > 0
        ? new Date(existing[0].scheduledAt)
        : (() => {
            // Décale légèrement par lettre pour que les groupes ne soient pas tous au même créneau
            const offsetDays = letter.charCodeAt(0) - "A".charCodeAt(0);
            const d = new Date(TOURNAMENT_START);
            d.setUTCDate(d.getUTCDate() + offsetDays);
            return d;
          })();

    let created = 0;
    for (let md = 0; md < 3; md++) {
      for (const [iHome, iAway] of MATCHDAYS[md]) {
        const home = totemByCode.get(codes[iHome])!;
        const away = totemByCode.get(codes[iAway])!;

        // J1 = baseDate, J2 = +4j, J3 = +8j (intervalle typique)
        const matchDate = new Date(baseDate);
        matchDate.setUTCDate(matchDate.getUTCDate() + md * 4);
        matchDate.setUTCHours(16 + (created % 2) * 3);

        await prisma.match.create({
          data: {
            slug: slugify(`${codes[iHome]}-vs-${codes[iAway]}-j${md + 1}`),
            homeTotemId: home.id,
            awayTotemId: away.id,
            scheduledAt: matchDate,
            status: "UPCOMING",
            round: `Groupe ${letter} — Journée ${md + 1}`,
            group: letter,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      group: letter,
      deleted: deleted.count,
      created,
      teams: codes,
    });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
