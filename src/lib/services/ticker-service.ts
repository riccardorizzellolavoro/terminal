import { getFredMacroIndicators } from "@/lib/adapters/fred";
import { getFinancialStatements, getSecFilings } from "@/lib/adapters/sec";
import { getHistoricalOhlcv, getQuoteSnapshot } from "@/lib/adapters/yahoo";
import { buildSeasonalityCurves, computeSeasonalityWindow } from "@/lib/quant/seasonality";
import { computeValuationBundle } from "@/lib/quant/valuation";
import {
  getSeedSmartMoney,
  SEED_HEADLINES,
} from "@/lib/seed/fundamentals";
import {
  generateSeedOhlcv30Y,
  getTickerProfile,
  TICKER_UNIVERSE,
} from "@/lib/seed/universe";
import { ScreenerRow } from "@/lib/types";

export async function loadFullTickerWorkspace(symbol: string, range = "1Y") {
  const sym = symbol.toUpperCase();
  const profile = getTickerProfile(sym);

  const [quote, chartData, financials, filingsRes, macroRes] =
    await Promise.all([
      getQuoteSnapshot(sym),
      getHistoricalOhlcv(sym, range),
      getFinancialStatements(sym),
      getSecFilings(sym),
      getFredMacroIndicators(),
    ]);

  const dgs10 = macroRes.indicators.find((i) => i.id === "DGS10")?.value ?? 4.24;
  const riskFreeRate = dgs10 / 100;

  const isEquity = profile.assetClass === "equity";
  const valuation = isEquity
    ? computeValuationBundle(sym, quote.price, financials.annual, riskFreeRate)
    : null;

  const bars30Y = generateSeedOhlcv30Y(sym);
  // Active upcoming 30-day seasonal window (Nov 26 – Dec 26)
  const seasonality = buildSeasonalityCurves(sym, bars30Y, "11-26", "12-26");
  const smartMoney = getSeedSmartMoney(sym);

  return {
    profile,
    quote,
    chart: chartData,
    financials,
    filings: filingsRes.filings,
    valuation,
    seasonality,
    smartMoney,
  };
}

export async function loadSeasonalityWindow(
  symbol: string,
  startMonthDay: string,
  endMonthDay: string,
  yearsBack = 30
) {
  const sym = symbol.toUpperCase();
  const bars30Y = generateSeedOhlcv30Y(sym);
  return computeSeasonalityWindow(bars30Y, startMonthDay, endMonthDay, yearsBack);
}

export async function loadScreenerUniverse(): Promise<ScreenerRow[]> {
  const symbols = Object.keys(TICKER_UNIVERSE);

  const rows = await Promise.all(
    symbols.map(async (sym) => {
      const profile = TICKER_UNIVERSE[sym];
      const [quote, financials] = await Promise.all([
        getQuoteSnapshot(sym),
        getFinancialStatements(sym),
      ]);
      const bars30Y = generateSeedOhlcv30Y(sym);
      const seas = computeSeasonalityWindow(bars30Y, "11-26", "12-26", 30);
      const smart = getSeedSmartMoney(sym);
      const isEquity = profile.assetClass === "equity";
      const val = isEquity
        ? computeValuationBundle(sym, quote.price, financials.annual)
        : null;

      const buyCount = smart.insiderTrades.filter(
        (t) => t.transactionType === "Buy"
      ).length;

      return {
        symbol: sym,
        name: profile.name,
        assetClass: profile.assetClass,
        sector: profile.sector,
        price: quote.price,
        changePercent: quote.changePercent,
        fairValue: val ? val.compositeFairValue : quote.price,
        fairValueUpside: val ? val.compositeUpsidePercent : 0,
        piotroskiScore: val ? val.quality.piotroskiFScore : 0,
        seasonality30DWinRate: seas.winRate,
        seasonality30DAvgReturn: seas.avgReturn,
        smartMoneySignal: smart.signalLabel,
        smartMoneyTone: smart.signalTone,
        recentInsiderBuyCount: buyCount,
        marketCap: quote.marketCap,
      };
    })
  );

  return rows;
}

export async function loadMarketSummary() {
  const [macro, sp500, nasdaq] = await Promise.all([
    getFredMacroIndicators(),
    getQuoteSnapshot("^GSPC").catch(() => null),
    getQuoteSnapshot("^IXIC").catch(() => null),
  ]);

  const dgs10 = macro.indicators.find((i) => i.id === "DGS10");

  const indices = [
    {
      symbol: "SPX",
      name: "S&P 500",
      price: sp500?.price && sp500.price > 1000 ? sp500.price : 5998.74,
      changePercent: sp500?.price && sp500.price > 1000 ? sp500.changePercent : 0.68,
    },
    {
      symbol: "IXIC",
      name: "Nasdaq Composite",
      price: nasdaq?.price && nasdaq.price > 1000 ? nasdaq.price : 19184.22,
      changePercent: nasdaq?.price && nasdaq.price > 1000 ? nasdaq.changePercent : 0.94,
    },
    { symbol: "DJI", name: "Dow Jones", price: 44722.1, changePercent: 0.41 },
    { symbol: "FTSE", name: "FTSE 100", price: 8274.5, changePercent: -0.18 },
    { symbol: "N225", name: "Nikkei 225", price: 38442.0, changePercent: 0.52 },
    { symbol: "VIX", name: "CBOE Volatility", price: 14.12, changePercent: -3.2 },
  ];

  return {
    headerPills: {
      sp500: {
        label: "S&P 500",
        value: indices[0].price,
        changePercent: indices[0].changePercent,
      },
      nasdaq: {
        label: "Nasdaq",
        value: indices[1].price,
        changePercent: indices[1].changePercent,
      },
      tenYearYield: {
        label: "10Y Yield",
        value: dgs10?.value ?? 4.24,
        change: dgs10?.change ?? -0.04,
      },
    },
    indices,
    macroIndicators: macro.indicators,
    macroSource: macro.source,
    headlines: SEED_HEADLINES,
  };
}
