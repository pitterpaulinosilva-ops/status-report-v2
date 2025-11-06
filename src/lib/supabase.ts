import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log para verificar se as variáveis estão carregadas
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Config:', {
    url: supabaseUrl ? '✅ Loaded' : '❌ Missing',
    key: supabaseAnonKey ? '✅ Loaded' : '❌ Missing',
    fullUrl: supabaseUrl
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel');
  
  // Don't throw error in production to avoid white screen
  // Instead, show a user-friendly error page
  if (import.meta.env.PROD) {
    console.error('Running in production without Supabase credentials');
  } else {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
