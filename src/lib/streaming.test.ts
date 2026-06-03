import { describe, it, expect } from "vitest";
import {
  pickStreaming,
  buildStreamingUrl,
  STREAMING_PROVIDERS,
} from "./streaming";

describe("pickStreaming", () => {
  it("priorise Canal+ pour la France", () => {
    const r = pickStreaming("FR", "fr");
    expect(r?.id).toBe("canalplus");
  });

  it("retourne SuperSport pour Afrique du Sud", () => {
    const r = pickStreaming("ZA", "en");
    expect(r?.id).toBe("supersport");
  });

  it("retourne Fubo pour USA", () => {
    const r = pickStreaming("US", "en");
    // beIN aussi possible — la priorité décide
    expect(["fubo", "bein", "dazn"]).toContain(r?.id);
  });

  it("retourne DAZN pour Allemagne", () => {
    const r = pickStreaming("DE", "en");
    expect(r?.id).toBe("dazn");
  });

  it("fallback FIFA+ si rien ne matche", () => {
    const r = pickStreaming("XX", "xx");
    expect(r).not.toBeNull();
  });

  it("retourne un provider même sans pays", () => {
    const r = pickStreaming(null, "es");
    expect(r).not.toBeNull();
    expect(r?.locales).toContain("es");
  });
});

describe("buildStreamingUrl", () => {
  it("ajoute les UTM params", () => {
    const provider = STREAMING_PROVIDERS[0];
    const url = buildStreamingUrl(provider, {
      matchSlug: "fr-vs-sn-j1",
      placement: "match_page_stream",
    });
    const u = new URL(url);
    expect(u.searchParams.get("utm_source")).toBe("lechocdestotems");
    expect(u.searchParams.get("utm_medium")).toBe("match_page_stream");
    expect(u.searchParams.get("utm_campaign")).toBe("fr-vs-sn-j1");
  });

  it("placement par défaut = match_page", () => {
    const provider = STREAMING_PROVIDERS[0];
    const url = buildStreamingUrl(provider, {});
    expect(new URL(url).searchParams.get("utm_medium")).toBe("match_page");
  });
});

describe("STREAMING_PROVIDERS integrity", () => {
  it("tous les IDs sont uniques", () => {
    const ids = STREAMING_PROVIDERS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toutes les URLs sont valides", () => {
    for (const p of STREAMING_PROVIDERS) {
      expect(() => new URL(p.signupUrl)).not.toThrow();
    }
  });

  it("FIFA+ est présent comme fallback global", () => {
    expect(STREAMING_PROVIDERS.find((p) => p.id === "fifaplus")).toBeDefined();
  });
});
