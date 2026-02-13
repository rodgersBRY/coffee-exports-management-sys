# Common Layer

Shared cross-module utilities:

- `errors/ApiError.ts`: explicit application error class
- `middleware/asyncHandler.ts`: async route wrapper
- `middleware/errorHandler.ts`: centralized error mapping
- `dbHelpers.ts`: domain-level DB helper functions reused across services

Use this folder only for reusable concerns that apply across multiple modules.
