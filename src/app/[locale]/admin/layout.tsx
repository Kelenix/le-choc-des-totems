"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Swords, Users, Shield, BarChart3, Grid3x3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "admin_authed";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("admin");
  const prefix = locale === "fr" ? "" : `/${locale}`;

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  const NAV = [
    { href: `${prefix}/admin`,               icon: BarChart3, label: t("dashboard") },
    { href: `${prefix}/admin/matchs`,         icon: Swords,    label: t("matches") },
    { href: `${prefix}/admin/groupes`,        icon: Grid3x3,   label: "Groupes" },
    { href: `${prefix}/admin/totems`,         icon: Shield,    label: t("totems") },
    { href: `${prefix}/admin/utilisateurs`,   icon: Users,     label: t("users") },
  ];

  const handleLogin = () => {
    const expected = process.env.NEXT_PUBLIC_ADMIN_SECRET || "";
    if (secret === expected) {
      localStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setSecret("");
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-sm border border-[#FBBF24]/20">
          <h1 className="font-title text-3xl gradient-gold mb-6 text-center">{t("access")}</h1>
          <input
            type="password"
            value={secret}
            onChange={(e) => { setSecret(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Secret"
            className={cn(
              "w-full bg-[#070B14] border rounded-xl px-4 py-3 text-white outline-none mb-2 transition-colors",
              error ? "border-[#EF4444] focus:border-[#EF4444]" : "border-[#1E293B] focus:border-[#FBBF24]"
            )}
          />
          {error && (
            <p className="text-[#EF4444] text-xs mb-3">Code incorrect</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full bg-[#FBBF24] text-black font-bold py-3 rounded-xl mt-2"
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
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-all w-full"
          >
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
