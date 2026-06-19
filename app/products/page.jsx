'use client'

import { useState, useMemo } from 'react'
import { products, brands, categories } from '@/data/products'
import ProductCard from '@/components/ProductCard'

export default function ProductsPage() {
  const [activeBrand,    setActiveBrand]    = useState('All')
  const [activeCategory, setActiveCategory] = useState('All')
  const [search,         setSearch]         = useState('')

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchBrand    = activeBrand    === 'All' || p.brand    === activeBrand
      const matchCategory = activeCategory === 'All' || p.category === activeCategory
      const matchSearch   = p.name.toLowerCase().includes(search.toLowerCase()) ||
                            p.brand.toLowerCase().includes(search.toLowerCase())
      return matchBrand && matchCategory && matchSearch
    })
  }, [activeBrand, activeCategory, search])

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Page header */}
      <div className="bg-white border-b border-stone-200 px-[5%] py-10">
        <p className="text-orange-700 text-[0.7rem] font-bold uppercase tracking-widest mb-1">Catalogue</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Our Products</h1>
        <p className="text-stone-500 text-sm">Browse and add products to your order. We'll confirm by phone or WhatsApp.</p>
      </div>

      <div className="px-[5%] py-8">

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products or brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Brand filter */}
        <div className="mb-4">
          <p className="text-[0.68rem] font-bold text-stone-400 uppercase tracking-wider mb-2">Brand</p>
          <div className="flex flex-wrap gap-2">
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setActiveBrand(b)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                  activeBrand === b
                    ? 'bg-orange-700 text-white border-orange-700'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-8">
          <p className="text-[0.68rem] font-bold text-stone-400 uppercase tracking-wider mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                  activeCategory === c
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-stone-400 mb-5">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Product grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-stone-400">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold">No products found</p>
            <p className="text-sm mt-1">Try a different filter or search term</p>
          </div>
        )}
      </div>
    </div>
  )
}