# WebWidget Tool

Outil open-source pour créer et gérer des widgets d'avis Google intégrables dans n'importe quel site HTML.

## Démarrage rapide (développement)

```bash
# 1. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos valeurs

# 2. Lancer l'application (3 conteneurs : postgres + backend + frontend)
docker compose -f docker/compose.dev.yml up --build

# 3. Accéder au dashboard
open http://localhost:3000
```

Connectez-vous avec les identifiants définis dans `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

---

## Modes de déploiement

Tous les fichiers Docker Compose sont dans le dossier `docker/` :

| Fichier | Description |
|---|---|
| `docker/compose.dev.yml` | Développement — build local, 3 conteneurs |
| `docker/compose.prod.yml` | Production — build local, image all-in-one |
| `docker/compose.prod.hub.yml` | Production — images Docker Hub |
| `docker/compose.coolify.yml` | Coolify — build local, image all-in-one |
| `docker/compose.coolify.hub.yml` | Coolify — images Docker Hub |

### Développement (build local)

```bash
docker compose -f docker/compose.dev.yml up --build -d
```

### Production — build local (all-in-one)

Le `Dockerfile` racine compile le frontend React et l'embarque dans l'image Node.js. Un seul conteneur sert le dashboard et l'API.

```bash
cp .env.example .env.prod
# Éditez APP_URL, ADMIN_PASSWORD, JWT_SECRET, GOOGLE_MAPS_API_KEY, POSTGRES_PASSWORD

docker compose -f docker/compose.prod.yml --env-file .env.prod up --build -d
```

### Production — images Docker Hub

Utilise les images pré-buildées par le CI. Aucun build local requis.

```bash
cp .env.example .env.prod
# Éditez aussi DOCKERHUB_USERNAME

docker compose -f docker/compose.prod.hub.yml --env-file .env.prod up -d
```

### Déploiement sur Coolify

Coolify gère automatiquement le certificat TLS et le domaine.

**Avec build local :**
1. Créez une ressource **Docker Compose** dans Coolify.
2. Sélectionnez le fichier `docker/compose.coolify.yml`.

**Avec images Docker Hub :**
1. Créez une ressource **Docker Compose** dans Coolify.
2. Sélectionnez le fichier `docker/compose.coolify.hub.yml`.

3. Renseignez les variables d'environnement dans l'interface Coolify :

| Variable | Description |
|---|---|
| `ADMIN_EMAIL` | Email de connexion admin |
| `ADMIN_PASSWORD` | Mot de passe admin |
| `JWT_SECRET` | Clé secrète JWT |
| `GOOGLE_MAPS_API_KEY` | Clé API Google Maps (Places activée) |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL |
| `GOOGLE_REVIEWS_CACHE_TTL` | Cache avis en secondes (défaut : 604800) |

Coolify injecte automatiquement `SERVICE_FQDN_APP_4000` / `SERVICE_FQDN_BACKEND_4000` (l'URL publique du service) dans `FRONTEND_URL`.

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

### Avis Google — Webhook

Le type **Webhook JSON** expose les avis via un endpoint JSON brut, sans interface HTML. Idéal pour une intégration personnalisée côté développeur.

**Endpoint :**

```
GET https://votre-app.com/widget/VOTRE_ID/reviews
```

**Exemple curl :**

```bash
curl "https://votre-app.com/widget/VOTRE_ID/reviews"
```

**Structure de la réponse :**

```json
{
  "widget": { "id": "…", "name": "…" },
  "reviews": [
    {
      "author_name": "Marie Dupont",
      "rating": 5,
      "text": "Excellent service !",
      "profile_photo_url": "https://…",
      "relative_time_description": "il y a 2 semaines"
    }
  ]
}
```

Le même endpoint `/widget/:id/reviews` est utilisé par le widget HTML embarqué et par le type Webhook — c'est l'usage qui diffère.

---

## Architecture

```
web-widget-tool/
├── Dockerfile                       ← image all-in-one (frontend + backend)
├── docker/
│   ├── compose.dev.yml              ← développement (build local)
│   ├── compose.prod.yml             ← production (build local, all-in-one)
│   ├── compose.prod.hub.yml         ← production (images Docker Hub)
│   ├── compose.coolify.yml          ← Coolify (build local)
│   └── compose.coolify.hub.yml      ← Coolify (images Docker Hub)
├── .env.example
└── apps/
    ├── backend/    # Node.js + Express + TypeScript + Prisma
    │   ├── src/
    │   ├── public/ # widget.js (script embeddable)
    │   └── prisma/
    └── frontend/   # React + TypeScript + Vite + Tailwind
```

En mode all-in-one, le backend Express détecte la présence de `public/app/index.html` (copiée par le Dockerfile) et active automatiquement le serving du SPA + le fallback HTML5 history.
