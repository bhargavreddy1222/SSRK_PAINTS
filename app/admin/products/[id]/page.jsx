import { notFound, redirect } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { getProductById } from '@/lib/catalog'
import ProductEditor from '@/components/admin/ProductEditor'

export const dynamic = 'force-dynamic'

// /admin/products/new  → add a product
// /admin/products/12   → edit product #12
export default async function AdminProductEditPage({ params }) {
  if (!(await isAdmin())) redirect('/admin/login')

  const { id } = await params
  if (id === 'new') {
    const { source, reason } = await getProductById(null)
    return <ProductEditor product={null} source={source} reason={reason} />
  }

  const { product, source, reason } = await getProductById(Number(id))
  if (!product) notFound()
  return <ProductEditor product={product} source={source} reason={reason} />
}
