import { createClient } from "@supabase/supabase-js"

// Admin client for server-side operations (cron jobs, admin routes only)
// NEVER use this in user-facing routes - use createClient() from server.ts instead
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
