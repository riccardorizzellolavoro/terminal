"use client";

import React, { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { TermHelp } from "@/components/ui/TermHelp";
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
  labelEn: string;
  labelIt: string;
  helpKey: string;
  isCore: boolean;
  isEps?: boolean;
  yoyKey?: keyof FinancialPeriodRow;
}

const LINE_ITEMS: LineItemDef[] = [
  { key: "revenue", labelEn: "Revenue", labelIt: "Ricavi", helpKey: "revenueGrowth", isCore: true, yoyKey: "yoyRevenueGrowth" },
  { key: "grossProfit", labelEn: "Gross Profit", labelIt: "Utile Lordo", helpKey: "grossProfit", isCore: true },
  { key: "operatingIncome", labelEn: "Operating Income", labelIt: "Risultato Operativo", helpKey: "operatingIncome", isCore: true },
  { key: "netIncome", labelEn: "Net Income", labelIt: "Utile Netto", helpKey: "netIncome", isCore: true, yoyKey: "yoyNetIncomeGrowth" },
  { key: "operatingCashFlow", labelEn: "Operating Cash Flow", labelIt: "Flusso di Cassa Operativo", helpKey: "operatingCashFlow", isCore: true },
  { key: "capex", labelEn: "CapEx", labelIt: "CapEx", helpKey: "capex", isCore: true },
  { key: "freeCashFlow", labelEn: "Free Cash Flow", labelIt: "Flusso di Cassa Libero", helpKey: "freeCashFlow", isCore: true, yoyKey: "yoyFcfGrowth" },
  { key: "costOfRevenue", labelEn: "Cost of Revenue", labelIt: "Costo dei Ricavi", helpKey: "grossProfit", isCore: false },
  { key: "operatingExpenses", labelEn: "Operating Expenses", labelIt: "Costi Operativi", helpKey: "operatingIncome", isCore: false },
  { key: "eps", labelEn: "Diluted EPS", labelIt: "EPS Diluito", helpKey: "peRatio", isCore: false, isEps: true },
  { key: "cashAndEquivalents", labelEn: "Cash & Equivalents", labelIt: "Cassa ed Equivalenti", helpKey: "evEbitda", isCore: false },
  { key: "totalAssets", labelEn: "Total Assets", labelIt: "Attivo Totale", helpKey: "altmanZScore", isCore: false },
  { key: "longTermDebt", labelEn: "Long-Term Debt", labelIt: "Debito Lungo Termine", helpKey: "evEbitda", isCore: false },
  { key: "shareholdersEquity", labelEn: "Shareholders' Equity", labelIt: "Patrimonio Netto", helpKey: "eva", isCore: false },
];

const MODEL_HELP_KEY: Record<string, string> = {
  dcf: "dcf",
  eva: "eva",
  lynch: "peterLynch",
  fcf_yield: "freeCashFlow",
  graham: "fairValue",
};

export function ValuationFinancialsTab({
  valuation,
  enabledModelIds,
  onToggleModel,
  annual,
  quarterly,
  source,
}: ValuationFinancialsTabProps) {
  const { lang, t } = useLanguage();
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

  const periods = (periodMode === "annual" ? annual : quarterly).slice(-3);
  const visibleRows = showAllXbrl
    ? LINE_ITEMS
    : LINE_ITEMS.filter((r) => r.isCore);

  return (
    <div className="space-y-8">
      {valuation && composite ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
            <div>
              <div className="flex items-center text-xs text-slate-400">
                <span>
                  {t.valuation.compositeFairValue} ({composite.count}{" "}
                  {t.valuation.modelsActive})
                </span>
                <TermHelp termKey="fairValue" />
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
                  {formatSignedPct(composite.upside)} {t.valuation.vs}{" "}
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
              {t.valuation.customizeModels}
            </button>
          </div>

          <div className="grid divide-y divide-white/[0.06] pt-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="pb-4 sm:pb-0 sm:pr-6">
              <div className="flex items-center text-xs text-slate-400">
                <span>{t.valuation.piotroski}</span>
                <TermHelp termKey="piotroskiFScore" />
              </div>
              <div className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white">
                {valuation.quality.piotroskiFScore} / 9
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {valuation.quality.piotroskiFScore >= 7
                  ? t.valuation.instQuality
                  : t.valuation.modStrength}
              </div>
            </div>

            <div className="py-4 sm:px-6 sm:py-0">
              <div className="flex items-center text-xs text-slate-400">
                <span>{t.valuation.altman}</span>
                <TermHelp termKey="altmanZScore" />
              </div>
              <div className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white">
                {valuation.quality.altmanZScore.toFixed(2)}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {valuation.quality.altmanZone === "Safe"
                  ? t.valuation.safeZone
                  : valuation.quality.altmanZone === "Grey"
                    ? t.valuation.greyZone
                    : t.valuation.distressZone}
              </div>
            </div>

            <div className="pt-4 sm:pl-6 sm:pt-0">
              <div className="flex items-center text-xs text-slate-400">
                <span>{t.valuation.beneish}</span>
                <TermHelp termKey="beneishMScore" />
              </div>
              <div className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-white">
                {valuation.quality.beneishMScore.toFixed(2)}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {valuation.quality.beneishFlag === "Clean"
                  ? t.valuation.cleanQuality
                  : t.valuation.warningQuality}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6 text-sm text-slate-400">
          {t.valuation.notEquity}
        </div>
      )}

      {/* 5-Column Financial Statements Table */}
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center text-sm font-medium text-white">
              <span>{t.valuation.financialStatements}</span>
              <TermHelp termKey="xbrl" />
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              {t.overview.source}: {source.toUpperCase()}
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
              {t.valuation.showAllXbrl}
            </label>

            <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#0B0E14] p-0.5 text-xs">
              {(["annual", "quarterly"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPeriodMode(m)}
                  className={`rounded-md px-3 py-1 transition ${
                    periodMode === m
                      ? "bg-white/[0.12] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m === "annual" ? t.valuation.annual : t.valuation.quarterly}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-slate-400">
                <th className="py-3 pr-4 font-medium">{t.valuation.lineItem}</th>
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
                  {t.valuation.yoyPct}
                  <TermHelp termKey="yoyPct" />
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
                      {lang === "it" ? row.labelIt : row.labelEn}
                      <TermHelp termKey={row.helpKey} />
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

      {/* Customize Models Slide-Over Drawer */}
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
                  {t.valuation.customizeModels}
                </h3>
                <p className="text-xs text-slate-400">
                  {t.valuation.wacc} {(valuation.wacc * 100).toFixed(2)}% ·{" "}
                  {t.valuation.roic} {(valuation.roic * 100).toFixed(1)}%
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
                        <div className="flex items-center text-xs font-medium text-white">
                          <span>{m.name}</span>
                          {MODEL_HELP_KEY[m.id] && (
                            <TermHelp termKey={MODEL_HELP_KEY[m.id]} />
                          )}
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
                <div className="mb-3 flex items-center text-xs font-medium text-white">
                  <span>
                    {t.valuation.piotroski} ({valuation.quality.piotroskiFScore}/9)
                  </span>
                  <TermHelp termKey="piotroskiFScore" />
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
                        {item.passed ? t.valuation.pass : t.valuation.fail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {composite && (
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4 text-sm">
                <span className="text-slate-400">
                  {t.valuation.compositeFairValue}
                </span>
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
