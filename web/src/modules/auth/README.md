# Auth Module

## Purpose
- Handles login, register, logout, and session retrieval for CEOMS Web.

## Files
- `api.ts`: browser-side auth API functions against Next route handlers (`/api/auth/*`).
- `useSessionQuery.ts`: React Query hook for authenticated session state.
- `LoginForm.tsx`: sign-in UI.
- `RegisterForm.tsx`: account creation UI.

## Notes
- Tokens are not stored in local storage.
- Session tokens are managed by server-side HTTP-only cookies.
