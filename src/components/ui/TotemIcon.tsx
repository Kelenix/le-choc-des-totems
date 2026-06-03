import { type IconType } from "react-icons";
import {
  GiRooster, GiLion, GiTigerHead, GiEagleHead, GiBull,
  GiWolfHead, GiBearHead, GiFoxHead, GiPaw,
  GiTotemMask, GiRhinocerosHorn, GiFireShield,
  GiSeaSerpent, GiElephant, GiKangaroo, GiSheep, GiCondorEmblem,
  GiHorseHead, GiMonkey, GiCrowNest,
  GiAnt, GiBigDiamondRing,
} from "react-icons/gi";
import { cn } from "@/lib/utils";

const TOTEM_ICONS: Record<string, { Icon: IconType; color: string }> = {
  // ── Hôtes ──
  US: { Icon: GiEagleHead,         color: "#3B82F6" },  // Bald Eagle
  CA: { Icon: GiBearHead,          color: "#EF4444" },  // Beaver/bear — red
  MX: { Icon: GiEagleHead,         color: "#10B981" },  // Eagle — green

  // ── UEFA ──
  FR: { Icon: GiRooster,           color: "#3B82F6" },
  GB: { Icon: GiLion,              color: "#EF4444" },
  ES: { Icon: GiBull,              color: "#EF4444" },
  DE: { Icon: GiEagleHead,         color: "#F59E0B" },
  IT: { Icon: GiWolfHead,          color: "#3B82F6" },
  PT: { Icon: GiRooster,           color: "#10B981" },
  NL: { Icon: GiLion,              color: "#F97316" },
  BE: { Icon: GiFireShield,        color: "#EF4444" },
  HR: { Icon: GiWolfHead,          color: "#EF4444" },
  CH: { Icon: GiBull,              color: "#EF4444" },
  DK: { Icon: GiSeaSerpent,        color: "#EF4444" },  // Viking longship
  PL: { Icon: GiEagleHead,         color: "#EF4444" },  // Aigle blanc
  NO: { Icon: GiLion,              color: "#EF4444" },
  TR: { Icon: GiWolfHead,          color: "#EF4444" },
  RS: { Icon: GiEagleHead,         color: "#94A3B8" },
  AT: { Icon: GiEagleHead,         color: "#EF4444" },
  HU: { Icon: GiCondorEmblem,      color: "#10B981" },  // Turul

  // ── CONMEBOL ──
  AR: { Icon: GiPaw,               color: "#60A5FA" },  // Puma
  BR: { Icon: GiTigerHead,         color: "#34D399" },  // Jaguar
  CO: { Icon: GiCondorEmblem,      color: "#FBBF24" },
  UY: { Icon: GiRhinocerosHorn,    color: "#60A5FA" },  // Cerf charrúa
  EC: { Icon: GiCondorEmblem,      color: "#FBBF24" },
  PY: { Icon: GiTigerHead,         color: "#EF4444" },  // Jaguar

  // ── CAF ──
  SN: { Icon: GiLion,              color: "#10B981" },
  MA: { Icon: GiLion,              color: "#EF4444" },
  DZ: { Icon: GiFoxHead,           color: "#10B981" },  // Fennec
  EG: { Icon: GiEagleHead,         color: "#FBBF24" },
  TN: { Icon: GiEagleHead,         color: "#EF4444" },
  NG: { Icon: GiEagleHead,         color: "#22C55E" },
  CM: { Icon: GiLion,              color: "#FBBF24" },
  CI: { Icon: GiElephant,          color: "#F97316" },
  GH: { Icon: GiBigDiamondRing,    color: "#FBBF24" },  // Black Star
  ZA: { Icon: GiHorseHead,         color: "#10B981" },  // Antilope

  // ── AFC ──
  JP: { Icon: GiCrowNest,          color: "#1E3A8A" },  // Yatagarasu — corbeau
  KR: { Icon: GiTigerHead,         color: "#EF4444" },
  IR: { Icon: GiLion,              color: "#FBBF24" },
  SA: { Icon: GiEagleHead,         color: "#10B981" },  // Faucon vert
  AU: { Icon: GiKangaroo,          color: "#FBBF24" },
  QA: { Icon: GiSheep,             color: "#7F1D1D" },  // Oryx
  IQ: { Icon: GiLion,              color: "#EF4444" },
  UZ: { Icon: GiWolfHead,          color: "#94A3B8" },

  // ── CONCACAF ──
  CR: { Icon: GiMonkey,            color: "#3B82F6" },  // Paresseux
  PA: { Icon: GiEagleHead,         color: "#EF4444" },  // Harpie
  JM: { Icon: GiEagleHead,         color: "#10B981" },

  // ── OFC ──
  NZ: { Icon: GiAnt,               color: "#0F172A" },  // Kiwi (oiseau au sol)
};

const DEFAULT: { Icon: IconType; color: string } = { Icon: GiTotemMask, color: "#94A3B8" };

interface Props {
  countryCode: string;
  size?: number;
  className?: string;
  withGlow?: boolean;
}

export function TotemIcon({ countryCode, size = 48, className, withGlow }: Props) {
  const { Icon, color } = TOTEM_ICONS[countryCode] ?? DEFAULT;

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      style={withGlow ? { filter: `drop-shadow(0 0 12px ${color}90)` } : undefined}
    >
      <Icon size={size} style={{ color }} />
    </span>
  );
}

export function getTotemColor(countryCode: string): string {
  return (TOTEM_ICONS[countryCode] ?? DEFAULT).color;
}
