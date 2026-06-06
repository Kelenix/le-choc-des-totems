"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { GearShopModal } from "@/components/monetization/GearShopModal";

const HOME = { country: "France", countryCode: "FR" };
const AWAY = { country: "Brésil", countryCode: "BR" };

export function HomeBoutiqueBanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => setOpen(true)}
        className="w-full text-left glass rounded-2xl border border-[#FBBF24]/15 hover:border-[#FBBF24]/35 transition-all group overflow-hidden"
      >
        <div className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center shrink-0 group-hover:bg-[#FBBF24]/20 transition-colors">
            <ShoppingBag size={20} className="text-[#FBBF24]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FBBF24] mb-0.5">
              Boutique Coupe du Monde 2026
            </p>
            <p className="text-sm font-medium text-white leading-snug">
              Prépare-toi pour le match
            </p>
            <p className="text-[11px] text-[#475569] mt-0.5">
              Maillots · Ballons · TV 4K · Drapeaux — Amazon
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium uppercase tracking-widest bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/25 group-hover:bg-[#FBBF24]/20 transition-colors">
            Voir
            <ArrowRight size={12} />
          </div>
        </div>

        <div
          className="h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(251,191,36,0.25), transparent)",
          }}
        />
        <p className="px-4 py-2 text-[10px] text-[#475569]">
          En tant que Partenaire Amazon, Le Choc des Totems perçoit une commission sur les achats qualifiés.
        </p>
      </motion.button>

      <GearShopModal
        open={open}
        onClose={() => setOpen(false)}
        home={HOME}
        away={AWAY}
      />
    </>
  );
}
