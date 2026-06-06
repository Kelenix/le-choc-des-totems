// ─────────────────────────────────────────────────────────────
// Streaming sportif — diffuseurs Coupe du Monde 2026
// Choix automatique selon le pays + langue de l'utilisateur.
// ─────────────────────────────────────────────────────────────

export interface StreamingProvider {
  id: string;
  name: string;
  /** Lien d'inscription / abonnement avec ton ID d'affilié */
  signupUrl: string;
  /** Pays cibles (ISO alpha-2) */
  countries: string[];
  /** Locales fallback */
  locales: string[];
  /** Couleur marque */
  brand: string;
  /** Tagline court */
  tagline: string;
  priority: number;
}

// 👉 Remplace YOUR_XXX par tes tracking links d'affiliés
export const STREAMING_PROVIDERS: StreamingProvider[] = [
  {
    id: "canalplus",
    name: "Canal+",
    signupUrl: "https://www.canalplus.com/?utm_source=YOUR_CANAL_AFF",
    countries: ["FR", "CM", "SN", "CI", "BJ", "TG", "ML", "BF", "GA", "CD", "MA", "DZ", "TN"],
    locales: ["fr"],
    brand: "#000000",
    tagline: "Coupe du Monde en direct sur Canal+",
    priority: 10,
  },
  {
    id: "bein",
    name: "beIN SPORTS",
    signupUrl: "https://www.beinsports.com/?aff=YOUR_BEIN_AFF",
    countries: ["FR", "QA", "SA", "EG", "MA", "DZ", "TN", "AU", "TH", "ID", "PH", "MY", "TR", "US"],
    locales: ["fr", "en"],
    brand: "#7B0BBF",
    tagline: "Tous les matchs Coupe du Monde 2026 en direct",
    priority: 9,
  },
  {
    id: "dazn",
    name: "DAZN",
    signupUrl: "https://www.dazn.com/?ref=YOUR_DAZN_REF",
    countries: ["DE", "AT", "CH", "IT", "ES", "JP", "BR", "CA", "US"],
    locales: ["en", "es"],
    brand: "#F8FF13",
    tagline: "Stream the World Cup — DAZN",
    priority: 9,
  },
  {
    id: "fubo",
    name: "Fubo",
    signupUrl: "https://www.fubo.tv/?irad=YOUR_FUBO_IRAD",
    countries: ["US", "CA"],
    locales: ["en"],
    brand: "#FA4616",
    tagline: "Watch the FIFA World Cup live on Fubo",
    priority: 8,
  },
  {
    id: "supersport",
    name: "SuperSport",
    signupUrl: "https://www.supersport.com/?aff=YOUR_SUPERSPORT_AFF",
    countries: ["ZA", "NG", "GH", "KE", "TZ", "ZM", "ZW", "MZ", "AO", "UG"],
    locales: ["en"],
    brand: "#00A8E1",
    tagline: "Watch the World Cup live on SuperSport",
    priority: 9,
  },
  {
    id: "fifaplus",
    name: "FIFA+",
    signupUrl: "https://www.fifa.com/fifaplus/",
    countries: [],
    locales: ["en", "fr", "es"],
    brand: "#326295",
    tagline: "Stream FIFA World Cup 2026 on FIFA+",
    priority: 1, // Fallback ultime — gratuit, mondial
  },
];

/**
 * Choisit le diffuseur le plus pertinent.
 */
export function pickStreaming(
  country: string | null,
  locale: string
): StreamingProvider | null {
  const lc = locale.toLowerCase().slice(0, 2);
  const cc = country?.toUpperCase() ?? null;

  if (cc) {
    const matches = STREAMING_PROVIDERS.filter((p) => p.countries.includes(cc));
    if (matches.length > 0) {
      matches.sort((a, b) => b.priority - a.priority);
      return matches[0];
    }
  }

  const localeMatches = STREAMING_PROVIDERS.filter((p) =>
    p.locales.includes(lc)
  );
  if (localeMatches.length > 0) {
    localeMatches.sort((a, b) => b.priority - a.priority);
    return localeMatches[0];
  }

  return STREAMING_PROVIDERS.slice().sort((a, b) => b.priority - a.priority)[0] ?? null;
}

export function buildStreamingUrl(
  provider: StreamingProvider,
  source: { matchSlug?: string; placement?: string }
): string {
  try {
    const url = new URL(provider.signupUrl);
    url.searchParams.set("utm_source", "lechocdestotems");
    url.searchParams.set("utm_medium", source.placement ?? "match_page");
    if (source.matchSlug) {
      url.searchParams.set("utm_campaign", source.matchSlug);
    }
    return url.toString();
  } catch {
    return provider.signupUrl;
  }
}
