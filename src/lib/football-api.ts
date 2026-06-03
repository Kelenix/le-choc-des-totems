// ─────────────────────────────────────────────────────────────
// API-Football (api-sports.io) — Coupe du Monde FIFA 2026
// Plan gratuit : 100 requêtes/jour
// Docs : https://www.api-football.com/documentation-v3
// ─────────────────────────────────────────────────────────────

const API_URL = "https://v3.football.api-sports.io";
const WORLD_CUP_LEAGUE_ID = 1;
const SEASON = 2026;

// Mapping des noms d'équipes retournés par API-Football
// vers les countryCode présents dans la BDD (Totem.countryCode).
// Couvre les 48 nations qualifiées.
const TEAM_NAME_TO_CODE: Record<string, string> = {
  // CONCACAF
  "USA": "US",
  "United States": "US",
  "Canada": "CA",
  "Mexico": "MX",
  "Panama": "PA",
  "Haiti": "HT",
  "Curacao": "CW",
  "Curaçao": "CW",
  // CONMEBOL
  "Argentina": "AR",
  "Brazil": "BR",
  "Colombia": "CO",
  "Ecuador": "EC",
  "Paraguay": "PY",
  "Uruguay": "UY",
  // UEFA
  "Spain": "ES",
  "France": "FR",
  "England": "EN",
  "Scotland": "SX",
  "Germany": "DE",
  "Portugal": "PT",
  "Netherlands": "NL",
  "Belgium": "BE",
  "Croatia": "HR",
  "Austria": "AT",
  "Switzerland": "CH",
  "Bosnia and Herzegovina": "BA",
  "Bosnia & Herzegovina": "BA",
  "Czech Republic": "CZ",
  "Czechia": "CZ",
  "Norway": "NO",
  "Sweden": "SE",
  "Turkey": "TR",
  "Türkiye": "TR",
  // CAF
  "Egypt": "EG",
  "Morocco": "MA",
  "Algeria": "DZ",
  "Senegal": "SN",
  "Tunisia": "TN",
  "Ghana": "GH",
  "Ivory Coast": "CI",
  "Côte d'Ivoire": "CI",
  "South Africa": "ZA",
  "DR Congo": "CD",
  "Congo DR": "CD",
  "Cape Verde": "CV",
  "Cabo Verde": "CV",
  // AFC
  "Japan": "JP",
  "South Korea": "KR",
  "Korea Republic": "KR",
  "Australia": "AU",
  "Iran": "IR",
  "IR Iran": "IR",
  "Iraq": "IQ",
  "Saudi Arabia": "SA",
  "Qatar": "QA",
  "Jordan": "JO",
  "Uzbekistan": "UZ",
  // OFC
  "New Zealand": "NZ",
};

export interface RawFixture {
  fixtureId: number;
  date: string;          // ISO
  statusShort: string;   // NS, 1H, HT, 2H, ET, FT, AET, PEN, CANC, PST, ABD ...
  homeName: string;
  awayName: string;
  homeCode: string | null;
  awayCode: string | null;
  homeScore: number | null;
  awayScore: number | null;
  round: string;
}

export class FootballApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "FootballApiError";
    this.status = status;
  }
}

export async function fetchWorldCupFixtures(apiKey: string): Promise<RawFixture[]> {
  if (!apiKey) {
    throw new FootballApiError("FOOTBALL_API_KEY manquante", 500);
  }

  const url = `${API_URL}/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}`;
  const res = await fetch(url, {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new FootballApiError(`API-Football HTTP ${res.status}`, res.status);
  }

  const data = await res.json();

  // L'API retourne { errors: {...}, response: [...] }
  if (data.errors && Object.keys(data.errors).length > 0) {
    const msg = typeof data.errors === "object" ? JSON.stringify(data.errors) : String(data.errors);
    throw new FootballApiError(`API-Football: ${msg}`, 502);
  }

  interface ApiFixture {
    fixture?: { id?: number; date?: string; status?: { short?: string } };
    teams?: { home?: { name?: string }; away?: { name?: string } };
    goals?: { home?: number | null; away?: number | null };
    league?: { round?: string };
  }

  const fixtures: RawFixture[] = (data.response || []).map((f: ApiFixture) => {
    const homeName = f.teams?.home?.name ?? "";
    const awayName = f.teams?.away?.name ?? "";
    return {
      fixtureId: f.fixture?.id ?? 0,
      date: f.fixture?.date ?? "",
      statusShort: f.fixture?.status?.short ?? "NS",
      homeName,
      awayName,
      homeCode: TEAM_NAME_TO_CODE[homeName] ?? null,
      awayCode: TEAM_NAME_TO_CODE[awayName] ?? null,
      homeScore: f.goals?.home ?? null,
      awayScore: f.goals?.away ?? null,
      round: f.league?.round ?? "",
    };
  });

  return fixtures;
}

export type MappedStatus = "UPCOMING" | "LIVE" | "FINISHED" | "CANCELLED";

export function mapStatus(short: string): MappedStatus {
  if (["NS", "TBD"].includes(short)) return "UPCOMING";
  if (["FT", "AET", "PEN", "AWD", "WO"].includes(short)) return "FINISHED";
  if (["CANC", "ABD", "PST"].includes(short)) return "CANCELLED";
  return "LIVE"; // 1H, HT, 2H, ET, BT, P, SUSP, INT, LIVE
}

export function computeResult(home: number, away: number): "HOME" | "DRAW" | "AWAY" {
  if (home > away) return "HOME";
  if (away > home) return "AWAY";
  return "DRAW";
}
