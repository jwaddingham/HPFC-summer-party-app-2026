'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasValidAdminSession } from '@/lib/admin-session';

export function AdminGuard({ children }: PropsWithChildren) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (!hasValidAdminSession()) {
      router.replace('/admin');
      return;
    }

    setIsAllowed(true);
  }, [router]);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-chalk p-4">
        <div className="bg-white border-2 border-ink p-4 text-sm font-semibold text-ink">
          Checking admin access...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
