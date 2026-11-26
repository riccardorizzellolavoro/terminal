"use client";

import React, { useEffect, useMemo, useState } from "react";
import type * as echarts from "echarts";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { EChartsBox } from "@/components/terminal/EChartsBox";
import { formatPrice, formatSignedPct } from "@/lib/format";
import { MacroIndicator, MarketHeadline, ScreenerRow } from "@/lib/types";

interface DiscoverViewProps {
  initialRows: ScreenerRow[];
}

interface MacroPayload {
  headerPills?: {
    sp500: { label: string; value: number; changePercent: number };
    nasdaq: { label: string; value: number; changePercent: number };
    tenYearYield: { label: string; value: number; change: number };
  };
  macroIndicators: MacroIndicator[];
  macroSource: string;
  headlines: MarketHeadline[];
}

type PresetId =
  | "all"
  | "undervalued_quality"
  | "seasonality_75"
  | "insider_buying";

export function DiscoverView({ initialRows }: DiscoverViewProps) {
  const router = useRouter();
  const [rows, setRows] = useState<ScreenerRow[]>(initialRows);
  const [preset, setPreset] = useState<PresetId>("all");
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Market Pulse + Collapsed Macro Section
  const [macro, setMacro] = useState<MacroPayload | null>(null);
  const [btcTick, setBtcTick] = useState({ price: 94280.5, changePct: 1.99 });
  const [macroOpen, setMacroOpen] = useState(false);

  // Granular Filters Slide-Over Drawer (closed by default)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minUpside, setMinUpside] = useState(-50);
  const [minPiotroski, setMinPiotroski] = useState(0);
  const [minWinRate, setMinWinRate] = useState(0);
  const [assetClass, setAssetClass] = useState("all");
  const [insiderBuyOnly, setInsiderBuyOnly] = useState(false);

  useEffect(() => {
    fetch("/api/macro")
      .then((r) => r.json())
      .then((json: MacroPayload) => setMacro(json))
      .catch(() => {});
  }, []);

  // Client-side Binance WebSocket for live BTC pulse
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@miniTicker");
      ws.onmessage = (event) => {
        try {
          const d = JSON.parse(event.data) as { c?: string; o?: string };
          const close = Number(d.c);
          const open = Number(d.o);
          if (close && open) {
            setBtcTick({
              price: close,
              changePct: Number((((close - open) / open) * 100).toFixed(2)),
            });
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // keep fallback
    }
    return () => {
      if (ws && ws.readyState <= WebSocket.OPEN) ws.close();
    };
  }, []);

  const runPreset = async (nextPreset: PresetId) => {
    setPreset(nextPreset);
    setShowMore(false);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/screener?preset=${encodeURIComponent(nextPreset)}`
      );
      if (res.ok) {
        const json = (await res.json()) as { rows?: ScreenerRow[] };
        if (json.rows) setRows(json.rows);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyCustomFilters = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreset("all");
    setShowMore(false);
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        preset: "all",
        minUpside: String(minUpside),
        minPiotroski: String(minPiotroski),
        minWinRate: String(minWinRate),
        assetClass,
        insiderBuyOnly: String(insiderBuyOnly),
      });
      const res = await fetch(`/api/screener?${qs.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as { rows?: ScreenerRow[] };
        if (json.rows) setRows(json.rows);
      }
      setFiltersOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const yieldOption = useMemo<echarts.EChartsOption>(() => {
    if (!macro) return {};
    const d10 = macro.macroIndicators.find((m) => m.id === "DGS10");
    const d2 = macro.macroIndicators.find((m) => m.id === "DGS2");
    const dates = d10?.history.map((h) => h.date) ?? [];
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0B0E14",
        borderColor: "rgba(255,255,255,0.1)",
        textStyle: { color: "#E2E8F0", fontSize: 12 },
      },
      legend: { top: 0, right: 0, textStyle: { color: "#94A3B8", fontSize: 11 } },
      grid: { left: 44, right: 16, top: 32, bottom: 24 },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
        axisLabel: { color: "#94A3B8", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        scale: true,
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
        axisLabel: {
          color: "#94A3B8",
          fontSize: 11,
          formatter: (v: number) => `${v.toFixed(2)}%`,
        },
      },
      series: [
        {
          name: "10Y Yield",
          type: "line",
          smooth: true,
          lineStyle: { width: 2, color: "#10B981" },
          data: d10?.history.map((h) => h.value) ?? [],
        },
        {
          name: "2Y Yield",
          type: "line",
          smooth: true,
          lineStyle: { width: 1.8, color: "#94A3B8" },
          data: d2?.history.map((h) => h.value) ?? [],
        },
      ],
    };
  }, [macro]);

  const sp = macro?.headerPills?.sp500 ?? { value: 5998.74, changePercent: 0.68 };
  const nq = macro?.headerPills?.nasdaq ?? { value: 19184.22, changePercent: 0.94 };
  const y10 = macro?.headerPills?.tenYearYield ?? { value: 4.24, change: -0.04 };

  const visibleRows = showMore ? rows : rows.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* 1. Compact 4-Item Market Pulse Row */}
      <div className="grid divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-[#11151E] sm:grid-cols-2 md:grid-cols-4 md:divide-x md:divide-y-0">
        <div className="p-5">
          <div className="text-xs text-slate-400">S&amp;P 500</div>
          <div className="mt-1.5 flex items-baseline gap-2.5 font-mono tabular-nums">
            <span className="text-lg font-semibold text-white">
              {sp.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
            <span
              className={`text-xs ${
                sp.changePercent >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
              }`}
            >
              {formatSignedPct(sp.changePercent)}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-slate-400">Nasdaq</div>
          <div className="mt-1.5 flex items-baseline gap-2.5 font-mono tabular-nums">
            <span className="text-lg font-semibold text-white">
              {nq.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
            <span
              className={`text-xs ${
                nq.changePercent >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
              }`}
            >
              {formatSignedPct(nq.changePercent)}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-slate-400">10Y Treasury</div>
          <div className="mt-1.5 flex items-baseline gap-2.5 font-mono tabular-nums">
            <span className="text-lg font-semibold text-white">
              {y10.value.toFixed(2)}%
            </span>
            <span
              className={`text-xs ${
                y10.change >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
              }`}
            >
              {y10.change > 0 ? `+${y10.change.toFixed(2)}` : y10.change.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-slate-400">BTC</div>
          <div className="mt-1.5 flex items-baseline gap-2.5 font-mono tabular-nums">
            <span className="text-lg font-semibold text-white">
              ${btcTick.price.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
            <span
              className={`text-xs ${
                btcTick.changePct >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
              }`}
            >
              {formatSignedPct(btcTick.changePct)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Screener Header + 3 Preset Pills */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Discover
          </h1>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#11151E] px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:text-white"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            Filters
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => runPreset("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              preset === "all"
                ? "bg-white/[0.14] text-white"
                : "border border-white/[0.06] bg-[#11151E] text-slate-400 hover:text-white"
            }`}
          >
            All ({initialRows.length})
          </button>

          <button
            type="button"
            onClick={() => runPreset("undervalued_quality")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              preset === "undervalued_quality"
                ? "bg-[#3B82F6] text-white"
                : "border border-white/[0.06] bg-[#11151E] text-slate-400 hover:text-white"
            }`}
          >
            Undervalued + High Quality
          </button>

          <button
            type="button"
            onClick={() => runPreset("seasonality_75")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              preset === "seasonality_75"
                ? "bg-[#3B82F6] text-white"
                : "border border-white/[0.06] bg-[#11151E] text-slate-400 hover:text-white"
            }`}
          >
            &gt;75% Seasonal Win Rate
          </button>

          <button
            type="button"
            onClick={() => runPreset("insider_buying")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              preset === "insider_buying"
                ? "bg-[#3B82F6] text-white"
                : "border border-white/[0.06] bg-[#11151E] text-slate-400 hover:text-white"
            }`}
          >
            Recent Insider Buying
          </button>
        </div>
      </div>

      {/* 3. Clean 5-Column Screener Results Table */}
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-slate-400">
                <th className="px-6 py-3.5 font-medium">Ticker &amp; Name</th>
                <th className="px-6 py-3.5 text-right font-mono font-medium">
                  Price
                </th>
                <th className="px-6 py-3.5 text-right font-mono font-medium">
                  Fair Value Upside
                </th>
                <th className="px-6 py-3.5 text-right font-mono font-medium">
                  30D Seasonality
                </th>
                <th className="px-6 py-3.5 text-right font-medium">
                  Smart Money
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-slate-400"
                  >
                    Screening universe...
                  </td>
                </tr>
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-slate-400"
                  >
                    No assets match the current filter criteria.
                  </td>
                </tr>
              ) : (
                visibleRows.map((r) => (
                  <tr
                    key={r.symbol}
                    onClick={() =>
                      router.push(`/terminal/${encodeURIComponent(r.symbol)}`)
                    }
                    className="h-12 cursor-pointer transition hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-white">
                          {r.symbol}
                        </span>
                        <span className="text-slate-300">{r.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-3 text-right font-mono tabular-nums">
                      <span className="text-white">
                        {r.assetClass === "fx" ? "" : "$"}
                        {formatPrice(r.price, r.symbol)}
                      </span>
                      <span
                        className={`ml-2 text-xs ${
                          r.changePercent >= 0
                            ? "text-[#10B981]"
                            : "text-[#F43F5E]"
                        }`}
                      >
                        {formatSignedPct(r.changePercent)}
                      </span>
                    </td>

                    <td className="px-6 py-3 text-right font-mono tabular-nums">
                      {r.assetClass === "equity" ? (
                        <span
                          className={
                            r.fairValueUpside >= 0
                              ? "text-[#10B981]"
                              : "text-[#F43F5E]"
                          }
                        >
                          {formatSignedPct(r.fairValueUpside)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Spot</span>
                      )}
                    </td>

                    <td className="px-6 py-3 text-right font-mono tabular-nums text-slate-200">
                      {r.seasonality30DWinRate.toFixed(1)}%{" "}
                      <span
                        className={`ml-1 text-xs ${
                          r.seasonality30DAvgReturn >= 0
                            ? "text-[#10B981]"
                            : "text-[#F43F5E]"
                        }`}
                      >
                        ({formatSignedPct(r.seasonality30DAvgReturn)})
                      </span>
                    </td>

                    <td className="px-6 py-3 text-right text-xs">
                      <span
                        className={
                          r.smartMoneyTone === "bullish"
                            ? "text-[#10B981]"
                            : r.smartMoneyTone === "bearish"
                              ? "text-[#F43F5E]"
                              : "text-slate-400"
                        }
                      >
                        {r.smartMoneySignal}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {rows.length > 8 && (
          <div className="border-t border-white/[0.06] px-6 py-3">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="text-xs text-slate-400 hover:text-white"
            >
              {showMore
                ? "Show fewer"
                : `Show more (${rows.length - 8} more)`}
            </button>
          </div>
        )}
      </div>

      {/* 4. Collapsed "Macro & Market Headlines" Section */}
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E]">
        <button
          type="button"
          onClick={() => setMacroOpen((v) => !v)}
          className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-white/[0.02]"
        >
          <span className="text-sm font-medium text-white">
            Macro &amp; Market Headlines
          </span>
          {macroOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {macroOpen && macro && (
          <div className="space-y-8 border-t border-white/[0.06] p-6">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-3 text-xs text-slate-400">
                  US Treasury 10Y vs 2Y Trajectory (FRED · {macro.macroSource})
                </div>
                <EChartsBox option={yieldOption} height={220} />
              </div>

              <div className="divide-y divide-white/[0.06]">
                {macro.macroIndicators.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-2.5 text-xs"
                  >
                    <span className="text-slate-300">{m.label}</span>
                    <span className="font-mono font-medium tabular-nums text-white">
                      {typeof m.value === "number" ? m.value.toFixed(2) : "—"}
                      {m.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="divide-y divide-white/[0.06] border-t border-white/[0.06] pt-2">
              {macro.headlines.map((h) => (
                <a
                  key={h.id}
                  href={h.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 py-3 text-sm transition hover:text-white"
                >
                  <div>
                    <div className="text-slate-200">{h.title}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {h.source} · {h.relatedTickers.join(", ")}
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Granular Filters Slide-Over Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={applyCustomFilters}
            className="flex h-full w-full max-w-sm flex-col border-l border-white/[0.08] bg-[#0B0E14] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <h2 className="text-sm font-semibold text-white">
                Screener Filters
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex-1 space-y-5 text-xs">
              <div>
                <label className="mb-1.5 block text-slate-300">
                  Asset Class
                </label>
                <select
                  value={assetClass}
                  onChange={(e) => setAssetClass(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-[#11151E] px-3 py-2 text-white outline-none"
                >
                  <option value="all">All Asset Classes</option>
                  <option value="equity">Equities</option>
                  <option value="fx">Foreign Exchange</option>
                  <option value="crypto">Digital Assets</option>
                  <option value="commodity">Commodities</option>
                </select>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-slate-300">
                  <span>Min Fair Value Upside</span>
                  <span className="font-mono text-white">{minUpside}%</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={40}
                  value={minUpside}
                  onChange={(e) => setMinUpside(Number(e.target.value))}
                  className="w-full accent-[#3B82F6]"
                />
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-slate-300">
                  <span>Min Piotroski F-Score</span>
                  <span className="font-mono text-white">{minPiotroski}/9</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={9}
                  value={minPiotroski}
                  onChange={(e) => setMinPiotroski(Number(e.target.value))}
                  className="w-full accent-[#3B82F6]"
                />
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-slate-300">
                  <span>Min 30D Seasonality Win Rate</span>
                  <span className="font-mono text-white">{minWinRate}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  value={minWinRate}
                  onChange={(e) => setMinWinRate(Number(e.target.value))}
                  className="w-full accent-[#3B82F6]"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-[#11151E] p-3 text-slate-200">
                <input
                  type="checkbox"
                  checked={insiderBuyOnly}
                  onChange={(e) => setInsiderBuyOnly(e.target.checked)}
                  className="h-4 w-4 accent-[#3B82F6]"
                />
                Require recent Form 4 insider buys
              </label>
            </div>

            <div className="flex gap-3 border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={() => {
                  setMinUpside(-50);
                  setMinPiotroski(0);
                  setMinWinRate(0);
                  setAssetClass("all");
                  setInsiderBuyOnly(false);
                }}
                className="flex-1 rounded-lg border border-white/[0.08] py-2 text-xs text-slate-300 hover:text-white"
              >
                Reset
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#3B82F6] py-2 text-xs font-medium text-white hover:bg-[#2563EB]"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
