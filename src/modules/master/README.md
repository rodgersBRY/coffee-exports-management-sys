# Master Module

## Purpose

Owns core reference data used by all transactional modules:

- Suppliers
- Buyers
- Warehouses
- Grades
- Bag types

## Structure

- `master.routes.ts`: HTTP route declarations
- `master.controller.ts`: request parsing + response mapping
- `master.service.ts`: DB operations and business behavior
- `master.validation.ts`: Zod request schemas

## Endpoints

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

## Configuration Notes

- Depends on shared DB config in `src/db/pool.ts`.
- Validation failures are handled by global error middleware.
- No cross-module writes should happen here beyond master tables.
