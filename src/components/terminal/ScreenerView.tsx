"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { formatPrice, formatSignedPct } from "@/lib/format";
import { ScreenerRow } from "@/lib/types";

interface ScreenerViewProps {
  initialRows: ScreenerRow[];
}

type PresetId =
  | "all"
  | "undervalued_quality"
  | "seasonality_75"
  | "insider_buying";

export function ScreenerView({ initialRows }: ScreenerViewProps) {
  const router = useRouter();
  const [rows, setRows] = useState<ScreenerRow[]>(initialRows);
  const [preset, setPreset] = useState<PresetId>("all");
  const [loading, setLoading] = useState(false);

  // Granular Filters Slide-Over Drawer (closed by default)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minUpside, setMinUpside] = useState(-50);
  const [minPiotroski, setMinPiotroski] = useState(0);
  const [minWinRate, setMinWinRate] = useState(0);
  const [assetClass, setAssetClass] = useState("all");
  const [insiderBuyOnly, setInsiderBuyOnly] = useState(false);

  const runPreset = async (nextPreset: PresetId) => {
    setPreset(nextPreset);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/screener?preset=${encodeURIComponent(nextPreset)}`
      );
      if (res.ok) {
        const json = (await res.json()) as { rows?: ScreenerRow[] };
        if (json.rows) setRows(json.rows);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyCustomFilters = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreset("all");
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        preset: "all",
        minUpside: String(minUpside),
        minPiotroski: String(minPiotroski),
        minWinRate: String(minWinRate),
        assetClass,
        insiderBuyOnly: String(insiderBuyOnly),
      });
      const res = await fetch(`/api/screener?${qs.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as { rows?: ScreenerRow[] };
        if (json.rows) setRows(json.rows);
      }
      setFiltersOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Multi-Asset Discovery Screener
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Filter equities, FX, crypto, and commodities by deterministic fair
            value, 30-year seasonality, and smart-money flow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-[#12161F] px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-white/25 hover:text-white"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#3B82F6]" />
          Filters
        </button>
      </div>

      {/* 3 One-Click Preset Pills (+ All) */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => runPreset("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            preset === "all"
              ? "bg-white/[0.14] text-white"
              : "border border-white/[0.08] bg-[#12161F] text-slate-300 hover:border-white/20"
          }`}
        >
          All Tracked Assets ({initialRows.length})
        </button>

        <button
          type="button"
          onClick={() => runPreset("undervalued_quality")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            preset === "undervalued_quality"
              ? "bg-[#3B82F6] text-white"
              : "border border-white/[0.08] bg-[#12161F] text-slate-300 hover:border-white/20"
          }`}
        >
          Undervalued + High Quality
        </button>

        <button
          type="button"
          onClick={() => runPreset("seasonality_75")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            preset === "seasonality_75"
              ? "bg-[#3B82F6] text-white"
              : "border border-white/[0.08] bg-[#12161F] text-slate-300 hover:border-white/20"
          }`}
        >
          Strong Upcoming Seasonality (&gt;75% Win Rate)
        </button>

        <button
          type="button"
          onClick={() => runPreset("insider_buying")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            preset === "insider_buying"
              ? "bg-[#3B82F6] text-white"
              : "border border-white/[0.08] bg-[#12161F] text-slate-300 hover:border-white/20"
          }`}
        >
          Recent Insider Buying
        </button>
      </div>

      {/* Clean 5-Column Results Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#12161F]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs text-slate-400">
                <th className="px-6 py-4 font-medium">Ticker &amp; Name</th>
                <th className="px-6 py-4 text-right font-mono font-medium">
                  Price
                </th>
                <th className="px-6 py-4 text-right font-mono font-medium">
                  Fair Value Upside
                </th>
                <th className="px-6 py-4 text-right font-mono font-medium">
                  30D Seasonality
                </th>
                <th className="px-6 py-4 text-right font-medium">
                  Smart Money Signal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-slate-400"
                  >
                    Screening universe...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-slate-400"
                  >
                    No assets match the current filter criteria.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.symbol}
                    onClick={() =>
                      router.push(`/terminal/${encodeURIComponent(r.symbol)}`)
                    }
                    className="cursor-pointer transition hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded bg-white/[0.06] px-2 py-0.5 font-mono text-xs font-semibold text-white">
                          {r.symbol}
                        </span>
                        <div>
                          <div className="font-medium text-white">
                            {r.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {r.sector}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right font-mono tabular-nums">
                      <div className="font-medium text-white">
                        {r.assetClass === "fx" ? "" : "$"}
                        {formatPrice(r.price, r.symbol)}
                      </div>
                      <div
                        className={`text-xs ${
                          r.changePercent >= 0
                            ? "text-[#10B981]"
                            : "text-[#F43F5E]"
                        }`}
                      >
                        {formatSignedPct(r.changePercent)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right font-mono tabular-nums">
                      {r.assetClass === "equity" ? (
                        <div>
                          <div
                            className={`font-medium ${
                              r.fairValueUpside >= 0
                                ? "text-[#10B981]"
                                : "text-[#F43F5E]"
                            }`}
                          >
                            {formatSignedPct(r.fairValueUpside)}
                          </div>
                          <div className="text-xs text-slate-400">
                            F-Score {r.piotroskiScore}/9
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Spot</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right font-mono tabular-nums">
                      <div className="font-medium text-white">
                        {r.seasonality30DWinRate.toFixed(1)}% Win
                      </div>
                      <div
                        className={`text-xs ${
                          r.seasonality30DAvgReturn >= 0
                            ? "text-[#10B981]"
                            : "text-[#F43F5E]"
                        }`}
                      >
                        {formatSignedPct(r.seasonality30DAvgReturn)} avg
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          r.smartMoneyTone === "bullish"
                            ? "bg-[#10B981]/15 text-[#10B981]"
                            : r.smartMoneyTone === "bearish"
                              ? "bg-[#F43F5E]/15 text-[#F43F5E]"
                              : "bg-white/[0.08] text-slate-300"
                        }`}
                      >
                        {r.smartMoneySignal}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Granular Filters Slide-Over Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={applyCustomFilters}
            className="flex h-full w-full max-w-sm flex-col border-l border-white/[0.1] bg-[#0B0E14] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h2 className="text-sm font-semibold text-white">
                Granular Screener Filters
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex-1 space-y-5 text-xs">
              <div>
                <label className="mb-1.5 block text-slate-300">
                  Asset Class
                </label>
                <select
                  value={assetClass}
                  onChange={(e) => setAssetClass(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.1] bg-[#12161F] px-3 py-2 text-white outline-none"
                >
                  <option value="all">All Asset Classes</option>
                  <option value="equity">Equities</option>
                  <option value="fx">Foreign Exchange</option>
                  <option value="crypto">Digital Assets</option>
                  <option value="commodity">Commodities</option>
                </select>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-slate-300">
                  <span>Min Fair Value Upside</span>
                  <span className="font-mono text-white">{minUpside}%</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={40}
                  value={minUpside}
                  onChange={(e) => setMinUpside(Number(e.target.value))}
                  className="w-full accent-[#3B82F6]"
                />
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-slate-300">
                  <span>Min Piotroski F-Score</span>
                  <span className="font-mono text-white">{minPiotroski}/9</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={9}
                  value={minPiotroski}
                  onChange={(e) => setMinPiotroski(Number(e.target.value))}
                  className="w-full accent-[#3B82F6]"
                />
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-slate-300">
                  <span>Min 30D Seasonality Win Rate</span>
                  <span className="font-mono text-white">{minWinRate}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  value={minWinRate}
                  onChange={(e) => setMinWinRate(Number(e.target.value))}
                  className="w-full accent-[#3B82F6]"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-white/[0.08] bg-[#12161F] p-3 text-slate-200">
                <input
                  type="checkbox"
                  checked={insiderBuyOnly}
                  onChange={(e) => setInsiderBuyOnly(e.target.checked)}
                  className="h-4 w-4 accent-[#3B82F6]"
                />
                Require recent Form 4 insider buys
              </label>
            </div>

            <div className="flex gap-3 border-t border-white/[0.08] pt-4">
              <button
                type="button"
                onClick={() => {
                  setMinUpside(-50);
                  setMinPiotroski(0);
                  setMinWinRate(0);
                  setAssetClass("all");
                  setInsiderBuyOnly(false);
                }}
                className="flex-1 rounded-lg border border-white/[0.1] py-2 text-xs text-slate-300 hover:text-white"
              >
                Reset
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#3B82F6] py-2 text-xs font-medium text-white hover:bg-[#2563EB]"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
