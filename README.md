# Product Admin Dashboard 🚀

A responsive, production-ready Admin Dashboard built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS**. The dashboard integrates with the **DummyJSON API** to provide full CRUD capabilities, pagination, category filtering, search, and sorting.

---

## 🌟 Features

- **🔐 Authentication Flow**: Simple mock login and session persistence using `localStorage` with protected route redirection.
- **📦 Full CRUD Operations**: 
  - **Create**: Add new products via a dynamic modal.
  - **Read**: View products in a structured table (Desktop) or card grid (Mobile).
  - **Update**: Edit existing product details inline via a pre-filled modal.
  - **Delete**: Soft-delete items with safety confirmation modals.
- **🔍 Real-Time Search**: Debounced search bar (400ms delay) to prevent excessive API hits.
- **📂 Filtering & Sorting**: Filter products by category and sort dynamically by Title, Price, or Rating.
- **📄 Server/Client Synchronization**: URL state syncing (`page`, `limit`, `search`, `category`, `sortBy`, `order`) enabling bookmarkable dashboard views.
- **⚡ Race Condition Prevention**: Utilizes native `AbortController` signal canceling to handle out-of-order asynchronous API requests cleanly.
- **📱 Responsive Design**: Custom layout optimized for desktop and mobile viewports using Tailwind CSS.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **API**: [DummyJSON API](https://dummyjson.com/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📁 Project Structure

```text
product-admin-dashboard/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Dashboard Main Page (Suspense wrapped)
│   │   ├── login/
│   │   │   └── page.tsx        # Login Route
│   │   ├── layout.tsx          # Root Layout
│   │   └── page.tsx            # Root Redirect / Landing Page
│   ├── components/
│   │   ├── DeleteConfirmModal.tsx
│   │   └── ProductModal.tsx
│   └── lib/
│       ├── auth.ts             # Auth handlers & localStorage utilities
│       ├── products.ts         # DummyJSON API wrapper functions
│       └── types.ts            # TypeScript Interfaces & Types
├── public/
├── package.json
├── next.config.ts
└── README.md
## Deploy on Vercel
