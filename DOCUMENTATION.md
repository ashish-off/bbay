# bbay — Technical Architecture & Project Documentation

> **bbay** is a modern, high-performance hybrid e-commerce and live auction platform built for Nepal. It combines fixed-price retail shopping with timed live-bidding auctions, secure digital payments via eSewa (HMAC-SHA256), cash-on-delivery handling, durable background workflows via Inngest, and seamless authentication via Clerk.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Repository Structure](#repository-structure)
4. [Database Models & Prisma Schema](#database-models--prisma-schema)
5. [Core Workflows & Business Logic](#core-workflows--business-logic)
   - [Auction Lifecycle & Real-Time Bidding](#1-auction-lifecycle--real-time-bidding)
   - [E-Commerce & Cart Management](#2-e-commerce--cart-management)
   - [Pricing, Delivery & Fee Engine](#3-pricing-delivery--fee-engine)
   - [eSewa v2 Payment Integration](#4-esewa-v2-payment-integration)
   - [User Synchronization & Clerk Auth](#5-user-synchronization--clerk-auth)
   - [Seller & Admin Portals](#6-seller--admin-portals)
6. [Complete REST API Reference](#complete-rest-api-reference)
7. [Background Jobs & Automation (Inngest)](#background-jobs--automation-inngest)
8. [Environment Variables Reference](#environment-variables-reference)
9. [Installation & Local Setup](#installation--local-setup)
10. [Production & Deployment Guide](#production--deployment-guide)

---

## System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Next.js 16 + React 19)"]
        UI["Tailwind CSS v4 + Lucide Icons"]
        State["TanStack React Query v5 + Redux Toolkit"]
        AuthClient["Clerk React / Next SDK"]
    end

    subgraph ServerLayer ["Server & API Layer (Next.js App Router)"]
        RouteHandlers["Route Handlers (app/api/*)"]
        ServerAuth["Clerk Server Auth + Prisma User Upsert (lib/auth.js)"]
        PricingEngine["Pricing & Fee Engine (lib/pricing.js)"]
        EsewaSigner["eSewa HMAC-SHA256 Engine (lib/esewa.js)"]
    end

    subgraph DataLayer ["Data & Persistence Layer"]
        Postgres[("Supabase PostgreSQL")]
        PrismaORM["Prisma Client v6.19.3"]
    end

    subgraph ExternalServices ["External Services & Automation"]
        ClerkSvc["Clerk Authentication Service"]
        InngestSvc["Inngest Durable Execution & Crons"]
        EsewaGateway["eSewa Digital Wallet Gateway"]
        ImageKitSvc["ImageKit CDN Storage"]
    end

    UI --> RouteHandlers
    State --> RouteHandlers
    AuthClient --> ClerkSvc
    RouteHandlers --> ServerAuth
    RouteHandlers --> PricingEngine
    RouteHandlers --> EsewaSigner
    RouteHandlers --> PrismaORM
    PrismaORM --> Postgres
    ClerkSvc -- Webhook (Svix) --> RouteHandlers
    RouteHandlers -- Event Trigger --> InngestSvc
    InngestSvc -- Scheduled Cron (*/5 min) --> PrismaORM
    RouteHandlers -- Redirect Form --> EsewaGateway
    EsewaGateway -- Callback Verify --> RouteHandlers
    RouteHandlers --> ImageKitSvc
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (Turbopack, App Router) | `16.3.4` | Full-stack SSR, API routes, streaming, asset optimization |
| **UI Library** | React | `19.2.8` | Component rendering, concurrent features, server components |
| **Styling** | Tailwind CSS & PostCSS | `v4.x` | Modern styling engine with native CSS layers |
| **Database** | PostgreSQL (Supabase) | Latest | Relational database with pooled and direct connections |
| **ORM** | Prisma ORM | `6.19.3` | Type-safe database queries, migrations, and transactions |
| **Authentication** | Clerk (`@clerk/nextjs`) | `7.9.0` | Social logins, user management, and JWT session handling |
| **Client State / Cache** | TanStack React Query | `5.102.8` | Server state fetching, optimistic updates, query caching |
| **Local State** | Redux Toolkit | `2.12.0` | Client UI state management |
| **Background Jobs** | Inngest SDK | `4.19.0` | Durable functions, cron scheduling, webhook fanout |
| **Payment Gateway** | eSewa ePay v2 (Nepal) | Custom | HMAC-SHA256 signature generation and verify callbacks |
| **Media Hosting** | ImageKit | `6.0.0` | Cloud media uploads, transformation, and CDN delivery |
| **Icons & Charts** | Lucide React / Recharts | `1.39.0` / `3.10.1` | Accessible vector icons and analytics charting |

---

## Repository Structure

```text
bbay/
├── .agents/                      # AI assistant & customization rules
│   └── skills/                   # Workspace-specific skills (Inngest, Supabase, Docs)
├── app/                          # Next.js App Router root
│   ├── (public)/                 # Public consumer pages (Layout with Navbar + Footer)
│   │   ├── auction/checkout/     # Won auction claim & checkout flow
│   │   ├── cart/                 # Shopping cart for Buy It Now listings
│   │   ├── orders/               # User activity: Direct orders & Won auctions tabs
│   │   ├── product/[productId]/  # Product details, live bidding & reviews
│   │   ├── shop/                 # Catalog browsing, filtering by type/category
│   │   └── watchlist/            # Saved items tracker
│   ├── admin/                    # Admin portal (dashboard, listings, users, coupons)
│   ├── api/                      # Next.js Serverless Route Handlers
│   │   ├── address/              # Shipping address CRUD
│   │   ├── admin/                # Admin operations & role-check
│   │   ├── auction/              # Auction checkout, won listings, eSewa initiation
│   │   ├── bids/                 # Bid placement & history
│   │   ├── cart/                 # Cart add/update/remove
│   │   ├── clerk/webhook/        # Clerk user sync webhook endpoint (Svix)
│   │   ├── coupons/              # Coupon verification & management
│   │   ├── esewa/                # eSewa initiate, verify, and failure handlers
│   │   ├── inngest/              # Inngest API serve endpoint
│   │   ├── listings/             # Listing catalog CRUD & filters
│   │   ├── orders/               # Order creation & retrieval
│   │   ├── ratings/              # Product reviews & ratings
│   │   ├── seller/               # Seller dashboard, listings, and orders
│   │   └── watchlist/            # User watchlist endpoints
│   ├── sell/                     # Seller dashboard (create/edit listing, orders)
│   ├── fonts/                    # Self-hosted Outfit variable font
│   ├── globals.css               # Tailwind CSS imports & animations
│   └── layout.jsx                # Global root layout (Clerk, React Query, Redux, Toast)
├── components/                   # Reusable React components
│   ├── AddressModal.jsx          # Add shipping address modal
│   ├── CountdownTimer.jsx        # Real-time ticking auction countdown
│   ├── Navbar.jsx                # Global navigation bar with search & auth
│   ├── OrderSummary.jsx          # Reusable checkout summary with fee calculations
│   └── ProductCard.jsx           # Grid listing display card
├── inngest/                      # Background workflows
│   ├── client.js                 # Inngest client initialization
│   └── functions.js              # syncClerkUser and expireAuctions cron
├── lib/                          # Shared utilities
│   ├── admin.js                  # Admin role verification
│   ├── api.js                    # Frontend API client (Axios with 401 interceptor)
│   ├── auth.js                   # Server-side Clerk auth + Prisma user sync
│   ├── esewa.js                  # HMAC-SHA256 signature generator & validator
│   ├── pricing.js                # Single source of truth for delivery & COD fees
│   └── prisma.js                 # Global singleton Prisma client
├── prisma/
│   └── schema.prisma             # PostgreSQL schema definition & indexes
└── public/                       # Static public assets
```

---

## Database Models & Prisma Schema

The application is backed by PostgreSQL via Prisma ORM.

### Enums

- **`ListingType`**: `AUCTION` (timed bidding) \| `FIXED` (buy-it-now retail)
- **`ListingStatus`**: `ACTIVE` (open for purchase/bids) \| `SOLD` (purchased or auction won) \| `EXPIRED` (ended with no bids) \| `CANCELLED` (withdrawn by seller/admin)
- **`OrderStatus`**: `ORDER_PLACED` \| `PROCESSING` \| `SHIPPED` \| `DELIVERED`
- **`PaymentMethod`**: `COD` (Cash on Delivery) \| `ESEWA` (Digital Wallet) \| `KHALTI` (Coming soon)

### Entity Relationship Summary

```mermaid
erDiagram
    User ||--o{ Listing : "seller of"
    User ||--o{ Bid : "places"
    User ||--o{ Order : "buyer of"
    User ||--o{ Address : "owns"
    User ||--o{ CartItem : "contains"
    User ||--o{ Watchlist : "saves"
    User ||--o{ Rating : "writes"

    Listing ||--o{ Bid : "receives"
    Listing ||--o{ OrderItem : "ordered as"
    Listing ||--o{ CartItem : "in cart"
    Listing ||--o{ Rating : "reviewed in"

    Order ||--|{ OrderItem : "contains"
    Order ||--|| Address : "shipped to"
```

### Key Models

| Model | Primary Key | Key Fields | Purpose |
| :--- | :--- | :--- | :--- |
| **`User`** | `id` (Clerk ID) | `name`, `email`, `image`, `cart` (JSON), `isActive` | Synchronized user profile with Clerk |
| **`Listing`** | `id` (CUID) | `name`, `listingType`, `status`, `price`, `startingBid`, `currentBid`, `auctionEndTime`, `winnerId`, `stock`, `inStock` | Products for retail sale or timed auction |
| **`Bid`** | `id` (CUID) | `amount`, `listingId`, `bidderId`, `createdAt` | Immutable log of competitive auction bids |
| **`Order`** | `id` (CUID) | `total`, `status`, `userId`, `sellerId`, `isPaid`, `paymentMethod`, `esewaRefId`, `coupon` | Purchase record grouped by seller |
| **`OrderItem`** | `(orderId, listingId)` | `quantity`, `price` | Junction item tracking price at moment of sale |
| **`CartItem`** | `id` (CUID) | `userId`, `listingId`, `quantity` | Real-time persisted shopping cart |
| **`Address`** | `id` (CUID) | `userId`, `name`, `street`, `city`, `phone`, `zip` | Saved recipient delivery destinations |
| **`Coupon`** | `code` (String) | `discount` (%), `expiresAt`, `forNewUser`, `isPublic` | Promotional discount codes |
| **`Rating`** | `id` (CUID) | `rating` (1-5), `review`, `userId`, `listingId`, `orderId` | Verified customer reviews on completed orders |

---

## Core Workflows & Business Logic

### 1. Auction Lifecycle & Real-Time Bidding

1. **Creation**: Sellers list an item with `listingType = AUCTION`, setting `startingBid` and `auctionEndTime`.
2. **Placing a Bid** (`POST /api/bids`):
   - Validates that the auction is `ACTIVE` and current time is before `auctionEndTime`.
   - Validates the bidder is **not** the seller.
   - Enforces that `amount > currentBid` (or `>= startingBid` on first bid).
   - Atomic database transaction creates the `Bid` record and increments `bidCount` and `currentBid` on `Listing`.
3. **Auction Close & Resolution** (`inngest/functions.js`):
   - Inngest cron runs every 5 minutes (`*/5 * * * *`).
   - Finds all listings where `listingType = 'AUCTION'`, `status = 'ACTIVE'`, and `auctionEndTime <= now()`.
   - **If bids exist**: Listing status updates to `SOLD`, sets `inStock = false`, and records `winnerId` and `winnerBidId`.
   - **If no bids exist**: Listing status updates to `EXPIRED` and `inStock = false`.
4. **Winner Claim & Checkout** (`/auction/checkout/[listingId]`):
   - The winning bidder visits the checkout page.
   - The winner selects a delivery address, applies any eligible coupon, and chooses **Cash on Delivery** or **eSewa**.
   - Upon completion, an `Order` and `OrderItem` are created, marking the win as completed.

### 2. E-Commerce & Cart Management

- Fixed-price listings (`listingType = FIXED`) allow direct purchase and adding to cart.
- Cart items are stored in the database (`CartItem` table) with fallback to legacy user session JSON.
- **Stock Enforcements**:
  - Increments in cart and final checkout enforce `item.stock`.
  - When an order is placed, listings whose stock drops to 0 are automatically marked `inStock: false`.
  - Out-of-stock items are automatically excluded from the public shop catalog.

### 3. Pricing, Delivery & Fee Engine

All financial calculations throughout the application use the centralized pricing logic in [`lib/pricing.js`](file:///c:/Users/lenovo/Desktop/Projects/bbay/lib/pricing.js):

$$\text{Final Total} = (\text{Subtotal} - \text{Discount}) + \text{Delivery Fee} + \text{Payment Fee}$$

- **Delivery Fee**: Flat **Rs. 100** applied across all checkouts.
- **Payment Handling Fee**:
  - **Cash on Delivery (COD)**: **+Rs. 20** (courier collection & handling fee).
  - **eSewa (Pay Now)**: **Rs. 0** (Free digital payment).
- **Coupons**: Applied as a percentage discount directly to the item subtotal before fees.

### 4. eSewa v2 Payment Integration

bbay implements Nepal's official eSewa ePay v2 protocol using SHA-256 HMAC encryption:

1. **Initiate**:
   - Client calls `/api/esewa/initiate` (or `/api/auction/esewa-initiate`).
   - Server computes a unique `transaction_uuid` and creates an unpaid order.
   - Server constructs the signature string:
     `total_amount={amount},transaction_uuid={uuid},product_code={code}`
   - Computes HMAC-SHA256 signature using `process.env.ESEWA_SECRET_KEY` and base64 encodes it.
   - Client dynamically generates a hidden HTML form and auto-submits directly to `https://rc-epay.esewa.com.np/api/epay/main/v2/form`.
2. **Verification Callback** (`/api/esewa/verify`):
   - eSewa redirects the buyer back to the verify URL with a base64 encoded payload.
   - Server decodes `data`, reconstructs the signed fields string, and verifies the digital signature.
   - Upon valid verification, updates `order.isPaid = true` and `order.esewaRefId`.

### 5. User Synchronization & Clerk Auth

- Users authenticate through Clerk (Email, Google, Phone).
- **Svix Webhook** (`/api/clerk/webhook`): Verified using `CLERK_WEBHOOK_SECRET` and forwards user create/update/delete events to Inngest (`syncClerkUser`).
- **Server Request Sync** (`lib/auth.js`): `getAuthUser()` performs an atomic upsert to ensure the user's latest name, email, and avatar are always synchronized into the local database without waiting for webhooks.

### 6. Seller & Admin Portals

- **Seller Dashboard** (`/sell`):
  - Any authenticated user can list items for sale.
  - Manage active and completed listings.
  - Restock items even after stock reaches 0.
  - Delete or toggle active status of unsold items.
  - View incoming buyer orders and update fulfillment status (`ORDER_PLACED` → `PROCESSING` → `SHIPPED` → `DELIVERED`).
- **Admin Portal** (`/admin`):
  - Protected by `ADMIN_EMAIL` check in [`lib/admin.js`](file:///c:/Users/lenovo/Desktop/Projects/bbay/lib/admin.js).
  - System-wide metrics (total revenue, active listings, auction counts).
  - User management (deactivate/activate accounts).
  - Promotional coupon creation and expiry management.

---

## Complete REST API Reference

### Authentication
All protected routes require an active Clerk session cookie or header. `getAuthUser()` returns HTTP `401 Unauthorized` if unauthenticated.

### 1. Catalog & Listings

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/listings` | Public | List products with query params: `search`, `category`, `type` (`FIXED` \| `AUCTION`), `sort` |
| `POST` | `/api/listings` | User | Create a new listing (fixed or auction) |
| `GET` | `/api/listings/[id]` | Public | Fetch listing details, seller info, and latest bids |
| `PUT` | `/api/listings/[id]` | Seller / Admin | Update listing information or restock quantity |
| `DELETE` | `/api/listings/[id]` | Seller / Admin | Delete an existing listing |

### 2. Auctions & Bidding

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bids?listingId={id}` | Public | Get chronological bid history for a specific auction |
| `GET` | `/api/bids` | User | Get current user's placed bids across all auctions |
| `POST` | `/api/bids` | User | Place a new bid (`{ listingId, amount }`) |
| `GET` | `/api/auction/won` | User | Fetch all auctions won by the current user |
| `POST` | `/api/auction/checkout` | User | Place Cash on Delivery order for a won auction |
| `POST` | `/api/auction/esewa-initiate` | User | Initiate eSewa payment for a won auction |

### 3. Cart & Orders

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | User | Fetch items currently in user's cart |
| `POST` | `/api/cart` | User | Add or update quantity (`{ listingId, quantity }`) |
| `DELETE` | `/api/cart` | User | Remove item from cart (`{ listingId }`) |
| `GET` | `/api/orders` | User | List orders placed by current user |
| `POST` | `/api/orders` | User | Place Buy Now order (`{ addressId, paymentMethod, couponCode }`) |
| `GET` | `/api/orders/[id]` | User | Get order tracking details and invoice items |

### 4. Payments (eSewa)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/esewa/initiate` | User | Generate signed form parameters for cart checkout |
| `GET` | `/api/esewa/verify` | Public | Callback endpoint validating signature and completing order |
| `GET` | `/api/esewa/failure` | Public | Handles cancelled or rejected payment redirects |

### 5. Addresses & Coupons

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/address` | User | Retrieve saved addresses for user |
| `POST` | `/api/address` | User | Save a new delivery address |
| `DELETE` | `/api/address` | User | Delete an existing delivery address |
| `POST` | `/api/coupons/validate` | User | Check code validity, expiry, and discount percentage |

### 6. Seller & Admin

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/seller/dashboard` | User | Seller analytics: total earnings, pending shipments |
| `GET` | `/api/seller/listings` | User | List all products created by the current user |
| `GET` | `/api/seller/orders` | User | Orders containing items sold by current user |
| `PUT` | `/api/seller/orders/[id]` | User | Update shipping status (`ORDER_PLACED` → `SHIPPED`) |
| `GET` | `/api/admin/dashboard` | Admin | System overview metrics |
| `GET` | `/api/admin/users` | Admin | List all registered users |
| `PUT` | `/api/admin/users/[id]` | Admin | Toggle account suspension |

---

## Background Jobs & Automation (Inngest)

Background jobs are defined in [`inngest/functions.js`](file:///c:/Users/lenovo/Desktop/Projects/bbay/inngest/functions.js) and served via `/api/inngest`:

### 1. `sync-clerk-user`
- **Trigger**: Event `clerk/user.synced` emitted by `/api/clerk/webhook`.
- **Logic**:
  - Handles `user.created` & `user.updated`: Upserts user name, email, and avatar into the database.
  - Handles `user.deleted`: Performs soft-deletion by setting `isActive: false`.

### 2. `expire-auctions`
- **Trigger**: Cron schedule `*/5 * * * *` (Runs every 5 minutes).
- **Logic**:
  - Queries active auctions past their `auctionEndTime`.
  - Determines the highest bidder from the `Bid` relation.
  - Updates listing to `SOLD` (with `winnerId`) if bids were placed, or `EXPIRED` if no bids occurred.

---

## Environment Variables Reference

Create a `.env` file in the root directory with the following configuration keys:

```ini
# ─── Database (PostgreSQL / Supabase) ─────────────────────────────────
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# ─── Clerk Authentication ─────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# ─── Platform & Currency ──────────────────────────────────────────────
NEXT_PUBLIC_CURRENCY_SYMBOL="रु"
ADMIN_EMAIL="admin@bbay.com"

# ─── eSewa Payment Gateway (v2) ────────────────────────────────────────
NEXT_PUBLIC_ESEWA_PRODUCT_CODE="EPAYTEST"
ESEWA_SECRET_KEY="8gBm/:&EnhH.1/q("
NEXT_PUBLIC_ESEWA_PAYMENT_URL="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ─── Inngest Background Workflows ─────────────────────────────────────
INNGEST_EVENT_KEY="local"
INNGEST_SIGNING_KEY="local"

# ─── ImageKit CDN (Optional for uploads) ───────────────────────────────
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_..."
IMAGEKIT_PRIVATE_KEY="private_..."
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/..."
```

---

## Installation & Local Setup

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm**: `v9.x` or higher
- **PostgreSQL Database**: Accessible database instance (Supabase recommended)

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ashish-off/bbay.git
   cd bbay
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Initialize Database Schema**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Start Inngest Dev Server** (in a separate terminal):
   ```bash
   npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
   ```
   Access the Inngest dashboard at [http://localhost:8288](http://localhost:8288) to monitor cron jobs and functions.

---

## Production & Deployment Guide

### Vercel / Cloud Run Deployment

1. **Build Verification**:
   Before deploying, verify that the application compiles without errors:
   ```bash
   npm run build
   ```
2. **Database Pooling**:
   Always supply `DATABASE_URL` with transaction pooling enabled (port 6543 on Supabase) and `DIRECT_URL` pointing to port 5432 for migrations.
3. **Inngest Sync**:
   In production, configure `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` in your hosting dashboard and register your deployment webhook URL on [Inngest Cloud](https://app.inngest.com).
4. **eSewa Live Switch**:
   For production Nepal payments, change `NEXT_PUBLIC_ESEWA_PRODUCT_CODE`, `ESEWA_SECRET_KEY`, and update `NEXT_PUBLIC_ESEWA_PAYMENT_URL` to `https://epay.esewa.com.np/api/epay/main/v2/form`.
