'use client';

import { useEffect } from 'react';

export function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('ServiceWorker registered:', registration);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed:', error);
        });
    }
  }, []);

  return null;
}
