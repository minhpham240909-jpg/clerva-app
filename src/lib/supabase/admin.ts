import { createServerClient } from '@supabase/ssr'

// Admin client with service role key — bypasses RLS.
// Use with caution: only in API routes for server-side operations.
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Admin client doesn't use cookies
        },
      },
    }
  )
}
