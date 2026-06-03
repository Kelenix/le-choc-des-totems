import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const votes = await prisma.vote.findMany({
      where: { userId: id },
      include: {
        match: {
          include: { homeTotem: true, awayTotem: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(votes);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
