"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GiGhost } from "react-icons/gi";

export default function NotFound() {
  const t = useTranslations("common");
  const locale = useLocale();
  const prefix = locale === "fr" ? "" : `/${locale}`;

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <GiGhost size={80} className="text-[#FBBF24] mx-auto mb-6" style={{ filter: "drop-shadow(0 0 20px #FBBF2460)" }} />
        <h1 className="font-title text-6xl gradient-gold mb-4">404</h1>
        <p className="text-[#94A3B8] mb-8">{t("error_404")}</p>
        <Link href={prefix || "/"}>
          <button className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black font-bold px-8 py-3 rounded-xl">
            {t("back_to_arena")}
          </button>
        </Link>
      </div>
    </div>
  );
}
