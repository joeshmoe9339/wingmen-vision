import { createClient } from '@supabase/supabase-js';

// Supabase connection for the frontend (browser).
// Reads from VITE_ environment variables. If they are missing or invalid the
// app still runs but enters "offline mode" — all read/subscription calls fail
// and components fall back to local mock data (see OsintShield, etc.).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _supabase: ReturnType<typeof createClient> | null = null;

// Exported supabase instance (null when not configured — components must
// handle the null case and fall back to local mocks).
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

export function getSupabase() {
  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'http://localhost:54321' && supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9-placeholder';
}

// Lazy accessor for components that need a non-null client (e.g. OsintShield).
export function getSupa() {
  return supabase ?? getSupabase();
}
