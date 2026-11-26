"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Star, X } from "lucide-react";
import {
  formatCurrency,
  formatPrice,
  formatSignedPct,
} from "@/lib/format";
import {
  FinancialPeriodRow,
  OhlcvBar,
  QuoteSnapshot,
  SeasonalityCurves,
  SecFilingItem,
  SmartMoneyResponse,
  TerminalTabId,
  TickerProfile,
  ValuationBundle,
} from "@/lib/types";
import { ChartTab } from "./tabs/ChartTab";
import { FinancialsTab } from "./tabs/FinancialsTab";
import { MacroNewsTab } from "./tabs/MacroNewsTab";
import { OptionsTab } from "./tabs/OptionsTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { SeasonalityTab } from "./tabs/SeasonalityTab";
import { SmartMoneyTab } from "./tabs/SmartMoneyTab";
import { ValuationTab } from "./tabs/ValuationTab";

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

export const TERMINAL_TABS: Array<{
  id: TerminalTabId;
  label: string;
  mnemonic: string;
  shortcut: string;
}> = [
  { id: "overview", label: "Overview", mnemonic: "DES", shortcut: "1" },
  { id: "chart", label: "Chart", mnemonic: "GP", shortcut: "2" },
  { id: "financials", label: "Financials", mnemonic: "FA", shortcut: "3" },
  { id: "valuation", label: "Valuation", mnemonic: "VAL", shortcut: "4" },
  { id: "seasonality", label: "Seasonality", mnemonic: "SEAS", shortcut: "5" },
  { id: "options", label: "Options", mnemonic: "OMON", shortcut: "6" },
  { id: "smart-money", label: "Smart Money", mnemonic: "COT", shortcut: "7" },
  { id: "macro", label: "Macro & News", mnemonic: "WEI", shortcut: "8" },
];

interface TickerWorkspaceProps {
  symbol: string;
  initialData?: TickerWorkspacePayload;
  activeTab: TerminalTabId;
  onTabChange: (tab: TerminalTabId) => void;
  inWatchlist: boolean;
  onToggleWatchlist: (symbol: string) => void;
  linkGroup?: "A" | "B" | "None";
  onChangeLinkGroup?: (group: "A" | "B" | "None") => void;
  isSplit?: boolean;
  paneLabel?: string;
}

export function TickerWorkspace({
  symbol,
  initialData,
  activeTab,
  onTabChange,
  inWatchlist,
  onToggleWatchlist,
  linkGroup = "None",
  onChangeLinkGroup,
  isSplit = false,
  paneLabel,
}: TickerWorkspaceProps) {
  const [data, setData] = useState<TickerWorkspacePayload | null>(
    initialData ?? null
  );
  const [loading, setLoading] = useState(!initialData);
  const [modelsDrawerOpen, setModelsDrawerOpen] = useState(false);
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
        if (!cancelled) {
          setData(json);
        }
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
        <div className="h-16 animate-pulse rounded-xl bg-[#12161F]" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-36 animate-pulse rounded-xl bg-[#12161F]" />
          <div className="h-36 animate-pulse rounded-xl bg-[#12161F]" />
          <div className="h-36 animate-pulse rounded-xl bg-[#12161F]" />
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-[#12161F]" />
      </div>
    );
  }

  const { profile, quote, chart, financials, filings, valuation, seasonality, smartMoney } =
    data;
  const isUp = quote.change >= 0;

  return (
    <div className="space-y-6">
      {/* Hero Ticker Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="flex flex-wrap items-center gap-3">
          {isSplit && paneLabel && (
            <span className="rounded bg-white/[0.08] px-2 py-0.5 font-mono text-[11px] text-slate-300">
              {paneLabel}
            </span>
          )}
          <span className="rounded-lg border border-white/[0.1] bg-[#12161F] px-2.5 py-1 font-mono text-sm font-semibold text-white">
            {profile.symbol}
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              {profile.name}
            </h1>
            <div className="text-xs text-slate-400">
              {profile.exchange} · {profile.sector}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          {isSplit && onChangeLinkGroup && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Link:</span>
              {(["Group A", "Group B", "None"] as const).map((g) => {
                const code = g === "Group A" ? "A" : g === "Group B" ? "B" : "None";
                const active = linkGroup === code;
                const badgeColor =
                  code === "A"
                    ? "border-[#3B82F6]/60 text-[#60A5FA]"
                    : code === "B"
                      ? "border-[#FF9900]/60 text-[#FF9900]"
                      : "border-white/[0.12] text-slate-400";
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onChangeLinkGroup(code)}
                    className={`rounded border px-2 py-0.5 font-mono text-[11px] transition ${
                      active
                        ? `${badgeColor} bg-white/[0.06]`
                        : "border-white/[0.06] text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          )}

          <div className="text-right font-mono tabular-nums">
            <div className="text-2xl font-semibold text-white">
              {profile.assetClass === "fx" ? "" : "$"}
              {formatPrice(quote.price, profile.symbol)}
            </div>
            <div
              className={`text-xs font-medium ${
                isUp ? "text-[#10B981]" : "text-[#F43F5E]"
              }`}
            >
              {isUp ? "+" : ""}
              {formatPrice(quote.change, profile.symbol)} (
              {formatSignedPct(quote.changePercent)})
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleWatchlist(profile.symbol)}
            aria-label="Add to Watchlist"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
              inWatchlist
                ? "border-[#FF9900]/50 bg-[#FF9900]/10 text-[#FF9900]"
                : "border-white/[0.1] bg-[#12161F] text-slate-300 hover:border-white/25 hover:text-white"
            }`}
          >
            <Star
              className={`h-3.5 w-3.5 ${inWatchlist ? "fill-[#FF9900]" : ""}`}
            />
            {inWatchlist ? "Watchlisted" : "Watchlist"}
          </button>
        </div>
      </div>

      {/* Above-the-Fold "At-a-Glance" Strip (Max 3 Summary Cards) */}
      <div
        data-testid="at-a-glance-strip"
        className="grid gap-6 md:grid-cols-3"
      >
        {/* Card 1: Composite Fair Value */}
        <div className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Composite Fair Value
              </span>
              {compositeValuation && (
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium tabular-nums ${
                    compositeValuation.upside >= 0
                      ? "bg-[#10B981]/15 text-[#10B981]"
                      : "bg-[#F43F5E]/15 text-[#F43F5E]"
                  }`}
                >
                  {formatSignedPct(compositeValuation.upside)}{" "}
                  {compositeValuation.label}
                </span>
              )}
            </div>

            <div className="mt-3 font-mono text-2xl font-semibold tabular-nums text-white">
              {compositeValuation
                ? formatCurrency(compositeValuation.fairValue)
                : `${profile.assetClass === "fx" ? "" : "$"}${formatPrice(quote.price, profile.symbol)}`}
            </div>
            <div className="mt-1 text-sm text-slate-400">
              {compositeValuation
                ? `Target vs $${formatPrice(quote.price, profile.symbol)} spot`
                : "Spot pricing · Non-equity asset"}
            </div>
          </div>

          {valuation && (
            <button
              type="button"
              onClick={() => setModelsDrawerOpen(true)}
              className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-medium text-[#3B82F6] transition hover:text-[#60A5FA]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Customize Models
            </button>
          )}
        </div>

        {/* Card 2: Seasonal Edge */}
        <div className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Seasonal Edge (Next 30D)
              </span>
              <span className="font-mono text-xs text-slate-500">
                {seasonality.defaultWindow.startMonthDay} →{" "}
                {seasonality.defaultWindow.endMonthDay}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-mono text-2xl font-semibold tabular-nums text-white">
                {seasonality.defaultWindow.winRate.toFixed(1)}% Win
              </span>
              <span
                className={`font-mono text-sm tabular-nums ${
                  seasonality.defaultWindow.avgReturn >= 0
                    ? "text-[#10B981]"
                    : "text-[#F43F5E]"
                }`}
              >
                {formatSignedPct(seasonality.defaultWindow.avgReturn)} avg
              </span>
            </div>
            <div className="mt-1 text-sm text-slate-400">
              Across {seasonality.defaultWindow.yearsAnalyzed} detrended years
            </div>
          </div>

          <button
            type="button"
            onClick={() => onTabChange("seasonality")}
            className="mt-4 w-fit text-xs font-medium text-[#3B82F6] transition hover:text-[#60A5FA]"
          >
            Open 30Y Seasonality Explorer →
          </button>
        </div>

        {/* Card 3: Smart Money Signal */}
        <div className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Smart Money Signal
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  smartMoney.signalTone === "bullish"
                    ? "bg-[#10B981]/15 text-[#10B981]"
                    : smartMoney.signalTone === "bearish"
                      ? "bg-[#F43F5E]/15 text-[#F43F5E]"
                      : "bg-white/[0.08] text-slate-200"
                }`}
              >
                {smartMoney.signalLabel}
              </span>
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {smartMoney.insiderTrades.length} Form 4 ·{" "}
              {smartMoney.congressTrades.length} Congress · CFTC COT
            </div>
          </div>

          <button
            type="button"
            onClick={() => onTabChange("smart-money")}
            className="mt-4 w-fit text-xs font-medium text-[#3B82F6] transition hover:text-[#60A5FA]"
          >
            Inspect COT &amp; Filings →
          </button>
        </div>
      </div>

      {/* Human-Readable Tab Bar (Keyboard Shortcuts 1-8) */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.08]">
        {TERMINAL_TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition ${
                active ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{t.label}</span>
              <span className="font-mono text-[10px] text-slate-500">
                {t.mnemonic}
              </span>
              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF9900]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Body */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab
            profile={profile}
            quote={quote}
            latestAnnual={
              financials.annual[financials.annual.length - 1] ?? null
            }
            filings={filings}
          />
        )}
        {activeTab === "chart" && (
          <ChartTab symbol={profile.symbol} initialBars={chart.bars} />
        )}
        {activeTab === "financials" && (
          <FinancialsTab
            annual={financials.annual}
            quarterly={financials.quarterly}
            source={financials.source}
            cik={financials.cik}
          />
        )}
        {activeTab === "valuation" && (
          <ValuationTab
            valuation={valuation}
            enabledModelIds={enabledModelIds}
            onToggleModel={toggleModel}
          />
        )}
        {activeTab === "seasonality" && (
          <SeasonalityTab symbol={profile.symbol} seasonality={seasonality} />
        )}
        {activeTab === "options" && <OptionsTab symbol={profile.symbol} />}
        {activeTab === "smart-money" && (
          <SmartMoneyTab smartMoney={smartMoney} />
        )}
        {activeTab === "macro" && <MacroNewsTab />}
      </div>

      {/* Customize Valuation Models Slide-Over Drawer */}
      {modelsDrawerOpen && valuation && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-sm flex-col border-l border-white/[0.1] bg-[#0B0E14] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Customize Valuation Models
                </h3>
                <p className="text-xs text-slate-400">
                  Recalculates composite Fair Value in real time
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModelsDrawerOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex-1 space-y-3 overflow-y-auto">
              {valuation.models.map((m) => (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#12161F] p-4"
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={enabledModelIds.includes(m.id)}
                      onChange={() => toggleModel(m.id)}
                      className="mt-0.5 h-4 w-4 accent-[#3B82F6]"
                    />
                    <div>
                      <div className="text-xs font-medium text-white">
                        {m.name}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        {m.formulaSummary}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-semibold tabular-nums text-white">
                    {formatCurrency(m.fairValue)}
                  </div>
                </label>
              ))}
            </div>

            {compositeValuation && (
              <div className="mt-4 border-t border-white/[0.08] pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Composite Target</span>
                  <span className="font-mono font-semibold tabular-nums text-white">
                    {formatCurrency(compositeValuation.fairValue)} (
                    {formatSignedPct(compositeValuation.upside)})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
