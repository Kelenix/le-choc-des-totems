import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // Rebuild sitemap toutes les heures

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://lechocdestotems.vercel.app";
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/matchs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/groupes`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/classement`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/historique`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/en`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/es`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const matches = await prisma.match.findMany({
      select: { slug: true, updatedAt: true },
    });
    const matchEntries: MetadataRoute.Sitemap = matches.map((m) => ({
      url: `${base}/match/${m.slug}`,
      lastModified: m.updatedAt,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    }));
    return [...staticEntries, ...matchEntries];
  } catch {
    return staticEntries;
  }
}
