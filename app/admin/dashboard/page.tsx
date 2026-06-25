'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Plus, LogOut } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { clearAdminSession } from '@/lib/admin-session';

export default function AdminDashboard() {
  const router = useRouter();

  function logout() {
    clearAdminSession();
    router.push('/admin');
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-8 px-4">
        <div className="flex justify-between items-center mb-1">
          <h1 className="font-display text-3xl tracking-wider">
            MATCHDAY CONTROL
          </h1>
          <button
            onClick={logout}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-400">Logged in as organiser</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Tournaments */}
        <div className="space-y-3">
          <h2 className="font-display text-xl text-ink tracking-wide">
            TOURNAMENTS
          </h2>
          <Link
            href="/admin/tournaments"
            className="bg-white border-2 border-ink shadow-hard p-4 flex items-center justify-between hover:bg-gray-50 active:translate-y-px active:translate-x-px active:shadow-none transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blood flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold leading-none mb-0.5">Manage Tournaments</p>
                <p className="text-xs text-gray-500 font-medium">Create and configure tournaments</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </div>
      </div>
    </AdminGuard>
  );
}
