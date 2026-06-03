import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  id: z.string().uuid(),
  pseudo: z.string().min(2).max(20).regex(/^[a-zA-Z0-9_\-À-ž]+$/),
  email: z.string().email().optional().or(z.literal("")),
  newsletterOptIn: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const email = data.email && data.email.length > 0 ? data.email : null;
    const optIn = Boolean(data.newsletterOptIn && email);

    const user = await prisma.user.upsert({
      where: { id: data.id },
      update: {
        // N'écrase pas un email existant avec null
        ...(email ? { email } : {}),
        ...(optIn ? { newsletterOptIn: true } : {}),
      },
      create: {
        id: data.id,
        pseudo: data.pseudo,
        email,
        newsletterOptIn: optIn,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
