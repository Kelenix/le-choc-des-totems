import { describe, it, expect } from "vitest";
import { pickAffiliate, buildAffiliateUrl, AFFILIATES } from "./affiliates";

describe("pickAffiliate", () => {
  it("priorise un match exact sur le pays", () => {
    const r = pickAffiliate("FR", "fr");
    expect(r?.id).toBe("betclic"); // FR est dans Betclic & Winamax, priority 8 vs 7
  });

  it("retourne Premier Bet pour Sénégal francophone", () => {
    const r = pickAffiliate("SN", "fr");
    expect(["premierbet", "1xbet"]).toContain(r?.id);
  });

  it("fallback sur la locale si pays inconnu", () => {
    const r = pickAffiliate("XX", "fr");
    expect(r?.locales).toContain("fr");
  });

  it("fallback sur la locale si country null", () => {
    const r = pickAffiliate(null, "en");
    expect(r?.locales).toContain("en");
  });

  it("retourne un affilié même sans aucun match", () => {
    const r = pickAffiliate(null, "xx");
    expect(r).not.toBeNull();
  });

  it("US/CA → Stake en US (pas dans whitelist Stake mais via locale en)", () => {
    const r = pickAffiliate("US", "en");
    expect(r).not.toBeNull();
  });
});

describe("buildAffiliateUrl", () => {
  it("ajoute les UTM params", () => {
    const aff = AFFILIATES[0];
    const url = buildAffiliateUrl(aff, {
      matchSlug: "fr-vs-sn-j1",
      placement: "post_vote",
    });
    const u = new URL(url);
    expect(u.searchParams.get("utm_source")).toBe("lechocdestotems");
    expect(u.searchParams.get("utm_medium")).toBe("post_vote");
    expect(u.searchParams.get("utm_campaign")).toBe("fr-vs-sn-j1");
  });

  it("utm_medium par défaut = post_vote", () => {
    const aff = AFFILIATES[0];
    const url = buildAffiliateUrl(aff, {});
    expect(new URL(url).searchParams.get("utm_medium")).toBe("post_vote");
  });

  it("préserve les query params existants", () => {
    const aff = AFFILIATES[0];
    const url = buildAffiliateUrl(aff, { placement: "test" });
    const u = new URL(url);
    expect(u.searchParams.get("c")).toBeTruthy(); // Le code Stake
  });
});

describe("AFFILIATES integrity", () => {
  it("tous les IDs sont uniques", () => {
    const ids = AFFILIATES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toutes les URLs sont valides", () => {
    for (const a of AFFILIATES) {
      expect(() => new URL(a.signupUrl)).not.toThrow();
    }
  });

  it("tous ont un disclaimer +18", () => {
    for (const a of AFFILIATES) {
      expect(a.disclaimer.toLowerCase()).toMatch(/\+?18|gamble|jouer|jouez/);
    }
  });
});
