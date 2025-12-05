# Servease (Smart Service Marketplace)

Servease is a full‑stack service marketplace built with Next.js App Router. It connects **customers** with **local service providers** (plumbers, electricians, etc.) and includes booking, reviews, and separate dashboards for users and providers.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript, React 19
- **Styling**: Tailwind CSS, Radix UI, shadcn-style components
- **State Management**: Zustand
- **Forms & Validation**: React Hook Form, Zod
- **Database Access**: `@neondatabase/serverless` (Postgres)
- **Auth**: JWT-based auth via custom API routes & middleware

---

## Getting Started

### 1. Prerequisites

- Node.js 18+ (recommended LTS)
- **pnpm** as the package manager
- A Postgres database (local or hosted, e.g. Neon)

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment variables

Create a `.env.local` file in the project root. Typical variables:

```bash
# Database
DATABASE_URL="postgres://user:password@host:5432/dbname"

# JWT / auth
JWT_SECRET="replace-with-a-strong-secret"

# Optional: Analytics / 3rd party keys
# NEXT_PUBLIC_ANALYTICS_KEY="..."
```

(If you already have an env file from your backend setup, reuse that here.)

### 4. Run the dev server

```bash
pnpm run dev
```

By default this project runs Next on **http://localhost:5000**.

### 5. Production build

```bash
pnpm run build
pnpm start
```

`start` will serve the built app on port 5000.

---

## Main Features

- **Landing / Marketing Page** (`/`)
- **Auth**
  - Login: `/login`
  - Signup (user or provider): `/signup`
- **Customer Experience**
  - Browse/search services: `/services`
  - Book a service via booking modal
  - My bookings: `/bookings`
  - Customer dashboard: `/dashboard`
  - Edit profile: `/profile`
- **Provider Experience**
  - Provider dashboard: `/provider/dashboard`
    - Stats, upcoming bookings, pending booking requests
  - Manage bookings: `/provider/bookings`
    - Filter by status, approve/reject/complete
  - Booking detail & review actions: `/provider/bookings/[id]`
  - Manage services: `/provider/services` & `/provider/services/new`
  - Provider profile/onboarding: `/provider/profile`
  - Public provider page: `/providers/[id]`
- **Reviews**
  - View reviews on service detail page: `/services/[id]`
  - Submit reviews from bookings once completed

For a detailed, file‑level feature breakdown see `FEATURE_STATUS.md`.

---

## API Overview

All APIs are implemented under `app/api/*` using Next.js Route Handlers.

Key groups:

- **Auth & User**: login/signup, user profile
- **Services**: CRUD, provider services listing, public service details
- **Bookings**: create booking, list by user/provider, update status
- **Reviews**: create/read reviews
- **Provider**: profile, stats, notifications

More detailed docs:

- `PROVIDER_API_REFERENCE.md` – provider‑facing API endpoints
- `API_TESTING_GUIDE.md` – Postman setup, sample requests, and test checklist

---

## Testing & API Validation

See **`API_TESTING_GUIDE.md`** for:

- Importing the Postman collection (`postman-collection.json`)
- Recommended manual test scenarios for services, bookings, reviews
- Example cURL commands

Zod schemas are used on the backend to validate request payloads; common error codes are described in `PROVIDER_API_REFERENCE.md` under **Error Codes**.

---

## Project Scripts

Defined in `package.json`:

- `pnpm dev` – Run Next.js dev server on port 5000
- `pnpm build` – Production build
- `pnpm start` – Start production server (after build)
- `pnpm lint` – Run ESLint over the project

---

## Notes & Future Work

- Admin panel is **not implemented** yet (no `/admin` UI).
- Potential future enhancements:
  - Admin dashboard & moderation tools
  - Email / push notifications for bookings
  - Payment integration
  - Advanced service filters & provider verification

For current feature completeness, see `FEATURE_STATUS.md`.
