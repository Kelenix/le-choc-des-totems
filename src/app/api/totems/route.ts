import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totems = await prisma.totem.findMany({ orderBy: { country: "asc" } });
    return NextResponse.json(totems);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
