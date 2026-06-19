# Sri Sai Ramakrishna Paints & Hardware

Premium paints and hardware supplies in Guntur, Andhra Pradesh.

## Project Structure

```
sri-sai-paints/
│
├── app/                       ← Next.js App Router (pages)
│   ├── layout.jsx             ← Root layout (Navbar + Footer wrapper)
│   ├── globals.css            ← Global Tailwind styles
│   ├── page.jsx               ← Home page (/)
│   ├── products/
│   │   └── page.jsx           ← Products catalogue (/products)
│   └── order/
│       └── page.jsx           ← Order form & checkout (/order)
│
├── components/                ← Reusable UI components
│   ├── Navbar.jsx             ← Navigation bar with cart badge
│   ├── Footer.jsx             ← Footer
│   └── ProductCard.jsx        ← Product card with size picker
│
├── context/                   ← React Context
│   └── CartContext.jsx        ← Global cart state management
│
├── data/                      ← Static data
│   └── products.js            ← 18 paint products with details
│
├── package.json               ← Dependencies
└── tailwind.config.js         ← Tailwind CSS configuration
```

## Features

- ✨ **Next.js 14** with App Router
- 🎨 **Tailwind CSS** for styling
- 🛒 **Global Cart State** with Context API
- 📱 **Responsive Design** (mobile-first)
- 🔍 **Product Filtering** by brand and category
- 🏠 **18 Paint Products** with multiple sizes

## Brands Included

- Asian Paints
- Berger Paints
- Sheenlac
- Saincoat
- JK Wall Care
- Birla Wall Care

## Pages

### Home (/)
Landing page with hero section, brand showcase, features, and contact info.

### Products (/products)
Product catalogue with filtering by brand and category. Each product has:
- Multiple size options
- Brand categorization
- Detailed descriptions
- "Add to Order" button

### Order (/order)
Shopping cart & checkout page with:
- Cart item management (add/remove/update quantity)
- Order form for delivery details
- Total price calculation
- Order submission

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Language**: JavaScript (JSX)

## Customization

### Update Contact Information
Edit these files to add your phone, WhatsApp, and address:
- `components/Navbar.jsx`
- `components/Footer.jsx`
- `app/page.jsx`

### Modify Products
Edit `data/products.js` to add, remove, or update products.

### Customize Colors
Edit `tailwind.config.js` to change the color scheme.

## License

ISC
