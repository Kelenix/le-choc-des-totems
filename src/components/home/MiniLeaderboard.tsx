"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Trophy } from "lucide-react";
import { GiLaurelCrown, GiMedal } from "react-icons/gi";
import type { UserWithRank } from "@/types";

const RANK_ICONS = [GiLaurelCrown, GiMedal, GiMedal];
const RANK_COLORS = ["#FBBF24", "#94A3B8", "#B45309"];

export function MiniLeaderboard() {
  const [users, setUsers] = useState<UserWithRank[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("ranking");
  const locale = useLocale();
  const prefix = locale === "fr" ? "" : `/${locale}`;

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUsers(data.slice(0, 5)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-title text-2xl tracking-wider gradient-gold flex items-center gap-2">
          <Trophy size={20} />
          {t("top5")}
        </h2>
        <Link href={`${prefix}/classement`} className="text-xs text-[#94A3B8] hover:text-[#FBBF24] transition-colors">
          {t("see_all")} →
        </Link>
      </div>

      <div className="space-y-2">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl h-12 animate-pulse border border-white/5" />
          ))
        ) : users.length === 0 ? (
          <div className="glass rounded-xl p-4 text-center text-[#475569] text-sm border border-white/5">
            {t("no_players")}
          </div>
        ) : (
          users.map((user, i) => {
            const RankIcon = RANK_ICONS[i];
            const color = RANK_COLORS[i] ?? "#475569";
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl glass border border-white/5"
              >
                {RankIcon ? (
                  <RankIcon size={22} style={{ color }} className="flex-shrink-0" />
                ) : (
                  <span className="font-score text-xs w-5 text-center flex-shrink-0" style={{ color }}>
                    #{i + 1}
                  </span>
                )}
                <span className="flex-1 text-sm text-white font-medium truncate">{user.pseudo}</span>
                <span className="font-score text-sm text-[#FBBF24]">{user.points} {t("points")}</span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
