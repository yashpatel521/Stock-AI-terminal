'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

interface StockChartProps {
  symbol: string;
  data: {
    c?: number[];
    h?: number[];
    l?: number[];
    o?: number[];
    t?: number[];
    v?: number[];
    s?: string;
  };
}

export default function StockChart({ symbol, data }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || !data.t || data.t.length === 0) return;

    // Transform Finnhub candle data to lightweight-charts format
    const formattedData = data.t.map((timestamp, index) => {
      const dateObj = new Date(timestamp * 1000);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const date = String(dateObj.getDate()).padStart(2, '0');
      return {
        time: `${year}-${month}-${date}`,
        open: data.o?.[index] || 0,
        high: data.h?.[index] || 0,
        low: data.l?.[index] || 0,
        close: data.c?.[index] || 0,
      };
    });

    // Create chart with initial sizes (will be immediately updated by ResizeObserver)
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#D1D4DC',
      },
      grid: {
        vertLines: { color: '#2A2E39' },
        horzLines: { color: '#2A2E39' },
      },
      width: chartContainerRef.current.clientWidth || 400,
      height: chartContainerRef.current.clientHeight || 300,
      timeScale: {
        borderColor: '#2A2E39',
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#089981',
      downColor: '#F23645',
      borderVisible: false,
      wickUpColor: '#089981',
      wickDownColor: '#F23645',
    });

    candlestickSeries.setData(formattedData);
    chart.timeScale().fitContent();

    // Use ResizeObserver to dynamically resize chart when container changes size
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0]) return;
      const { width, height } = entries[0].contentRect;
      chart.resize(width, height || 300);
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, symbol]);

  if (!data || !data.t || data.t.length === 0 || data.s === 'no_data') {
    return (
      <div className="w-full h-full flex items-center justify-center text-[#848E9C] text-sm">
        No historical chart data available for {symbol}.
      </div>
    );
  }

  return <div ref={chartContainerRef} className="w-full h-full min-h-[300px]" />;
}
