'use client'

import { useLayoutEffect, useState, useMemo } from 'react'
import { brands, categories, filterProducts } from '@/data/products'
import ProductCard from '@/components/ProductCard'
import { CloseIcon, SearchIcon } from '@/components/Icons'

// Client side of /products — search + filters over `products`
export default function ProductCatalogue({ products }) {
  const [activeBrand,    setActiveBrand]    = useState('All')
  const [activeCategory, setActiveCategory] = useState('All')
  const [search,         setSearch]         = useState('')

  // Home page links in with ?category=… or ?brand=…
  // Read after mount, not with useSearchParams: that hook leaves the static
  // /products HTML empty, so nothing shows until all the JavaScript has run.
  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromParam = (key, list) => (list.includes(params.get(key)) ? params.get(key) : 'All')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveBrand(fromParam('brand', brands))
    setActiveCategory(fromParam('category', categories))
  }, [])

  const filtered = useMemo(
    () => filterProducts(products, activeBrand, activeCategory, search),
    [products, activeBrand, activeCategory, search]
  )

  // Hide filter chips that would always show zero products
  const usedBrands     = brands.filter(b => b === 'All' || products.some(p => p.brand === b))
  const usedCategories = categories.filter(c => c === 'All' || products.some(p => p.category === c))

  const hasFilters = activeBrand !== 'All' || activeCategory !== 'All' || search
  function clearFilters() {
    setActiveBrand('All')
    setActiveCategory('All')
    setSearch('')
  }

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Page header */}
      <div className="bg-gradient-to-b from-orange-50/70 to-white border-b border-stone-200 px-[5%] py-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-orange-700 text-xs font-bold uppercase tracking-widest mb-2">Catalogue</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Our Products</h1>
          <p className="text-stone-500 text-sm max-w-xl">
            Pick a base or colour and pack size, add to your order, and we&apos;ll confirm price and stock by phone or WhatsApp.
          </p>
        </div>
      </div>

      {/* Filters: from md up the whole block sticks under the navbar. On phones
          only the search sticks (`contents` drops the wrappers' boxes), so the
          brand + category rows scroll away and leave room for the products. */}
      <div className="contents md:block md:sticky md:top-16 md:z-30 md:bg-white/95 md:backdrop-blur md:border-b md:border-stone-200 md:px-[5%] md:py-3">
        <div className="contents md:flex md:flex-col md:gap-3 md:max-w-7xl md:mx-auto">
          <div className="sticky top-16 z-30 bg-white/95 backdrop-blur px-[5%] py-2 border-b border-stone-200 md:static md:bg-transparent md:backdrop-blur-none md:p-0 md:border-0">
            <div className="relative md:max-w-md">
              <SearchIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Search products, brands, categories…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search products"
                className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-stone-50 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-white px-[5%] py-3 border-b border-stone-200 md:contents">
            <FilterRow label="Brand" options={usedBrands} active={activeBrand} onChange={setActiveBrand} />
            <FilterRow label="Category" options={usedCategories} active={activeCategory} onChange={setActiveCategory} />
          </div>
        </div>
      </div>

      <div className="px-[5%] py-8">
        <div className="max-w-7xl mx-auto">
          {/* Results count */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-stone-500">
              <span className="font-bold text-stone-900">{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm font-semibold text-orange-700 hover:text-orange-800 bg-transparent border-0 cursor-pointer">
                <CloseIcon className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>

          {/* Product grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((product, i) => (
                // The first row is on screen straight away, so don't lazy-load its photos
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-dashed border-stone-300 rounded-2xl">
              <SearchIcon className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="font-bold text-stone-700">No products found</p>
              <p className="text-sm text-stone-500 mt-1 mb-5">Try a different filter or search term.</p>
              <button onClick={clearFilters} className="bg-stone-900 hover:bg-stone-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm border-0 cursor-pointer transition-colors">
                Show all products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// One row of filter chips — scrolls sideways on small screens
function FilterRow({ label, options, active, onChange }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider w-16 shrink-0">{label}</span>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mr-[5vw] pr-[5vw] md:mr-0 md:pr-0 md:flex-wrap">
        {options.map(option => (
          <button
            key={option}
            onClick={() => onChange(option)}
            aria-pressed={active === option}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${
              active === option
                ? 'bg-orange-700 text-white border-orange-700'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
