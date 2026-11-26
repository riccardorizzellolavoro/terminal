export type AssetClass =
  | "equity"
  | "etf"
  | "index"
  | "fx"
  | "crypto"
  | "commodity"
  | "bond";

export type LangCode = "en" | "it";

export interface TickerProfile {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  sector: string;
  exchange: string;
  currency: string;
  cik?: string;
  description: string;
  descriptionIt?: string;
  employees?: number;
  headquarters?: string;
  website?: string;
  expenseRatio?: number;
  aum?: number;
  maturity?: string;
}

export interface QuoteSnapshot {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  week52High: number;
  week52Low: number;
  volume: number;
  avgVolume: number;
  marketCap: number | null;
  peRatio: number | null;
  forwardPe: number | null;
  dividendYield: number | null;
  beta: number | null;
  sharesOutstanding: number | null;
  timestamp: string;
  source: "live" | "cache" | "seed";
}

export interface OhlcvBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FinancialPeriodRow {
  period: string;
  fiscalYear: number;
  fiscalQuarter: "FY" | "Q1" | "Q2" | "Q3" | "Q4";
  endDate: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  interestExpense: number;
  netIncome: number;
  eps: number;
  operatingCashFlow: number;
  capex: number;
  freeCashFlow: number;
  totalAssets: number;
  currentAssets: number;
  cashAndEquivalents: number;
  totalLiabilities: number;
  currentLiabilities: number;
  longTermDebt: number;
  shareholdersEquity: number;
  retainedEarnings: number;
  sharesOutstanding: number;
  receivables: number;
  ppeNet: number;
  depreciation: number;
  isDerivedQ4?: boolean;
  yoyRevenueGrowth?: number | null;
  yoyNetIncomeGrowth?: number | null;
  yoyFcfGrowth?: number | null;
}

export interface SecFilingItem {
  accessionNumber: string;
  form: string;
  filingDate: string;
  reportDate: string;
  description: string;
  url: string;
}

export interface ValuationModelResult {
  id: "dcf" | "eva" | "lynch" | "graham" | "fcf_yield";
  name: string;
  fairValue: number;
  upsidePercent: number;
  formulaSummary: string;
  inputs: Record<string, string | number>;
  enabledByDefault: boolean;
}

export interface QualityScores {
  piotroskiFScore: number;
  piotroskiBreakdown: { label: string; passed: boolean; detail: string }[];
  altmanZScore: number;
  altmanZone: "Safe" | "Grey" | "Distress";
  beneishMScore: number;
  beneishFlag: "Clean" | "Warning";
}

export interface ValuationBundle {
  symbol: string;
  currentPrice: number;
  compositeFairValue: number;
  compositeUpsidePercent: number;
  status: "Undervalued" | "Fairly Valued" | "Overvalued";
  models: ValuationModelResult[];
  quality: QualityScores;
  wacc: number;
  roic: number;
}

export interface SeasonalityWindowStats {
  startMonthDay: string;
  endMonthDay: string;
  yearsAnalyzed: number;
  winRate: number;
  avgReturn: number;
  medianReturn: number;
  bestReturn: number;
  worstReturn: number;
  maxDrawdown: number;
  annualizedReturn: number;
  yearlyBreakdown: {
    year: number;
    startDate: string;
    endDate: string;
    startPrice: number;
    endPrice: number;
    returnPct: number;
    maxDrawdownPct: number;
  }[];
}

export interface SeasonalityCurves {
  symbol: string;
  days: string[];
  curve10Y: number[];
  curve20Y: number[];
  curve30Y: number[];
  defaultWindow: SeasonalityWindowStats;
}

export interface OptionContract {
  contractSymbol: string;
  strike: number;
  expiration: string;
  type: "call" | "put";
  bid: number;
  ask: number;
  lastPrice: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  inTheMoney: boolean;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export interface OptionsChainResponse {
  symbol: string;
  underlyingPrice: number;
  expirations: string[];
  selectedExpiration: string;
  calls: OptionContract[];
  puts: OptionContract[];
  source: "live" | "cache" | "seed";
}

export interface CotPoint {
  date: string;
  commercialNet: number;
  largeSpecNet: number;
  smallTraderNet: number;
  openInterest: number;
  commercialPercentile: number;
  largeSpecPercentile: number;
}

export interface InsiderTrade {
  id: string;
  symbol: string;
  date: string;
  insiderName: string;
  role: string;
  transactionType: "Buy" | "Sell";
  shares: number;
  price: number;
  valueUsd: number;
  postTradeReturnPct: number;
}

export interface CongressTrade {
  id: string;
  symbol: string;
  date: string;
  politician: string;
  chamber: "House" | "Senate";
  party: "D" | "R" | "I";
  transactionType: "Purchase" | "Sale";
  amountRange: string;
  postTradeReturnPct: number;
}

export interface SmartMoneyResponse {
  symbol: string;
  signalLabel: string;
  signalTone: "bullish" | "neutral" | "bearish";
  cotSeries: CotPoint[];
  cotAssetName: string;
  cotExtremeAlert: string | null;
  insiderTrades: InsiderTrade[];
  congressTrades: CongressTrade[];
}

export interface MacroIndicator {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  date: string;
  history: { date: string; value: number }[];
}

export interface SovereignRatesSnapshot {
  usCurve: Array<{ tenor: string; yieldPct: number }>;
  euBenchmarks: Array<{ id: string; label: string; value: number; unit: string; change: number }>;
  spreadsHistory: Array<{
    date: string;
    us2s10sBps: number;
    btpBundBps: number;
  }>;
}

export interface MarketHeadline {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: "positive" | "neutral" | "negative";
  relatedTickers: string[];
}

export interface FilingChunk {
  id: string;
  symbol: string;
  docTitle: string;
  sectionLabel: string;
  citationKey: string;
  fiscalPeriod: string;
  publishedDate: string;
  text: string;
}

export interface ScreenerRow {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  sector: string;
  price: number;
  changePercent: number;
  fairValue: number;
  fairValueUpside: number;
  piotroskiScore: number;
  seasonality30DWinRate: number;
  seasonality30DAvgReturn: number;
  smartMoneySignal: string;
  smartMoneyTone: "bullish" | "neutral" | "bearish";
  recentInsiderBuyCount: number;
  marketCap: number | null;
}

export interface WatchlistEntry {
  symbol: string;
  addedAt: string;
}

export type TerminalTabId =
  | "overview"
  | "valuation"
  | "seasonality"
  | "options"
  | "macro";
