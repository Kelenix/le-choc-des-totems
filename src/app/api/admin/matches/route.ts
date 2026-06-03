import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";

function checkAdmin(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  return secret === process.env.ADMIN_SECRET;
}

const createSchema = z.object({
  homeTotemId: z.string().uuid(),
  awayTotemId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  round: z.string().optional(),
  group: z.string().optional(),
});

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matches = await prisma.match.findMany({
    include: { homeTotem: true, awayTotem: true },
    orderBy: { scheduledAt: "desc" },
  });
  return NextResponse.json(matches);
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const [home, away] = await Promise.all([
      prisma.totem.findUnique({ where: { id: data.homeTotemId } }),
      prisma.totem.findUnique({ where: { id: data.awayTotemId } }),
    ]);

    if (!home || !away) return NextResponse.json({ error: "Totem not found" }, { status: 404 });

    const slug = slugify(`${home.countryCode}-vs-${away.countryCode}`);

    const match = await prisma.match.create({
      data: {
        slug,
        homeTotemId: data.homeTotemId,
        awayTotemId: data.awayTotemId,
        scheduledAt: new Date(data.scheduledAt),
        round: data.round,
        group: data.group,
      },
      include: { homeTotem: true, awayTotem: true },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
