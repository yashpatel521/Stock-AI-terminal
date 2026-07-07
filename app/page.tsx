'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Brain, Activity, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#374151] flex flex-col relative overflow-hidden select-none animate-fade-in">
      
      {/* Dynamic background grid and radial glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-linear-to-b from-[#00B074]/5 to-transparent blur-[120px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="h-16 border-b border-[#E5E7EB] bg-white/70 backdrop-blur-md flex items-center justify-between px-6 md:px-12 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#00B074] flex items-center justify-center font-bold text-white text-base tracking-wider">
            S
          </div>
          <span className="font-bold text-[#111827] text-sm tracking-wide font-display">Stock AI Research Terminal</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-lg text-xs font-bold text-black transition-all cursor-pointer"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-black hover:bg-[#222222] rounded-lg text-xs font-bold text-white flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            Access Terminal <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto z-10 py-16 md:py-24">
        
        {/* Glow Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F3F4F6] border border-[#E5E7EB] rounded-full text-[10px] font-bold text-[#00B074] uppercase tracking-wider mb-6">
          <Shield className="h-3 w-3 animate-pulse" /> SECURE NEXTAUTH GATEWAY ENABLED
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-[#111827] leading-tight tracking-tight mb-6 font-display">
          Real-Time Market Intelligence <br />
          <span className="bg-linear-to-r from-[#00B074] via-[#26a69a] to-emerald-600 bg-clip-text text-transparent">
            Powered by Generative AI
          </span>
        </h1>

        <p className="text-sm md:text-base text-[#6B7280] max-w-2xl leading-relaxed mb-10">
          A high-performance trading dashboard that streams live WebSocket price feeds, renders interactive TradingView-style candlestick charts, and generates institutional-grade trade plans using Gemini.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm mb-16">
          <Link
            href="/dashboard"
            className="flex-1 py-3 bg-black hover:bg-[#222222] rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
          >
            Launch Terminal <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="flex-1 py-3 border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            Create Account
          </Link>
        </div>

        {/* Feature Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left pt-12 border-t border-[#E5E7EB]">
          
          <div className="p-6 bg-white border border-[#E5E7EB] rounded-2xl hover:border-black/30 hover:bg-[#FAFAFA] transition-all duration-200 group shadow-xs">
            <div className="h-9 w-9 rounded-xl bg-[#00B074]/10 flex items-center justify-center text-[#00B074] mb-4 group-hover:scale-110 transition-transform">
              <Activity className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-sm font-bold text-[#111827] mb-2 font-display">Live WebSocket Streaming</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Experience real-time price updates with trade feeds pushed directly over persistent WebSockets, complete with green and red color flashing states.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E7EB] rounded-2xl hover:border-black/30 hover:bg-[#FAFAFA] transition-all duration-200 group shadow-xs">
            <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <Brain className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-sm font-bold text-[#111827] mb-2 font-display">Gemini Generative Analyst</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Instantly generate structured trade plans detailing trend analyses, entry zones, risk metrics, and stop loss coordinates compiled from live stock data.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E5E7EB] rounded-2xl hover:border-black/30 hover:bg-[#FAFAFA] transition-all duration-200 group shadow-xs">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#00B074] mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-sm font-bold text-[#111827] mb-2 font-display">Multi-User Isolation</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              NextAuth credentials implementation protects user sessions and isolates watchlists and analysis history records in the SQLite database by user ID.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="h-14 border-t border-[#E5E7EB] bg-white flex items-center justify-between px-6 md:px-12 text-[10px] text-[#6B7280] z-10 shrink-0">
        <span>© 2026 Stock AI Research Terminal. Experimental Platform.</span>
        <span>Secure authentication gateway. All rights reserved.</span>
      </footer>

    </div>
  );
}
