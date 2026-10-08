import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://atmoshbogjqifmnurdni.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_4eh56UPX1w50-hyFmDVcJA_Gjz5uflE";

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "https://bissmepkqhackzaezvax.supabase.co";
const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || "sb_publishable_a37psIhYy7hU9xY460QHLQ_JZGpv6vE";
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "site-images";
export const SIGNED_TTL = 60 * 60 * 24 * 365 * 10; 

export const supabaseContent = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

export const supabaseStorage = createClient(STORAGE_URL, STORAGE_KEY, {
  auth: { persistSession: false },
});
