import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Profil public d'un utilisateur.
 * ⚠️ NE PAS exposer email / newsletterOptIn / suspended : champs sensibles
 *    qui ne doivent jamais sortir de la base via une route non authentifiée.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        pseudo: true,
        points: true,
        streak: true,
        createdAt: true,
        badges: { include: { badge: true } },
        votes: {
          where: { isCorrect: { not: null } },
          select: { isCorrect: true, pointsEarned: true },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const totalVotes = user.votes.length;
    const correctVotes = user.votes.filter((v) => v.isCorrect).length;

    const rank = await prisma.user.count({
      where: { points: { gt: user.points } },
    });

    return NextResponse.json({
      ...user,
      rank: rank + 1,
      totalVotes,
      correctVotes,
      winRate: totalVotes > 0 ? Math.round((correctVotes / totalVotes) * 100) : 0,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
