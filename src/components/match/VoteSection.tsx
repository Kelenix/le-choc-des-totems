"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import type { Match, MatchResult, VoteStats } from "@/types";
import { cn } from "@/lib/utils";
import { PostVoteAffiliate } from "@/components/monetization/PostVoteAffiliate";

interface Props {
  match: Match;
  userVote?: MatchResult | null;
  voteStats?: VoteStats;
  onVote?: (result: MatchResult) => void;
}

const CFG: Record<MatchResult, { color: string; borderActive: string; bgActive: string }> = {
  HOME: { color: "#3B82F6", borderActive: "border-[#3B82F6]", bgActive: "bg-[#3B82F6]/12" },
  DRAW: { color: "#FBBF24", borderActive: "border-[#FBBF24]", bgActive: "bg-[#FBBF24]/10" },
  AWAY: { color: "#EF4444", borderActive: "border-[#EF4444]", bgActive: "bg-[#EF4444]/12" },
};

export function VoteSection({ match, userVote, voteStats, onVote }: Props) {
  const { isAuthenticated, id: userId, requestLogin } = useUserStore();
  const t = useTranslations("vote");
  const [pending, setPending]     = useState<MatchResult | null>(null);
  const [localVote, setLocalVote] = useState<MatchResult | null>(userVote ?? null);
  const [stats, setStats]         = useState<VoteStats | undefined>(voteStats);
  const [error, setError]         = useState<string | null>(null);

  const isClosed = match.status === "FINISHED" || match.status === "CANCELLED";

  const handleVote = async (prediction: MatchResult) => {
    if (isClosed) return;
    if (!isAuthenticated || !userId) {
      requestLogin();
      return;
    }
    if (!!pending) return;
    if (localVote === prediction) return;

    setPending(prediction);
    setError(null);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, matchId: match.id, prediction }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      // Update local vote
      const prev = stats ?? { home: 0, draw: 0, away: 0, total: 0, homePercent: 0, drawPercent: 0, awayPercent: 0 };
      const next  = { ...prev };
      if (!localVote) {
        next.total++;
      } else {
        const old = localVote.toLowerCase() as "home" | "draw" | "away";
        next[old] = Math.max(0, next[old] - 1);
      }
      const key = prediction.toLowerCase() as "home" | "draw" | "away";
      next[key]++;
      const tot = next.total || 1;
      next.homePercent = Math.round((next.home / tot) * 100);
      next.drawPercent = Math.round((next.draw / tot) * 100);
      next.awayPercent = Math.round((next.away / tot) * 100);

      setLocalVote(prediction);
      setStats(next);
      onVote?.(prediction);
    } catch (e: any) {
      setError(e.message ?? "Erreur inconnue");
    } finally {
      setPending(null);
    }
  };

  const options: { key: MatchResult; label: string }[] = [
    { key: "HOME", label: match.homeTotem.country },
    { key: "DRAW", label: t("draw") },
    { key: "AWAY", label: match.awayTotem.country },
  ];

  return (
    <div className="space-y-5">

      {/* ── Vote buttons ───────────────────────────────── */}
      {!isClosed && (
        <div className="grid grid-cols-3 gap-2.5">
          {options.map(({ key, label }) => {
            const cfg      = CFG[key];
            const selected = localVote === key;
            const loading  = pending === key;
            const disabled = !!pending; // Always clickable to trigger login if not auth

            return (
              <motion.button
                key={key}
                type="button"
                onClick={() => handleVote(key)}
                disabled={disabled}
                whileHover={!disabled ? { scale: 1.03, y: -2 } : undefined}
                whileTap={!disabled  ? { scale: 0.97 }         : undefined}
                className={cn(
                  "relative rounded-2xl p-4 border-2 transition-all duration-200 text-center overflow-hidden",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24]",
                  selected
                    ? `${cfg.bgActive} ${cfg.borderActive}`
                    : "glass border-white/10",
                  !selected && !disabled && "hover:border-white/25",
                  disabled && !selected && "opacity-60 cursor-not-allowed"
                )}
                style={selected ? { boxShadow: `0 0 14px ${cfg.color}35` } : undefined}
              >
                {/* Ripple on selection */}
                {selected && (
                  <motion.div
                    key="ripple"
                    initial={{ scale: 0, opacity: 0.3 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ background: cfg.color }}
                  />
                )}

                <div className="relative z-10 space-y-1">
                  <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest">
                    {key !== "DRAW" ? t("victory") : "—"}
                  </div>
                  <div
                    className="font-title text-sm tracking-wide leading-tight"
                    style={{ color: selected ? cfg.color : "#94A3B8" }}
                  >
                    {label}
                  </div>
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mt-1" />
                  ) : selected ? (
                    <CheckCircle size={16} className="mx-auto mt-1" style={{ color: cfg.color }} />
                  ) : null}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────── */}
      {error && (
        <p className="text-xs text-[#EF4444] text-center">{error}</p>
      )}

      {/* ── Not connected hint ────────────────────────── */}
      {!isAuthenticated && !isClosed && (
        <p className="text-xs text-center text-[#475569]">
          Connecte-toi pour voter
        </p>
      )}

      {/* ── Community stats ───────────────────────────── */}
      <AnimatePresence>
        {(localVote || isClosed) && stats && stats.total > 0 && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <p className="text-center text-[#475569] text-[11px] uppercase tracking-widest">
              {t("community")} · {stats.total.toLocaleString()} {t("votes")}
            </p>

            {[
              { label: match.homeTotem.country, pct: stats.homePercent, color: "#3B82F6", key: "HOME" as MatchResult },
              { label: t("draw"),               pct: stats.drawPercent, color: "#FBBF24", key: "DRAW" as MatchResult },
              { label: match.awayTotem.country, pct: stats.awayPercent, color: "#EF4444", key: "AWAY" as MatchResult },
            ].map((row) => (
              <div key={row.key} className="flex items-center gap-2.5">
                <span className="text-[11px] text-[#94A3B8] w-20 text-right truncate shrink-0">{row.label}</span>
                <div className="flex-1 h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: row.color }}
                  />
                </div>
                <span
                  className="text-xs font-score w-9 text-right shrink-0"
                  style={{ color: localVote === row.key ? row.color : "#64748B" }}
                >
                  {row.pct}%
                </span>
              </div>
            ))}

            {/* Result */}
            {isClosed && match.result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-xl p-3 text-center mt-2"
              >
                <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-1">{t("official_result")}</p>
                <p className="font-score text-2xl text-[#FBBF24]">
                  {match.homeScore} – {match.awayScore}
                </p>
              </motion.div>
            )}

            {/* Partenaire (CTA discret, uniquement après vote sur match non terminé) */}
            {localVote && !isClosed && (
              <PostVoteAffiliate
                matchSlug={match.slug}
                placement="post_vote"
                predictedTeam={
                  localVote === "HOME"
                    ? match.homeTotem.country
                    : localVote === "AWAY"
                      ? match.awayTotem.country
                      : null
                }
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
