'use client';

import { useEffect } from 'react';

export function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .catch(() => {
          // The app still works without the lightweight offline cache.
        });
    }
  }, []);

  return null;
}
