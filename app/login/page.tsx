'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, AlertCircle, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);
    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError('Invalid username or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError('An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-[#0f1117]">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-transparent to-purple-600/20 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-md px-12">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-8">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white font-display tracking-tight leading-tight mb-4">
            Stock AI<br />Research Terminal
          </h1>
          <p className="text-sm text-white/60 leading-relaxed mb-8">
            Institutional-grade stock analysis powered by Gemini AI. Real-time streaming, macro scans, and trade reports — all in one terminal.
          </p>
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
              Live Streaming
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
              AI Analysis
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              Open Source
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <Zap className="h-4 w-4 text-background" />
            </div>
            <span className="font-bold text-foreground text-sm font-display">Stock AI Terminal</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-foreground font-display tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-custom mt-1.5">Sign in to your research terminal</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 rounded-xl text-red-700 dark:text-red-300 text-xs mb-5 flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-custom mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocused('username')}
                onBlur={() => setFocused(null)}
                className={`w-full px-3.5 py-2.5 bg-background border rounded-xl text-foreground text-sm focus:outline-none transition-all placeholder-muted-custom/40 ${
                  focused === 'username' ? 'border-green-custom ring-2 ring-green-custom/15' : 'border-border-custom'
                }`}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-custom mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className={`w-full px-3.5 py-2.5 pr-10 bg-background border rounded-xl text-foreground text-sm focus:outline-none transition-all placeholder-muted-custom/40 ${
                    focused === 'password' ? 'border-green-custom ring-2 ring-green-custom/15' : 'border-border-custom'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-custom hover:text-foreground cursor-pointer transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-[0.98] shadow-sm mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-custom">
              Don't have an account?{' '}
              <Link href="/register" className="text-foreground font-bold hover:underline">
                Create one
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
