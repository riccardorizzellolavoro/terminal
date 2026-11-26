"use client";

import React, { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { OptionContract, OptionsChainResponse } from "@/lib/types";

interface OptionsTabProps {
  symbol: string;
}

export function OptionsTab({ symbol }: OptionsTabProps) {
  const [chain, setChain] = useState<OptionsChainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExp, setSelectedExp] = useState<string>("");
  const [showFullChain, setShowFullChain] = useState(false);

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
        Loading options chain for {symbol}...
      </div>
    );
  }

  if (!chain) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6 text-sm text-slate-400">
        Options chain unavailable for {symbol}.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400">Expiration</label>
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

        <div className="text-xs text-slate-400">
          Spot{" "}
          <span className="font-mono font-medium text-white tabular-nums">
            {formatPrice(chain.underlyingPrice, symbol)}
          </span>
        </div>
      </div>

      {/* 5-Column Side-by-Side Calls / Puts Chain */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-right font-mono text-sm tabular-nums">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs text-slate-400">
              <th className="py-3 pr-3 font-medium">Call Bid / Ask · OI</th>
              <th className="px-3 py-3 font-medium">Call Last · IV</th>
              <th className="bg-white/[0.03] px-4 py-3 text-center font-medium text-white">
                Strike
              </th>
              <th className="px-3 py-3 text-left font-medium">Put Last · IV</th>
              <th className="py-3 pl-3 text-left font-medium">
                Put Bid / Ask · OI
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
                    <div>
                      <div>
                        {call.bid.toFixed(2)} / {call.ask.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        OI {call.openInterest.toLocaleString()}
                      </div>
                    </div>
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
                  {strike.toFixed(symbol === "EURUSD" ? 4 : 2)}
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
                    <div>
                      <div>
                        {put.bid.toFixed(2)} / {put.ask.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        OI {put.openInterest.toLocaleString()}
                      </div>
                    </div>
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
          Showing {pairedRows.length} strikes{" "}
          {!showFullChain ? "(±5 around spot)" : "(full chain)"}
        </span>
        <button
          type="button"
          onClick={() => setShowFullChain((v) => !v)}
          className="rounded-md border border-white/[0.08] px-3 py-1.5 text-slate-200 transition hover:bg-white/[0.04] hover:text-white"
        >
          {showFullChain ? "Filter to ±5 strikes" : "Show full chain"}
        </button>
      </div>
    </div>
  );
}
