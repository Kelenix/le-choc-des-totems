import { prisma } from "@/lib/prisma";

const POINTS = { base: 1 };

export async function calculatePoints(matchId: string, result: string) {
  const votes = await prisma.vote.findMany({ where: { matchId } });

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

export async function checkAndAwardBadges(userId: string, points: number, streak: number) {
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
