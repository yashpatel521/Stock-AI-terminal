'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useStockStore } from '@/store/useStockStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setUser, resetAll } = useStockStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id,
        username: session.user.username,
      });
      setInitializing(false);
    } else if (status === 'unauthenticated') {
      resetAll();
      router.push('/login');
    }
  }, [status, session, setUser, resetAll, router]);

  if (status === 'loading' || initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0E14] text-white">
        <Loader2 className="h-8 w-8 text-[#089981] animate-spin mb-4" />
        <span className="text-sm font-medium text-[#848E9C]">Loading Terminal Session...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0B0E14] overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-hidden flex h-full bg-[#0B0E14]">
          {children}
        </div>
      </div>
    </div>
  );
}
