import { getSupabaseAdminClient } from '@/lib/supabase/server';

const ADMIN_CODE_KEY = 'admin_access_code';

/**
 * The active admin access code. A non-empty value stored in `app_config` wins,
 * so the code can be rotated live from the Supabase dashboard without a
 * redeploy. While that value is blank (or the database is unreachable) we fall
 * back to the ADMIN_ACCESS_CODE environment variable.
 */
async function getActiveAccessCode(): Promise<string | null> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', ADMIN_CODE_KEY)
      .maybeSingle();
    const stored = typeof data?.value === 'string' ? data.value.trim() : '';
    if (stored) return stored;
  } catch {
    // Supabase unavailable or table missing — fall back to the env var below.
  }

  const envCode = process.env.ADMIN_ACCESS_CODE?.trim();
  return envCode ? envCode : null;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { code?: unknown };
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  const active = await getActiveAccessCode();

  return code && active && code === active
    ? new Response(null, { status: 200 })
    : new Response(null, { status: 401 });
}
