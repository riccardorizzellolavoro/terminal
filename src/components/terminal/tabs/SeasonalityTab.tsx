"use client";

import React, { useMemo, useState } from "react";
import type * as echarts from "echarts";
import { EChartsBox } from "@/components/terminal/EChartsBox";
import { formatPrice, formatSignedPct } from "@/lib/format";
import { SeasonalityCurves, SeasonalityWindowStats } from "@/lib/types";

interface SeasonalityTabProps {
  symbol: string;
  seasonality: SeasonalityCurves;
}

const PRESET_WINDOWS = [
  { label: "Nov 26 – Dec 26", start: "11-26", end: "12-26" },
  { label: "Nov 15 – Dec 31", start: "11-15", end: "12-31" },
  { label: "Jan 02 – Feb 15", start: "01-02", end: "02-15" },
  { label: "Oct 15 – Dec 31", start: "10-15", end: "12-31" },
];

export function SeasonalityTab({ symbol, seasonality }: SeasonalityTabProps) {
  const [show10Y, setShow10Y] = useState(true);
  const [show20Y, setShow20Y] = useState(true);
  const [show30Y, setShow30Y] = useState(true);
  const [startMMDD, setStartMMDD] = useState(seasonality.defaultWindow.startMonthDay);
  const [endMMDD, setEndMMDD] = useState(seasonality.defaultWindow.endMonthDay);
  const [yearsSpan, setYearsSpan] = useState<number>(30);
  const [windowStats, setWindowStats] = useState<SeasonalityWindowStats>(
    seasonality.defaultWindow
  );
  const [loadingWindow, setLoadingWindow] = useState(false);

  const applyWindow = async (
    newStart: string,
    newEnd: string,
    years: number = yearsSpan
  ) => {
    setStartMMDD(newStart);
    setEndMMDD(newEnd);
    setYearsSpan(years);
    setLoadingWindow(true);
    try {
      const res = await fetch(
        `/api/ticker/${encodeURIComponent(symbol)}?section=seasonality-window&start=${encodeURIComponent(newStart)}&end=${encodeURIComponent(newEnd)}&years=${years}`
      );
      if (res.ok) {
        const stats = (await res.json()) as SeasonalityWindowStats;
        setWindowStats(stats);
      }
    } finally {
      setLoadingWindow(false);
    }
  };

  const chartOption = useMemo<echarts.EChartsOption>(() => {
    const startIdx = Math.max(
      0,
      seasonality.days.findIndex((d) => d >= startMMDD)
    );
    const endIdxRaw = seasonality.days.findIndex((d) => d >= endMMDD);
    const endIdx = endIdxRaw >= 0 ? endIdxRaw : seasonality.days.length - 1;

    const series: echarts.SeriesOption[] = [];
    if (show30Y) {
      series.push({
        name: "30Y Detrended",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5, color: "#10B981" },
        itemStyle: { color: "#10B981" },
        data: seasonality.curve30Y,
        markArea:
          endIdx >= startIdx
            ? {
                itemStyle: { color: "rgba(59, 130, 246, 0.12)" },
                data: [
                  [
                    { xAxis: seasonality.days[startIdx] },
                    { xAxis: seasonality.days[endIdx] },
                  ],
                ],
              }
            : undefined,
      });
    }
    if (show20Y) {
      series.push({
        name: "20Y Detrended",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.8, color: "#3B82F6" },
        itemStyle: { color: "#3B82F6" },
        data: seasonality.curve20Y,
      });
    }
    if (show10Y) {
      series.push({
        name: "10Y Detrended",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.5, type: "dashed", color: "#FF9900" },
        itemStyle: { color: "#FF9900" },
        data: seasonality.curve10Y,
      });
    }

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0B0E14",
        borderColor: "rgba(255,255,255,0.12)",
        textStyle: { color: "#E2E8F0", fontSize: 12 },
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: "#94A3B8", fontSize: 11 },
      },
      grid: { left: 48, right: 20, top: 36, bottom: 52 },
      xAxis: {
        type: "category",
        data: seasonality.days,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
        axisLabel: { color: "#94A3B8", fontSize: 11, interval: 20 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
        axisLabel: {
          color: "#94A3B8",
          fontSize: 11,
          formatter: (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`,
        },
      },
      dataZoom: [
        {
          type: "slider",
          height: 18,
          bottom: 8,
          borderColor: "rgba(255,255,255,0.08)",
          backgroundColor: "#0B0E14",
          fillerColor: "rgba(59, 130, 246, 0.18)",
          handleStyle: { color: "#3B82F6" },
          textStyle: { color: "#94A3B8", fontSize: 10 },
        },
      ],
      series,
    };
  }, [seasonality, show10Y, show20Y, show30Y, startMMDD, endMMDD]);

  return (
    <div className="space-y-6">
      {/* Controls & Curve */}
      <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_WINDOWS.map((p) => {
              const active = startMMDD === p.start && endMMDD === p.end;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyWindow(p.start, p.end)}
                  className={`rounded-md px-3 py-1.5 font-mono text-xs transition ${
                    active
                      ? "bg-[#3B82F6] text-white"
                      : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex cursor-pointer items-center gap-1.5 text-slate-300">
              <input
                type="checkbox"
                checked={show30Y}
                onChange={(e) => setShow30Y(e.target.checked)}
                className="accent-[#10B981]"
              />
              30Y
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-slate-300">
              <input
                type="checkbox"
                checked={show20Y}
                onChange={(e) => setShow20Y(e.target.checked)}
                className="accent-[#3B82F6]"
              />
              20Y
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-slate-300">
              <input
                type="checkbox"
                checked={show10Y}
                onChange={(e) => setShow10Y(e.target.checked)}
                className="accent-[#FF9900]"
              />
              10Y
            </label>
          </div>
        </div>

        {/* Custom Calendar Window Selector */}
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg bg-[#0B0E14] px-4 py-2.5 text-xs">
          <span className="text-slate-400">Window (MM-DD):</span>
          <input
            type="text"
            aria-label="Seasonality start MM-DD"
            value={startMMDD}
            onChange={(e) => setStartMMDD(e.target.value)}
            className="w-20 rounded border border-white/[0.1] bg-[#12161F] px-2 py-1 font-mono text-white outline-none focus:border-[#3B82F6]"
          />
          <span className="text-slate-500">to</span>
          <input
            type="text"
            aria-label="Seasonality end MM-DD"
            value={endMMDD}
            onChange={(e) => setEndMMDD(e.target.value)}
            className="w-20 rounded border border-white/[0.1] bg-[#12161F] px-2 py-1 font-mono text-white outline-none focus:border-[#3B82F6]"
          />
          <select
            aria-label="Years lookback"
            value={yearsSpan}
            onChange={(e) => applyWindow(startMMDD, endMMDD, Number(e.target.value))}
            className="rounded border border-white/[0.1] bg-[#12161F] px-2 py-1 font-mono text-white outline-none"
          >
            <option value={10}>10 Years</option>
            <option value={20}>20 Years</option>
            <option value={30}>30 Years</option>
          </select>
          <button
            type="button"
            onClick={() => applyWindow(startMMDD, endMMDD, yearsSpan)}
            disabled={loadingWindow}
            className="rounded bg-[#3B82F6] px-3 py-1 font-medium text-white transition hover:bg-[#2563EB] disabled:opacity-60"
          >
            {loadingWindow ? "Calculating..." : "Analyze Window"}
          </button>
        </div>

        <EChartsBox option={chartOption} height={350} />
      </div>

      {/* Window Stats Summary (4 clean metrics) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Historical Win Rate
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#10B981]">
            {windowStats.winRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-sm text-slate-400">
            {windowStats.yearsAnalyzed} years analyzed
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Average Window Return
          </div>
          <div
            className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${
              windowStats.avgReturn >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
            }`}
          >
            {formatSignedPct(windowStats.avgReturn)}
          </div>
          <div className="mt-1 text-sm text-slate-400">
            Median {formatSignedPct(windowStats.medianReturn)}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Avg Max Drawdown
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[#F43F5E]">
            {windowStats.maxDrawdown.toFixed(2)}%
          </div>
          <div className="mt-1 text-sm text-slate-400">
            Worst {formatSignedPct(windowStats.worstReturn)}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Annualized Pace
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
            {formatSignedPct(windowStats.annualizedReturn)}
          </div>
          <div className="mt-1 text-sm text-slate-400">
            Best {formatSignedPct(windowStats.bestReturn)}
          </div>
        </div>
      </div>

      {/* Year-by-Year Breakdown Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
        <h3 className="mb-4 text-sm font-medium text-white">
          Year-by-Year Seasonal Breakdown ({windowStats.startMonthDay} →{" "}
          {windowStats.endMonthDay})
        </h3>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#12161F] text-xs text-slate-400">
              <tr className="border-b border-white/[0.08]">
                <th className="py-2.5 pr-4">Year</th>
                <th className="px-3 py-2.5">Start Date</th>
                <th className="px-3 py-2.5">End Date</th>
                <th className="px-3 py-2.5 text-right font-mono">Start</th>
                <th className="px-3 py-2.5 text-right font-mono">End</th>
                <th className="px-3 py-2.5 text-right font-mono">Return</th>
                <th className="pl-3 py-2.5 text-right font-mono">Max DD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {windowStats.yearlyBreakdown.map((row) => (
                <tr key={row.year} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 pr-4 font-mono text-slate-200">
                    {row.year}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-400">
                    {row.startDate}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-400">
                    {row.endDate}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-300">
                    {formatPrice(row.startPrice, symbol)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-300">
                    {formatPrice(row.endPrice, symbol)}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right font-mono tabular-nums ${
                      row.returnPct >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
                    }`}
                  >
                    {formatSignedPct(row.returnPct)}
                  </td>
                  <td className="pl-3 py-2.5 text-right font-mono tabular-nums text-[#F43F5E]">
                    {row.maxDrawdownPct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
