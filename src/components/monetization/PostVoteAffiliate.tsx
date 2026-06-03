"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { ExternalLink } from "lucide-react";
import {
  pickAffiliate,
  buildAffiliateUrl,
  detectCountry,
  type Affiliate,
} from "@/lib/affiliates";

interface Props {
  matchSlug?: string;
  /** Nom de l'équipe sur laquelle l'utilisateur a voté (pour personnaliser le CTA) */
  predictedTeam?: string | null;
  /** Où s'affiche le CTA — sert au tracking UTM */
  placement?: string;
}

const DISMISS_KEY = "lct_aff_dismissed_until";

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
  return Date.now() < until;
}

function dismissForHours(hours: number) {
  if (typeof window === "undefined") return;
  const until = Date.now() + hours * 3600_000;
  localStorage.setItem(DISMISS_KEY, String(until));
}

/**
 * CTA d'affiliation discret affiché après un vote.
 *
 * Principes :
 *  - Pas d'overlay agressif, juste une carte glassmorphism cohérente avec le design
 *  - Lien externe natif avec rel="sponsored noopener noreferrer" + target="_blank"
 *  - Bouton "Plus tard" qui cache le CTA pendant 24h via localStorage
 *  - Disclaimer +18 obligatoire
 *  - Géo-targeting : on choisit le bookmaker légal/dispo selon le pays de l'user
 */
export function PostVoteAffiliate({
  matchSlug,
  predictedTeam,
  placement = "post_vote",
}: Props) {
  const locale = useLocale();
  const [country, setCountry] = useState<string | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isDismissed()) return;
    setCountry(detectCountry());
    setHidden(false);
  }, []);

  const affiliate: Affiliate | null = useMemo(
    () => (hidden ? null : pickAffiliate(country, locale)),
    [country, locale, hidden]
  );

  if (hidden || !affiliate) return null;

  const url = buildAffiliateUrl(affiliate, { matchSlug, placement });

  const handleDismiss = () => {
    dismissForHours(24);
    setHidden(true);
  };

  const handleClick = () => {
    // Tracking simple via GA si disponible
    const w = window as Window & { gtag?: (...args: unknown[]) => void };
    if (typeof window !== "undefined" && w.gtag) {
      w.gtag("event", "affiliate_click", {
        affiliate: affiliate.id,
        placement,
        match: matchSlug,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="glass rounded-xl border border-white/5 overflow-hidden"
    >
      <div className="p-3.5 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
          style={{
            background: `${affiliate.brand}15`,
            border: `1px solid ${affiliate.brand}40`,
          }}
        >
          <ExternalLink size={16} style={{ color: affiliate.brand }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-[#475569] mb-0.5">
            Partenaire
          </p>
          <p className="text-xs text-[#CBD5E1] leading-snug truncate">
            {predictedTeam
              ? `Confiant sur ${predictedTeam} ? Découvre les cotes`
              : "Découvre les cotes du match sur"}{" "}
            <span style={{ color: affiliate.brand }} className="font-medium">
              {affiliate.name}
            </span>
          </p>
        </div>

        <a
          href={url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={handleClick}
          className="shrink-0 text-[11px] font-medium uppercase tracking-widest px-3 py-2 rounded-lg transition-all hover:scale-[1.03]"
          style={{
            background: `${affiliate.brand}20`,
            color: affiliate.brand,
            border: `1px solid ${affiliate.brand}50`,
          }}
        >
          Voir
        </a>
      </div>

      <div className="px-3.5 pb-2 pt-0.5 flex items-center justify-between gap-2">
        <p className="text-[9px] text-[#475569] leading-tight">
          {affiliate.disclaimer}
        </p>
        <button
          onClick={handleDismiss}
          className="text-[9px] text-[#475569] hover:text-[#94A3B8] underline-offset-2 hover:underline shrink-0"
        >
          Plus tard
        </button>
      </div>
    </motion.div>
  );
}
