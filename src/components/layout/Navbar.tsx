"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Home, Swords, Trophy, History, User, Grid3x3, ShoppingBag } from "lucide-react";
import { GiSwordClash } from "react-icons/gi";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { GearShopModal } from "@/components/monetization/GearShopModal";
import { cn } from "@/lib/utils";

const GENERIC_HOME = { country: "France", countryCode: "FR" };
const GENERIC_AWAY = { country: "Brésil", countryCode: "BR" };

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [shopOpen, setShopOpen] = useState(false);

  const prefix = locale === "fr" ? "" : `/${locale}`;

  const navItems = [
    { href: `${prefix}/`,           icon: Home,    label: t("home") },
    { href: `${prefix}/matchs`,     icon: Swords,  label: t("matches") },
    { href: `${prefix}/groupes`,    icon: Grid3x3, label: t("groups") },
    { href: `${prefix}/classement`, icon: Trophy,  label: t("ranking") },
    { href: `${prefix}/historique`, icon: History, label: t("history") },
    { href: `${prefix}/profil`,     icon: User,    label: t("profile") },
  ];

  const isActive = (href: string) => {
    const clean = href === `${prefix}/` ? (prefix || "/") : href;
    return pathname === clean || (clean !== (prefix || "/") && pathname.startsWith(clean));
  };

  return (
    <>
      {/* Desktop top navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between h-16">
          <Link href={prefix || "/"} className="flex items-center gap-2">
            <GiSwordClash size={24} className="text-[#FBBF24]" />
            <span className="font-title text-2xl gradient-gold tracking-widest">
              LE CHOC DES TOTEMS
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-[#FBBF24]/10 text-[#FBBF24]"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon size={15} />
                  {item.label}
                </motion.div>
              </Link>
            ))}

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              onClick={() => setShopOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#FBBF24]/10 text-[#FBBF24] hover:bg-[#FBBF24]/20 transition-all duration-200 border border-[#FBBF24]/20 ml-1"
            >
              <ShoppingBag size={15} />
              Boutique
            </motion.button>

            <div className="ml-3">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 safe-bottom">
        <div className="flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200 relative",
                    active ? "text-[#FBBF24]" : "text-[#475569]"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute top-0 h-0.5 w-8 bg-[#FBBF24] rounded-full"
                    />
                  )}
                  <item.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile language switcher — floating */}
      <div className="md:hidden fixed top-3 right-3 z-50">
        <LanguageSwitcher />
      </div>

      {/* Mobile boutique button — floating */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => setShopOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-[#FBBF24]/25 text-[#FBBF24] text-xs font-medium"
      >
        <ShoppingBag size={14} />
        Boutique
      </motion.button>

      <GearShopModal
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        home={GENERIC_HOME}
        away={GENERIC_AWAY}
      />
    </>
  );
}
