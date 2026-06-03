import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAdmin(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

/**
 * Liste les abonnés newsletter — JSON par défaut, ?format=csv pour export Excel
 */
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscribers = await prisma.user.findMany({
    where: {
      email: { not: null },
      newsletterOptIn: true,
      suspended: false,
    },
    select: { id: true, pseudo: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const format = req.nextUrl.searchParams.get("format");
  if (format === "csv") {
    const header = "email,pseudo,createdAt\n";
    const rows = subscribers
      .map((s) => `"${s.email}","${s.pseudo}","${s.createdAt.toISOString()}"`)
      .join("\n");
    return new Response(header + rows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ count: subscribers.length, subscribers });
}
