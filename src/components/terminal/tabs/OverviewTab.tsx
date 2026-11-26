"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, FileText } from "lucide-react";
import {
  formatCompactCurrency,
  formatPrice,
  formatSignedPct,
} from "@/lib/format";
import {
  FinancialPeriodRow,
  QuoteSnapshot,
  SecFilingItem,
  TickerProfile,
} from "@/lib/types";

interface OverviewTabProps {
  profile: TickerProfile;
  quote: QuoteSnapshot;
  latestAnnual: FinancialPeriodRow | null;
  filings: SecFilingItem[];
}

export function OverviewTab({
  profile,
  quote,
  latestAnnual,
  filings,
}: OverviewTabProps) {
  const [filingsOpen, setFilingsOpen] = useState(false);

  const cards = [
    {
      label: "Market Cap",
      value: quote.marketCap ? formatCompactCurrency(quote.marketCap) : "—",
      sub: `${profile.exchange} · ${profile.currency}`,
    },
    {
      label: "Trailing P/E",
      value: quote.peRatio ? `${quote.peRatio.toFixed(1)}x` : "—",
      sub: quote.beta ? `Beta ${quote.beta.toFixed(2)}` : "Multi-asset",
    },
    {
      label: "Forward P/E",
      value: quote.forwardPe ? `${quote.forwardPe.toFixed(1)}x` : "—",
      sub: quote.dividendYield ? `Div Yield ${quote.dividendYield.toFixed(2)}%` : "No dividend",
    },
    {
      label: "Revenue Growth (YoY)",
      value:
        latestAnnual?.yoyRevenueGrowth !== null &&
        latestAnnual?.yoyRevenueGrowth !== undefined
          ? formatSignedPct(latestAnnual.yoyRevenueGrowth)
          : "—",
      sub: latestAnnual
        ? `FY${latestAnnual.fiscalYear} Rev ${formatCompactCurrency(latestAnnual.revenue)}`
        : "Not applicable",
    },
    {
      label: "Free Cash Flow",
      value: latestAnnual
        ? formatCompactCurrency(latestAnnual.freeCashFlow)
        : "—",
      sub: latestAnnual
        ? `OCF ${formatCompactCurrency(latestAnnual.operatingCashFlow)} − CapEx`
        : "Not applicable",
    },
    {
      label: "52W Range",
      value: `${formatPrice(quote.week52Low, quote.symbol)} – ${formatPrice(quote.week52High, quote.symbol)}`,
      sub: `Prev Close ${formatPrice(quote.previousClose, quote.symbol)}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 6 High-Signal Metric Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6"
          >
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {c.label}
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-white">
              {c.value}
            </div>
            <div className="mt-1.5 text-sm text-slate-400">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Concise 3-line company summary */}
      <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-white">
            Business Overview · {profile.sector}
          </h3>
          {profile.headquarters && (
            <span className="text-xs text-slate-400">
              {profile.headquarters}
              {profile.employees ? ` · ${profile.employees.toLocaleString()} employees` : ""}
            </span>
          )}
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">
          {profile.description}
        </p>
      </div>

      {/* Collapsed "Recent SEC Filings" Accordion */}
      <div className="rounded-xl border border-white/[0.08] bg-[#12161F]">
        <button
          type="button"
          onClick={() => setFilingsOpen((v) => !v)}
          className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-white/[0.02]"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-white">
              Recent SEC Filings
            </span>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-xs text-slate-400">
              {filings.length}
            </span>
          </div>
          {filingsOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {filingsOpen && (
          <div className="border-t border-white/[0.08] px-6 py-4">
            <div className="divide-y divide-white/[0.06]">
              {filings.map((f) => (
                <div
                  key={f.accessionNumber}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-white/[0.06] px-2 py-0.5 font-mono text-xs font-medium text-[#3B82F6]">
                      {f.form}
                    </span>
                    <div>
                      <div className="text-slate-200">{f.description}</div>
                      <div className="font-mono text-xs text-slate-500">
                        Filed {f.filingDate} · Period {f.reportDate}
                      </div>
                    </div>
                  </div>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-white"
                  >
                    EDGAR <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
