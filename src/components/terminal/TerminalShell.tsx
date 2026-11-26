"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Search, Sparkles, Trash2, X } from "lucide-react";
import { OrbitLogo } from "@/components/landing/LandingClient";
import { formatPrice, formatSignedPct } from "@/lib/format";
import { AiAnalystDrawer } from "./AiAnalystDrawer";
import {
  FOCUSED_TABS,
  FocusedTabId,
  TickerWorkspace,
  TickerWorkspacePayload,
} from "./TickerWorkspace";

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

const COMMAND_SYMBOLS = [
  { symbol: "AAPL", name: "Apple Inc.", category: "Equity" },
  { symbol: "NVDA", name: "NVIDIA Corporation", category: "Equity" },
  { symbol: "MSFT", name: "Microsoft Corporation", category: "Equity" },
  { symbol: "TSLA", name: "Tesla, Inc.", category: "Equity" },
  { symbol: "GOOGL", name: "Alphabet Inc.", category: "Equity" },
  { symbol: "META", name: "Meta Platforms, Inc.", category: "Equity" },
  { symbol: "CRM", name: "Salesforce, Inc.", category: "Equity" },
  { symbol: "UNH", name: "UnitedHealth Group", category: "Equity" },
  { symbol: "EURUSD", name: "Euro / US Dollar Spot", category: "FX" },
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar", category: "Crypto" },
  { symbol: "GC=F", name: "COMEX Gold Futures", category: "Commodity" },
];

const MNEMONIC_TO_TAB: Record<string, FocusedTabId> = {
  DES: "overview",
  OVERVIEW: "overview",
  GP: "overview",
  CHART: "overview",
  FA: "valuation",
  FINANCIALS: "valuation",
  VAL: "valuation",
  VALUATION: "valuation",
  SEAS: "seasonality",
  SEASONALITY: "seasonality",
  COT: "seasonality",
  SMART: "seasonality",
  FLOWS: "seasonality",
  OMON: "options",
  OPTIONS: "options",
};

interface TerminalShellProps {
  primarySymbol: string;
  initialData?: TickerWorkspacePayload;
  initialTab?: FocusedTabId;
  mode?: "research" | "discover";
  discoverContent?: React.ReactNode;
}

export function TerminalShell({
  primarySymbol,
  initialData,
  initialTab = "overview",
  mode = "research",
  discoverContent,
}: TerminalShellProps) {
  const router = useRouter();
  const cmdInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<FocusedTabId>(initialTab);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const [cmdQuery, setCmdQuery] = useState("");
  const [cmdFocused, setCmdFocused] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  const refreshWatchlist = () => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((json: { items?: WatchlistItem[] }) => {
        if (json.items) setWatchlist(json.items);
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshWatchlist();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Keyboard shortcuts: /, Cmd+K / Ctrl+K, Cmd+J / Ctrl+I, Esc, 1-4
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        cmdInputRef.current?.focus();
        setCmdFocused(true);
        return;
      }

      if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") ||
        (e.ctrlKey && e.key.toLowerCase() === "i")
      ) {
        e.preventDefault();
        setAiOpen((v) => !v);
        return;
      }

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        e.stopPropagation();
        cmdInputRef.current?.focus();
        setCmdFocused(true);
        return;
      }

      if (e.key === "Escape") {
        setCmdFocused(false);
        setWatchlistOpen(false);
        setAiOpen(false);
        cmdInputRef.current?.blur();
        return;
      }

      if (!isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const idx = Number(e.key);
        if (idx >= 1 && idx <= 4) {
          const tab = FOCUSED_TABS[idx - 1];
          if (tab) setActiveTab(tab.id);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  const suggestions = useMemo(() => {
    const raw = cmdQuery.trim().toUpperCase();
    if (!raw) {
      return [
        ...COMMAND_SYMBOLS.slice(0, 4).map((s) => ({
          label: `${s.symbol} — ${s.name}`,
          command: s.symbol,
          hint: s.category,
        })),
        { label: "NVDA FA — Valuation & Financials", command: "NVDA FA", hint: "Tab 2" },
        { label: "AAPL SEAS — Seasonality & Flows", command: "AAPL SEAS", hint: "Tab 3" },
        { label: "TSLA OMON — Options Chain", command: "TSLA OMON", hint: "Tab 4" },
      ];
    }

    const [tPart, fPart] = raw.split(/\s+/);
    const matches = COMMAND_SYMBOLS.filter(
      (s) => s.symbol.includes(tPart) || s.name.toUpperCase().includes(tPart)
    );
    const out: Array<{ label: string; command: string; hint: string }> = [];

    if (MNEMONIC_TO_TAB[tPart]) {
      out.push({
        label: `${primarySymbol} ${tPart} — Switch View`,
        command: `${primarySymbol} ${tPart}`,
        hint: "Tab",
      });
    }

    for (const s of matches) {
      if (fPart && MNEMONIC_TO_TAB[fPart]) {
        out.push({
          label: `${s.symbol} ${fPart} — ${s.name}`,
          command: `${s.symbol} ${fPart}`,
          hint: "View",
        });
      } else {
        out.push({
          label: `${s.symbol} — ${s.name}`,
          command: s.symbol,
          hint: s.category,
        });
      }
    }

    if (out.length === 0) {
      out.push({ label: `Go to ${raw}`, command: raw, hint: "Symbol" });
    }
    return out.slice(0, 7);
  }, [cmdQuery, primarySymbol]);

  const executeCommand = (rawCommand: string) => {
    const clean = rawCommand.trim().replace(/^\/+/, "").toUpperCase();
    if (!clean) return;

    const parts = clean.split(/\s+/);
    const first = parts[0];
    const second = parts[1];

    setCmdQuery("");
    setCmdFocused(false);
    cmdInputRef.current?.blur();

    if (first === "DISCOVER" || first === "SCREENER") {
      router.push("/terminal");
      return;
    }

    if (parts.length === 1 && MNEMONIC_TO_TAB[first]) {
      const tab = MNEMONIC_TO_TAB[first];
      setActiveTab(tab);
      if (mode === "discover") {
        router.push(`/terminal/${encodeURIComponent(primarySymbol)}?tab=${tab}`);
      }
      return;
    }

    const targetSym = first;
    const targetTab =
      second && MNEMONIC_TO_TAB[second] ? MNEMONIC_TO_TAB[second] : activeTab;
    if (second && MNEMONIC_TO_TAB[second]) {
      setActiveTab(targetTab);
    }

    router.push(`/terminal/${encodeURIComponent(targetSym)}?tab=${targetTab}`);
  };

  const toggleWatchlist = async (sym: string) => {
    const exists = watchlist.some((w) => w.symbol === sym.toUpperCase());
    if (exists) {
      await fetch(`/api/watchlist?symbol=${encodeURIComponent(sym)}`, {
        method: "DELETE",
      });
    } else {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sym }),
      });
    }
    refreshWatchlist();
  };

  const valuationSummary = useMemo(() => {
    if (!initialData?.valuation) return undefined;
    const v = initialData.valuation;
    return `Composite Fair Value $${v.compositeFairValue} (${v.compositeUpsidePercent}% vs $${v.currentPrice}), Piotroski F-Score ${v.quality.piotroskiFScore}/9, Altman Z-Score ${v.quality.altmanZScore}`;
  }, [initialData]);

  const inWatchlist = watchlist.some(
    (w) => w.symbol === primarySymbol.toUpperCase()
  );

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      {/* Clean 4-Element Top Navigation Bar (No left sidebar rail) */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0B0E14]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          {/* Element 1: Brand mark + "Discover" link */}
          <Link
            href="/terminal"
            className="flex shrink-0 items-center gap-2.5 text-sm font-medium text-white transition hover:opacity-85"
          >
            <OrbitLogo className="h-6 w-6" />
            <span className="hidden sm:inline font-semibold tracking-tight">
              OpenForecaster
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">Discover</span>
          </Link>

          {/* Element 2: Centered Command Search Input */}
          <div className="relative min-w-0 w-full max-w-md">
            <div
              className={`flex items-center gap-2 rounded-lg border bg-[#11151E] px-3 py-1.5 transition ${
                cmdFocused ? "border-white/30" : "border-white/[0.06]"
              }`}
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <input
                ref={cmdInputRef}
                type="text"
                aria-label="Global Command Bar"
                value={cmdQuery}
                onFocus={() => setCmdFocused(true)}
                onBlur={() => setTimeout(() => setCmdFocused(false), 160)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!cmdQuery && v === "/") return;
                  setCmdQuery(v.replace(/^\/+/, ""));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    executeCommand(cmdQuery || suggestions[0]?.command || "");
                  }
                }}
                placeholder="Search ticker or command... /"
                className="w-full bg-transparent font-mono text-xs text-white outline-none placeholder:font-sans placeholder:text-slate-500"
              />
            </div>

            {cmdFocused && (
              <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#11151E] shadow-2xl">
                {suggestions.map((s) => (
                  <button
                    key={s.command + s.label}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      executeCommand(s.command);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs transition hover:bg-white/[0.04]"
                  >
                    <span className="font-mono text-slate-200">{s.label}</span>
                    <span className="text-[11px] text-slate-500">{s.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Elements 3 & 4: Watchlist Icon Button + Ask AI CTA */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setWatchlistOpen((v) => !v)}
              aria-label="Watchlist"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-[#11151E] px-3 py-1.5 text-xs text-slate-300 transition hover:text-white"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Watchlist</span>
            </button>

            <button
              type="button"
              onClick={() => setAiOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#2563EB]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Centered Single-Column Workspace */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {mode === "discover" ? (
          discoverContent
        ) : (
          <TickerWorkspace
            symbol={primarySymbol}
            initialData={initialData}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            inWatchlist={inWatchlist}
            onToggleWatchlist={toggleWatchlist}
          />
        )}
      </main>

      {/* Slide-Over Watchlist Drawer (Closed by default) */}
      {watchlistOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <aside className="flex h-full w-full max-w-sm flex-col border-l border-white/[0.08] bg-[#0B0E14] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <h2 className="text-sm font-semibold text-white">Watchlist</h2>
              <button
                type="button"
                aria-label="Close Watchlist"
                onClick={() => setWatchlistOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex-1 divide-y divide-white/[0.06] overflow-y-auto">
              {watchlist.length === 0 ? (
                <div className="py-8 text-xs text-slate-500">
                  No tickers saved yet.
                </div>
              ) : (
                watchlist.map((item) => (
                  <div
                    key={item.symbol}
                    className="flex items-center justify-between py-3.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setWatchlistOpen(false);
                        router.push(
                          `/terminal/${encodeURIComponent(item.symbol)}`
                        );
                      }}
                      className="text-left"
                    >
                      <div className="font-mono text-xs font-semibold text-white">
                        {item.symbol}
                      </div>
                      <div className="max-w-[160px] truncate text-xs text-slate-400">
                        {item.name}
                      </div>
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono text-xs tabular-nums">
                        <div className="text-white">
                          {formatPrice(item.price, item.symbol)}
                        </div>
                        <div
                          className={
                            item.changePercent >= 0
                              ? "text-[#10B981]"
                              : "text-[#F43F5E]"
                          }
                        >
                          {formatSignedPct(item.changePercent)}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.symbol}`}
                        onClick={() => toggleWatchlist(item.symbol)}
                        className="rounded p-1 text-slate-500 hover:text-[#F43F5E]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Citation-Locked AI Analyst Drawer (Closed by default) */}
      <AiAnalystDrawer
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        symbol={primarySymbol}
        valuationSummary={valuationSummary}
      />
    </div>
  );
}
