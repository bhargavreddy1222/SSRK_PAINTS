'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { PRODUCT_TYPE } from '@/data/products'
import { CheckIcon, PaletteIcon, PlusIcon } from '@/components/Icons'

const BRAND_STYLE = {
  'Asian Paints':    { bg: 'bg-orange-50',  text: 'text-orange-700' },
  'Berger Paints':   { bg: 'bg-blue-50',    text: 'text-blue-700'   },
  'Sheenlac':        { bg: 'bg-rose-50',    text: 'text-rose-700'   },
  'Saincoat':        { bg: 'bg-sky-50',     text: 'text-sky-700'    },
  'JK Wall Care':    { bg: 'bg-green-50',   text: 'text-green-700'  },
  'Birla Wall Care': { bg: 'bg-yellow-50',  text: 'text-yellow-700' },
}

// Light swatches need a border to stay visible on white
const LIGHT_HEX = ['#F5F5F5', '#FFFFF0', '#FFFDD0', '#FAF7F0', '#F8F8F8', '#F5E6C8', '#EDE0C8']

const rupees = n => `₹${n.toLocaleString('en-IN')}`

export default function ProductCard({ product, priority = false }) {
  const { addToCart } = useCart()
  const style = BRAND_STYLE[product.brand] ?? { bg: 'bg-stone-100', text: 'text-stone-700' }

  // ── Initial state depending on product type ───────────
  // (skip any base that has no packs filled in yet)
  const initBase  = product.type === PRODUCT_TYPE.TINTABLE ? product.bases.find(b => b.packs?.length) : null
  const initPack  = product.type === PRODUCT_TYPE.TINTABLE ? initBase.packs[0] : product.packs[0]
  const initColor = product.type === PRODUCT_TYPE.READYMIX ? product.colors[0] : null

  const [selectedBase,  setSelectedBase]  = useState(initBase)
  const [selectedPack,  setSelectedPack]  = useState(initPack)
  const [selectedColor, setSelectedColor] = useState(initColor)
  const [added, setAdded] = useState(false)

  // Reset the "Added" confirmation after a moment
  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 1500)
    return () => clearTimeout(timer)
  }, [added])

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
  }

  const hasDiscount = selectedPack?.mrp > selectedPack?.price

  return (
    <article className="group bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg hover:border-stone-300 transition-all duration-200">

      {/* ── Image ─────────────────────────────────────── */}
      <div className="relative aspect-[4/3] bg-gradient-to-b from-stone-50 to-stone-100 border-b border-stone-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-5 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center ${style.text} opacity-40`}>
            <PaletteIcon className="w-14 h-14" />
          </div>
        )}
        <span className={`absolute top-3 left-3 text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
          {product.brand}
        </span>
        {hasDiscount && (
          <span className="absolute top-3 right-3 text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-green-600 text-white">
            {Math.round(((selectedPack.mrp - selectedPack.price) / selectedPack.mrp) * 100)}% off
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* Name + category + description */}
        <div>
          <p className="text-[0.68rem] text-stone-400 font-semibold uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-bold text-base leading-snug">{product.name}</h3>
          <p className="text-sm text-stone-500 leading-relaxed mt-1.5 line-clamp-2">{product.description}</p>
        </div>

        {/* ── TINTABLE: Base selector ───────────────────── */}
        {product.type === PRODUCT_TYPE.TINTABLE && (
          <OptionGroup label="Base">
            <div className="flex flex-wrap gap-1.5">
              {product.bases.filter(b => b.packs?.length).map(base => (
                <Chip
                  key={base.id}
                  active={selectedBase?.id === base.id}
                  onClick={() => handleBaseChange(base)}
                  title={base.desc}
                >
                  {base.name}
                </Chip>
              ))}
            </div>
            {selectedBase?.desc && (
              <p className="text-[0.7rem] text-stone-400 mt-1.5">{selectedBase.desc}</p>
            )}
          </OptionGroup>
        )}

        {/* ── READYMIX: Color selector ──────────────────── */}
        {product.type === PRODUCT_TYPE.READYMIX && (
          <OptionGroup label="Colour" value={selectedColor?.name}>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(color => {
                const active = selectedColor?.id === color.id
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    aria-label={color.name}
                    aria-pressed={active}
                    className={`w-7 h-7 rounded-full transition-all cursor-pointer shrink-0 ring-offset-2 ${
                      active ? 'ring-2 ring-stone-900' : 'hover:scale-110'
                    } ${LIGHT_HEX.includes(color.hex) ? 'border border-stone-300' : 'border-0'}`}
                    style={{ backgroundColor: color.hex }}
                  />
                )
              })}
            </div>
          </OptionGroup>
        )}

        {/* ── Pack size selector (updates per base) ─────── */}
        <OptionGroup label="Pack Size">
          <div className="flex flex-wrap gap-1.5">
            {availablePacks.map(pack => (
              <Chip
                key={pack.size}
                active={selectedPack?.size === pack.size}
                onClick={() => setSelectedPack(pack)}
              >
                {pack.size}
              </Chip>
            ))}
          </div>
        </OptionGroup>

        {/* ── Price + add (live: updates with base + pack) ─ */}
        <div className="mt-auto pt-4 border-t border-stone-100 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-stone-900 font-extrabold text-xl">
                {selectedPack?.price != null ? rupees(selectedPack.price) : '—'}
              </span>
              {hasDiscount && (
                <span className="text-stone-400 text-sm line-through">{rupees(selectedPack.mrp)}</span>
              )}
            </div>
            <p className="text-stone-400 text-xs truncate">
              per {selectedPack?.size}
              {product.type === PRODUCT_TYPE.READYMIX && selectedColor ? ` · ${selectedColor.name}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`flex items-center gap-1.5 shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer border-0 ${
              added ? 'bg-green-600 text-white' : 'bg-orange-700 hover:bg-orange-800 text-white'
            }`}
          >
            {added
              ? <><CheckIcon className="w-4 h-4" /> Added</>
              : <><PlusIcon className="w-4 h-4" /> Add</>}
          </button>
        </div>
      </div>
    </article>
  )
}

function OptionGroup({ label, value, children }) {
  return (
    <div>
      <p className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
        {label}
        {value && <span className="ml-1.5 normal-case tracking-normal font-semibold text-stone-700">· {value}</span>}
      </p>
      {children}
    </div>
  )
}

function Chip({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
        active
          ? 'bg-stone-900 text-white border-stone-900'
          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}
