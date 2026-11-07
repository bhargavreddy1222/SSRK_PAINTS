import { SHOP } from '@/lib/shop'

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/order'] },
    sitemap: `${SHOP.url}/sitemap.xml`,
  }
}
