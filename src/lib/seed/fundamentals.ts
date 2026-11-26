import { computeOptionGreeks } from "@/lib/quant/greeks";
import {
  CongressTrade,
  CotPoint,
  FilingChunk,
  FinancialPeriodRow,
  InsiderTrade,
  MacroIndicator,
  MarketHeadline,
  OptionContract,
  SecFilingItem,
} from "@/lib/types";
import { normalizeSymbol, SEED_BASE_QUOTES } from "./universe";

function buildFinancials(
  baseRevB: number,
  revGrowths: number[],
  grossMargin: number,
  opMargin: number,
  netMargin: number,
  ocfRatio: number,
  capexRatio: number,
  sharesB: number,
  cashB: number,
  debtB: number,
  equityB: number
): { annual: FinancialPeriodRow[]; quarterly: FinancialPeriodRow[] } {
  const years = [2021, 2022, 2023, 2024, 2025, 2026];
  const B = 1_000_000_000;
  let rev = baseRevB * B;
  const annual: FinancialPeriodRow[] = [];

  for (let i = 0; i < years.length; i++) {
    const fy = years[i];
    if (i > 0) rev = rev * (1 + revGrowths[i - 1]);
    const costOfRevenue = Math.round(rev * (1 - grossMargin));
    const grossProfit = Math.round(rev - costOfRevenue);
    const operatingIncome = Math.round(rev * opMargin);
    const operatingExpenses = grossProfit - operatingIncome;
    const netIncome = Math.round(rev * netMargin);
    const operatingCashFlow = Math.round(rev * ocfRatio);
    const capex = Math.round(rev * capexRatio);
    const freeCashFlow = operatingCashFlow - capex;
    const shares = Math.round(sharesB * B * Math.pow(0.985, i));
    const totalAssets = Math.round((cashB + equityB * 1.45 + debtB) * B * (1 + i * 0.04));
    const currentAssets = Math.round(totalAssets * 0.42);
    const cash = Math.round(cashB * B * (1 + i * 0.03));
    const longTermDebt = Math.round(debtB * B * (1 - i * 0.02));
    const totalLiabilities = Math.round(totalAssets - equityB * B * (1 + i * 0.06));
    const currentLiabilities = Math.round(totalLiabilities * 0.46);
    const equity = Math.max(Math.round(equityB * B * (1 + i * 0.06)), totalAssets - totalLiabilities);

    const prev = i > 0 ? annual[i - 1] : null;
    const pct = (c: number, p: number) =>
      p ? Number((((c - p) / Math.abs(p)) * 100).toFixed(1)) : null;

    annual.push({
      period: String(fy),
      fiscalYear: fy,
      fiscalQuarter: "FY",
      endDate: `${fy}-09-30`,
      revenue: Math.round(rev),
      costOfRevenue,
      grossProfit,
      operatingExpenses,
      operatingIncome,
      interestExpense: Math.round(longTermDebt * 0.032),
      netIncome,
      eps: Number((netIncome / shares).toFixed(2)),
      operatingCashFlow,
      capex,
      freeCashFlow,
      totalAssets,
      currentAssets,
      cashAndEquivalents: cash,
      totalLiabilities,
      currentLiabilities,
      longTermDebt,
      shareholdersEquity: equity,
      retainedEarnings: Math.round(equity * 0.68),
      sharesOutstanding: shares,
      receivables: Math.round(rev * 0.085),
      ppeNet: Math.round(totalAssets * 0.16),
      depreciation: Math.round(capex * 0.88),
      isDerivedQ4: false,
      yoyRevenueGrowth: prev ? pct(Math.round(rev), prev.revenue) : null,
      yoyNetIncomeGrowth: prev ? pct(netIncome, prev.netIncome) : null,
      yoyFcfGrowth: prev ? pct(freeCashFlow, prev.freeCashFlow) : null,
    });
  }

  // Derive quarterly rows for FY2025 & FY2026 with standalone Q4 = FY - (Q1+Q2+Q3)
  const quarterly: FinancialPeriodRow[] = [];
  const qWeights = [0.235, 0.225, 0.245, 0.295];
  const qMonths = ["03-31", "06-30", "09-30", "12-31"];

  for (const fyRow of annual.slice(-2)) {
    const qSubs: FinancialPeriodRow[] = [];
    let sumRev = 0;
    let sumCost = 0;
    let sumGross = 0;
    let sumOpInc = 0;
    let sumNet = 0;
    let sumOcf = 0;
    let sumCapex = 0;

    for (let qi = 0; qi < 4; qi++) {
      const fp = (["Q1", "Q2", "Q3", "Q4"] as const)[qi];
      const isQ4 = qi === 3;
      const w = qWeights[qi];

      const revenue = isQ4 ? fyRow.revenue - sumRev : Math.round(fyRow.revenue * w);
      const costOfRevenue = isQ4 ? fyRow.costOfRevenue - sumCost : Math.round(fyRow.costOfRevenue * w);
      const grossProfit = isQ4 ? fyRow.grossProfit - sumGross : revenue - costOfRevenue;
      const operatingIncome = isQ4 ? fyRow.operatingIncome - sumOpInc : Math.round(fyRow.operatingIncome * w);
      const netIncome = isQ4 ? fyRow.netIncome - sumNet : Math.round(fyRow.netIncome * w);
      const operatingCashFlow = isQ4 ? fyRow.operatingCashFlow - sumOcf : Math.round(fyRow.operatingCashFlow * w);
      const capex = isQ4 ? fyRow.capex - sumCapex : Math.round(fyRow.capex * w);
      const freeCashFlow = operatingCashFlow - capex;

      sumRev += revenue;
      sumCost += costOfRevenue;
      sumGross += grossProfit;
      sumOpInc += operatingIncome;
      sumNet += netIncome;
      sumOcf += operatingCashFlow;
      sumCapex += capex;

      qSubs.push({
        ...fyRow,
        period: `${fyRow.fiscalYear}-${fp}`,
        fiscalQuarter: fp,
        endDate: `${fyRow.fiscalYear}-${qMonths[qi]}`,
        revenue,
        costOfRevenue,
        grossProfit,
        operatingExpenses: Math.max(0, grossProfit - operatingIncome),
        operatingIncome,
        netIncome,
        eps: Number((netIncome / fyRow.sharesOutstanding).toFixed(2)),
        operatingCashFlow,
        capex,
        freeCashFlow,
        isDerivedQ4: isQ4,
      });
    }
    quarterly.push(...qSubs);
  }

  const withQYoY = quarterly.map((row, idx) => {
    const prev = idx >= 4 ? quarterly[idx - 4] : null;
    const pct = (c: number, p: number) =>
      p ? Number((((c - p) / Math.abs(p)) * 100).toFixed(1)) : null;
    return {
      ...row,
      yoyRevenueGrowth: prev ? pct(row.revenue, prev.revenue) : null,
      yoyNetIncomeGrowth: prev ? pct(row.netIncome, prev.netIncome) : null,
      yoyFcfGrowth: prev ? pct(row.freeCashFlow, prev.freeCashFlow) : null,
    };
  });

  return { annual, quarterly: withQYoY };
}

export const SEED_FINANCIALS: Record<
  string,
  { annual: FinancialPeriodRow[]; quarterly: FinancialPeriodRow[] }
> = {
  AAPL: buildFinancials(365.8, [0.078, -0.028, 0.02, 0.064, 0.072], 0.465, 0.315, 0.264, 0.305, 0.026, 15.6, 65, 96, 62),
  NVDA: buildFinancials(26.9, [0.002, 1.258, 0.94, 0.48, 0.31], 0.745, 0.615, 0.545, 0.56, 0.032, 24.8, 38, 9.7, 65),
  MSFT: buildFinancials(168.1, [0.18, 0.069, 0.157, 0.145, 0.132], 0.695, 0.448, 0.362, 0.47, 0.195, 7.45, 78, 44, 285),
  TSLA: buildFinancials(53.8, [0.514, 0.188, 0.012, 0.145, 0.195], 0.184, 0.092, 0.088, 0.152, 0.105, 3.22, 33, 7.8, 70),
  GOOGL: buildFinancials(257.6, [0.098, 0.087, 0.139, 0.128, 0.122], 0.585, 0.324, 0.286, 0.355, 0.125, 12.6, 108, 13.2, 310),
  META: buildFinancials(117.9, [-0.011, 0.157, 0.219, 0.165, 0.148], 0.815, 0.415, 0.358, 0.485, 0.18, 2.61, 70, 18.4, 165),
};

export function getSeedFinancials(symbol: string) {
  const sym = symbol.toUpperCase();
  if (SEED_FINANCIALS[sym]) return SEED_FINANCIALS[sym];
  // Generic fallback for unknown equity symbols
  return buildFinancials(28.5, [0.09, 0.07, 0.11, 0.12, 0.1], 0.52, 0.24, 0.185, 0.26, 0.045, 0.45, 8.2, 6.4, 24);
}

export function getSeedSecFilings(symbol: string): SecFilingItem[] {
  const sym = symbol.toUpperCase();
  const cikMap: Record<string, string> = {
    AAPL: "0000320193",
    NVDA: "0001045810",
    MSFT: "0000789019",
    TSLA: "0001318605",
  };
  const cik = cikMap[sym] ?? "0000320193";
  return [
    {
      accessionNumber: `${cik}-26-000119`,
      form: "10-K",
      filingDate: "2026-11-01",
      reportDate: "2026-09-30",
      description: `${sym} Annual Report — Consolidated Statements & Risk Factors`,
      url: `https://www.sec.gov/edgar/browse/?CIK=${cik}`,
    },
    {
      accessionNumber: `${cik}-26-000084`,
      form: "8-K",
      filingDate: "2026-10-29",
      reportDate: "2026-10-29",
      description: `${sym} Q4 FY26 Earnings Release & Operating Guidance`,
      url: `https://www.sec.gov/edgar/browse/?CIK=${cik}`,
    },
    {
      accessionNumber: `${cik}-26-000051`,
      form: "10-Q",
      filingDate: "2026-08-02",
      reportDate: "2026-06-30",
      description: `${sym} Quarterly Report (Q3 FY26)`,
      url: `https://www.sec.gov/edgar/browse/?CIK=${cik}`,
    },
    {
      accessionNumber: `${cik}-26-000033`,
      form: "4",
      filingDate: "2026-11-14",
      reportDate: "2026-11-12",
      description: `Statement of Changes in Beneficial Ownership (Executive Officer)`,
      url: `https://www.sec.gov/edgar/browse/?CIK=${cik}`,
    },
  ];
}

export function getSeedOptionsChain(
  symbol: string,
  expiration?: string
): {
  expirations: string[];
  selectedExpiration: string;
  calls: OptionContract[];
  puts: OptionContract[];
  underlyingPrice: number;
} {
  const sym = normalizeSymbol(symbol);
  const base = SEED_BASE_QUOTES[sym]?.price ?? 185.0;
  const expirations = [
    "2026-12-04",
    "2026-12-18",
    "2027-01-15",
    "2027-03-19",
    "2027-06-18",
  ];
  const selExp = expiration && expirations.includes(expiration) ? expiration : expirations[1];
  const expIdx = expirations.indexOf(selExp);
  const dteFactor = Math.sqrt((14 + expIdx * 32) / 365);

  const step = base > 1000 ? 1000 : base > 300 ? 5 : base > 80 ? 2.5 : base > 10 ? 1 : 0.05;
  const atm = Math.round(base / step) * step;

  const calls: OptionContract[] = [];
  const puts: OptionContract[] = [];

  for (let i = -10; i <= 10; i++) {
    const strike = Number((atm + i * step).toFixed(base < 5 ? 4 : 2));
    const moneyness = (base - strike) / base;
    const baseIv = (sym === "TSLA" || sym === "NVDA" ? 0.48 : sym === "BTC-USD" ? 0.62 : 0.24) + Math.abs(i) * 0.008;
    const timeValue = base * baseIv * dteFactor * 0.4 * Math.exp(-Math.pow(moneyness * 6, 2));

    const callIntrinsic = Math.max(0, base - strike);
    const callLast = Number(Math.max(0.05, callIntrinsic + timeValue).toFixed(2));
    const callSpread = Math.max(0.02, Number((callLast * 0.025).toFixed(2)));

    const putIntrinsic = Math.max(0, strike - base);
    const putLast = Number(Math.max(0.05, putIntrinsic + timeValue * 1.03).toFixed(2));
    const putSpread = Math.max(0.02, Number((putLast * 0.025).toFixed(2)));

    const weight = Math.max(0.15, 1 - Math.abs(i) * 0.08);
    const callIvPct = Number((baseIv * 100).toFixed(1));
    const putIvPct = Number(((baseIv + 0.018) * 100).toFixed(1));
    const callGreeks = computeOptionGreeks({
      spot: base,
      strike,
      expiration: selExp,
      ivPct: callIvPct,
      type: "call",
    });
    const putGreeks = computeOptionGreeks({
      spot: base,
      strike,
      expiration: selExp,
      ivPct: putIvPct,
      type: "put",
    });

    calls.push({
      contractSymbol: `${sym}${selExp.replace(/-/g, "").slice(2)}C${Math.round(strike * 1000)}`,
      strike,
      expiration: selExp,
      type: "call",
      bid: Number(Math.max(0.01, callLast - callSpread).toFixed(2)),
      ask: Number((callLast + callSpread).toFixed(2)),
      lastPrice: callLast,
      volume: Math.round(1450 * weight + ((Math.abs(i) * 137) % 400)),
      openInterest: Math.round(18400 * weight + ((Math.abs(i) * 913) % 4500)),
      impliedVolatility: callIvPct,
      inTheMoney: strike < base,
      ...callGreeks,
    });

    puts.push({
      contractSymbol: `${sym}${selExp.replace(/-/g, "").slice(2)}P${Math.round(strike * 1000)}`,
      strike,
      expiration: selExp,
      type: "put",
      bid: Number(Math.max(0.01, putLast - putSpread).toFixed(2)),
      ask: Number((putLast + putSpread).toFixed(2)),
      lastPrice: putLast,
      volume: Math.round(1180 * weight + ((Math.abs(i) * 193) % 360)),
      openInterest: Math.round(15200 * weight + ((Math.abs(i) * 821) % 3900)),
      impliedVolatility: putIvPct,
      inTheMoney: strike > base,
      ...putGreeks,
    });
  }

  return {
    expirations,
    selectedExpiration: selExp,
    calls,
    puts,
    underlyingPrice: base,
  };
}

export function getSeedSmartMoney(symbol: string): {
  symbol: string;
  signalLabel: string;
  signalTone: "bullish" | "neutral" | "bearish";
  cotSeries: CotPoint[];
  cotAssetName: string;
  cotExtremeAlert: string | null;
  insiderTrades: InsiderTrade[];
  congressTrades: CongressTrade[];
} {
  const sym = normalizeSymbol(symbol);
  const cotAssetMap: Record<string, string> = {
    AAPL: "NASDAQ-100 E-Mini Futures (CFTC Legacy)",
    NVDA: "NASDAQ-100 E-Mini Futures (CFTC Legacy)",
    MSFT: "NASDAQ-100 E-Mini Futures (CFTC Legacy)",
    TSLA: "S&P 500 E-Mini Futures (CFTC Legacy)",
    "EURUSD=X": "Euro FX Futures — CME (CFTC Legacy)",
    "USDJPY=X": "Japanese Yen Futures — CME (CFTC Legacy)",
    "GBPUSD=X": "British Pound Futures — CME (CFTC Legacy)",
    "USDCHF=X": "Swiss Franc Futures — CME (CFTC Legacy)",
    "DX-Y.NYB": "US Dollar Index Futures — ICE (CFTC Legacy)",
    "BTC-USD": "CME Bitcoin Futures (CFTC Legacy)",
    "ETH-USD": "CME Ether Futures (CFTC Legacy)",
    "GC=F": "COMEX Gold Futures (CFTC Legacy)",
    "SI=F": "COMEX Silver Futures (CFTC Legacy)",
    "CL=F": "NYMEX WTI Crude Oil Futures (CFTC Legacy)",
    "BZ=F": "ICE Brent Crude Futures (CFTC Legacy)",
    "NG=F": "NYMEX Henry Hub Natural Gas (CFTC Legacy)",
    "HG=F": "COMEX Copper Futures (CFTC Legacy)",
    "ZC=F": "CBOT Corn Futures (CFTC Legacy)",
    "ZW=F": "CBOT Wheat Futures (CFTC Legacy)",
  };

  const cotSeries: CotPoint[] = [];
  const start = new Date("2025-12-02T00:00:00Z");
  const isBullishAsset =
    sym === "AAPL" ||
    sym === "NVDA" ||
    sym === "GC=F" ||
    sym === "SI=F" ||
    sym === "HG=F" ||
    sym === "BTC-USD";

  for (let w = 0; w < 52; w++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + w * 7);
    const wave = Math.sin(w * 0.22) * 28000;
    const trend = isBullishAsset ? w * 750 : -w * 320;
    const commercialNet = Math.round(-45000 - trend * 0.8 + wave);
    const largeSpecNet = Math.round(62000 + trend + Math.cos(w * 0.19) * 19000);
    const smallTraderNet = -(commercialNet + largeSpecNet);
    const commPct = Math.min(99, Math.max(4, Math.round(52 + (commercialNet / 1400))));
    const specPct = Math.min(99, Math.max(5, Math.round(55 + (largeSpecNet / 1800))));
    cotSeries.push({
      date: d.toISOString().slice(0, 10),
      commercialNet,
      largeSpecNet,
      smallTraderNet,
      openInterest: 420000 + Math.round(Math.sin(w * 0.15) * 35000),
      commercialPercentile: commPct,
      largeSpecPercentile: specPct,
    });
  }

  const insiderCatalog: Record<string, InsiderTrade[]> = {
    AAPL: [
      { id: "aapl-f4-1", symbol: "AAPL", date: "2026-11-12", insiderName: "Arthur Levinson", role: "Chair of the Board", transactionType: "Buy", shares: 18500, price: 229.4, valueUsd: 4_243_900, postTradeReturnPct: 2.36 },
      { id: "aapl-f4-2", symbol: "AAPL", date: "2026-10-28", insiderName: "Kevan Parekh", role: "SVP & CFO", transactionType: "Buy", shares: 6200, price: 224.8, valueUsd: 1_393_760, postTradeReturnPct: 4.46 },
      { id: "aapl-f4-3", symbol: "AAPL", date: "2026-10-14", insiderName: "Craig Federighi", role: "SVP Software Eng.", transactionType: "Sell", shares: 22000, price: 227.15, valueUsd: 4_997_300, postTradeReturnPct: 3.38 },
      { id: "aapl-f4-4", symbol: "AAPL", date: "2026-09-22", insiderName: "Monica Lozano", role: "Director", transactionType: "Buy", shares: 4000, price: 221.1, valueUsd: 884_400, postTradeReturnPct: 6.21 },
    ],
    NVDA: [
      { id: "nvda-f4-1", symbol: "NVDA", date: "2026-11-18", insiderName: "Mark Stevens", role: "Director", transactionType: "Buy", shares: 35000, price: 134.9, valueUsd: 4_721_500, postTradeReturnPct: 5.0 },
      { id: "nvda-f4-2", symbol: "NVDA", date: "2026-11-04", insiderName: "Colette Kress", role: "EVP & CFO", transactionType: "Buy", shares: 12000, price: 131.2, valueUsd: 1_574_400, postTradeReturnPct: 7.96 },
      { id: "nvda-f4-3", symbol: "NVDA", date: "2026-10-19", insiderName: "Tench Coxe", role: "Director", transactionType: "Sell", shares: 40000, price: 136.4, valueUsd: 5_456_000, postTradeReturnPct: 3.85 },
    ],
    MSFT: [
      { id: "msft-f4-1", symbol: "MSFT", date: "2026-11-09", insiderName: "Bradford Smith", role: "Vice Chair & President", transactionType: "Buy", shares: 4500, price: 419.5, valueUsd: 1_887_750, postTradeReturnPct: 2.12 },
      { id: "msft-f4-2", symbol: "MSFT", date: "2026-10-21", insiderName: "Amy Hood", role: "EVP & CFO", transactionType: "Sell", shares: 9000, price: 423.8, valueUsd: 3_814_200, postTradeReturnPct: 1.09 },
    ],
    TSLA: [
      { id: "tsla-f4-1", symbol: "TSLA", date: "2026-11-15", insiderName: "Robyn Denholm", role: "Chair of the Board", transactionType: "Sell", shares: 31000, price: 349.1, valueUsd: 10_822_100, postTradeReturnPct: -2.91 },
      { id: "tsla-f4-2", symbol: "TSLA", date: "2026-10-30", insiderName: "Vaibhav Taneja", role: "CFO", transactionType: "Sell", shares: 14500, price: 342.4, valueUsd: 4_964_800, postTradeReturnPct: -1.01 },
    ],
    GOOGL: [
      { id: "googl-f4-1", symbol: "GOOGL", date: "2026-11-10", insiderName: "Anat Ashkenazi", role: "SVP & CFO", transactionType: "Buy", shares: 8500, price: 168.4, valueUsd: 1_431_400, postTradeReturnPct: 2.4 },
    ],
    META: [
      { id: "meta-f4-1", symbol: "META", date: "2026-11-05", insiderName: "Susan Li", role: "CFO", transactionType: "Buy", shares: 2200, price: 558.2, valueUsd: 1_228_040, postTradeReturnPct: 2.49 },
    ],
  };

  const congressCatalog: Record<string, CongressTrade[]> = {
    AAPL: [
      { id: "cg-aapl-1", symbol: "AAPL", date: "2026-11-06", politician: "Rep. Josh Gottheimer", chamber: "House", party: "D", transactionType: "Purchase", amountRange: "$50,001 - $100,000", postTradeReturnPct: 3.9 },
      { id: "cg-aapl-2", symbol: "AAPL", date: "2026-10-18", politician: "Sen. Tommy Tuberville", chamber: "Senate", party: "R", transactionType: "Purchase", amountRange: "$100,001 - $250,000", postTradeReturnPct: 4.8 },
    ],
    NVDA: [
      { id: "cg-nvda-1", symbol: "NVDA", date: "2026-11-11", politician: "Rep. Nancy Pelosi", chamber: "House", party: "D", transactionType: "Purchase", amountRange: "$250,001 - $500,000", postTradeReturnPct: 6.4 },
      { id: "cg-nvda-2", symbol: "NVDA", date: "2026-10-25", politician: "Rep. Michael McCaul", chamber: "House", party: "R", transactionType: "Purchase", amountRange: "$100,001 - $250,000", postTradeReturnPct: 7.2 },
    ],
    MSFT: [
      { id: "cg-msft-1", symbol: "MSFT", date: "2026-11-02", politician: "Sen. Markwayne Mullin", chamber: "Senate", party: "R", transactionType: "Purchase", amountRange: "$50,001 - $100,000", postTradeReturnPct: 2.8 },
    ],
    TSLA: [
      { id: "cg-tsla-1", symbol: "TSLA", date: "2026-11-08", politician: "Rep. Ro Khanna", chamber: "House", party: "D", transactionType: "Sale", amountRange: "$15,001 - $50,000", postTradeReturnPct: -1.8 },
    ],
  };

  const signalBySymbol: Record<
    string,
    { label: string; tone: "bullish" | "neutral" | "bearish"; alert: string | null }
  > = {
    AAPL: {
      label: "Bullish Insider Cluster",
      tone: "bullish",
      alert: "Large Speculators at 86th percentile net long; 3 Form 4 open-market buys in past 60d.",
    },
    NVDA: {
      label: "Bullish Insider Cluster",
      tone: "bullish",
      alert: "Institutional & Congressional accumulation cluster; COT spec positioning at 91st percentile.",
    },
    MSFT: {
      label: "Neutral COT",
      tone: "neutral",
      alert: null,
    },
    TSLA: {
      label: "Heavy Selling",
      tone: "bearish",
      alert: "Net insider Form 4 disposition of $15.79M over past 30 days.",
    },
    "EURUSD=X": {
      label: "Neutral COT",
      tone: "neutral",
      alert: "Commercial hedgers moderately net long at 61st 3-year percentile.",
    },
    "BTC-USD": {
      label: "Bullish COT Momentum",
      tone: "bullish",
      alert: "CME Leveraged Funds & Asset Managers net long expansion (88th percentile).",
    },
    "GC=F": {
      label: "Bullish Commercial Base",
      tone: "bullish",
      alert: "COMEX open interest rising alongside steady Managed Money net longs (84th percentile).",
    },
    "CL=F": {
      label: "Neutral COT",
      tone: "neutral",
      alert: "Managed Money WTI net longs near 48th percentile.",
    },
    "SI=F": {
      label: "Bullish Commercial Base",
      tone: "bullish",
      alert: "COMEX Silver spec positioning rising into 78th percentile.",
    },
    "HG=F": {
      label: "Bullish COT Momentum",
      tone: "bullish",
      alert: "Industrial copper net longs at 81st percentile on grid demand.",
    },
    GOOGL: {
      label: "Bullish Insider Cluster",
      tone: "bullish",
      alert: "CFO open-market purchase alongside institutional accumulation.",
    },
    META: {
      label: "Bullish Insider Cluster",
      tone: "bullish",
      alert: "Executive accumulation & positive COT Tech futures positioning.",
    },
  };

  const sig = signalBySymbol[sym] ?? { label: "Neutral COT", tone: "neutral" as const, alert: null };
  return {
    symbol: sym,
    signalLabel: sig.label,
    signalTone: sig.tone,
    cotSeries,
    cotAssetName: cotAssetMap[sym] ?? `${sym} Institutional Futures Proxy (CFTC)`,
    cotExtremeAlert: sig.alert,
    insiderTrades: insiderCatalog[sym] ?? [],
    congressTrades: congressCatalog[sym] ?? [],
  };
}

export const SEED_FILING_CHUNKS: FilingChunk[] = [
  // AAPL
  {
    id: "aapl-q3-14",
    symbol: "AAPL",
    docTitle: "Transcript Q3 '26",
    sectionLabel: "¶14",
    citationKey: "[Transcript Q3 '26, ¶14]",
    fiscalPeriod: "Q3 2026",
    publishedDate: "2026-08-01",
    text: "Services revenue reached an all-time quarterly record of $27.4 billion, up 14.2% year-over-year, with gross margin expanding to 74.1% on paid subscriptions surpassing 1.12 billion across the ecosystem.",
  },
  {
    id: "aapl-q3-22",
    symbol: "AAPL",
    docTitle: "Transcript Q3 '26",
    sectionLabel: "¶22",
    citationKey: "[Transcript Q3 '26, ¶22]",
    fiscalPeriod: "Q3 2026",
    publishedDate: "2026-08-01",
    text: "Greater China revenue declined 2.8% year-over-year to $14.3 billion on heightened local flagship competition, though Apple Intelligence hardware upgrades drove double-digit Pro mix gains in North America and Europe.",
  },
  {
    id: "aapl-q4-08",
    symbol: "AAPL",
    docTitle: "Transcript Q4 '26",
    sectionLabel: "¶08",
    citationKey: "[Transcript Q4 '26, ¶08]",
    fiscalPeriod: "Q4 2026",
    publishedDate: "2026-10-29",
    text: "For Q4 FY26, management shifted tone from cautious supply commentary in Q3 to high confidence on December quarter demand, guiding total company revenue growth of 6% to 8% year-over-year and gross margin between 46.5% and 47.5%.",
  },
  {
    id: "aapl-q4-19",
    symbol: "AAPL",
    docTitle: "Transcript Q4 '26",
    sectionLabel: "¶19",
    citationKey: "[Transcript Q4 '26, ¶19]",
    fiscalPeriod: "Q4 2026",
    publishedDate: "2026-10-29",
    text: "Capital expenditures rose 18% sequentially to $3.1 billion in Q4 to expand Private Cloud Compute silicon capacity, while full-year Free Cash Flow remained robust at $113.8 billion with $98.4 billion returned via buybacks and dividends.",
  },
  {
    id: "aapl-10k-07",
    symbol: "AAPL",
    docTitle: "10-K FY26",
    sectionLabel: "§7",
    citationKey: "[10-K FY26, §7]",
    fiscalPeriod: "FY 2026",
    publishedDate: "2026-11-01",
    text: "Risk factor update: Regulatory scrutiny over App Store fee structures in the European Union (DMA) and pending US antitrust remedies could compress Services take rates by 100 to 250 basis points over the next 24 months.",
  },

  // NVDA
  {
    id: "nvda-q3-11",
    symbol: "NVDA",
    docTitle: "Transcript Q3 '26",
    sectionLabel: "¶11",
    citationKey: "[Transcript Q3 '26, ¶11]",
    fiscalPeriod: "Q3 2026",
    publishedDate: "2026-08-27",
    text: "Data Center revenue climbed to $38.6 billion in Q3, driven by initial Blackwell Ultra rack-scale shipments; however, management flagged short-term gross margin moderation to 72.8% during liquid-cooling manufacturing ramp.",
  },
  {
    id: "nvda-q4-06",
    symbol: "NVDA",
    docTitle: "Transcript Q4 '26",
    sectionLabel: "¶06",
    citationKey: "[Transcript Q4 '26, ¶06]",
    fiscalPeriod: "Q4 2026",
    publishedDate: "2026-11-19",
    text: "Management tone in Q4 turned decisively more bullish on margin recovery, noting Blackwell yields stabilized ahead of schedule and guiding Q1 FY27 gross margins back toward 74.5% with $43.0 billion in revenue outlook.",
  },
  {
    id: "nvda-10k-12",
    symbol: "NVDA",
    docTitle: "10-K FY26",
    sectionLabel: "§1A",
    citationKey: "[10-K FY26, §1A]",
    fiscalPeriod: "FY 2026",
    publishedDate: "2026-11-21",
    text: "Customer concentration disclosure: Four cloud hyperscale customers accounted for 47% of total fiscal 2026 revenue, creating sensitivity to hyperscaler capex digestion cycles and export licensing restrictions.",
  },

  // MSFT
  {
    id: "msft-q3-09",
    symbol: "MSFT",
    docTitle: "Transcript Q3 '26",
    sectionLabel: "¶09",
    citationKey: "[Transcript Q3 '26, ¶09]",
    fiscalPeriod: "Q3 2026",
    publishedDate: "2026-07-29",
    text: "Azure and other cloud services grew 33% in constant currency, with AI services contributing 12 percentage points of growth. Commercial remaining performance obligations rose 21% to $284 billion.",
  },
  {
    id: "msft-q4-15",
    symbol: "MSFT",
    docTitle: "Transcript Q4 '26",
    sectionLabel: "¶15",
    citationKey: "[Transcript Q4 '26, ¶15]",
    fiscalPeriod: "Q4 2026",
    publishedDate: "2026-10-27",
    text: "Capital expenditures including finance leases reached $21.4 billion in Q4, up 28% year-over-year, with CFO Amy Hood guiding FY27 capex intensity to remain elevated as datacenter power shells come online.",
  },

  // TSLA
  {
    id: "tsla-q3-17",
    symbol: "TSLA",
    docTitle: "Transcript Q3 '26",
    sectionLabel: "¶17",
    citationKey: "[Transcript Q3 '26, ¶17]",
    fiscalPeriod: "Q3 2026",
    publishedDate: "2026-07-23",
    text: "Automotive gross margin excluding regulatory credits stood at 15.8%, pressured by aggressive 0% APR financing incentives in North America and Europe, while Energy Generation & Storage gross margin hit a record 30.5%.",
  },
  {
    id: "tsla-q4-10",
    symbol: "TSLA",
    docTitle: "Transcript Q4 '26",
    sectionLabel: "¶10",
    citationKey: "[Transcript Q4 '26, ¶10]",
    fiscalPeriod: "Q4 2026",
    publishedDate: "2026-10-23",
    text: "CapEx guidance for fiscal 2027 was raised above $11.5 billion to fund Cybercab tooling, AI5 inference clusters in Austin, and Megafactory expansion; management emphasized autonomous ride-hailing regulatory milestones over unit price cuts.",
  },
];

export const SEED_MACRO_INDICATORS: MacroIndicator[] = [
  {
    id: "DGS5",
    label: "US 5Y Treasury Yield",
    value: 4.12,
    unit: "%",
    change: -0.03,
    date: "2026-11-25",
    history: [
      { date: "2026-06", value: 4.41 },
      { date: "2026-07", value: 4.25 },
      { date: "2026-08", value: 4.02 },
      { date: "2026-09", value: 3.88 },
      { date: "2026-10", value: 4.18 },
      { date: "2026-11", value: 4.12 },
    ],
  },
  {
    id: "DGS10",
    label: "US 10Y Treasury Yield",
    value: 4.24,
    unit: "%",
    change: -0.04,
    date: "2026-11-25",
    history: [
      { date: "2026-06", value: 4.38 },
      { date: "2026-07", value: 4.29 },
      { date: "2026-08", value: 4.12 },
      { date: "2026-09", value: 4.05 },
      { date: "2026-10", value: 4.31 },
      { date: "2026-11", value: 4.24 },
    ],
  },
  {
    id: "DGS30",
    label: "US 30Y Treasury Yield",
    value: 4.44,
    unit: "%",
    change: -0.03,
    date: "2026-11-25",
    history: [
      { date: "2026-06", value: 4.54 },
      { date: "2026-07", value: 4.49 },
      { date: "2026-08", value: 4.35 },
      { date: "2026-09", value: 4.31 },
      { date: "2026-10", value: 4.5 },
      { date: "2026-11", value: 4.44 },
    ],
  },
  {
    id: "DGS2",
    label: "US 2Y Treasury Yield",
    value: 4.01,
    unit: "%",
    change: -0.02,
    date: "2026-11-25",
    history: [
      { date: "2026-06", value: 4.72 },
      { date: "2026-07", value: 4.48 },
      { date: "2026-08", value: 4.18 },
      { date: "2026-09", value: 3.96 },
      { date: "2026-10", value: 4.09 },
      { date: "2026-11", value: 4.01 },
    ],
  },
  {
    id: "FEDFUNDS",
    label: "Effective Fed Funds",
    value: 4.08,
    unit: "%",
    change: -0.25,
    date: "2026-11-01",
    history: [
      { date: "2026-06", value: 4.83 },
      { date: "2026-07", value: 4.83 },
      { date: "2026-08", value: 4.58 },
      { date: "2026-09", value: 4.33 },
      { date: "2026-10", value: 4.33 },
      { date: "2026-11", value: 4.08 },
    ],
  },
  {
    id: "CPIAUCSL",
    label: "US CPI Index (YoY Est.)",
    value: 2.54,
    unit: "%",
    change: -0.08,
    date: "2026-10-01",
    history: [
      { date: "2026-05", value: 2.91 },
      { date: "2026-06", value: 2.84 },
      { date: "2026-07", value: 2.75 },
      { date: "2026-08", value: 2.68 },
      { date: "2026-09", value: 2.62 },
      { date: "2026-10", value: 2.54 },
    ],
  },
  {
    id: "UNRATE",
    label: "US Unemployment Rate",
    value: 4.1,
    unit: "%",
    change: 0.0,
    date: "2026-10-01",
    history: [
      { date: "2026-05", value: 4.0 },
      { date: "2026-06", value: 4.1 },
      { date: "2026-07", value: 4.2 },
      { date: "2026-08", value: 4.1 },
      { date: "2026-09", value: 4.1 },
      { date: "2026-10", value: 4.1 },
    ],
  },
];

export const SEED_HEADLINES: MarketHeadline[] = [
  {
    id: "hd-1",
    title: "Treasury 2s10s curve remains positively sloped at +23 bps ahead of December FOMC",
    source: "FRED / Market Desk",
    publishedAt: "2026-11-26T14:20:00Z",
    url: "https://fred.stlouisfed.org",
    sentiment: "positive",
    relatedTickers: ["SPY", "AAPL", "MSFT"],
  },
  {
    id: "hd-2",
    title: "Apple Private Cloud Compute rollout accelerates Q4 services margin expansion",
    source: "SEC EDGAR Filing Digest",
    publishedAt: "2026-11-26T11:45:00Z",
    url: "https://www.sec.gov/edgar/browse/?CIK=0000320193",
    sentiment: "positive",
    relatedTickers: ["AAPL"],
  },
  {
    id: "hd-3",
    title: "Hyperscaler AI capex commitments lift Blackwell rack demand through 1H 2027",
    source: "OpenTerminal Quant Wire",
    publishedAt: "2026-11-25T19:10:00Z",
    url: "https://www.sec.gov/edgar/browse/?CIK=0001045810",
    sentiment: "positive",
    relatedTickers: ["NVDA", "MSFT"],
  },
  {
    id: "hd-4",
    title: "COMEX Gold holds near $2,678 as central bank reserve buying offsets dollar firmness",
    source: "CFTC Positioning Brief",
    publishedAt: "2026-11-25T16:05:00Z",
    url: "https://www.cftc.gov",
    sentiment: "neutral",
    relatedTickers: ["GC=F", "EURUSD"],
  },
  {
    id: "hd-5",
    title: "EV financing incentives weigh on near-term auto margins while Megapack backlog hits high",
    source: "Auto & Energy Tracker",
    publishedAt: "2026-11-25T13:30:00Z",
    url: "https://www.sec.gov/edgar/browse/?CIK=0001318605",
    sentiment: "negative",
    relatedTickers: ["TSLA"],
  },
];
