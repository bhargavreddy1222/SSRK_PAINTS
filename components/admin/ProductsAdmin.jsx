'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { allPacks, brands, hasPacks, priceRange } from '@/lib/products'
import { PaletteIcon, PlusIcon, SearchIcon } from '@/components/Icons'
import AdminHeader from '@/components/admin/AdminHeader'
import SetupBanner from '@/components/admin/SetupBanner'

const rupees = n => `₹${n.toLocaleString('en-IN')}`

function priceLabel(product) {
  const range = priceRange(product)
  if (!range) return null
  return range.min === range.max ? rupees(range.min) : `${rupees(range.min)} – ${rupees(range.max)}`
}

// Packs priced above their MRP — these have to be corrected before the product can be saved again
const packsAboveMrp = product => allPacks(product).filter(p => p.mrp != null && p.price > p.mrp).length

export default function ProductsAdmin({ products, source, reason }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [brand,  setBrand]  = useState('All')
  // Local show/hide changes, applied on top of the server data
  const [activeOverrides, setActiveOverrides] = useState({})
  const [busyId, setBusyId] = useState(null)
  const [error,  setError]  = useState('')
  const readOnly = source !== 'database'

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products
      .map(p => ({ ...p, active: activeOverrides[p.id] ?? p.active }))
      .filter(p => (brand === 'All' || p.brand === brand) &&
        (!q || [p.name, p.brand, p.category].some(v => v.toLowerCase().includes(q))))
  }, [products, activeOverrides, search, brand])

  async function toggleActive(product) {
    const active = !product.active
    setBusyId(product.id)
    setError('')
    setActiveOverrides(s => ({ ...s, [product.id]: active }))
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      if (res.status === 401) { router.replace('/admin/login'); return }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Update failed')
    } catch (err) {
      setActiveOverrides(s => ({ ...s, [product.id]: !active }))
      setError(`${product.name}: ${err.message}`)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="pb-16">
      <AdminHeader
        actions={!readOnly && (
          <Link href="/admin/products/new" className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold no-underline">
            <PlusIcon className="w-4 h-4" /> Add product
          </Link>
        )}
      />

      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {readOnly && <SetupBanner source={source} reason={reason} />}
        {error && <div className="border rounded-2xl p-4 text-sm mb-5 bg-red-50 border-red-200 text-red-800">{error}</div>}

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <h1 className="text-xl font-extrabold">
            Products <span className="text-stone-500 font-semibold text-base">({products.length})</span>
          </h1>
          <div className="flex gap-2 md:ml-auto">
            <select
              value={brand}
              onChange={e => setBrand(e.target.value)}
              aria-label="Filter by brand"
              className="px-3 py-2 border border-stone-200 rounded-xl text-base sm:text-sm bg-white outline-none focus:border-orange-500"
            >
              {brands.map(b => <option key={b}>{b}</option>)}
            </select>
            <div className="relative flex-1 md:w-64">
              <SearchIcon className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products"
                aria-label="Search products"
                className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-base sm:text-sm placeholder:text-stone-500 bg-white outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          {list.length === 0 && (
            <p className="text-center text-sm text-stone-500 py-16">
              {products.length === 0 ? 'No products yet. Use "Add product" to add your first one.' : 'No products match.'}
            </p>
          )}
          <ul className="divide-y divide-stone-100 list-none m-0 p-0">
            {list.map(p => {
              const range = priceLabel(p)
              const incomplete = !hasPacks(p)
              const aboveMrp = packsAboveMrp(p)
              return (
                <li key={p.id} className={`flex items-center gap-3 sm:gap-4 px-4 py-3 ${p.active ? '' : 'bg-stone-50'}`}>
                  <div className={`relative w-14 h-14 rounded-xl bg-stone-50 border border-stone-100 shrink-0 overflow-hidden ${p.active ? '' : 'opacity-50'}`}>
                    {p.image
                      ? <Image src={p.image} alt="" fill sizes="56px" className="object-contain p-1" />
                      : <PaletteIcon className="w-6 h-6 text-stone-300 absolute inset-0 m-auto" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-sm truncate ${p.active ? '' : 'text-stone-500'}`}>{p.name}</p>
                      {!p.active && <span className="text-[0.62rem] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-200 text-stone-600">Hidden</span>}
                      {incomplete && <span className="text-[0.62rem] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">No prices</span>}
                      {aboveMrp > 0 && <span className="text-[0.62rem] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-800">{aboveMrp} above MRP</span>}
                    </div>
                    <p className="text-xs text-stone-500 truncate">
                      #{p.id} · {p.brand} · {p.category}{range ? ` · ${range}` : ''}
                    </p>
                  </div>

                  {!readOnly && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        disabled={busyId === p.id || (incomplete && !p.active)}
                        title={incomplete && !p.active ? 'Add prices before showing this product' : undefined}
                        aria-label={`${p.active ? 'Hide' : 'Show'} ${p.name}`}
                        className="px-3 py-1.5 coarse:min-h-11 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {p.active ? 'Hide' : 'Show'}
                      </button>
                      <Link href={`/admin/products/${p.id}`} aria-label={`Edit ${p.name}`} className="px-3 py-1.5 coarse:min-h-11 coarse:flex coarse:items-center rounded-lg bg-stone-900 hover:bg-stone-700 text-white text-xs font-semibold no-underline">
                        Edit
                      </Link>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
