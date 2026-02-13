# Master Module

## Purpose
- Manages core entities required by all workflows: suppliers, buyers, warehouses, grades, and bag types.

## Files
- `config.ts`: reusable panel configuration (fields, endpoints, default sort/filter behavior).

## Notes
- Uses standardized list query contract:
  - `page`, `page_size`, `sort_by`, `sort_order`, `search`, `filter_*`.
