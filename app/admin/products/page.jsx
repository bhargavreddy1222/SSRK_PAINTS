import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { getCatalogue } from '@/lib/catalog'
import ProductsAdmin from '@/components/admin/ProductsAdmin'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  if (!(await isAdmin())) redirect('/admin/login')

  const { products, source, reason } = await getCatalogue()
  return <ProductsAdmin products={products} source={source} reason={reason} />
}
