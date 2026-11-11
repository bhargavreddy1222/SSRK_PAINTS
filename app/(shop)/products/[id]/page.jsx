import { notFound } from 'next/navigation'
import ProductDetail from '@/components/ProductDetail'
import { getProducts } from '@/lib/catalog'
import { priceRange, productPath } from '@/lib/products'
import { SHOP } from '@/lib/shop'

// Re-check the catalogue at least hourly; admin edits refresh it immediately
export const revalidate = 3600

// /products/12-royale-luxury-emulsion → product #12 (the words after the number are ignored)
async function findProduct(params) {
  const { id } = await params
  const number = /^\d{1,15}(?=-|$)/.exec(id)?.[0]
  if (!number) return null
  const products = await getProducts()
  return products.find(p => p.id === Number(number)) ?? null
}

// Build a page for every product up front; ones added later are built on first visit
export async function generateStaticParams() {
  const products = await getProducts()
  return products.map(p => ({ id: productPath(p).split('/').pop() }))
}

const absolute = path => (path.startsWith('/') ? `${SHOP.url}${path}` : path)

export async function generateMetadata({ params }) {
  const product = await findProduct(params)
  if (!product) return { title: 'Product not found — Sri Sai Ramakrishna Paints & Hardware' }

  const title = `${product.name} (${product.brand}) price in Guntur — Sri Sai Ramakrishna`
  const { min } = priceRange(product)
  const description = `${product.description} From ₹${min.toLocaleString('en-IN')} at ${SHOP.name} ${SHOP.tagline}, ${SHOP.locality}.`.trim()
  const path = productPath(product)

  return {
    title,
    description,
    // Old or mistyped names after the number all point search engines at one address
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      ...(product.image && { images: [{ url: absolute(product.image), alt: product.name }] }),
    },
  }
}

// Product details for Google (name, brand, price range)
function productJsonLd(product) {
  const { min, max } = priceRange(product)
  const packs = product.bases ? product.bases.flatMap(b => b.packs) : product.packs
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    category: product.category,
    brand: { '@type': 'Brand', name: product.brand },
    image: product.image ? absolute(product.image) : undefined,
    url: `${SHOP.url}${productPath(product)}`,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: min,
      highPrice: max,
      offerCount: packs.length,
      seller: { '@type': 'HardwareStore', name: `${SHOP.name} ${SHOP.tagline}`, url: SHOP.url },
    },
  }
}

export default async function ProductPage({ params }) {
  const product = await findProduct(params)
  if (!product) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)).replace(/</g, '\\u003c') }}
      />
      {/* key: moving between two products starts with that product's own first base and pack */}
      <ProductDetail key={product.id} product={product} />
    </>
  )
}
