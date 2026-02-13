# Shipments Module

## Purpose

Converts allocations into shipments, enforces shipment lifecycle rules, and generates shipment documents.

## Structure

- `shipments.routes.ts`
- `shipments.controller.ts`
- `shipments.service.ts`
- `shipments.validation.ts`

## Endpoints

- `POST /api/v1/shipments`
- `PATCH /api/v1/shipments/:shipmentId/status`
- `POST /api/v1/shipments/:shipmentId/documents/generate`
- `GET /api/v1/shipments/:shipmentId/documents`

## Configuration Notes

- Shipment creation is transaction-based and:
  - moves allocations from `allocated` to `shipped`
  - updates contract shipped quantity/status
  - snapshots traceability JSON on shipment
- Status updates cannot move backwards in workflow progression.
- Document payloads are generated from shipment + contract + allocation data.
