"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { formatCompactCurrency, formatSignedPct } from "@/lib/format";
import {
  FinancialPeriodRow,
  OhlcvBar,
  QuoteSnapshot,
  SecFilingItem,
  TickerProfile,
} from "@/lib/types";
import { ChartTab } from "./ChartTab";

interface OverviewTabProps {
  profile: TickerProfile;
  quote: QuoteSnapshot;
  bars: OhlcvBar[];
  latestAnnual: FinancialPeriodRow | null;
  filings: SecFilingItem[];
}

export function OverviewTab({
  profile,
  quote,
  bars,
  latestAnnual,
  filings,
}: OverviewTabProps) {
  const [filingsOpen, setFilingsOpen] = useState(false);
  const [showAllFilings, setShowAllFilings] = useState(false);

  const visibleFilings = showAllFilings ? filings : filings.slice(0, 7);

  return (
    <div className="space-y-8">
      {/* Layer 3: Full-Width Candlestick Chart (h-[460px]) */}
      <ChartTab symbol={profile.symbol} initialBars={bars} />

      {/* 4 Key Company Stats (Flat surface with hairline dividers — zero nested borders) */}
      <div className="grid divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-[#11151E] md:grid-cols-4 md:divide-x md:divide-y-0">
        <div className="p-6">
          <div className="text-xs text-slate-400">Market Cap</div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
            {quote.marketCap ? formatCompactCurrency(quote.marketCap) : "—"}
          </div>
        </div>

        <div className="p-6">
          <div className="text-xs text-slate-400">Trailing P/E</div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
            {quote.peRatio ? `${quote.peRatio.toFixed(1)}x` : "—"}
          </div>
        </div>

        <div className="p-6">
          <div className="text-xs text-slate-400">Revenue Growth</div>
          <div
            className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${
              latestAnnual?.yoyRevenueGrowth !== null &&
              latestAnnual?.yoyRevenueGrowth !== undefined
                ? latestAnnual.yoyRevenueGrowth >= 0
                  ? "text-[#10B981]"
                  : "text-[#F43F5E]"
                : "text-white"
            }`}
          >
            {latestAnnual?.yoyRevenueGrowth !== null &&
            latestAnnual?.yoyRevenueGrowth !== undefined
              ? formatSignedPct(latestAnnual.yoyRevenueGrowth)
              : "—"}
          </div>
        </div>

        <div className="p-6">
          <div className="text-xs text-slate-400">Free Cash Flow</div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
            {latestAnnual
              ? formatCompactCurrency(latestAnnual.freeCashFlow)
              : "—"}
          </div>
        </div>
      </div>

      {/* Concise 3-line Business Summary */}
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
        <div className="text-xs text-slate-400">
          Business Summary · {profile.sector}
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">
          {profile.description}
        </p>
      </div>

      {/* Collapsed "SEC Filings" Accordion */}
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E]">
        <button
          type="button"
          onClick={() => setFilingsOpen((v) => !v)}
          className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-white/[0.02]"
        >
          <span className="text-sm font-medium text-white">
            SEC Filings{" "}
            <span className="ml-2 font-mono text-xs text-slate-400">
              ({filings.length})
            </span>
          </span>
          {filingsOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {filingsOpen && (
          <div className="border-t border-white/[0.06] px-6 py-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs text-slate-400">
                    <th className="py-3 pr-4 font-medium">Form</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-mono font-medium">Period</th>
                    <th className="px-4 py-3 font-mono font-medium">Filed</th>
                    <th className="py-3 pl-4 text-right font-medium">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {visibleFilings.map((f) => (
                    <tr key={f.accessionNumber} className="h-12">
                      <td className="py-3 pr-4 font-mono text-xs font-semibold text-white">
                        {f.form}
                      </td>
                      <td className="max-w-md truncate px-4 py-3 text-slate-300">
                        {f.description}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs tabular-nums text-slate-400">
                        {f.reportDate}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs tabular-nums text-slate-400">
                        {f.filingDate}
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                        >
                          EDGAR <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filings.length > 7 && (
              <button
                type="button"
                onClick={() => setShowAllFilings((v) => !v)}
                className="mt-4 text-xs text-slate-400 hover:text-white"
              >
                {showAllFilings ? "Show fewer" : `Show more (${filings.length - 7} more)`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
