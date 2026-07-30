# StockPilot - Modern Inventory Management Platform MVP

StockPilot is a production-quality, responsive inventory and warehouse management system designed to streamline stockroom audits, trace inventory valuations, and log operator adjustments with an immutable audit log.

## 🚀 Key Features

* **Authentication & RBAC**: Secure sessions (JWT access/refresh tokens) with Role-Based Access Control (`ADMIN`, `MANAGER`, `STAFF`).
* **Interactive Dashboard**: Real-time stock valuation graphs, low-stock restock lists, audit counts, and category/vendor charts.
* **Product Catalog**: SKU auto-generation, barcode registration, category/supplier linkages, pricing, and active status control.
* **Audit Trail logs**: Complete audit logging of all `STOCK_IN`, `STOCK_OUT`, and `ADJUSTMENT` operations signed by active operators.
* **Safety Stock Alarms**: Custom triggers for minimum/maximum safety stock limits per product with low-stock alerts.

---

## 🛠️ Architecture & Tech Stack

### Backend
* **NestJS 11**: Modular controller/service architecture with dependency injection.
* **TypeScript**: Type-safe REST APIs.
* **Prisma ORM**: Modern database access and schema migrations.
* **Neon PostgreSQL**: Fully serverless AWS PostgreSQL database.
* **Swagger**: Automatic API schema validation and interactive documentation.
* **bcrypt & Passport**: Hashed credentials and stateless JWT authentication.

### Frontend
* **Next.js 16 (App Router)**: Fast, server-rendered components.
* **React 19**: Modern declarative UI hooks.
* **Tailwind CSS v4**: Sleek, themeable inline utility styling.
* **Lucide React**: Clean developer iconography.

---

## ⚙️ Running Locally

### Prerequisites
* Node.js v18 or higher
* npm or yarn

### 1. Database Seed Setup (Neon PostgreSQL)
The backend requires a configured `.env` file containing the Neon database URL (already set up in `backend/.env`).
To initialize schema and populate realistic demo records, run:
```bash
cd backend
npx prisma db push
npx prisma db seed
```

### 2. Launch Backend
From the `backend` folder:
```bash
npm run dev
```
* **REST API URL**: `http://localhost:3001/api`
* **Swagger Docs URL**: `http://localhost:3001/api/docs`

### 3. Launch Frontend
From the `frontend` folder:
```bash
npm run dev
```
* **Application URL**: `http://localhost:3000`

---

## 🔑 Demo Access Credentials

The database seed script generates the following test accounts:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@stockpilot.com` | `password123` |
| **Manager** | `manager@stockpilot.com` | `password123` |
| **Staff Member** | `staff@stockpilot.com` | `password123` |