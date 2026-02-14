# Coffee Export System Monorepo

This repository is now split into independent applications:

- `api/` -> CEOMS backend API (Node.js + Express + Postgres + Prisma)
- `web/` -> CEOMS frontend (Next.js + Tailwind)

## Run API

```bash
cd api
cp .env.example .env
npm install
docker compose up -d
npm run prisma:migrate:dev
npm run dev
```

API default URL: `http://localhost:4000`

## Run Web

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

Web default URL: `http://localhost:3000`

Set `CEOMS_API_URL` in `web/.env` to point at your API URL.

## Notes

- API details and endpoints: `api/README.md`
- Web architecture and env details: `web/README.md`
