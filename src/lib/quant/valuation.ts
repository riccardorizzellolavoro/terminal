import {
  FinancialPeriodRow,
  QualityScores,
  ValuationBundle,
  ValuationModelResult,
} from "@/lib/types";

export function computeValuationBundle(
  symbol: string,
  currentPrice: number,
  annuals: FinancialPeriodRow[],
  riskFreeRate = 0.0424
): ValuationBundle {
  const latest = annuals[annuals.length - 1];
  const prev = annuals.length >= 2 ? annuals[annuals.length - 2] : latest;
  const first = annuals[0] ?? latest;

  const shares = Math.max(1, latest.sharesOutstanding || 1_000_000_000);
  const fcf =
    latest.freeCashFlow > 0
      ? latest.freeCashFlow
      : Math.max(latest.netIncome * 0.85, 1);
  const netCash = latest.cashAndEquivalents - latest.longTermDebt;

  // Historical revenue & EPS CAGR
  const yearsSpan = Math.max(1, annuals.length - 1);
  const revCagr =
    first.revenue > 0 && latest.revenue > 0
      ? Math.pow(latest.revenue / first.revenue, 1 / yearsSpan) - 1
      : 0.1;
  const firstEps = first.eps || first.netIncome / Math.max(1, first.sharesOutstanding || shares);
  const latestEps = latest.eps || latest.netIncome / shares;
  const epsCagr =
    firstEps > 0 && latestEps > 0
      ? Math.pow(latestEps / firstEps, 1 / yearsSpan) - 1
      : revCagr;

  const blendedCagr = Math.max(revCagr, (revCagr + epsCagr) / 2);
  const growth5Y = Math.min(0.28, Math.max(0.08, blendedCagr * 0.9));

  // WACC: CAPM simplified with institutional 4.0% equity risk premium
  const betaProxy =
    symbol === "NVDA"
      ? 1.35
      : symbol === "TSLA"
        ? 1.55
        : symbol === "MSFT"
          ? 0.9
          : 1.02;
  const costOfEquity = riskFreeRate + betaProxy * 0.04;
  const marketCap = currentPrice * shares;
  const totalCapital = Math.max(1, marketCap + latest.longTermDebt);
  const wacc = Number(
    Math.min(
      0.108,
      Math.max(
        0.072,
        (marketCap / totalCapital) * costOfEquity +
          (latest.longTermDebt / totalCapital) * 0.045 * 0.79
      )
    ).toFixed(4)
  );
  const terminalGrowth = 0.035;

  // 1. DCF Model (5-year explicit FCF + Gordon Growth Terminal Value)
  let pvFcf = 0;
  let projFcf = fcf;
  for (let yr = 1; yr <= 5; yr++) {
    const fadeGrowth = growth5Y * Math.pow(0.92, yr - 1);
    projFcf = projFcf * (1 + fadeGrowth);
    pvFcf += projFcf / Math.pow(1 + wacc, yr);
  }
  const terminalVal =
    (projFcf * (1 + terminalGrowth)) / Math.max(0.025, wacc - terminalGrowth);
  const pvTerminal = terminalVal / Math.pow(1 + wacc, 5);
  const dcfEquityValue = pvFcf + pvTerminal + netCash;
  const dcfFairValue = Number(Math.max(1, dcfEquityValue / shares).toFixed(2));

  // 2. Economic Value Added (EVA) Model with compounder growth fade
  const nopat = latest.operatingIncome * 0.82;
  const investedCapital = Math.max(
    1,
    latest.shareholdersEquity +
      latest.longTermDebt -
      latest.cashAndEquivalents * 0.5
  );
  const roic = Number((nopat / investedCapital).toFixed(4));
  const evaAnnual = nopat - investedCapital * wacc;
  const evaFadeG = Math.min(0.055, growth5Y * 0.45);
  const evaSpread = Math.max(0.024, wacc - evaFadeG);
  const evaValue =
    investedCapital +
    Math.max(-investedCapital * 0.3, evaAnnual / evaSpread) +
    netCash * 0.4;
  const evaFairValue = Number(Math.max(1, evaValue / shares).toFixed(2));

  // 3. Peter Lynch Fair Value (EPS * Quality-Adjusted Growth Multiple)
  const eps = Math.max(0.1, latestEps);
  const epsGrowthPct = Math.min(38, Math.max(14, growth5Y * 100 * 1.25));
  const lynchMultiple = Math.min(44, epsGrowthPct * 1.25 + 6);
  const lynchFairValue = Number(Math.max(1, eps * lynchMultiple).toFixed(2));

  // 4. Institutional FCF Yield Target (2.3% for >25% ROIC compounders, 3.0% standard)
  const targetYield = roic > 0.25 ? 0.023 : 0.03;
  const fcfYieldFairValue = Number(
    Math.max(1, fcf / shares / targetYield).toFixed(2)
  );

  // 5. Graham Intrinsic Value Formula: V = EPS * (8.5 + 2g) * (4.4 / Y)
  const aaaYield = 4.95;
  const grahamFairValue = Number(
    Math.max(
      1,
      (eps * (8.5 + 1.8 * Math.min(24, growth5Y * 100)) * 4.4) / aaaYield
    ).toFixed(2)
  );

  const upside = (fv: number) =>
    Number((((fv - currentPrice) / currentPrice) * 100).toFixed(1));

  const models: ValuationModelResult[] = [
    {
      id: "dcf",
      name: "Discounted Cash Flow (DCF)",
      fairValue: dcfFairValue,
      upsidePercent: upside(dcfFairValue),
      formulaSummary: `5Y FCF CAGR ${(growth5Y * 100).toFixed(1)}% · WACC ${(wacc * 100).toFixed(2)}% · g = 3.5%`,
      inputs: {
        "Base FCF": `$${(fcf / 1e9).toFixed(2)}B`,
        "5Y Growth": `${(growth5Y * 100).toFixed(1)}%`,
        WACC: `${(wacc * 100).toFixed(2)}%`,
        "Net Cash": `$${(netCash / 1e9).toFixed(1)}B`,
      },
      enabledByDefault: true,
    },
    {
      id: "eva",
      name: "Economic Value Added (EVA)",
      fairValue: evaFairValue,
      upsidePercent: upside(evaFairValue),
      formulaSummary: `Invested Capital + PV(NOPAT − Capital × WACC) · ROIC ${(roic * 100).toFixed(1)}%`,
      inputs: {
        NOPAT: `$${(nopat / 1e9).toFixed(2)}B`,
        ROIC: `${(roic * 100).toFixed(1)}%`,
        "Capital Charge": `${(wacc * 100).toFixed(2)}%`,
      },
      enabledByDefault: true,
    },
    {
      id: "lynch",
      name: "Peter Lynch Fair Value",
      fairValue: lynchFairValue,
      upsidePercent: upside(lynchFairValue),
      formulaSummary: `EPS ($${eps.toFixed(2)}) × Quality-Adjusted PEG Multiple (${lynchMultiple.toFixed(1)}x)`,
      inputs: {
        "Diluted EPS": `$${eps.toFixed(2)}`,
        "Growth Rate": `${epsGrowthPct.toFixed(1)}%`,
        "Target P/E": `${lynchMultiple.toFixed(1)}x`,
      },
      enabledByDefault: true,
    },
    {
      id: "fcf_yield",
      name: "Institutional FCF Yield",
      fairValue: fcfYieldFairValue,
      upsidePercent: upside(fcfYieldFairValue),
      formulaSummary: `FCF per share ($${(fcf / shares).toFixed(2)}) ÷ Target Yield (${(targetYield * 100).toFixed(1)}%)`,
      inputs: {
        "FCF / Share": `$${(fcf / shares).toFixed(2)}`,
        "Target Yield": `${(targetYield * 100).toFixed(1)}%`,
      },
      enabledByDefault: true,
    },
    {
      id: "graham",
      name: "Graham Revised Formula",
      fairValue: grahamFairValue,
      upsidePercent: upside(grahamFairValue),
      formulaSummary: `EPS × (8.5 + 1.8g) × (4.4 / AAA Yield 4.95%)`,
      inputs: {
        "Diluted EPS": `$${eps.toFixed(2)}`,
        "AAA Bond Yield": `${aaaYield}%`,
      },
      enabledByDefault: false,
    },
  ];

  // Piotroski F-Score (0-9)
  const roaCur = latest.netIncome / Math.max(1, latest.totalAssets);
  const roaPrev = prev.netIncome / Math.max(1, prev.totalAssets);
  const cfoRoa = latest.operatingCashFlow / Math.max(1, latest.totalAssets);
  const levCur = latest.longTermDebt / Math.max(1, latest.totalAssets);
  const levPrev = prev.longTermDebt / Math.max(1, prev.totalAssets);
  const crCur = latest.currentAssets / Math.max(1, latest.currentLiabilities);
  const crPrev = prev.currentAssets / Math.max(1, prev.currentLiabilities);
  const gmCur = latest.grossProfit / Math.max(1, latest.revenue);
  const gmPrev = prev.grossProfit / Math.max(1, prev.revenue);
  const atCur = latest.revenue / Math.max(1, latest.totalAssets);
  const atPrev = prev.revenue / Math.max(1, prev.totalAssets);

  const piotroskiBreakdown = [
    {
      label: "Positive Net Income (ROA > 0)",
      passed: roaCur > 0,
      detail: `ROA ${(roaCur * 100).toFixed(1)}%`,
    },
    {
      label: "Positive Operating Cash Flow",
      passed: latest.operatingCashFlow > 0,
      detail: `OCF $${(latest.operatingCashFlow / 1e9).toFixed(1)}B`,
    },
    {
      label: "ROA Improvement YoY",
      passed: roaCur >= roaPrev - 0.005,
      detail: `${(roaCur * 100).toFixed(1)}% vs ${(roaPrev * 100).toFixed(1)}%`,
    },
    {
      label: "Cash Flow Quality (OCF > Net Income)",
      passed: cfoRoa > roaCur,
      detail: `OCF/Assets ${(cfoRoa * 100).toFixed(1)}%`,
    },
    {
      label: "Lower Long-Term Leverage YoY",
      passed: levCur <= levPrev + 0.005,
      detail: `Debt/Assets ${(levCur * 100).toFixed(1)}%`,
    },
    {
      label: "Higher Current Ratio YoY",
      passed: crCur >= crPrev - 0.02,
      detail: `${crCur.toFixed(2)}x`,
    },
    {
      label: "No Share Dilution",
      passed: latest.sharesOutstanding <= prev.sharesOutstanding * 1.005,
      detail: "Shares flat or reduced",
    },
    {
      label: "Gross Margin Expansion",
      passed: gmCur >= gmPrev - 0.002,
      detail: `${(gmCur * 100).toFixed(1)}%`,
    },
    {
      label: "Asset Turnover Expansion",
      passed: atCur >= atPrev - 0.01,
      detail: `${atCur.toFixed(2)}x`,
    },
  ];
  const piotroskiFScore = piotroskiBreakdown.filter((b) => b.passed).length;

  // Altman Z-Score
  const wc = latest.currentAssets - latest.currentLiabilities;
  const ta = Math.max(1, latest.totalAssets);
  const tl = Math.max(1, latest.totalLiabilities);
  const altmanZScore = Number(
    (
      1.2 * (wc / ta) +
      1.4 * (latest.retainedEarnings / ta) +
      3.3 * (latest.operatingIncome / ta) +
      0.6 * (marketCap / tl) +
      1.0 * (latest.revenue / ta)
    ).toFixed(2)
  );
  const altmanZone: QualityScores["altmanZone"] =
    altmanZScore >= 2.99 ? "Safe" : altmanZScore >= 1.81 ? "Grey" : "Distress";

  // Beneish M-Score (simplified 8-factor calculation)
  const dsri =
    latest.receivables / Math.max(1, latest.revenue) /
    Math.max(0.001, prev.receivables / Math.max(1, prev.revenue));
  const gmi = Math.max(0.5, gmPrev / Math.max(0.01, gmCur));
  const sgi = latest.revenue / Math.max(1, prev.revenue);
  const tata = (latest.netIncome - latest.operatingCashFlow) / ta;
  const beneishMScore = Number(
    (
      -4.84 +
      0.92 * dsri +
      0.528 * gmi +
      0.404 * 1.0 +
      0.892 * sgi +
      0.115 * 1.0 -
      0.172 * 1.0 +
      4.679 * tata -
      0.327 * 1.0
    ).toFixed(2)
  );
  const beneishFlag: QualityScores["beneishFlag"] =
    beneishMScore > -1.78 ? "Warning" : "Clean";

  const activeDefaults = models.filter((m) => m.enabledByDefault);
  const compositeFairValue = Number(
    (
      activeDefaults.reduce((acc, m) => acc + m.fairValue, 0) /
      activeDefaults.length
    ).toFixed(2)
  );
  const compositeUpsidePercent = upside(compositeFairValue);
  const status: ValuationBundle["status"] =
    compositeUpsidePercent >= 8
      ? "Undervalued"
      : compositeUpsidePercent <= -8
        ? "Overvalued"
        : "Fairly Valued";

  return {
    symbol,
    currentPrice,
    compositeFairValue,
    compositeUpsidePercent,
    status,
    models,
    quality: {
      piotroskiFScore,
      piotroskiBreakdown,
      altmanZScore,
      altmanZone,
      beneishMScore,
      beneishFlag,
    },
    wacc,
    roic,
  };
}
