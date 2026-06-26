'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, LogOut } from 'lucide-react';
import { clearAdminSession } from '@/lib/admin-session';

export function AdminModeActions() {
  const router = useRouter();

  function exitAdmin() {
    clearAdminSession();
    router.push('/');
  }

  const controlClass =
    'inline-flex min-h-9 items-center justify-center gap-1.5 border border-white/30 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-ink';

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      <Link href="/" className={controlClass} title="Public home">
        <Home className="h-4 w-4" aria-hidden="true" />
        Public
      </Link>
      <button
        type="button"
        onClick={exitAdmin}
        className={controlClass}
        title="Log out and view public site"
        aria-label="Log out and view public site"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Log out
      </button>
    </div>
  );
}
