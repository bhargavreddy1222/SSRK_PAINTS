import 'server-only'
import { createClient } from '@supabase/supabase-js'

// ⚠️ Server-side only. Never import this file in a component or
// anything that runs in the browser — it bypasses Row Level Security.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Turns a Supabase error into one readable line for logs and the admin page.
// Network failures come back as a bare "fetch failed" (or even {}), which
// says nothing — so name the likely causes instead.
export function describeSupabaseError(error) {
  const text = [error?.message, error?.details].filter(Boolean).join(' ')
  let host = 'Supabase'
  try { host = new URL(process.env.SUPABASE_URL).host } catch {}

  if (!text || /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network/i.test(text)) {
    return `Can't reach ${host}. Check in the Supabase dashboard that the project isn't paused, and that SUPABASE_URL in .env.local matches Project Settings → API.`
  }
  if (error?.code === '42P01' || /relation .* does not exist|Could not find the table/i.test(text)) {
    return `A table is missing in Supabase (${error.message}). Run supabase/setup.sql in the SQL editor.`
  }
  if (/Invalid API key|JWT/i.test(text)) {
    return 'Supabase rejected the key. Check SUPABASE_SERVICE_ROLE_KEY in .env.local.'
  }
  return error.message || String(error)
}
