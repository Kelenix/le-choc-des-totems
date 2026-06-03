"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Trophy } from "lucide-react";
import { GiLaurelCrown, GiMedal, GiRank3 } from "react-icons/gi";
import type { UserWithRank } from "@/types";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

export default function ClassementPage() {
  const [users, setUsers] = useState<UserWithRank[]>([]);
  const [loading, setLoading] = useState(true);
  const { id: currentUserId } = useUserStore();
  const t = useTranslations("ranking");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUsers(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const top3 = users.slice(0, 3);
  const PODIUM = [
    { rank: 2, height: "h-24", color: "#94A3B8", Icon: GiMedal,       delay: 0.2 },
    { rank: 1, height: "h-32", color: "#FBBF24", Icon: GiLaurelCrown, delay: 0 },
    { rank: 3, height: "h-16", color: "#B45309", Icon: GiRank3,        delay: 0.4 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="text-[#FBBF24]" size={28} />
        <h1 className="font-title text-4xl gradient-gold tracking-widest">{t("title")}</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl h-16 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-2 mb-10 h-52">
              {PODIUM.map((pos) => {
                const user = top3[pos.rank - 1];
                if (!user) return null;
                return (
                  <motion.div
                    key={pos.rank}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: pos.delay, type: "spring" }}
                    className="flex flex-col items-center gap-2 flex-1"
                  >
                    <pos.Icon size={28} style={{ color: pos.color }} />
                    <div className="text-sm font-semibold text-white truncate max-w-full px-1 text-center">
                      {user.pseudo}
                    </div>
                    <div className="font-score text-xs" style={{ color: pos.color }}>
                      {user.points} {t("points")}
                    </div>
                    <div
                      className={cn("w-full rounded-t-xl flex items-end justify-center pb-2", pos.height)}
                      style={{ background: `${pos.color}20`, border: `1px solid ${pos.color}40` }}
                    >
                      <span className="font-title text-2xl" style={{ color: pos.color }}>
                        #{pos.rank}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          <div className="space-y-2">
            {users.map((user, i) => {
              const isMe = user.id === currentUserId;
              const RankEl = i === 0 ? <GiLaurelCrown size={20} style={{ color: "#FBBF24" }} />
                           : i === 1 ? <GiMedal size={20} style={{ color: "#94A3B8" }} />
                           : i === 2 ? <GiRank3 size={20} style={{ color: "#B45309" }} />
                           : <span className="font-score text-xs text-[#475569]">#{i + 1}</span>;
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all",
                    isMe ? "bg-[#FBBF24]/10 border-[#FBBF24]/30" : "glass border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="w-7 flex justify-center">{RankEl}</div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("font-semibold text-sm truncate", isMe ? "text-[#FBBF24]" : "text-white")}>
                      {user.pseudo} {isMe && <span className="text-xs text-[#94A3B8]">({t("you")})</span>}
                    </div>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {user.badges?.slice(0, 3).map((ub) => (
                        <span key={ub.id} className="text-xs text-[#FBBF24]" title={ub.badge.name}>
                          {ub.badge.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="font-score text-sm text-[#FBBF24]">{user.points} {t("points")}</div>
                </motion.div>
              );
            })}

            {users.length === 0 && (
              <div className="glass rounded-xl p-12 text-center text-[#475569] border border-white/5">
                {t("no_players")}<br />
                <span className="text-sm mt-2 block">{t("start_voting")}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
