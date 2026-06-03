"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { History, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";
import { Flag } from "@/components/ui/Flag";

interface HistoryItem {
  id: string;
  prediction: string;
  isCorrect: boolean | null;
  pointsEarned: number;
  createdAt: string;
  match: {
    id: string; slug: string; scheduledAt: string; status: string;
    homeScore: number | null; awayScore: number | null; result: string | null;
    homeTotem: { country: string; countryCode: string };
    awayTotem: { country: string; countryCode: string };
  };
}

function FlagImg({ code }: { code: string }) {
  return <Flag code={code} size="sm" />;
}

export default function HistoriquePage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { id: userId } = useUserStore();
  const t = useTranslations("history");

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}/history`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setHistory(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = history.filter((h) => {
    if (filter === "won") return h.isCorrect === true;
    if (filter === "lost") return h.isCorrect === false;
    if (filter === "pending") return h.isCorrect === null;
    return true;
  });

  const filters = [
    { label: t("filter_all"),     value: "all" },
    { label: t("filter_won"),     value: "won" },
    { label: t("filter_lost"),    value: "lost" },
    { label: t("filter_pending"), value: "pending" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <History className="text-[#FBBF24]" size={28} />
        <h1 className="font-title text-4xl gradient-gold tracking-widest">{t("title")}</h1>
      </div>

      {history.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: t("total"),  value: history.length,                                          color: "#94A3B8" },
            { label: t("won"),    value: history.filter((h) => h.isCorrect).length,               color: "#FBBF24" },
            { label: t("points"), value: history.reduce((a, h) => a + h.pointsEarned, 0),         color: "#3B82F6" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3 text-center border border-white/5">
              <div className="font-score text-xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[#475569] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <motion.button
            key={f.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
              filter === f.value ? "bg-[#FBBF24] text-black" : "glass border border-white/10 text-[#94A3B8]"
            )}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="glass rounded-xl h-24 animate-pulse border border-white/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-[#475569] border border-white/5">
          {t("no_votes")}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const pred = item.prediction === "HOME" ? item.match.homeTotem.country
                       : item.prediction === "AWAY" ? item.match.awayTotem.country
                       : t("draw");
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "glass rounded-xl p-4 border transition-all",
                  item.isCorrect === true  ? "border-[#FBBF24]/30 bg-[#FBBF24]/5"  :
                  item.isCorrect === false ? "border-[#EF4444]/20 bg-[#EF4444]/5"  :
                  "border-white/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FlagImg code={item.match.homeTotem.countryCode} />
                    <span className="text-sm text-[#94A3B8]">{item.match.homeTotem.country}</span>
                    {item.match.status === "FINISHED" ? (
                      <span className="font-score text-sm text-[#FBBF24]">
                        {item.match.homeScore} - {item.match.awayScore}
                      </span>
                    ) : (
                      <span className="text-[#475569] text-sm">vs</span>
                    )}
                    <span className="text-sm text-[#94A3B8]">{item.match.awayTotem.country}</span>
                    <FlagImg code={item.match.awayTotem.countryCode} />
                  </div>
                  <div>
                    {item.isCorrect === true  && <CheckCircle size={18} className="text-[#FBBF24]" />}
                    {item.isCorrect === false && <XCircle    size={18} className="text-[#EF4444]" />}
                    {item.isCorrect === null  && <Clock      size={18} className="text-[#475569]" />}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[#475569]">
                    {t("my_prediction")}: <span className="text-[#94A3B8]">{pred}</span>
                  </span>
                  {item.pointsEarned > 0 && (
                    <span className="text-xs font-score text-[#FBBF24]">+{item.pointsEarned} pts</span>
                  )}
                </div>
                <div className="text-xs text-[#475569] mt-1">{formatDate(item.createdAt)}</div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
