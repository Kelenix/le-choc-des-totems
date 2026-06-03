"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GiCrossedSwords } from "react-icons/gi";
import { Countdown } from "@/components/match/Countdown";
import { TotemCard } from "@/components/match/TotemCard";
import type { Match } from "@/types";

export function FeaturedMatch() {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("match");
  const locale = useLocale();
  const prefix = locale === "fr" ? "" : `/${locale}`;

  useEffect(() => {
    fetch("/api/matches?status=UPCOMING&limit=1")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d) && d.length > 0) setMatch(d[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass card-safe rounded-2xl p-6 animate-pulse">
        <div className="h-5 w-36 bg-[#1E293B] rounded mx-auto mb-6" />
        <div className="flex justify-between items-center gap-4">
          <div className="h-32 flex-1 bg-[#1E293B] rounded-xl" />
          <div className="h-10 w-14 bg-[#1E293B] rounded-lg shrink-0" />
          <div className="h-32 flex-1 bg-[#1E293B] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!match) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-safe rounded-2xl border border-[#FBBF24]/15"
      style={{ background: "linear-gradient(145deg, rgba(15,23,42,0.92) 0%, rgba(7,11,20,0.96) 100%)" }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-48 h-48 bg-[#3B82F6]/10 rounded-full blur-[70px]" />
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-48 h-48 bg-[#EF4444]/10 rounded-full blur-[70px]" />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 text-xs text-[#FBBF24] uppercase tracking-[0.25em] font-medium">
            <GiCrossedSwords size={14} />
            {t("featured")}
          </span>
          {match.round && <p className="text-[#475569] text-xs mt-1">{match.round}</p>}
        </div>

        {/* Totems + VS */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <TotemCard totem={match.homeTotem} side="home" size="lg" />
          </div>

          <div className="flex-shrink-0 w-28 text-center space-y-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="font-title text-4xl gradient-gold"
            >
              {t("vs")}
            </motion.div>
            <Countdown date={match.scheduledAt} />
          </div>

          <div className="flex-1 min-w-0">
            <TotemCard totem={match.awayTotem} side="away" size="lg" />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-7">
          <Link href={`${prefix}/match/${match.slug}`}>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="glow-gold rounded-xl px-8 py-3 font-bold text-black text-base tracking-wide"
              style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)" }}
            >
              {t("vote_now")}
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
