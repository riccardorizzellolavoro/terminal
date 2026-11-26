import YahooFinance from "yahoo-finance2";
import { getCachedOrFetch } from "@/lib/db";
import { computeOptionGreeks } from "@/lib/quant/greeks";
import { getSeedOptionsChain } from "@/lib/seed/fundamentals";
import {
  generateSeedOhlcv30Y,
  getSeedQuote,
  getTickerProfile,
  normalizeSymbol,
  YAHOO_SYMBOL_MAP,
} from "@/lib/seed/universe";
import {
  OhlcvBar,
  OptionContract,
  OptionsChainResponse,
  QuoteSnapshot,
} from "@/lib/types";
import { getFredMacroIndicators } from "./fred";

const globalForYf = globalThis as unknown as {
  __yfClient?: InstanceType<typeof YahooFinance>;
};

function getYf() {
  if (!globalForYf.__yfClient) {
    globalForYf.__yfClient = new YahooFinance({
      suppressNotices: ["yahooSurvey", "ripHistorical"],
    });
  }
  return globalForYf.__yfClient;
}

function mapYahooSymbol(symbol: string): string {
  const sym = normalizeSymbol(symbol);
  return YAHOO_SYMBOL_MAP[sym] ?? sym;
}

async function withTimeout<T>(promise: Promise<T>, ms = 2800): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Upstream timeout")), ms)
    ),
  ]);
}

export async function getQuoteSnapshot(symbol: string): Promise<QuoteSnapshot> {
  const sym = normalizeSymbol(symbol);
  const profile = getTickerProfile(sym);

  // Bonds & Sovereign Yields derive from FRED / Sovereign seed directly
  if (profile.assetClass === "bond") {
    const fred = await getFredMacroIndicators().catch(() => null);
    const seed = getSeedQuote(sym);
    const fredIdMap: Record<string, string> = {
      US2Y: "DGS2",
      US5Y: "DGS5",
      US10Y: "DGS10",
      US30Y: "DGS30",
      FEDFUNDS: "FEDFUNDS",
    };
    const fredId = fredIdMap[sym];
    const match = fredId
      ? fred?.indicators.find((i) => i.id === fredId)
      : undefined;
    if (match) {
      const prev = Number((match.value - match.change).toFixed(2));
      const chgPct =
        prev > 0 ? Number(((match.change / prev) * 100).toFixed(2)) : 0;
      return {
        ...seed,
        symbol: sym,
        price: match.value,
        change: match.change,
        changePercent: chgPct,
        previousClose: prev,
        open: prev,
        dayHigh: Number((match.value + 0.04).toFixed(2)),
        dayLow: Number((match.value - 0.04).toFixed(2)),
        source: fred?.source ?? "seed",
      };
    }
    return seed;
  }

  const ySym = mapYahooSymbol(sym);

  const { data, source } = await getCachedOrFetch<QuoteSnapshot>(
    `quote:${sym}`,
    30,
    async () => {
      const q = await withTimeout(getYf().quote(ySym));
      if (!q || typeof q.regularMarketPrice !== "number") {
        throw new Error("Invalid Yahoo quote");
      }
      const isFx = profile.assetClass === "fx" || q.regularMarketPrice < 5;
      const decimals = isFx ? 4 : 2;
      const price = Number(q.regularMarketPrice.toFixed(decimals));
      const prevClose = Number(
        (q.regularMarketPreviousClose ?? price).toFixed(decimals)
      );
      const change = Number(
        (q.regularMarketChange ?? price - prevClose).toFixed(decimals)
      );
      const changePercent = Number(
        (
          q.regularMarketChangePercent ??
          ((price - prevClose) / Math.max(0.0001, prevClose)) * 100
        ).toFixed(2)
      );
      const seed = getSeedQuote(sym);
      return {
        symbol: sym,
        price,
        change,
        changePercent,
        previousClose: prevClose,
        open: Number((q.regularMarketOpen ?? prevClose).toFixed(decimals)),
        dayHigh: Number((q.regularMarketDayHigh ?? price).toFixed(decimals)),
        dayLow: Number((q.regularMarketDayLow ?? price).toFixed(decimals)),
        week52High: Number(
          (q.fiftyTwoWeekHigh ?? seed.week52High).toFixed(decimals)
        ),
        week52Low: Number(
          (q.fiftyTwoWeekLow ?? seed.week52Low).toFixed(decimals)
        ),
        volume: q.regularMarketVolume ?? seed.volume,
        avgVolume: q.averageDailyVolume3Month ?? seed.avgVolume,
        marketCap: q.marketCap ?? seed.marketCap,
        peRatio: q.trailingPE ? Number(q.trailingPE.toFixed(2)) : seed.peRatio,
        forwardPe: q.forwardPE
          ? Number(q.forwardPE.toFixed(2))
          : seed.forwardPe,
        dividendYield: q.dividendYield
          ? Number(q.dividendYield.toFixed(2))
          : seed.dividendYield,
        beta: q.beta ? Number(q.beta.toFixed(2)) : seed.beta,
        sharesOutstanding: q.sharesOutstanding ?? seed.sharesOutstanding,
        timestamp: new Date().toISOString(),
        source: "live",
      };
    },
    () => getSeedQuote(sym)
  );

  return { ...data, source };
}

export async function getHistoricalOhlcv(
  symbol: string,
  range: string = "1Y"
): Promise<{ bars: OhlcvBar[]; source: "live" | "cache" | "seed" }> {
  const sym = normalizeSymbol(symbol);
  const profile = getTickerProfile(sym);

  if (profile.assetClass === "bond") {
    const seedBars = generateSeedOhlcv30Y(sym);
    const countByRange: Record<string, number> = {
      "1D": 30,
      "5D": 14,
      "1M": 22,
      "6M": 130,
      "1Y": 252,
      "5Y": 1260,
      "30Y": seedBars.length,
    };
    const sliceCount = countByRange[range] ?? 252;
    return { bars: seedBars.slice(-sliceCount), source: "seed" };
  }

  const ySym = mapYahooSymbol(sym);

  const { data: fullBars, source } = await getCachedOrFetch<OhlcvBar[]>(
    `ohlcv30y:${sym}`,
    3600,
    async () => {
      const seedBars = generateSeedOhlcv30Y(sym);
      const period1 = new Date(Date.now() - 365 * 5 * 86_400_000);
      const chartRes = await withTimeout(
        getYf().chart(ySym, { period1, interval: "1d" }),
        4000
      );
      const quotes = chartRes?.quotes ?? [];
      if (quotes.length < 20) {
        throw new Error("Insufficient Yahoo chart bars");
      }
      const liveMap = new Map<string, OhlcvBar>();
      for (const b of seedBars) liveMap.set(b.time, b);

      const precision = profile.assetClass === "fx" ? 4 : 2;
      for (const q of quotes) {
        if (
          q.date &&
          typeof q.open === "number" &&
          typeof q.high === "number" &&
          typeof q.low === "number" &&
          typeof q.close === "number"
        ) {
          const dayStr = new Date(q.date).toISOString().slice(0, 10);
          liveMap.set(dayStr, {
            time: dayStr,
            open: Number(q.open.toFixed(precision)),
            high: Number(q.high.toFixed(precision)),
            low: Number(q.low.toFixed(precision)),
            close: Number(q.close.toFixed(precision)),
            volume: Math.round(q.volume ?? 0),
          });
        }
      }
      return Array.from(liveMap.values()).sort((a, b) =>
        a.time.localeCompare(b.time)
      );
    },
    () => generateSeedOhlcv30Y(sym)
  );

  const countByRange: Record<string, number> = {
    "1D": 30,
    "5D": 14,
    "1M": 22,
    "6M": 130,
    "1Y": 252,
    "5Y": 1260,
    "30Y": fullBars.length,
  };
  const sliceCount = countByRange[range] ?? 252;
  return {
    bars: fullBars.slice(-sliceCount),
    source,
  };
}

export async function getOptionsChain(
  symbol: string,
  expiration?: string
): Promise<OptionsChainResponse> {
  const sym = normalizeSymbol(symbol);
  const ySym = mapYahooSymbol(sym);

  const cacheKey = `options:v2:${sym}:${expiration ?? "nearest"}`;
  const { data, source } = await getCachedOrFetch<OptionsChainResponse>(
    cacheKey,
    30,
    async () => {
      const opts = expiration ? { date: new Date(expiration) } : {};
      const res = await withTimeout(getYf().options(ySym, opts), 4000);
      const chain = res?.options?.[0];
      if (!chain || (!chain.calls?.length && !chain.puts?.length)) {
        throw new Error("Empty Yahoo options chain");
      }

      const underlyingPrice =
        res.quote?.regularMarketPrice ?? getSeedQuote(sym).price;
      const expirations = (res.expirationDates ?? []).map((d: Date) =>
        new Date(d).toISOString().slice(0, 10)
      );
      const selectedExp =
        expiration && expirations.includes(expiration)
          ? expiration
          : expirations[0] ??
            new Date(chain.expirationDate).toISOString().slice(0, 10);

      const mapContract = (
        c: (typeof chain.calls)[number],
        type: "call" | "put"
      ): OptionContract => {
        const ivPct = Number(((c.impliedVolatility ?? 0.25) * 100).toFixed(1));
        const greeks = computeOptionGreeks({
          spot: underlyingPrice,
          strike: c.strike,
          expiration: selectedExp,
          ivPct,
          type,
        });
        return {
          contractSymbol: c.contractSymbol,
          strike: Number(c.strike.toFixed(2)),
          expiration: selectedExp,
          type,
          bid: Number((c.bid ?? 0).toFixed(2)),
          ask: Number((c.ask ?? 0).toFixed(2)),
          lastPrice: Number((c.lastPrice ?? 0).toFixed(2)),
          volume: c.volume ?? 0,
          openInterest: c.openInterest ?? 0,
          impliedVolatility: ivPct,
          inTheMoney: Boolean(c.inTheMoney),
          ...greeks,
        };
      };

      return {
        symbol: sym,
        underlyingPrice: Number(underlyingPrice.toFixed(2)),
        expirations,
        selectedExpiration: selectedExp,
        calls: (chain.calls ?? []).map((c) => mapContract(c, "call")),
        puts: (chain.puts ?? []).map((p) => mapContract(p, "put")),
        source: "live",
      };
    },
    () => {
      const seed = getSeedOptionsChain(sym, expiration);
      return {
        symbol: sym,
        ...seed,
        source: "seed",
      };
    }
  );

  return { ...data, source };
}
