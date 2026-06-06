// ─────────────────────────────────────────────────────────────
// Amazon Associates — boutique "Équipe-toi pour la Coupe du Monde"
// Multi-domain : selon le pays détecté, on pointe vers le bon Amazon
// (FR, ES, DE, IT, UK, US, JP, BR, MX, AU, IN, etc.)
// ─────────────────────────────────────────────────────────────

/**
 * Mapping pays → (domaine Amazon, tag affilié).
 * Tu peux avoir 1 seul tag global, ou un tag par marketplace
 * (Amazon impose souvent un compte par marketplace).
 */
const AMAZON_MARKETPLACES: Record<
  string,
  { host: string; tag: string; lang: string }
> = {
  FR: { host: "amazon.fr",      tag: "YOUR_AMAZON_FR_TAG-21", lang: "fr" },
  BE: { host: "amazon.fr",      tag: "YOUR_AMAZON_FR_TAG-21", lang: "fr" },
  LU: { host: "amazon.fr",      tag: "YOUR_AMAZON_FR_TAG-21", lang: "fr" },
  DE: { host: "amazon.de",      tag: "nkwatech0d-21", lang: "de" },
  AT: { host: "amazon.de",      tag: "nkwatech0d-21", lang: "de" },
  IT: { host: "amazon.it",      tag: "nkwatech-21",   lang: "it" },
  ES: { host: "amazon.es",      tag: "nkwatech058-21", lang: "es" },
  GB: { host: "amazon.co.uk",   tag: "YOUR_AMAZON_UK_TAG-21", lang: "en" },
  EN: { host: "amazon.co.uk",   tag: "YOUR_AMAZON_UK_TAG-21", lang: "en" },
  IE: { host: "amazon.co.uk",   tag: "YOUR_AMAZON_UK_TAG-21", lang: "en" },
  US: { host: "amazon.com",     tag: "YOUR_AMAZON_US_TAG-20", lang: "en" },
  CA: { host: "amazon.ca",      tag: "YOUR_AMAZON_CA_TAG-20", lang: "en" },
  MX: { host: "amazon.com.mx",  tag: "YOUR_AMAZON_MX_TAG-20", lang: "es" },
  BR: { host: "amazon.com.br",  tag: "YOUR_AMAZON_BR_TAG-20", lang: "pt" },
  JP: { host: "amazon.co.jp",   tag: "YOUR_AMAZON_JP_TAG-22", lang: "ja" },
  AU: { host: "amazon.com.au",  tag: "YOUR_AMAZON_AU_TAG-22", lang: "en" },
  IN: { host: "amazon.in",      tag: "YOUR_AMAZON_IN_TAG-21", lang: "en" },
  TR: { host: "amazon.com.tr",  tag: "YOUR_AMAZON_TR_TAG-20", lang: "tr" },
  AE: { host: "amazon.ae",      tag: "YOUR_AMAZON_AE_TAG-21", lang: "en" },
  SA: { host: "amazon.sa",      tag: "YOUR_AMAZON_SA_TAG-21", lang: "en" },
  SG: { host: "amazon.sg",      tag: "YOUR_AMAZON_SG_TAG-21", lang: "en" },
};

/** Fallback global pour les pays sans marketplace local */
const DEFAULT_MARKET = { host: "amazon.com", tag: "YOUR_AMAZON_US_TAG-20", lang: "en" };

export type GearIcon =
  | "jersey"
  | "ball"
  | "tv"
  | "flag"
  | "scarf"
  | "boots"
  | "snack";

export interface GearItem {
  id: string;
  /** Label affiché en français — sera utilisé tel quel pour la recherche aussi */
  label: string;
  icon: GearIcon;
  /** Code pays associé (pour drapeau / personnalisation) */
  countryCode?: string;
  /** Couleur d'accent */
  accent: string;
  /** Query Amazon (sans tag, on l'ajoute dynamiquement) */
  query: string;
  /** Description courte affichée sous le label */
  hint?: string;
}

/**
 * Construit l'URL Amazon de recherche pour un produit.
 */
export function buildAmazonSearchUrl(
  query: string,
  country: string | null,
  source?: { matchSlug?: string; placement?: string }
): string {
  const cc = country?.toUpperCase() ?? null;
  const market = (cc && AMAZON_MARKETPLACES[cc]) || DEFAULT_MARKET;

  const url = new URL(`https://www.${market.host}/s`);
  url.searchParams.set("k", query);
  url.searchParams.set("tag", market.tag);
  url.searchParams.set("language", market.lang);

  // Tracking
  if (source) {
    if (source.placement) url.searchParams.set("ascsubtag", source.placement);
    if (source.matchSlug) url.searchParams.set("ref", `lct_${source.matchSlug}`);
  }
  return url.toString();
}

/**
 * Génère la liste des produits proposés pour un match donné.
 */
export function getGearForMatch(
  home: { country: string; countryCode: string },
  away: { country: string; countryCode: string }
): GearItem[] {
  return [
    {
      id: `jersey-${home.countryCode}`,
      label: `Maillot ${home.country} 2026`,
      icon: "jersey",
      countryCode: home.countryCode,
      accent: "#3B82F6",
      query: `maillot équipe ${home.country} 2026`,
      hint: "Tenue domicile officielle",
    },
    {
      id: `jersey-${away.countryCode}`,
      label: `Maillot ${away.country} 2026`,
      icon: "jersey",
      countryCode: away.countryCode,
      accent: "#EF4444",
      query: `maillot équipe ${away.country} 2026`,
      hint: "Tenue extérieur officielle",
    },
    {
      id: "ball-official",
      label: "Ballon FIFA 2026",
      icon: "ball",
      accent: "#FBBF24",
      query: "adidas ballon coupe du monde 2026",
      hint: "Ballon officiel adidas",
    },
    {
      id: "scarf-fan",
      label: `Écharpe fan ${home.country}`,
      icon: "scarf",
      countryCode: home.countryCode,
      accent: "#3B82F6",
      query: `écharpe supporter ${home.country}`,
      hint: "Pour vibrer dans les tribunes",
    },
    {
      id: "tv-4k",
      label: "TV 4K 55\" - 65\"",
      icon: "tv",
      accent: "#94A3B8",
      query: "smart tv 4k 55 pouces",
      hint: "Pour vivre les matchs en grand",
    },
    {
      id: "flag-home",
      label: `Drapeau ${home.country}`,
      icon: "flag",
      countryCode: home.countryCode,
      accent: "#3B82F6",
      query: `drapeau ${home.country}`,
      hint: "Décore ton salon",
    },
    {
      id: "flag-away",
      label: `Drapeau ${away.country}`,
      icon: "flag",
      countryCode: away.countryCode,
      accent: "#EF4444",
      query: `drapeau ${away.country}`,
      hint: "Décore ton salon",
    },
    {
      id: "boots-pro",
      label: "Crampons Pro",
      icon: "boots",
      accent: "#10B981",
      query: "chaussures de foot nike adidas",
      hint: "Joue comme les pros",
    },
  ];
}
