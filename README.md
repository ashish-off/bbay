# bbay — Bid, Buy & Sell

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2d3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)
![Inngest](https://img.shields.io/badge/Jobs-Inngest-000000)
![Payment](https://img.shields.io/badge/Payment-eSewa%20v2-60bb46)

**Nepal's Premier Hybrid E-Commerce and Live Auction Marketplace**

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Documentation](./DOCUMENTATION.md)

</div>

---

## Overview

**bbay** is a full-featured online marketplace combining **fixed-price e-commerce** (Buy It Now) and **live timed auctions** with competitive real-time bidding. Built with **Next.js 16 (Turbopack)**, **React 19**, **Tailwind CSS v4**, **PostgreSQL via Prisma**, and **Clerk Auth**, it offers native payments via **eSewa** (HMAC-SHA256 encrypted) and **Cash on Delivery (COD)**, automated background auction expiry with **Inngest**, and dedicated **Seller** & **Admin** portals.

---

## Features

### 🛒 Dual E-Commerce & Auction Engine
- **Live Timed Auctions**: Countdown timers, competitive bidding, minimum increment verification, and automated winner resolution.
- **Buy It Now (Fixed Price)**: Immediate purchase with real-time stock management and shopping cart.
- **Won Auction Claims**: Dedicated checkout flow for auction winners to select shipping address and payment method.

### 💳 Payment & Billing Engine
- **eSewa ePay v2**: Digital wallet payment with HMAC-SHA256 signature generation and server callback verification (Rs. 0 payment fee).
- **Cash on Delivery (COD)**: Doorstep delivery handling (+Rs. 20 collection fee).
- **Delivery Fee**: Standardized flat Rs. 100 delivery fee across all checkouts.
- **Promotional Coupons**: Percentage-based discount codes with validation.

### 👤 User & Role Management
- **Clerk Authentication**: Social logins, secure session management, and automated background database synchronization.
- **Seller Portal**: Self-service listing creation, image uploads, stock editing/restocking, and order fulfillment.
- **Admin Dashboard**: System metrics, user suspension/activation, and coupon management.
- **Customer Features**: Watchlists, shipping address book, and verified buyer reviews.

---

## Tech Stack

- **Framework**: Next.js 16.3.4 (App Router, Turbopack)
- **UI**: React 19.2.8, Tailwind CSS v4, Lucide Icons
- **Database**: PostgreSQL (Supabase) with Prisma ORM 6.19.3
- **Authentication**: Clerk (`@clerk/nextjs` 7.9.0)
- **State Management**: TanStack React Query 5.102.8 & Redux Toolkit
- **Background Jobs**: Inngest SDK 4.19.0
- **Payments**: eSewa ePay v2 (HMAC-SHA256)
- **Media**: ImageKit Node SDK

---

## Quick Start

### 1. Prerequisites
- Node.js `v18.17+`
- PostgreSQL database (Supabase recommended)
- Clerk account for authentication

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ashish-off/bbay.git
cd bbay

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Generate Prisma Client & push schema to database
npx prisma generate
npx prisma db push
```

### 3. Running Locally
```bash
# Start Next.js development server
npm run dev

# (Optional) Start Inngest dev server for background crons
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Full Documentation

For the comprehensive technical specification, database models, business workflows, and REST API reference, see:

📖 **[Full Technical Documentation](./DOCUMENTATION.md)**

---

## License

Private repository. All rights reserved.
