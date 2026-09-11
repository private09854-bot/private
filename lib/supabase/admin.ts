import "./ws-polyfill";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses Row Level Security, so it is the only
 * thing that reads/writes the application tables — and it must never be
 * imported into a client component (the key is server-only).
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in the environment.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
