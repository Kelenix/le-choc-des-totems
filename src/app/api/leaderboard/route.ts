import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { suspended: false, points: { gt: 0 } },
      include: { badges: { include: { badge: true } } },
      orderBy: [{ points: "desc" }, { createdAt: "asc" }],
      take: 100,
    });

    return NextResponse.json(
      users.map((u, i) => ({ ...u, rank: i + 1 }))
    );
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
