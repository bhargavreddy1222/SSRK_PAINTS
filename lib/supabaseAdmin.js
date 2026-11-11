import 'server-only'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const configured = Boolean(url && key)

// ⚠️ Server-side only. Never import this file in a component or
// anything that runs in the browser — it bypasses Row Level Security.
//
// createClient throws without a URL, which would take every page down at
// import time. With the settings missing we build a client that can't connect
// instead, so each query fails with the readable message below.
export const supabaseAdmin = createClient(
  configured ? url : 'http://supabase-not-configured.invalid',
  configured ? key : 'missing',
  { auth: { persistSession: false, autoRefreshToken: false } }
)

// Turns a Supabase error into one readable line for logs and the admin page.
// Network failures come back as a bare "fetch failed" (or even {}), which
// says nothing — so name the likely causes instead.
export function describeSupabaseError(error) {
  if (!configured) {
    return 'Supabase is not set up. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the environment, then restart the server.'
  }

  const text = [error?.message, error?.details].filter(Boolean).join(' ')
  let host = 'Supabase'
  try { host = new URL(url).host } catch {}

  if (!text || /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network/i.test(text)) {
    return `Can't reach ${host}. Check in the Supabase dashboard that the project isn't paused, and that SUPABASE_URL in .env.local matches Project Settings → API.`
  }
  if (isMissingTable(error)) {
    return `A table is missing in Supabase (${error.message}). Run supabase/setup.sql in the SQL editor.`
  }
  if (/Invalid API key|JWT/i.test(text)) {
    return 'Supabase rejected the key. Check SUPABASE_SERVICE_ROLE_KEY in .env.local.'
  }
  return error.message || String(error)
}

export function isMissingTable(error) {
  const text = [error?.message, error?.details].filter(Boolean).join(' ')
  return error?.code === '42P01' || error?.code === 'PGRST205' ||
    /relation .* does not exist|Could not find the table/i.test(text)
}
