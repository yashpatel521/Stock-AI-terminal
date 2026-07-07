'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { useStockStore } from '@/store/useStockStore';
import { useTheme } from './ThemeProvider';
import { Shield, LogOut, User, Sun, Moon, Monitor } from 'lucide-react';

export default function Header() {
  const { user, resetAll } = useStockStore();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    resetAll();
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="h-14 bg-panel border-b border-border-custom flex items-center justify-between px-6 shrink-0 z-10 select-none">
      
      {/* Left Branding */}
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded bg-green-custom flex items-center justify-center font-bold text-white text-sm tracking-wider">
          S
        </div>
        <div>
          <span className="font-semibold text-foreground text-sm">Stock AI Research Terminal</span>
          <span className="ml-2 text-[10px] bg-hover-custom text-green-custom px-1.5 py-0.5 rounded font-mono border border-border-custom uppercase font-bold">
            Open Source
          </span>
        </div>
      </div>

      {/* Right Actions & Indicators */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-custom">
          <span className="h-2 w-2 rounded-full bg-green-custom animate-pulse"></span>
          <span>WebSocket Active</span>
        </div>
        <div className="h-4 w-px bg-border-custom hidden sm:block"></div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-custom">
          <Shield className="h-3.5 w-3.5 text-green-custom" />
          <span>Gemini Enabled</span>
        </div>
        
        <div className="h-4 w-px bg-border-custom hidden sm:block"></div>

        {/* Theme Switcher Button */}
        <button
          onClick={() => {
            if (theme === 'light') setTheme('dark');
            else if (theme === 'dark') setTheme('system');
            else setTheme('light');
          }}
          className="text-muted-custom hover:text-foreground p-1.5 rounded-lg hover:bg-hover-custom transition-all cursor-pointer active:scale-95"
          title={`Theme: ${theme} (Click to toggle)`}
        >
          {theme === 'light' && <Sun className="h-4 w-4 text-amber-500" />}
          {theme === 'dark' && <Moon className="h-4 w-4 text-indigo-400" />}
          {theme === 'system' && <Monitor className="h-4 w-4 text-muted-custom" />}
        </button>

        <div className="h-4 w-px bg-border-custom hidden sm:block"></div>
        
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-custom flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-green-custom" />
              <span className="text-foreground font-semibold">{user.username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-muted-custom hover:text-red-custom p-1.5 rounded hover:bg-hover-custom transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

    </header>
  );
}
