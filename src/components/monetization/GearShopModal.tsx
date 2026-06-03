"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  ShoppingBag,
  Shirt,
  Tv,
  Flag as FlagIcon,
  Footprints,
  Sparkles,
  Cookie,
} from "lucide-react";
import { GiSoccerBall } from "react-icons/gi";
import {
  buildAmazonSearchUrl,
  getGearForMatch,
  type GearItem,
  type GearIcon,
} from "@/lib/gear";
import { detectCountry } from "@/lib/affiliates";
import { Flag } from "@/components/ui/Flag";

interface Props {
  open: boolean;
  onClose: () => void;
  matchSlug?: string;
  home: { country: string; countryCode: string };
  away: { country: string; countryCode: string };
}

const ICONS: Record<GearIcon, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  jersey: Shirt,
  ball: GiSoccerBall,
  tv: Tv,
  flag: FlagIcon,
  scarf: Sparkles,
  boots: Footprints,
  snack: Cookie,
};

export function GearShopModal({ open, onClose, matchSlug, home, away }: Props) {
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    if (open) setCountry(detectCountry());
  }, [open]);

  // ESC key + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const items = useMemo(() => getGearForMatch(home, away), [home, away]);

  const handleClick = (item: GearItem) => {
    const w = window as Window & { gtag?: (...args: unknown[]) => void };
    if (typeof window !== "undefined" && w.gtag) {
      w.gtag("event", "gear_click", {
        item: item.id,
        match: matchSlug,
      });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(7,11,20,0.85)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-2xl max-h-[88vh] sm:max-h-[80vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-[#FBBF24]/15 shadow-2xl"
            style={{
              background:
                "linear-gradient(160deg, rgba(15,23,42,0.98) 0%, rgba(7,11,20,0.99) 100%)",
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 px-5 sm:px-6 pt-5 pb-4 backdrop-blur-md"
              style={{
                background:
                  "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(7,11,20,0.85) 100%)",
                borderBottom: "1px solid rgba(251,191,36,0.1)",
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag size={14} className="text-[#FBBF24]" />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#FBBF24]">
                      Boutique partenaire
                    </p>
                  </div>
                  <h2 className="font-title text-2xl sm:text-3xl tracking-widest gradient-gold leading-tight">
                    ÉQUIPE-TOI
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#94A3B8]">
                    <Flag code={home.countryCode} size="xs" />
                    <span>{home.country}</span>
                    <span className="text-[#475569]">vs</span>
                    <Flag code={away.countryCode} size="xs" />
                    <span>{away.country}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item, idx) => {
                const Icon = ICONS[item.icon];
                const url = buildAmazonSearchUrl(item.query, country, {
                  matchSlug,
                  placement: "gear_modal",
                });
                return (
                  <motion.a
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    href={url}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={() => handleClick(item)}
                    className="group relative rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)",
                    }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${item.accent}15, transparent 70%)`,
                      }}
                    />

                    <div className="relative p-3 sm:p-4 flex flex-col items-center text-center gap-2">
                      {/* Icon block */}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: `${item.accent}12`,
                          border: `1px solid ${item.accent}35`,
                        }}
                      >
                        <Icon size={28} style={{ color: item.accent }} />
                        {/* Mini flag overlay if country-specific */}
                        {item.countryCode && (
                          <div className="absolute -bottom-1 -right-1 rounded-sm overflow-hidden border border-[#0F172A] shadow-md">
                            <Flag code={item.countryCode} size="xs" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5 w-full">
                        <p className="text-[11px] sm:text-xs font-medium text-white leading-tight line-clamp-2">
                          {item.label}
                        </p>
                        {item.hint && (
                          <p className="text-[9px] sm:text-[10px] text-[#64748B] leading-tight line-clamp-1">
                            {item.hint}
                          </p>
                        )}
                      </div>

                      <div
                        className="text-[9px] uppercase tracking-widest font-medium flex items-center gap-1 mt-0.5"
                        style={{ color: item.accent }}
                      >
                        Amazon
                        <ExternalLink size={9} />
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Disclaimer */}
            <div className="px-5 sm:px-6 pb-6 pt-1">
              <p className="text-[10px] text-[#475569] text-center leading-relaxed">
                En tant que Partenaire Amazon, Le Choc des Totems perçoit une
                commission sur les achats qualifiés.
                <br />
                Les prix et la disponibilité peuvent varier.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
