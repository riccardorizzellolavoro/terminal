"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { TermHelp } from "@/components/ui/TermHelp";
import { formatCurrency, formatPrice, formatSignedPct } from "@/lib/format";
import {
  AssetClass,
  FinancialPeriodRow,
  MacroIndicator,
  OhlcvBar,
  QuoteSnapshot,
  SeasonalityCurves,
  SecFilingItem,
  SmartMoneyResponse,
  SovereignRatesSnapshot,
  TickerProfile,
  ValuationBundle,
} from "@/lib/types";
import {
  HistoricalSpreadsView,
  MacroDriversView,
  YieldCurveOverview,
} from "./tabs/BondsView";
import { OptionsTab } from "./tabs/OptionsTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { SeasonalityFlowsTab } from "./tabs/SeasonalityFlowsTab";
import { ValuationFinancialsTab } from "./tabs/ValuationFinancialsTab";

export type WorkspaceTabKey =
  | "overview"
  | "valuation"
  | "seasonality"
  | "options"
  | "spreads"
  | "macro";

export interface TabDescriptor {
  id: WorkspaceTabKey;
  label: string;
  shortcut: string;
}

export function getTabsForAssetClass(
  assetClass: AssetClass,
  symbol: string,
  t: ReturnType<typeof useLanguage>["t"]
): TabDescriptor[] {
  if (assetClass === "equity") {
    return [
      { id: "overview", label: t.tabs.overview, shortcut: "1" },
      { id: "valuation", label: t.tabs.valuation, shortcut: "2" },
      { id: "seasonality", label: t.tabs.seasonality, shortcut: "3" },
      { id: "options", label: t.tabs.options, shortcut: "4" },
    ];
  }
  if (assetClass === "etf" || assetClass === "index" || assetClass === "crypto") {
    const hasOptions =
      assetClass === "etf" ||
      symbol === "^GSPC" ||
      symbol === "^NDX" ||
      symbol === "^VIX" ||
      symbol === "BTC-USD" ||
      symbol === "ETH-USD";
    const list: TabDescriptor[] = [
      { id: "overview", label: t.tabs.overview, shortcut: "1" },
      { id: "seasonality", label: t.tabs.seasonality, shortcut: "2" },
    ];
    if (hasOptions) {
      list.push({ id: "options", label: t.tabs.options, shortcut: "3" });
    }
    return list;
  }
  if (assetClass === "commodity" || assetClass === "fx") {
    return [
      { id: "overview", label: t.tabs.overview, shortcut: "1" },
      { id: "seasonality", label: t.tabs.seasonalityCot, shortcut: "2" },
      { id: "macro", label: t.tabs.macroDrivers, shortcut: "3" },
    ];
  }
  // bond
  return [
    { id: "overview", label: t.tabs.yieldOverview, shortcut: "1" },
    { id: "spreads", label: t.tabs.historicalSpreads, shortcut: "2" },
    { id: "macro", label: t.tabs.macroDrivers, shortcut: "3" },
  ];
}

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
  macroIndicators: MacroIndicator[];
  sovereignRates: SovereignRatesSnapshot;
}

interface TickerWorkspaceProps {
  symbol: string;
  initialData?: TickerWorkspacePayload;
  activeTab: WorkspaceTabKey;
  onTabChange: (tab: WorkspaceTabKey) => void;
  inWatchlist: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onTabsResolved?: (tabs: TabDescriptor[]) => void;
}

export function TickerWorkspace({
  symbol,
  initialData,
  activeTab,
  onTabChange,
  inWatchlist,
  onToggleWatchlist,
  onTabsResolved,
}: TickerWorkspaceProps) {
  const { t } = useLanguage();
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
  const [liveCryptoPrice, setLiveCryptoPrice] = useState<{
    price: number;
    changePct: number;
  } | null>(null);

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

  // Load persisted custom valuation models from SQLite
  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then((json: { preferences?: Record<string, string> }) => {
        const raw = json.preferences?.valuation_models;
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as string[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEnabledModelIds(parsed);
          }
        } catch {
          // ignore
        }
      })
      .catch(() => {});
  }, []);

  // Live Binance WS tick when viewing crypto symbol
  useEffect(() => {
    setLiveCryptoPrice(null);
    if (data?.profile.assetClass !== "crypto") return;
    const pair = data.profile.symbol.replace("-USD", "USDT").toLowerCase();
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@miniTicker`);
      ws.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data) as { c?: string; o?: string };
          const c = Number(d.c);
          const o = Number(d.o);
          if (c && o) {
            setLiveCryptoPrice({
              price: c,
              changePct: Number((((c - o) / o) * 100).toFixed(2)),
            });
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // fallback
    }
    return () => {
      if (ws && ws.readyState <= WebSocket.OPEN) ws.close();
    };
  }, [data?.profile.symbol, data?.profile.assetClass]);

  const tabs = useMemo(() => {
    if (!data) return [];
    return getTabsForAssetClass(data.profile.assetClass, data.profile.symbol, t);
  }, [data, t]);

  useEffect(() => {
    if (tabs.length > 0) {
      onTabsResolved?.(tabs);
      if (!tabs.some((tb) => tb.id === activeTab)) {
        onTabChange(tabs[0].id);
      }
    }
  }, [tabs, activeTab, onTabChange, onTabsResolved]);

  const toggleModel = (id: string) => {
    setEnabledModelIds((prev) => {
      const next = prev.includes(id)
        ? prev.length > 1
          ? prev.filter((x) => x !== id)
          : prev
        : [...prev, id];
      fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "valuation_models", value: next }),
      }).catch(() => {});
      return next;
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
          ? t.signals.undervalued
          : upside <= -8
            ? t.signals.overvalued
            : t.signals.fairlyValued,
    };
  }, [data?.valuation, enabledModelIds, t]);

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
    macroIndicators,
    sovereignRates,
  } = data;

  const displayPrice = liveCryptoPrice?.price ?? quote.price;
  const displayChangePct = liveCryptoPrice?.changePct ?? quote.changePercent;
  const isUp = displayChangePct >= 0;

  const currencyPrefix =
    profile.assetClass === "fx" || profile.assetClass === "bond" || profile.assetClass === "index"
      ? ""
      : profile.currency === "EUR"
        ? "€"
        : "$";
  const currencySuffix =
    profile.currency === "%"
      ? "%"
      : profile.currency === "bps"
        ? " bps"
        : "";

  const effectiveTab = tabs.some((tb) => tb.id === activeTab)
    ? activeTab
    : tabs[0]?.id ?? "overview";

  return (
    <div className="space-y-6">
      {/* Layer 1: Minimal Ticker Header */}
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
              {currencyPrefix}
              {profile.assetClass === "bond"
                ? profile.currency === "bps"
                  ? displayPrice.toFixed(0)
                  : displayPrice.toFixed(2)
                : formatPrice(displayPrice, profile.symbol)}
              {currencySuffix}
            </span>
            <span
              className={`text-sm font-medium ${
                isUp ? "text-[#10B981]" : "text-[#F43F5E]"
              }`}
            >
              {isUp ? "+" : ""}
              {quote.change.toFixed(profile.assetClass === "fx" ? 4 : 2)} (
              {formatSignedPct(displayChangePct)})
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleWatchlist(profile.symbol)}
            aria-label={t.watchlist}
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

      {/* Layer 2: Compact 3-Signal Strip */}
      <div
        data-testid="at-a-glance-strip"
        className="flex flex-wrap items-center gap-3"
      >
        {profile.assetClass === "bond" ? (
          <>
            <div className="inline-flex items-center rounded-lg border border-white/[0.06] bg-[#11151E] px-3.5 py-2 text-xs text-slate-300 transition hover:border-white/20">
              <button
                type="button"
                onClick={() => onTabChange("spreads")}
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <span className="text-slate-400">{t.bonds.us2s10s}:</span>
                <span className="font-mono font-medium tabular-nums text-white">
                  {sovereignRates.spreadsHistory.slice(-1)[0]?.us2s10sBps ?? 23}{" "}
                  bps
                </span>
              </button>
              <TermHelp termKey="spread2y10y" />
            </div>

            <div className="inline-flex items-center rounded-lg border border-white/[0.06] bg-[#11151E] px-3.5 py-2 text-xs text-slate-300 transition hover:border-white/20">
              <button
                type="button"
                onClick={() => onTabChange("spreads")}
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <span className="text-slate-400">{t.bonds.btpBund}:</span>
                <span className="font-mono font-medium tabular-nums text-white">
                  {sovereignRates.euBenchmarks.find((b) => b.id === "BTPBUND")
                    ?.value ?? 130}{" "}
                  bps
                </span>
              </button>
              <TermHelp termKey="btpBundSpread" />
            </div>

            <div className="inline-flex items-center rounded-lg border border-white/[0.06] bg-[#11151E] px-3.5 py-2 text-xs text-slate-300 transition hover:border-white/20">
              <button
                type="button"
                onClick={() => onTabChange("macro")}
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <span className="text-slate-400">ECB / Fed:</span>
                <span className="font-mono font-medium text-white">
                  3.25% /{" "}
                  {macroIndicators
                    .find((m) => m.id === "FEDFUNDS")
                    ?.value.toFixed(2) ?? "4.08"}
                  %
                </span>
              </button>
              <TermHelp termKey="ecbRate" />
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex items-center rounded-lg border border-white/[0.06] bg-[#11151E] px-3.5 py-2 text-xs text-slate-300 transition hover:border-white/20">
              <button
                type="button"
                onClick={() =>
                  onTabChange(
                    profile.assetClass === "equity" ? "valuation" : "overview"
                  )
                }
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <span className="text-slate-400">
                  {compositeValuation
                    ? t.signals.fairValue
                    : t.signals.spotPrice}
                  :
                </span>
                <span className="font-mono font-medium tabular-nums text-white">
                  {compositeValuation
                    ? formatCurrency(compositeValuation.fairValue)
                    : `${currencyPrefix}${formatPrice(displayPrice, profile.symbol)}`}
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
                    {compositeValuation.upside.toFixed(0)}%{" "}
                    {compositeValuation.label})
                  </span>
                )}
              </button>
              <TermHelp
                termKey={compositeValuation ? "fairValue" : "spotRate"}
              />
            </div>

            <div className="inline-flex items-center rounded-lg border border-white/[0.06] bg-[#11151E] px-3.5 py-2 text-xs text-slate-300 transition hover:border-white/20">
              <button
                type="button"
                onClick={() => onTabChange("seasonality")}
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <span className="text-slate-400">
                  {t.signals.seasonality30d}:
                </span>
                <span className="font-mono font-medium tabular-nums text-white">
                  {seasonality.defaultWindow.winRate.toFixed(0)}%{" "}
                  {t.signals.winRate}
                </span>
                <span
                  className={`font-mono tabular-nums ${
                    seasonality.defaultWindow.avgReturn >= 0
                      ? "text-[#10B981]"
                      : "text-[#F43F5E]"
                  }`}
                >
                  ({formatSignedPct(seasonality.defaultWindow.avgReturn)}{" "}
                  {t.signals.avg})
                </span>
              </button>
              <TermHelp termKey="winRate" />
            </div>

            <div className="inline-flex items-center rounded-lg border border-white/[0.06] bg-[#11151E] px-3.5 py-2 text-xs text-slate-300 transition hover:border-white/20">
              <button
                type="button"
                onClick={() => onTabChange("seasonality")}
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <span className="text-slate-400">{t.signals.smartMoney}:</span>
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
              <TermHelp termKey="cftcCot" />
            </div>
          </>
        )}
      </div>

      {/* Asset-Class-Aware Tab Bar */}
      <div
        role="tablist"
        aria-label="Instrument sections"
        className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.06]"
      >
        {tabs.map((tb) => {
          const active = effectiveTab === tb.id;
          return (
            <button
              key={tb.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tb.id)}
              className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition ${
                active ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{tb.label}</span>
              <span className="ml-2 font-mono text-[11px] text-slate-600">
                {tb.shortcut}
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
        {effectiveTab === "overview" &&
          (profile.assetClass === "bond" ? (
            <YieldCurveOverview
              profile={profile}
              bars={chart.bars}
              sovereignRates={sovereignRates}
            />
          ) : (
            <OverviewTab
              profile={profile}
              quote={quote}
              bars={chart.bars}
              latestAnnual={
                financials.annual[financials.annual.length - 1] ?? null
              }
              filings={filings}
            />
          ))}

        {effectiveTab === "valuation" && (
          <ValuationFinancialsTab
            valuation={valuation}
            enabledModelIds={enabledModelIds}
            onToggleModel={toggleModel}
            annual={financials.annual}
            quarterly={financials.quarterly}
            source={financials.source}
          />
        )}

        {effectiveTab === "seasonality" && (
          <SeasonalityFlowsTab
            symbol={profile.symbol}
            seasonality={seasonality}
            smartMoney={smartMoney}
            cotOnly={
              profile.assetClass === "commodity" || profile.assetClass === "fx"
            }
          />
        )}

        {effectiveTab === "options" && <OptionsTab symbol={profile.symbol} />}

        {effectiveTab === "spreads" && (
          <HistoricalSpreadsView sovereignRates={sovereignRates} />
        )}

        {effectiveTab === "macro" && (
          <MacroDriversView
            macroIndicators={macroIndicators}
            sovereignRates={sovereignRates}
          />
        )}
      </div>
    </div>
  );
}
