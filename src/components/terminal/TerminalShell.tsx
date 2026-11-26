"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bookmark,
  Columns2,
  Compass,
  LineChart,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { OrbitLogo } from "@/components/landing/LandingClient";
import { formatPrice, formatSignedPct } from "@/lib/format";
import { TerminalTabId } from "@/lib/types";
import { AiAnalystDrawer } from "./AiAnalystDrawer";
import {
  TERMINAL_TABS,
  TickerWorkspace,
  TickerWorkspacePayload,
} from "./TickerWorkspace";

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

interface CommandItem {
  symbol: string;
  name: string;
  category: string;
}

const COMMAND_SYMBOLS: CommandItem[] = [
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

const MNEMONIC_TO_TAB: Record<string, TerminalTabId> = {
  DES: "overview",
  OVERVIEW: "overview",
  GP: "chart",
  CHART: "chart",
  FA: "financials",
  FINANCIALS: "financials",
  VAL: "valuation",
  VALUATION: "valuation",
  SEAS: "seasonality",
  SEASONALITY: "seasonality",
  OMON: "options",
  OPTIONS: "options",
  COT: "smart-money",
  SMART: "smart-money",
  WEI: "macro",
  TOP: "macro",
  MACRO: "macro",
};

interface TerminalShellProps {
  primarySymbol: string;
  initialData?: TickerWorkspacePayload;
  initialTab?: TerminalTabId;
  mode?: "research" | "screener";
  screenerContent?: React.ReactNode;
}

export function TerminalShell({
  primarySymbol,
  initialData,
  initialTab = "overview",
  mode = "research",
  screenerContent,
}: TerminalShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const cmdInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<TerminalTabId>(initialTab);
  const [splitScreen, setSplitScreen] = useState(false);
  const [secondarySymbol, setSecondarySymbol] = useState("NVDA");
  const [secondaryTab, setSecondaryTab] = useState<TerminalTabId>("chart");
  const [primaryGroup, setPrimaryGroup] = useState<"A" | "B" | "None">("A");
  const [secondaryGroup, setSecondaryGroup] = useState<"A" | "B" | "None">("B");

  // Drawers closed by default
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // Command bar state
  const [cmdQuery, setCmdQuery] = useState("");
  const [cmdFocused, setCmdFocused] = useState(false);

  // Watchlist state
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Live Header Pills (S&P 500, Nasdaq, 10Y Yield, Binance WS BTC/ETH/SOL)
  const [marketPills, setMarketPills] = useState({
    sp500: { value: 5998.74, changePercent: 0.68 },
    nasdaq: { value: 19184.22, changePercent: 0.94 },
    tenYear: { value: 4.24, change: -0.04 },
  });
  const [cryptoTicks, setCryptoTicks] = useState({
    BTC: { price: 94280.5, changePct: 1.99 },
    ETH: { price: 3412.8, changePct: 2.34 },
    SOL: { price: 238.4, changePct: 3.12 },
  });

  // Load initial watchlist + macro pills
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
    fetch("/api/macro")
      .then((r) => r.json())
      .then((json: { headerPills?: { sp500?: { value: number; changePercent: number }; nasdaq?: { value: number; changePercent: number }; tenYearYield?: { value: number; change: number } } }) => {
        if (json.headerPills) {
          setMarketPills({
            sp500: json.headerPills.sp500 ?? { value: 5998.74, changePercent: 0.68 },
            nasdaq: json.headerPills.nasdaq ?? { value: 19184.22, changePercent: 0.94 },
            tenYear: json.headerPills.tenYearYield ?? { value: 4.24, change: -0.04 },
          });
        }
      })
      .catch(() => {});
  }, []);

  // Direct client-side Binance WebSocket stream for BTC, ETH, SOL
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(
        "wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker/solusdt@miniTicker"
      );
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as {
            data?: { s?: string; c?: string; o?: string };
          };
          const d = msg.data;
          if (!d?.s || !d.c || !d.o) return;
          const close = Number(d.c);
          const open = Number(d.o);
          if (!close || !open) return;
          const pct = Number((((close - open) / open) * 100).toFixed(2));
          const key = d.s.replace("USDT", "") as "BTC" | "ETH" | "SOL";
          if (key === "BTC" || key === "ETH" || key === "SOL") {
            setCryptoTicks((prev) => ({
              ...prev,
              [key]: { price: close, changePct: pct },
            }));
          }
        } catch {
          // Ignore malformed frame
        }
      };
    } catch {
      // Fallback seed ticks remain active
    }
    return () => {
      if (ws && ws.readyState <= WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Global Keyboard Shortcuts: /, Cmd+K / Ctrl+K, Cmd+J / Ctrl+I, Esc, 1-8
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
        cmdInputRef.current?.blur();
        return;
      }

      if (!isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const idx = Number(e.key);
        if (idx >= 1 && idx <= 8) {
          const tab = TERMINAL_TABS[idx - 1];
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
        ...COMMAND_SYMBOLS.slice(0, 5).map((s) => ({
          label: `${s.symbol} — ${s.name}`,
          command: s.symbol,
          hint: s.category,
        })),
        { label: "NVDA FA — NVIDIA Financials", command: "NVDA FA", hint: "Mnemonic" },
        { label: "TSLA OMON — Tesla Options", command: "TSLA OMON", hint: "Mnemonic" },
        { label: "AAPL VAL — Apple Valuation", command: "AAPL VAL", hint: "Mnemonic" },
        { label: "MSFT SEAS — Microsoft Seasonality", command: "MSFT SEAS", hint: "Mnemonic" },
        { label: "WEI — Global Macro & Yield Curve", command: "WEI", hint: "Macro" },
      ];
    }

    const [tPart, fPart] = raw.split(/\s+/);
    const matchingSyms = COMMAND_SYMBOLS.filter(
      (s) =>
        s.symbol.includes(tPart) ||
        s.name.toUpperCase().includes(tPart)
    );

    const out: Array<{ label: string; command: string; hint: string }> = [];
    if (MNEMONIC_TO_TAB[tPart]) {
      out.push({
        label: `${primarySymbol} ${tPart} — Switch Tab`,
        command: `${primarySymbol} ${tPart}`,
        hint: "Function",
      });
    }

    for (const s of matchingSyms) {
      if (fPart) {
        for (const t of TERMINAL_TABS) {
          if (
            t.mnemonic.startsWith(fPart) ||
            t.label.toUpperCase().includes(fPart)
          ) {
            out.push({
              label: `${s.symbol} ${t.mnemonic} — ${s.name} (${t.label})`,
              command: `${s.symbol} ${t.mnemonic}`,
              hint: t.label,
            });
          }
        }
      } else {
        out.push({
          label: `${s.symbol} — ${s.name}`,
          command: s.symbol,
          hint: s.category,
        });
      }
    }

    if (out.length === 0) {
      out.push({
        label: `Go to ${raw}`,
        command: raw,
        hint: "Symbol",
      });
    }
    return out.slice(0, 8);
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

    // Pure mnemonic without ticker (e.g., "WEI" or "FA")
    if (parts.length === 1 && MNEMONIC_TO_TAB[first]) {
      const tab = MNEMONIC_TO_TAB[first];
      setActiveTab(tab);
      if (mode === "screener") {
        router.push(`/terminal/${encodeURIComponent(primarySymbol)}?tab=${tab}`);
      }
      return;
    }

    if (first === "SCREENER" || first === "DISCOVER") {
      router.push("/terminal/screener");
      return;
    }

    const targetSym = first;
    const targetTab = second && MNEMONIC_TO_TAB[second] ? MNEMONIC_TO_TAB[second] : activeTab;

    if (second && MNEMONIC_TO_TAB[second]) {
      setActiveTab(targetTab);
    }

    if (splitScreen && primaryGroup === secondaryGroup && primaryGroup !== "None") {
      setSecondarySymbol(targetSym);
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
    <div className="flex min-h-screen bg-[#0B0E14] text-slate-100">
      {/* Streamlined Left Icon Rail (64px, expands on hover) — Only 3 destinations */}
      <aside className="group fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-white/[0.08] bg-[#07090E] transition-all duration-200 hover:w-52">
        <Link
          href="/"
          className="flex h-14 items-center gap-3 border-b border-white/[0.08] px-4"
        >
          <OrbitLogo className="h-7 w-7 shrink-0" />
          <span className="truncate text-sm font-semibold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            OpenForecaster
          </span>
        </Link>

        <nav className="mt-4 flex flex-1 flex-col gap-1.5 px-2.5">
          <Link
            href="/terminal/screener"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              pathname === "/terminal/screener"
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <Compass className="h-5 w-5 shrink-0" />
            <span className="truncate opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              Discover
            </span>
          </Link>

          <Link
            href={`/terminal/${encodeURIComponent(primarySymbol)}`}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              pathname !== "/terminal/screener"
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <LineChart className="h-5 w-5 shrink-0 text-[#FF9900]" />
            <span className="truncate opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              Ticker Research
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setWatchlistOpen((v) => !v)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
              watchlistOpen
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <Bookmark className="h-5 w-5 shrink-0" />
            <span className="truncate opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              Watchlist
            </span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area offset by 64px rail */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden pl-16">
        {/* Trimmed Top Header Bar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0B0E14]/95 backdrop-blur-md">
          <div className="flex h-14 min-w-0 items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
            {/* Global Command Bar (/, Cmd+K, Amber focus ring) */}
            <div className="relative min-w-0 w-full max-w-md">
              <div
                className={`flex items-center gap-2 rounded-lg border bg-[#12161F] px-3 py-1.5 transition ${
                  cmdFocused
                    ? "border-[#FF9900] ring-1 ring-[#FF9900]/50"
                    : "border-white/[0.08]"
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
                  placeholder="Jump to ticker or function (e.g. NVDA FA, TSLA OMON)..."
                  className="w-full bg-transparent font-mono text-xs text-white outline-none placeholder:font-sans placeholder:text-slate-500"
                />
                <kbd className="hidden rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline">
                  /
                </kbd>
              </div>

              {cmdFocused && (
                <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-white/[0.1] bg-[#12161F] shadow-2xl">
                  {suggestions.map((s) => (
                    <button
                      key={s.command + s.label}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        executeCommand(s.command);
                      }}
                      className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs transition hover:bg-white/[0.05]"
                    >
                      <span className="font-mono text-slate-200">{s.label}</span>
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-slate-400">
                        {s.hint}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4 Live Market Pills */}
            <div className="hidden items-center gap-2 xl:flex">
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#12161F] px-3 py-1 font-mono text-xs tabular-nums">
                <span className="text-slate-400">S&amp;P 500</span>
                <span className="text-white">
                  {marketPills.sp500.value.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </span>
                <span
                  className={
                    marketPills.sp500.changePercent >= 0
                      ? "text-[#10B981]"
                      : "text-[#F43F5E]"
                  }
                >
                  {formatSignedPct(marketPills.sp500.changePercent)}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#12161F] px-3 py-1 font-mono text-xs tabular-nums">
                <span className="text-slate-400">Nasdaq</span>
                <span className="text-white">
                  {marketPills.nasdaq.value.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </span>
                <span
                  className={
                    marketPills.nasdaq.changePercent >= 0
                      ? "text-[#10B981]"
                      : "text-[#F43F5E]"
                  }
                >
                  {formatSignedPct(marketPills.nasdaq.changePercent)}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#12161F] px-3 py-1 font-mono text-xs tabular-nums">
                <span className="text-slate-400">10Y Yield</span>
                <span className="text-white">
                  {marketPills.tenYear.value.toFixed(2)}%
                </span>
              </div>

              <div
                title={`ETH $${formatPrice(cryptoTicks.ETH.price)} (${formatSignedPct(cryptoTicks.ETH.changePct)}) · SOL $${formatPrice(cryptoTicks.SOL.price)} (${formatSignedPct(cryptoTicks.SOL.changePct)})`}
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#12161F] px-3 py-1 font-mono text-xs tabular-nums"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                <span className="text-slate-400">BTC</span>
                <span className="text-white">
                  ${cryptoTicks.BTC.price.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
                <span
                  className={
                    cryptoTicks.BTC.changePct >= 0
                      ? "text-[#10B981]"
                      : "text-[#F43F5E]"
                  }
                >
                  {formatSignedPct(cryptoTicks.BTC.changePct)}
                </span>
              </div>
            </div>

            {/* Workspace Controls: 1x2 Split-Screen + Ask AI Analyst */}
            <div className="flex items-center gap-2.5">
              {mode === "research" && (
                <button
                  type="button"
                  onClick={() => setSplitScreen((v) => !v)}
                  title="Toggle 1x2 Split-Screen Workspace"
                  aria-label="Toggle 1x2 Split-Screen"
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                    splitScreen
                      ? "border-[#FF9900]/60 bg-[#FF9900]/10 text-[#FF9900]"
                      : "border-white/[0.08] bg-[#12161F] text-slate-300 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <Columns2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">1×2</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setAiOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#3B82F6] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#2563EB]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ask AI Analyst
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6">
          {mode === "screener" ? (
            <div className="mx-auto max-w-7xl">{screenerContent}</div>
          ) : splitScreen ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#0B0E14] p-5">
                <TickerWorkspace
                  symbol={primarySymbol}
                  initialData={initialData}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  inWatchlist={inWatchlist}
                  onToggleWatchlist={toggleWatchlist}
                  isSplit
                  paneLabel="Pane 1"
                  linkGroup={primaryGroup}
                  onChangeLinkGroup={setPrimaryGroup}
                />
              </div>

              <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#0B0E14] p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">
                    Secondary Ticker:
                  </span>
                  <select
                    aria-label="Secondary pane ticker"
                    value={secondarySymbol}
                    onChange={(e) => setSecondarySymbol(e.target.value)}
                    className="rounded border border-white/[0.1] bg-[#12161F] px-2.5 py-1 font-mono text-xs text-white outline-none"
                  >
                    {COMMAND_SYMBOLS.map((s) => (
                      <option key={s.symbol} value={s.symbol}>
                        {s.symbol} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <TickerWorkspace
                  symbol={secondarySymbol}
                  activeTab={secondaryTab}
                  onTabChange={setSecondaryTab}
                  inWatchlist={watchlist.some(
                    (w) => w.symbol === secondarySymbol
                  )}
                  onToggleWatchlist={toggleWatchlist}
                  isSplit
                  paneLabel="Pane 2"
                  linkGroup={secondaryGroup}
                  onChangeLinkGroup={setSecondaryGroup}
                />
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-7xl">
              <TickerWorkspace
                symbol={primarySymbol}
                initialData={initialData}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                inWatchlist={inWatchlist}
                onToggleWatchlist={toggleWatchlist}
              />
            </div>
          )}
        </main>
      </div>

      {/* Collapsible Watchlist Drawer (Closed by default) */}
      {watchlistOpen && (
        <aside className="fixed inset-y-0 left-16 z-40 flex w-72 flex-col border-r border-white/[0.1] bg-[#0B0E14] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h2 className="text-sm font-semibold text-white">Watchlist</h2>
            <button
              type="button"
              aria-label="Close Watchlist"
              onClick={() => setWatchlistOpen(false)}
              className="rounded p-1 text-slate-400 hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
            {watchlist.length === 0 ? (
              <div className="text-xs text-slate-500">
                No tickers saved yet. Click Star on any ticker header.
              </div>
            ) : (
              watchlist.map((item) => (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#12161F] px-3 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setWatchlistOpen(false);
                      router.push(`/terminal/${encodeURIComponent(item.symbol)}`);
                    }}
                    className="text-left"
                  >
                    <div className="font-mono text-xs font-semibold text-white">
                      {item.symbol}
                    </div>
                    <div className="max-w-[115px] truncate text-[11px] text-slate-400">
                      {item.name}
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
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
