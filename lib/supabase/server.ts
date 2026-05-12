import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return value;
}

function getSupabaseAnonKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return value;
}

function getSupabaseAdminKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return value;
}

export function getSupabasePublicClient() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey());
}

export function getSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseAdminKey());
}
