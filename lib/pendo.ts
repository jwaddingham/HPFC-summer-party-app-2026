declare global {
  interface Window {
    pendo?: {
      track(eventName: string, properties?: Record<string, unknown>): void;
    };
  }
}

export function pendoTrack(eventName: string, properties?: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined' && window.pendo) {
      window.pendo.track(eventName, properties);
    }
  } catch {
    // Tracking must never break application flow
  }
}
