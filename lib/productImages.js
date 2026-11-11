import 'server-only'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Product photos live in the public `product-images` storage bucket
export const IMAGE_BUCKET = 'product-images'

// Our own Supabase host — the only one next/image is allowed to load from (next.config.js)
export function imageHost() {
  try { return new URL(process.env.SUPABASE_URL).host } catch { return null }
}

// "products/<uuid>.jpg" for a photo in our bucket, null for anything else
function storagePath(url) {
  const prefix = `https://${imageHost()}/storage/v1/object/public/${IMAGE_BUCKET}/`
  if (typeof url !== 'string' || !url.startsWith(prefix)) return null
  const path = decodeURIComponent(url.slice(prefix.length).split('?')[0])
  return path && !path.includes('..') ? path : null
}

// Deletes an uploaded photo once no product uses it any more.
// Never throws: a file left behind costs a little storage, nothing else.
export async function removeUnusedImage(url) {
  const path = storagePath(url)
  if (!path) return

  const { count, error } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('image', url)
  if (error || count > 0) return

  const { error: removeError } = await supabaseAdmin.storage.from(IMAGE_BUCKET).remove([path])
  if (removeError) console.error('Old product photo not removed:', removeError.message)
}
