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
    // Default: show 10 strikes closest to spot (+/- 5 strikes)
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
      <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6 text-sm text-slate-400">
        Loading options chain for {symbol}...
      </div>
    );
  }

  if (!chain) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6 text-sm text-slate-400">
        Options chain unavailable for {symbol}.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400">Expiration</label>
          <select
            aria-label="Option expiration date"
            value={selectedExp}
            onChange={(e) => loadChain(e.target.value)}
            className="rounded-lg border border-white/[0.1] bg-[#0B0E14] px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-[#3B82F6]"
          >
            {chain.expirations.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>
            Underlying:{" "}
            <strong className="font-mono text-white">
              {formatPrice(chain.underlyingPrice, symbol)}
            </strong>
          </span>
          <span className="font-mono uppercase text-slate-500">
            {chain.source}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-right font-mono text-xs tabular-nums">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-slate-400">
              <th colSpan={5} className="pb-2 text-center text-[#10B981]">
                Calls
              </th>
              <th className="bg-white/[0.04] px-3 pb-2 text-center text-white">
                Strike
              </th>
              <th colSpan={5} className="pb-2 text-center text-[#F43F5E]">
                Puts
              </th>
            </tr>
            <tr className="border-b border-white/[0.08] text-[11px] text-slate-500">
              <th className="py-2 pr-2">IV</th>
              <th className="px-2 py-2">OI</th>
              <th className="px-2 py-2">Vol</th>
              <th className="px-2 py-2">Last</th>
              <th className="px-2 py-2">Bid / Ask</th>
              <th className="bg-white/[0.04] px-3 py-2 text-center text-slate-300">
                $
              </th>
              <th className="px-2 py-2">Bid / Ask</th>
              <th className="px-2 py-2">Last</th>
              <th className="px-2 py-2">Vol</th>
              <th className="px-2 py-2">OI</th>
              <th className="py-2 pl-2">IV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {pairedRows.map(({ strike, call, put }) => (
              <tr key={strike} className="hover:bg-white/[0.02]">
                {/* Call side */}
                <td
                  className={`py-2.5 pr-2 ${
                    call?.inTheMoney ? "bg-[#10B981]/[0.06] text-slate-200" : "text-slate-400"
                  }`}
                >
                  {call ? `${call.impliedVolatility.toFixed(1)}%` : "—"}
                </td>
                <td
                  className={`px-2 py-2.5 ${
                    call?.inTheMoney ? "bg-[#10B981]/[0.06] text-slate-300" : "text-slate-400"
                  }`}
                >
                  {call ? call.openInterest.toLocaleString() : "—"}
                </td>
                <td
                  className={`px-2 py-2.5 ${
                    call?.inTheMoney ? "bg-[#10B981]/[0.06] text-slate-300" : "text-slate-400"
                  }`}
                >
                  {call ? call.volume.toLocaleString() : "—"}
                </td>
                <td
                  className={`px-2 py-2.5 font-medium ${
                    call?.inTheMoney ? "bg-[#10B981]/[0.06] text-white" : "text-slate-200"
                  }`}
                >
                  {call ? call.lastPrice.toFixed(2) : "—"}
                </td>
                <td
                  className={`px-2 py-2.5 ${
                    call?.inTheMoney ? "bg-[#10B981]/[0.06] text-slate-300" : "text-slate-400"
                  }`}
                >
                  {call ? `${call.bid.toFixed(2)} / ${call.ask.toFixed(2)}` : "—"}
                </td>

                {/* Strike */}
                <td className="bg-white/[0.04] px-3 py-2.5 text-center font-semibold text-white">
                  {strike.toFixed(symbol === "EURUSD" ? 4 : 2)}
                </td>

                {/* Put side */}
                <td
                  className={`px-2 py-2.5 ${
                    put?.inTheMoney ? "bg-[#F43F5E]/[0.06] text-slate-300" : "text-slate-400"
                  }`}
                >
                  {put ? `${put.bid.toFixed(2)} / ${put.ask.toFixed(2)}` : "—"}
                </td>
                <td
                  className={`px-2 py-2.5 font-medium ${
                    put?.inTheMoney ? "bg-[#F43F5E]/[0.06] text-white" : "text-slate-200"
                  }`}
                >
                  {put ? put.lastPrice.toFixed(2) : "—"}
                </td>
                <td
                  className={`px-2 py-2.5 ${
                    put?.inTheMoney ? "bg-[#F43F5E]/[0.06] text-slate-300" : "text-slate-400"
                  }`}
                >
                  {put ? put.volume.toLocaleString() : "—"}
                </td>
                <td
                  className={`px-2 py-2.5 ${
                    put?.inTheMoney ? "bg-[#F43F5E]/[0.06] text-slate-300" : "text-slate-400"
                  }`}
                >
                  {put ? put.openInterest.toLocaleString() : "—"}
                </td>
                <td
                  className={`py-2.5 pl-2 ${
                    put?.inTheMoney ? "bg-[#F43F5E]/[0.06] text-slate-200" : "text-slate-400"
                  }`}
                >
                  {put ? `${put.impliedVolatility.toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show full chain toggle at bottom */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-slate-400">
        <span>
          Showing {pairedRows.length} strikes{" "}
          {!showFullChain ? "(±5 strikes around spot)" : "(full chain)"}
        </span>
        <button
          type="button"
          onClick={() => setShowFullChain((v) => !v)}
          className="rounded-md border border-white/[0.1] bg-[#0B0E14] px-3 py-1.5 font-medium text-slate-200 transition hover:border-white/25 hover:text-white"
        >
          {showFullChain ? "Filter to ±5 strikes" : "Show full chain"}
        </button>
      </div>
    </div>
  );
}
