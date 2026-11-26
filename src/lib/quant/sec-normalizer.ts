import { FinancialPeriodRow } from "@/lib/types";

interface XbrlUnitEntry {
  end: string;
  start?: string;
  val: number;
  fy?: number;
  fp?: string; // "FY", "Q1", "Q2", "Q3", "Q4"
  form?: string;
  filed?: string;
  frame?: string;
}

interface XbrlFactsJson {
  facts?: {
    "us-gaap"?: Record<
      string,
      {
        units?: {
          USD?: XbrlUnitEntry[];
          shares?: XbrlUnitEntry[];
          "USD/shares"?: XbrlUnitEntry[];
        };
      }
    >;
  };
}

const TAG_GROUPS = {
  revenue: [
    "Revenues",
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "SalesRevenueNet",
  ],
  costOfRevenue: ["CostOfGoodsAndServicesSold", "CostOfRevenue"],
  grossProfit: ["GrossProfit"],
  operatingIncome: ["OperatingIncomeLoss"],
  interestExpense: ["InterestExpense", "InterestExpenseDebt"],
  netIncome: ["NetIncomeLoss"],
  eps: ["EarningsPerShareDiluted"],
  operatingCashFlow: ["NetCashProvidedByUsedInOperatingActivities"],
  capex: [
    "PaymentsToAcquirePropertyPlantAndEquipment",
    "PaymentsToAcquireProductiveAssets",
  ],
  totalAssets: ["Assets"],
  currentAssets: ["AssetsCurrent"],
  cashAndEquivalents: [
    "CashAndCashEquivalentsAtCarryingValue",
    "CashCashEquivalentsAndShortTermInvestments",
  ],
  totalLiabilities: ["Liabilities"],
  currentLiabilities: ["LiabilitiesCurrent"],
  longTermDebt: ["LongTermDebtNoncurrent", "LongTermDebt"],
  shareholdersEquity: ["StockholdersEquity"],
  retainedEarnings: ["RetainedEarningsAccumulatedDeficit"],
  sharesOutstanding: [
    "WeightedAverageNumberOfDilutedSharesOutstanding",
    "CommonStockSharesOutstanding",
  ],
  receivables: ["AccountsReceivableNetCurrent"],
  ppeNet: ["PropertyPlantAndEquipmentNet"],
  depreciation: ["DepreciationDepletionAndAmortization", "Depreciation"],
};

function daysBetween(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const s = Date.parse(start);
  const e = Date.parse(end);
  if (Number.isNaN(s) || Number.isNaN(e)) return 0;
  return Math.round((e - s) / 86_400_000);
}

function collectEntries(
  usGaap: Record<string, { units?: Record<string, XbrlUnitEntry[]> }>,
  tags: string[],
  unitKey: "USD" | "shares" | "USD/shares" = "USD"
): XbrlUnitEntry[] {
  const all: XbrlUnitEntry[] = [];
  for (const tag of tags) {
    const entries = usGaap[tag]?.units?.[unitKey];
    if (entries && entries.length > 0) {
      all.push(...entries);
    }
  }
  // Sort chronologically by filed date so later restatements/latest filings win
  all.sort((a, b) => (a.filed ?? "").localeCompare(b.filed ?? ""));
  return all;
}

/**
 * Normalizes SEC EDGAR companyfacts JSON into annual & quarterly FinancialPeriodRow[].
 * Groups strictly by each period's actual endDate (since comparative 10-K rows share the latest fy).
 * Explicitly derives standalone Q4 = FY - (Q1 + Q2 + Q3) for flow metrics
 * and Free Cash Flow = Operating Cash Flow - CapEx.
 */
export function normalizeSecCompanyFacts(factsJson: XbrlFactsJson): {
  annual: FinancialPeriodRow[];
  quarterly: FinancialPeriodRow[];
} {
  const usGaap = factsJson?.facts?.["us-gaap"];
  if (!usGaap) return { annual: [], quarterly: [] };

  type MetricMap = Record<string, number>;
  // Key annual periods by endDate (YYYY-MM-DD) to avoid comparative-year collisions
  const annualByEnd = new Map<string, { year: number; endDate: string; metrics: MetricMap }>();
  const quarterByKey = new Map<
    string,
    { fy: number; fp: "Q1" | "Q2" | "Q3" | "Q4"; endDate: string; metrics: MetricMap }
  >();

  const extractFlow = (
    metricName: keyof typeof TAG_GROUPS,
    unit: "USD" | "shares" | "USD/shares" = "USD"
  ) => {
    const entries = collectEntries(usGaap, TAG_GROUPS[metricName], unit);
    for (const e of entries) {
      if (!e.end) continue;
      const endYear = Number(e.end.slice(0, 4));
      if (endYear < 2019) continue;
      const days = daysBetween(e.start, e.end);

      // Annual ~330-380 days (or instant shares with fp=FY) from 10-K
      if (e.form === "10-K" && (days >= 330 || (days === 0 && e.fp === "FY"))) {
        const cur = annualByEnd.get(e.end) ?? {
          year: endYear,
          endDate: e.end,
          metrics: {},
        };
        cur.metrics[metricName] = e.val;
        annualByEnd.set(e.end, cur);
      } else if (
        (e.fp === "Q1" || e.fp === "Q2" || e.fp === "Q3") &&
        days >= 70 &&
        days <= 115 &&
        (e.form === "10-Q" || e.form === "10-K")
      ) {
        const qYear = e.fy ?? endYear;
        const key = `${qYear}-${e.fp}`;
        const cur = quarterByKey.get(key) ?? {
          fy: qYear,
          fp: e.fp,
          endDate: e.end,
          metrics: {},
        };
        cur.endDate = e.end;
        cur.metrics[metricName] = e.val;
        quarterByKey.set(key, cur);
      }
    }
  };

  const extractPoint = (
    metricName: keyof typeof TAG_GROUPS,
    unit: "USD" | "shares" = "USD"
  ) => {
    const entries = collectEntries(usGaap, TAG_GROUPS[metricName], unit);
    for (const e of entries) {
      if (!e.end) continue;
      const endYear = Number(e.end.slice(0, 4));
      if (endYear < 2019) continue;

      if (e.form === "10-K") {
        const cur = annualByEnd.get(e.end);
        if (cur) cur.metrics[metricName] = e.val;
      } else if (
        (e.fp === "Q1" || e.fp === "Q2" || e.fp === "Q3") &&
        e.form === "10-Q"
      ) {
        const qYear = e.fy ?? endYear;
        const cur = quarterByKey.get(`${qYear}-${e.fp}`);
        if (cur) cur.metrics[metricName] = e.val;
      }
    }
  };

  const flowKeys: (keyof typeof TAG_GROUPS)[] = [
    "revenue",
    "costOfRevenue",
    "grossProfit",
    "operatingIncome",
    "interestExpense",
    "netIncome",
    "operatingCashFlow",
    "capex",
    "depreciation",
  ];
  for (const k of flowKeys) extractFlow(k, "USD");
  extractFlow("eps", "USD/shares");
  extractFlow("sharesOutstanding", "shares");

  const pointKeys: (keyof typeof TAG_GROUPS)[] = [
    "totalAssets",
    "currentAssets",
    "cashAndEquivalents",
    "totalLiabilities",
    "currentLiabilities",
    "longTermDebt",
    "shareholdersEquity",
    "retainedEarnings",
    "receivables",
    "ppeNet",
  ];
  for (const k of pointKeys) extractPoint(k, "USD");

  const toRow = (
    period: string,
    fiscalYear: number,
    fiscalQuarter: "FY" | "Q1" | "Q2" | "Q3" | "Q4",
    endDate: string,
    m: MetricMap,
    isDerivedQ4 = false
  ): FinancialPeriodRow => {
    const rev = m.revenue ?? 0;
    const cost = m.costOfRevenue ?? 0;
    const gross = m.grossProfit ?? (rev > 0 && cost > 0 ? rev - cost : 0);
    const opInc = m.operatingIncome ?? 0;
    const ocf = m.operatingCashFlow ?? 0;
    const capex = Math.abs(m.capex ?? 0);
    const fcf = ocf - capex;
    return {
      period,
      fiscalYear,
      fiscalQuarter,
      endDate,
      revenue: rev,
      costOfRevenue: cost,
      grossProfit: gross,
      operatingExpenses: Math.max(0, gross - opInc),
      operatingIncome: opInc,
      interestExpense: Math.abs(m.interestExpense ?? 0),
      netIncome: m.netIncome ?? 0,
      eps: m.eps ?? 0,
      operatingCashFlow: ocf,
      capex,
      freeCashFlow: fcf,
      totalAssets: m.totalAssets ?? 0,
      currentAssets: m.currentAssets ?? 0,
      cashAndEquivalents: m.cashAndEquivalents ?? 0,
      totalLiabilities: m.totalLiabilities ?? 0,
      currentLiabilities: m.currentLiabilities ?? 0,
      longTermDebt: m.longTermDebt ?? 0,
      shareholdersEquity: m.shareholdersEquity ?? 0,
      retainedEarnings: m.retainedEarnings ?? 0,
      sharesOutstanding: m.sharesOutstanding ?? 0,
      receivables: m.receivables ?? 0,
      ppeNet: m.ppeNet ?? 0,
      depreciation: m.depreciation ?? 0,
      isDerivedQ4,
    };
  };

  // Deduplicate by fiscal year keeping complete balance sheet + revenue rows
  const annualEntries = Array.from(annualByEnd.values())
    .filter((a) => (a.metrics.revenue ?? 0) > 0 && (a.metrics.totalAssets ?? 0) > 0)
    .sort((a, b) => a.endDate.localeCompare(b.endDate));

  const annualByYear = new Map<number, { endDate: string; metrics: MetricMap }>();
  for (const entry of annualEntries) {
    annualByYear.set(entry.year, { endDate: entry.endDate, metrics: entry.metrics });
  }

  const years = Array.from(annualByYear.keys()).sort((a, b) => a - b);
  const annual: FinancialPeriodRow[] = years.map((y) => {
    const entry = annualByYear.get(y)!;
    return toRow(String(y), y, "FY", entry.endDate, entry.metrics, false);
  });

  // Derive standalone Q4 = FY - (Q1 + Q2 + Q3) for flow metrics
  const deriveFlowKeys: (keyof typeof TAG_GROUPS)[] = [
    "revenue",
    "costOfRevenue",
    "grossProfit",
    "operatingIncome",
    "interestExpense",
    "netIncome",
    "operatingCashFlow",
    "capex",
    "depreciation",
  ];

  for (const fy of years) {
    const fyEntry = annualByYear.get(fy);
    const q1 = quarterByKey.get(`${fy}-Q1`);
    const q2 = quarterByKey.get(`${fy}-Q2`);
    const q3 = quarterByKey.get(`${fy}-Q3`);
    if (fyEntry && q1 && q2 && q3) {
      const q4Metrics: MetricMap = { ...fyEntry.metrics };
      for (const k of deriveFlowKeys) {
        const fyVal = fyEntry.metrics[k] ?? 0;
        const sum3 =
          (q1.metrics[k] ?? 0) + (q2.metrics[k] ?? 0) + (q3.metrics[k] ?? 0);
        q4Metrics[k] = fyVal - sum3;
      }
      if (fyEntry.metrics.eps) {
        q4Metrics.eps = Number(
          (
            fyEntry.metrics.eps -
            ((q1.metrics.eps ?? 0) +
              (q2.metrics.eps ?? 0) +
              (q3.metrics.eps ?? 0))
          ).toFixed(2)
        );
      }
      quarterByKey.set(`${fy}-Q4`, {
        fy,
        fp: "Q4",
        endDate: fyEntry.endDate,
        metrics: q4Metrics,
      });
    }
  }

  const quarterly: FinancialPeriodRow[] = Array.from(quarterByKey.values())
    .filter((q) => (q.metrics.revenue ?? 0) !== 0)
    .sort((a, b) => a.endDate.localeCompare(b.endDate))
    .map((q) =>
      toRow(`${q.fy}-${q.fp}`, q.fy, q.fp, q.endDate, q.metrics, q.fp === "Q4")
    );

  const attachYoY = (rows: FinancialPeriodRow[], step: number) =>
    rows.map((row, idx) => {
      const prev = idx >= step ? rows[idx - step] : null;
      const pct = (cur: number, prior: number) =>
        prior && Math.abs(prior) > 0
          ? Number((((cur - prior) / Math.abs(prior)) * 100).toFixed(1))
          : null;
      return {
        ...row,
        yoyRevenueGrowth: prev ? pct(row.revenue, prev.revenue) : null,
        yoyNetIncomeGrowth: prev ? pct(row.netIncome, prev.netIncome) : null,
        yoyFcfGrowth: prev ? pct(row.freeCashFlow, prev.freeCashFlow) : null,
      };
    });

  return {
    annual: attachYoY(annual, 1).slice(-6),
    quarterly: attachYoY(quarterly, 4).slice(-12),
  };
}
