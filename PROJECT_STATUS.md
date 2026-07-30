# Project Status - StockPilot MVP

This document outlines the current feature completeness, architectural definitions, database schema maps, limitations, and future scopes of the StockPilot MVP.

## ✅ Completed Features

### 🔐 Authentication & Session Control
* User registration, password hashing (bcrypt), and authentication session endpoints.
* Stateless JWT Access Token (15m expiry) and Refresh Token (7d expiry) rotation.
* Hashed refresh tokens stored in database to allow session invalidation on logout.
* Front-end `AuthContext` to persist sessions, refresh tokens automatically, and intercept `401 Unauthorized` responses.

### 🏢 RBAC Role Authorization
* Custom role guards mapped to standard NestJS controller decorators:
  * `ADMIN`: Full write/edit access on all collections, user management CRUD, deactivation rules.
  * `MANAGER`: Full CRUD on products, categories, suppliers, and viewing team logs.
  * `STAFF`: Restricted write access, adjusting stock quantities, viewing dashboard metrics.

### 📦 Product & Inventory Controls
* Dynamic product details creation, safety stock alerts, and SKU auto-generation.
* Safe soft deactivations for categories, suppliers, and products if transaction history exists.
* Atomic stock adjustments (STOCK_IN, STOCK_OUT, ADJUSTMENT override) inside transaction blocks.
* Automated safety limits configuration (min/max triggers).

### 📈 Metrics Dashboard
* Live totals (total products, items, cost valuation, low stock warning count).
* Low stock restock alerts widget and recent transactions table logs.
* Custom, responsive CSS progress meters for category and vendor distribution statistics.

---

## 🏗️ Architecture Overview

The system is designed with a decoupled **Client-Server** model:
* **Backend Monolith (NestJS)**: Follows Modular design, controller-service pattern, and dependency injection. Interceptors validate incoming DTO properties, and global guards handle authorization.
* **Frontend SPA (Next.js)**: Utilizes App Router and client-side page layouts wrapped in an AppLayout shell providing auth-checks and dynamic navigation. Custom fetch wrappers handle token attachments and refresh loops.

---

## 🔌 API Modules Map

All routes are prefixed with `/api`. Documentation is exposed at `/api/docs` via Swagger.

* `/auth`: `POST /register`, `POST /login`, `POST /refresh`, `POST /logout`
* `/users`: `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
* `/categories`: `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
* `/suppliers`: `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
* `/products`: `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
* `/inventory`: `GET /`, `GET /:productId`, `PATCH /:productId/limits`, `POST /:productId/adjust`
* `/transactions`: `GET /`, `GET /:id`
* `/dashboard`: `GET /summary`

---

## 💻 Frontend Page Matrix

* `/login`: Demo credentials hint block and auth validations.
* `/`: Dashboard summary cards, alerts, and distributions progress list.
* `/products`: Catalog table with search, categories/suppliers dropdowns, paginations, and add/edit modals.
* `/inventory`: Current quantities, safety stock status badges, adjust modals, and safety limits configuration.
* `/transactions`: Date-range log queries, search, and type audit filters.
* `/categories` & `/suppliers`: CRUD grids.
* `/users`: Admin-only portal to manage team access, register users, and adjust role bindings.
* `/profile`: Read-only specifications card of active login details.
* `/settings`: Alerts toggle buttons and Swagger docs quick access.
* `/not-found`: Native 404 page handler.

---

## 🗄️ Database Summary

Managed via **Prisma ORM** mapping to a **Neon PostgreSQL** database.

* `User`: Stores emails, hashed passwords, roles (ADMIN/MANAGER/STAFF), and active refresh tokens.
* `Category`: Categories list for grouping catalog products.
* `Supplier`: Vendor details (emails, phone, address).
* `Product`: Product specs (names, SKU, barcode, selling/cost prices).
* `Inventory`: Maps to Product (1-to-1). Tracks quantities, minimum safety alarms, and maximum caps.
* `StockTransaction`: Log of adjustments linked to Inventory (1-to-many) and the handler User (1-to-many).

---

## ⚠️ Known Limitations

1. **Local Storage Session State**: Token state is stored in `localStorage` instead of HttpOnly secure cookies. Suitable for MVP, but should transition for production.
2. **Chart Visualizations**: Dashboard graphs use custom pure CSS/Tailwind progress bars to maintain a lightweight bundle size without charts packages.

---

## 🔮 Future Enhancements

1. **HttpOnly Cookie Storage**: Secure token transmissions.
2. **Batch Product Import**: CSV upload mapping on products catalog.
3. **Recharts/ChartJS Integration**: Interactive historical line graphs of inventory valuations.
