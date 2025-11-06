import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log para verificar se as variáveis estão carregadas
console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? '✅ Loaded' : '❌ Missing',
  key: supabaseAnonKey ? '✅ Loaded' : '❌ Missing',
  fullUrl: supabaseUrl
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
