# Monarch Predictor — Base44 Dev Environment

## Stack
- **Client**: React 18 + Vite 5 + TypeScript + Tailwind CSS (dark theme, red accent)
- **Server**: Express + TypeScript + Prisma ORM + tsx (live reload)
- **Database**: PostgreSQL 16
- **AI**: OpenAI GPT-4o Vision for screenshot analysis
- **Payments**: Stripe checkout

## Architecture
Single-origin: Vite dev server (port 5173, mapped to host 3000) proxies `/api` and `/uploads` to the Express server (internal port 4000). Auth uses JWT tokens stored in localStorage.

## Running
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
The `migrate` service runs `prisma db push` + seed before the server starts. The server and client use `tsx watch` / `vite` for live reload — edits appear without rebuilding.

## Secrets
External credentials (OpenAI, Stripe, JWT) are delivered via `/run/base44/app.env` and override the placeholders in `.env.base44-defaults`. Without real keys, the app boots in demo mode: AI analysis returns mock predictions, and Stripe checkout grants credits directly (no payment).

## Key files
- `server/prisma/schema.prisma` — database models (User, Analysis, Package, Payment)
- `server/src/routes/analyze.ts` — screenshot upload + OpenAI Vision analysis
- `server/src/routes/stripe.ts` — Stripe checkout + webhook
- `client/src/App.tsx` — routing + auth state
- `client/src/pages/` — Login, Signup, Dashboard, Analyze, Packages, Account
