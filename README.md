# 🌾 AgroMart Platform — Full-Stack E-Commerce & Agricultural Machinery Web Application

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MariaDB](https://img.shields.io/badge/MariaDB-MySQL-003545?style=for-the-badge&logo=mariadb)](https://mariadb.org/)
[![Sharp](https://img.shields.io/badge/Sharp-Image_Optimization-99CC00?style=for-the-badge)](https://sharp.pixelplumbing.com/)

> **A modern, high-performance, full-stack E-Commerce and Agro-Equipment Management Platform built from the ground up with Next.js App Router, React Server Components, Prisma ORM, and high-efficiency MariaDB database pooling.**

---

## 🌐 Live Production Demo
- **Live Website:** [smartagrosource.com](https://smartagrosource.com)
- **Status:** In Active Production & Live Customer Usage

---

## 🚀 Key Features & Capabilities

### 🛒 1. Customer Storefront (High-Conversion UX)
* **Real-Time Dynamic Catalog:** Instantaneous rendering of categories, popular products, and equipment inventory without stale cache lag.
* **Instant Smart Search:** Fast, client-side & server-assisted product searching with real-time keyword matching.
* **Smart Delivery Fee Calculation:** Dynamic product-level and location-aware shipping calculation (Inside/Outside Division).
* **Frictionless Checkout Flow:** Streamlined single-page checkout supporting **Cash on Delivery (COD)**, bKash, and Nagad payment methods.
* **Dynamic Media & Ultra-Crisp Icons:** 4K / Retina-ready responsive imagery, WebP compression pipeline, and multi-resolution brand badge favicons.
* **Customer Support & Engagement:** Integrated FAQ accordions, trust badges, WhatsApp quick order, and direct call actions.

### ⚙️ 2. Comprehensive Custom Admin Dashboard
* **Product Lifecycle Management (CRUD):** 
  * Full create, edit, delete, stock tracking, and pricing controls.
  * Embedded **WordPress-style Rich Text Editor** for detailed product specifications, formatted tables, and bold highlights.
  * Multi-image upload pipeline with automated local filesystem storage.
* **Live Storefront Customizer:**
  * Dynamic Promotional Banners manager (upload, reorder, auto-sliding carousel).
  * Brand logo & favicon live updates without requiring code rebuilds.
* **Interactive Content Management:**
  * Trust Services & Value proposition badge manager.
  * FAQ Builder with inline question-answer editing.
* **Order Tracking & Processing:** Real-time customer order stream with order status management (Pending, Processing, Completed, Cancelled).
* **Live Visitor Analytics:** In-house privacy-conscious event tracking and visitor telemetry.

### ⚡ 3. Enterprise Architecture & Performance
* **Zero-Downtime Real-Time Sync:** Converted from static ISR to **Real-Time Server-Side Rendering (`force-dynamic`)**, ensuring admin updates appear on the live storefront in under 1 second.
* **Optimized MariaDB Connection Pooling:** High-throughput persistent connection pool eliminating WAN handshake latency and preventing concurrency timeouts.
* **Full-Funnel Meta Integration:** Automated Facebook Pixel PageView telemetry & Meta Domain Verification meta tags for ad tracking.
* **Search Engine Optimization (SEO):** Semantic HTML5, dynamic OpenGraph meta tags, canonical URLs, and Schema.org JSON-LD structured data for Google Search.

---

## 🛠️ Tech Stack & Engineering Specifications

| Layer | Technologies |
| :--- | :--- |
| **Framework** | **Next.js 16** (App Router, Server Actions, Standalone Build) |
| **Frontend** | **React 19**, **Tailwind CSS v4**, **Lucide Icons** |
| **Backend & API** | Next.js Server Actions & Route Handlers (`/api/*`) |
| **ORM & Database** | **Prisma ORM 7**, **MariaDB / MySQL** Connection Pooling |
| **Media Processing** | **Sharp** (Automated WebP transcoding, Lanczos3 icon scaling) |
| **Security** | Session cookie authentication, bcryptjs hashing, SQL injection-safe queries |
| **Deployment** | Standalone Node.js runtime on Hostinger Cloud |

---

## 📂 Project Structure Overview

```text
├── app/
│   ├── (public)/              # Customer-facing storefront
│   │   ├── page.js            # Real-time homepage with hero & product grids
│   │   ├── product/[slug]/    # Dynamic product details & JSON-LD
│   │   ├── category/[slug]/   # Category-filtered product listings
│   │   ├── checkout/          # Single-page checkout & delivery calculations
│   │   └── order-success/     # Order confirmation screen
│   ├── admin/                 # Protected Admin Management Suite
│   │   ├── products/          # Product CRUD & Rich Text Editor
│   │   ├── categories/        # Category management
│   │   ├── banners/           # Promotional banner customizer
│   │   ├── orders/            # Order stream & customer invoices
│   │   ├── faq/               # FAQ content manager
│   │   └── services/          # Trust badges customizer
│   ├── api/                   # Server endpoints (Analytics, Uploads, Orders)
│   ├── layout.js              # Root layout, Meta tags, FB Pixel & JSON-LD
│   └── icon.png               # Ultra-crisp 4K brand badge favicon
├── components/                # Reusable UI component library
├── lib/
│   ├── prisma.js              # MariaDB resilient connection pooling singleton
│   ├── api.js                 # Storefront query layer & resilient backups
│   └── uploadHelper.js        # File upload & image storage handler
├── prisma/
│   └── schema.prisma          # Database models (Products, Categories, Orders, Settings)
├── scripts/
│   └── generate-favicons.mjs  # Multi-resolution favicon generator script
└── public/                    # Static assets & public uploads
```

---

## 💻 Local Setup & Development

### 1. Clone the repository
```bash
git clone https://github.com/MdNayem-Dev/agro-mart-platform.git
cd agro-mart-platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="mysql://username:password@localhost:3306/agro_mart_db"
PORT=3000
NODE_ENV=development
```

### 4. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 👨‍💻 Developer & Author

* **Developer:** **Md. Nayem Hossain**
* **GitHub:** [@MdNayem-Dev](https://github.com/MdNayem-Dev)
* **Specialization:** Full-Stack Web Development, Next.js, React, Node.js & Database Architecture.
* **Available for:** Full-time roles, Freelance Contracts, and Custom Web Application Development.

---

*© 2026 Md. Nayem Hossain. Built with passion for modern web engineering.*
