import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getTimeUntil(date: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const now = new Date().getTime();
  const target = new Date(date).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  };
}

export function calculateVoteStats(votes: { prediction: string }[]) {
  const total = votes.length;
  if (total === 0) return { home: 0, draw: 0, away: 0, total: 0, homePercent: 0, drawPercent: 0, awayPercent: 0 };

  const home = votes.filter((v) => v.prediction === "HOME").length;
  const draw = votes.filter((v) => v.prediction === "DRAW").length;
  const away = votes.filter((v) => v.prediction === "AWAY").length;

  return {
    home,
    draw,
    away,
    total,
    homePercent: Math.round((home / total) * 100),
    drawPercent: Math.round((draw / total) * 100),
    awayPercent: Math.round((away / total) * 100),
  };
}
