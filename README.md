# WebWidget Tool

Outil open-source pour créer et gérer des widgets d'avis Google intégrables dans n'importe quel site HTML.

## Démarrage rapide (développement)

```bash
# 1. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos valeurs

# 2. Lancer l'application (2 conteneurs : frontend + backend)
docker compose up --build

# 3. Accéder au dashboard
open http://localhost:3000
```

Connectez-vous avec les identifiants définis dans `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

---

## Modes de déploiement

### Mode 2 conteneurs — développement / legacy

Le fichier `docker-compose.yml` lance **3 services** : PostgreSQL, backend Node.js (port 4000) et frontend Nginx (port 3000).

```bash
docker compose up --build -d
```

### Mode all-in-one — production recommandée

Le fichier `Dockerfile` (racine) compile le frontend React et l'embarque dans l'image Node.js. Un seul conteneur sert à la fois le dashboard et l'API sur le **port 4000**.

```bash
# Copier et remplir les variables de prod
cp .env.example .env.prod
# Éditez APP_URL, ADMIN_PASSWORD, JWT_SECRET, GOOGLE_MAPS_API_KEY, POSTGRES_PASSWORD

docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
```

L'application est accessible sur `http://host:3000` (configurable via `PORT`).

### Déploiement sur Coolify

Coolify gère automatiquement le certificat TLS et le domaine.

1. Créez une ressource **Docker Compose** dans Coolify.
2. Sélectionnez le fichier `docker-compose.coolify.yml`.
3. Renseignez les variables d'environnement dans l'interface Coolify :

| Variable | Description |
|---|---|
| `ADMIN_EMAIL` | Email de connexion admin |
| `ADMIN_PASSWORD` | Mot de passe admin |
| `JWT_SECRET` | Clé secrète JWT |
| `GOOGLE_MAPS_API_KEY` | Clé API Google Maps (Places activée) |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL |
| `GOOGLE_REVIEWS_CACHE_TTL` | Cache avis en secondes (défaut : 604800) |

Coolify injecte automatiquement `SERVICE_FQDN_APP_4000` (l'URL publique du service) dans `FRONTEND_URL`.

---

## Variables d'environnement

### Communes

| Variable | Défaut | Description |
|---|---|---|
| `ADMIN_EMAIL` | `admin@example.com` | Email de connexion admin |
| `ADMIN_PASSWORD` | `changeme` | Mot de passe admin |
| `JWT_SECRET` | *(voir .env.example)* | Clé secrète JWT — changez en prod |
| `GOOGLE_MAPS_API_KEY` | *(vide)* | Clé API Google Maps |
| `GOOGLE_REVIEWS_CACHE_TTL` | `604800` | Durée du cache avis Google (secondes) |

### Mode 2 conteneurs

| Variable | Défaut | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | URL publique du backend (baked dans React) |
| `FRONTEND_URL` | `http://localhost:3000` | URL du frontend (pour CORS) |

### Mode all-in-one

| Variable | Défaut | Description |
|---|---|---|
| `APP_URL` | `http://localhost:3000` | URL publique de l'application |
| `PORT` | `3000` | Port exposé sur l'hôte |
| `POSTGRES_PASSWORD` | `changeme` | Mot de passe PostgreSQL |

---

## Widgets disponibles

### Avis Google

Affiche les avis Google d'un établissement. Nécessite :
- Un **Google Place ID** ([trouver le vôtre](https://developers.google.com/maps/documentation/places/web-service/place-id))
- Une **clé API Google Maps** avec l'API Places activée

**Mises en page disponibles :** Liste · Grille · Étoiles · Slider · Badge

**Options de design :** thème clair/sombre, couleur accent, affichage de l'en-tête (titre personnalisable), avatars, dates, troncature du texte.

### Intégration dans votre site

Après avoir créé un widget dans le dashboard, copiez le snippet fourni :

```html
<div id="gw-widget"></div>
<script src="https://votre-app.com/widget.js" data-widget-id="VOTRE_ID"></script>
```

---

## Architecture

```
web-widget-tool/
├── Dockerfile                  ← image all-in-one (frontend + backend)
├── docker-compose.yml          ← développement (2 conteneurs)
├── docker-compose.prod.yml     ← production all-in-one
├── docker-compose.coolify.yml  ← déploiement Coolify
├── .env.example
└── apps/
    ├── backend/    # Node.js + Express + TypeScript + Prisma
    │   ├── src/
    │   ├── public/ # widget.js (script embeddable)
    │   └── prisma/
    └── frontend/   # React + TypeScript + Vite + Tailwind
```

En mode all-in-one, le backend Express détecte la présence de `public/app/index.html` (copiée par le Dockerfile) et active automatiquement le serving du SPA + le fallback HTML5 history.
