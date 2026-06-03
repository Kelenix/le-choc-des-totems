"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { GiCrossedSwords } from "react-icons/gi";
import { MatchCard } from "@/components/match/MatchCard";
import type { MatchWithVote } from "@/types";
import { cn } from "@/lib/utils";

export default function MatchsPage() {
  const [matches, setMatches] = useState<MatchWithVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const t = useTranslations("match");
  const tc = useTranslations("common");

  useEffect(() => {
    setLoading(true);
    const url = filter ? `/api/matches?status=${filter}&limit=50` : "/api/matches?limit=50";
    fetch(url)
      .then((r) => r.json())
      .then((data: MatchWithVote[]) => { if (Array.isArray(data)) setMatches(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const filters = [
    { label: "Tous / All / Todos", value: "" },
    { label: t("upcoming_label"), value: "UPCOMING" },
    { label: t("live_label"),     value: "LIVE" },
    { label: t("finished_label"), value: "FINISHED" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <GiCrossedSwords size={28} className="text-[#FBBF24]" />
        <h1 className="font-title text-4xl gradient-gold tracking-widest">{t("upcoming")}</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {filters.map((f) => (
          <motion.button
            key={f.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
              filter === f.value ? "bg-[#FBBF24] text-black" : "glass border border-white/10 text-[#94A3B8] hover:text-white"
            )}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-2xl h-32 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-[#475569] border border-white/5">
          {tc("no_matches")}
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match, i) => <MatchCard key={match.id} match={match} index={i} />)}
        </div>
      )}
    </div>
  );
}
