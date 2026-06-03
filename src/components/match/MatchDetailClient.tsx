"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Share2, ArrowLeft, Calendar, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { TotemCard } from "./TotemCard";
import { VoteSection } from "./VoteSection";
import { Countdown } from "./Countdown";
import { useUserStore } from "@/store/userStore";
import { formatDate } from "@/lib/utils";
import type { Match, VoteStats, MatchResult } from "@/types";
import { StreamingCTA } from "@/components/monetization/StreamingCTA";
import { GearShopModal } from "@/components/monetization/GearShopModal";

interface Props {
  match: Match;
  voteStats: VoteStats;
}

export function MatchDetailClient({ match, voteStats }: Props) {
  const { id: userId } = useUserStore();
  const [userVote, setUserVote] = useState<MatchResult | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("common");
  const tv = useTranslations("vote");
  const tm = useTranslations("match");

  const prefix = locale === "fr" ? "" : `/${locale}`;

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/votes?userId=${userId}&matchId=${match.id}`)
      .then((r) => r.json())
      .then((v) => { if (v?.prediction) setUserVote(v.prediction); })
      .catch(() => {});
  }, [userId, match.id]);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${match.homeTotem.country} vs ${match.awayTotem.country} — Vote pour ton totem sur Le Choc des Totems !`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Le Choc des Totems", text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
      }
    } catch {}
  };

  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-5">

      {/* ── Header bar ────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link href={`${prefix}/matchs`}>
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">{t("back")}</span>
          </motion.div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${
            isLive     ? "bg-[#EF4444]/15 text-[#EF4444]" :
            isFinished ? "bg-[#475569]/15 text-[#475569]" :
                         "bg-[#FBBF24]/10 text-[#FBBF24]"
          }`}>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />}
            {isLive ? tm("live_label") : isFinished ? tm("finished_label") : tm("upcoming_label")}
          </span>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShopOpen(true)}
            className="flex items-center gap-1.5 text-[#94A3B8] hover:text-[#FBBF24] transition-colors text-sm"
            aria-label="Équipe-toi"
          >
            <ShoppingBag size={15} />
            <span className="hidden sm:inline">Équipe-toi</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center gap-1.5 text-[#94A3B8] hover:text-[#FBBF24] transition-colors text-sm"
          >
            <Share2 size={15} />
            <span className="hidden sm:inline">{t("share")}</span>
          </motion.button>
        </div>
      </div>

      {/* ── Round / group ─────────────────────────────── */}
      {match.round && (
        <p className="text-center text-[#475569] text-xs uppercase tracking-[0.2em]">
          {match.round}
        </p>
      )}

      {/* ── Arena card ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-safe rounded-2xl border border-[#FBBF24]/12 py-8 px-4"
        style={{
          background: "linear-gradient(145deg, rgba(15,23,42,0.92) 0%, rgba(7,11,20,0.96) 100%)",
        }}
      >
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-[#3B82F6]/15 rounded-full blur-[50px]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-[#EF4444]/15 rounded-full blur-[50px]" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-2">
          {/* Home */}
          <div className="flex-1 min-w-0">
            <TotemCard totem={match.homeTotem} side="home" size="md" />
          </div>

          {/* Center */}
          <div className="flex-shrink-0 w-24 text-center space-y-2">
            {isFinished ? (
              <div className="font-score text-2xl text-[#FBBF24] leading-none">
                {match.homeScore} - {match.awayScore}
              </div>
            ) : (
              <>
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="font-title text-3xl gradient-gold"
                >
                  {tm("vs")}
                </motion.div>
                <Countdown date={match.scheduledAt} />
              </>
            )}
            <div className="flex items-center justify-center gap-1 text-[10px] text-[#334155]">
              <Calendar size={10} />
              <span>{formatDate(match.scheduledAt)}</span>
            </div>
          </div>

          {/* Away */}
          <div className="flex-1 min-w-0">
            <TotemCard totem={match.awayTotem} side="away" size="md" />
          </div>
        </div>
      </motion.div>

      {/* ── Totem descriptions ────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {[match.homeTotem, match.awayTotem].map((totem) => (
          <div key={totem.id} className="glass card-safe rounded-xl p-4">
            <div className="font-title text-sm text-[#FBBF24] mb-1.5 leading-tight">{totem.name}</div>
            <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
              {totem.description || `L'animal totem de ${totem.country}`}
            </p>
          </div>
        ))}
      </div>

      {/* ── Streaming partner CTA (page match) ────────── */}
      {!isFinished && (
        <StreamingCTA
          matchSlug={match.slug}
          homeCountry={match.homeTotem.country}
          awayCountry={match.awayTotem.country}
        />
      )}

      {/* ── Vote section ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass card-safe rounded-2xl p-5"
      >
        <h2 className="font-title text-xl tracking-wider text-center mb-5 gradient-gold">
          {tv("title")}
        </h2>
        <VoteSection
          match={match}
          userVote={userVote}
          voteStats={voteStats}
          onVote={setUserVote}
        />
      </motion.div>

      {/* ── Gear shop teaser (carte cliquable, ouvre la modale) ── */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setShopOpen(true)}
        className="w-full glass card-safe rounded-2xl p-4 border border-[#FBBF24]/15 hover:border-[#FBBF24]/30 transition-all text-left group relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#FBBF24]/5 blur-3xl group-hover:bg-[#FBBF24]/10 transition-colors" />
        <div className="relative flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
            style={{
              background: "rgba(251,191,36,0.12)",
              border: "1px solid rgba(251,191,36,0.35)",
            }}
          >
            <ShoppingBag size={20} className="text-[#FBBF24]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-[#FBBF24] mb-0.5">
              Boutique partenaire
            </p>
            <p className="font-title text-base text-white tracking-wide leading-tight">
              ÉQUIPE-TOI POUR CE DUEL
            </p>
            <p className="text-xs text-[#64748B] mt-0.5">
              Maillots, ballons, drapeaux, TV 4K — sélection officielle
            </p>
          </div>
          <span className="text-[#FBBF24] text-xl group-hover:translate-x-1 transition-transform shrink-0">
            →
          </span>
        </div>
      </motion.button>

      {/* ── Gear shop modal ───────────────────────────── */}
      <GearShopModal
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        matchSlug={match.slug}
        home={match.homeTotem}
        away={match.awayTotem}
      />
    </div>
  );
}
