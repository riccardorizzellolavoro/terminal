"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface EChartsBoxProps {
  option: echarts.EChartsOption;
  className?: string;
  height?: number | string;
}

export function EChartsBox({
  option,
  className = "",
  height = 360,
}: EChartsBoxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const instance = echarts.init(el, undefined, { renderer: "canvas" });
    chartRef.current = instance;

    const ro = new ResizeObserver(() => {
      instance.resize();
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      instance.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setOption(option, { notMerge: true });
    }
  }, [option]);

  return (
    <div
      ref={containerRef}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
      className={`w-full ${className}`}
    />
  );
}
