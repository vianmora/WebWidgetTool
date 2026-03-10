# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A Dockerized tool for creating and managing embeddable widgets (currently: Google Reviews) that can be injected into any HTML site via a `<script>` tag. Single-admin authentication via environment variables.

## Development commands

### Backend (`apps/backend/`)
```bash
npm run dev       # ts-node-dev with hot reload on port 4000
npm run build     # tsc compile to dist/
npm start         # run compiled dist/index.js
npx prisma migrate dev --name <name>   # create a new migration
npx prisma generate                    # regenerate Prisma client after schema changes
npx prisma migrate deploy              # apply migrations (used in production/Docker)
```

### Frontend (`apps/frontend/`)
```bash
npm run dev       # Vite dev server on port 3000 (proxies /api and /widget to :4000)
npm run build     # tsc + vite build
```

### Docker (run from repo root)
```bash
# Dev — two containers (backend + postgres) + local frontend dev server
docker compose -f docker/compose.dev.yml up --build

# Prod — all-in-one image (frontend bundled into backend) + postgres
docker compose -f docker/compose.prod.yml --env-file .env.prod up --build -d

# Pre-built Docker Hub image
docker compose -f docker/compose.prod.hub.yml --env-file .env.prod up -d
```

## Architecture

### Deployment modes

1. **Dev mode** (`compose.dev.yml`): backend on :4000, Vite dev server on :3000. Vite proxies `/api` and `/widget` to the backend.
2. **All-in-one prod** (`Dockerfile` / `compose.prod.yml`): multi-stage build. React SPA is compiled and copied into `backend/public/app/`. The backend detects this folder at startup and serves the SPA statically, acting as both API server and static file host on port 4000.

### Request routing (backend `src/index.ts`)

| Path prefix | CORS policy | Auth |
|---|---|---|
| `/api/auth` | `FRONTEND_URL` only | none |
| `/api/widgets` | `FRONTEND_URL` only | JWT required |
| `/api/places` | `FRONTEND_URL` only | JWT required |
| `/widget` | open | none |
| `/widget.js` | open | none |

### Google Reviews data flow

1. `GET /widget/:id/reviews` (public) — checks `node-cache` first; on miss, fetches from Google Places API using `GOOGLE_MAPS_API_KEY` (env var takes precedence over per-widget `config.apiKey`)
2. Google profile photos are proxied through `GET /widget/image?url=…` (whitelist: `lh3–lh6.googleusercontent.com`) to avoid 429 errors from browsers
3. Cache TTL defaults to 7 days (`GOOGLE_REVIEWS_CACHE_TTL`). Cache is invalidated on widget PATCH.

### Key files

- `apps/backend/src/index.ts` — Express app setup, CORS split, SPA serving logic
- `apps/backend/src/routes/public.ts` — public widget data endpoint + image proxy
- `apps/backend/src/lib/google.ts` — Google Places API calls (`searchPlaces`, `fetchGoogleReviews`)
- `apps/backend/src/lib/cache.ts` — `node-cache` singleton (TTL from env)
- `apps/frontend/src/lib/api.ts` — axios instance with JWT interceptor; redirects to `/login` on 401
- `apps/frontend/src/App.tsx` — React Router setup, `PrivateRoute` guard (checks `localStorage.token`)

## Environment variables

Copy `.env.example` to `.env`. Key variables:

| Variable | Required | Notes |
|---|---|---|
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | yes | single admin, no DB users |
| `JWT_SECRET` | yes | sign with `openssl rand -hex 32` in prod |
| `GOOGLE_MAPS_API_KEY` | yes | Places API enabled; falls back to per-widget key if unset |
| `VITE_API_URL` | dev only | baked into frontend build; empty = same origin |
| `FRONTEND_URL` | yes | used for CORS on `/api/*` routes |
| `APP_URL` | prod only | public URL, used in embed snippets |
| `GOOGLE_REVIEWS_CACHE_TTL` | no | seconds, default 604800 (7 days) |
| `APIFY_TOKEN` | no | si renseigné, utilise Apify (`compass/google-maps-reviews-scraper`) pour récupérer les avis sans limite des 5 et avec photos. Sinon fallback Google Places API. Token sur console.apify.com |

## Database

Single Prisma model `Widget` with a `config: Json` field (JSONB in Postgres). The `config` object for `google_reviews` type:

```json
{
  "placeId": "ChIJ...",
  "apiKey": "AIza...",
  "maxReviews": 5,
  "minRating": 4,
  "theme": "light",
  "accentColor": "#4F46E5",
  "layout": "list",
  "language": "fr"
}
```

Migrations live in `apps/backend/prisma/migrations/`. Run `prisma migrate deploy` (not `dev`) in production/Docker.

## CI

`.github/workflows/docker-publish.yml` — pushes a multi-arch (`linux/amd64,linux/arm64`) image to Docker Hub on every push to `main`, but skips the push if the existing `latest` tag was pushed less than 24 hours ago. Manual `workflow_dispatch` bypasses this check. Requires `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets.

## Comment travailler ensemble

1. Notre discussion est en français, le code est en anglais
2. Les modifications de fix se font dans la branche `developp`
3. Les ajouts de feature se font dans une branche dédiée ; je te dirai au début de créer une branche pour une feature spécifique
4. Quand je te dis de commit, tu commits dans `developp` si c'est un fix, dans la branche de feature si on travaille sur une feature
5. Quand je te dis de merge la branche de feature : merge dans `developp`, puis `developp` dans `main`, puis incrémenter le tag **mineur** (`Majeur.mineur+1.0`)
6. Quand je te dis de merge la branche `developp` : merge dans `main`, puis incrémenter uniquement le tag **fix** (`Majeur.mineur.fix+1`)
7. Je te le dirai si on incrémente un jour la version majeure
8. Quand tu as fini une instruction, tu dois t'assurer :
   - De mettre à jour la doc si besoin (doc de self host ou doc d'utilisation générale selon le cas)
   - De mettre à jour ce fichier CLAUDE.md si tu trouves quelque chose d'utile à retenir pour la prochaine session
   - D'ajouter une entrée dans `CLAUDE_HISTORIQUE.md` (format : `| date | demande résumée | action effectuée |`)
9. Si tu veux que je relance quelque chose, donne moi la commande explicite à chaque fois

## Versioning

- Version actuelle : **v0.3.0**
- Format : `vMajeur.mineur.fix`
- Tags git sur `main` uniquement (ex: `git tag v0.3.1 && git push origin v0.3.1`)