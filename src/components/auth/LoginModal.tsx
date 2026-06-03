"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { GiSwordClash, GiTotemHead, GiLion } from "react-icons/gi";
import { saveLocalUser } from "@/lib/auth";
import { useUserStore } from "@/store/userStore";

const schema = z.object({
  pseudo: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[a-zA-Z0-9_\-À-ž]+$/),
  email: z
    .string()
    .email()
    .optional()
    .or(z.literal("")),
  newsletterOptIn: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess: () => void;
}

// Floating particles in background
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 3,
  duration: 3 + Math.random() * 4,
}));

export function LoginModal({ onSuccess }: Props) {
  const { setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const t = useTranslations("auth");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const pseudoValue = watch("pseudo") || "";
  const emailValue = watch("email") || "";
  const newsletterOptIn = watch("newsletterOptIn") ?? false;
  const [emailFocused, setEmailFocused] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const localUser = saveLocalUser(data.pseudo);
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: localUser.id,
          pseudo: localUser.pseudo,
          email: data.email || undefined,
          newsletterOptIn: Boolean(data.newsletterOptIn && data.email),
        }),
      });
      setUser(localUser.id, localUser.pseudo);
      onSuccess();
    } catch {
      const localUser = saveLocalUser(data.pseudo);
      setUser(localUser.id, localUser.pseudo);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden"
        style={{ background: "rgba(7,11,20,0.98)" }}
      >
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.07, 0.04] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, #FBBF24, transparent 70%)" }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.05, 0.03] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, #EF4444, transparent 70%)" }}
          />

          {/* Floating particles */}
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-[#FBBF24]"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
              animate={{ y: [-8, 8, -8], opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: "easeInOut" }}
            />
          ))}

          {/* Horizontal scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #FBBF2430, transparent)" }}
            animate={{ top: ["10%", "90%", "10%"] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          />
        </div>

        {/* Card */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 180 }}
          className="relative w-full max-w-[360px]"
        >
          {/* Corner decorations */}
          <div className="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2 border-[#FBBF24] rounded-tl-2xl" />
          <div className="absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-[#FBBF24] rounded-tr-2xl" />
          <div className="absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-[#FBBF24]/40 rounded-bl-2xl" />
          <div className="absolute -bottom-px -right-px w-8 h-8 border-b-2 border-r-2 border-[#FBBF24]/40 rounded-br-2xl" />

          <div
            className="rounded-2xl px-8 pt-10 pb-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(7,11,20,0.98) 100%)",
              border: "1px solid rgba(251,191,36,0.12)",
            }}
          >
            {/* Inner top shimmer */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, #FBBF2460, transparent)" }}
            />

            {/* Logo area */}
            <div className="text-center mb-9">
              {/* Icon stack */}
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className="relative inline-flex items-center justify-center mb-5"
              >
                {/* Outer ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="absolute w-24 h-24 rounded-full border border-dashed border-[#FBBF24]/20"
                />
                {/* Middle ring */}
                <div className="absolute w-16 h-16 rounded-full border border-[#FBBF24]/10" />
                {/* Icon bg */}
                <div
                  className="relative w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0.02) 70%)",
                    boxShadow: "0 0 30px rgba(251,191,36,0.15), inset 0 0 20px rgba(251,191,36,0.05)",
                  }}
                >
                  <GiSwordClash
                    size={40}
                    style={{
                      color: "#FBBF24",
                      filter: "drop-shadow(0 0 10px #FBBF24AA)",
                    }}
                  />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="font-title text-4xl tracking-[0.12em] leading-none"
                style={{
                  background: "linear-gradient(135deg, #FBBF24 0%, #FDE68A 40%, #F59E0B 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("title")}
              </motion.h1>

              {/* Divider with icon */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="flex items-center justify-center gap-3 mt-3 mb-2"
              >
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#FBBF24]/30" />
                <GiTotemHead size={14} className="text-[#FBBF24]/50" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#FBBF24]/30" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[#64748B] text-sm tracking-wide"
              >
                {t("subtitle")}
              </motion.p>
            </div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Input */}
              <div>
                <label className="text-[#FBBF24]/70 text-[10px] uppercase tracking-[0.2em] mb-2.5 block font-medium">
                  {t("pseudo_label")}
                </label>
                <div className="relative">
                  {/* Input glow when focused */}
                  {focused && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -inset-px rounded-xl pointer-events-none"
                      style={{ boxShadow: "0 0 0 1px #FBBF2460, 0 0 16px rgba(251,191,36,0.12)" }}
                    />
                  )}
                  <input
                    {...register("pseudo")}
                    placeholder={t("pseudo_placeholder")}
                    autoFocus
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="w-full rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#334155] outline-none transition-all duration-300"
                    style={{
                      background: "rgba(2,6,23,0.8)",
                      border: focused
                        ? "1px solid rgba(251,191,36,0.5)"
                        : "1px solid rgba(30,41,59,0.8)",
                      letterSpacing: pseudoValue ? "0.05em" : undefined,
                    }}
                  />
                  {/* Character counter */}
                  {pseudoValue.length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#475569]">
                      {pseudoValue.length}/20
                    </span>
                  )}
                </div>
                {errors.pseudo && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[#EF4444] text-xs mt-1.5 flex items-center gap-1"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#EF4444] inline-block" />
                    {errors.pseudo.message}
                  </motion.p>
                )}
              </div>

              {/* Email (optionnel) */}
              <div>
                <label className="text-[#FBBF24]/70 text-[10px] uppercase tracking-[0.2em] mb-2.5 block font-medium">
                  {t("email_label")}
                </label>
                <div className="relative">
                  {emailFocused && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -inset-px rounded-xl pointer-events-none"
                      style={{ boxShadow: "0 0 0 1px #FBBF2460, 0 0 16px rgba(251,191,36,0.12)" }}
                    />
                  )}
                  <input
                    {...register("email")}
                    type="email"
                    placeholder={t("email_placeholder")}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="w-full rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#334155] outline-none transition-all duration-300"
                    style={{
                      background: "rgba(2,6,23,0.8)",
                      border: emailFocused
                        ? "1px solid rgba(251,191,36,0.5)"
                        : "1px solid rgba(30,41,59,0.8)",
                    }}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[#EF4444] text-xs mt-1.5"
                  >
                    Email invalide
                  </motion.p>
                )}

                {/* Newsletter opt-in (visible quand email saisi) */}
                <AnimatePresence>
                  {emailValue.length > 0 && (
                    <motion.label
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="flex items-start gap-2.5 cursor-pointer select-none group"
                    >
                      <div className="relative shrink-0 mt-0.5">
                        <input
                          {...register("newsletterOptIn")}
                          type="checkbox"
                          className="peer sr-only"
                        />
                        <div
                          className="w-4 h-4 rounded border transition-all"
                          style={{
                            background: newsletterOptIn
                              ? "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)"
                              : "rgba(2,6,23,0.8)",
                            borderColor: newsletterOptIn
                              ? "#FBBF24"
                              : "rgba(30,41,59,0.8)",
                            boxShadow: newsletterOptIn
                              ? "0 0 8px rgba(251,191,36,0.35)"
                              : "none",
                          }}
                        />
                        {newsletterOptIn && (
                          <svg
                            className="absolute inset-0 w-4 h-4 pointer-events-none"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M3.5 8.5L6.5 11.5L12.5 5"
                              stroke="#07080E"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-[11px] text-[#94A3B8] leading-snug group-hover:text-[#CBD5E1] transition-colors">
                        {t("newsletter_optin")}
                      </span>
                    </motion.label>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full rounded-xl py-4 font-bold text-sm tracking-[0.15em] uppercase overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? "rgba(251,191,36,0.6)"
                    : "linear-gradient(135deg, #FBBF24 0%, #F59E0B 60%, #D97706 100%)",
                  color: "#07080E",
                  boxShadow: loading ? "none" : "0 0 20px rgba(251,191,36,0.35), 0 4px 12px rgba(0,0,0,0.4)",
                }}
              >
                {/* Shimmer overlay on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0"
                  style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)" }}
                  whileHover={{ opacity: 1, x: ["−100%", "200%"] }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#07080E]/50 border-t-[#07080E] rounded-full animate-spin" />
                      <span>{t("loading")}</span>
                    </>
                  ) : (
                    <>
                      <GiSwordClash size={16} />
                      <span>{t("enter_button")}</span>
                    </>
                  )}
                </span>
              </motion.button>
            </motion.form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 pt-5 text-center"
              style={{ borderTop: "1px solid rgba(30,41,59,0.6)" }}
            >
              <div className="flex items-center justify-center gap-4 text-[#334155] text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  Accès instantané
                </span>
                <span className="w-px h-3 bg-[#1E293B]" />
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                  Sans mot de passe
                </span>
                <span className="w-px h-3 bg-[#1E293B]" />
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
                  Gratuit
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
