import { describe, it, expect } from "vitest";
import { buildAmazonSearchUrl, getGearForMatch } from "./gear";

describe("buildAmazonSearchUrl", () => {
  it("pointe vers amazon.fr pour la France", () => {
    const url = buildAmazonSearchUrl("maillot France", "FR");
    expect(url).toContain("amazon.fr");
    expect(new URL(url).searchParams.get("k")).toBe("maillot France");
    expect(new URL(url).searchParams.get("tag")).toBeTruthy();
  });

  it("pointe vers amazon.de pour Allemagne et Autriche", () => {
    expect(buildAmazonSearchUrl("ball", "DE")).toContain("amazon.de");
    expect(buildAmazonSearchUrl("ball", "AT")).toContain("amazon.de");
  });

  it("pointe vers amazon.com pour US", () => {
    expect(buildAmazonSearchUrl("ball", "US")).toContain("amazon.com");
  });

  it("pointe vers amazon.co.uk pour UK/EN/IE", () => {
    expect(buildAmazonSearchUrl("ball", "GB")).toContain("amazon.co.uk");
    expect(buildAmazonSearchUrl("ball", "EN")).toContain("amazon.co.uk");
    expect(buildAmazonSearchUrl("ball", "IE")).toContain("amazon.co.uk");
  });

  it("fallback amazon.com pour pays inconnu", () => {
    expect(buildAmazonSearchUrl("ball", "ZZ")).toContain("amazon.com");
    expect(buildAmazonSearchUrl("ball", null)).toContain("amazon.com");
  });

  it("encode correctement les espaces et accents", () => {
    const url = buildAmazonSearchUrl("maillot équipe France 2026", "FR");
    const u = new URL(url);
    expect(u.searchParams.get("k")).toBe("maillot équipe France 2026");
  });

  it("ajoute le tracking ascsubtag si source fourni", () => {
    const url = buildAmazonSearchUrl("ball", "FR", {
      placement: "gear_modal",
      matchSlug: "fr-sn-j1",
    });
    const u = new URL(url);
    expect(u.searchParams.get("ascsubtag")).toBe("gear_modal");
    expect(u.searchParams.get("ref")).toBe("lct_fr-sn-j1");
  });
});

describe("getGearForMatch", () => {
  const home = { country: "France", countryCode: "FR" };
  const away = { country: "Sénégal", countryCode: "SN" };

  it("retourne au moins 6 items", () => {
    const items = getGearForMatch(home, away);
    expect(items.length).toBeGreaterThanOrEqual(6);
  });

  it("inclut un maillot pour chaque équipe", () => {
    const items = getGearForMatch(home, away);
    expect(items.find((i) => i.id === "jersey-FR")?.label).toContain("France");
    expect(items.find((i) => i.id === "jersey-SN")?.label).toContain("Sénégal");
  });

  it("inclut un drapeau pour chaque équipe", () => {
    const items = getGearForMatch(home, away);
    expect(items.find((i) => i.id === "flag-home")?.label).toContain("France");
    expect(items.find((i) => i.id === "flag-away")?.label).toContain("Sénégal");
  });

  it("inclut un ballon FIFA officiel", () => {
    const items = getGearForMatch(home, away);
    expect(items.find((i) => i.id === "ball-official")).toBeDefined();
  });

  it("tous les IDs sont uniques", () => {
    const items = getGearForMatch(home, away);
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
