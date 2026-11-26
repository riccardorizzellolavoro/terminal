"use client";

import React, { useState } from "react";
import { formatCompactCurrency } from "@/lib/format";
import { FinancialPeriodRow } from "@/lib/types";

interface FinancialsTabProps {
  annual: FinancialPeriodRow[];
  quarterly: FinancialPeriodRow[];
  source: "live" | "cache" | "seed";
  cik: string | null;
}

type StatementTab = "all" | "income" | "balance" | "cashflow";

interface RowDef {
  key: keyof FinancialPeriodRow;
  label: string;
  statement: "income" | "balance" | "cashflow";
  isCore: boolean;
  isEps?: boolean;
  yoyKey?: keyof FinancialPeriodRow;
}

const LINE_ITEMS: RowDef[] = [
  // 7 Core headline rows
  { key: "revenue", label: "Revenue", statement: "income", isCore: true, yoyKey: "yoyRevenueGrowth" },
  { key: "grossProfit", label: "Gross Profit", statement: "income", isCore: true },
  { key: "operatingIncome", label: "Operating Income", statement: "income", isCore: true },
  { key: "netIncome", label: "Net Income", statement: "income", isCore: true, yoyKey: "yoyNetIncomeGrowth" },
  { key: "operatingCashFlow", label: "Operating Cash Flow", statement: "cashflow", isCore: true },
  { key: "capex", label: "CapEx", statement: "cashflow", isCore: true },
  { key: "freeCashFlow", label: "Free Cash Flow", statement: "cashflow", isCore: true, yoyKey: "yoyFcfGrowth" },
  // Extended XBRL detail rows
  { key: "costOfRevenue", label: "Cost of Revenue", statement: "income", isCore: false },
  { key: "operatingExpenses", label: "Operating Expenses", statement: "income", isCore: false },
  { key: "interestExpense", label: "Interest Expense", statement: "income", isCore: false },
  { key: "eps", label: "Diluted EPS", statement: "income", isCore: false, isEps: true },
  { key: "cashAndEquivalents", label: "Cash & Equivalents", statement: "balance", isCore: false },
  { key: "currentAssets", label: "Current Assets", statement: "balance", isCore: false },
  { key: "totalAssets", label: "Total Assets", statement: "balance", isCore: false },
  { key: "currentLiabilities", label: "Current Liabilities", statement: "balance", isCore: false },
  { key: "longTermDebt", label: "Long-Term Debt", statement: "balance", isCore: false },
  { key: "totalLiabilities", label: "Total Liabilities", statement: "balance", isCore: false },
  { key: "shareholdersEquity", label: "Shareholders' Equity", statement: "balance", isCore: false },
];

export function FinancialsTab({
  annual,
  quarterly,
  source,
  cik,
}: FinancialsTabProps) {
  const [periodMode, setPeriodMode] = useState<"annual" | "quarterly">("annual");
  const [statementTab, setStatementTab] = useState<StatementTab>("all");
  const [showAllItems, setShowAllItems] = useState(false);

  const periods = (periodMode === "annual" ? annual : quarterly).slice(-6);
  const visibleRows = LINE_ITEMS.filter((item) => {
    if (!showAllItems && statementTab === "all") return item.isCore;
    if (statementTab !== "all" && item.statement !== statementTab) return false;
    return showAllItems ? true : item.isCore || statementTab === "balance";
  });

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "all", label: "Core Summary" },
              { id: "income", label: "Income Statement" },
              { id: "balance", label: "Balance Sheet" },
              { id: "cashflow", label: "Cash Flow" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatementTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                statementTab === t.id
                  ? "bg-white/[0.1] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Show all line items toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={showAllItems}
              onChange={(e) => setShowAllItems(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#3B82F6]"
            />
            Show all line items
          </label>

          {/* Annual / Quarterly toggle */}
          <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#0B0E14] p-0.5 text-xs">
            {(["annual", "quarterly"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPeriodMode(m)}
                className={`rounded-md px-3 py-1 capitalize transition ${
                  periodMode === m
                    ? "bg-[#3B82F6] text-white"
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
            <tr className="border-b border-white/[0.08] text-xs text-slate-400">
              <th className="py-3 pr-4 font-medium">Line Item</th>
              {periods.map((p) => (
                <th
                  key={p.period}
                  className="px-3 py-3 text-right font-mono font-medium tabular-nums"
                >
                  <div>{p.period}</div>
                  {p.isDerivedQ4 && (
                    <div className="text-[10px] font-normal text-[#FF9900]">
                      Derived Q4
                    </div>
                  )}
                </th>
              ))}
              <th className="pl-3 py-3 text-right font-mono font-medium">
                YoY %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {visibleRows.map((row) => {
              const latest = periods[periods.length - 1];
              const prev = periods.length >= 2 ? periods[periods.length - 2] : null;
              let yoy: number | null = null;
              if (row.yoyKey && latest) {
                yoy = latest[row.yoyKey] as number | null;
              } else if (latest && prev) {
                const curVal = Number(latest[row.key] ?? 0);
                const prevVal = Number(prev[row.key] ?? 0);
                if (prevVal !== 0) {
                  yoy = Number((((curVal - prevVal) / Math.abs(prevVal)) * 100).toFixed(1));
                }
              }

              return (
                <tr key={row.key} className="hover:bg-white/[0.02]">
                  <td className="py-3 pr-4 font-medium text-slate-200">
                    {row.label}
                    {row.key === "freeCashFlow" && (
                      <span className="ml-2 text-[11px] font-normal text-slate-500">
                        (OCF − CapEx)
                      </span>
                    )}
                  </td>
                  {periods.map((p) => {
                    const raw = Number(p[row.key] ?? 0);
                    return (
                      <td
                        key={`${row.key}-${p.period}`}
                        className="px-3 py-3 text-right font-mono tabular-nums text-slate-300"
                      >
                        {row.isEps
                          ? `$${raw.toFixed(2)}`
                          : formatCompactCurrency(raw)}
                      </td>
                    );
                  })}
                  <td
                    className={`pl-3 py-3 text-right font-mono text-xs tabular-nums ${
                      yoy === null
                        ? "text-slate-500"
                        : yoy >= 0
                          ? "text-[#10B981]"
                          : "text-[#F43F5E]"
                    }`}
                  >
                    {yoy === null ? "—" : `${yoy > 0 ? "+" : ""}${yoy.toFixed(1)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-xs text-slate-500">
        <span>
          SEC XBRL Normalization: Standalone Q4 = FY − (Q1 + Q2 + Q3) · FCF = OCF
          − CapEx
        </span>
        <span className="font-mono">
          Source: {source.toUpperCase()} {cik ? `· CIK ${cik}` : ""}
        </span>
      </div>
    </div>
  );
}
