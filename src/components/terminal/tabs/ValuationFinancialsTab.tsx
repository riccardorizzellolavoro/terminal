"use client";

import React, { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  formatCompactCurrency,
  formatCurrency,
  formatSignedPct,
} from "@/lib/format";
import { FinancialPeriodRow, ValuationBundle } from "@/lib/types";

interface ValuationFinancialsTabProps {
  valuation: ValuationBundle | null;
  enabledModelIds: string[];
  onToggleModel: (id: string) => void;
  annual: FinancialPeriodRow[];
  quarterly: FinancialPeriodRow[];
  source: "live" | "cache" | "seed";
}

interface LineItemDef {
  key: keyof FinancialPeriodRow;
  label: string;
  isCore: boolean;
  isEps?: boolean;
  yoyKey?: keyof FinancialPeriodRow;
}

const LINE_ITEMS: LineItemDef[] = [
  { key: "revenue", label: "Revenue", isCore: true, yoyKey: "yoyRevenueGrowth" },
  { key: "grossProfit", label: "Gross Profit", isCore: true },
  { key: "operatingIncome", label: "Operating Income", isCore: true },
  { key: "netIncome", label: "Net Income", isCore: true, yoyKey: "yoyNetIncomeGrowth" },
  { key: "operatingCashFlow", label: "Operating Cash Flow", isCore: true },
  { key: "capex", label: "CapEx", isCore: true },
  { key: "freeCashFlow", label: "Free Cash Flow", isCore: true, yoyKey: "yoyFcfGrowth" },
  { key: "costOfRevenue", label: "Cost of Revenue", isCore: false },
  { key: "operatingExpenses", label: "Operating Expenses", isCore: false },
  { key: "eps", label: "Diluted EPS", isCore: false, isEps: true },
  { key: "cashAndEquivalents", label: "Cash & Equivalents", isCore: false },
  { key: "totalAssets", label: "Total Assets", isCore: false },
  { key: "longTermDebt", label: "Long-Term Debt", isCore: false },
  { key: "shareholdersEquity", label: "Shareholders' Equity", isCore: false },
];

export function ValuationFinancialsTab({
  valuation,
  enabledModelIds,
  onToggleModel,
  annual,
  quarterly,
  source,
}: ValuationFinancialsTabProps) {
  const [modelsDrawerOpen, setModelsDrawerOpen] = useState(false);
  const [periodMode, setPeriodMode] = useState<"annual" | "quarterly">("annual");
  const [showAllXbrl, setShowAllXbrl] = useState(false);

  const composite = useMemo(() => {
    if (!valuation) return null;
    const active = valuation.models.filter((m) =>
      enabledModelIds.includes(m.id)
    );
    const list = active.length > 0 ? active : valuation.models.slice(0, 1);
    const fairValue = list.reduce((a, m) => a + m.fairValue, 0) / list.length;
    const upside =
      ((fairValue - valuation.currentPrice) / valuation.currentPrice) * 100;
    return {
      fairValue: Number(fairValue.toFixed(2)),
      upside: Number(upside.toFixed(1)),
      count: list.length,
    };
  }, [valuation, enabledModelIds]);

  // Strictly cap to 5 columns total: Line Item + 3 recent periods + YoY %
  const periods = (periodMode === "annual" ? annual : quarterly).slice(-3);
  const visibleRows = showAllXbrl
    ? LINE_ITEMS
    : LINE_ITEMS.filter((r) => r.isCore);

  return (
    <div className="space-y-8">
      {/* Composite Fair Value Header + Quality Scores (Zero nested card borders) */}
      {valuation && composite ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
            <div>
              <div className="text-xs text-slate-400">
                Composite Fair Value ({composite.count} models active)
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-mono text-3xl font-semibold tabular-nums text-white">
                  {formatCurrency(composite.fairValue)}
                </span>
                <span
                  className={`font-mono text-sm font-medium tabular-nums ${
                    composite.upside >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
                  }`}
                >
                  {formatSignedPct(composite.upside)} vs{" "}
                  {formatCurrency(valuation.currentPrice)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModelsDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#2563EB]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Customize Models
            </button>
          </div>

          <div className="grid divide-y divide-white/[0.06] pt-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="pb-4 sm:pb-0 sm:pr-6">
              <div className="text-xs text-slate-400">Piotroski F-Score</div>
              <div className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white">
                {valuation.quality.piotroskiFScore} / 9
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {valuation.quality.piotroskiFScore >= 7
                  ? "Institutional Quality"
                  : "Moderate Strength"}
              </div>
            </div>

            <div className="py-4 sm:px-6 sm:py-0">
              <div className="text-xs text-slate-400">Altman Z-Score</div>
              <div className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white">
                {valuation.quality.altmanZScore.toFixed(2)}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {valuation.quality.altmanZone} Zone
              </div>
            </div>

            <div className="pt-4 sm:pl-6 sm:pt-0">
              <div className="text-xs text-slate-400">Beneish M-Score</div>
              <div className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white">
                {valuation.quality.beneishMScore.toFixed(2)}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {valuation.quality.beneishFlag} Earnings Quality
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6 text-sm text-slate-400">
          DCF/EVA/Piotroski valuation applies to equity issuers.
        </div>
      )}

      {/* 5-Column Financial Statements Table */}
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-white">
              Normalized SEC Financial Statements
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Source: {source.toUpperCase()} · Standalone Q4 = FY − (Q1+Q2+Q3)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={showAllXbrl}
                onChange={(e) => setShowAllXbrl(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#3B82F6]"
              />
              Show all XBRL rows
            </label>

            <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#0B0E14] p-0.5 text-xs">
              {(["annual", "quarterly"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPeriodMode(m)}
                  className={`rounded-md px-3 py-1 capitalize transition ${
                    periodMode === m
                      ? "bg-white/[0.12] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-slate-400">
                <th className="py-3 pr-4 font-medium">Line Item</th>
                {periods.map((p) => (
                  <th
                    key={p.period}
                    className="px-4 py-3 text-right font-mono font-medium tabular-nums"
                  >
                    {p.period}
                    {p.isDerivedQ4 && (
                      <span className="ml-1 text-[10px] text-slate-500">
                        (Q4)
                      </span>
                    )}
                  </th>
                ))}
                <th className="py-3 pl-4 text-right font-mono font-medium">
                  YoY %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {visibleRows.map((row) => {
                const latest = periods[periods.length - 1];
                const prev =
                  periods.length >= 2 ? periods[periods.length - 2] : null;
                let yoy: number | null = null;
                if (row.yoyKey && latest) {
                  yoy = latest[row.yoyKey] as number | null;
                } else if (latest && prev) {
                  const curVal = Number(latest[row.key] ?? 0);
                  const prevVal = Number(prev[row.key] ?? 0);
                  if (prevVal !== 0) {
                    yoy = Number(
                      (((curVal - prevVal) / Math.abs(prevVal)) * 100).toFixed(1)
                    );
                  }
                }

                return (
                  <tr key={row.key} className="h-12 hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {row.label}
                    </td>
                    {periods.map((p) => {
                      const raw = Number(p[row.key] ?? 0);
                      return (
                        <td
                          key={`${row.key}-${p.period}`}
                          className="px-4 py-3 text-right font-mono tabular-nums text-slate-300"
                        >
                          {row.isEps
                            ? `$${raw.toFixed(2)}`
                            : formatCompactCurrency(raw)}
                        </td>
                      );
                    })}
                    <td
                      className={`py-3 pl-4 text-right font-mono text-xs tabular-nums ${
                        yoy === null
                          ? "text-slate-500"
                          : yoy >= 0
                            ? "text-[#10B981]"
                            : "text-[#F43F5E]"
                      }`}
                    >
                      {yoy === null
                        ? "—"
                        : `${yoy > 0 ? "+" : ""}${yoy.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customize Models Slide-Over Drawer (Interactive Valuation & Quality Toggles) */}
      {modelsDrawerOpen && valuation && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#0B0E14] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Customize Models &amp; Quality Scores
                </h3>
                <p className="text-xs text-slate-400">
                  WACC {(valuation.wacc * 100).toFixed(2)}% · ROIC{" "}
                  {(valuation.roic * 100).toFixed(1)}%
                </p>
              </div>
              <button
                type="button"
                aria-label="Close models drawer"
                onClick={() => setModelsDrawerOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex-1 space-y-6 overflow-y-auto">
              <div className="divide-y divide-white/[0.06] rounded-xl bg-[#11151E] px-4">
                {valuation.models.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-start justify-between gap-3 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={enabledModelIds.includes(m.id)}
                        onChange={() => onToggleModel(m.id)}
                        className="mt-0.5 h-4 w-4 accent-[#3B82F6]"
                      />
                      <div>
                        <div className="text-xs font-medium text-white">
                          {m.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-400">
                          {m.formulaSummary}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs tabular-nums">
                      <div className="font-semibold text-white">
                        {formatCurrency(m.fairValue)}
                      </div>
                      <div
                        className={
                          m.upsidePercent >= 0
                            ? "text-[#10B981]"
                            : "text-[#F43F5E]"
                        }
                      >
                        {formatSignedPct(m.upsidePercent)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="rounded-xl bg-[#11151E] p-4">
                <div className="mb-3 text-xs font-medium text-white">
                  Piotroski F-Score Breakdown ({valuation.quality.piotroskiFScore}
                  /9) · Altman {valuation.quality.altmanZScore.toFixed(2)} ·
                  Beneish {valuation.quality.beneishMScore.toFixed(2)}
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {valuation.quality.piotroskiBreakdown.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between py-2 text-xs"
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
              </div>
            </div>

            {composite && (
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4 text-sm">
                <span className="text-slate-400">Composite Fair Value</span>
                <span className="font-mono font-semibold tabular-nums text-white">
                  {formatCurrency(composite.fairValue)} (
                  {formatSignedPct(composite.upside)})
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
