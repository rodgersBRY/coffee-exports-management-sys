# CEOMS Web (Next.js)

Enterprise frontend for CEOMS API.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS for UI styling
- React Query for server state
- Zustand for lightweight UI state (toast notifications)
- Secure server-side API proxy (BFF pattern)

## Architecture
- `src/app`: routes, layouts, and Next route handlers
- `src/components`: shared UI/layout/data components
- `src/lib`: core infrastructure (API clients, auth/session, env, errors, query utils)
- `src/modules/*`: domain-focused module configs and feature components

## Security Model
- Browser calls Next route handlers, not CEOMS API directly.
- Access/refresh/CSRF tokens are stored as HTTP-only cookies.
- `/api/bff/[...path]` injects auth, CSRF, idempotency key, and retries once on 401 via refresh token.
- Backend URL remains server-side via `CEOMS_API_URL`.

## Environment
Copy env file:

```bash
cp .env.example .env
```

Required values:
- `CEOMS_API_URL` (example: `http://localhost:4000`)
- `SESSION_COOKIE_SECURE` (`true` in production with HTTPS)

## Scripts
```bash
npm install
npm run dev
npm run check
npm run build
```

## API coverage
- Auth/session + API keys
- Master data
- Procurement
- Inventory + dashboard
- Contracts + allocations
- Shipments + docs
- Cost entries + profitability
- Traceability

## Operational notes
- List endpoints use common query standard (`page`, `page_size`, `sort_*`, `search`, `filter_*`).
- Mutating requests attach an idempotency key automatically.
