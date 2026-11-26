"use client";

import React, { useMemo } from "react";
import type * as echarts from "echarts";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { EChartsBox } from "@/components/terminal/EChartsBox";
import { TermHelp } from "@/components/ui/TermHelp";
import {
  MacroIndicator,
  OhlcvBar,
  SovereignRatesSnapshot,
  TickerProfile,
} from "@/lib/types";
import { ChartTab } from "./ChartTab";

interface YieldCurveOverviewProps {
  profile: TickerProfile;
  bars: OhlcvBar[];
  sovereignRates: SovereignRatesSnapshot;
}

export function YieldCurveOverview({
  profile,
  bars,
  sovereignRates,
}: YieldCurveOverviewProps) {
  const { lang, t } = useLanguage();

  const curveOption = useMemo<echarts.EChartsOption>(() => {
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0B0E14",
        borderColor: "rgba(255,255,255,0.1)",
        textStyle: { color: "#E2E8F0", fontSize: 12 },
      },
      grid: { left: 48, right: 20, top: 24, bottom: 28 },
      xAxis: {
        type: "category",
        data: sovereignRates.usCurve.map((c) => c.tenor),
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
          name: "US Treasury",
          type: "line",
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 2.5, color: "#10B981" },
          itemStyle: { color: "#10B981" },
          data: sovereignRates.usCurve.map((c) => c.yieldPct),
        },
      ],
    };
  }, [sovereignRates]);

  return (
    <div className="space-y-8">
      <ChartTab symbol={profile.symbol} initialBars={bars} isRate />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
          <div className="mb-4 flex items-center text-sm font-medium text-white">
            <span>{t.bonds.usCurveTitle}</span>
            <TermHelp termKey="yieldCurve" />
          </div>
          <EChartsBox option={curveOption} height={240} />
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
          <div className="mb-4 text-sm font-medium text-white">
            {t.bonds.euRatesTitle}
          </div>
          <div className="divide-y divide-white/[0.06]">
            {sovereignRates.euBenchmarks.map((b) => (
              <div
                key={b.id}
                className="flex h-12 items-center justify-between text-sm"
              >
                <span className="text-slate-300">
                  {b.label}
                  {b.id === "BTPBUND" && <TermHelp termKey="btpBundSpread" />}
                  {b.id === "ECBRATE" && <TermHelp termKey="ecbRate" />}
                </span>
                <div className="font-mono tabular-nums">
                  <span className="font-semibold text-white">
                    {b.unit === "bps" ? b.value.toFixed(0) : b.value.toFixed(2)}
                    {b.unit === "bps" ? " bps" : "%"}
                  </span>
                  <span
                    className={`ml-2 text-xs ${
                      b.change >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
                    }`}
                  >
                    {b.change > 0 ? `+${b.change}` : b.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
        <div className="text-xs text-slate-400">
          {t.overview.summary} · {profile.sector}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {lang === "it" && profile.descriptionIt
            ? profile.descriptionIt
            : profile.description}
        </p>
      </div>
    </div>
  );
}

export function HistoricalSpreadsView({
  sovereignRates,
}: {
  sovereignRates: SovereignRatesSnapshot;
}) {
  const { t } = useLanguage();

  const spreadOption = useMemo<echarts.EChartsOption>(() => {
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
      grid: { left: 52, right: 20, top: 36, bottom: 28 },
      xAxis: {
        type: "category",
        data: sovereignRates.spreadsHistory.map((s) => s.date),
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
        axisLabel: { color: "#94A3B8", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
        axisLabel: {
          color: "#94A3B8",
          fontSize: 11,
          formatter: (v: number) => `${v} bps`,
        },
      },
      series: [
        {
          name: t.bonds.us2s10s,
          type: "line",
          smooth: true,
          lineStyle: { width: 2.2, color: "#10B981" },
          data: sovereignRates.spreadsHistory.map((s) => s.us2s10sBps),
        },
        {
          name: t.bonds.btpBund,
          type: "line",
          smooth: true,
          lineStyle: { width: 2, color: "#94A3B8" },
          data: sovereignRates.spreadsHistory.map((s) => s.btpBundBps),
        },
      ],
    };
  }, [sovereignRates, t]);

  const latest =
    sovereignRates.spreadsHistory[sovereignRates.spreadsHistory.length - 1];

  return (
    <div className="space-y-8">
      <div className="grid divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-[#11151E] md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="p-6">
          <div className="text-xs text-slate-400">
            {t.bonds.us2s10s}
            <TermHelp termKey="spread2y10y" />
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
            {latest ? `${latest.us2s10sBps > 0 ? "+" : ""}${latest.us2s10sBps}` : "+23"}{" "}
            bps
            <TermHelp termKey="bps" />
          </div>
        </div>
        <div className="p-6">
          <div className="text-xs text-slate-400">
            {t.bonds.btpBund}
            <TermHelp termKey="btpBundSpread" />
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
            {latest ? latest.btpBundBps : 130} bps
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
        <div className="mb-4 text-sm font-medium text-white">
          {t.bonds.spreadsTitle}
        </div>
        <EChartsBox option={spreadOption} height={320} />
      </div>
    </div>
  );
}

export function MacroDriversView({
  macroIndicators,
  sovereignRates,
}: {
  macroIndicators: MacroIndicator[];
  sovereignRates: SovereignRatesSnapshot;
}) {
  const { t } = useLanguage();

  const helpKeyForId = (id: string) => {
    if (id === "CPIAUCSL") return "cpi";
    if (id === "FEDFUNDS") return "fedFunds";
    if (id === "DGS10" || id === "DGS2" || id === "DGS5" || id === "DGS30")
      return "yieldCurve";
    return undefined;
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
        <div className="mb-4 text-sm font-medium text-white">
          {t.bonds.macroDriversTitle}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-slate-400">
                <th className="py-3 pr-4 font-medium">Indicator</th>
                <th className="px-4 py-3 font-mono font-medium">Series</th>
                <th className="px-4 py-3 text-right font-mono font-medium">
                  Value
                </th>
                <th className="px-4 py-3 text-right font-mono font-medium">
                  Change
                </th>
                <th className="py-3 pl-4 text-right font-mono font-medium">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {macroIndicators.map((m) => {
                const hk = helpKeyForId(m.id);
                return (
                  <tr key={m.id} className="h-12">
                    <td className="py-3 pr-4 text-slate-200">
                      {m.label}
                      {hk && <TermHelp termKey={hk} />}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {m.id}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-white">
                      {m.value.toFixed(2)}
                      {m.unit}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono text-xs tabular-nums ${
                        m.change >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
                      }`}
                    >
                      {m.change > 0 ? `+${m.change.toFixed(2)}` : m.change.toFixed(2)}
                    </td>
                    <td className="py-3 pl-4 text-right font-mono text-xs text-slate-400">
                      {m.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
        <div className="mb-4 text-sm font-medium text-white">
          {t.bonds.euRatesTitle}
        </div>
        <div className="grid divide-y divide-white/[0.06] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {sovereignRates.euBenchmarks.slice(0, 2).map((b) => (
            <div key={b.id} className="p-4">
              <div className="text-xs text-slate-400">{b.label}</div>
              <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-white">
                {b.value.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
