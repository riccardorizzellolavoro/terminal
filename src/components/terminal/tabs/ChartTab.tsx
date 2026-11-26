"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  IChartApi,
  LineSeries,
} from "lightweight-charts";
import { SlidersHorizontal } from "lucide-react";
import { OhlcvBar } from "@/lib/types";

interface ChartTabProps {
  symbol: string;
  initialBars: OhlcvBar[];
}

type Timeframe = "1D" | "5D" | "1M" | "6M" | "1Y" | "5Y";

function computeSma(bars: OhlcvBar[], period: number) {
  const out: { time: string; value: number }[] = [];
  let sum = 0;
  for (let i = 0; i < bars.length; i++) {
    sum += bars[i].close;
    if (i >= period) sum -= bars[i - period].close;
    if (i >= period - 1) {
      out.push({ time: bars[i].time, value: Number((sum / period).toFixed(4)) });
    }
  }
  return out;
}

function computeRsi(bars: OhlcvBar[], period = 14) {
  if (bars.length <= period) return [];
  const out: { time: string; value: number }[] = [];
  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const diff = bars[i].close - bars[i - 1].close;
    if (diff >= 0) gainSum += diff;
    else lossSum -= diff;
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  const rs0 = avgLoss === 0 ? 100 : avgGain / avgLoss;
  out.push({
    time: bars[period].time,
    value: Number((100 - 100 / (1 + rs0)).toFixed(2)),
  });

  for (let i = period + 1; i < bars.length; i++) {
    const diff = bars[i].close - bars[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    out.push({
      time: bars[i].time,
      value: Number((100 - 100 / (1 + rs)).toFixed(2)),
    });
  }
  return out;
}

function computeMacd(bars: OhlcvBar[]) {
  const ema = (vals: number[], span: number) => {
    const k = 2 / (span + 1);
    const res: number[] = [vals[0] ?? 0];
    for (let i = 1; i < vals.length; i++) {
      res.push(vals[i] * k + res[i - 1] * (1 - k));
    }
    return res;
  };
  if (bars.length < 26) return [];
  const closes = bars.map((b) => b.close);
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = closes.map((_, i) => ema12[i] - ema26[i]);
  const signalLine = ema(macdLine, 9);
  return bars.slice(25).map((b, idx) => {
    const i = idx + 25;
    return {
      time: b.time,
      macd: Number(macdLine[i].toFixed(3)),
      signal: Number(signalLine[i].toFixed(3)),
      hist: Number((macdLine[i] - signalLine[i]).toFixed(3)),
    };
  });
}

export function ChartTab({ symbol, initialBars }: ChartTabProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y");
  const [bars, setBars] = useState<OhlcvBar[]>(initialBars);
  const [loading, setLoading] = useState(false);

  // Popover kept closed and indicators kept OFF by default
  const [indMenuOpen, setIndMenuOpen] = useState(false);
  const [sma20, setSma20] = useState(false);
  const [sma50, setSma50] = useState(false);
  const [sma200, setSma200] = useState(false);
  const [showRsi, setShowRsi] = useState(false);
  const [showMacd, setShowMacd] = useState(false);

  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const oscContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setBars(initialBars);
    setTimeframe("1Y");
  }, [symbol, initialBars]);

  const handleTimeframeChange = async (tf: Timeframe) => {
    setTimeframe(tf);
    setLoading(true);
    try {
      const fetchRange =
        sma200 && (tf === "1D" || tf === "5D" || tf === "1M" || tf === "6M")
          ? "1Y"
          : tf;
      const res = await fetch(
        `/api/ticker/${encodeURIComponent(symbol)}?section=chart&range=${fetchRange}`
      );
      if (res.ok) {
        const json = (await res.json()) as { bars?: OhlcvBar[] };
        if (json.bars?.length) setBars(json.bars);
      }
    } finally {
      setLoading(false);
    }
  };

  const rsiData = useMemo(() => (showRsi ? computeRsi(bars, 14) : []), [bars, showRsi]);
  const macdData = useMemo(() => (showMacd ? computeMacd(bars) : []), [bars, showMacd]);

  useEffect(() => {
    const el = mainContainerRef.current;
    if (!el || bars.length === 0) return;

    const chart: IChartApi = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "#12161F" },
        textColor: "#94A3B8",
        fontFamily: "JetBrains Mono, monospace",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
      },
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.22)" },
        horzLine: { color: "rgba(255,255,255,0.22)" },
      },
      width: el.clientWidth,
      height: 440,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10B981",
      downColor: "#F43F5E",
      borderVisible: false,
      wickUpColor: "#10B981",
      wickDownColor: "#F43F5E",
    });

    candleSeries.setData(
      bars.map((b) => ({
        time: b.time,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      }))
    );

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeries.setData(
      bars.map((b) => ({
        time: b.time,
        value: b.volume,
        color:
          b.close >= b.open
            ? "rgba(16, 185, 129, 0.25)"
            : "rgba(244, 63, 94, 0.25)",
      }))
    );

    if (sma20) {
      const s20 = chart.addSeries(LineSeries, {
        color: "#3B82F6",
        lineWidth: 1,
        title: "SMA 20",
      });
      s20.setData(computeSma(bars, 20));
    }
    if (sma50) {
      const s50 = chart.addSeries(LineSeries, {
        color: "#FF9900",
        lineWidth: 1,
        title: "SMA 50",
      });
      s50.setData(computeSma(bars, 50));
    }
    if (sma200) {
      const s200 = chart.addSeries(LineSeries, {
        color: "#A855F7",
        lineWidth: 1,
        title: "SMA 200",
      });
      s200.setData(computeSma(bars, 200));
    }

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0) {
        chart.applyOptions({ width: el.clientWidth });
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [bars, sma20, sma50, sma200]);

  // Optional Oscillator Sub-pane when RSI or MACD enabled
  useEffect(() => {
    const el = oscContainerRef.current;
    if (!el || (!showRsi && !showMacd) || bars.length === 0) return;

    const oscChart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "#12161F" },
        textColor: "#94A3B8",
        fontFamily: "JetBrains Mono, monospace",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
      timeScale: { borderColor: "rgba(255,255,255,0.08)" },
      width: el.clientWidth,
      height: 150,
    });

    if (showRsi && rsiData.length) {
      const rsiSeries = oscChart.addSeries(LineSeries, {
        color: "#3B82F6",
        lineWidth: 2,
        title: "RSI(14)",
      });
      rsiSeries.setData(rsiData);
    }

    if (showMacd && macdData.length) {
      const hist = oscChart.addSeries(HistogramSeries, { title: "MACD Hist" });
      hist.setData(
        macdData.map((d) => ({
          time: d.time,
          value: d.hist,
          color:
            d.hist >= 0 ? "rgba(16,185,129,0.5)" : "rgba(244,63,94,0.5)",
        }))
      );
      const macdLine = oscChart.addSeries(LineSeries, {
        color: "#FF9900",
        lineWidth: 1,
        title: "MACD",
      });
      macdLine.setData(macdData.map((d) => ({ time: d.time, value: d.macd })));
    }

    oscChart.timeScale().fitContent();
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0) oscChart.applyOptions({ width: el.clientWidth });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      oscChart.remove();
    };
  }, [bars, showRsi, showMacd, rsiData, macdData]);

  const activeIndCount = [sma20, sma50, sma200, showRsi, showMacd].filter(Boolean).length;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {(["1D", "5D", "1M", "6M", "1Y", "5Y"] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => handleTimeframeChange(tf)}
              className={`rounded-md px-3 py-1.5 font-mono text-xs transition ${
                timeframe === tf
                  ? "bg-[#3B82F6] text-white"
                  : "bg-white/[0.04] text-slate-400 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
          {loading && (
            <span className="ml-2 text-xs text-slate-400">Updating...</span>
          )}
        </div>

        {/* Single compact Indicators popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIndMenuOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-[#0B0E14] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/25"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            Indicators
            {activeIndCount > 0 && (
              <span className="rounded bg-[#3B82F6]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#60A5FA]">
                {activeIndCount}
              </span>
            )}
          </button>

          {indMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-white/[0.1] bg-[#0B0E14] p-3 shadow-2xl">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Technical Overlays
              </div>
              <div className="space-y-2 text-xs text-slate-200">
                {[
                  { label: "SMA 20 (Blue)", val: sma20, set: setSma20 },
                  { label: "SMA 50 (Amber)", val: sma50, set: setSma50 },
                  { label: "SMA 200 (Purple)", val: sma200, set: setSma200 },
                  { label: "RSI (14)", val: showRsi, set: setShowRsi },
                  { label: "MACD (12, 26, 9)", val: showMacd, set: setShowMacd },
                ].map((item) => (
                  <label
                    key={item.label}
                    className="flex cursor-pointer items-center justify-between rounded px-1.5 py-1 hover:bg-white/[0.04]"
                  >
                    <span>{item.label}</span>
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) => item.set(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#3B82F6]"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={mainContainerRef} className="h-[440px] w-full overflow-hidden rounded-lg" />

      {(showRsi || showMacd) && (
        <div className="mt-4 border-t border-white/[0.08] pt-3">
          <div className="mb-1.5 font-mono text-[11px] text-slate-400">
            {showRsi && "RSI(14) "}
            {showMacd && "MACD(12,26,9)"}
          </div>
          <div
            ref={oscContainerRef}
            className="h-[150px] w-full overflow-hidden rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
