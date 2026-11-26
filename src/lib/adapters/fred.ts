import { getCachedOrFetch } from "@/lib/db";
import { SEED_MACRO_INDICATORS } from "@/lib/seed/fundamentals";
import { MacroIndicator } from "@/lib/types";

const FRED_SERIES: Array<{ id: string; label: string; unit: string; yoyTransform?: boolean }> = [
  { id: "DGS10", label: "US 10Y Treasury Yield", unit: "%" },
  { id: "DGS2", label: "US 2Y Treasury Yield", unit: "%" },
  { id: "FEDFUNDS", label: "Effective Fed Funds", unit: "%" },
  { id: "CPIAUCSL", label: "US CPI Inflation (YoY)", unit: "%", yoyTransform: true },
  { id: "UNRATE", label: "US Unemployment Rate", unit: "%" },
];

async function fetchFredSeriesCsv(
  seriesId: string,
  label: string,
  unit: string,
  yoyTransform?: boolean
): Promise<MacroIndicator> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(
      `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`,
      { signal: controller.signal }
    );
    if (!res.ok) throw new Error(`FRED HTTP ${res.status}`);
    const csv = await res.text();
    const lines = csv.trim().split(/\r?\n/).slice(1);
    const parsed: { date: string; value: number }[] = [];
    for (const line of lines.slice(-60)) {
      const [date, rawVal] = line.split(",");
      const valStr = rawVal?.trim() ?? "";
      if (!date || !valStr || valStr === ".") continue;
      const num = Number(valStr);
      if (Number.isFinite(num) && num > 0) {
        parsed.push({ date: date.trim(), value: num });
      }
    }
    if (parsed.length < 13) throw new Error("Insufficient FRED rows");

    let seriesPoints = parsed;
    if (yoyTransform) {
      const transformed: { date: string; value: number }[] = [];
      for (let i = 12; i < parsed.length; i++) {
        const pt = parsed[i];
        const prior = parsed[i - 12];
        if (prior && prior.value > 0 && Number.isFinite(pt.value)) {
          const yoy = ((pt.value - prior.value) / prior.value) * 100;
          if (Number.isFinite(yoy)) {
            transformed.push({ date: pt.date, value: Number(yoy.toFixed(2)) });
          }
        }
      }
      seriesPoints = transformed;
    }

    if (seriesPoints.length < 2) throw new Error("Insufficient finite FRED rows");
    const latest = seriesPoints[seriesPoints.length - 1];
    const prev = seriesPoints[seriesPoints.length - 2] ?? latest;
    const change = Number((latest.value - prev.value).toFixed(2));

    if (!Number.isFinite(latest.value) || !Number.isFinite(change)) {
      throw new Error("Non-finite FRED output");
    }

    return {
      id: seriesId,
      label,
      value: Number(latest.value.toFixed(2)),
      unit,
      change,
      date: latest.date,
      history: seriesPoints.slice(-12),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function getFredMacroIndicators(): Promise<{
  indicators: MacroIndicator[];
  source: "live" | "cache" | "seed";
}> {
  const { data, source } = await getCachedOrFetch<MacroIndicator[]>(
    "fred:macro_series:v2",
    3600, // 1 hour TTL
    async () => {
      const results = await Promise.all(
        FRED_SERIES.map((s) =>
          fetchFredSeriesCsv(s.id, s.label, s.unit, s.yoyTransform)
        )
      );
      return results;
    },
    () => SEED_MACRO_INDICATORS
  );

  // Defensive sanitation against any null/non-finite entries
  const sanitized = data.map((m, idx) => {
    const fallback = SEED_MACRO_INDICATORS[idx] ?? SEED_MACRO_INDICATORS[0];
    const safeVal =
      typeof m.value === "number" && Number.isFinite(m.value)
        ? m.value
        : fallback.value;
    const safeChg =
      typeof m.change === "number" && Number.isFinite(m.change)
        ? m.change
        : fallback.change;
    return {
      ...m,
      value: safeVal,
      change: safeChg,
      history: (m.history ?? []).filter(
        (h) => typeof h.value === "number" && Number.isFinite(h.value)
      ),
    };
  });

  return { indicators: sanitized, source };
}
