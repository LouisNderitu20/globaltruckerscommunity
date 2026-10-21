import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || SUPABASE_URL;
const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || SUPABASE_ANON_KEY;
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'site-images';
export const SIGNED_TTL = 60 * 60 * 24 * 365 * 10; 

const customFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    cache: 'no-store',
  });
};

export const supabaseContent = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: { fetch: customFetch },
});

const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { fetch: customFetch },
});

export const supabaseStorage = createClient(STORAGE_URL, STORAGE_KEY, {
  auth: { persistSession: false },
  global: { fetch: customFetch },
});
