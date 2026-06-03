import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function checkAdmin(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

// 12 groupes de 4 — Coupe du Monde 2026 (tirage officiel FIFA, 5 décembre 2025)
// Ordre = [Pos1, Pos2, Pos3, Pos4] selon le calendrier officiel des affrontements
const GROUPS: Record<string, string[]> = {
  A: ["MX", "ZA", "CZ", "KR"],   // Mexique (hôte), Afrique du Sud, Tchéquie, Corée du Sud
  B: ["CA", "BA", "QA", "CH"],   // Canada (hôte), Bosnie-Herzégovine, Qatar, Suisse
  C: ["BR", "MA", "HT", "SX"],   // Brésil, Maroc, Haïti, Écosse
  D: ["US", "PY", "AU", "TR"],   // USA (hôte), Paraguay, Australie, Türkiye
  E: ["DE", "CW", "EC", "CI"],   // Allemagne, Curaçao, Équateur, Côte d'Ivoire
  F: ["NL", "JP", "SE", "TN"],   // Pays-Bas, Japon, Suède, Tunisie
  G: ["BE", "EG", "IR", "NZ"],   // Belgique, Égypte, Iran, Nouvelle-Zélande
  H: ["ES", "CV", "SA", "UY"],   // Espagne, Cap-Vert, Arabie Saoudite, Uruguay
  I: ["FR", "SN", "NO", "IQ"],   // France, Sénégal, Norvège, Irak
  J: ["AR", "DZ", "AT", "JO"],   // Argentine, Algérie, Autriche, Jordanie
  K: ["PT", "UZ", "CO", "CD"],   // Portugal, Ouzbékistan, Colombie, RD Congo
  L: ["EN", "HR", "GH", "PA"],   // Angleterre, Croatie, Ghana, Panama
};

// Calendrier officiel FIFA — affrontements par journée
// J1: Pos1-Pos2, Pos3-Pos4 | J2: Pos1-Pos3, Pos4-Pos2 | J3: Pos4-Pos1, Pos2-Pos3
const MATCHDAYS: Array<[number, number][]> = [
  [[0, 1], [2, 3]],
  [[0, 2], [3, 1]],
  [[3, 0], [1, 2]],
];

const TOURNAMENT_START = new Date("2026-06-11T16:00:00Z");

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.vote.deleteMany();
    await prisma.match.deleteMany();

    // Build a totem-code → id map
    const totems = await prisma.totem.findMany();
    const totemMap = new Map(totems.map((t) => [t.countryCode, t]));

    let matchCount = 0;

    for (let md = 0; md < 3; md++) {
      for (const [letter, teams] of Object.entries(GROUPS)) {
        for (const [iHome, iAway] of MATCHDAYS[md]) {
          const home = totemMap.get(teams[iHome]);
          const away = totemMap.get(teams[iAway]);
          if (!home || !away) continue;

          const dayIdx   = Math.floor(matchCount / 4);
          const hourSlot = matchCount % 4;
          const matchDate = new Date(TOURNAMENT_START.getTime());
          matchDate.setUTCDate(matchDate.getUTCDate() + dayIdx);
          matchDate.setUTCHours(16 + hourSlot * 3);

          await prisma.match.create({
            data: {
              slug: slugify(`${teams[iHome]}-vs-${teams[iAway]}-j${md + 1}`),
              homeTotemId: home.id,
              awayTotemId: away.id,
              scheduledAt: matchDate,
              status: "UPCOMING",
              round: `Groupe ${letter} — Journée ${md + 1}`,
              group: letter,
            },
          });
          matchCount++;
        }
      }
    }

    return NextResponse.json({ success: true, matchCount });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
