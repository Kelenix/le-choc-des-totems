import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function checkAdmin(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

const schema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  countryCode: z.string().length(2).toUpperCase(),
  animal: z.string().min(1),
  imageUrl: z.string().url().optional(),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const totems = await prisma.totem.findMany({ orderBy: { country: "asc" } });
  return NextResponse.json(totems);
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const totem = await prisma.totem.create({ data });
    return NextResponse.json(totem, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
