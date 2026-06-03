// ─────────────────────────────────────────────────────────────
// Affiliés paris sportifs — config centralisée
// Géolocalisation simple via locale du navigateur + langue.
// ⚠️ Respect du cahier des charges : pas d'apparence "site de paris".
//    Les CTAs apparaissent comme un *partenaire externe* discret.
// ─────────────────────────────────────────────────────────────

export interface Affiliate {
  id: string;
  name: string;
  /** URL d'inscription (avec ton tracking link affilié) */
  signupUrl: string;
  /** Pays prioritaires (ISO 3166-1 alpha-2 en majuscules) */
  countries: string[];
  /** Locale fallback si pas de pays connu (fr / en / es) */
  locales: string[];
  /** Couleur de la marque pour le micro-badge */
  brand: string;
  /** Disclaimer légal court */
  disclaimer: string;
  /** Priorité d'affichage (plus haut = prioritaire) */
  priority: number;
}

// 👉 Remplace les URLs par tes tracking links affiliés réels
//    après inscription sur les programmes.
export const AFFILIATES: Affiliate[] = [
  {
    id: "stake",
    name: "Stake",
    signupUrl:
      "https://stake.com/?c=YOUR_STAKE_CODE&offer=lechocdestotems",
    countries: [
      // Disponible mondialement sauf US/FR/UK/AU/NL
      "BR", "AR", "MX", "CO", "PE", "CL", "VE",
      "DE", "AT", "CH", "BE", "IT", "ES", "PT",
      "CA", "JP", "KR", "TR", "ZA",
    ],
    locales: ["en", "es"],
    brand: "#00D284",
    disclaimer: "+18 · Crypto casino & sportsbook",
    priority: 10,
  },
  {
    id: "1xbet",
    name: "1xBet",
    signupUrl: "https://1xbet.com/?tag=YOUR_1XBET_TAG",
    countries: [
      // Couverture Afrique francophone très forte
      "SN", "CI", "CM", "BJ", "TG", "ML", "BF",
      "DZ", "MA", "TN", "EG", "NG", "GH", "CD",
      "RU", "UZ", "TR", "BR", "MX", "PE",
    ],
    locales: ["fr", "en"],
    brand: "#1A75CF",
    disclaimer: "+18 · Jouez responsable",
    priority: 9,
  },
  {
    id: "betclic",
    name: "Betclic",
    signupUrl: "https://www.betclic.fr/?prm=YOUR_BETCLIC_PRM",
    countries: ["FR", "PT", "IT", "PL"],
    locales: ["fr"],
    brand: "#FF6B00",
    disclaimer: "+18 · Jouer comporte des risques — joueurs-info-service.fr",
    priority: 8,
  },
  {
    id: "winamax",
    name: "Winamax",
    signupUrl: "https://www.winamax.fr/?ref=YOUR_WINAMAX_REF",
    countries: ["FR", "ES", "DE", "AT"],
    locales: ["fr", "es"],
    brand: "#FF7900",
    disclaimer: "+18 · Jouer comporte des risques",
    priority: 7,
  },
  {
    id: "premierbet",
    name: "Premier Bet",
    signupUrl: "https://premierbet.com/?aff=YOUR_PREMIERBET_AFF",
    countries: [
      "CM", "CI", "CD", "SN", "MZ", "AO", "MW", "TZ", "GH", "BF", "ML",
    ],
    locales: ["fr", "en"],
    brand: "#FFCB05",
    disclaimer: "+18 · Jouer comporte des risques",
    priority: 8,
  },
  {
    id: "bet365",
    name: "bet365",
    signupUrl: "https://www.bet365.com/?affiliate=YOUR_BET365_AFF",
    countries: [
      "GB", "EN", "IE", "DE", "AT", "ES", "IT", "GR",
      "BR", "AR", "MX", "JP", "AU", "NZ",
    ],
    locales: ["en", "es"],
    brand: "#14854F",
    disclaimer: "+18 · BeGambleAware.org",
    priority: 7,
  },
];

/**
 * Choisit l'affilié le plus pertinent pour l'utilisateur.
 * Stratégie : pays > locale > priorité.
 *
 * @param country ISO alpha-2 (peut être inconnu)
 * @param locale  fr | en | es
 */
export function pickAffiliate(
  country: string | null,
  locale: string
): Affiliate | null {
  const lc = locale.toLowerCase().slice(0, 2);
  const cc = country?.toUpperCase() ?? null;

  // 1. Match exact pays
  if (cc) {
    const matches = AFFILIATES.filter((a) => a.countries.includes(cc));
    if (matches.length > 0) {
      matches.sort((a, b) => b.priority - a.priority);
      return matches[0];
    }
  }

  // 2. Match locale
  const localeMatches = AFFILIATES.filter((a) => a.locales.includes(lc));
  if (localeMatches.length > 0) {
    localeMatches.sort((a, b) => b.priority - a.priority);
    return localeMatches[0];
  }

  // 3. Fallback global (priorité max)
  return AFFILIATES.slice().sort((a, b) => b.priority - a.priority)[0] ?? null;
}

/**
 * Ajoute des UTM params au lien d'inscription pour tracker
 * d'où viennent les conversions.
 */
export function buildAffiliateUrl(
  affiliate: Affiliate,
  source: { matchSlug?: string; placement?: string }
): string {
  try {
    const url = new URL(affiliate.signupUrl);
    url.searchParams.set("utm_source", "lechocdestotems");
    url.searchParams.set("utm_medium", source.placement ?? "post_vote");
    if (source.matchSlug) {
      url.searchParams.set("utm_campaign", source.matchSlug);
    }
    return url.toString();
  } catch {
    return affiliate.signupUrl;
  }
}

/** Détection pays côté client via locale + Intl */
export function detectCountry(): string | null {
  if (typeof navigator === "undefined") return null;
  try {
    const loc = new Intl.Locale(navigator.language) as Intl.Locale & {
      region?: string;
    };
    return loc.region ?? null;
  } catch {
    return null;
  }
}
