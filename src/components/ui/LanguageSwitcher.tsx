"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "fr", label: "Français", short: "FR" },
  { code: "en", label: "English",  short: "EN" },
  { code: "es", label: "Español",  short: "ES" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLocale = (newLocale: string) => {
    setOpen(false);

    // 1. Set the NEXT_LOCALE cookie so middleware respects the choice
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

    // 2. Compute the path without any locale prefix
    const segments = pathname.split("/").filter(Boolean);
    const localeInPath = LOCALES.some((l) => l.code === segments[0]);
    const rest = localeInPath ? segments.slice(1) : segments;
    const cleanPath = "/" + rest.join("/");

    // 3. Build the new URL (FR = default = no prefix, others = with prefix)
    const newPath = newLocale === "fr"
      ? (cleanPath === "/" ? "/" : cleanPath)
      : `/${newLocale}${cleanPath === "/" ? "" : cleanPath}`;

    // 4. Hard navigation to ensure full reload of messages
    window.location.href = newPath;
  };

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass hover:border-[#FBBF24]/30 transition-all text-sm text-[#94A3B8] hover:text-white"
      >
        <Globe size={14} />
        <span className="font-medium">{current.short}</span>
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-40 glass rounded-xl overflow-hidden z-50 shadow-2xl"
          >
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => switchLocale(l.code)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors text-left",
                  locale === l.code
                    ? "text-[#FBBF24] bg-[#FBBF24]/10"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                )}
              >
                <span className="font-mono text-xs font-bold w-6">{l.short}</span>
                <span>{l.label}</span>
                {locale === l.code && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
