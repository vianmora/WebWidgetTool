# Plan — Outil de widgets intégrables (open-source)

## Objectif

Application dockerisée permettant de créer et gérer des widgets intégrables dans n'importe quel site HTML via une balise `<script>`. Authentification par variables d'environnement, dashboard admin, et en premier lieu un widget "Avis Google".

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Docker Compose                                      │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐ │
│  │ Frontend │   │ Backend  │   │  PostgreSQL       │ │
│  │ React/TS │◄──│ Node/TS  │──►│  (widgets, cache) │ │
│  │ :3000    │   │ :4000    │   │  :5432            │ │
│  └──────────┘   └──────────┘   └──────────────────┘ │
└─────────────────────────────────────────────────────┘
         ▲                 ▲
         │                 │ widget.js (servi par le backend)
    Dashboard          <script src="...">
    admin              dans le site client
```

---

## Stack technique

| Couche      | Choix                          | Raison                            |
|-------------|--------------------------------|-----------------------------------|
| Backend     | Node.js + Express + TypeScript | léger, facile à dockeriser        |
| Frontend    | React + TypeScript + Vite      | rapide, moderne                   |
| Base de données | PostgreSQL                 | fiable, JSONB pour la config      |
| ORM         | Prisma                         | migrations, typage fort           |
| Auth        | JWT + env vars                 | pas de user en base, simple       |
| Styles      | Tailwind CSS                   | productivité                      |

---

## Structure du monorepo

```
web-widget-tool/
├── apps/
│   ├── frontend/        # React + Vite
│   └── backend/         # Node.js + Express
├── packages/
│   └── widget/          # widget.js (vanilla JS bundlé)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Variables d'environnement (.env.example)

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme
JWT_SECRET=supersecretkey
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/widgets
GOOGLE_REVIEWS_CACHE_TTL=3600   # secondes
```

---

## API Backend

| Méthode | Route                      | Auth    | Description                          |
|---------|----------------------------|---------|--------------------------------------|
| POST    | /api/auth/login            | -       | Login, retourne un JWT               |
| GET     | /api/widgets               | JWT     | Liste des widgets                    |
| POST    | /api/widgets               | JWT     | Crée un widget                       |
| GET     | /api/widgets/:id           | JWT     | Détail d'un widget                   |
| PATCH   | /api/widgets/:id           | JWT     | Met à jour un widget                 |
| DELETE  | /api/widgets/:id           | JWT     | Supprime un widget                   |
| GET     | /widget/:id/reviews        | public  | Retourne les avis (avec cache)       |
| GET     | /widget.js                 | public  | Script universel embeddable          |

---

## Modèle de données

```prisma
model Widget {
  id         String   @id @default(uuid())
  name       String
  type       String   // "google_reviews" (extensible)
  config     Json     // config spécifique au type
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Config Google Reviews (JSONB)

```json
{
  "placeId": "ChIJ...",
  "apiKey": "AIza...",
  "maxReviews": 5,
  "minRating": 4,
  "theme": "light",
  "accentColor": "#4F46E5"
}
```

---

## Frontend (pages)

| Route          | Description                                         |
|----------------|-----------------------------------------------------|
| /login         | Formulaire email/password, JWT en localStorage      |
| /              | Dashboard : liste des widgets + bouton "Nouveau"    |
| /widgets/new   | Formulaire de création (type = Google Avis)         |
| /widgets/:id   | Détail : config, snippet à copier, aperçu live      |

---

## Widget "Avis Google" — fonctionnement

1. L'admin crée un widget en renseignant :
   - Google Place ID
   - Google Maps API Key (clé du projet client)
   - Nombre d'avis (3, 5, 10)
   - Note minimale (ex: ≥ 4 étoiles)
   - Thème (clair/sombre, couleur accent)

2. Le backend met les avis en **cache (1h par défaut)** pour limiter les appels API Google.

3. Le dashboard génère un snippet à copier :
   ```html
   <div id="gw-widget"></div>
   <script src="https://votre-domaine.com/widget.js"
           data-widget-id="abc123">
   </script>
   ```

4. `widget.js` :
   - Lit `data-widget-id`
   - Appelle `GET /widget/:id/reviews`
   - Injecte le rendu HTML dans `#gw-widget` ou après la balise script
   - Vanilla JS, zéro dépendance

---

## Ordre de réalisation

- [ ] **Étape 1** — Structure monorepo + docker-compose (squelette qui tourne)
- [ ] **Étape 2** — Backend : auth + CRUD widgets + DB Prisma
- [ ] **Étape 3** — Frontend : login + dashboard + formulaire Google Avis
- [ ] **Étape 4** — Backend : endpoint public `/widget/:id/reviews` + cache
- [ ] **Étape 5** — `widget.js` : rendu des avis côté client
- [ ] **Étape 6** — Peaufinage : snippets copiables, aperçu live, README
