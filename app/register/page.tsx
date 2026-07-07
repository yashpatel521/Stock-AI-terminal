'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Execute sign-in directly using NextAuth credentials provider
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
    <div className="flex-1 flex items-center justify-center bg-[#0B0E14] px-4 py-12">
      <div className="w-full max-w-md bg-[#131722] border border-[#2A2E39] rounded-lg p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded bg-[#089981] flex items-center justify-center font-bold text-white text-lg tracking-wider mb-3">
            S
          </div>
          <h2 className="text-xl font-bold text-white">Create Account</h2>
          <p className="text-xs text-[#848E9C] mt-1">Register to start managing your private stock watchlist</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 rounded text-rose-200 text-xs mb-6 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#848E9C] uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-[#1E222D] border border-[#2A2E39] rounded text-white text-sm focus:outline-none focus:border-[#089981]"
              placeholder="Username (min 3 chars)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#848E9C] uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#1E222D] border border-[#2A2E39] rounded text-white text-sm focus:outline-none focus:border-[#089981]"
              placeholder="Password (min 6 chars)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#848E9C] uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#1E222D] border border-[#2A2E39] rounded text-white text-sm focus:outline-none focus:border-[#089981]"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#089981] hover:bg-[#07806c] disabled:opacity-50 text-white rounded text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer select-none"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register & Log In'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-[#2A2E39] pt-4">
          <p className="text-xs text-[#848E9C]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#089981] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
