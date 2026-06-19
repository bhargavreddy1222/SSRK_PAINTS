import { createClient } from '@supabase/supabase-js'

// ⚠️ Server-side only. Never import this file in a component or 
// anything that runs in the browser — it bypasses Row Level Security.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)