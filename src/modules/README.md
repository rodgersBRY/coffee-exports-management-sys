# Modules Overview

Each module follows the same layering pattern:

- `*.routes.ts`: route map only
- `*.controller.ts`: input parsing and HTTP response handling
- `*.service.ts`: business logic and data access
- `*.validation.ts`: Zod schemas for request contracts (when needed)

Current modules:

- `master`
- `procurement`
- `inventory`
- `contracts`
- `shipments`
- `finance`
- `traceability`
