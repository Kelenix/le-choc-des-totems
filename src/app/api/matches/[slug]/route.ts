import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateVoteStats } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const match = await prisma.match.findUnique({
      where: { slug },
      include: {
        homeTotem: true,
        awayTotem: true,
        votes: { select: { prediction: true } },
      },
    });

    if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { votes, ...matchData } = match;
    return NextResponse.json({ ...matchData, voteStats: calculateVoteStats(votes) });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
