import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from localStorage first (runtime UI config), then fallback to Vite environment variables
export function getSupabaseCredentials() {
  const runtimeUrl = localStorage.getItem('gemini_clone_supabase_url');
  const runtimeKey = localStorage.getItem('gemini_clone_supabase_key');

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const url = (runtimeUrl || envUrl || '').trim();
  const key = (runtimeKey || envKey || '').trim();

  const isConfigured = Boolean(url && key && url.startsWith('http'));

  return { url, key, isConfigured };
}

let cachedClient = null;
let lastUrl = null;
let lastKey = null;

export function getSupabase() {
  const { url, key, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  // Reuse existing client instance if credentials haven't changed
  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
}

export function saveSupabaseCredentials(url, key) {
  if (url) {
    localStorage.setItem('gemini_clone_supabase_url', url.trim());
  } else {
    localStorage.removeItem('gemini_clone_supabase_url');
  }

  if (key) {
    localStorage.setItem('gemini_clone_supabase_key', key.trim());
  } else {
    localStorage.removeItem('gemini_clone_supabase_key');
  }

  // Clear cache to re-instantiate on next getSupabase()
  cachedClient = null;
  lastUrl = null;
  lastKey = null;
}
