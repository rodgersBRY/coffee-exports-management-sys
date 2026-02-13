# Contracts Module

## Purpose

Controls outbound commitments and lot allocations to prevent overselling.

## Structure

- `contracts.routes.ts`
- `contracts.controller.ts`
- `contracts.service.ts`
- `contracts.validation.ts`

## Endpoints

- `POST /contracts`
- `POST /contracts/:contractId/allocations`
- `GET /contracts/dashboard`

## Configuration Notes

- Allocation checks enforce:
  - remaining contract quantity
  - remaining lot availability
- Allocation writes run inside a single DB transaction.
- Contracts dashboard includes fulfillment and unallocated risk flags.
