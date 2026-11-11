'use client'

import Image from 'next/image'
import Link from 'next/link'
import { brandStyle } from '@/lib/brands'
import { productPath } from '@/lib/products'
import { PaletteIcon } from '@/components/Icons'
import { PriceAndAdd, ProductChoices, useProductChoice } from '@/components/ProductBuy'

// One product in the catalogue grid.
// On phones the photo sits beside the name as a small thumbnail, so a card is
// about half as tall and the list is much shorter to scroll; from `sm` up the
// photo goes back on top, full width.
export default function ProductCard({ product, eager = false }) {
  const choice = useProductChoice(product)
  const style = brandStyle(product.brand)

  return (
    <article className="group bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg hover:border-stone-300 transition-all duration-200">

      <div className="flex gap-4 p-4 pb-0 sm:block sm:p-0">
        {/* ── Image ─────────────────────────────────────── */}
        <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-stone-100 bg-gradient-to-b from-stone-50 to-stone-100 sm:w-auto sm:h-auto sm:aspect-[4/3] sm:rounded-none sm:border-0 sm:border-b">
          {product.image ? (
            <Image
              src={product.image}
              alt=""
              fill
              loading={eager ? 'eager' : 'lazy'}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 96px"
              className="object-contain p-2 sm:p-5 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`absolute inset-0 flex items-center justify-center ${style.text} opacity-40`}>
              <PaletteIcon className="w-10 h-10 sm:w-14 sm:h-14" />
            </div>
          )}
          <span className={`hidden sm:block absolute top-3 left-3 text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
            {product.brand}
          </span>
          {choice.hasDiscount && (
            <span className="absolute bottom-1.5 left-1.5 sm:bottom-auto sm:left-auto sm:top-3 sm:right-3 text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-green-700 text-white">
              {choice.discountPercent}% off
            </span>
          )}
        </div>

        {/* Name + category + description */}
        <div className="min-w-0 flex-1 sm:px-5 sm:pt-5">
          <p className="text-[0.68rem] text-stone-500 font-semibold uppercase tracking-wider mb-1">
            <span className="sm:hidden">{product.brand} · </span>{product.category}
          </p>
          <h3 className="font-bold text-base leading-snug m-0">
            <Link href={productPath(product)} className="text-stone-900 no-underline hover:text-orange-700 transition-colors">
              {product.name}
            </Link>
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed mt-1.5 line-clamp-2">{product.description}</p>
        </div>
      </div>

      <div className="p-4 sm:p-5 sm:pt-4 flex flex-col gap-4 flex-1">
        <ProductChoices product={product} choice={choice} />

        {/* ── Price + add (live: updates with base + pack) ─ */}
        <div className="mt-auto pt-4 border-t border-stone-100">
          <PriceAndAdd product={product} choice={choice} />
        </div>
      </div>
    </article>
  )
}
