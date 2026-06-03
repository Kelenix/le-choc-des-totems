import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateVoteStats } from "@/lib/utils";
import { MatchDetailClient } from "@/components/match/MatchDetailClient";
import type { Metadata } from "next";
import type { Match } from "@/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const match = await prisma.match.findUnique({
      where: { slug },
      include: { homeTotem: true, awayTotem: true },
    });
    if (!match) return {};
    const title = `${match.homeTotem.country} vs ${match.awayTotem.country} | Le Choc des Totems`;
    return {
      title,
      description: `Vote pour le duel ${match.homeTotem.name} contre ${match.awayTotem.name}.`,
      openGraph: { title },
    };
  } catch {
    return {};
  }
}

export default async function MatchPage({ params }: Props) {
  const { slug } = await params;
  let match;
  try {
    match = await prisma.match.findUnique({
      where: { slug },
      include: {
        homeTotem: true,
        awayTotem: true,
        votes: { select: { prediction: true } },
      },
    });
  } catch {
    notFound();
  }
  if (!match) notFound();

  const { votes, ...matchData } = match;
  const voteStats = calculateVoteStats(votes);
  return <MatchDetailClient match={matchData as unknown as Match} voteStats={voteStats} />;
}
