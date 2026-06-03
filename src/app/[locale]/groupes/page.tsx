"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Grid3x3 } from "lucide-react";
import { Flag } from "@/components/ui/Flag";
import { TotemIcon } from "@/components/ui/TotemIcon";
import { formatDate, cn } from "@/lib/utils";

interface TeamStanding {
  totem: { id: string; country: string; countryCode: string; name: string; animal: string };
  played: number; won: number; drawn: number; lost: number;
  goalsFor: number; goalsAgainst: number; goalDiff: number; points: number;
}
interface GroupMatch {
  id: string;
  slug: string;
  status: string;
  scheduledAt: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTotem: { country: string; countryCode: string };
  awayTotem: { country: string; countryCode: string };
}

interface Group {
  letter: string;
  teams: TeamStanding[];
  matches: GroupMatch[];
}

export default function GroupesPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const t = useTranslations("groups");
  const locale = useLocale();
  const prefix = locale === "fr" ? "" : `/${locale}`;

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setGroups(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  const filtered = activeGroup ? groups.filter((g) => g.letter === activeGroup) : groups;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Grid3x3 className="text-[#FBBF24]" size={28} />
        <h1 className="font-title text-4xl gradient-gold tracking-widest">{t("title")}</h1>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <button
          onClick={() => setActiveGroup(null)}
          className={cn(
            "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
            activeGroup === null ? "bg-[#FBBF24] text-black" : "glass text-[#94A3B8]"
          )}
        >
          {t("all")}
        </button>
        {groups.map((g) => (
          <button
            key={g.letter}
            onClick={() => setActiveGroup(g.letter)}
            className={cn(
              "shrink-0 w-10 h-10 rounded-full text-sm font-bold font-title tracking-wider transition-all",
              activeGroup === g.letter ? "bg-[#FBBF24] text-black" : "glass text-[#94A3B8] hover:text-white"
            )}
          >
            {g.letter}
          </button>
        ))}
      </div>

      <div className={cn("grid gap-4", activeGroup ? "grid-cols-1" : "md:grid-cols-2")}>
        {filtered.map((g, i) => (
          <motion.div
            key={g.letter}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="font-title text-2xl tracking-widest text-[#FBBF24]">
                {t("group")} {g.letter}
              </h2>
              <span className="text-xs text-[#475569]">{g.matches.length} {t("matches")}</span>
            </div>

            {/* Standings table */}
            <div className="p-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-[#475569] uppercase tracking-wider">
                    <th className="text-left py-2 pl-2">#</th>
                    <th className="text-left py-2">{t("team")}</th>
                    <th className="text-center py-2 w-8">{t("played_short")}</th>
                    <th className="text-center py-2 w-8">{t("gd_short")}</th>
                    <th className="text-center py-2 w-8 text-[#FBBF24]">{t("pts_short")}</th>
                  </tr>
                </thead>
                <tbody>
                  {g.teams.map((team, idx) => (
                    <tr
                      key={team.totem.countryCode}
                      className={cn(
                        "border-t border-white/5",
                        idx < 2 && "bg-[#10B981]/5"
                      )}
                    >
                      <td className="py-2.5 pl-2">
                        <span
                          className={cn(
                            "inline-flex w-5 h-5 items-center justify-center rounded font-score text-[10px]",
                            idx === 0 ? "bg-[#FBBF24] text-black" :
                            idx === 1 ? "bg-[#10B981]/30 text-[#10B981]" :
                            idx === 2 ? "bg-[#475569]/30 text-[#94A3B8]" :
                                        "text-[#475569]"
                          )}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Flag code={team.totem.countryCode} size="sm" />
                          <TotemIcon countryCode={team.totem.countryCode} size={18} />
                          <span className="text-white text-xs truncate">{team.totem.country}</span>
                        </div>
                      </td>
                      <td className="text-center text-[#94A3B8] text-xs">{team.played}</td>
                      <td className="text-center text-[#94A3B8] text-xs">
                        {team.goalDiff > 0 ? "+" : ""}{team.goalDiff}
                      </td>
                      <td className="text-center font-score text-sm text-[#FBBF24]">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Matches list */}
            {activeGroup && (
              <div className="border-t border-white/5 p-3 space-y-2">
                <div className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">
                  {t("matches")}
                </div>
                {g.matches.map((m) => (
                  <Link key={m.id} href={`${prefix}/match/${m.slug}`}>
                    <div className="flex items-center justify-between text-xs p-2 rounded hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-1.5">
                        <Flag code={m.homeTotem.countryCode} size="xs" />
                        <span className="text-[#94A3B8]">{m.homeTotem.country}</span>
                      </div>
                      <div className="text-center">
                        {m.status === "FINISHED" ? (
                          <span className="font-score text-[#FBBF24]">
                            {m.homeScore} - {m.awayScore}
                          </span>
                        ) : (
                          <span className="text-[#475569] text-[10px]">{formatDate(m.scheduledAt)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#94A3B8]">{m.awayTotem.country}</span>
                        <Flag code={m.awayTotem.countryCode} size="xs" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center text-[#475569]">
          {t("empty")}
        </div>
      )}
    </div>
  );
}
