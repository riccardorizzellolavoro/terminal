"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { formatCurrency, formatPrice, formatSignedPct } from "@/lib/format";
import {
  FinancialPeriodRow,
  OhlcvBar,
  QuoteSnapshot,
  SeasonalityCurves,
  SecFilingItem,
  SmartMoneyResponse,
  TickerProfile,
  ValuationBundle,
} from "@/lib/types";
import { OptionsTab } from "./tabs/OptionsTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { SeasonalityFlowsTab } from "./tabs/SeasonalityFlowsTab";
import { ValuationFinancialsTab } from "./tabs/ValuationFinancialsTab";

export type FocusedTabId = "overview" | "valuation" | "seasonality" | "options";

export const FOCUSED_TABS: Array<{
  id: FocusedTabId;
  label: string;
  shortcut: string;
}> = [
  { id: "overview", label: "Overview", shortcut: "1" },
  { id: "valuation", label: "Valuation & Financials", shortcut: "2" },
  { id: "seasonality", label: "Seasonality & Flows", shortcut: "3" },
  { id: "options", label: "Options", shortcut: "4" },
];

export interface TickerWorkspacePayload {
  profile: TickerProfile;
  quote: QuoteSnapshot;
  chart: { bars: OhlcvBar[]; source: "live" | "cache" | "seed" };
  financials: {
    annual: FinancialPeriodRow[];
    quarterly: FinancialPeriodRow[];
    source: "live" | "cache" | "seed";
    cik: string | null;
  };
  filings: SecFilingItem[];
  valuation: ValuationBundle | null;
  seasonality: SeasonalityCurves;
  smartMoney: SmartMoneyResponse;
}

interface TickerWorkspaceProps {
  symbol: string;
  initialData?: TickerWorkspacePayload;
  activeTab: FocusedTabId;
  onTabChange: (tab: FocusedTabId) => void;
  inWatchlist: boolean;
  onToggleWatchlist: (symbol: string) => void;
}

export function TickerWorkspace({
  symbol,
  initialData,
  activeTab,
  onTabChange,
  inWatchlist,
  onToggleWatchlist,
}: TickerWorkspaceProps) {
  const [data, setData] = useState<TickerWorkspacePayload | null>(
    initialData ?? null
  );
  const [loading, setLoading] = useState(!initialData);
  const [enabledModelIds, setEnabledModelIds] = useState<string[]>([
    "dcf",
    "eva",
    "lynch",
    "fcf_yield",
  ]);

  useEffect(() => {
    if (initialData && initialData.profile.symbol === symbol.toUpperCase()) {
      setData(initialData);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch(`/api/ticker/${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((json: TickerWorkspacePayload) => {
        if (!cancelled) setData(json);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, initialData]);

  useEffect(() => {
    if (data?.valuation) {
      setEnabledModelIds(
        data.valuation.models
          .filter((m) => m.enabledByDefault)
          .map((m) => m.id)
      );
    }
  }, [data?.profile.symbol]);

  const toggleModel = (id: string) => {
    setEnabledModelIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((x) => x !== id) : prev;
      }
      return [...prev, id];
    });
  };

  const compositeValuation = useMemo(() => {
    if (!data?.valuation) return null;
    const active = data.valuation.models.filter((m) =>
      enabledModelIds.includes(m.id)
    );
    const list = active.length > 0 ? active : data.valuation.models.slice(0, 1);
    const fair = list.reduce((a, m) => a + m.fairValue, 0) / list.length;
    const upside =
      ((fair - data.valuation.currentPrice) / data.valuation.currentPrice) *
      100;
    return {
      fairValue: Number(fair.toFixed(2)),
      upside: Number(upside.toFixed(1)),
      label:
        upside >= 8
          ? "Undervalued"
          : upside <= -8
            ? "Overvalued"
            : "Fairly Valued",
    };
  }, [data?.valuation, enabledModelIds]);

  if (loading || !data) {
    return (
      <div className="space-y-6 py-4">
        <div className="h-14 animate-pulse rounded-xl bg-[#11151E]" />
        <div className="h-12 animate-pulse rounded-xl bg-[#11151E]" />
        <div className="h-[460px] animate-pulse rounded-xl bg-[#11151E]" />
      </div>
    );
  }

  const {
    profile,
    quote,
    chart,
    financials,
    filings,
    valuation,
    seasonality,
    smartMoney,
  } = data;
  const isUp = quote.change >= 0;

  return (
    <div className="space-y-6">
      {/* Layer 1: Minimal Ticker Header (Name, Ticker, Live Price, Daily $ / % Change) */}
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {profile.name}
          </h1>
          <span className="font-mono text-sm text-slate-400">
            {profile.symbol}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-3 font-mono tabular-nums">
            <span className="text-2xl font-semibold text-white">
              {profile.assetClass === "fx" ? "" : "$"}
              {formatPrice(quote.price, profile.symbol)}
            </span>
            <span
              className={`text-sm font-medium ${
                isUp ? "text-[#10B981]" : "text-[#F43F5E]"
              }`}
            >
              {isUp ? "+" : ""}
              {quote.change.toFixed(profile.assetClass === "fx" ? 4 : 2)} (
              {formatSignedPct(quote.changePercent)})
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleWatchlist(profile.symbol)}
            aria-label="Toggle Watchlist"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Star
              className={`h-4 w-4 ${
                inWatchlist ? "fill-white text-white" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Layer 2: Compact 3-Signal Strip (Single-Row Summary Bar) */}
      <div
        data-testid="at-a-glance-strip"
        className="flex flex-wrap items-center gap-3"
      >
        <button
          type="button"
          onClick={() => onTabChange("valuation")}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#11151E] px-3.5 py-2 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
        >
          <span className="text-slate-400">Fair Value:</span>
          <span className="font-mono font-medium tabular-nums text-white">
            {compositeValuation
              ? formatCurrency(compositeValuation.fairValue)
              : `${profile.assetClass === "fx" ? "" : "$"}${formatPrice(quote.price, profile.symbol)}`}
          </span>
          {compositeValuation && (
            <span
              className={`font-mono tabular-nums ${
                compositeValuation.upside >= 0
                  ? "text-[#10B981]"
                  : "text-[#F43F5E]"
              }`}
            >
              ({compositeValuation.upside > 0 ? "+" : ""}
              {compositeValuation.upside.toFixed(0)}% {compositeValuation.label})
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange("seasonality")}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#11151E] px-3.5 py-2 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
        >
          <span className="text-slate-400">30D Seasonality:</span>
          <span className="font-mono font-medium tabular-nums text-white">
            {seasonality.defaultWindow.winRate.toFixed(0)}% Win Rate
          </span>
          <span
            className={`font-mono tabular-nums ${
              seasonality.defaultWindow.avgReturn >= 0
                ? "text-[#10B981]"
                : "text-[#F43F5E]"
            }`}
          >
            ({formatSignedPct(seasonality.defaultWindow.avgReturn)} avg)
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("seasonality")}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#11151E] px-3.5 py-2 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
        >
          <span className="text-slate-400">Smart Money:</span>
          <span
            className={`font-medium ${
              smartMoney.signalTone === "bullish"
                ? "text-[#10B981]"
                : smartMoney.signalTone === "bearish"
                  ? "text-[#F43F5E]"
                  : "text-slate-200"
            }`}
          >
            {smartMoney.signalLabel}
          </span>
        </button>
      </div>

      {/* 4-Tab Bar (Keyboard Shortcuts 1–4) */}
      <div
        role="tablist"
        aria-label="Ticker research sections"
        className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.06]"
      >
        {FOCUSED_TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(t.id)}
              className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition ${
                active ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{t.label}</span>
              <span className="ml-2 font-mono text-[11px] text-slate-600">
                {t.shortcut}
              </span>
              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Layer 3: Active Tab Content */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab
            profile={profile}
            quote={quote}
            bars={chart.bars}
            latestAnnual={
              financials.annual[financials.annual.length - 1] ?? null
            }
            filings={filings}
          />
        )}

        {activeTab === "valuation" && (
          <ValuationFinancialsTab
            valuation={valuation}
            enabledModelIds={enabledModelIds}
            onToggleModel={toggleModel}
            annual={financials.annual}
            quarterly={financials.quarterly}
            source={financials.source}
          />
        )}

        {activeTab === "seasonality" && (
          <SeasonalityFlowsTab
            symbol={profile.symbol}
            seasonality={seasonality}
            smartMoney={smartMoney}
          />
        )}

        {activeTab === "options" && <OptionsTab symbol={profile.symbol} />}
      </div>
    </div>
  );
}
