import { OhlcvBar, SeasonalityCurves, SeasonalityWindowStats } from "@/lib/types";

const CALENDAR_GRID: string[] = (() => {
  // Standardized 252-ish trading calendar using non-leap reference year 2025 weekdays
  const labels: string[] = [];
  const d = new Date("2025-01-02T00:00:00Z");
  while (d.getUTCFullYear() === 2025) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) {
      labels.push(d.toISOString().slice(5, 10));
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return labels;
})();

function buildDetrendedCurve(bars: OhlcvBar[], yearsBack: number): number[] {
  if (bars.length < 30) return CALENDAR_GRID.map(() => 0);

  const lastDate = new Date(bars[bars.length - 1].time + "T00:00:00Z");
  const cutoffYear = lastDate.getUTCFullYear() - yearsBack;
  const filtered = bars.filter((b) => Number(b.time.slice(0, 4)) >= cutoffYear);

  // Group bars by year
  const byYear = new Map<number, OhlcvBar[]>();
  for (const bar of filtered) {
    const y = Number(bar.time.slice(0, 4));
    const arr = byYear.get(y) ?? [];
    arr.push(bar);
    byYear.set(y, arr);
  }

  // For each complete or near-complete year, normalize onto CALENDAR_GRID via nearest MM-DD lookup,
  // take log-return from Jan 1, and subtract linear annual drift (detrending).
  const sums = new Array(CALENDAR_GRID.length).fill(0);
  const counts = new Array(CALENDAR_GRID.length).fill(0);

  for (const [, yBars] of byYear.entries()) {
    if (yBars.length < 180) continue;
    const startPrice = yBars[0].close;
    const endPrice = yBars[yBars.length - 1].close;
    const totalLogRet = Math.log(endPrice / startPrice);

    let ptr = 0;
    for (let gi = 0; gi < CALENDAR_GRID.length; gi++) {
      const targetMMDD = CALENDAR_GRID[gi];
      while (ptr < yBars.length - 1 && yBars[ptr].time.slice(5, 10) < targetMMDD) {
        ptr++;
      }
      const bar = yBars[ptr];
      const frac = gi / (CALENDAR_GRID.length - 1);
      const detrendedLog = Math.log(bar.close / startPrice) - frac * totalLogRet;
      sums[gi] += (Math.exp(detrendedLog) - 1) * 100;
      counts[gi] += 1;
    }
  }

  const raw = sums.map((s, idx) => (counts[idx] > 0 ? s / counts[idx] : 0));
  // Anchor start at 0%
  const baseOffset = raw[0] ?? 0;
  return raw.map((v) => Number((v - baseOffset).toFixed(2)));
}

export function computeSeasonalityWindow(
  bars: OhlcvBar[],
  startMonthDay: string,
  endMonthDay: string,
  yearsBack = 30
): SeasonalityWindowStats {
  const lastYear = bars.length > 0 ? Number(bars[bars.length - 1].time.slice(0, 4)) : 2026;
  const minYear = lastYear - yearsBack;

  const byYear = new Map<number, OhlcvBar[]>();
  for (const b of bars) {
    const y = Number(b.time.slice(0, 4));
    if (y >= minYear) {
      const arr = byYear.get(y) ?? [];
      arr.push(b);
      byYear.set(y, arr);
    }
  }

  const crossesYear = startMonthDay > endMonthDay;
  const breakdown: SeasonalityWindowStats["yearlyBreakdown"] = [];

  for (const year of Array.from(byYear.keys()).sort((a, b) => b - a)) {
    const curBars = byYear.get(year) ?? [];
    const nextBars = crossesYear ? byYear.get(year + 1) ?? [] : curBars;
    const startBar = curBars.find((b) => b.time.slice(5, 10) >= startMonthDay);
    const endPool = crossesYear
      ? nextBars.filter((b) => b.time.slice(5, 10) <= endMonthDay)
      : curBars.filter((b) => b.time.slice(5, 10) <= endMonthDay && b.time.slice(5, 10) >= startMonthDay);
    const endBar = endPool[endPool.length - 1];

    if (!startBar || !endBar || startBar.time >= endBar.time) continue;

    const windowBars = crossesYear
      ? [
          ...curBars.filter((b) => b.time >= startBar.time),
          ...nextBars.filter((b) => b.time <= endBar.time),
        ]
      : curBars.filter((b) => b.time >= startBar.time && b.time <= endBar.time);

    let peak = startBar.close;
    let maxDd = 0;
    for (const wb of windowBars) {
      if (wb.close > peak) peak = wb.close;
      const dd = ((wb.close - peak) / peak) * 100;
      if (dd < maxDd) maxDd = dd;
    }

    const retPct = ((endBar.close - startBar.close) / startBar.close) * 100;
    breakdown.push({
      year,
      startDate: startBar.time,
      endDate: endBar.time,
      startPrice: startBar.close,
      endPrice: endBar.close,
      returnPct: Number(retPct.toFixed(2)),
      maxDrawdownPct: Number(maxDd.toFixed(2)),
    });
  }

  if (breakdown.length === 0) {
    return {
      startMonthDay,
      endMonthDay,
      yearsAnalyzed: 0,
      winRate: 0,
      avgReturn: 0,
      medianReturn: 0,
      bestReturn: 0,
      worstReturn: 0,
      maxDrawdown: 0,
      annualizedReturn: 0,
      yearlyBreakdown: [],
    };
  }

  const rets = breakdown.map((b) => b.returnPct).sort((a, b) => a - b);
  const wins = rets.filter((r) => r > 0).length;
  const avg = rets.reduce((a, b) => a + b, 0) / rets.length;
  const mid = Math.floor(rets.length / 2);
  const median = rets.length % 2 === 0 ? (rets[mid - 1] + rets[mid]) / 2 : rets[mid];
  const avgDd = breakdown.reduce((a, b) => a + b.maxDrawdownPct, 0) / breakdown.length;

  const spanDays = Math.max(
    10,
    Math.round(
      (Date.parse(breakdown[0].endDate) - Date.parse(breakdown[0].startDate)) / 86_400_000
    )
  );
  const annualized = (Math.pow(1 + avg / 100, 365 / spanDays) - 1) * 100;

  return {
    startMonthDay,
    endMonthDay,
    yearsAnalyzed: breakdown.length,
    winRate: Number(((wins / breakdown.length) * 100).toFixed(1)),
    avgReturn: Number(avg.toFixed(2)),
    medianReturn: Number(median.toFixed(2)),
    bestReturn: rets[rets.length - 1],
    worstReturn: rets[0],
    maxDrawdown: Number(avgDd.toFixed(2)),
    annualizedReturn: Number(annualized.toFixed(1)),
    yearlyBreakdown: breakdown,
  };
}

export function buildSeasonalityCurves(
  symbol: string,
  bars: OhlcvBar[],
  startMonthDay = "11-01",
  endMonthDay = "12-31"
): SeasonalityCurves {
  return {
    symbol,
    days: CALENDAR_GRID,
    curve10Y: buildDetrendedCurve(bars, 10),
    curve20Y: buildDetrendedCurve(bars, 20),
    curve30Y: buildDetrendedCurve(bars, 30),
    defaultWindow: computeSeasonalityWindow(bars, startMonthDay, endMonthDay, 30),
  };
}
