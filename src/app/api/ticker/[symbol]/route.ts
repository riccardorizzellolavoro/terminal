import { NextRequest, NextResponse } from "next/server";
import { getHistoricalOhlcv } from "@/lib/adapters/yahoo";
import {
  loadFullTickerWorkspace,
  loadSeasonalityWindow,
} from "@/lib/services/ticker-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await context.params;
  const search = request.nextUrl.searchParams;
  const section = search.get("section");
  const range = search.get("range") || "1Y";

  try {
    if (section === "chart") {
      const chart = await getHistoricalOhlcv(symbol, range);
      return NextResponse.json(chart);
    }

    if (section === "seasonality-window") {
      const start = search.get("start") || "11-26";
      const end = search.get("end") || "12-26";
      const years = Number(search.get("years") || "30");
      const stats = await loadSeasonalityWindow(symbol, start, end, years);
      return NextResponse.json(stats);
    }

    const payload = await loadFullTickerWorkspace(symbol, range);
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load ticker" },
      { status: 500 }
    );
  }
}
