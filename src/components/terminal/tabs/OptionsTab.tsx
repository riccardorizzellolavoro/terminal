"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { TermHelp } from "@/components/ui/TermHelp";
import { formatPrice } from "@/lib/format";
import { OptionContract, OptionsChainResponse } from "@/lib/types";

interface OptionsTabProps {
  symbol: string;
}

export function OptionsTab({ symbol }: OptionsTabProps) {
  const { t } = useLanguage();
  const [chain, setChain] = useState<OptionsChainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExp, setSelectedExp] = useState<string>("");
  const [showFullChain, setShowFullChain] = useState(false);
  const [showGreeks, setShowGreeks] = useState(false);

  const loadChain = async (exp?: string) => {
    setLoading(true);
    try {
      const qs = exp ? `?expiration=${encodeURIComponent(exp)}` : "";
      const res = await fetch(`/api/options/${encodeURIComponent(symbol)}${qs}`);
      if (res.ok) {
        const json = (await res.json()) as OptionsChainResponse;
        setChain(json);
        setSelectedExp(json.selectedExpiration);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowFullChain(false);
    loadChain();
  }, [symbol]);

  const pairedRows = useMemo(() => {
    if (!chain) return [];
    const callByStrike = new Map<number, OptionContract>();
    const putByStrike = new Map<number, OptionContract>();
    for (const c of chain.calls) callByStrike.set(c.strike, c);
    for (const p of chain.puts) putByStrike.set(p.strike, p);

    const allStrikes = Array.from(
      new Set([...callByStrike.keys(), ...putByStrike.keys()])
    ).sort((a, b) => a - b);

    const spot = chain.underlyingPrice;
    let visibleStrikes = allStrikes;
    if (!showFullChain && allStrikes.length > 10) {
      let closestIdx = 0;
      let minDist = Infinity;
      allStrikes.forEach((s, idx) => {
        const d = Math.abs(s - spot);
        if (d < minDist) {
          minDist = d;
          closestIdx = idx;
        }
      });
      const start = Math.max(0, closestIdx - 5);
      const end = Math.min(allStrikes.length, start + 10);
      visibleStrikes = allStrikes.slice(Math.max(0, end - 10), end);
    }

    return visibleStrikes.map((strike) => ({
      strike,
      call: callByStrike.get(strike) ?? null,
      put: putByStrike.get(strike) ?? null,
    }));
  }, [chain, showFullChain]);

  if (loading && !chain) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6 text-sm text-slate-400">
        {t.options.loading}
      </div>
    );
  }

  if (!chain) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6 text-sm text-slate-400">
        {t.options.unavailable}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">
              {t.options.expiration}
            </label>
            <select
              aria-label="Option expiration date"
              value={selectedExp}
              onChange={(e) => loadChain(e.target.value)}
              className="rounded-lg border border-white/[0.08] bg-[#0B0E14] px-3 py-1.5 font-mono text-xs text-white outline-none"
            >
              {chain.expirations.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={showGreeks}
              onChange={(e) => setShowGreeks(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#3B82F6]"
            />
            <span>{t.options.showGreeks}</span>
            <TermHelp termKey="delta" />
            <TermHelp termKey="theta" />
            <TermHelp termKey="vega" />
            <TermHelp termKey="gamma" />
          </label>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>
            {t.options.spot}{" "}
            <span className="font-mono font-medium text-white tabular-nums">
              {formatPrice(chain.underlyingPrice, symbol)}
            </span>
          </span>
          <TermHelp termKey="inTheMoney" />
        </div>
      </div>

      {/* 5-Column Side-by-Side Calls / Puts Chain */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-right font-mono text-sm tabular-nums">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs text-slate-400">
              <th className="py-3 pr-3 font-medium">
                {showGreeks ? t.options.greeksCall : t.options.callBidAskOi}
                <TermHelp termKey={showGreeks ? "delta" : "bidAskSpread"} />
                {!showGreeks && <TermHelp termKey="openInterest" />}
              </th>
              <th className="px-3 py-3 font-medium">
                {t.options.callLastIv}
                <TermHelp termKey="callOption" />
                <TermHelp termKey="impliedVolatility" />
              </th>
              <th className="bg-white/[0.03] px-4 py-3 text-center font-medium text-white">
                {t.options.strike}
                <TermHelp termKey="strikePrice" />
              </th>
              <th className="px-3 py-3 text-left font-medium">
                {t.options.putLastIv}
                <TermHelp termKey="putOption" />
              </th>
              <th className="py-3 pl-3 text-left font-medium">
                {showGreeks ? t.options.greeksPut : t.options.putBidAskOi}
                <TermHelp termKey={showGreeks ? "gamma" : "openInterest"} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {pairedRows.map(({ strike, call, put }) => (
              <tr key={strike} className="h-12 hover:bg-white/[0.02]">
                <td
                  className={`py-2 pr-3 text-xs ${
                    call?.inTheMoney ? "bg-white/[0.03] text-slate-200" : "text-slate-400"
                  }`}
                >
                  {call ? (
                    showGreeks ? (
                      <div>
                        <div>
                          Δ {call.delta?.toFixed(2) ?? "—"} · Γ{" "}
                          {call.gamma?.toFixed(3) ?? "—"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Θ {call.theta?.toFixed(2) ?? "—"} · ν{" "}
                          {call.vega?.toFixed(2) ?? "—"}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div>
                          {call.bid.toFixed(2)} / {call.ask.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          OI {call.openInterest.toLocaleString()} · Vol{" "}
                          {call.volume.toLocaleString()}
                        </div>
                      </div>
                    )
                  ) : (
                    "—"
                  )}
                </td>

                <td
                  className={`px-3 py-2 ${
                    call?.inTheMoney ? "bg-white/[0.03] text-white" : "text-slate-200"
                  }`}
                >
                  {call ? (
                    <div>
                      <div className="font-medium">{call.lastPrice.toFixed(2)}</div>
                      <div className="text-[11px] text-slate-400">
                        {call.impliedVolatility.toFixed(1)}%
                      </div>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>

                <td className="bg-white/[0.04] px-4 py-2 text-center font-semibold text-white">
                  {strike.toFixed(symbol.endsWith("=X") ? 4 : 2)}
                </td>

                <td
                  className={`px-3 py-2 text-left ${
                    put?.inTheMoney ? "bg-white/[0.03] text-white" : "text-slate-200"
                  }`}
                >
                  {put ? (
                    <div>
                      <div className="font-medium">{put.lastPrice.toFixed(2)}</div>
                      <div className="text-[11px] text-slate-400">
                        {put.impliedVolatility.toFixed(1)}%
                      </div>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>

                <td
                  className={`py-2 pl-3 text-left text-xs ${
                    put?.inTheMoney ? "bg-white/[0.03] text-slate-200" : "text-slate-400"
                  }`}
                >
                  {put ? (
                    showGreeks ? (
                      <div>
                        <div>
                          Δ {put.delta?.toFixed(2) ?? "—"} · Γ{" "}
                          {put.gamma?.toFixed(3) ?? "—"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Θ {put.theta?.toFixed(2) ?? "—"} · ν{" "}
                          {put.vega?.toFixed(2) ?? "—"}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div>
                          {put.bid.toFixed(2)} / {put.ask.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          OI {put.openInterest.toLocaleString()} · Vol{" "}
                          {put.volume.toLocaleString()}
                        </div>
                      </div>
                    )
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs text-slate-400">
        <span>
          {t.options.showingStrikes} {pairedRows.length} {t.options.strikes}{" "}
          {!showFullChain ? t.options.aroundSpot : t.options.fullChain}
        </span>
        <button
          type="button"
          onClick={() => setShowFullChain((v) => !v)}
          className="rounded-md border border-white/[0.08] px-3 py-1.5 text-slate-200 transition hover:bg-white/[0.04] hover:text-white"
        >
          {showFullChain ? t.options.filterBtn : t.options.showFullBtn}
        </button>
      </div>
    </div>
  );
}
