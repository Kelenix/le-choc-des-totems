import { describe, it, expect } from "vitest";
import { mapStatus, computeResult } from "./football-api";

describe("mapStatus", () => {
  it("retourne UPCOMING pour NS et TBD", () => {
    expect(mapStatus("NS")).toBe("UPCOMING");
    expect(mapStatus("TBD")).toBe("UPCOMING");
  });

  it("retourne FINISHED pour FT/AET/PEN/AWD/WO", () => {
    expect(mapStatus("FT")).toBe("FINISHED");
    expect(mapStatus("AET")).toBe("FINISHED");
    expect(mapStatus("PEN")).toBe("FINISHED");
    expect(mapStatus("AWD")).toBe("FINISHED");
    expect(mapStatus("WO")).toBe("FINISHED");
  });

  it("retourne CANCELLED pour CANC/ABD/PST", () => {
    expect(mapStatus("CANC")).toBe("CANCELLED");
    expect(mapStatus("ABD")).toBe("CANCELLED");
    expect(mapStatus("PST")).toBe("CANCELLED");
  });

  it("retourne LIVE pour tous les états en cours", () => {
    expect(mapStatus("1H")).toBe("LIVE");
    expect(mapStatus("HT")).toBe("LIVE");
    expect(mapStatus("2H")).toBe("LIVE");
    expect(mapStatus("ET")).toBe("LIVE");
    expect(mapStatus("SUSP")).toBe("LIVE");
    expect(mapStatus("INT")).toBe("LIVE");
  });

  it("retourne LIVE pour status inconnu", () => {
    expect(mapStatus("UNKNOWN")).toBe("LIVE");
  });
});

describe("computeResult", () => {
  it("HOME si home > away", () => {
    expect(computeResult(2, 1)).toBe("HOME");
    expect(computeResult(5, 0)).toBe("HOME");
  });

  it("AWAY si away > home", () => {
    expect(computeResult(0, 1)).toBe("AWAY");
    expect(computeResult(1, 3)).toBe("AWAY");
  });

  it("DRAW si home == away", () => {
    expect(computeResult(0, 0)).toBe("DRAW");
    expect(computeResult(2, 2)).toBe("DRAW");
  });
});
