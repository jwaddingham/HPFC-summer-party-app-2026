const ADMIN_SESSION_KEY = 'hpfc_admin_session';
const LEGACY_ADMIN_KEY = 'hpfc_admin';
const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;

interface AdminSession {
  expiresAt: number;
}

function readSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminSession>;
      if (typeof parsed.expiresAt === 'number') return { expiresAt: parsed.expiresAt };
    }

    if (window.localStorage.getItem(LEGACY_ADMIN_KEY) === '1') {
      const migrated = createAdminSession();
      window.localStorage.removeItem(LEGACY_ADMIN_KEY);
      return migrated;
    }
  } catch {
    clearAdminSession();
  }

  return null;
}

export function createAdminSession(now = Date.now()) {
  const session = { expiresAt: now + ADMIN_SESSION_MS };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    window.localStorage.removeItem(LEGACY_ADMIN_KEY);
  }
  return session;
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
  window.localStorage.removeItem(LEGACY_ADMIN_KEY);
}

export function getValidAdminSession(now = Date.now()) {
  const session = readSession();
  if (!session) return null;
  if (session.expiresAt <= now) {
    clearAdminSession();
    return null;
  }
  return session;
}

export function hasValidAdminSession() {
  return getValidAdminSession() !== null;
}

export function getAdminHeaders({ json = false }: { json?: boolean } = {}) {
  const headers: Record<string, string> = {};
  if (json) headers['content-type'] = 'application/json';
  if (hasValidAdminSession()) headers['x-hpfc-admin'] = '1';
  return headers;
}
