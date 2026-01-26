# MyPG Frontend (Next.js)

Minimal Next.js React UI for the MyPG backend: login/signup, list/create PGs, rooms, beds, and tenants.

## Setup

1. Create env file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set `BACKEND_URL` (default `http://localhost:8000`).

2. Install and run:

```bash
npm install --no-bin-links
npm run dev
```

Visit http://localhost:3000

## Proxy & Cookies
- Frontend calls use `/api/*` proxied to `BACKEND_URL` via `next.config.js` rewrites.
- This keeps same-origin for cookies; login sets `access_token` httpOnly cookie, and fetch uses `credentials: 'include'`.

## Navigation
- PGs: list and create (admin-only)
- Rooms/Beds: view and create under PG/Room
- Tenants: list and create

## Notes
- Creating PG requires admin; others are currently public per backend.
- If CORS/cookie issues occur, ensure proxy works (same origin) or configure backend CORS with `allowCredentials` and origin whitelist.
- SRS features like attendance, complaints, and detailed rent flows are not yet exposed by the backend; UI focuses on existing endpoints.Hello