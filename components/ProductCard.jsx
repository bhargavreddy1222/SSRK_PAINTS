'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { PRODUCT_TYPE } from '@/data/products'

const BRAND_STYLE = {
  'Asian Paints':    { bg: 'bg-orange-50',  text: 'text-orange-600', activeBorder: 'border-orange-400' },
  'Berger Paints':   { bg: 'bg-blue-50',    text: 'text-blue-700',   activeBorder: 'border-blue-400'   },
  'Sheenlac':        { bg: 'bg-orange-50',  text: 'text-orange-700', activeBorder: 'border-orange-400' },
  'Saincoat':        { bg: 'bg-blue-50',    text: 'text-blue-600',   activeBorder: 'border-blue-400'   },
  'JK Wall Care':    { bg: 'bg-green-50',   text: 'text-green-700',  activeBorder: 'border-green-400'  },
  'Birla Wall Care': { bg: 'bg-yellow-50',  text: 'text-yellow-700', activeBorder: 'border-yellow-400' },
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const style = BRAND_STYLE[product.brand] ?? { bg: 'bg-stone-50', text: 'text-stone-600', activeBorder: 'border-stone-400' }

  // ── Initial state depending on product type ───────────
  const initBase  = product.type === PRODUCT_TYPE.TINTABLE ? product.bases[0]        : null
  const initPack  = product.type === PRODUCT_TYPE.TINTABLE ? product.bases[0].packs[0] : product.packs[0]
  const initColor = product.type === PRODUCT_TYPE.READYMIX  ? product.colors[0]       : null

  const [selectedBase,  setSelectedBase]  = useState(initBase)
  const [selectedPack,  setSelectedPack]  = useState(initPack)
  const [selectedColor, setSelectedColor] = useState(initColor)
  const [added, setAdded] = useState(false)

  // ── When user picks a different base ─────────────────
  // Try to keep the same size — if that size exists in the
  // new base use it, otherwise fall back to first pack
  function handleBaseChange(base) {
    setSelectedBase(base)
    const sameSize = base.packs.find(p => p.size === selectedPack?.size)
    setSelectedPack(sameSize ?? base.packs[0])
  }

  // ── Packs shown depend on selected base ──────────────
  const availablePacks =
    product.type === PRODUCT_TYPE.TINTABLE
      ? selectedBase?.packs ?? []
      : product.packs ?? []

  // ── Add to cart ───────────────────────────────────────
  function handleAdd() {
    const option =
      product.type === PRODUCT_TYPE.TINTABLE ? selectedBase?.name  :
      product.type === PRODUCT_TYPE.READYMIX  ? selectedColor?.name :
      null

    // pass the pack object directly — it already has the correct price
    addToCart(product, selectedPack, option)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-stone-300 transition-all duration-200">

      {/* Brand badge */}
      <span className={`self-start text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
        {product.brand}
      </span>

      {/* Name + category */}
      <div>
        <h3 className="font-bold text-base leading-snug mb-0.5">{product.name}</h3>
        <span className="text-[0.72rem] text-stone-400 font-medium">{product.category}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-stone-500 leading-relaxed flex-1">{product.description}</p>

      {/* ── TINTABLE: Base selector ───────────────────── */}
      {product.type === PRODUCT_TYPE.TINTABLE && (
        <div>
          <p className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
            Base
          </p>
          <div className="flex flex-col gap-1.5">
            {product.bases.map(base => (
              <button
                key={base.id}
                onClick={() => handleBaseChange(base)}
                className={`text-left px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer ${
                  selectedBase?.id === base.id
                    ? `${style.bg} ${style.text} border-current font-semibold`
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 font-medium'
                }`}
              >
                <span className="font-semibold">{base.name}</span>
                <span className="text-stone-400 font-normal ml-1 text-[0.65rem]">
                  — {base.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── READYMIX: Color selector ──────────────────── */}
      {product.type === PRODUCT_TYPE.READYMIX && (
        <div>
          <p className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
            Colour
            {selectedColor && (
              <span className={`ml-2 normal-case font-semibold ${style.text}`}>
                {selectedColor.name}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map(color => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color)}
                title={color.name}
                className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex-shrink-0 ${
                  selectedColor?.id === color.id
                    ? 'border-stone-900 scale-110 shadow-md'
                    : 'border-stone-200 hover:border-stone-400 hover:scale-105'
                }`}
                style={{
                  backgroundColor: color.hex,
                  outline: ['#F5F5F5','#FFFFF0','#FFFDD0','#FAF7F0','#F8F8F8'].includes(color.hex)
                    ? '1px solid #d1d5db' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── CLEAR: no option message ──────────────────── */}
      {product.type === PRODUCT_TYPE.CLEAR && (
        <div className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-400">
          No colour selection needed for this product.
        </div>
      )}

      {/* ── Pack size selector (updates per base) ─────── */}
      <div>
        <p className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
          Pack Size
        </p>
        <div className="flex flex-wrap gap-1.5">
          {availablePacks.map(pack => (
            <button
              key={pack.size}
              onClick={() => setSelectedPack(pack)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                selectedPack?.size === pack.size
                  ? `${style.bg} ${style.text} border-current`
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
              }`}
            >
              {pack.size}
            </button>
          ))}
        </div>
      </div>

      {/* ── Price (live: updates with base + pack) ─────── */}
    {/* ── Price (live: updates with base + pack) ─────── */}
<div className="flex flex-col gap-0.5">
  <div className="flex items-baseline gap-1.5 flex-wrap">
    <span className="text-orange-700 font-extrabold text-xl">
      ₹{selectedPack?.price?.toLocaleString('en-IN') ?? '—'}
    </span>
    {selectedPack?.mrp > selectedPack?.price && (
      <>
        <span className="text-stone-400 text-sm line-through">
          ₹{selectedPack.mrp.toLocaleString('en-IN')}
        </span>
        <span className="text-green-600 text-xs font-semibold">
          {Math.round(((selectedPack.mrp - selectedPack.price) / selectedPack.mrp) * 100)}% off
        </span>
      </>
    )}
  </div>
  <span className="text-stone-400 text-xs">
    / {selectedPack?.size}
    {product.type === PRODUCT_TYPE.TINTABLE && selectedBase
      ? ` · ${selectedBase.name}`
      : ''}
    {product.type === PRODUCT_TYPE.READYMIX && selectedColor
      ? ` · ${selectedColor.name}`
      : ''}
  </span>
  {selectedPack?.mrp > selectedPack?.price && (
    <span className="text-[0.65rem] text-green-700 font-medium">
      You save ₹{(selectedPack.mrp - selectedPack.price).toLocaleString('en-IN')}
    </span>
  )}
</div>

      {/* ── Add to order button ───────────────────────── */}
      <button
        onClick={handleAdd}
        className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer border-0 mt-auto ${
          added
            ? 'bg-green-600 text-white'
            : 'bg-stone-900 hover:bg-stone-700 text-white'
        }`}
      >
        {added ? '✓ Added to Order' : '+ Add to Order'}
      </button>
    </div>
  )
}