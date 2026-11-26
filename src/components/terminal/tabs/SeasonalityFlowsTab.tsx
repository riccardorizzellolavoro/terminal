"use client";

import React, { useMemo, useState } from "react";
import type * as echarts from "echarts";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { EChartsBox } from "@/components/terminal/EChartsBox";
import { TermHelp } from "@/components/ui/TermHelp";
import { formatCompactCurrency, formatSignedPct } from "@/lib/format";
import {
  SeasonalityCurves,
  SeasonalityWindowStats,
  SmartMoneyResponse,
} from "@/lib/types";

interface SeasonalityFlowsTabProps {
  symbol: string;
  seasonality: SeasonalityCurves;
  smartMoney: SmartMoneyResponse;
  cotOnly?: boolean;
}

const PRESET_WINDOWS = [
  { label: "Nov 26 – Dec 26", start: "11-26", end: "12-26" },
  { label: "Nov 15 – Dec 31", start: "11-15", end: "12-31" },
  { label: "Jan 02 – Feb 15", start: "01-02", end: "02-15" },
  { label: "Oct 15 – Dec 31", start: "10-15", end: "12-31" },
];

type FlowFilter = "all" | "insider" | "congress" | "cot";

interface UnifiedFlowRow {
  id: string;
  source: "Form 4" | "Congress" | "CFTC COT";
  helpKey: string;
  actor: string;
  action: string;
  tone: "positive" | "negative" | "neutral";
  size: string;
  dateImpact: string;
}

export function SeasonalityFlowsTab({
  symbol,
  seasonality,
  smartMoney,
  cotOnly = false,
}: SeasonalityFlowsTabProps) {
  const { t } = useLanguage();
  const [startMMDD, setStartMMDD] = useState(
    seasonality.defaultWindow.startMonthDay
  );
  const [endMMDD, setEndMMDD] = useState(seasonality.defaultWindow.endMonthDay);
  const [yearsSpan, setYearsSpan] = useState(30);
  const [windowStats, setWindowStats] = useState<SeasonalityWindowStats>(
    seasonality.defaultWindow
  );
  const [loadingWindow, setLoadingWindow] = useState(false);

  const [flowFilter, setFlowFilter] = useState<FlowFilter>(
    cotOnly ? "cot" : "all"
  );
  const [showAllFlows, setShowAllFlows] = useState(false);
  const [showCotChart, setShowCotChart] = useState(cotOnly);

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

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0B0E14",
        borderColor: "rgba(255,255,255,0.1)",
        textStyle: { color: "#E2E8F0", fontSize: 12 },
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: "#94A3B8", fontSize: 11 },
      },
      grid: { left: 48, right: 20, top: 34, bottom: 48 },
      xAxis: {
        type: "category",
        data: seasonality.days,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
        axisLabel: { color: "#94A3B8", fontSize: 11, interval: 22 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
        axisLabel: {
          color: "#94A3B8",
          fontSize: 11,
          formatter: (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`,
        },
      },
      dataZoom: [
        {
          type: "slider",
          height: 16,
          bottom: 6,
          borderColor: "rgba(255,255,255,0.08)",
          backgroundColor: "#0B0E14",
          fillerColor: "rgba(255, 255, 255, 0.08)",
          handleStyle: { color: "#94A3B8" },
          textStyle: { color: "#94A3B8", fontSize: 10 },
        },
      ],
      series: [
        {
          name: "30Y",
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2.2, color: "#10B981" },
          itemStyle: { color: "#10B981" },
          data: seasonality.curve30Y,
          markArea:
            endIdx >= startIdx
              ? {
                  itemStyle: { color: "rgba(255, 255, 255, 0.05)" },
                  data: [
                    [
                      { xAxis: seasonality.days[startIdx] },
                      { xAxis: seasonality.days[endIdx] },
                    ],
                  ],
                }
              : undefined,
        },
        {
          name: "20Y",
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 1.5, color: "#94A3B8" },
          itemStyle: { color: "#94A3B8" },
          data: seasonality.curve20Y,
        },
        {
          name: "10Y",
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 1.4, type: "dashed", color: "#64748B" },
          itemStyle: { color: "#64748B" },
          data: seasonality.curve10Y,
        },
      ],
    };
  }, [seasonality, startMMDD, endMMDD]);

  const cotOption = useMemo<echarts.EChartsOption>(() => {
    const dates = smartMoney.cotSeries.map((c) => c.date);
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0B0E14",
        borderColor: "rgba(255,255,255,0.1)",
        textStyle: { color: "#E2E8F0", fontSize: 12 },
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: "#94A3B8", fontSize: 11 },
      },
      grid: { left: 52, right: 16, top: 34, bottom: 26 },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
        axisLabel: { color: "#94A3B8", fontSize: 10, interval: 8 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
        axisLabel: {
          color: "#94A3B8",
          fontSize: 11,
          formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        },
      },
      series: [
        {
          name: t.seasonality.largeSpeculators,
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: "#10B981" },
          data: smartMoney.cotSeries.map((c) => c.largeSpecNet),
        },
        {
          name: t.seasonality.commercialHedgers,
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 1.8, color: "#94A3B8" },
          data: smartMoney.cotSeries.map((c) => c.commercialNet),
        },
        {
          name: t.seasonality.smallTraders,
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 1.2, type: "dashed", color: "#64748B" },
          data: smartMoney.cotSeries.map((c) => c.smallTraderNet),
        },
      ],
    };
  }, [smartMoney, t]);

  const unifiedFlows = useMemo<UnifiedFlowRow[]>(() => {
    const rows: UnifiedFlowRow[] = [];

    if (!cotOnly && (flowFilter === "all" || flowFilter === "insider")) {
      for (const tr of smartMoney.insiderTrades) {
        rows.push({
          id: tr.id,
          source: "Form 4",
          helpKey: "secForm4",
          actor: `${tr.insiderName} · ${tr.role}`,
          action: tr.transactionType,
          tone: tr.transactionType === "Buy" ? "positive" : "negative",
          size: formatCompactCurrency(tr.valueUsd),
          dateImpact: `${tr.date} (${formatSignedPct(tr.postTradeReturnPct)})`,
        });
      }
    }

    if (!cotOnly && (flowFilter === "all" || flowFilter === "congress")) {
      for (const c of smartMoney.congressTrades) {
        rows.push({
          id: c.id,
          source: "Congress",
          helpKey: "insiderCluster",
          actor: `${c.politician} (${c.party})`,
          action: c.transactionType,
          tone: c.transactionType === "Purchase" ? "positive" : "negative",
          size: c.amountRange,
          dateImpact: `${c.date} (${formatSignedPct(c.postTradeReturnPct)})`,
        });
      }
    }

    if (flowFilter === "all" || flowFilter === "cot") {
      const latest = smartMoney.cotSeries[smartMoney.cotSeries.length - 1];
      if (latest) {
        rows.push({
          id: "cot-spec",
          source: "CFTC COT",
          helpKey: "largeSpeculators",
          actor: `${smartMoney.cotAssetName} · ${t.seasonality.largeSpeculators}`,
          action: latest.largeSpecNet >= 0 ? "Net Long" : "Net Short",
          tone: latest.largeSpecNet >= 0 ? "positive" : "negative",
          size: `${latest.largeSpecNet.toLocaleString()} cts`,
          dateImpact: `${latest.date} (${latest.largeSpecPercentile}th pct)`,
        });
        rows.push({
          id: "cot-comm",
          source: "CFTC COT",
          helpKey: "commercialHedgers",
          actor: `${smartMoney.cotAssetName} · ${t.seasonality.commercialHedgers}`,
          action: latest.commercialNet >= 0 ? "Net Long" : "Net Short",
          tone: "neutral",
          size: `${latest.commercialNet.toLocaleString()} cts`,
          dateImpact: `${latest.date} (${latest.commercialPercentile}th pct)`,
        });
        rows.push({
          id: "cot-small",
          source: "CFTC COT",
          helpKey: "smallTraders",
          actor: `${smartMoney.cotAssetName} · ${t.seasonality.smallTraders}`,
          action: latest.smallTraderNet >= 0 ? "Net Long" : "Net Short",
          tone: "neutral",
          size: `${latest.smallTraderNet.toLocaleString()} cts`,
          dateImpact: `${latest.date}`,
        });
      }
    }

    return rows;
  }, [smartMoney, flowFilter, cotOnly, t]);

  const visibleFlows = showAllFlows ? unifiedFlows : unifiedFlows.slice(0, 7);

  return (
    <div className="space-y-8">
      {/* 1. Interactive 10/20/30-Year Detrended Seasonality Chart */}
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
        <div className="mb-3 flex items-center text-sm font-medium text-white">
          <span>{t.tabs.seasonality}</span>
          <TermHelp termKey="detrendedSeasonality" />
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_WINDOWS.map((p) => {
              const active = startMMDD === p.start && endMMDD === p.end;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyWindow(p.start, p.end)}
                  className={`rounded-md px-3 py-1.5 font-mono text-xs transition ${
                    active
                      ? "bg-white/[0.12] text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <input
              type="text"
              aria-label="Seasonality start MM-DD"
              value={startMMDD}
              onChange={(e) => setStartMMDD(e.target.value)}
              className="w-16 rounded border border-white/[0.08] bg-[#0B0E14] px-2 py-1 font-mono text-white outline-none"
            />
            <span className="text-slate-500">→</span>
            <input
              type="text"
              aria-label="Seasonality end MM-DD"
              value={endMMDD}
              onChange={(e) => setEndMMDD(e.target.value)}
              className="w-16 rounded border border-white/[0.08] bg-[#0B0E14] px-2 py-1 font-mono text-white outline-none"
            />
            <button
              type="button"
              onClick={() => applyWindow(startMMDD, endMMDD, yearsSpan)}
              disabled={loadingWindow}
              className="rounded-md bg-[#3B82F6] px-3 py-1 font-medium text-white transition hover:bg-[#2563EB] disabled:opacity-60"
            >
              {loadingWindow ? "..." : t.seasonality.analyze}
            </button>
          </div>
        </div>

        <EChartsBox option={chartOption} height={320} />

        <div className="mt-6 grid divide-y divide-white/[0.06] border-t border-white/[0.06] pt-5 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div className="pb-3 sm:pb-0 sm:pr-4">
            <div className="flex items-center text-xs text-slate-400">
              <span>{t.seasonality.winRate}</span>
              <TermHelp termKey="winRate" />
            </div>
            <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#10B981]">
              {windowStats.winRate.toFixed(1)}%
            </div>
          </div>
          <div className="py-3 sm:px-4 sm:py-0">
            <div className="text-xs text-slate-400">
              {t.seasonality.avgReturn}
            </div>
            <div
              className={`mt-1 font-mono text-xl font-semibold tabular-nums ${
                windowStats.avgReturn >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
              }`}
            >
              {formatSignedPct(windowStats.avgReturn)}
            </div>
          </div>
          <div className="py-3 sm:px-4 sm:py-0">
            <div className="flex items-center text-xs text-slate-400">
              <span>{t.seasonality.maxDrawdown}</span>
              <TermHelp termKey="maxDrawdown" />
            </div>
            <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#F43F5E]">
              {windowStats.maxDrawdown.toFixed(2)}%
            </div>
          </div>
          <div className="pt-3 sm:pl-4 sm:pt-0">
            <div className="text-xs text-slate-400">
              {t.seasonality.yearsAnalyzed}
            </div>
            <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-white">
              {windowStats.yearsAnalyzed} {t.seasonality.yrs}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Unified Smart Money / COT Table */}
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center text-sm font-medium text-white">
              <span>
                {t.seasonality.smartMoneyActivity} · {smartMoney.signalLabel}
              </span>
              <TermHelp termKey="cftcCot" />
              <TermHelp termKey="insiderCluster" />
            </h3>
            {smartMoney.cotExtremeAlert && (
              <p className="mt-0.5 flex items-center text-xs text-slate-400">
                <span>{smartMoney.cotExtremeAlert}</span>
                <TermHelp termKey="extremePercentile" />
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {!cotOnly &&
              (
                [
                  { id: "all", label: t.seasonality.all },
                  { id: "insider", label: t.seasonality.insiders },
                  { id: "congress", label: t.seasonality.congress },
                  { id: "cot", label: t.seasonality.cot },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFlowFilter(f.id)}
                  className={`rounded-md px-3 py-1 transition ${
                    flowFilter === f.id
                      ? "bg-white/[0.12] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}

            <button
              type="button"
              onClick={() => setShowCotChart((v) => !v)}
              className="ml-2 rounded-md border border-white/[0.08] px-3 py-1 text-slate-300 hover:text-white"
            >
              {showCotChart
                ? t.seasonality.hideCotCurve
                : t.seasonality.cotCurve}
            </button>
          </div>
        </div>

        {showCotChart && (
          <div className="mb-6 border-b border-white/[0.06] pb-6">
            <EChartsBox option={cotOption} height={240} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-slate-400">
                <th className="py-3 pr-4 font-medium">
                  {t.seasonality.colSource}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t.seasonality.colActor}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t.seasonality.colAction}
                </th>
                <th className="px-4 py-3 text-right font-mono font-medium">
                  {t.seasonality.colSize}
                </th>
                <th className="py-3 pl-4 text-right font-mono font-medium">
                  {t.seasonality.colDateImpact}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {visibleFlows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-slate-500"
                  >
                    {t.seasonality.noFlows}
                  </td>
                </tr>
              ) : (
                visibleFlows.map((row) => (
                  <tr key={row.id} className="h-12 hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 font-mono text-xs text-slate-400">
                      {row.source}
                      <TermHelp termKey={row.helpKey} />
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-200">
                      {row.actor}
                    </td>
                    <td
                      className={`px-4 py-3 font-mono text-xs font-medium ${
                        row.tone === "positive"
                          ? "text-[#10B981]"
                          : row.tone === "negative"
                            ? "text-[#F43F5E]"
                            : "text-slate-300"
                      }`}
                    >
                      {row.action}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-white">
                      {row.size}
                    </td>
                    <td className="py-3 pl-4 text-right font-mono text-xs tabular-nums text-slate-400">
                      {row.dateImpact}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {unifiedFlows.length > 7 && (
          <button
            type="button"
            onClick={() => setShowAllFlows((v) => !v)}
            className="mt-4 text-xs text-slate-400 hover:text-white"
          >
            {showAllFlows
              ? t.screener.showFewer
              : `${t.screener.showMore} (${unifiedFlows.length - 7})`}
          </button>
        )}
      </div>
    </div>
  );
}
