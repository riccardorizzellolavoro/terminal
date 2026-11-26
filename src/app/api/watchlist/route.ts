import { NextRequest, NextResponse } from "next/server";
import { getQuoteSnapshot } from "@/lib/adapters/yahoo";
import { getDb } from "@/lib/db";
import { getTickerProfile } from "@/lib/seed/universe";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare("SELECT symbol, added_at as addedAt FROM watchlist ORDER BY added_at ASC")
    .all() as { symbol: string; addedAt: string }[];

  const enriched = await Promise.all(
    rows.map(async (r) => {
      const q = await getQuoteSnapshot(r.symbol);
      const profile = getTickerProfile(r.symbol);
      return {
        symbol: r.symbol,
        name: profile.name,
        price: q.price,
        changePercent: q.changePercent,
        addedAt: r.addedAt,
      };
    })
  );

  return NextResponse.json({ items: enriched });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { symbol?: string };
  const sym = body.symbol?.trim().toUpperCase();
  if (!sym) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }
  const db = getDb();
  db.prepare(
    "INSERT OR IGNORE INTO watchlist (symbol, added_at) VALUES (?, ?)"
  ).run(sym, new Date().toISOString());

  return NextResponse.json({ ok: true, symbol: sym });
}

export async function DELETE(request: NextRequest) {
  const sym = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();
  if (!sym) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }
  const db = getDb();
  db.prepare("DELETE FROM watchlist WHERE symbol = ?").run(sym);
  return NextResponse.json({ ok: true, symbol: sym });
}
