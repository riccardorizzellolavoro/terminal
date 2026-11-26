import { NextRequest, NextResponse } from "next/server";
import { loadScreenerUniverse } from "@/lib/services/ticker-service";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const preset = search.get("preset") || "all";
  const minUpside = Number(search.get("minUpside") ?? "-999");
  const minPiotroski = Number(search.get("minPiotroski") ?? "0");
  const minWinRate = Number(search.get("minWinRate") ?? "0");
  const assetClass = search.get("assetClass") || "all";
  const insiderBuyOnly = search.get("insiderBuyOnly") === "true";

  try {
    const allRows = await loadScreenerUniverse();
    const filtered = allRows.filter((row) => {
      if (preset === "undervalued_quality") {
        return row.fairValueUpside > 20 && row.piotroskiScore >= 7;
      }
      if (preset === "seasonality_75") {
        return row.seasonality30DWinRate > 75;
      }
      if (preset === "insider_buying") {
        return row.recentInsiderBuyCount > 0 || row.smartMoneyTone === "bullish";
      }

      if (assetClass !== "all" && row.assetClass !== assetClass) return false;
      if (row.fairValueUpside < minUpside) return false;
      if (row.piotroskiScore < minPiotroski) return false;
      if (row.seasonality30DWinRate < minWinRate) return false;
      if (insiderBuyOnly && row.recentInsiderBuyCount === 0) return false;
      return true;
    });

    return NextResponse.json({
      rows: filtered,
      totalUniverse: allRows.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Screener query failed" },
      { status: 500 }
    );
  }
}
