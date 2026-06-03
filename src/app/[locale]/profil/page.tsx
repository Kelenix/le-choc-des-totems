"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { User, Trophy, Target, Flame, LogOut } from "lucide-react";
import { GiCrystalBall, GiWolfHead, GiLion, GiLightningStorm, GiImperialCrown, GiFireShield } from "react-icons/gi";
import { useUserStore } from "@/store/userStore";
import { clearLocalUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import type { UserWithRank } from "@/types";
import { cn } from "@/lib/utils";

const BADGE_ICONS: Record<string, React.ElementType> = {
  "Oracle": GiCrystalBall,
  "Prédateur": GiWolfHead, "Predator": GiWolfHead, "Depredador": GiWolfHead,
  "Alpha": GiLion, "Alfa": GiLion,
  "Légende": GiLightningStorm, "Legend": GiLightningStorm, "Leyenda": GiLightningStorm,
  "Champion Totem": GiImperialCrown, "Totem Champion": GiImperialCrown, "Campeón Tótem": GiImperialCrown,
  "Invincible": GiFireShield, "Invencible": GiFireShield,
};

const LOCKED_BADGES = [
  { key: "Oracle", Icon: GiCrystalBall },
  { key: "Alpha", Icon: GiLion },
  { key: "Predator", Icon: GiWolfHead },
  { key: "Legend", Icon: GiLightningStorm },
  { key: "Champion", Icon: GiImperialCrown },
  { key: "Invincible", Icon: GiFireShield },
];

export default function ProfilPage() {
  const { id, pseudo, logout } = useUserStore();
  const [profile, setProfile] = useState<UserWithRank | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("profile");
  const tb = useTranslations("badges");
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleLogout = () => {
    clearLocalUser();
    logout();
    router.push("/");
    router.refresh();
  };

  if (!id || !pseudo) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 text-center">
        <p className="text-[#94A3B8]">{t("not_connected")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <User className="text-[#FBBF24]" size={28} />
          <h1 className="font-title text-4xl gradient-gold tracking-widest">{t("title")}</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 text-[#475569] hover:text-[#EF4444] transition-colors text-sm"
        >
          <LogOut size={16} />
          {t("logout")}
        </motion.button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="glass rounded-xl h-20 animate-pulse border border-white/5" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-[#FBBF24]/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#FBBF24]/10 border-2 border-[#FBBF24]/40 flex items-center justify-center">
                <span className="font-title text-3xl gradient-gold">
                  {pseudo.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-title text-3xl text-white">{pseudo}</div>
                {profile && <div className="text-[#94A3B8] text-sm">{t("rank")} #{profile.rank || "—"}</div>}
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          {profile && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Trophy,  label: t("points"),    value: profile.points,           color: "#FBBF24" },
                { icon: Target,  label: t("win_rate"),  value: `${profile.winRate || 0}%`, color: "#3B82F6" },
                { icon: Flame,   label: t("streak"),    value: profile.streak,           color: "#EF4444" },
                { icon: User,    label: t("predictions"),value: profile.totalVotes || 0, color: "#94A3B8" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-xl p-4 border border-white/5"
                >
                  <stat.icon size={18} style={{ color: stat.color }} className="mb-2" />
                  <div className="font-score text-2xl" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs text-[#475569] mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Badges earned */}
          {profile?.badges && profile.badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <h2 className="font-title text-xl gradient-gold tracking-wider mb-4">{t("my_badges")}</h2>
              <div className="grid grid-cols-3 gap-3">
                {profile.badges.map((ub) => {
                  const Icon = BADGE_ICONS[ub.badge.name] ?? GiCrystalBall;
                  return (
                    <div key={ub.id} className="glass rounded-xl p-3 text-center border border-[#FBBF24]/20">
                      <Icon size={32} className="text-[#FBBF24] mx-auto mb-1" style={{ filter: "drop-shadow(0 0 8px #FBBF2460)" }} />
                      <div className="text-xs font-semibold text-white">{ub.badge.name}</div>
                      <div className="text-xs text-[#475569] mt-0.5 leading-tight">{ub.badge.description}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Locked badges */}
          {profile?.badges && profile.badges.length === 0 && (
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h2 className="font-title text-xl gradient-gold tracking-wider mb-4">{t("badges_to_unlock")}</h2>
              <div className="grid grid-cols-3 gap-3">
                {LOCKED_BADGES.map(({ key, Icon }) => (
                  <div key={key} className="glass rounded-xl p-3 text-center border border-white/5 opacity-30">
                    <Icon size={32} className="text-[#94A3B8] mx-auto mb-1" />
                    <div className="text-xs text-[#475569]">{tb(key.toLowerCase() as any)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
