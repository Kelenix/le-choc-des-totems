"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Tv2, ExternalLink } from "lucide-react";
import {
  pickStreaming,
  buildStreamingUrl,
  type StreamingProvider,
} from "@/lib/streaming";
import { detectCountry } from "@/lib/affiliates";

interface Props {
  matchSlug?: string;
  homeCountry: string;
  awayCountry: string;
}

/**
 * CTA streaming "Regarder en direct" affiché sur la page match.
 * Géo-targeting via locale du navigateur, choix du diffuseur le plus
 * pertinent (Canal+, beIN, DAZN, Fubo, SuperSport, FIFA+...).
 */
export function StreamingCTA({ matchSlug, homeCountry, awayCountry }: Props) {
  const locale = useLocale();
  const [country, setCountry] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCountry(detectCountry());
    setMounted(true);
  }, []);

  const provider: StreamingProvider | null = useMemo(
    () => (mounted ? pickStreaming(country, locale) : null),
    [country, locale, mounted]
  );

  if (!mounted || !provider) return null;

  const url = buildStreamingUrl(provider, {
    matchSlug,
    placement: "match_page_stream",
  });

  return (
    <motion.a
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      href={url}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => {
        const w = window as Window & { gtag?: (...args: unknown[]) => void };
        if (typeof window !== "undefined" && w.gtag) {
          w.gtag("event", "streaming_click", {
            provider: provider.id,
            match: matchSlug,
          });
        }
      }}
      className="block glass card-safe rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all group"
    >
      <div className="p-4 flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden"
          style={{
            background: `${provider.brand}15`,
            border: `1px solid ${provider.brand}40`,
          }}
        >
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-xl"
            style={{ boxShadow: `inset 0 0 12px ${provider.brand}30` }}
          />
          <Tv2 size={18} style={{ color: provider.brand }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
            <p className="text-[10px] uppercase tracking-widest text-[#94A3B8]">
              Regarder en direct
            </p>
          </div>
          <p className="text-sm text-white leading-tight truncate">
            {homeCountry} <span className="text-[#475569]">vs</span>{" "}
            {awayCountry}{" "}
            <span style={{ color: provider.brand }} className="font-medium">
              sur {provider.name}
            </span>
          </p>
        </div>

        <ExternalLink
          size={16}
          className="text-[#475569] group-hover:text-[#FBBF24] transition-colors shrink-0"
        />
      </div>

      <div
        className="h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${provider.brand}40, transparent)`,
        }}
      />

      <p className="px-4 py-2 text-[10px] text-[#475569]">
        Partenaire diffusion · {provider.tagline}
      </p>
    </motion.a>
  );
}
