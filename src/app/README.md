# App Configuration Layer

## Files

- `createApp.ts`: builds and configures Express instance
- `registerRoutes.ts`: central route mounting for all modules

## Responsibilities

- Configure middleware (`express.json`)
- Expose health endpoint (`/health`)
- Mount domain routers
- Register global error middleware

## Design Rules

- Keep this layer framework-only.
- Do not place SQL/business logic here.
