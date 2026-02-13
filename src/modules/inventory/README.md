# Inventory Module

## Purpose

Maintains lot-level stock state and visibility.

## Structure

- `inventory.routes.ts`
- `inventory.controller.ts`
- `inventory.service.ts`
- `inventory.validation.ts`

## Endpoints

- `GET /api/v1/inventory/lots`
- `POST /api/v1/inventory/adjustments`
- `GET /api/v1/inventory/dashboard`

## Configuration Notes

- Stock adjustments are transaction-protected.
- Lot status transitions are recalculated through shared helper `refreshLotStatus`.
- Dashboard aggregates physical, allocated, and available stock by grade and source.
