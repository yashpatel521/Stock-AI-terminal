"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Activity,
  TrendingUp,
  Zap,
  BarChart3,
  Shield,
  Sparkles,
  ChevronRight,
  GitCompareArrows,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden select-none">
      {/* Navigation */}
      <header className="h-14 border-b border-border-custom bg-panel/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-12 z-20 shrink-0 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-background" />
          </div>
          <span className="font-bold text-foreground text-[13px] tracking-tight font-display">
            Stock AI
          </span>
          <span className="hidden sm:inline text-[10px] text-muted-custom font-semibold bg-background border border-border-custom px-1.5 py-0.5 rounded-md">
            Open Source
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-xs font-semibold text-muted-custom hover:text-foreground transition-colors cursor-pointer"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-foreground hover:bg-foreground/90 rounded-xl text-xs font-bold text-background flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col z-10">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-custom/5 blur-[150px]"></div>
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-purple-500/5 blur-[120px]"></div>
          </div>

          <div className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-panel border border-border-custom rounded-full text-[10px] font-bold text-green-custom uppercase tracking-wider mb-8">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-custom opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-custom"></span>
              </span>
              Now with Gemini AI Integration
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight mb-6 font-display">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-green-custom via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Stock Terminal
              </span>
            </h1>

            <p className="text-sm md:text-base text-muted-custom max-w-xl mx-auto leading-relaxed mb-10">
              Real-time WebSocket streaming, candlestick charts, and
              institutional-grade AI analysis — built with Next.js, Gemini, and
              Finnhub.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-6">
              <Link
                href="/dashboard"
                className="flex-1 py-3 bg-foreground hover:bg-foreground/90 rounded-xl font-bold text-sm text-background flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
              >
                Launch Terminal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/yashpatel521/Stock-AI-terminal"
                target="_blank"
                className="flex-1 py-3 bg-panel border border-border-custom hover:border-foreground/20 rounded-xl font-bold text-sm text-foreground flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <GitCompareArrows className="h-4 w-4" /> View Source
              </Link>
            </div>

            <p className="text-[10px] text-muted-custom/60">
              Free & open source · No credit card required
            </p>
          </div>
        </section>

        {/* Terminal Preview Strip */}
        <section className="border-y border-border-custom bg-panel/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] text-muted-custom font-semibold">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-custom"></span>
              Finnhub WebSocket
            </div>
            <div className="h-3.5 w-px bg-border-custom hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              Google Gemini AI
            </div>
            <div className="h-3.5 w-px bg-border-custom hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              Next.js 15
            </div>
            <div className="h-3.5 w-px bg-border-custom hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              SQLite + Drizzle ORM
            </div>
            <div className="h-3.5 w-px bg-border-custom hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              NextAuth.js
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground font-display tracking-tight mb-3">
              Everything you need to trade smarter
            </h2>
            <p className="text-sm text-muted-custom max-w-md mx-auto">
              A complete research toolkit combining live data, AI analysis, and
              portfolio tracking in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Activity,
                color: "text-green-custom",
                bg: "bg-green-custom/10",
                title: "Live Price Streaming",
                desc: "Real-time WebSocket feeds from Finnhub with instant green/red flash updates on every trade tick.",
              },
              {
                icon: Brain,
                color: "text-purple-600 dark:text-purple-400",
                bg: "bg-purple-500/10",
                title: "AI Trade Reports",
                desc: "Generate structured analysis with entry zones, targets, stop losses, and risk assessments powered by Gemini.",
              },
              {
                icon: Sparkles,
                color: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-500/10",
                title: "/stockreport Scanner",
                desc: "Run institutional macro scans analyzing CPI, technicals, options flow, and sentiment to find today's top 5 trades.",
              },
              {
                icon: BarChart3,
                color: "text-blue-600 dark:text-blue-400",
                bg: "bg-blue-500/10",
                title: "Interactive Charts",
                desc: "TradingView-style candlestick and area charts rendered from Yahoo Finance historical data with volume overlays.",
              },
              {
                icon: Shield,
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-500/10",
                title: "Multi-User Auth",
                desc: "NextAuth credentials provider with bcrypt hashing. Each user gets isolated watchlists and analysis history.",
              },
              {
                icon: TrendingUp,
                color: "text-rose-600 dark:text-rose-400",
                bg: "bg-rose-500/10",
                title: "Smart Watchlist",
                desc: "Search, track, and manage tickers with card-based views, daily range bars, and one-click AI analysis triggers.",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-5 bg-panel border border-border-custom rounded-2xl hover:border-foreground/15 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
                >
                  <div
                    className={`h-9 w-9 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${feature.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1.5 font-display">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-custom leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="border-t border-border-custom">
          <div className="max-w-5xl mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-panel border border-border-custom mb-6 shadow-sm">
              <Zap className="h-6 w-6 text-foreground" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground font-display tracking-tight mb-3">
              Ready to launch your terminal?
            </h2>
            <p className="text-sm text-muted-custom max-w-md mx-auto mb-8">
              Create a free account and start tracking stocks with AI-powered
              insights in under 30 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <Link
                href="/register"
                className="flex-1 py-3 bg-foreground hover:bg-foreground/90 rounded-xl font-bold text-sm text-background flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
              >
                Create Free Account <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="flex-1 py-3 bg-panel border border-border-custom hover:border-foreground/20 rounded-xl font-bold text-sm text-foreground flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-custom bg-panel">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-foreground flex items-center justify-center">
              <Zap className="h-3 w-3 text-background" />
            </div>
            <span className="text-xs font-bold text-foreground font-display">
              Stock AI Terminal
            </span>
            <span className="text-[10px] text-muted-custom font-semibold">
              v1.0
            </span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-muted-custom font-semibold">
            <Link
              href="https://github.com/yashpatel521/Stock-AI-terminal"
              target="_blank"
              className="hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <GitCompareArrows className="h-3.5 w-3.5" /> GitHub
            </Link>
            <span>© 2026 All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
