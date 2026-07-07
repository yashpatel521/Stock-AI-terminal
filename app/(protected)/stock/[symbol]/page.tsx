'use client';

import React, { useEffect } from 'react';
import StockDetail from '@/components/StockDetail';
import { useStockStore } from '@/store/useStockStore';

export default function StockSymbolPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = React.use(params);
  const { setSelectedSymbol } = useStockStore();

  useEffect(() => {
    setSelectedSymbol(symbol);
  }, [symbol, setSelectedSymbol]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full w-full animate-fade-in">
      <StockDetail />
    </div>
  );
}
