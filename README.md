# WebWidget Tool

Outil open-source pour créer et gérer des widgets intégrables dans n'importe quel site HTML.

## Démarrage rapide

```bash
# 1. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos valeurs

# 2. Lancer l'application
docker compose up --build

# 3. Accéder au dashboard
open http://localhost:3000
```

Connectez-vous avec les identifiants définis dans `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `ADMIN_EMAIL` | `admin@example.com` | Email de connexion admin |
| `ADMIN_PASSWORD` | `changeme` | Mot de passe admin |
| `JWT_SECRET` | *(voir .env.example)* | Clé secrète JWT (changez en prod !) |
| `VITE_API_URL` | `http://localhost:4000` | URL publique du backend |
| `FRONTEND_URL` | `http://localhost:3000` | URL du frontend (pour CORS) |
| `GOOGLE_REVIEWS_CACHE_TTL` | `3600` | Durée du cache avis Google (secondes) |

## Widgets disponibles

### Avis Google
Affiche les avis Google d'un établissement. Nécessite :
- Un **Google Place ID** ([trouver le vôtre](https://developers.google.com/maps/documentation/places/web-service/place-id))
- Une **clé API Google Maps** avec l'API Places activée

### Intégration dans votre site

Après avoir créé un widget dans le dashboard, copiez le snippet fourni :

```html
<div id="gw-widget"></div>
<script src="http://localhost:4000/widget.js" data-widget-id="VOTRE_ID"></script>
```

## Architecture

```
web-widget-tool/
├── apps/
│   ├── backend/    # Node.js + Express + TypeScript + Prisma
│   └── frontend/   # React + TypeScript + Vite + Tailwind
├── docker-compose.yml
└── .env.example
```

## Déploiement en production

1. Définissez `VITE_API_URL` à l'URL publique de votre backend (ex: `https://api.monsite.com`)
2. Changez `JWT_SECRET` et `ADMIN_PASSWORD` pour des valeurs sécurisées
3. Lancez `docker compose up --build -d`
