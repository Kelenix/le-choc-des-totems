import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, formatDate, slugify, getTimeUntil, calculateVoteStats } from "./utils";

describe("cn", () => {
  it("merge les classes tailwind", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("text-red-500", null, undefined, "font-bold")).toBe(
      "text-red-500 font-bold"
    );
  });

  it("gère les conditionnels", () => {
    expect(cn("base", false && "hidden", true && "visible")).toBe(
      "base visible"
    );
  });
});

describe("slugify", () => {
  it("convertit en kebab-case lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("supprime les accents (normalisation NFD)", () => {
    expect(slugify("Côte d'Ivoire")).toBe("cote-d-ivoire");
    expect(slugify("Türkiye")).toBe("turkiye");
    expect(slugify("España")).toBe("espana");
  });

  it("nettoie les caractères spéciaux", () => {
    expect(slugify("France vs Sénégal !")).toBe("france-vs-senegal");
    expect(slugify("---test---")).toBe("test");
  });

  it("gère les chaînes vides", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
  });

  it("construit le slug d'un match", () => {
    expect(slugify("FR-vs-SN-j1")).toBe("fr-vs-sn-j1");
  });
});

describe("formatDate", () => {
  it("formate une date ISO en FR", () => {
    const r = formatDate("2026-06-11T18:00:00Z");
    expect(r).toMatch(/11 juin 2026/);
  });
});

describe("getTimeUntil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("calcule jours/heures/minutes/secondes pour date future", () => {
    const r = getTimeUntil("2026-06-11T12:00:00Z");
    expect(r.expired).toBe(false);
    expect(r.days).toBe(10);
    expect(r.hours).toBe(0);
  });

  it("retourne expired=true pour date passée", () => {
    const r = getTimeUntil("2026-05-01T12:00:00Z");
    expect(r.expired).toBe(true);
    expect(r.days).toBe(0);
  });

  it("calcule heures/minutes/secondes correctement", () => {
    const r = getTimeUntil("2026-06-01T14:30:45Z");
    expect(r.days).toBe(0);
    expect(r.hours).toBe(2);
    expect(r.minutes).toBe(30);
    expect(r.seconds).toBe(45);
  });
});

describe("calculateVoteStats", () => {
  it("retourne 0/0/0 pour liste vide", () => {
    const r = calculateVoteStats([]);
    expect(r.total).toBe(0);
    expect(r.homePercent).toBe(0);
    expect(r.drawPercent).toBe(0);
    expect(r.awayPercent).toBe(0);
  });

  it("compte HOME/DRAW/AWAY", () => {
    const r = calculateVoteStats([
      { prediction: "HOME" },
      { prediction: "HOME" },
      { prediction: "DRAW" },
      { prediction: "AWAY" },
    ]);
    expect(r.total).toBe(4);
    expect(r.home).toBe(2);
    expect(r.draw).toBe(1);
    expect(r.away).toBe(1);
    expect(r.homePercent).toBe(50);
    expect(r.drawPercent).toBe(25);
    expect(r.awayPercent).toBe(25);
  });

  it("arrondit les pourcentages", () => {
    const r = calculateVoteStats([
      { prediction: "HOME" },
      { prediction: "HOME" },
      { prediction: "AWAY" },
    ]);
    expect(r.homePercent).toBe(67);
    expect(r.awayPercent).toBe(33);
  });
});
