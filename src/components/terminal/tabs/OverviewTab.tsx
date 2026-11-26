"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { TermHelp } from "@/components/ui/TermHelp";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatPrice,
  formatSignedPct,
} from "@/lib/format";
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
  const { lang, t } = useLanguage();
  const [filingsOpen, setFilingsOpen] = useState(false);
  const [showAllFilings, setShowAllFilings] = useState(false);

  const visibleFilings = showAllFilings ? filings : filings.slice(0, 7);
  const isEquity = profile.assetClass === "equity";

  const stats = isEquity
    ? [
        {
          label: t.overview.marketCap,
          helpKey: "marketCap",
          value: quote.marketCap ? formatCompactCurrency(quote.marketCap) : "—",
          tone: "neutral" as const,
        },
        {
          label: t.overview.peRatio,
          helpKey: "peRatio",
          value: quote.peRatio ? `${quote.peRatio.toFixed(1)}x` : "—",
          tone: "neutral" as const,
        },
        {
          label: t.overview.revenueGrowth,
          helpKey: "revenueGrowth",
          value:
            latestAnnual?.yoyRevenueGrowth !== null &&
            latestAnnual?.yoyRevenueGrowth !== undefined
              ? formatSignedPct(latestAnnual.yoyRevenueGrowth)
              : "—",
          tone:
            latestAnnual?.yoyRevenueGrowth !== null &&
            latestAnnual?.yoyRevenueGrowth !== undefined
              ? latestAnnual.yoyRevenueGrowth >= 0
                ? ("positive" as const)
                : ("negative" as const)
              : ("neutral" as const),
        },
        {
          label: t.overview.freeCashFlow,
          helpKey: "freeCashFlow",
          value: latestAnnual
            ? formatCompactCurrency(latestAnnual.freeCashFlow)
            : "—",
          tone: "neutral" as const,
        },
      ]
    : [
        {
          label: t.overview.week52Range,
          helpKey: "week52Range",
          value: `${formatPrice(quote.week52Low, profile.symbol)} – ${formatPrice(quote.week52High, profile.symbol)}`,
          tone: "neutral" as const,
        },
        {
          label:
            profile.assetClass === "etf" && profile.expenseRatio
              ? "TER / Fee"
              : profile.assetClass === "fx"
                ? "Spot Rate"
                : profile.assetClass === "commodity"
                  ? "Futures Contract"
                  : t.overview.dividendYield,
          helpKey:
            profile.assetClass === "fx"
              ? "spotRate"
              : profile.assetClass === "commodity"
                ? "futuresContract"
                : "dividendYield",
          value:
            profile.assetClass === "etf" && profile.expenseRatio
              ? `${profile.expenseRatio.toFixed(2)}%`
              : quote.dividendYield
                ? `${quote.dividendYield.toFixed(2)}%`
                : formatPrice(quote.price, profile.symbol),
          tone: "neutral" as const,
        },
        {
          label: "Volume",
          helpKey: "volume",
          value: quote.volume > 0 ? formatCompactNumber(quote.volume) : "OTC / Index",
          tone: "neutral" as const,
        },
        {
          label:
            profile.assetClass === "index" && profile.symbol === "^VIX"
              ? "VIX"
              : quote.marketCap
                ? t.overview.marketCap
                : "Beta",
          helpKey:
            profile.symbol === "^VIX"
              ? "vix"
              : quote.marketCap
                ? "marketCap"
                : "ohlcv",
          value: quote.marketCap
            ? formatCompactCurrency(quote.marketCap)
            : quote.beta !== null
              ? quote.beta.toFixed(2)
              : "—",
          tone: "neutral" as const,
        },
      ];

  return (
    <div className="space-y-8">
      <ChartTab symbol={profile.symbol} initialBars={bars} />

      {/* 4 Key Stats (Flat surface with hairline dividers) */}
      <div className="grid divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-[#11151E] md:grid-cols-4 md:divide-x md:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="p-6">
            <div className="flex items-center text-xs text-slate-400">
              <span>{s.label}</span>
              <TermHelp termKey={s.helpKey} />
            </div>
            <div
              className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${
                s.tone === "positive"
                  ? "text-[#10B981]"
                  : s.tone === "negative"
                    ? "text-[#F43F5E]"
                    : "text-white"
              }`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Concise 3-line Summary */}
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
        <div className="text-xs text-slate-400">
          {t.overview.summary} · {profile.sector}
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">
          {lang === "it" && profile.descriptionIt
            ? profile.descriptionIt
            : profile.description}
        </p>
      </div>

      {/* Collapsed "SEC Filings" Accordion (Equities with filings only) */}
      {filings.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-[#11151E]">
          <div className="flex w-full items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setFilingsOpen((v) => !v)}
                className="text-left text-sm font-medium text-white transition hover:opacity-85"
              >
                {t.overview.secFilings}{" "}
                <span className="ml-2 font-mono text-xs text-slate-400">
                  ({filings.length})
                </span>
              </button>
              <TermHelp termKey="xbrl" />
            </div>
            <button
              type="button"
              aria-label={t.overview.secFilings}
              onClick={() => setFilingsOpen((v) => !v)}
              className="rounded p-1 text-slate-400 transition hover:text-white"
            >
              {filingsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>

          {filingsOpen && (
            <div className="border-t border-white/[0.06] px-6 py-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-xs text-slate-400">
                      <th className="py-3 pr-4 font-medium">{t.overview.form}</th>
                      <th className="px-4 py-3 font-medium">
                        {t.overview.description}
                      </th>
                      <th className="px-4 py-3 font-mono font-medium">
                        {t.overview.period}
                      </th>
                      <th className="px-4 py-3 font-mono font-medium">
                        {t.overview.filed}
                      </th>
                      <th className="py-3 pl-4 text-right font-medium">
                        {t.overview.source}
                      </th>
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
                  {showAllFilings
                    ? t.screener.showFewer
                    : `${t.screener.showMore} (${filings.length - 7})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
