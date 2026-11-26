"use client";

import React, { useMemo, useState } from "react";
import type * as echarts from "echarts";
import { AlertCircle } from "lucide-react";
import { EChartsBox } from "@/components/terminal/EChartsBox";
import { formatCompactCurrency, formatSignedPct } from "@/lib/format";
import { SmartMoneyResponse } from "@/lib/types";

interface SmartMoneyTabProps {
  smartMoney: SmartMoneyResponse;
}

export function SmartMoneyTab({ smartMoney }: SmartMoneyTabProps) {
  const [feedFilter, setFeedFilter] = useState<"all" | "Buy" | "Sell">("all");

  const cotOption = useMemo<echarts.EChartsOption>(() => {
    const dates = smartMoney.cotSeries.map((c) => c.date);
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0B0E14",
        borderColor: "rgba(255,255,255,0.12)",
        textStyle: { color: "#E2E8F0", fontSize: 12 },
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: "#94A3B8", fontSize: 11 },
      },
      grid: { left: 56, right: 20, top: 38, bottom: 30 },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
        axisLabel: { color: "#94A3B8", fontSize: 10, interval: 8 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
        axisLabel: {
          color: "#94A3B8",
          fontSize: 11,
          formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        },
      },
      series: [
        {
          name: "Commercial Hedgers",
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2, color: "#3B82F6" },
          itemStyle: { color: "#3B82F6" },
          data: smartMoney.cotSeries.map((c) => c.commercialNet),
        },
        {
          name: "Large Speculators",
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2.2, color: "#10B981" },
          itemStyle: { color: "#10B981" },
          data: smartMoney.cotSeries.map((c) => c.largeSpecNet),
        },
        {
          name: "Small Traders",
          type: "bar",
          itemStyle: { color: "rgba(255, 153, 0, 0.35)" },
          data: smartMoney.cotSeries.map((c) => c.smallTraderNet),
        },
      ],
    };
  }, [smartMoney]);

  const filteredInsiders = smartMoney.insiderTrades.filter((t) =>
    feedFilter === "all" ? true : t.transactionType === feedFilter
  );

  const latestCot = smartMoney.cotSeries[smartMoney.cotSeries.length - 1];

  return (
    <div className="space-y-6">
      {/* CFTC COT Chart */}
      <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-white">
              CFTC Commitment of Traders · {smartMoney.cotAssetName}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              52-week net contract positioning across Commercials, Large
              Speculators, and Small Traders
            </p>
          </div>

          {latestCot && (
            <div className="flex gap-4 font-mono text-xs tabular-nums">
              <span className="text-[#3B82F6]">
                Comm: {latestCot.commercialPercentile}th pct
              </span>
              <span className="text-[#10B981]">
                Spec: {latestCot.largeSpecPercentile}th pct
              </span>
            </div>
          )}
        </div>

        {smartMoney.cotExtremeAlert && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#3B82F6]/10 px-3.5 py-2.5 text-xs text-[#93C5FD]">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#3B82F6]" />
            <span>{smartMoney.cotExtremeAlert}</span>
          </div>
        )}

        <EChartsBox option={cotOption} height={310} />
      </div>

      {/* Form 4 Insiders + US Congress Disclosures */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
              SEC Form 4 Insider Trades
            </h3>
            <div className="flex gap-1 text-xs">
              {(["all", "Buy", "Sell"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFeedFilter(f)}
                  className={`rounded px-2.5 py-1 transition ${
                    feedFilter === f
                      ? "bg-white/[0.1] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          </div>

          {filteredInsiders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No SEC Form 4 insider equity transactions for this asset class.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filteredInsiders.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 py-3 text-xs"
                >
                  <div>
                    <div className="font-medium text-slate-200">
                      {t.insiderName}{" "}
                      <span className="font-normal text-slate-400">
                        · {t.role}
                      </span>
                    </div>
                    <div className="mt-0.5 font-mono text-slate-500">
                      {t.date} · {t.shares.toLocaleString()} shs @ ${t.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-mono font-medium tabular-nums ${
                        t.transactionType === "Buy"
                          ? "text-[#10B981]"
                          : "text-[#F43F5E]"
                      }`}
                    >
                      {t.transactionType} {formatCompactCurrency(t.valueUsd)}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                      Post-trade {formatSignedPct(t.postTradeReturnPct)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
              US Congress Disclosures
            </h3>
            <span className="text-xs text-slate-500">STOCK Act Filings</span>
          </div>

          {smartMoney.congressTrades.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent Congressional disclosures logged for this symbol.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {smartMoney.congressTrades.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 py-3 text-xs"
                >
                  <div>
                    <div className="font-medium text-slate-200">
                      {c.politician}{" "}
                      <span className="font-mono text-slate-400">
                        ({c.party} · {c.chamber})
                      </span>
                    </div>
                    <div className="mt-0.5 font-mono text-slate-500">
                      {c.date} · {c.amountRange}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-mono font-medium ${
                        c.transactionType === "Purchase"
                          ? "text-[#10B981]"
                          : "text-[#F43F5E]"
                      }`}
                    >
                      {c.transactionType}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                      Post-trade {formatSignedPct(c.postTradeReturnPct)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
