import { randomUUID } from 'node:crypto'
import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { isAdmin } from '@/lib/adminAuth'
import { IMAGE_BUCKET } from '@/lib/productImages'

const MAX_BYTES = 4 * 1024 * 1024
const TYPES     = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

// The browser's file.type can say anything, so check the file's first bytes too
const ascii = (bytes, start, end) => bytes.toString('latin1', start, end)
const LOOKS_LIKE = {
  'image/jpeg': b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png':  b => ascii(b, 0, 8) === '\x89PNG\r\n\x1a\n',
  'image/webp': b => ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP',
}

// POST /api/admin/upload  (multipart form, field "file")  → { url }
export async function POST(request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Not logged in' }, { status: 401 })
  }

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!file || typeof file === 'string') {
    return Response.json({ error: 'No file received' }, { status: 400 })
  }
  const ext = TYPES[file.type]
  if (!ext) return Response.json({ error: 'Use a JPG, PNG or WebP image' }, { status: 400 })
  if (file.size > MAX_BYTES) return Response.json({ error: 'Image is too large (max 4 MB)' }, { status: 400 })

  const bytes = Buffer.from(await file.arrayBuffer())
  if (!LOOKS_LIKE[file.type](bytes)) {
    return Response.json({ error: 'That file is not a real JPG, PNG or WebP image' }, { status: 400 })
  }

  const path = `products/${randomUUID()}.${ext}`
  const { error } = await supabaseAdmin.storage
    .from(IMAGE_BUCKET)
    .upload(path, bytes, { contentType: file.type })

  if (error) {
    const reason = describeSupabaseError(error)
    console.error('Image upload error:', reason)
    return Response.json({ error: reason }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage.from(IMAGE_BUCKET).getPublicUrl(path)
  return Response.json({ url: data.publicUrl })
}
