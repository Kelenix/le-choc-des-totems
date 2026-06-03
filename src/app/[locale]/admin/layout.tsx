"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Swords, Users, Shield, BarChart3, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("admin");
  const prefix = locale === "fr" ? "" : `/${locale}`;

  const NAV = [
    { href: `${prefix}/admin`,               icon: BarChart3, label: t("dashboard") },
    { href: `${prefix}/admin/matchs`,         icon: Swords,    label: t("matches") },
    { href: `${prefix}/admin/groupes`,        icon: Grid3x3,   label: "Groupes" },
    { href: `${prefix}/admin/totems`,         icon: Shield,    label: t("totems") },
    { href: `${prefix}/admin/utilisateurs`,   icon: Users,     label: t("users") },
  ];

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-sm border border-[#FBBF24]/20">
          <h1 className="font-title text-3xl gradient-gold mb-6 text-center">{t("access")}</h1>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setAuthed(true)}
            placeholder="Secret"
            className="w-full bg-[#070B14] border border-[#1E293B] rounded-xl px-4 py-3 text-white outline-none mb-4 focus:border-[#FBBF24]"
          />
          <button
            onClick={() => setAuthed(true)}
            className="w-full bg-[#FBBF24] text-black font-bold py-3 rounded-xl"
          >
            {t("enter")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-52 glass border-r border-white/5 flex flex-col p-4 gap-1">
        <div className="font-title text-xl gradient-gold tracking-widest mb-6 px-2">{t("title")}</div>
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active ? "bg-[#FBBF24]/10 text-[#FBBF24]" : "text-[#94A3B8] hover:text-white hover:bg-white/5"
              )}>
                <item.icon size={15} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
