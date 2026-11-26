import { OhlcvBar, QuoteSnapshot, TickerProfile } from "@/lib/types";

export const TICKER_UNIVERSE: Record<string, TickerProfile> = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetClass: "equity",
    sector: "Technology · Consumer Hardware & Services",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0000320193",
    description:
      "Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories alongside high-margin digital services including the App Store, iCloud, and Apple Pay. Its installed base exceeds 2.2 billion active devices globally, driving recurring services cash flow and disciplined capital returns.",
    employees: 164000,
    headquarters: "Cupertino, CA",
    website: "https://apple.com",
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    assetClass: "equity",
    sector: "Technology · Semiconductors & AI Infrastructure",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0001045810",
    description:
      "NVIDIA pioneers accelerated computing and full-stack AI infrastructure across data center GPUs, high-speed networking (InfiniBand/Spectrum-X), and CUDA software ecosystems. Hyperscalers and sovereign AI clouds rely on its Hopper and Blackwell architectures for frontier model training and inference.",
    employees: 32000,
    headquarters: "Santa Clara, CA",
    website: "https://nvidia.com",
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    assetClass: "equity",
    sector: "Technology · Enterprise Cloud & Software",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0000789019",
    description:
      "Microsoft delivers enterprise cloud computing via Azure, productivity software through Microsoft 365 Copilot, developer infrastructure on GitHub, and gaming ecosystems. Recurring commercial bookings and AI workload expansion underpin durable operating margins.",
    employees: 228000,
    headquarters: "Redmond, WA",
    website: "https://microsoft.com",
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    assetClass: "equity",
    sector: "Consumer Cyclical · EVs, Energy Storage & Autonomy",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0001318605",
    description:
      "Tesla designs, manufactures, and sells battery electric vehicles, grid-scale Megapack energy storage systems, and solar infrastructure while developing Full Self-Driving (FSD) neural software and humanoid robotics.",
    employees: 125665,
    headquarters: "Austin, TX",
    website: "https://tesla.com",
  },
  EURUSD: {
    symbol: "EURUSD",
    name: "Euro / US Dollar Spot",
    assetClass: "fx",
    sector: "G10 Foreign Exchange",
    exchange: "FX Spot",
    currency: "USD",
    description:
      "The world's most liquid currency pair, reflecting interest-rate differentials between the European Central Bank and the Federal Reserve, transatlantic trade flows, and global risk appetite.",
  },
  BTCUSD: {
    symbol: "BTCUSD",
    name: "Bitcoin / US Dollar",
    assetClass: "crypto",
    sector: "Digital Assets · Layer 1 Monetary Network",
    exchange: "SPOT / BINANCE",
    currency: "USD",
    description:
      "Bitcoin is a decentralized peer-to-peer monetary network secured by proof-of-work consensus with a fixed 21 million supply cap, tracked across institutional ETFs and global spot liquidity venues.",
  },
  "GC=F": {
    symbol: "GC=F",
    name: "COMEX Gold Futures",
    assetClass: "commodity",
    sector: "Commodities · Precious Metals",
    exchange: "COMEX",
    currency: "USD",
    description:
      "Benchmark COMEX Gold futures contract representing 100 troy ounces of physical gold. Widely tracked for real-yield sensitivity, central bank reserve accumulation, and CFTC commercial hedger positioning.",
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    assetClass: "equity",
    sector: "Technology · Search, Cloud & AI",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0001652044",
    description:
      "Alphabet operates Google Search, YouTube, Google Cloud, and DeepMind AI infrastructure globally, generating industry-leading free cash flow and high-margin advertising & cloud scale.",
    employees: 182500,
    headquarters: "Mountain View, CA",
    website: "https://abc.xyz",
  },
  META: {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    assetClass: "equity",
    sector: "Technology · Digital Platforms & AI",
    exchange: "NASDAQ",
    currency: "USD",
    cik: "0001326801",
    description:
      "Meta builds social connectivity platforms across Facebook, Instagram, WhatsApp, and Reality Labs alongside open-weight Llama AI infrastructure serving over 3.2 billion daily active people.",
    employees: 72400,
    headquarters: "Menlo Park, CA",
    website: "https://meta.com",
  },
  CRM: {
    symbol: "CRM",
    name: "Salesforce, Inc.",
    assetClass: "equity",
    sector: "Technology · Enterprise CRM & Agentic AI",
    exchange: "NYSE",
    currency: "USD",
    cik: "0001108524",
    description:
      "Salesforce provides cloud-based customer relationship management, Data Cloud, Slack collaboration, and Agentforce enterprise AI automation platforms globally.",
    employees: 72682,
    headquarters: "San Francisco, CA",
    website: "https://salesforce.com",
  },
  UNH: {
    symbol: "UNH",
    name: "UnitedHealth Group Incorporated",
    assetClass: "equity",
    sector: "Healthcare · Managed Care & Optum",
    exchange: "NYSE",
    currency: "USD",
    cik: "0000731766",
    description:
      "UnitedHealth Group operates UnitedHealthcare benefits and Optum health services, pharmacy care, and clinical analytics across the United States.",
    employees: 400000,
    headquarters: "Minnetonka, MN",
    website: "https://unitedhealthgroup.com",
  },
};

export const YAHOO_SYMBOL_MAP: Record<string, string> = {
  EURUSD: "EURUSD=X",
  BTCUSD: "BTC-USD",
  "GC=F": "GC=F",
};

export const SEED_BASE_QUOTES: Record<
  string,
  Omit<QuoteSnapshot, "timestamp" | "source">
> = {
  AAPL: {
    symbol: "AAPL",
    price: 234.82,
    change: 3.14,
    changePercent: 1.36,
    previousClose: 231.68,
    open: 232.15,
    dayHigh: 235.9,
    dayLow: 231.4,
    week52High: 260.1,
    week52Low: 164.08,
    volume: 42_180_400,
    avgVolume: 48_920_000,
    marketCap: 3_569_264_000_000,
    peRatio: 32.8,
    forwardPe: 28.4,
    dividendYield: 0.43,
    beta: 1.24,
    sharesOutstanding: 15_200_000_000,
  },
  NVDA: {
    symbol: "NVDA",
    price: 141.65,
    change: 4.22,
    changePercent: 3.07,
    previousClose: 137.43,
    open: 138.9,
    dayHigh: 143.1,
    dayLow: 137.85,
    week52High: 153.13,
    week52Low: 47.32,
    volume: 214_500_000,
    avgVolume: 245_000_000,
    marketCap: 3_470_425_000_000,
    peRatio: 44.2,
    forwardPe: 31.6,
    dividendYield: 0.03,
    beta: 1.66,
    sharesOutstanding: 24_500_000_000,
  },
  MSFT: {
    symbol: "MSFT",
    price: 428.4,
    change: 2.85,
    changePercent: 0.67,
    previousClose: 425.55,
    open: 426.1,
    dayHigh: 430.25,
    dayLow: 424.3,
    week52High: 468.35,
    week52Low: 366.5,
    volume: 18_420_000,
    avgVolume: 21_100_000,
    marketCap: 3_183_012_000_000,
    peRatio: 33.9,
    forwardPe: 29.1,
    dividendYield: 0.77,
    beta: 0.89,
    sharesOutstanding: 7_430_000_000,
  },
  TSLA: {
    symbol: "TSLA",
    price: 338.95,
    change: -5.4,
    changePercent: -1.57,
    previousClose: 344.35,
    open: 342.8,
    dayHigh: 346.2,
    dayLow: 335.6,
    week52High: 488.54,
    week52Low: 138.8,
    volume: 74_890_000,
    avgVolume: 86_400_000,
    marketCap: 1_088_029_500_000,
    peRatio: 84.7,
    forwardPe: 64.2,
    dividendYield: null,
    beta: 2.08,
    sharesOutstanding: 3_210_000_000,
  },
  EURUSD: {
    symbol: "EURUSD",
    price: 1.0584,
    change: 0.0031,
    changePercent: 0.29,
    previousClose: 1.0553,
    open: 1.0558,
    dayHigh: 1.0602,
    dayLow: 1.0541,
    week52High: 1.1214,
    week52Low: 1.0332,
    volume: 0,
    avgVolume: 0,
    marketCap: null,
    peRatio: null,
    forwardPe: null,
    dividendYield: null,
    beta: 0.42,
    sharesOutstanding: null,
  },
  BTCUSD: {
    symbol: "BTCUSD",
    price: 94_280.5,
    change: 1_840.25,
    changePercent: 1.99,
    previousClose: 92_440.25,
    open: 92_510.0,
    dayHigh: 95_120.0,
    dayLow: 91_850.0,
    week52High: 108_350.0,
    week52Low: 49_120.0,
    volume: 41_200_000_000,
    avgVolume: 38_000_000_000,
    marketCap: 1_865_000_000_000,
    peRatio: null,
    forwardPe: null,
    dividendYield: null,
    beta: 1.85,
    sharesOutstanding: 19_780_000,
  },
  "GC=F": {
    symbol: "GC=F",
    price: 2_678.4,
    change: 18.9,
    changePercent: 0.71,
    previousClose: 2_659.5,
    open: 2_662.0,
    dayHigh: 2_684.6,
    dayLow: 2_655.1,
    week52High: 2_801.8,
    week52Low: 1_984.3,
    volume: 162_400,
    avgVolume: 184_000,
    marketCap: null,
    peRatio: null,
    forwardPe: null,
    dividendYield: null,
    beta: 0.18,
    sharesOutstanding: null,
  },
  GOOGL: {
    symbol: "GOOGL",
    price: 172.45,
    change: 2.15,
    changePercent: 1.26,
    previousClose: 170.3,
    open: 170.8,
    dayHigh: 173.4,
    dayLow: 169.9,
    week52High: 193.31,
    week52Low: 130.67,
    volume: 22_400_000,
    avgVolume: 25_800_000,
    marketCap: 2_120_000_000_000,
    peRatio: 21.8,
    forwardPe: 18.9,
    dividendYield: 0.46,
    beta: 1.04,
    sharesOutstanding: 12_300_000_000,
  },
  META: {
    symbol: "META",
    price: 572.1,
    change: 7.45,
    changePercent: 1.32,
    previousClose: 564.65,
    open: 566.0,
    dayHigh: 575.2,
    dayLow: 563.1,
    week52High: 638.4,
    week52Low: 382.1,
    volume: 14_800_000,
    avgVolume: 16_900_000,
    marketCap: 1_445_000_000_000,
    peRatio: 25.4,
    forwardPe: 21.6,
    dividendYield: 0.35,
    beta: 1.18,
    sharesOutstanding: 2_525_000_000,
  },
  CRM: {
    symbol: "CRM",
    price: 197.21,
    change: 2.84,
    changePercent: 1.46,
    previousClose: 194.37,
    open: 195.0,
    dayHigh: 198.4,
    dayLow: 193.8,
    week52High: 348.8,
    week52Low: 185.1,
    volume: 6_800_000,
    avgVolume: 7_400_000,
    marketCap: 189_000_000_000,
    peRatio: 28.4,
    forwardPe: 20.1,
    dividendYield: 0.81,
    beta: 1.12,
    sharesOutstanding: 958_000_000,
  },
  UNH: {
    symbol: "UNH",
    price: 346.19,
    change: 4.12,
    changePercent: 1.2,
    previousClose: 342.07,
    open: 343.0,
    dayHigh: 348.1,
    dayLow: 341.2,
    week52High: 606.36,
    week52Low: 320.0,
    volume: 4_100_000,
    avgVolume: 4_600_000,
    marketCap: 318_000_000_000,
    peRatio: 16.4,
    forwardPe: 14.8,
    dividendYield: 2.42,
    beta: 0.62,
    sharesOutstanding: 920_000_000,
  },
};

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SeasonalProfile {
  annualDrift: number;
  dailyVol: number;
  startPriceRatio: number;
  monthlyBias: number[]; // 12 months, subtle seasonal drift
}

const SEASONAL_PROFILES: Record<string, SeasonalProfile> = {
  AAPL: {
    annualDrift: 0.18,
    dailyVol: 0.017,
    startPriceRatio: 0.012,
    monthlyBias: [0.0004, -0.0001, 0.0005, 0.0004, 0.0003, 0.0005, 0.0009, 0.0007, -0.0006, 0.0008, 0.0014, 0.0011],
  },
  NVDA: {
    annualDrift: 0.28,
    dailyVol: 0.022,
    startPriceRatio: 0.004,
    monthlyBias: [0.0009, 0.001, 0.0008, 0.0001, 0.0012, 0.0005, 0.0004, 0.0006, -0.0008, 0.0009, 0.0038, 0.0036],
  },
  MSFT: {
    annualDrift: 0.15,
    dailyVol: 0.015,
    startPriceRatio: 0.022,
    monthlyBias: [0.0005, 0.0002, 0.0006, 0.0008, 0.0004, 0.0004, 0.0007, 0.0003, -0.0004, 0.0009, 0.0013, 0.0009],
  },
  TSLA: {
    annualDrift: 0.22,
    dailyVol: 0.032,
    startPriceRatio: 0.015,
    monthlyBias: [0.0008, -0.0005, -0.0003, 0.0005, 0.0007, 0.0012, 0.0009, 0.0004, 0.0002, 0.0007, 0.0015, 0.0013],
  },
  EURUSD: {
    annualDrift: -0.002,
    dailyVol: 0.0055,
    startPriceRatio: 1.06,
    monthlyBias: [-0.0002, -0.0001, 0.0002, 0.0003, -0.0003, 0.0002, 0.0001, -0.0001, -0.0002, -0.0001, -0.0002, 0.0005],
  },
  BTCUSD: {
    annualDrift: 0.34,
    dailyVol: 0.034,
    startPriceRatio: 0.001,
    monthlyBias: [0.0008, 0.0014, 0.0009, 0.0012, -0.0003, -0.0002, 0.0007, -0.0004, -0.0006, 0.0018, 0.0021, 0.0014],
  },
  "GC=F": {
    annualDrift: 0.068,
    dailyVol: 0.0085,
    startPriceRatio: 0.145,
    monthlyBias: [0.0011, 0.0004, -0.0001, 0.0005, 0.0002, -0.0002, 0.0006, 0.0009, -0.0003, 0.0002, 0.0019, 0.0022],
  },
  GOOGL: {
    annualDrift: 0.17,
    dailyVol: 0.016,
    startPriceRatio: 0.018,
    monthlyBias: [0.0006, 0.0002, 0.0005, 0.0007, 0.0004, 0.0003, 0.0008, 0.0003, -0.0005, 0.0008, 0.0028, 0.0027],
  },
  META: {
    annualDrift: 0.21,
    dailyVol: 0.021,
    startPriceRatio: 0.014,
    monthlyBias: [0.0008, 0.0005, 0.0004, 0.0006, 0.0005, 0.0004, 0.0009, 0.0004, -0.0006, 0.001, 0.0018, 0.0015],
  },
};

const barCache = new Map<string, OhlcvBar[]>();

export function generateSeedOhlcv30Y(symbol: string): OhlcvBar[] {
  const sym = symbol.toUpperCase();
  const cached = barCache.get(sym);
  if (cached) return cached;

  const base = SEED_BASE_QUOTES[sym] ?? SEED_BASE_QUOTES.AAPL;
  const profile = SEASONAL_PROFILES[sym] ?? SEASONAL_PROFILES.AAPL;
  const rand = mulberry32(hashString(`openforecaster-ohlcv-30y-${sym}`));

  // Generate 30 years of weekday bars ending at 2026-11-26
  const endDate = new Date("2026-11-26T00:00:00Z");
  const startDate = new Date("1996-11-26T00:00:00Z");

  const dates: Date[] = [];
  const cur = new Date(startDate);
  while (cur <= endDate) {
    const day = cur.getUTCDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(cur));
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  // First simulate unscaled log-random walk with seasonal bias, then rescale endpoint cleanly to base.price
  const rawCloses: number[] = new Array(dates.length);
  let logVal = 0;
  const dailyBaseDrift = profile.annualDrift / 252;

  for (let i = 0; i < dates.length; i++) {
    const m = dates[i].getUTCMonth();
    const u1 = Math.max(1e-7, rand());
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const seasonal = profile.monthlyBias[m] ?? 0;
    const step = dailyBaseDrift * 0.5 + seasonal + z * profile.dailyVol;
    logVal += step;
    rawCloses[i] = Math.exp(logVal);
  }

  // Re-anchor so that price reaches target end price smoothly while preserving start-to-end scale
  const lastRaw = rawCloses[rawCloses.length - 1];
  const firstRaw = rawCloses[0];
  const targetStart = base.price * profile.startPriceRatio;
  const targetEnd = base.price;

  const bars: OhlcvBar[] = new Array(dates.length);
  const precision = sym === "EURUSD" ? 4 : 2;
  const round = (v: number) => Number(v.toFixed(precision));

  for (let i = 0; i < dates.length; i++) {
    const t = i / (dates.length - 1);
    // Blend raw growth curve into target endpoint
    const logRawProgress = Math.log(rawCloses[i] / firstRaw);
    const logTotalRaw = Math.log(lastRaw / firstRaw);
    const logTargetTotal = Math.log(targetEnd / targetStart);
    const adjustedLog =
      Math.log(targetStart) +
      logRawProgress +
      t * (logTargetTotal - logTotalRaw);
    const close = round(Math.exp(adjustedLog));

    const prevClose = i > 0 ? bars[i - 1].close : round(close * 0.996);
    const intraSpread = Math.abs(rand() * profile.dailyVol * 1.4) + profile.dailyVol * 0.25;
    const open = round(prevClose * (1 + (rand() - 0.5) * profile.dailyVol * 0.5));
    const high = round(Math.max(open, close) * (1 + intraSpread * 0.6));
    const low = round(Math.min(open, close) * (1 - intraSpread * 0.6));
    const baseVol = base.avgVolume > 0 ? base.avgVolume : 150_000;
    const volume = Math.round(baseVol * (0.65 + rand() * 0.85));

    bars[i] = {
      time: dates[i].toISOString().slice(0, 10),
      open,
      high,
      low,
      close,
      volume,
    };
  }

  // Ensure final bar aligns with live seed quote
  const lastIdx = bars.length - 1;
  bars[lastIdx] = {
    ...bars[lastIdx],
    open: base.open,
    high: base.dayHigh,
    low: base.dayLow,
    close: base.price,
    volume: base.volume || bars[lastIdx].volume,
  };

  barCache.set(sym, bars);
  return bars;
}

export function getSeedQuote(symbol: string): QuoteSnapshot {
  const sym = symbol.toUpperCase();
  const base = SEED_BASE_QUOTES[sym];
  if (base) {
    return {
      ...base,
      timestamp: new Date().toISOString(),
      source: "seed",
    };
  }
  // Generic deterministic fallback for unknown symbols
  const h = hashString(sym);
  const price = Number((45 + (h % 280) + (h % 99) / 100).toFixed(2));
  const changePct = Number((((h % 400) - 180) / 100).toFixed(2));
  const prev = Number((price / (1 + changePct / 100)).toFixed(2));
  return {
    symbol: sym,
    price,
    change: Number((price - prev).toFixed(2)),
    changePercent: changePct,
    previousClose: prev,
    open: prev,
    dayHigh: Number((price * 1.015).toFixed(2)),
    dayLow: Number((price * 0.985).toFixed(2)),
    week52High: Number((price * 1.24).toFixed(2)),
    week52Low: Number((price * 0.72).toFixed(2)),
    volume: 4_250_000,
    avgVolume: 5_100_000,
    marketCap: Math.round(price * 450_000_000),
    peRatio: 24.5,
    forwardPe: 20.8,
    dividendYield: 0.85,
    beta: 1.12,
    sharesOutstanding: 450_000_000,
    timestamp: new Date().toISOString(),
    source: "seed",
  };
}

export function getTickerProfile(symbol: string): TickerProfile {
  const sym = symbol.toUpperCase();
  return (
    TICKER_UNIVERSE[sym] ?? {
      symbol: sym,
      name: `${sym} Corp.`,
      assetClass: "equity",
      sector: "Public Equities",
      exchange: "US",
      currency: "USD",
      description: `Publicly traded security (${sym}) tracked in OpenForecaster with live market data, deterministic valuation models, and historical seasonality.`,
    }
  );
}
