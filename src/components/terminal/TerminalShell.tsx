"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Search, Sparkles, Trash2, X } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { formatPrice, formatSignedPct } from "@/lib/format";
import { TICKER_UNIVERSE } from "@/lib/seed/universe";
import { AssetClass } from "@/lib/types";
import { AiAnalystDrawer } from "./AiAnalystDrawer";
import {
  TabDescriptor,
  TickerWorkspace,
  TickerWorkspacePayload,
  WorkspaceTabKey,
} from "./TickerWorkspace";

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

const ALL_INSTRUMENTS = Object.values(TICKER_UNIVERSE).map((p) => ({
  symbol: p.symbol,
  name: p.name,
  assetClass: p.assetClass,
  sector: p.sector,
}));

const MNEMONIC_TO_TAB: Record<string, WorkspaceTabKey> = {
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
  SPREADS: "spreads",
  MACRO: "macro",
};

function OpenTerminalLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="12"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="13.5"
        ry="5.5"
        transform="rotate(-28 16 16)"
        stroke="#3B82F6"
        strokeWidth="1.6"
      />
      <circle cx="16" cy="16" r="3.2" fill="#F8FAFC" />
    </svg>
  );
}

interface TerminalShellProps {
  primarySymbol: string;
  initialData?: TickerWorkspacePayload;
  initialTab?: WorkspaceTabKey;
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
  const { lang, setLang, t } = useLanguage();
  const cmdInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>(initialTab);
  const [resolvedTabs, setResolvedTabs] = useState<TabDescriptor[]>([]);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const [cmdQuery, setCmdQuery] = useState("");
  const [cmdFocused, setCmdFocused] = useState(false);
  const [searchClassFilter, setSearchClassFilter] = useState<"all" | AssetClass>("all");
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

  // Keyboard shortcuts: /, Cmd+K, Cmd+J / Ctrl+I, Esc, 1-4
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
          const tab = resolvedTabs[idx - 1];
          if (tab) setActiveTab(tab.id);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [resolvedTabs]);

  const suggestions = useMemo(() => {
    const raw = cmdQuery.trim().toUpperCase();
    const pool =
      searchClassFilter === "all"
        ? ALL_INSTRUMENTS
        : ALL_INSTRUMENTS.filter((i) => i.assetClass === searchClassFilter);

    if (!raw) {
      return pool.slice(0, 8).map((s) => ({
        label: `${s.symbol} — ${s.name}`,
        command: s.symbol,
        hint: t.assetClasses[s.assetClass],
      }));
    }

    const [tPart, fPart] = raw.split(/\s+/);
    const matches = pool.filter(
      (s) =>
        s.symbol.includes(tPart) ||
        s.name.toUpperCase().includes(tPart) ||
        s.sector.toUpperCase().includes(tPart)
    );
    const out: Array<{ label: string; command: string; hint: string }> = [];

    if (MNEMONIC_TO_TAB[tPart]) {
      out.push({
        label: `${primarySymbol} ${tPart}`,
        command: `${primarySymbol} ${tPart}`,
        hint: "Tab",
      });
    }

    for (const s of matches) {
      if (fPart && MNEMONIC_TO_TAB[fPart]) {
        out.push({
          label: `${s.symbol} ${fPart} — ${s.name}`,
          command: `${s.symbol} ${fPart}`,
          hint: t.assetClasses[s.assetClass],
        });
      } else {
        out.push({
          label: `${s.symbol} — ${s.name}`,
          command: s.symbol,
          hint: t.assetClasses[s.assetClass],
        });
      }
    }

    if (out.length === 0) {
      out.push({ label: `${raw}`, command: raw, hint: "Symbol" });
    }
    return out.slice(0, 8);
  }, [cmdQuery, primarySymbol, searchClassFilter, t]);

  const executeCommand = (rawCommand: string) => {
    const clean = rawCommand.trim().replace(/^\/+/, "").toUpperCase();
    if (!clean) return;

    const parts = clean.split(/\s+/);
    const first = parts[0];
    const second = parts[1];

    setCmdQuery("");
    setCmdFocused(false);
    cmdInputRef.current?.blur();

    if (first === "DISCOVER" || first === "ESPLORA" || first === "SCREENER") {
      router.push("/");
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
      {/* Top Header Bar: ONLY 5 Clean Elements */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0B0E14]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-6">
          {/* 1. OpenTerminal logo + Discover / Esplora link */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 text-sm font-medium text-white transition hover:opacity-85"
          >
            <OpenTerminalLogo className="h-6 w-6" />
            <span className="hidden sm:inline font-semibold tracking-tight">
              {t.brandName}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">{t.discover}</span>
          </Link>

          {/* 2. Global Command Search input */}
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
                onBlur={() => setTimeout(() => setCmdFocused(false), 180)}
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
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent font-mono text-xs text-white outline-none placeholder:font-sans placeholder:text-slate-500"
              />
            </div>

            {cmdFocused && (
              <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#11151E] shadow-2xl">
                <div className="flex flex-wrap gap-1 border-b border-white/[0.06] px-3 py-2">
                  {(["all", "equity", "etf", "index", "fx", "crypto", "commodity", "bond"] as const).map(
                    (cls) => (
                      <button
                        key={cls}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchClassFilter(cls);
                        }}
                        className={`rounded px-2 py-0.5 text-[10px] transition ${
                          searchClassFilter === cls
                            ? "bg-white/[0.14] text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {t.assetClasses[cls]}
                      </button>
                    )
                  )}
                </div>
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
                    <span className="truncate font-mono text-slate-200">
                      {s.label}
                    </span>
                    <span className="ml-2 shrink-0 text-[11px] text-slate-500">
                      {s.hint}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. EN | IT Toggle, 4. Watchlist, 5. Ask AI */}
          <div className="flex shrink-0 items-center gap-2">
            <div
              role="group"
              aria-label="Language switcher"
              className="inline-flex rounded-lg border border-white/[0.06] bg-[#11151E] p-0.5 font-mono text-[11px]"
            >
              {(["en", "it"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`rounded-md px-2 py-1 uppercase transition ${
                    lang === code
                      ? "bg-white/[0.14] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setWatchlistOpen((v) => !v)}
              aria-label={t.watchlist}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-[#11151E] px-3 py-1.5 text-xs text-slate-300 transition hover:text-white"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{t.watchlist}</span>
            </button>

            <button
              type="button"
              onClick={() => setAiOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#2563EB]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.askAi}</span>
            </button>
          </div>
        </div>
      </header>

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
            onTabsResolved={setResolvedTabs}
          />
        )}
      </main>

      {/* Slide-Over Watchlist Drawer */}
      {watchlistOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <aside className="flex h-full w-full max-w-sm flex-col border-l border-white/[0.08] bg-[#0B0E14] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <h2 className="text-sm font-semibold text-white">
                {t.watchlist}
              </h2>
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
                  {t.noSavedTickers}
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

      <AiAnalystDrawer
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        symbol={primarySymbol}
        valuationSummary={valuationSummary}
      />
    </div>
  );
}
