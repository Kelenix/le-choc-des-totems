import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MatchStatus } from "@prisma/client";

const VALID_STATUSES = ["UPCOMING", "LIVE", "FINISHED", "CANCELLED"] as const;

function isValidStatus(s: string | null): s is MatchStatus {
  return s !== null && (VALID_STATUSES as readonly string[]).includes(s);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");

    const matches = await prisma.match.findMany({
      where: isValidStatus(status) ? { status } : undefined,
      include: { homeTotem: true, awayTotem: true },
      orderBy: { scheduledAt: "asc" },
      take: limit,
    });

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
