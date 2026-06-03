import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");

    const matches = await prisma.match.findMany({
      where: status ? { status: status as any } : undefined,
      include: { homeTotem: true, awayTotem: true },
      orderBy: { scheduledAt: "asc" },
      take: limit,
    });

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
