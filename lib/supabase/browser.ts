import { createBrowserClient } from "@supabase/ssr";

/**
 * Anon-key client for the browser. Used only to PUT files straight into
 * Supabase Storage against a short-lived signed upload URL minted server-side,
 * which keeps large uploads off the serverless function (Vercel caps a request
 * body at 4.5 MB).
 *
 * Never import the service-role client here.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
