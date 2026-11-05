import { createClient } from '@supabase/supabase-js';

// These are dummy values so the app compiles and runs.
// Replace them with your actual Supabase URL and Anon Key when ready.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
