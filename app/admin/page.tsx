'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Lock } from 'lucide-react';
import { createAdminSession, hasValidAdminSession } from '@/lib/admin-session';

export default function AdminLogin() {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (hasValidAdminSession()) {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  async function submit() {
    if (!code.trim()) {
      setErr('Please enter a code');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        createAdminSession();
        router.push('/admin/dashboard');
      } else {
        setErr('Invalid code');
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      submit();
    }
  }

  return (
    <div className="min-h-screen bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-8 px-4">
        <Link
          href="/"
          className="mb-3 inline-flex min-h-9 items-center justify-center gap-1.5 border border-white/30 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Public
        </Link>
        <div className="flex justify-between items-center mb-2">
          <h1 className="font-display text-3xl tracking-wider">
            ADMIN ACCESS
          </h1>
          <div className="w-8 h-8 rounded-full bg-blood flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-gray-400">Enter your access code to manage tournaments</p>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-sm space-y-6">
          {/* Code Input Card */}
          <div className="bg-white border-2 border-ink shadow-hard p-6 space-y-4">
            <div className="text-center">
              <h2 className="font-display text-2xl text-ink tracking-wide mb-2">
                Enter Access Code
              </h2>
              <p className="text-sm text-gray-600">
                Enter the admin code to access tournament management
              </p>
            </div>

            <input
              type="password"
              placeholder="••••••"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (err) setErr('');
              }}
              onKeyDown={handleKeyDown}
              className="w-full border-2 border-ink p-3 font-mono text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blood focus:ring-offset-2 transition-all"
              disabled={isLoading}
            />

            {err && (
              <div className="bg-blood/10 border-2 border-blood p-3">
                <p className="text-blood font-semibold text-sm">{err}</p>
              </div>
            )}

            <button
              onClick={submit}
              disabled={isLoading}
              className="w-full bg-blood text-white font-bold py-3 px-4 border-2 border-blood shadow-hard-blood hover:shadow-hard-blood active:translate-y-1 active:translate-x-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
            >
              {isLoading ? 'Checking...' : 'Enter Admin Area'}
            </button>
          </div>

          {/* Info Section */}
          <div className="bg-white border-2 border-line p-4 text-center text-sm text-gray-600">
            <p>The password is shared in the HPFC Coaches WhatsApp group</p>
          </div>
        </div>
      </div>
    </div>
  );
}
