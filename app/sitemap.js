import { SHOP } from '@/lib/shop'

export default function sitemap() {
  return ['', '/products'].map(path => ({ url: `${SHOP.url}${path}` }))
}
