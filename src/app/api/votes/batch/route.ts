import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const matchIds = searchParams.get("matchIds");

  if (!userId || !matchIds) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const ids = matchIds.split(",").filter(Boolean).slice(0, 20);

  try {
    const votes = await prisma.vote.findMany({
      where: { userId, matchId: { in: ids } },
      select: { matchId: true, prediction: true },
    });

    const result: Record<string, string> = Object.fromEntries(
      votes.map((v) => [v.matchId, v.prediction])
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
