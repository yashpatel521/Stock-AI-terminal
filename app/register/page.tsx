'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, AlertCircle, Zap, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordLongEnough = password.length >= 6;
  const usernameLongEnough = username.length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        await signIn('credentials', {
          username,
          password,
          callbackUrl: '/dashboard',
        });
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-[#0f1117]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-green-600/20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-md px-12">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-8">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white font-display tracking-tight leading-tight mb-4">
            Join the<br />Terminal
          </h1>
          <p className="text-sm text-white/60 leading-relaxed mb-8">
            Create a free account to unlock your personal AI-powered stock research workspace. Track tickers, run macro scans, and generate institutional-grade reports.
          </p>
          
          {/* Feature list */}
          <div className="space-y-3">
            {[
              'Real-time WebSocket price streaming',
              'AI-powered /stockreport macro scans',
              'Per-ticker Gemini analysis reports',
              'Unlimited watchlist tracking',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-white/50 text-xs">
                <div className="h-5 w-5 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-green-400" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Register Form */}
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
            <h2 className="text-2xl font-extrabold text-foreground font-display tracking-tight">Create account</h2>
            <p className="text-sm text-muted-custom mt-1.5">Get started with your free research terminal</p>
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
                placeholder="Choose a username"
              />
              {username.length > 0 && (
                <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-semibold ${usernameLongEnough ? 'text-green-custom' : 'text-muted-custom'}`}>
                  {usernameLongEnough ? <Check className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-border-custom inline-block" />}
                  At least 3 characters
                </div>
              )}
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
                  placeholder="Create a password"
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
              {password.length > 0 && (
                <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-semibold ${passwordLongEnough ? 'text-green-custom' : 'text-muted-custom'}`}>
                  {passwordLongEnough ? <Check className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-border-custom inline-block" />}
                  At least 6 characters
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-custom mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused(null)}
                className={`w-full px-3.5 py-2.5 bg-background border rounded-xl text-foreground text-sm focus:outline-none transition-all placeholder-muted-custom/40 ${
                  focused === 'confirm' ? 'border-green-custom ring-2 ring-green-custom/15' : 'border-border-custom'
                }`}
                placeholder="Repeat your password"
              />
              {confirmPassword.length > 0 && (
                <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-semibold ${passwordsMatch ? 'text-green-custom' : 'text-red-custom'}`}>
                  {passwordsMatch ? <Check className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-red-custom inline-block" />}
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-[0.98] shadow-sm mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-custom">
              Already have an account?{' '}
              <Link href="/login" className="text-foreground font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
