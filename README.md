# 🛒 ShopKart — Modern MERN E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%20v7-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay%20Integrated-02042B?style=flat&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**ShopKart** is a production-ready, full-stack e-commerce web application built with the **MERN** stack (MongoDB, Express, React, Node.js) and powered by **Vite**. It features customer authentication via HTTP-only JWT cookies, product catalog filtering, interactive cart & wishlist management, an integrated Razorpay payment gateway (with a zero-config built-in mock mode), order lifecycle tracking, and 8 curated UI color themes.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Directory Structure](#-architecture--directory-structure)
- [Design & Multi-Theme System](#-design--multi-theme-system)
- [Payment Gateway Flow (Razorpay + Mock Mode)](#-payment-gateway-flow-razorpay--mock-mode)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [Adding Initial Products (Seeding)](#3-adding-initial-products-seeding)
- [Running in Production](#-running-in-production)
- [Environment Variables](#-environment-variables)
- [Scripts Reference](#-scripts-reference)
- [License](#-license)

---

## ✨ Features

### 👤 Customer Authentication & Security
- **JWT & HTTP-Only Cookies**: Secure customer sessions using `auth_token` stored in HTTP-only, SameSite cookies (with fallback support for `Authorization: Bearer <token>`).
- **Password Protection**: Passwords salted and hashed with **bcrypt** (10 salt rounds).
- **Profile Management**: Fast account status verification (`/customers/me`) and authenticated password update with old password verification.

### 🛍️ Product Exploration & Catalog
- **Instant Search**: Real-time keyword search matched against product names using case-insensitive regex.
- **Categorical Browsing**: Filter items by department (e.g. *Home & living*, *Everyday picks*, *Personal care*).
- **Flexible Sorting**: Sort items by price ascending (`price_asc`), price descending (`price_desc`), or newest arrivals.
- **Rich Product Details**: High-resolution imagery, detailed descriptions, live inventory stock badges, and interactive quantity pickers.

### ❤️ Wishlist & Cart System
- **Database-Backed Wishlist**: One-click toggling of favorite items, persisted directly on the MongoDB customer document.
- **Dynamic Shopping Cart**: Real-time stock validation, automated price calculations, and fine-grained quantity controls directly from product cards or the cart page.
- **Interactive Toasts**: Instant visual confirmation when products are added to the cart, with a quick shortcut to checkout.

### 💳 Checkout & Order Processing
- **Address Validation**: Strict client and server validation for shipping destination, including full name, 10-digit mobile number, address, city, state, and 6-digit postal pincode.
- **Dual-Mode Razorpay Gateway**:
  - **Live / Test Mode**: Direct integration with Razorpay checkout SDK (`checkout.js`) with server-side HMAC SHA-256 signature verification.
  - **Zero-Config Mock Mode**: If no Razorpay keys are supplied in `.env`, ShopKart automatically launches a realistic test payment modal, allowing complete checkout simulation without third-party credentials.
- **Automated Inventory Control**: Stock levels are deducted immediately upon successful payment verification.

### 📦 Order Management & Tracking
- **Order History**: View past orders, payment receipts, items purchased, shipping address, and live statuses.
- **Status Lifecycle**: `PENDING_PAYMENT` ➔ `PLACED` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED` (or `CANCELLED`).
- **Cancellation & Stock Restoration**: Customers can cancel pending/placed orders with a custom cancellation reason; inventory is automatically credited back to products in MongoDB.

---

## 🛠️ Tech Stack

### Frontend
- **Library**: [React 18](https://react.dev/)
- **Build Tool & Dev Server**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **State Management**: React Context API (`CartContext`, `ThemeContext`)
- **Styling**: Vanilla CSS3 design system with CSS custom properties, keyframe animations, glassmorphism, and responsive layouts
- **Typography**: Google Fonts (*DM Sans* & *Playfair Display*)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES6+ / CommonJS)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database ODM**: [Mongoose v7](https://mongoosejs.com/)
- **Authentication**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Cookies**: [cookie-parser](https://github.com/expressjs/cookie-parser)
- **Payment Gateway**: [Razorpay Node SDK](https://github.com/razorpay/razorpay-node)
- **Dev Tooling**: [Nodemon](https://nodemon.io/)

### Database
- **MongoDB**: Compatible with MongoDB Atlas or local MongoDB instances.

---

## 📂 Architecture & Directory Structure

```text
Shop Kart/
├── backend/
│   ├── controllers/
│   │   ├── cart.controller.js        # Cart manipulation & stock checking
│   │   ├── customer.controller.js    # Auth (register, login, me, logout, change-password)
│   │   ├── order.controller.js       # Order creation, verification, cancellation, listing
│   │   ├── product.controller.js     # Product listing, search, details, creation
│   │   └── wishlist.controller.js    # Wishlist add/remove/list
│   ├── middlewares/
│   │   └── auth.middleware.js        # Cookie & Bearer JWT token verification
│   ├── models/
│   │   ├── customer.model.js         # Customer schema with embedded cart & wishlist refs
│   │   ├── order.model.js            # Order schema with items, address, status, timestamps
│   │   └── product.model.js          # Product schema (name, description, price, category, stock, image)
│   ├── routes/
│   │   ├── cart.routes.js            # /cart routes
│   │   ├── customer.routes.js        # /customers routes
│   │   ├── order.routes.js           # /orders routes
│   │   ├── product.routes.js         # /products routes
│   │   └── wishlist.routes.js        # /wishlist routes
│   ├── utils/
│   │   └── generateToken.js          # JWT token signing helper
│   ├── .env.example                  # Template environment variables
│   ├── index.js                      # Express app entry point & database connection
│   └── package.json
│
├── frontend/
│   ├── public/                       # Static public assets
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Brand.jsx             # ShopKart logo component
│   │   │   ├── CartAddedToast.jsx    # Pop-up toast notification
│   │   │   ├── CartItem.jsx          # Individual cart item row
│   │   │   ├── CartProductControl.jsx# Quantity +/- controls
│   │   │   ├── Layout.jsx            # Shared page wrappers
│   │   │   ├── Navbar.jsx            # Header navigation & theme picker
│   │   │   ├── ProductCard.jsx       # Grid card preview for products
│   │   │   ├── SearchBar.jsx         # Live search input
│   │   │   └── WishlistCard.jsx      # Wishlist product tile
│   │   ├── context/
│   │   │   ├── CartContext.jsx       # Cart global state provider
│   │   │   └── ThemeContext.jsx      # Multi-theme state provider & localStorage sync
│   │   ├── pages/                    # Route-level page components
│   │   │   ├── Cart.jsx              # Cart review & summary
│   │   │   ├── Checkout.jsx          # Shipping address & Razorpay checkout
│   │   │   ├── Home.jsx              # Landing hero, categories, new arrivals
│   │   │   ├── Login.jsx             # Customer sign-in
│   │   │   ├── OrderDetails.jsx      # Single order summary & cancellation
│   │   │   ├── Orders.jsx            # Customer order history
│   │   │   ├── OrderSuccess.jsx      # Post-payment order receipt
│   │   │   ├── Password.jsx          # Password modification
│   │   │   ├── ProductDetails.jsx    # Detailed product view
│   │   │   ├── Products.jsx          # Filterable & searchable product directory
│   │   │   ├── Register.jsx          # Customer registration
│   │   │   └── Wishlist.jsx          # Saved items view
│   │   ├── services/
│   │   │   └── api.js                # Centralized client-side API layer
│   │   ├── App.jsx                   # Main application router & route authentication
│   │   ├── main.jsx                  # React application DOM root
│   │   └── styles.css                # Global CSS design tokens, themes & component styles
│   ├── index.html                    # Single page HTML entry
│   ├── vite.config.js                # Vite configuration with API reverse proxy
│   └── package.json
│
└── README.md                         # Project documentation
```

---

## 🎨 Design & Multi-Theme System

ShopKart is engineered with a distinctive design language, pairing classical editorial typography (*Playfair Display*) with clean geometric sans-serif body type (*DM Sans*), subtle radial dot-mesh backdrops, and interactive micro-animations.

The application includes **8 built-in curated color themes**, switchable in real-time from the header navigation bar:

| Theme | Type | Characteristics |
| :--- | :--- | :--- |
| **Light** | Light | Warm ivory background (`#f8f6f0`), dark slate typography, forest green accents |
| **Dark** | Dark | Deep pine tones (`#151c1b`), soft mint headers, coral highlights |
| **Midnight** | Dark | Deep navy palette (`#111827`), cyan accents, warm amber tags |
| **Graphite** | Dark | Charcoal aesthetic (`#17191b`), subdued silver text, terracotta highlights |
| **Berry** | Dark | Rich plum tone (`#1e1720`), vibrant rose-gold accents |
| **Ocean** | Light | Crisp sea-foam background (`#edf7f6`), deep teal buttons, warm copper accents |
| **Rose** | Light | Soft blush canvas (`#fff4f4`), deep wine typography, ruby action buttons |
| **Forest** | Light | Organic sage canvas (`#f2f5ed`), olive green accents, amber badges |

*Preferences are automatically saved to `localStorage` under `shopkart-theme` and applied via `data-theme` on `<html>`.*

---

## 💳 Payment Gateway Flow (Razorpay + Mock Mode)

ShopKart delivers a frictionless payment pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer
    participant UI as Frontend (Checkout.jsx)
    participant API as Backend (order.controller.js)
    participant DB as MongoDB
    participant RZP as Razorpay / Mock Gateway

    User->>UI: Fills Shipping Details & clicks "Pay"
    UI->>API: POST /orders/create-payment-order (with shippingAddress)
    API->>DB: Check stock & create Order (status: PENDING_PAYMENT)
    
    alt Real Razorpay Keys Configured
        API->>RZP: razorpay.orders.create({ amount, currency: "INR" })
        RZP-->>API: returns razorpayOrderId
        API-->>UI: { success: true, razorpayOrderId, shopKartOrderId }
        UI->>RZP: Opens official Razorpay modal (checkout.js)
        User->>RZP: Completes payment
        RZP-->>UI: returns payment_id & signature
    else Mock Mode (Keys omitted / placeholders)
        API-->>UI: { success: true, mockMode: true, shopKartOrderId, razorpayOrderId }
        UI->>User: Displays ShopKart built-in Test Checkout Modal
        User->>UI: Clicks "Complete Test Payment"
    end

    UI->>API: POST /orders/verify-payment (with signature / mock tokens)
    API->>API: Verify HMAC-SHA256 signature (or validate mock token)
    API->>DB: Deduct product stock & clear customer's cart
    API->>DB: Mark order status: PLACED, paymentStatus: PAID
    API-->>UI: { success: true, order }
    UI->>User: Navigates to /order-success/:orderId
```

---

## 📡 API Reference

All protected endpoints require an authenticated session cookie or `Authorization: Bearer <token>`.

### Authentication (`/customers`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/customers/register` | No | Register customer (`fullName`, `email`, `phone`, `password`) |
| `POST` | `/customers/login` | No | Login customer; sets HTTP-only `token` cookie |
| `GET` | `/customers/me` | **Yes** | Fetch current logged-in customer profile |
| `POST` | `/customers/logout` | **Yes** | Clear authentication cookie |
| `PATCH` | `/customers/change-password` | **Yes** | Update password (`oldPassword`, `newPassword`) |

### Products (`/products`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/products` | No | List products. Supports `?search=`, `?category=`, and `?sort=` (`price_asc`, `price_desc`, `newest`) |
| `GET` | `/products/:id` | No | Retrieve product details by ID |
| `POST` | `/products` | No | Create product (`name`, `description`, `price`, `category`, `image`, `stock`) |

### Wishlist (`/wishlist`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/wishlist` | **Yes** | Retrieve all wishlist products for the user |
| `POST` | `/wishlist/:productId` | **Yes** | Add a product to the user's wishlist |
| `DELETE` | `/wishlist/:productId` | **Yes** | Remove a product from the user's wishlist |

### Cart (`/cart`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/cart` | **Yes** | Retrieve populated cart items & quantities |
| `POST` | `/cart/:productId` | **Yes** | Add item to cart or increment quantity |
| `PATCH` | `/cart/:productId` | **Yes** | Update exact item quantity `{ quantity: number }` |
| `DELETE` | `/cart/:productId` | **Yes** | Remove item completely from cart |

### Orders & Checkout (`/orders`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/orders/create-payment-order` | **Yes** | Validate address & stock; initiate Razorpay/mock order |
| `POST` | `/orders/verify-payment` | **Yes** | Verify payment, deduct stock, and finalize order |
| `GET` | `/orders` | **Yes** | List all orders placed by the current user |
| `GET` | `/orders/:id` | **Yes** | Fetch detailed order summary |
| `POST` | `/orders/:id/cancel` | **Yes** | Cancel order (`{ reason }`) and restore inventory |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (either a local instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

---

### 1. Backend Setup

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `backend/.env` with your settings:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopkart?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development

   # Optional: Add real Razorpay keys to enable real payments
   # If left blank or containing placeholder text, ShopKart operates in Mock Mode automatically!
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will be running on `http://localhost:5173`.*

> **Note**: In development mode, Vite automatically proxies `/customers`, `/products`, `/wishlist`, `/cart`, and `/orders` requests to `http://localhost:5000`.

---

### 3. Adding Initial Products (Seeding)

To populate your catalog with products, you can send `POST` requests to `http://localhost:5000/products`:

```bash
curl -X POST http://localhost:5000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ceramic Pour-Over Coffee Dripper",
    "description": "Handcrafted minimalist ceramic dripper designed for optimal water flow and rich morning brew extracts.",
    "price": 1499,
    "category": "Home",
    "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    "stock": 25
  }'
```

```bash
curl -X POST http://localhost:5000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Linen Throw Blanket",
    "description": "Breathable, pre-washed European linen throw to add subtle texture and comfort to your lounge space.",
    "price": 2899,
    "category": "Home",
    "image": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    "stock": 14
  }'
```

```bash
curl -X POST http://localhost:5000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Botanical Face & Beard Oil",
    "description": "Cold-pressed jojoba and argan oil infused with cedarwood for deep hydration and a natural subtle shine.",
    "price": 899,
    "category": "Personal care",
    "image": "https://images.unsplash.com/photo-1608248597359-5975b94fef40?auto=format&fit=crop&w=800&q=80",
    "stock": 40
  }'
```

---

## 🚢 Running in Production

To bundle and serve the entire full-stack app from the Express server:

1. Build the React frontend production bundle:
   ```bash
   cd frontend
   npm run build
   ```
   *This compiles optimized static assets into `frontend/dist`.*

2. Configure backend environment:
   In `backend/.env`, set:
   ```env
   NODE_ENV=production
   ```

3. Start the Express server:
   ```bash
   cd ../backend
   npm start
   ```
   *Express statically serves the frontend bundle located in `../frontend/dist`. You can now open `http://localhost:5000` to access the full application!*

---

## 🔑 Environment Variables

| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `PORT` | Port for Express server | No (Default: `5000`) | `5000` |
| `MONGO_URI` | MongoDB connection string | **Yes** | `mongodb+srv://user:pass@cluster.mongodb.net/shopkart` |
| `JWT_SECRET` | Secret key for signing JWT tokens | **Yes** | `f8a3c9b1...` |
| `NODE_ENV` | Environment mode (`development` or `production`) | No | `development` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | No *(triggers Mock Mode if omitted)* | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET`| Razorpay Key Secret | No *(triggers Mock Mode if omitted)* | `secret_...` |

---

## 📜 Scripts Reference

### Backend (`/backend`)
| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the backend server with **nodemon** auto-reloading |
| `npm start` | Starts the production server with Node |

### Frontend (`/frontend`)
| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server |
| `npm run build` | Compiles and optimizes assets into `frontend/dist` |
| `npm run preview`| Locally previews the production build |

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
