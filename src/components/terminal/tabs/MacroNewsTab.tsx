"use client";

import React, { useEffect, useMemo, useState } from "react";
import type * as echarts from "echarts";
import { ExternalLink } from "lucide-react";
import { EChartsBox } from "@/components/terminal/EChartsBox";
import { formatSignedPct } from "@/lib/format";
import { MacroIndicator, MarketHeadline } from "@/lib/types";

interface MacroPayload {
  indices: Array<{
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
  }>;
  macroIndicators: MacroIndicator[];
  macroSource: string;
  headlines: MarketHeadline[];
}

export function MacroNewsTab() {
  const [data, setData] = useState<MacroPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/macro")
      .then((r) => r.json())
      .then((json: MacroPayload) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  const yieldCurveOption = useMemo<echarts.EChartsOption>(() => {
    if (!data) return {};
    const d10 = data.macroIndicators.find((m) => m.id === "DGS10");
    const d2 = data.macroIndicators.find((m) => m.id === "DGS2");
    const ff = data.macroIndicators.find((m) => m.id === "FEDFUNDS");
    const dates = d10?.history.map((h) => h.date) ?? [];

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
      grid: { left: 45, right: 20, top: 36, bottom: 26 },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
        axisLabel: { color: "#94A3B8", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        scale: true,
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.05)" } },
        axisLabel: {
          color: "#94A3B8",
          fontSize: 11,
          formatter: (v: number) => `${v.toFixed(2)}%`,
        },
      },
      series: [
        {
          name: "10Y Yield (DGS10)",
          type: "line",
          smooth: true,
          lineStyle: { width: 2.2, color: "#10B981" },
          itemStyle: { color: "#10B981" },
          data: d10?.history.map((h) => h.value) ?? [],
        },
        {
          name: "2Y Yield (DGS2)",
          type: "line",
          smooth: true,
          lineStyle: { width: 2, color: "#3B82F6" },
          itemStyle: { color: "#3B82F6" },
          data: d2?.history.map((h) => h.value) ?? [],
        },
        {
          name: "Fed Funds",
          type: "line",
          smooth: true,
          lineStyle: { width: 1.6, type: "dashed", color: "#FF9900" },
          itemStyle: { color: "#FF9900" },
          data: ff?.history.map((h) => h.value) ?? [],
        },
      ],
    };
  }, [data]);

  if (loading || !data) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6 text-sm text-slate-400">
        Loading FRED macro series &amp; global indices...
      </div>
    );
  }

  const d10 = data.macroIndicators.find((m) => m.id === "DGS10")?.value ?? 4.24;
  const d2 = data.macroIndicators.find((m) => m.id === "DGS2")?.value ?? 4.01;
  const spreadBps = Math.round((d10 - d2) * 100);

  return (
    <div className="space-y-6">
      {/* World Indices */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.indices.map((idx) => (
          <div
            key={idx.symbol}
            className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#12161F] p-5"
          >
            <div>
              <div className="font-mono text-xs text-slate-400">
                {idx.symbol}
              </div>
              <div className="mt-0.5 text-sm font-medium text-white">
                {idx.name}
              </div>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div className="text-base font-semibold text-white">
                {idx.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div
                className={`text-xs ${
                  idx.changePercent >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
                }`}
              >
                {formatSignedPct(idx.changePercent)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FRED Treasury Yields + Spread */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-white">
                US Treasury Rates &amp; Policy Trajectory (FRED)
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                2s10s Yield Curve Spread:{" "}
                <span
                  className={`font-mono font-medium ${
                    spreadBps >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
                  }`}
                >
                  {spreadBps > 0 ? `+${spreadBps}` : spreadBps} bps
                </span>
              </p>
            </div>
            <span className="font-mono text-[11px] uppercase text-slate-500">
              FRED · {data.macroSource}
            </span>
          </div>
          <EChartsBox option={yieldCurveOption} height={260} />
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
          <h3 className="text-sm font-medium text-white">Macro Indicators</h3>
          <div className="mt-4 divide-y divide-white/[0.06]">
            {data.macroIndicators.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <div>
                  <div className="text-slate-200">{m.label}</div>
                  <div className="font-mono text-[11px] text-slate-500">
                    {m.id} · {m.date}
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-sm font-semibold text-white">
                    {typeof m.value === "number" && Number.isFinite(m.value)
                      ? m.value.toFixed(2)
                      : "—"}
                    {m.unit}
                  </div>
                  <div
                    className={`text-[11px] ${
                      (m.change ?? 0) >= 0 ? "text-[#10B981]" : "text-[#F43F5E]"
                    }`}
                  >
                    {typeof m.change === "number" && Number.isFinite(m.change)
                      ? `${m.change > 0 ? "+" : ""}${m.change.toFixed(2)}`
                      : "0.00"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Headlines */}
      <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
        <h3 className="mb-4 text-sm font-medium text-white">
          Top Institutional Headlines
        </h3>
        <div className="divide-y divide-white/[0.06]">
          {data.headlines.map((h) => (
            <a
              key={h.id}
              href={h.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-4 py-3.5 transition hover:bg-white/[0.02]"
            >
              <div>
                <div className="text-sm font-medium text-slate-200">
                  {h.title}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span>{h.source}</span>
                  <span>·</span>
                  <span className="font-mono">
                    {h.relatedTickers.join(", ")}
                  </span>
                </div>
              </div>
              <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-500" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
