"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Calendar, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TotemIcon } from "@/components/ui/TotemIcon";
import { Flag } from "@/components/ui/Flag";
import type { MatchWithVote } from "@/types";
import { cn } from "@/lib/utils";

interface Props { match: MatchWithVote; index?: number }

function FlagImg({ code }: { code: string }) {
  return <Flag code={code} size="md" className="mx-auto" />;
}

export function MatchCard({ match, index = 0 }: Props) {
  const t  = useTranslations("match");
  const tv = useTranslations("vote");
  const locale = useLocale();
  const prefix = locale === "fr" ? "" : `/${locale}`;

  const STATUS_CFG = {
    UPCOMING: { bg: "bg-[#FBBF24]/10", text: "text-[#FBBF24]",  label: t("upcoming_label") },
    LIVE:     { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]",   label: t("live_label") },
    FINISHED: { bg: "bg-[#475569]/15", text: "text-[#64748B]",   label: t("finished_label") },
    CANCELLED:{ bg: "bg-[#475569]/10", text: "text-[#475569]",   label: t("cancelled_label") },
  };
  const s = STATUS_CFG[match.status] ?? STATUS_CFG.UPCOMING;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`${prefix}/match/${match.slug}`} className="block">
        <div className="glass card-safe rounded-2xl p-4 hover:border-[#FBBF24]/25 transition-all duration-200 group cursor-pointer">

          {/* Top row: status + round */}
          <div className="flex items-center justify-between mb-4">
            <span className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium", s.bg, s.text)}>
              {match.status === "LIVE" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
              )}
              {s.label}
            </span>
            {match.round && <span className="text-[11px] text-[#475569] truncate max-w-[120px]">{match.round}</span>}
          </div>

          {/* Teams row */}
          <div className="flex items-center gap-2">
            {/* Home team */}
            <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <TotemIcon countryCode={match.homeTotem.countryCode} size={36} />
              <FlagImg code={match.homeTotem.countryCode} />
              <span className="font-title text-sm text-white group-hover:text-[#FBBF24] transition-colors truncate w-full text-center leading-tight">
                {match.homeTotem.country}
              </span>
            </div>

            {/* Score / VS */}
            <div className="flex-shrink-0 text-center w-20">
              {match.status === "FINISHED" ? (
                <div className="font-score text-xl text-[#FBBF24] leading-none">
                  {match.homeScore} - {match.awayScore}
                </div>
              ) : (
                <div className="font-title text-xl text-[#FBBF24] animate-pulse-glow">{t("vs")}</div>
              )}
              {match.userVote && (
                <div className="text-[10px] text-[#FBBF24] mt-1 font-medium">{tv("voted")}</div>
              )}
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <TotemIcon countryCode={match.awayTotem.countryCode} size={36} />
              <FlagImg code={match.awayTotem.countryCode} />
              <span className="font-title text-sm text-white group-hover:text-[#FBBF24] transition-colors truncate w-full text-center leading-tight">
                {match.awayTotem.country}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[11px] text-[#475569]">
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              {formatDate(match.scheduledAt)}
            </span>
            {match.voteStats && match.voteStats.total > 0 && (
              <span className="flex items-center gap-1.5">
                <Users size={11} />
                {match.voteStats.total.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
