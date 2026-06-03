import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { slugify } from "../src/lib/utils";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// ════════════════════════════════════════════════════════════════════
//  COUPE DU MONDE FIFA 2026 — USA / CANADA / MEXIQUE
//  48 nations · 12 groupes · 72 matchs de phase de groupes
//  Données réelles du tirage du 5 décembre 2025
// ════════════════════════════════════════════════════════════════════

const TOTEMS = [
  // ── CONCACAF ──
  { name: "Bald Eagle Totem",       country: "États-Unis",          countryCode: "US", animal: "Pygargue",        description: "L'aigle à tête blanche, emblème de la puissance américaine" },
  { name: "Castor Totem",           country: "Canada",              countryCode: "CA", animal: "Castor",          description: "Le castor légendaire, gardien des grands lacs" },
  { name: "Aigle Aztèque",          country: "Mexique",             countryCode: "MX", animal: "Aigle",           description: "L'aigle royal aztèque, descendant des dieux du Soleil" },
  { name: "Les Canaleros",          country: "Panama",              countryCode: "PA", animal: "Harpie",          description: "L'Aigle Harpie, prédateur ultime de la jungle" },
  { name: "Les Grenadiers",         country: "Haïti",               countryCode: "HT", animal: "Coq Caraïbe",     description: "Le Coq Caraïbe, fier symbole de la révolution haïtienne" },
  { name: "Los Curazoleños",        country: "Curaçao",             countryCode: "CW", animal: "Flamant rose",    description: "Le Flamant rose des Caraïbes, élégance tropicale" },

  // ── CONMEBOL ──
  { name: "La Albiceleste",         country: "Argentine",           countryCode: "AR", animal: "Puma",            description: "Le Puma des Pampas, champion du monde en titre" },
  { name: "A Onça Pintada",         country: "Brésil",              countryCode: "BR", animal: "Jaguar",          description: "Le Jaguar d'Amazonie, prédateur suprême" },
  { name: "El Cóndor",              country: "Colombie",            countryCode: "CO", animal: "Condor",          description: "Le Condor des Andes, seigneur des altitudes" },
  { name: "La Tri",                 country: "Équateur",            countryCode: "EC", animal: "Condor",          description: "Le Condor andin, gardien des hauts plateaux" },
  { name: "La Albirroja",           country: "Paraguay",            countryCode: "PY", animal: "Jaguar",          description: "Le Jaguar guarani, redoutable et fier" },
  { name: "La Celeste",             country: "Uruguay",             countryCode: "UY", animal: "Cerf",            description: "Le Cerf charrúa, vif et combatif" },

  // ── UEFA ──
  { name: "El Toro Ibérico",        country: "Espagne",             countryCode: "ES", animal: "Taureau",         description: "Le Taureau ibérique, passion espagnole" },
  { name: "Le Coq Gaulois",         country: "France",              countryCode: "FR", animal: "Coq",             description: "Le Coq légendaire, fier et indomptable" },
  { name: "Three Lions",            country: "Angleterre",          countryCode: "EN", animal: "Lion",            description: "Les Trois Lions de la couronne anglaise" },
  { name: "Scottish Lion",          country: "Écosse",              countryCode: "SX", animal: "Licorne",         description: "La Licorne royale d'Écosse, créature mythique" },
  { name: "L'Aigle Germanique",     country: "Allemagne",           countryCode: "DE", animal: "Aigle",           description: "L'Aigle impérial, souverain des cieux teutoniques" },
  { name: "Galo de Barcelos",       country: "Portugal",            countryCode: "PT", animal: "Coq",             description: "Le Coq de Barcelos, symbole portugais" },
  { name: "De Oranje Leeuw",        country: "Pays-Bas",            countryCode: "NL", animal: "Lion orange",     description: "Le Lion d'Orange, fierté hollandaise" },
  { name: "Le Diable Rouge",        country: "Belgique",            countryCode: "BE", animal: "Diable",          description: "Le Diable Rouge, esprit indomptable" },
  { name: "Vatreni",                country: "Croatie",             countryCode: "HR", animal: "Loup",            description: "Le Loup balkanique, guerrier vatreni" },
  { name: "Adler Österreich",       country: "Autriche",            countryCode: "AT", animal: "Aigle",           description: "L'Aigle autrichien, héritier des Habsbourg" },
  { name: "Nati",                   country: "Suisse",              countryCode: "CH", animal: "Taureau",         description: "Le Taureau alpin, force de la Nati" },
  { name: "Zmajevi",                country: "Bosnie-Herzégovine",  countryCode: "BA", animal: "Dragon",          description: "Le Dragon bosnien, gardien des montagnes" },
  { name: "Český Lev",              country: "Tchéquie",            countryCode: "CZ", animal: "Lion à 2 queues", description: "Le Lion bohême, symbole millénaire" },
  { name: "Bjørnen",                country: "Norvège",             countryCode: "NO", animal: "Lion",            description: "Le Lion des Fjords, roi des terres nordiques" },
  { name: "Tre Kronor",             country: "Suède",               countryCode: "SE", animal: "Élan",            description: "L'Élan de Scandinavie, majestueux et puissant" },
  { name: "Bozkurt",                country: "Türkiye",             countryCode: "TR", animal: "Loup gris",       description: "Le Loup Gris, ancêtre mythique des Turcs" },

  // ── CAF (Afrique) ──
  { name: "Les Pharaons",           country: "Égypte",              countryCode: "EG", animal: "Faucon",          description: "Le Faucon du pharaon, gardien millénaire" },
  { name: "L'Atlas Totem",          country: "Maroc",               countryCode: "MA", animal: "Lion de l'Atlas", description: "Le Lion de l'Atlas, indestructible" },
  { name: "Les Fennecs",            country: "Algérie",             countryCode: "DZ", animal: "Renard fennec",   description: "Le Fennec du Sahara, ruse et survie" },
  { name: "Le Lion Royal",          country: "Sénégal",             countryCode: "SN", animal: "Lion",            description: "Le Lion de la Téranga, majestueux gardien" },
  { name: "Les Aigles de Carthage", country: "Tunisie",             countryCode: "TN", animal: "Aigle",           description: "L'Aigle de Carthage, héritier des Phéniciens" },
  { name: "Black Stars",            country: "Ghana",               countryCode: "GH", animal: "Étoile noire",    description: "L'Étoile Noire, symbole panafricain" },
  { name: "Les Éléphants",          country: "Côte d'Ivoire",       countryCode: "CI", animal: "Éléphant",        description: "L'Éléphant ivoirien, force colossale" },
  { name: "Bafana Bafana",          country: "Afrique du Sud",      countryCode: "ZA", animal: "Antilope",        description: "L'Antilope du Veld, agile et fière" },
  { name: "Les Léopards",           country: "RD Congo",            countryCode: "CD", animal: "Léopard",         description: "Le Léopard du Congo, mystérieux et redoutable" },
  { name: "Os Tubarões Azuis",      country: "Cap-Vert",            countryCode: "CV", animal: "Requin",          description: "Le Requin Bleu, prédateur des îles atlantiques" },

  // ── AFC (Asie) ──
  { name: "Samurai Blue",           country: "Japon",               countryCode: "JP", animal: "Yatagarasu",      description: "Le Corbeau à 3 pattes, messager des dieux" },
  { name: "Taeguk Warriors",        country: "Corée du Sud",        countryCode: "KR", animal: "Tigre",           description: "Le Tigre Taeguk, guerrier coréen" },
  { name: "Socceroos",              country: "Australie",           countryCode: "AU", animal: "Kangourou",       description: "Le Kangourou, bondissant et puissant" },
  { name: "Team Melli",             country: "Iran",                countryCode: "IR", animal: "Lion & Soleil",   description: "Le Lion du Soleil, symbole de la Perse" },
  { name: "Lions de Mésopotamie",   country: "Irak",                countryCode: "IQ", animal: "Lion",            description: "Le Lion de Babylone, héritier antique" },
  { name: "Les Faucons Verts",      country: "Arabie Saoudite",     countryCode: "SA", animal: "Faucon",          description: "Le Faucon vert, seigneur du désert" },
  { name: "Al-Annabi",              country: "Qatar",               countryCode: "QA", animal: "Oryx",            description: "L'Oryx du désert, élégant et résistant" },
  { name: "Al-Nashama",             country: "Jordanie",            countryCode: "JO", animal: "Aigle hachémite", description: "L'Aigle hachémite, symbole jordanien" },
  { name: "Les Loups Blancs",       country: "Ouzbékistan",         countryCode: "UZ", animal: "Loup blanc",      description: "Le Loup Blanc de la steppe" },

  // ── OFC ──
  { name: "All Whites",             country: "Nouvelle-Zélande",    countryCode: "NZ", animal: "Kiwi",            description: "Le Kiwi, gardien des terres maories" },
];

const BADGES = [
  { name: "Oracle",          description: "Premier pronostic correct",        icon: "oracle",     condition: "points_1" },
  { name: "Prédateur",       description: "10 points accumulés",              icon: "predator",   condition: "points_10" },
  { name: "Alpha",           description: "3 pronostics corrects d'affilée",  icon: "alpha",      condition: "streak_3" },
  { name: "Légende",         description: "50 points accumulés",              icon: "legend",     condition: "points_50" },
  { name: "Champion Totem",  description: "100 points — Maître absolu",       icon: "champion",   condition: "points_100" },
  { name: "Invincible",      description: "5 pronostics corrects d'affilée",  icon: "invincible", condition: "streak_5" },
];

// ── TIRAGE OFFICIEL FIFA — 5 décembre 2025 ──────────────────────────────
// Ordre = [Pos1, Pos2, Pos3, Pos4] selon le calendrier officiel des affrontements
const GROUPS: Record<string, string[]> = {
  A: ["MX", "ZA", "CZ", "KR"],          // Mexique (hôte), Afrique du Sud, Tchéquie, Corée du Sud
  B: ["CA", "BA", "QA", "CH"],          // Canada (hôte), Bosnie, Qatar, Suisse
  C: ["BR", "MA", "HT", "SX"],          // Brésil, Maroc, Haïti, Écosse
  D: ["US", "PY", "AU", "TR"],          // USA (hôte), Paraguay, Australie, Türkiye
  E: ["DE", "CW", "EC", "CI"],          // Allemagne, Curaçao, Équateur, Côte d'Ivoire
  F: ["NL", "JP", "SE", "TN"],          // Pays-Bas, Japon, Suède, Tunisie
  G: ["BE", "EG", "IR", "NZ"],          // Belgique, Égypte, Iran, Nouvelle-Zélande
  H: ["ES", "CV", "SA", "UY"],          // Espagne, Cap-Vert, Arabie Saoudite, Uruguay
  I: ["FR", "SN", "NO", "IQ"],          // France, Sénégal, Norvège, Irak
  J: ["AR", "DZ", "AT", "JO"],          // Argentine, Algérie, Autriche, Jordanie
  K: ["PT", "UZ", "CO", "CD"],          // Portugal, Ouzbékistan, Colombie, RD Congo
  L: ["EN", "HR", "GH", "PA"],          // Angleterre, Croatie, Ghana, Panama
};

const TOURNAMENT_START = new Date("2026-06-11T16:00:00Z");

async function main() {
  console.log("🌱 Seeding Coupe du Monde 2026 (données officielles)...\n");

  // Reset
  console.log("🧹 Nettoyage des matchs et votes...");
  await prisma.vote.deleteMany();
  await prisma.match.deleteMany();

  // Totems
  const totems: Record<string, { id: string }> = {};
  for (const t of TOTEMS) {
    const totem = await prisma.totem.upsert({
      where: { countryCode: t.countryCode },
      update: t,
      create: t,
    });
    totems[t.countryCode] = totem;
    console.log(`✅ ${t.country.padEnd(22)} → ${t.animal}`);
  }
  console.log(`\n🦁 ${TOTEMS.length} totems configurés`);

  // Badges
  for (const b of BADGES) {
    await prisma.badge.upsert({ where: { name: b.name }, update: b, create: b });
  }
  console.log(`🏆 ${BADGES.length} badges configurés`);

  // Supprime les totems qui ne sont plus qualifiés
  const validCodes = TOTEMS.map((t) => t.countryCode);
  await prisma.totem.deleteMany({ where: { countryCode: { notIn: validCodes } } });
  console.log("🗑️  Anciens totems non qualifiés supprimés");

  // Matchs phase de groupes
  console.log("\n⚽ Génération des matchs de phase de groupes...");

  // Calendrier officiel FIFA — affrontements par journée
  // J1: Pos1-Pos2, Pos3-Pos4 | J2: Pos1-Pos3, Pos4-Pos2 | J3: Pos4-Pos1, Pos2-Pos3
  const MATCHDAYS: Array<[number, number][]> = [
    [[0, 1], [2, 3]],
    [[0, 2], [3, 1]],
    [[3, 0], [1, 2]],
  ];

  let matchCount = 0;

  for (let md = 0; md < 3; md++) {
    for (const [letter, teams] of Object.entries(GROUPS)) {
      for (const [iHome, iAway] of MATCHDAYS[md]) {
        const home = totems[teams[iHome]];
        const away = totems[teams[iAway]];
        if (!home || !away) {
          console.warn(`⚠️  Totem manquant : ${teams[iHome]} ou ${teams[iAway]}`);
          continue;
        }

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

  console.log(`\n✅ ${matchCount} matchs créés (phase de groupes officielle)`);
  console.log(`📅 Du 11 juin au 27 juin 2026`);
  console.log(`\n🎉 Seed terminé : ${TOTEMS.length} nations, 12 groupes, ${matchCount} matchs\n`);
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
