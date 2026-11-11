'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PRODUCT_TYPE, COLOR_PRESETS, brands, categories } from '@/lib/products'
import { validateProduct } from '@/lib/productSchema'
import { CloseIcon, PaletteIcon, PlusIcon, TrashIcon } from '@/components/Icons'
import AdminHeader from '@/components/admin/AdminHeader'
import SetupBanner from '@/components/admin/SetupBanner'

const TYPE_OPTIONS = [
  { id: PRODUCT_TYPE.TINTABLE, label: 'Tintable',  help: 'Customer picks a base (emulsions, exterior paints)' },
  { id: PRODUCT_TYPE.READYMIX, label: 'Ready-mix', help: 'Customer picks a colour (enamels, lacquers, distemper)' },
  { id: PRODUCT_TYPE.CLEAR,    label: 'No colour', help: 'Customer only picks a size (putty, primer)' },
]

// Rows get a local key so React can track them while editing
let nextKey = 0
const withKey = row => ({ ...row, _k: `k${nextKey++}` })
const emptyPack = () => withKey({ size: '', mrp: '', price: '' })

function toForm(product) {
  if (!product) {
    return {
      name: '', brand: 'Asian Paints', category: 'Interior', type: PRODUCT_TYPE.TINTABLE,
      description: '', image: '', active: true,
      bases:  [withKey({ id: '', name: '', desc: '', packs: [emptyPack()] })],
      colors: [],
      packs:  [emptyPack()],
    }
  }
  const packsToForm = packs => (packs ?? []).map(p => withKey({ size: p.size, mrp: p.mrp ?? '', price: p.price }))
  return {
    name: product.name, brand: product.brand, category: product.category, type: product.type,
    description: product.description ?? '', image: product.image ?? '', active: product.active !== false,
    bases:  (product.bases ?? []).map(b => withKey({ ...b, packs: packsToForm(b.packs) })),
    colors: (product.colors ?? []).map(withKey),
    packs:  product.packs?.length ? packsToForm(product.packs) : [emptyPack()],
  }
}

export default function ProductEditor({ product, source, reason }) {
  const router = useRouter()
  const isNew = !product
  const readOnly = source !== 'database'
  const [form, setForm] = useState(() => toForm(product))
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  // ── Bases (tintable) ──────────────────────────────
  const updateBase = (k, changes) => set('bases', form.bases.map(b => (b._k === k ? { ...b, ...changes } : b)))
  const addBase = () => {
    // Start a new base with the same pack sizes as the last one — usually they match
    const last = form.bases.at(-1)
    const packs = last?.packs.length ? last.packs.map(p => withKey({ size: p.size, mrp: p.mrp, price: p.price })) : [emptyPack()]
    set('bases', [...form.bases, withKey({ id: '', name: '', desc: '', packs })])
  }

  // ── Colours (ready-mix) ───────────────────────────
  const updateColor = (k, changes) => set('colors', form.colors.map(c => (c._k === k ? { ...c, ...changes } : c)))

  async function handleSave(e) {
    e.preventDefault()
    const payload = {
      ...form,
      packs: form.packs.filter(p => p.size || p.price !== ''),
      bases: form.bases.map(b => ({ ...b, packs: b.packs.filter(p => p.size || p.price !== '') })),
    }
    const { error: invalid } = validateProduct(payload)
    if (invalid) { setError(invalid); return }

    setSaving(true)
    setError('')
    try {
      const res = await fetch(isNew ? '/api/admin/products' : `/api/admin/products/${product.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.status === 401) { router.replace('/admin/login'); return }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Save failed')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Delete failed')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err.message)
      setSaving(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="pb-32">
      <AdminHeader />

      <form onSubmit={handleSave} className="px-4 md:px-8 py-6 max-w-4xl mx-auto flex flex-col gap-5">
        {readOnly && <SetupBanner source={source} reason={reason} />}

        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-sm font-semibold text-stone-500 hover:text-stone-900 no-underline">← Products</Link>
          <h1 className="text-xl font-extrabold">{isNew ? 'Add product' : `Edit #${product.id}`}</h1>
        </div>

        {/* ── Basics ─────────────────────────────── */}
        <Section title="Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Product name" className="sm:col-span-2">
              <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="e.g. Royale Luxury Emulsion" />
            </Field>
            <Field label="Brand">
              <select value={form.brand} onChange={e => set('brand', e.target.value)} className={inputCls}>
                {brands.filter(b => b !== 'All').map(b => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
                {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} className={`${inputCls} resize-y`} placeholder="One or two lines shown on the product card" />
            </Field>
          </div>

          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-orange-700" />
            <span className="text-sm font-semibold">Show this product in the shop</span>
          </label>
        </Section>

        {/* ── Image ──────────────────────────────── */}
        <Section title="Photo">
          <ImagePicker value={form.image} onChange={url => set('image', url)} disabled={readOnly} />
        </Section>

        {/* ── Type + options ─────────────────────── */}
        <Section title="What does the customer choose?">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
            {TYPE_OPTIONS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => set('type', t.id)}
                aria-pressed={form.type === t.id}
                className={`text-left p-3 rounded-xl border cursor-pointer transition-colors ${
                  form.type === t.id ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-100' : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <span className="block text-sm font-bold">{t.label}</span>
                <span className="block text-xs text-stone-500 mt-0.5">{t.help}</span>
              </button>
            ))}
          </div>

          {form.type === PRODUCT_TYPE.TINTABLE && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-stone-600">Each base has its own pack sizes and prices. Customers see the base name as a button, so use words they know and keep the code in brackets: &ldquo;White Base (RB2)&rdquo;.</p>
              {form.bases.map((base, i) => (
                <div key={base._k} className="border border-stone-200 rounded-xl p-4 bg-stone-50/60">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3 flex-1">
                      <Field label={`Base ${i + 1} name`}>
                        <input value={base.name} onChange={e => updateBase(base._k, { name: e.target.value })} className={inputCls} placeholder="e.g. White Base (RB2)" />
                      </Field>
                      <Field label="Short description">
                        <input value={base.desc} onChange={e => updateBase(base._k, { desc: e.target.value })} className={inputCls} placeholder="For white and light pastel shades" />
                      </Field>
                    </div>
                    {form.bases.length > 1 && (
                      <IconButton label="Remove base" onClick={() => set('bases', form.bases.filter(b => b._k !== base._k))}>
                        <TrashIcon className="w-4 h-4" />
                      </IconButton>
                    )}
                  </div>
                  <PacksEditor packs={base.packs} onChange={packs => updateBase(base._k, { packs })} />
                </div>
              ))}
              <AddButton onClick={addBase}>Add another base</AddButton>
            </div>
          )}

          {form.type === PRODUCT_TYPE.READYMIX && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="text-sm font-bold">Colours</p>
                <select
                  value=""
                  onChange={e => e.target.value && set('colors', COLOR_PRESETS[e.target.value].map(withKey))}
                  className="px-3 py-1.5 border border-stone-200 rounded-lg text-base sm:text-xs bg-white"
                  aria-label="Use a colour preset"
                >
                  <option value="">Use a preset…</option>
                  {Object.keys(COLOR_PRESETS).map(name => <option key={name}>{name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                {form.colors.map(color => (
                  <div key={color._k} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={/^#[0-9a-f]{6}$/i.test(color.hex) ? color.hex : '#ffffff'}
                      onChange={e => updateColor(color._k, { hex: e.target.value.toUpperCase() })}
                      className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer bg-white p-0.5 shrink-0"
                      aria-label="Pick colour"
                    />
                    <input value={color.name} onChange={e => updateColor(color._k, { name: e.target.value })} className={`${inputCls} flex-1`} placeholder="Colour name" />
                    <input value={color.hex} onChange={e => updateColor(color._k, { hex: e.target.value })} className={`${inputCls} w-28 font-mono`} placeholder="#FFFFFF" />
                    <IconButton label="Remove colour" onClick={() => set('colors', form.colors.filter(c => c._k !== color._k))}>
                      <CloseIcon className="w-4 h-4" />
                    </IconButton>
                  </div>
                ))}
              </div>
              <AddButton onClick={() => set('colors', [...form.colors, withKey({ id: '', name: '', hex: '#FFFFFF' })])}>Add colour</AddButton>
            </div>
          )}

          {form.type !== PRODUCT_TYPE.TINTABLE && (
            <>
              <p className="text-sm font-bold mb-3">Pack sizes &amp; prices</p>
              <PacksEditor packs={form.packs} onChange={packs => set('packs', packs)} />
            </>
          )}
        </Section>

        {/* ── Save bar ───────────────────────────── */}
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-stone-200 px-4 md:px-8 py-3 z-20">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            {error
              ? <p className="text-sm text-red-700 flex-1">{error}</p>
              : <p className="text-xs text-stone-500 flex-1 hidden sm:block">Changes appear in the shop as soon as you save.</p>}
            {!isNew && !readOnly && (
              <button
                type="button"
                onClick={handleDelete}
                onBlur={() => setConfirmDelete(false)}
                disabled={saving}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer border transition-colors ${
                  confirmDelete ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                }`}
              >
                {confirmDelete ? 'Click again to delete' : 'Delete'}
              </button>
            )}
            <Link href="/admin/products" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 no-underline">Cancel</Link>
            <button
              type="submit"
              disabled={saving || readOnly}
              className="px-6 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 disabled:bg-stone-400 text-white text-sm font-bold border-0 cursor-pointer"
            >
              {saving ? 'Saving…' : isNew ? 'Add product' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// ── Pack rows: size / MRP / price ─────────────────────
function PacksEditor({ packs, onChange }) {
  const update = (k, changes) => onChange(packs.map(p => (p._k === k ? { ...p, ...changes } : p)))

  return (
    <div>
      <div className="grid grid-cols-[1fr_1fr_1fr_36px] gap-2 text-[0.65rem] font-bold text-stone-500 uppercase tracking-wider mb-1.5 px-0.5">
        <span>Size</span><span>MRP ₹ (optional)</span><span>Our price ₹</span><span />
      </div>
      <div className="flex flex-col gap-2">
        {packs.map(pack => {
          const aboveMrp = pack.mrp !== '' && pack.price !== '' && Number(pack.mrp) < Number(pack.price)
          return (
            <div key={pack._k}>
              <div className="grid grid-cols-[1fr_1fr_1fr_36px] gap-2">
                <input value={pack.size} onChange={e => update(pack._k, { size: e.target.value })} className={inputCls} placeholder="1L" aria-label="Pack size" />
                <input type="number" min="0" inputMode="numeric" value={pack.mrp} onChange={e => update(pack._k, { mrp: e.target.value })} className={inputCls} placeholder="—" aria-label="MRP" />
                <input type="number" min="0" inputMode="numeric" value={pack.price} onChange={e => update(pack._k, { price: e.target.value })} aria-invalid={aboveMrp || undefined} className={`${inputCls} ${aboveMrp ? 'border-red-400' : ''}`} placeholder="0" aria-label="Price" />
                <IconButton label="Remove pack" onClick={() => onChange(packs.filter(p => p._k !== pack._k))}>
                  <CloseIcon className="w-4 h-4" />
                </IconButton>
              </div>
              {aboveMrp && <p className="text-xs text-red-700 mt-1">Price can&apos;t be higher than the MRP. Lower the price or correct the MRP.</p>}
            </div>
          )
        })}
      </div>
      <AddButton onClick={() => onChange([...packs, emptyPack()])}>Add pack size</AddButton>
    </div>
  )
}

// ── Photo: upload to Supabase Storage, or paste a path / link ──
function ImagePicker({ value, onChange, disabled }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function upload(file) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      onChange(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative w-36 h-36 rounded-xl bg-stone-50 border border-stone-200 shrink-0 overflow-hidden">
        {value
          ? <Image src={value} alt="Product photo" fill sizes="144px" className="object-contain p-2" />
          : <PaletteIcon className="w-10 h-10 text-stone-300 absolute inset-0 m-auto" />}
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <label className={`px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold ${disabled || uploading ? 'opacity-50' : 'hover:bg-stone-700 cursor-pointer'}`}>
            {uploading ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={disabled || uploading}
              onChange={e => { upload(e.target.files?.[0]); e.target.value = '' }}
              className="sr-only"
            />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-sm font-semibold hover:bg-stone-50 cursor-pointer">
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-stone-500">JPG, PNG or WebP, up to 4 MB. A square photo on a white background looks best.</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
}

// ── Small building blocks ─────────────────────────────
const inputCls = 'w-full px-3 py-2.5 border border-stone-200 rounded-xl text-base sm:text-sm placeholder:text-stone-500 bg-white outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100'

function Section({ title, children }) {
  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6">
      <h2 className="text-base font-bold mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-stone-600 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-9 h-10 flex items-center justify-center rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 bg-transparent border-0 cursor-pointer shrink-0"
    >
      {children}
    </button>
  )
}

function AddButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:text-orange-800 bg-transparent border-0 cursor-pointer p-0"
    >
      <PlusIcon className="w-4 h-4" /> {children}
    </button>
  )
}
