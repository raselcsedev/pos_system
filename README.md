# RetailPOS — Full-Stack Point of Sale System

Modern POS and inventory management built with **Next.js 16 (App Router)**, **TypeScript**, **MongoDB/Mongoose**, **Tailwind CSS**, **NextAuth**, **Zustand**, **React Hook Form + Zod**, **Recharts**, and **TanStack Table**.

## Features

- **Auth**: Admin/cashier login, RBAC middleware, forgot password
- **Dashboard**: Revenue stats, sales chart, top products, low stock alerts
- **POS**: Product search, barcode scan, cart, hold/resume, checkout, thermal print
- **Products**: CRUD API, TanStack Table listing, SKU/barcode generation
- **Inventory**: Stock adjustments with audit logs
- **Modules**: Customers, suppliers, purchases, sales, expenses, employees, reports, branches, settings, notifications
- **Real-time**: Optional Socket.IO server
- **PWA**: `manifest.json` for offline-capable install

## Folder Structure

```
src/
├── app/                    # App Router pages & API routes
│   ├── (auth)/             # Login, forgot password
│   ├── (dashboard)/        # Protected dashboard pages
│   └── api/                # REST API handlers
├── actions/                # Server Actions
├── components/             # UI, layout, POS, dashboard
├── hooks/                  # Custom React hooks
├── lib/                    # DB, auth, utils, print
├── models/                 # Mongoose schemas
├── repositories/           # Data access layer
├── services/               # Business logic
├── stores/                 # Zustand (cart)
├── types/                  # TypeScript types
└── validations/            # Zod schemas
scripts/seed.ts             # Database seed
server/socket-server.ts     # Socket.IO
```

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 2. Install & Configure

```bash
cd pos_system
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/pos_system
AUTH_SECRET=generate-a-random-32-char-string
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Seed Database

```bash
npm run seed
```

Default accounts:

| Role    | Email              | Password      |
|---------|--------------------|---------------|
| Admin   | admin@pos.local    | Admin@123456  |
| Cashier | cashier@pos.local  | Cashier@123   |

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to dashboard.

### 5. Optional: Socket.IO (real-time)

```bash
npm run socket
```

Add to `.env.local`:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
SOCKET_PORT=3001
```

## New Features

### Customers & Suppliers (full CRUD)
- `/customers` — add, edit, search, deactivate customers
- `/suppliers` — add, edit, search, deactivate suppliers
- APIs: `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/[id]` (same for suppliers)

### Reports (PDF / Excel / CSV)
- `/reports` — preview and export sales, inventory, customer, and P&L reports
- API: `GET /api/reports?type=sales|inventory|customers|profit&days=30`

### Product images (Cloudinary)
- Add Product dialog includes image upload
- API: `POST /api/upload` (multipart form field `file`)
- With Cloudinary env vars → uploads to cloud; without → stores base64 locally

```env
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

## API Examples

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/search?q=mouse` | Search products (POS) |
| GET | `/api/products/barcode/:code` | Barcode lookup |
| GET | `/api/products?page=1&limit=20` | Paginated products |
| POST | `/api/products` | Create product |
| POST | `/api/sales/checkout` | Complete sale |
| POST | `/api/inventory/adjust` | Adjust stock |
| GET | `/api/dashboard` | Dashboard stats |
| POST | `/api/auth/forgot-password` | Password reset |

## Thermal Printing

After checkout, the POS opens a print window with 80mm receipt layout. Configure your OS default printer or use browser print → thermal printer.

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables:
   - `MONGODB_URI` (Atlas connection string)
   - `AUTH_SECRET`
   - `AUTH_URL` (your production URL)
   - `NEXT_PUBLIC_APP_URL`
4. Deploy

**Note**: Socket.IO requires a separate Node host (Railway, Render, etc.) — Vercel serverless does not support persistent WebSockets.

### MongoDB Atlas

1. Create free cluster
2. Database Access → user + password
3. Network Access → allow `0.0.0.0/0` (or Vercel IPs)
4. Connect → copy connection string to `MONGODB_URI`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production |
| `npm run seed` | Seed database |
| `npm run socket` | Socket.IO server |
| `npm run lint` | ESLint |

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- MongoDB + Mongoose
- NextAuth v5 (Credentials)
- Tailwind CSS 4 + Radix UI primitives
- Zustand, React Hook Form, Zod
- Recharts, TanStack Table
- Socket.IO (optional)

## License

MIT
