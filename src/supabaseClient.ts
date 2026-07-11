import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ihwtaxltvsgfvgcgcpdw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-anon-key-placeholder';

export let supabase = createClient(supabaseUrl, supabaseAnonKey);
export let hasRealSupabase = !!import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'dummy-anon-key-placeholder';

export function updateSupabaseConfig(url: string, anonKey: string) {
  if (anonKey && anonKey !== 'dummy-anon-key-placeholder') {
    console.log('[Supabase Client] Reinitializing with dynamic config:', { url, keyLength: anonKey.length });
    supabase = createClient(url, anonKey);
    hasRealSupabase = true;
  }
}

console.log('Supabase diagnostic init:', {
  url: supabaseUrl,
  hasKeyEnv: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  isPlaceholder: supabaseAnonKey === 'dummy-anon-key-placeholder'
});
