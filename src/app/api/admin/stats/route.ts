import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [users, matches, votes, pointsAgg] = await Promise.all([
    prisma.user.count(),
    prisma.match.count(),
    prisma.vote.count(),
    prisma.user.aggregate({ _sum: { points: true } }),
  ]);

  return NextResponse.json({
    users,
    matches,
    votes,
    points: pointsAgg._sum.points || 0,
  });
}
