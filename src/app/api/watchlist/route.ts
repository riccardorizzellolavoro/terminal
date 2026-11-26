import { NextRequest, NextResponse } from "next/server";
import { getQuoteSnapshot } from "@/lib/adapters/yahoo";
import { getDb } from "@/lib/db";
import { getTickerProfile, normalizeSymbol } from "@/lib/seed/universe";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare("SELECT symbol, added_at as addedAt FROM watchlist ORDER BY added_at ASC")
    .all() as { symbol: string; addedAt: string }[];

  const enriched = await Promise.all(
    rows.map(async (r) => {
      const sym = normalizeSymbol(r.symbol);
      const q = await getQuoteSnapshot(sym);
      const profile = getTickerProfile(sym);
      return {
        symbol: sym,
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
  const raw = body.symbol?.trim();
  if (!raw) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }
  const sym = normalizeSymbol(raw);
  const db = getDb();
  db.prepare(
    "INSERT OR IGNORE INTO watchlist (symbol, added_at) VALUES (?, ?)"
  ).run(sym, new Date().toISOString());

  return NextResponse.json({ ok: true, symbol: sym });
}

export async function DELETE(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("symbol")?.trim();
  if (!raw) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }
  const sym = normalizeSymbol(raw);
  const db = getDb();
  db.prepare("DELETE FROM watchlist WHERE symbol = ? OR symbol = ?").run(
    sym,
    raw.toUpperCase()
  );
  return NextResponse.json({ ok: true, symbol: sym });
}
