# Docker — fichiers Compose

Ce dossier contient tous les fichiers Docker Compose du projet.

## Vue d'ensemble

| Fichier | Cible | Build | Conteneurs |
|---|---|---|---|
| `compose.dev.yml` | Développement | Local | 3 (postgres + backend + frontend) |
| `compose.prod.yml` | Production | Local (all-in-one) | 2 (postgres + app) |
| `compose.prod.hub.yml` | Production | Docker Hub | 3 (postgres + backend + frontend) |
| `compose.coolify.yml` | Coolify | Local (all-in-one) | 2 (postgres + app) |
| `compose.coolify.hub.yml` | Coolify | Docker Hub | 3 (postgres + backend + frontend) |

---

## compose.dev.yml — Développement

Build local des images backend et frontend depuis les sources.
À utiliser en développement ou pour tester avant de pousser.

```bash
# Depuis la racine du projet
docker compose -f docker/compose.dev.yml up --build
```

- Backend sur `http://localhost:4000`
- Frontend sur `http://localhost:3000`
- Les variables `VITE_API_URL` et `FRONTEND_URL` se configurent dans `.env`

---

## compose.prod.yml — Production (build local)

Build d'une image **all-in-one** depuis le `Dockerfile` racine : le frontend React
est compilé et embarqué directement dans le conteneur Node.js. Un seul conteneur
applicatif sert à la fois le dashboard et l'API.

```bash
cp .env.example .env.prod
# Remplir : APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET,
#           GOOGLE_MAPS_API_KEY, POSTGRES_PASSWORD

docker compose -f docker/compose.prod.yml --env-file .env.prod up --build -d
```

- App sur `http://localhost:${PORT:-4000}`
- Mettre un reverse proxy (Nginx, Caddy, Traefik…) devant pour le HTTPS

---

## compose.prod.hub.yml — Production (images Docker Hub)

Utilise les images pré-buildées et publiées par le workflow CI sur Docker Hub.
**Aucun build local requis** — idéal pour déployer rapidement sur un serveur.

Images utilisées :
- `vianmora/web-widget-tool-backend:latest`
- `vianmora/web-widget-tool-frontend:latest`

```bash
cp .env.example .env.prod
# Remplir : APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET,
#           GOOGLE_MAPS_API_KEY, POSTGRES_PASSWORD

docker compose -f docker/compose.prod.hub.yml --env-file .env.prod up -d
```

- Backend sur `http://localhost:${PORT:-4000}`
- Frontend sur `http://localhost:${FRONTEND_PORT:-3000}`

> **Note :** `VITE_API_URL` est baked dans l'image frontend au moment du build CI.
> Elle doit correspondre à l'URL publique de votre backend.

---

## compose.coolify.yml — Coolify (build local)

Variante pour Coolify qui reconstruit l'image all-in-one à partir des sources
du dépôt. Coolify gère le TLS et le domaine automatiquement.

1. Créer une ressource **Docker Compose** dans Coolify
2. Pointer sur `docker/compose.coolify.yml`
3. Renseigner les variables dans l'interface Coolify :

| Variable | Description |
|---|---|
| `ADMIN_EMAIL` | Email de connexion admin |
| `ADMIN_PASSWORD` | Mot de passe admin |
| `JWT_SECRET` | Clé secrète JWT (`openssl rand -hex 32`) |
| `GOOGLE_MAPS_API_KEY` | Clé API Google Maps (Places activée) |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL |
| `GOOGLE_REVIEWS_CACHE_TTL` | Cache avis en secondes (défaut : 604800) |

Coolify injecte automatiquement `SERVICE_FQDN_APP_4000` dans `FRONTEND_URL`.

---

## compose.coolify.hub.yml — Coolify (images Docker Hub)

Variante Coolify qui tire les images depuis Docker Hub.
**Aucun build local requis** — déploiement instantané.

Images utilisées :
- `vianmora/web-widget-tool-backend:latest`
- `vianmora/web-widget-tool-frontend:latest`

1. Créer une ressource **Docker Compose** dans Coolify
2. Pointer sur `docker/compose.coolify.hub.yml`
3. Renseigner les mêmes variables que `compose.coolify.yml` ci-dessus

Coolify injecte automatiquement `SERVICE_FQDN_BACKEND_4000` dans `FRONTEND_URL`.

> **Note :** `VITE_API_URL` est baked dans l'image frontend au moment du build CI.
> Elle doit correspondre à l'URL publique assignée au service backend par Coolify.
