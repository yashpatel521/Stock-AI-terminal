'use client';

import React, { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useStockStore } from '@/store/useStockStore';
import { useTheme } from './ThemeProvider';
import { LogOut, Sun, Moon, Monitor, Zap, ChevronDown } from 'lucide-react';

export default function Header() {
  const { user, resetAll } = useStockStore();
  const { theme, setTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    resetAll();
    await signOut({ callbackUrl: '/login' });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => {
      setShowThemeMenu(false);
      setShowUserMenu(false);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun, color: 'text-amber-500' },
    { value: 'dark' as const, label: 'Dark', icon: Moon, color: 'text-indigo-400' },
    { value: 'system' as const, label: 'System', icon: Monitor, color: 'text-muted-custom' },
  ];

  const activeTheme = themeOptions.find(t => t.value === theme) || themeOptions[2];
  const ActiveIcon = activeTheme.icon;

  return (
    <header className="h-12 bg-panel border-b border-border-custom flex items-center justify-between px-5 shrink-0 z-30 select-none">
      
      {/* Left: Logo & Branding */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
          <Zap className="h-3.5 w-3.5 text-background" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-[13px] tracking-tight font-display hidden sm:inline">Stock AI</span>
          <span className="hidden md:inline text-[10px] text-muted-custom font-semibold bg-background border border-border-custom px-1.5 py-0.5 rounded-md">
            Terminal v1.0
          </span>
        </div>
      </div>

      {/* Center: Status Indicators */}
      <div className="hidden lg:flex items-center gap-5">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-custom font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-custom opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-custom"></span>
          </span>
          <span>WebSocket</span>
        </div>
        <div className="h-3.5 w-px bg-border-custom"></div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-custom font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span>Gemini AI</span>
        </div>
        <div className="h-3.5 w-px bg-border-custom"></div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-custom font-semibold">
          <span className="h-2 w-2 rounded-full bg-green-custom"></span>
          <span>Finnhub</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        
        {/* Theme Selector Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowThemeMenu(!showThemeMenu);
              setShowUserMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted-custom hover:text-foreground hover:bg-hover-custom transition-all cursor-pointer active:scale-95"
            title={`Theme: ${theme}`}
          >
            <ActiveIcon className={`h-3.5 w-3.5 ${activeTheme.color}`} />
            <ChevronDown className="h-3 w-3 text-muted-custom/60" />
          </button>

          {showThemeMenu && (
            <div 
              className="absolute right-0 top-full mt-1.5 w-36 bg-panel border border-border-custom rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-border-custom">
                <span className="text-[9px] uppercase font-bold text-muted-custom tracking-wider font-display">Appearance</span>
              </div>
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setTheme(opt.value);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                      isActive 
                        ? 'text-foreground bg-hover-custom' 
                        : 'text-muted-custom hover:text-foreground hover:bg-hover-custom'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${opt.color}`} />
                    <span>{opt.label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-custom"></span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-border-custom"></div>

        {/* User Profile Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
                setShowThemeMenu(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-hover-custom transition-all cursor-pointer active:scale-95"
            >
              <div className="h-6 w-6 rounded-full bg-green-custom/15 border border-green-custom/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-green-custom uppercase">{user.username.charAt(0)}</span>
              </div>
              <span className="text-xs font-semibold text-foreground hidden sm:inline">{user.username}</span>
              <ChevronDown className="h-3 w-3 text-muted-custom/60" />
            </button>

            {showUserMenu && (
              <div 
                className="absolute right-0 top-full mt-1.5 w-44 bg-panel border border-border-custom rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3.5 py-3 border-b border-border-custom">
                  <span className="text-xs font-bold text-foreground block font-display">{user.username}</span>
                  <span className="text-[10px] text-muted-custom font-semibold">Authenticated Session</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </header>
  );
}
