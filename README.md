# Sri Sai Ramakrishna Paints & Hardware

Online catalogue and order form for a paint and hardware shop in Guntur, Andhra Pradesh.

Customers browse products, pick a base or colour and a pack size, and send an order with their name and mobile number. There is no online payment: the shop confirms price and stock by phone or WhatsApp. The owner manages orders and products at `/admin`.

## Tech stack

- **Next.js 16** (App Router) and **React 19**, plain JavaScript
- **Tailwind CSS 3**
- **Supabase**: Postgres for products and orders, Storage for product photos. Only the server talks to it, with the service-role key.
- Hosted on **Vercel**

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

1. Create a Supabase project and copy its URL and service-role key into `.env.local`.
2. In Supabase → SQL Editor, paste all of `supabase/setup.sql` and run it. It creates the `orders`, `products` and `admin_state` tables, the photo bucket, and a starting catalogue. It is safe to run again.
3. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`, then log in at `/admin`.

Every setting is described in `.env.example`. On Vercel, add the same names under Project → Settings → Environment Variables.

### Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (needs the database to be reachable) |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests for prices, order rules, product validation and login tokens |

## How it works

### Shop

| Page | What it is |
| --- | --- |
| `/` | Home page: brands, categories, contact details and map |
| `/products` | Catalogue with search and brand/category filters (kept in the address, so a filtered list can be shared) |
| `/products/12-product-name` | One page per product, for sharing and for search engines |
| `/order` | Cart and order form |

- The cart is saved in the browser. When a visitor comes back, their saved items are re-checked against `/api/catalogue`, so prices are current and removed products drop out.
- `/api/orders` never trusts prices from the browser: it looks each item up in the catalogue and saves the order to Supabase. The same order sent twice within ten minutes (a retry on a weak connection) is saved once.
- **New orders appear on `/admin`**, which re-checks every minute while it is open. No email or SMS is sent. After ordering, the customer is offered a pre-filled WhatsApp message to the shop.
- Product pages are rebuilt at most hourly, and immediately after any change in admin.

### Admin (`/admin`)

- **Orders**: new orders first, with call and WhatsApp buttons and a status for each (New → Confirmed → Ready → Completed, or Cancelled).
- **Products**: add, edit, hide and delete products, with bases, colours, pack sizes, MRP and price, and photo upload. A price above its MRP is refused.
- **Login**: one password. Wrong guesses are limited to 5 per address and 20 in total per 15 minutes. "Log out" signs out every device.

### If the database can't be reached

In production the shop does not guess: pages already built keep showing their last good copy, a page that can't be built shows a "call us" message, and online orders are refused. In development, `data/products.js` stands in so the site can be worked on without a database; that file is never used in production.

## Project structure

```
app/
  (shop)/            shop pages: home, products, product page, order
  admin/             orders board, product list and editor, login
  api/orders         saves an order
  api/catalogue      names and prices for re-checking a saved cart
  api/admin/*        login, order status, product changes, photo upload
components/          shop and admin UI
context/CartContext  the cart, saved in the browser
lib/
  shop.js            shop name, phone, address, hours — change them here
  brands.js          the brands the shop stocks
  products.js        product types and price / order-line helpers
  orderRules.js      what makes an order valid (form and API share it)
  productSchema.js   what makes a product valid (editor and API share it)
  catalog.js         reads products from Supabase
  adminAuth.js       admin session check; sessionToken.js signs the cookie
  rateLimit.js       simple per-address limits
proxy.js             second lock on /admin and /api/admin
supabase/setup.sql   database setup
tests/               unit tests (npm test)
```

## Common changes

- **Phone, address, hours, Instagram**: `lib/shop.js`. Instagram links appear once `INSTAGRAM` is set there.
- **Brands**: `lib/brands.js`. **Categories**: `lib/products.js`.
- **Products and prices**: `/admin/products` (not a file).
- **Colours**: `tailwind.config.js`.

## Known limits

- Rate limits are kept in memory, so they reset on each deploy and are counted separately by each server instance.
- A photo that is uploaded but never saved to a product stays in storage.
