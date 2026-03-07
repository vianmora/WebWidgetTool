# WebWidget Tool

Créez et intégrez des widgets interactifs sur n'importe quel site en une ligne de code. Open-source, auto-hébergeable, disponible en SaaS.

---

## Fonctionnalités

- **17+ widgets prêts à l'emploi** — avis Google, boutons WhatsApp/Telegram, compte à rebours, FAQ, galerie, carte, horaires d'ouverture, et bien d'autres
- **Intégration universelle** — HTML, WordPress, Webflow : une seule balise `<div>` + un `<script>`
- **Deux modes de déploiement** — auto-hébergé (admin unique, JWT) ou SaaS multi-utilisateurs (Better Auth, Stripe)
- **Dashboard complet** — création, édition, duplication, snippets prêts à copier
- **Analytics** — comptage de vues par widget et par jour
- **Widget.js léger** — 35kb minifié, sans dépendances, compatible ES2017+

---

## Démarrage rapide

```bash
# 1. Cloner le repo
git clone https://github.com/votre-org/web-widget-tool.git
cd web-widget-tool

# 2. Configurer l'environnement
cp .env.example .env
# Editez .env : ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET, GOOGLE_MAPS_API_KEY

# 3. Lancer avec Docker
docker compose -f docker/compose.dev.yml up --build -d

# 4. Ouvrir le dashboard
open http://localhost:3000
```

Identifiants par défaut : ceux définis dans `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

---

## Widgets disponibles

| Widget | Description |
|--------|-------------|
| Avis Google | Affiche les avis d'un etablissement Google |
| Bouton WhatsApp | Bouton flottant vers WhatsApp |
| Bouton Telegram | Bouton flottant vers Telegram |
| Icones reseaux sociaux | Liens vers vos profils sociaux |
| Partage social | Boutons de partage de la page |
| Compte a rebours | Timer avec date cible |
| Horaires d'ouverture | Tableau avec badge ouvert/ferme en temps reel |
| FAQ | Accordeon animee |
| Tableau de prix | Grille de plans tarifaires |
| Equipe | Cartes membres avec photo/role/liens |
| Bandeau cookie | Consentement RGPD persistant |
| Retour en haut | Bouton flottant scroll-to-top |
| Carousel logos | Defilement infini de logos partenaires |
| Galerie d'images | Grille ou carrousel avec lightbox |
| Carte Google Maps | Iframe embed via adresse ou Place ID |
| Visionneuse PDF | Iframe PDF avec toolbar |
| Temoignages | Cartes manuelles avec etoiles |

---

## Modes de deploiement

| Fichier | Usage |
|---------|-------|
| `docker/compose.dev.yml` | Developpement local (build + hot-reload) |
| `docker/compose.prod.yml` | Production — build local, conteneur all-in-one |
| `docker/compose.prod.hub.yml` | Production — images Docker Hub, zero build |
| `docker/compose.coolify.yml` | Coolify — build local |
| `docker/compose.coolify.hub.yml` | Coolify — images Docker Hub |

Pour un guide d'installation complet, voir [docs/SELF_HOSTING.md](docs/SELF_HOSTING.md).

---

## Integration dans un site

Apres avoir cree un widget dans le dashboard, copiez le snippet :

```html
<!-- Collez avant </body> -->
<script src="https://votre-app.com/widget.js" async></script>

<!-- Collez a l'endroit voulu -->
<div data-ww-id="VOTRE_WIDGET_ID"></div>
```

L'integration WordPress et Webflow est disponible directement dans le dashboard.

---

## Architecture

```
web-widget-tool/
├── apps/
│   ├── backend/          # Express + TypeScript + Prisma + PostgreSQL
│   │   ├── src/
│   │   │   ├── lib/      # auth, mailer, stripe, planLimits, mode
│   │   │   ├── middleware/
│   │   │   ├── routes/   # auth, widgets, billing, admin, public
│   │   │   └── widget/   # widget.js : core + 17 renderers
│   │   ├── prisma/
│   │   └── public/       # widget.js bundle (genere)
│   └── frontend/         # React + Vite + Tailwind
│       └── src/
│           ├── pages/    # Dashboard, NewWidget, WidgetDetail, Billing, Admin
│           ├── context/  # UserContext (SaaS)
│           └── data/     # widgetCatalog.ts
├── docker/
└── .env.example
```

**APP_MODE=selfhosted** (defaut) : un seul admin, authentification JWT, pas de Stripe ni Better Auth.

**APP_MODE=saas** : multi-utilisateurs, Better Auth (email/password + OAuth), abonnements Stripe, backoffice superadmin.

---

## Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Licence

MIT
