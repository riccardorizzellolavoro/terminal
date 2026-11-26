"use client";

import React, { useMemo, useState } from "react";
import type * as echarts from "echarts";
import { ChevronDown, ChevronUp } from "lucide-react";
import { EChartsBox } from "@/components/terminal/EChartsBox";
import { formatCurrency, formatSignedPct } from "@/lib/format";
import { ValuationBundle } from "@/lib/types";

interface ValuationTabProps {
  valuation: ValuationBundle | null;
  enabledModelIds: string[];
  onToggleModel: (id: string) => void;
}

export function ValuationTab({
  valuation,
  enabledModelIds,
  onToggleModel,
}: ValuationTabProps) {
  const [piotroskiOpen, setPiotroskiOpen] = useState(false);

  const activeStats = useMemo(() => {
    if (!valuation) return null;
    const selected = valuation.models.filter((m) =>
      enabledModelIds.includes(m.id)
    );
    const list = selected.length > 0 ? selected : valuation.models.slice(0, 1);
    const fairValue =
      list.reduce((acc, m) => acc + m.fairValue, 0) / list.length;
    const upside =
      ((fairValue - valuation.currentPrice) / valuation.currentPrice) * 100;
    return {
      fairValue: Number(fairValue.toFixed(2)),
      upside: Number(upside.toFixed(1)),
      count: list.length,
    };
  }, [valuation, enabledModelIds]);

  const gaugeOption = useMemo<echarts.EChartsOption>(() => {
    if (!valuation || !activeStats) return {};
    const clampedUpside = Math.max(-50, Math.min(50, activeStats.upside));
    return {
      backgroundColor: "transparent",
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          min: -50,
          max: 50,
          splitNumber: 2,
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [0.35, "#F43F5E"],
                [0.65, "#64748B"],
                [1, "#10B981"],
              ],
            },
          },
          pointer: {
            itemStyle: { color: "#F8FAFC" },
            length: "58%",
            width: 4,
          },
          axisTick: { show: false },
          splitLine: { length: 10, lineStyle: { color: "rgba(255,255,255,0.2)" } },
          axisLabel: {
            distance: 14,
            color: "#94A3B8",
            fontSize: 10,
            formatter: (v: number) => `${v > 0 ? "+" : ""}${v}%`,
          },
          detail: {
            valueAnimation: true,
            fontSize: 20,
            fontFamily: "JetBrains Mono, monospace",
            color: activeStats.upside >= 0 ? "#10B981" : "#F43F5E",
            offsetCenter: [0, "20%"],
            formatter: () =>
              `${activeStats.upside > 0 ? "+" : ""}${activeStats.upside.toFixed(1)}%`,
          },
          data: [{ value: clampedUpside, name: "Fair Value Margin" }],
          title: {
            offsetCenter: [0, "58%"],
            color: "#94A3B8",
            fontSize: 11,
          },
        },
      ],
    };
  }, [valuation, activeStats]);

  if (!valuation || !activeStats) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6 text-sm text-slate-400">
        Fundamental DCF/EVA/Piotroski valuation applies to equity issuers. Switch
        to Seasonality, Chart, or Smart Money for FX, Crypto, and Commodities.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Composite Gauge + Quality Triad */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Composite Fair Value ({activeStats.count} models)
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-semibold tabular-nums text-white">
              {formatCurrency(activeStats.fairValue)}
            </span>
            <span
              className={`font-mono text-sm tabular-nums ${
                activeStats.upside >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
              }`}
            >
              {formatSignedPct(activeStats.upside)} vs{" "}
              {formatCurrency(valuation.currentPrice)}
            </span>
          </div>
          <div className="mt-2">
            <EChartsBox option={gaugeOption} height={190} />
          </div>
        </div>

        {/* Quality Scores Card */}
        <div className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#12161F] p-6 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Piotroski F-Score
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
                {valuation.quality.piotroskiFScore} / 9
              </div>
              <div className="mt-1 text-sm text-[#10B981]">
                {valuation.quality.piotroskiFScore >= 7
                  ? "Institutional Quality"
                  : valuation.quality.piotroskiFScore >= 4
                    ? "Moderate Financial Strength"
                    : "Weak Fundamentals"}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Altman Z-Score
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
                {valuation.quality.altmanZScore.toFixed(2)}
              </div>
              <div
                className={`mt-1 text-sm ${
                  valuation.quality.altmanZone === "Safe"
                    ? "text-[#10B981]"
                    : valuation.quality.altmanZone === "Grey"
                      ? "text-[#FF9900]"
                      : "text-[#F43F5E]"
                }`}
              >
                {valuation.quality.altmanZone} Zone (≥ 2.99)
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Beneish M-Score
              </div>
              <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
                {valuation.quality.beneishMScore.toFixed(2)}
              </div>
              <div
                className={`mt-1 text-sm ${
                  valuation.quality.beneishFlag === "Clean"
                    ? "text-[#10B981]"
                    : "text-[#F43F5E]"
                }`}
              >
                {valuation.quality.beneishFlag === "Clean"
                  ? "Low Manipulation Risk"
                  : "Earnings Quality Alert"}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/[0.08] pt-4">
            <button
              type="button"
              onClick={() => setPiotroskiOpen((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-medium text-slate-300 hover:text-white"
            >
              <span>Inspect 9-Point Piotroski F-Score Checklist</span>
              {piotroskiOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {piotroskiOpen && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {valuation.quality.piotroskiBreakdown.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg bg-[#0B0E14] px-3 py-2 text-xs"
                  >
                    <span className="text-slate-300">{item.label}</span>
                    <span
                      className={`font-mono ${
                        item.passed ? "text-[#10B981]" : "text-[#F43F5E]"
                      }`}
                    >
                      {item.passed ? "PASS" : "FAIL"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Model Checkboxes */}
      <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">
            Deterministic Valuation Models (toggle checkboxes to recalculate)
          </h3>
          <span className="font-mono text-xs text-slate-400">
            WACC {(valuation.wacc * 100).toFixed(2)}% · ROIC{" "}
            {(valuation.roic * 100).toFixed(1)}%
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {valuation.models.map((m) => {
            const checked = enabledModelIds.includes(m.id);
            return (
              <label
                key={m.id}
                className="flex cursor-pointer flex-wrap items-center justify-between gap-4 py-4 transition hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleModel(m.id)}
                    className="mt-1 h-4 w-4 accent-[#3B82F6]"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">
                      {m.name}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {m.formulaSummary}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-base font-semibold tabular-nums text-white">
                    {formatCurrency(m.fairValue)}
                  </div>
                  <div
                    className={`font-mono text-xs tabular-nums ${
                      m.upsidePercent >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
                    }`}
                  >
                    {formatSignedPct(m.upsidePercent)}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
