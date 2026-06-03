import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  userId: z.string().uuid(),
  matchId: z.string().uuid(),
  prediction: z.enum(["HOME", "DRAW", "AWAY"]),
});

// Rate limiter : ne bloque que les votes réussis (clé supprimée sur erreur)
const voteRateLimit = new Map<string, number>();

export async function POST(req: NextRequest) {
  let data: z.infer<typeof schema>;

  try {
    const body = await req.json();
    data = schema.parse(body);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Rate limiting : 1 vote par 2s par user+match (uniquement après succès)
  const key = `${data.userId}:${data.matchId}`;
  const now = Date.now();
  const last = voteRateLimit.get(key) || 0;
  if (now - last < 2000) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    // Match existe ?
    const match = await prisma.match.findUnique({ where: { id: data.matchId } });
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.status === "FINISHED" || match.status === "CANCELLED") {
      return NextResponse.json({ error: "Voting closed" }, { status: 400 });
    }

    // User existe ? sinon on le crée automatiquement (cas: localStorage avant db:push)
    const user = await prisma.user.upsert({
      where: { id: data.userId },
      update: {},
      create: { id: data.userId, pseudo: `User_${data.userId.slice(0, 6)}` },
    });

    if (user.suspended) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    // Upsert vote
    const vote = await prisma.vote.upsert({
      where: { userId_matchId: { userId: data.userId, matchId: data.matchId } },
      update: { prediction: data.prediction },
      create: { userId: data.userId, matchId: data.matchId, prediction: data.prediction },
    });

    // Enregistre le timestamp seulement après succès
    voteRateLimit.set(key, now);

    return NextResponse.json(vote, { status: 201 });
  } catch (e) {
    // Supprime la clé pour permettre un retry
    voteRateLimit.delete(key);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const matchId = searchParams.get("matchId");

  if (!userId || !matchId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const vote = await prisma.vote.findUnique({
      where: { userId_matchId: { userId, matchId } },
    });
    return NextResponse.json(vote);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
