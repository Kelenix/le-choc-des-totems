"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getTimeUntil } from "@/lib/utils";

export function Countdown({ date }: { date: string }) {
  const [time, setTime] = useState(getTimeUntil(date));
  const t = useTranslations("match");

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeUntil(date)), 1000);
    return () => clearInterval(id);
  }, [date]);

  if (time.expired) {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <span className="w-2 h-2 bg-[#EF4444] rounded-full animate-pulse" />
        <span className="font-score text-xs tracking-widest text-[#EF4444]">
          {t("live_indicator")}
        </span>
      </div>
    );
  }

  const units = [
    { label: t("countdown_days"),    value: time.days },
    { label: t("countdown_hours"),   value: time.hours },
    { label: t("countdown_minutes"), value: time.minutes },
    { label: t("countdown_seconds"), value: time.seconds },
  ];

  return (
    <div className="flex items-end justify-center gap-1">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-end gap-1">
          <div className="text-center">
            <motion.div
              key={u.value}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-score text-lg leading-none text-[#FBBF24]"
            >
              {String(u.value).padStart(2, "0")}
            </motion.div>
            <div className="text-[8px] text-[#475569] tracking-widest mt-0.5">{u.label}</div>
          </div>
          {i < 3 && (
            <span className="font-score text-[#FBBF24]/50 text-base leading-none mb-3 animate-pulse">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
