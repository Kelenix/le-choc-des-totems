"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { GiSwordClash } from "react-icons/gi";
import { Users, Zap, Trophy } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
      {/* Background glow grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FBBF24] opacity-5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3B82F6] opacity-5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-4"
        >
          <GiSwordClash
            size={56}
            className="text-[#FBBF24]"
            style={{ filter: "drop-shadow(0 0 20px #FBBF2480)" }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-title text-5xl md:text-8xl lg:text-9xl tracking-widest leading-none mb-4"
          style={{
            background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #EF4444 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {t("title")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-[#94A3B8] text-base md:text-xl max-w-lg mx-auto leading-relaxed"
        >
          {t("subtitle")}
          <br />
          <span className="text-[#FBBF24] font-semibold">{t("vote")}</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-8 text-sm text-[#475569]"
        >
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-[#FBBF24]" />
            {t("stats_nations")}
          </span>
          <span className="w-px h-4 bg-[#1E293B]" />
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-[#FBBF24]" />
            {t("stats_realtime")}
          </span>
          <span className="w-px h-4 bg-[#1E293B]" />
          <span className="flex items-center gap-1.5">
            <Trophy size={14} className="text-[#FBBF24]" />
            {t("stats_live")}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
