# Guide d'auto-hebergement

Ce guide couvre l'installation de WebWidget Tool sur votre propre serveur.

---

## Prerequis

- Docker >= 24 et Docker Compose >= 2.20
- Un domaine pointe vers votre serveur (pour HTTPS en production)
- Une cle API Google Maps avec l'**API Places** activee ([obtenir une cle](https://developers.google.com/maps/documentation/places/web-service/get-api-key))

---

## Installation en production

### Option A — Images Docker Hub (recommandee)

Aucun build requis sur le serveur. Les images sont publiees par le CI.

```bash
# 1. Creer un dossier de travail
mkdir webwidget && cd webwidget

# 2. Telecharger le fichier compose
curl -o compose.yml https://raw.githubusercontent.com/votre-org/web-widget-tool/main/docker/compose.prod.hub.yml

# 3. Creer le fichier d'environnement
cp .env.example .env
nano .env
```

Editez `.env` avec les valeurs suivantes :

```env
ADMIN_EMAIL=votre@email.com
ADMIN_PASSWORD=un-mot-de-passe-solide
JWT_SECRET=une-chaine-aleatoire-de-32-caracteres-minimum
GOOGLE_MAPS_API_KEY=AIzaSy...
APP_URL=https://widgets.votre-domaine.com
POSTGRES_PASSWORD=un-mot-de-passe-postgres
```

```bash
# 4. Lancer
docker compose -f compose.yml up -d

# 5. Verifier que tout tourne
docker compose -f compose.yml ps
```

L'application est accessible sur le port 3000 (ou celui configure dans `APP_URL`).

---

### Option B — Build local

Clonez le repo et buildez les images sur votre serveur.

```bash
git clone https://github.com/votre-org/web-widget-tool.git
cd web-widget-tool
cp .env.example .env.prod
nano .env.prod

docker compose -f docker/compose.prod.yml --env-file .env.prod up --build -d
```

---

### Option C — Coolify

Coolify gere automatiquement le TLS et les domaines.

1. Dans Coolify, creez une ressource **Docker Compose**
2. Pointez vers votre fork du repo
3. Selectionnez `docker/compose.coolify.hub.yml` (ou `compose.coolify.yml` pour build local)
4. Renseignez les variables d'environnement dans l'interface Coolify :

| Variable | Description |
|----------|-------------|
| `ADMIN_EMAIL` | Email de connexion admin |
| `ADMIN_PASSWORD` | Mot de passe admin |
| `JWT_SECRET` | Cle secrete JWT (min. 32 caracteres) |
| `GOOGLE_MAPS_API_KEY` | Cle API Google Maps |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL |
| `GOOGLE_REVIEWS_CACHE_TTL` | Duree du cache avis en secondes (defaut : 604800) |

Coolify injecte automatiquement l'URL publique du service.

---

## Variables d'environnement

### Obligatoires

| Variable | Description |
|----------|-------------|
| `ADMIN_EMAIL` | Email de l'administrateur |
| `ADMIN_PASSWORD` | Mot de passe de l'administrateur |
| `JWT_SECRET` | Cle de signature des tokens JWT |
| `GOOGLE_MAPS_API_KEY` | Cle API Google Maps (Places API requise) |

### Optionnelles

| Variable | Defaut | Description |
|----------|--------|-------------|
| `APP_MODE` | `selfhosted` | `selfhosted` ou `saas` |
| `GOOGLE_REVIEWS_CACHE_TTL` | `604800` | Cache avis Google en secondes (7 jours) |
| `FRONTEND_URL` | `http://localhost:3000` | URL du frontend (pour CORS) |
| `PORT` | `4000` | Port du serveur backend |

### Mode SaaS uniquement

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Secret Better Auth (min. 32 caracteres) |
| `BETTER_AUTH_URL` | URL publique du backend |
| `SMTP_HOST` | Hote du serveur SMTP |
| `SMTP_PORT` | Port SMTP (587 pour TLS) |
| `SMTP_USER` | Identifiant SMTP |
| `SMTP_PASS` | Mot de passe SMTP |
| `SMTP_FROM` | Adresse expediteur |
| `STRIPE_SECRET_KEY` | Cle secrete Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe |
| `STRIPE_PRICE_STARTER` | Price ID Stripe plan Starter |
| `STRIPE_PRICE_PRO` | Price ID Stripe plan Pro |
| `STRIPE_PRICE_AGENCY` | Price ID Stripe plan Agency |
| `SUPERADMIN_EMAIL` | Email du superadmin (acces backoffice) |
| `GOOGLE_CLIENT_ID` | OAuth Google (optionnel) |
| `GOOGLE_CLIENT_SECRET` | OAuth Google (optionnel) |

---

## Migrations de base de donnees

Les migrations Prisma sont appliquees automatiquement au demarrage du container backend.

Si vous devez les appliquer manuellement :

```bash
docker exec <nom-container-backend> npx prisma migrate deploy
```

---

## Mise a jour

```bash
# Option Hub (images pre-buildees)
docker compose -f compose.yml pull
docker compose -f compose.yml up -d

# Option build local
git pull
docker compose -f docker/compose.prod.yml up --build -d
```

Les migrations de BDD sont appliquees automatiquement au redemarrage.

---

## Sauvegarde

Les donnees sont dans le volume Docker `postgres_data`. Pour sauvegarder :

```bash
docker exec <container-postgres> pg_dump -U postgres widgets > backup_$(date +%Y%m%d).sql
```

Pour restaurer :

```bash
cat backup.sql | docker exec -i <container-postgres> psql -U postgres widgets
```

---

## Reverse proxy (Nginx)

Si vous n'utilisez pas Coolify, voici un exemple de configuration Nginx :

```nginx
server {
    listen 443 ssl;
    server_name widgets.votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/widgets.votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/widgets.votre-domaine.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Avec Certbot pour le TLS :

```bash
certbot --nginx -d widgets.votre-domaine.com
```

---

## Depannage

**Le dashboard affiche "Unauthorized"**
Verifiez que `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans `.env` correspondent a ce que vous saisissez. Redemarrez le container apres modification du `.env`.

**Les avis Google ne s'affichent pas**
Verifiez que votre cle `GOOGLE_MAPS_API_KEY` a l'API **Places** activee dans la Google Cloud Console, et qu'elle n'a pas de restrictions d'IP bloquantes.

**Rate limit sur le login**
Le backend limite les tentatives de connexion a 10 par 15 minutes. Redemarrez le container pour reinitialiser : `docker restart <container-backend>`.

**Port deja utilise**
Si le port 3000 ou 4000 est occupe sur votre machine, modifiez le mapping dans le fichier compose (`3000:80` -> `3001:80` par exemple) et adaptez `VITE_API_URL` en consequence.
