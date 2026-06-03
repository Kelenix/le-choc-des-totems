import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function checkAdmin(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

const updateSchema = z.object({
  status: z.enum(["UPCOMING", "LIVE", "FINISHED", "CANCELLED"]).optional(),
  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
  result: z.enum(["HOME", "DRAW", "AWAY"]).optional(),
  scheduledAt: z.string().datetime().optional(),
  round: z.string().optional(),
  group: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const match = await prisma.match.update({
      where: { id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      },
      include: { homeTotem: true, awayTotem: true },
    });

    // If finished, calculate points for all voters
    if (data.status === "FINISHED" && data.result) {
      await calculatePoints(id, data.result);
    }

    return NextResponse.json(match);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.match.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

async function calculatePoints(matchId: string, result: string) {
  const votes = await prisma.vote.findMany({ where: { matchId } });

  const POINTS = { base: 1 };

  for (const vote of votes) {
    const isCorrect = vote.prediction === result;
    await prisma.vote.update({
      where: { id: vote.id },
      data: { isCorrect, pointsEarned: isCorrect ? POINTS.base : 0 },
    });

    if (isCorrect) {
      const user = await prisma.user.update({
        where: { id: vote.userId },
        data: { points: { increment: POINTS.base }, streak: { increment: 1 } },
      });

      // Award bonus points for streaks
      let bonus = 0;
      if (user.streak === 3) bonus = 5;
      else if (user.streak === 5) bonus = 10;
      else if (user.streak === 10) bonus = 25;

      if (bonus > 0) {
        await prisma.user.update({
          where: { id: vote.userId },
          data: { points: { increment: bonus } },
        });
      }

      await checkAndAwardBadges(vote.userId, user.points + POINTS.base + bonus, user.streak);
    } else {
      await prisma.user.update({
        where: { id: vote.userId },
        data: { streak: 0 },
      });
    }
  }
}

async function checkAndAwardBadges(userId: string, points: number, streak: number) {
  const badges = await prisma.badge.findMany();
  const userBadges = await prisma.userBadge.findMany({ where: { userId } });
  const earnedIds = new Set(userBadges.map((b) => b.badgeId));

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue;

    let shouldAward = false;
    if (badge.condition === "points_10" && points >= 10) shouldAward = true;
    if (badge.condition === "points_50" && points >= 50) shouldAward = true;
    if (badge.condition === "points_100" && points >= 100) shouldAward = true;
    if (badge.condition === "streak_3" && streak >= 3) shouldAward = true;
    if (badge.condition === "streak_5" && streak >= 5) shouldAward = true;

    if (shouldAward) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
    }
  }
}
