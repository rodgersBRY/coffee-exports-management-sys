# Coffee Export Operations Management System (CEOMS)

Phase 1 backend scaffold for a lot-native coffee export operations system.

## Stack

- API: Node.js + TypeScript + Express
- Database: PostgreSQL
- Schema management: Prisma (`prisma/schema.prisma`)
- Runtime DB access: `pg` with transaction-safe service logic

## Architecture

Codebase is organized for enterprise maintainability with separated layers:

- `src/app`: Express app setup and centralized route registration
- `src/config`: environment and runtime config
- `src/db`: connection pool and transaction helper
- `src/common`: shared middleware, errors, and reusable DB/domain helpers
- `src/modules/*`: domain modules with strict separation:
  - `*.routes.ts`
  - `*.controller.ts`
  - `*.service.ts`
  - `*.validation.ts` (where needed)

Each module has its own `README.md` under `src/modules/<module>/README.md`.

## What is implemented

- Master data: suppliers, buyers, warehouses, grades, bag types
- Procurement:
  - Auction lots
  - Direct agreements and deliveries
- Inventory:
  - Lot-level stock tracking
  - Stock adjustments with approvals
  - Inventory dashboard
- Contracts and allocations:
  - Contract creation
  - Allocation guardrails (prevents over-allocation and double-selling)
  - Contract dashboard and risk alerts
- Shipments:
  - Shipment creation from allocations
  - Traceability snapshot freeze on shipment creation
  - Shipment status progression checks
- Documents:
  - Commercial invoice
  - Packing list
  - Traceability report
  - Cost breakdown summary
- Costing/profitability:
  - Cost entry capture
  - Contract profitability endpoint
- Traceability:
  - Backward/forward traceability endpoint per lot

## Quick start

1. Copy env file:

```bash
cp .env.example .env
```

2. Start Postgres:

```bash
docker compose up -d
```

3. Install dependencies:

```bash
npm install
```

4. Create database schema with Prisma:

```bash
npm run prisma:migrate:dev
```

5. Start API:

```bash
npm run dev
```

API runs at `http://localhost:4000`.

## Prisma workflow

- Update `prisma/schema.prisma`
- Generate and apply migration locally:

```bash
npm run prisma:migrate:dev
```

- In deployment environments:

```bash
npm run prisma:migrate:deploy
```

## Key endpoints

- `POST /master/suppliers`
- `GET /master/suppliers`
- `POST /master/buyers`
- `GET /master/buyers`
- `POST /master/warehouses`
- `GET /master/warehouses`
- `POST /master/grades`
- `GET /master/grades`
- `POST /master/bag-types`
- `GET /master/bag-types`
- `POST /procurement/auction-lots`
- `POST /procurement/direct-agreements`
- `GET /procurement/direct-agreements`
- `POST /procurement/direct-deliveries`
- `GET /inventory/lots`
- `POST /inventory/adjustments`
- `GET /inventory/dashboard`
- `POST /contracts`
- `POST /contracts/:contractId/allocations`
- `GET /contracts/dashboard`
- `POST /shipments`
- `PATCH /shipments/:shipmentId/status`
- `POST /shipments/:shipmentId/documents/generate`
- `GET /shipments/:shipmentId/documents`
- `POST /costs/entries`
- `GET /profitability/contracts/:contractId`
- `GET /traceability/lots/:lotId`

## Important business guarantees in the API

- Lot inventory is identity-based (`lot_code`) and source-aware (`auction` vs `direct`)
- Allocation cannot exceed:
  - Remaining contract quantity
  - Remaining lot availability
- Shipment cannot over-fulfill contract quantity
- Shipment status cannot move backwards
- Shipment creation freezes a traceability snapshot for auditability
