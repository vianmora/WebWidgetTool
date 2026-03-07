# Plan d'action — WebWidgetTool v2

## Vue d'ensemble

```
Phase 0  → Préparation & architecture transverse
Phase 1  → Infra SaaS : auth multi-utilisateurs (Better Auth)
Phase 2  → Infra SaaS : billing Stripe + plans + quotas
Phase 3  → Refonte dashboard (charte graphique + catalogue)
Phase 4  → Framework widget extensible (widget.js v2)
Phase 5  → Widgets P1 : Avis & témoignages
Phase 6  → Widgets P1 : Boutons & icônes sociaux
Phase 7  → Widgets P1 : Médias & contenu
Phase 8  → Widgets P1 : Conversion & engagement
Phase 9  → Widgets P1 : Informations pratiques
Phase 10 → Widgets P1 : Feeds sociaux (Instagram, YouTube)
Phase 11 → Widgets P2 (toutes catégories)
Phase 12 → Widgets P3 + fonctionnalités avancées
```

Chaque phase est indépendante et livrable. Les phases 0 à 4 sont des fondations bloquantes : elles doivent être terminées avant d'attaquer les widgets.

---

## Phase 0 — Préparation & architecture transverse

**Objectif** : mettre en place les fondations communes avant toute fonctionnalité.

### 0.1 Variable APP_MODE

- Ajouter `APP_MODE=saas|selfhosted` dans `.env.example` (défaut : `selfhosted`)
- Créer un helper `src/lib/mode.ts` : `isSaaS()` et `isSelfHosted()`
- En mode `selfhosted`, toutes les routes SaaS (register, billing, admin) retournent 404
- L'auth existante (email/password via env var) reste active en `selfhosted`

### 0.2 Refactoring auth existante

- Créer un middleware `src/middleware/authUnified.ts` qui sélectionne le bon système selon `APP_MODE` :
  - `selfhosted` → vérifie JWT signé avec `JWT_SECRET` (comportement actuel)
  - `saas` → délègue à Better Auth
- Le reste du code utilise uniquement `requireAuth` sans savoir quel mode est actif

### 0.3 Variables d'environnement SMTP

Ajouter dans `.env.example` :
```
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM="WebWidgetTool <noreply@mondomaine.com>"
```

Créer `src/lib/mailer.ts` : instance Nodemailer configurée depuis ces variables, avec méthode `sendMail({ to, subject, html })`.

### 0.4 Migration Prisma : modèle User

```prisma
model User {
  id                   String    @id @default(uuid())
  email                String    @unique
  plan                 String    @default("free")  // free | starter | pro | agency
  stripeCustomerId     String?
  stripeSubscriptionId String?
  monthlyViewCount     Int       @default(0)
  monthlyViewResetAt   DateTime  @default(now())
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  widgets              Widget[]
}

// Ajout sur Widget existant :
// userId   String?   (nullable pour compatibilité selfhosted)
// isActive Boolean   @default(true)
// + relation vers User
```

Tables Better Auth (générées par `npx better-auth generate`) : `session`, `account`, `verification`.

**Points d'attention** :
- La migration doit être non-destructive : `userId` nullable sur `Widget` pour que les widgets existants (selfhosted) continuent de fonctionner
- Créer la migration avec `prisma migrate dev --name add_user_saas`

---

## Phase 1 — Infra SaaS : authentification (Better Auth)

**Objectif** : inscription, connexion, OAuth, vérification email, reset password.

### 1.1 Backend — Better Auth

- Installer : `better-auth`, `@better-auth/prisma-adapter`
- Créer `src/lib/auth.ts` : configuration Better Auth (adapter Prisma, providers OAuth Google/Facebook/GitHub, emailAndPassword activé)
- Monter le handler Better Auth sur `app.use('/api/auth', toNodeHandler(auth))` — uniquement si `isSaaS()`
- Configurer les callbacks `onEmailVerification` et `onPasswordReset` pour appeler `mailer.sendMail(...)`

**Templates emails** (HTML minimaliste, couleurs charte `#621B7A`) :
- Vérification email : lien de confirmation
- Reset password : lien de réinitialisation (expire 1h)
- Bienvenue : après vérification

### 1.2 Backend — Rate limiting

- Installer `express-rate-limit`
- Appliquer sur `/api/auth/sign-in` et `/api/auth/sign-up` : max 10 req/15min par IP

### 1.3 Backend — Route `/api/auth/me`

- Retourne le profil de l'utilisateur connecté : `{ id, email, plan, monthlyViewCount, widgets: count }`

### 1.4 Frontend — Pages auth

Pages à créer (charte graphique, thème clair, boutons border-radius 4–6px) :

| Page | Contenu |
|---|---|
| `/register` | Email + mot de passe + confirmation, boutons OAuth (Google, Facebook, GitHub) |
| `/verify-email` | Message d'attente + bouton "renvoyer l'email" |
| `/forgot-password` | Saisie email |
| `/reset-password?token=…` | Nouveau mot de passe + confirmation |

- Mise à jour de `/login` : garder le formulaire existant en `selfhosted`, switcher vers Better Auth en `saas`
- `PrivateRoute` mis à jour : utilise `GET /api/auth/me` pour valider la session (cookie httpOnly) au lieu de `localStorage.token`
- Stocker le profil user dans un contexte React (`UserContext`) accessible partout

### 1.5 Frontend — Navbar

- Afficher email + plan actuel dans le coin supérieur droit
- Menu déroulant : "Mon compte", "Facturation" (SaaS only), "Déconnexion"

---

## Phase 2 — Infra SaaS : billing Stripe + plans + quotas

**Objectif** : monétisation complète, enforcement des limites par plan.

### 2.1 Backend — Stripe

- Installer `stripe`
- Créer `src/lib/stripe.ts` : client Stripe initialisé depuis `STRIPE_SECRET_KEY`
- Créer les produits/prix Stripe en amont (Starter 9€/mois, Pro 19€/mois, Agency 49€/mois)
- Ajouter dans `.env.example` : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_AGENCY`

### 2.2 Backend — Routes billing

```
POST /api/billing/checkout   → crée Stripe Checkout Session, retourne l'URL
GET  /api/billing/portal     → crée Stripe Billing Portal Session, redirige
POST /api/billing/webhook    → vérifie signature Stripe, met à jour User.plan
```

Événements webhook à gérer :
- `checkout.session.completed` → activer l'abonnement, écrire `stripeSubscriptionId` + `stripeCustomerId` + `plan`
- `customer.subscription.updated` → mettre à jour `plan`
- `customer.subscription.deleted` → repasser sur `free`
- `invoice.payment_failed` → email d'alerte à l'utilisateur

### 2.3 Backend — Enforcement des limites

Créer `src/lib/planLimits.ts` :
```typescript
const LIMITS = {
  free:    { widgets: 1,         monthlyViews: 500 },
  starter: { widgets: 5,         monthlyViews: 10_000 },
  pro:     { widgets: 20,        monthlyViews: 100_000 },
  agency:  { widgets: Infinity,  monthlyViews: Infinity },
}
```

- **Limite widgets** : vérifiée dans `POST /api/widgets` (compte les widgets de l'user)
- **Limite vues** : `GET /widget/:id/reviews` incrémente `User.monthlyViewCount` ; reset automatique au 1er du mois (job cron ou check à chaque requête)
- Si quota vues dépassé : réponse 200 normale mais champ `{ _quotaExceeded: true }` ajouté → widget.js affiche un bandeau discret

### 2.4 Backend — Badge "Powered by"

- `GET /widget/:id/reviews` ajoute `{ _poweredBy: true }` si `user.plan === 'free'`
- widget.js affiche le badge en bas du widget si ce champ est présent

### 2.5 Frontend — Page `/billing`

- Plan actuel mis en avant (carte colorée avec `#621B7A`)
- Tableau des 4 plans avec comparatif features
- Bouton "Passer à Starter/Pro/Agency" → appel `/api/billing/checkout` → redirect Stripe
- Bouton "Gérer mon abonnement" → appel `/api/billing/portal` → redirect Stripe
- Jauge vues utilisées ce mois / quota (barre de progression)
- Alerte visuelle si > 80% du quota utilisé

### 2.6 Frontend — Backoffice superadmin `/admin`

- Accessible si `SUPERADMIN_EMAIL` défini en env et email de session correspondant
- Tableau des utilisateurs : email, plan, vues/mois, date d'inscription, widgets count
- Action : changer le plan manuellement (sans passer par Stripe, pour support)
- Métriques globales : total users, répartition par plan, total widgets

---

## Phase 3 — Refonte dashboard (charte graphique + catalogue)

**Objectif** : appliquer la charte graphique et moderniser l'UX du dashboard.

### 3.1 Charte graphique — CSS global

Définir dans `src/index.css` les variables CSS :
```css
:root {
  --color-primary:     #621B7A;
  --color-accent:      #9EE992;
  --color-text-dark:   #1D1E18;
  --color-text-light:  #FFFFFF;
  --color-bg:          #FFFFFF;
  --color-bg-subtle:   #F8F8F8;
  --radius-btn:        5px;
}
```

Mettre à jour `tailwind.config.js` pour exposer ces couleurs comme classes Tailwind (`primary`, `accent`, etc.).

Revoir tous les composants existants (Login, Dashboard, NewWidget, WidgetDetail) pour appliquer la charte.

### 3.2 Dashboard — Catalogue de widgets

Remplacer le formulaire "Nouveau widget" actuel par :
- Page `/widgets/new` : grille de cartes par catégorie (Avis, Réseaux sociaux, Médias, etc.)
- Chaque carte : icône, nom, description courte, badge "Disponible" / "Bientôt"
- Au clic sur un widget disponible → formulaire de configuration spécifique à ce type

### 3.3 Dashboard — Éditeur de widget

Nouvelle mise en page pour `/widgets/new` et `/widgets/:id` :
- Colonne gauche (40%) : formulaire de configuration
- Colonne droite (60%) : prévisualisation live (iframe ou rendu React qui simule widget.js)

### 3.4 Dashboard — Snippet d'intégration

Sur `/widgets/:id`, section "Intégrer ce widget" avec 3 onglets :
- **HTML** : `<div id="ww-widget-{id}"></div><script src="...">` avec bouton copier
- **WordPress** : shortcode `[webwidget id="..."]` + lien vers le plugin (à créer ultérieurement)
- **Webflow** : bloc "Custom Code" prêt à coller

### 3.5 Dashboard — Analytics (plan Pro+)

Widget de stats sur `/widgets/:id` :
- Graphe vues/jour sur 30 jours (recharts ou chart.js)
- Compteur total vues, vues ce mois

Nécessite une nouvelle table Prisma :
```prisma
model WidgetView {
  id        String   @id @default(uuid())
  widgetId  String
  date      DateTime @default(now()) @db.Date
  count     Int      @default(1)
  @@unique([widgetId, date])
}
```

Incrémenter par upsert dans `GET /widget/:id/reviews`.

---

## Phase 4 — Framework widget extensible (widget.js v2)

**Objectif** : refactoriser widget.js pour supporter N types de widgets sans tout réécrire à chaque fois.

### 4.1 Architecture widget.js v2

Actuellement : widget.js est monolithique et ne gère que Google Reviews.

Nouvelle architecture (vanilla JS, zéro dépendance) :

```
widget.js
  ├── core/loader.js      → lit data-widget-id, fetch /widget/:id/data, dispatch au bon renderer
  ├── core/styles.js      → injection CSS namespaced (préfixe ww-) pour éviter les conflits
  ├── core/badge.js       → badge "Powered by" conditionnel
  ├── renderers/
  │   ├── google_reviews.js
  │   ├── whatsapp_button.js
  │   └── ... (un fichier par type)
```

Le tout est bundlé en un seul `widget.js` via esbuild (rapide, zéro config).

### 4.2 Endpoint générique

Renommer/remplacer `GET /widget/:id/reviews` → `GET /widget/:id/data`

Retourne :
```json
{
  "widget": { "id", "type", "config": { "theme", "accentColor", ... } },
  "data": { ... },          // données spécifiques au type
  "_poweredBy": true/false, // badge plan free
  "_quotaExceeded": false   // quota vues dépassé
}
```

Chaque type de widget a son propre handler de data côté backend (`src/widgets/google_reviews.ts`, `src/widgets/whatsapp_button.ts`, etc.).

Rétrocompatibilité : garder `/widget/:id/reviews` comme alias vers `/widget/:id/data` pendant une période de transition.

### 4.3 Build widget.js

- Ajouter `esbuild` dans `apps/backend/package.json` (devDependency)
- Script `npm run build:widget` qui bundle `src/widget/index.ts` → `public/widget.js`
- Intégrer dans le `npm run build` global

### 4.4 Support multi-widgets par page

```html
<div data-ww-id="abc123"></div>
<div data-ww-id="def456"></div>
<script src="/widget.js" async></script>
```

widget.js scanne tous les `[data-ww-id]` au chargement et les initialise indépendamment.

---

## Phase 5 — Widgets P1 : Avis & témoignages

Google Reviews existant, à migrer vers le nouveau framework (Phase 4).

### 5.1 Trustpilot Reviews (`trustpilot_reviews`)

- Config : `{ businessUrl, maxReviews, minRating, theme, accentColor }`
- Backend : scraping de la page publique Trustpilot (`/review/businessUrl`) avec `cheerio`
- Cache node-cache (TTL configurable, défaut 7j)
- Renderer : même structure visuelle que Google Reviews

### 5.2 Témoignages manuels (`testimonials`)

- Config : liste de témoignages saisis dans le dashboard `[{ name, role, company, text, rating, photoUrl }]`
- Photo : upload via `POST /api/widgets/:id/upload` → stocké dans `public/uploads/` (ou S3 plus tard)
- Pas de backend externe, les données sont dans `widget.config`
- Renderer : carrousel ou grille, configurable

### 5.3 Badge de note globale (`rating_badge`)

- Config : `{ source, placeId/businessUrl, theme, shape: 'pill|square' }`
- Réutilise les données Google Reviews ou Trustpilot déjà en cache
- Renderer : affiche note moyenne + étoiles + logo de la source + lien

---

## Phase 6 — Widgets P1 : Boutons & icônes sociaux

Widgets purement frontend (pas de données backend) — les plus simples à implémenter.

### 6.1 Bouton WhatsApp (`whatsapp_button`)

- Config : `{ phone, message, position: 'bottom-left|bottom-right', size, label }`
- Renderer : bouton flottant fixe en bas de page, icône WhatsApp SVG inline
- Pas d'appel backend : la config est dans le JSON retourné par `/widget/:id/data`

### 6.2 Bouton Telegram (`telegram_button`)

- Config : `{ username, label, position, size }`
- Même approche que WhatsApp

### 6.3 Boutons de partage (`social_share`)

- Config : `{ networks: ['facebook','x','linkedin','whatsapp','copy'], url?, title?, position: 'inline|floating', orientation: 'horizontal|vertical' }`
- URL par défaut : `window.location.href`
- Renderer : barre de boutons, chaque réseau ouvre une popup de partage

### 6.4 Icônes réseaux sociaux (`social_icons`)

- Config : `{ links: [{ network, url }], size, color: 'brand|monochrome|custom', layout: 'row|column' }`
- Renderer : icônes SVG inline, pas de police d'icônes externe

---

## Phase 7 — Widgets P1 : Médias & contenu

### 7.1 Carrousel de logos (`logo_carousel`)

- Config : `{ logos: [{ imageUrl, altText, linkUrl? }], speed, pauseOnHover }`
- Renderer : défilement CSS infinit (pas de JS library), responsive

### 7.2 Galerie d'images (`image_gallery`)

- Config : `{ images: [{ url, caption? }], layout: 'grid|masonry|carousel', columns, lightbox: true/false }`
- Renderer : grille CSS, lightbox vanilla JS intégrée au bundle

### 7.3 Visionneuse PDF (`pdf_viewer`)

- Config : `{ pdfUrl, height, showToolbar }`
- Renderer : `<iframe src="pdfUrl">` ou intégration PDF.js selon les besoins
- Note : PDF.js ajoute du poids au bundle — évaluer le chargement lazy

### 7.4 YouTube Gallery (`youtube_gallery`)

- Config : `{ channelId?, playlistId?, apiKey, maxVideos, layout: 'grid|list', autoplay }`
- Backend : appel YouTube Data API v3, mise en cache
- Renderer : vignettes cliquables, player intégré

---

## Phase 8 — Widgets P1 : Conversion & engagement

### 8.1 Bannière cookie (`cookie_banner`)

- Config : `{ message, acceptLabel, rejectLabel, position: 'top|bottom', privacyUrl }`
- Renderer : bannière fixe, mémorise le choix dans `localStorage`
- Pas de backend, config dans le JSON

### 8.2 Bouton "retour en haut" (`back_to_top`)

- Config : `{ threshold, position, shape: 'circle|square', icon: 'arrow|chevron' }`
- Renderer : bouton fixe, apparaît après scroll > threshold px

### 8.3 Compte à rebours (`countdown_timer`)

- Config : `{ targetDate, timezone, labels: { days, hours, minutes, seconds }, expiredMessage, theme }`
- Renderer : affichage jours/h/min/sec mis à jour chaque seconde via `setInterval`

### 8.4 Formulaire de contact (`contact_form`)

- Config : `{ fields: [{ name, type, required }], submitLabel, recipientEmail, webhookUrl? }`
- Backend : `POST /widget/:id/submit` → envoie email via `mailer.ts` ou appelle le webhook
- Renderer : formulaire HTML, validation front simple, message de succès après envoi

### 8.5 Inscription newsletter (`newsletter_signup`)

- Config : `{ provider: 'mailchimp|brevo|webhook', apiKey?, listId?, webhookUrl?, placeholder, buttonLabel }`
- Backend : `POST /widget/:id/subscribe` → appel API du provider ou webhook
- Renderer : champ email + bouton

### 8.6 Popup / Modal (`popup`)

- Config : `{ trigger: 'delay|scroll|exit', triggerValue, content: { title, text, imageUrl?, ctaLabel, ctaUrl }, frequency: 'always|once|session' }`
- Renderer : overlay avec animation, respecte la fréquence via `localStorage`

---

## Phase 9 — Widgets P1 : Informations pratiques

### 9.1 Horaires d'ouverture (`business_hours`)

- Config : `{ timezone, hours: [{ day: 0-6, open: "09:00", close: "18:00" }], closedLabel, openLabel }`
- Renderer : tableau des horaires + badge "Ouvert" / "Fermé" calculé en temps réel (JS client, pas de backend)

### 9.2 Google Maps (`google_map`)

- Config : `{ placeId?, address?, zoom, height, mapType: 'roadmap|satellite', showMarker }`
- Renderer : `<iframe>` Google Maps Embed API (pas de clé requise pour l'embed basique)

### 9.3 FAQ / Accordéon (`faq`)

- Config : `{ items: [{ question, answer }], allowMultiple, defaultOpen: 0|-1 }`
- Renderer : accordéon HTML/CSS pur, animation CSS

### 9.4 Tableau de prix (`pricing_table`)

- Config : `{ plans: [{ name, price, period, features: [], ctaLabel, ctaUrl, highlighted }], currency }`
- Renderer : grille de cards, card highlighted en `#621B7A`

### 9.5 Membres de l'équipe (`team_members`)

- Config : `{ members: [{ name, role, bio?, photoUrl, links: [{ network, url }] }], layout: 'grid|list', columns }`
- Renderer : cards avec photo, nom, rôle, icônes sociales

---

## Phase 10 — Widgets P1 : Feeds sociaux

### 10.1 Instagram Feed (`instagram_feed`)

- Config : `{ accessToken, userId, maxPosts, layout: 'grid|carousel', columns }`
- OAuth : flux OAuth Instagram Basic Display API géré dans le dashboard (bouton "Connecter Instagram" → OAuth → token stocké dans `widget.config.accessToken`)
- Backend : appel API Instagram, mise en cache 1h
- Renderer : grille de photos cliquables

Note : Instagram Basic Display API est en cours de dépréciation par Meta. Évaluer si l'API Instagram Graph (creator/business) est nécessaire.

---

## Phase 11 — Widgets P2 (toutes catégories)

À planifier en sprints à l'issue des phases P1. Ordre suggéré par valeur perçue :

1. **TripAdvisor Reviews** — forte demande hôtellerie/restauration
2. **Yelp Reviews** — marché US/international
3. **Compte à rebours avancé** + **Barre de progression**
4. **YouTube Gallery** enrichi (si pas fait en P1)
5. **Facebook Page Feed** + **TikTok Feed**
6. **Calendrier d'événements**
7. **Météo**
8. **QR Code**
9. **Slider avant/après**
10. **Flux RSS**
11. **Notification de vente**
12. **Bouton PayPal** + **Bouton de don**
13. **Compteurs de followers**
14. **Bouton Messenger**
15. **Vidéo-témoignages**

---

## Phase 12 — Widgets P3 + fonctionnalités avancées

- Booking.com, Airbnb, G2/Capterra Reviews (scraping)
- Pinterest Board, LinkedIn Feed (évaluer disponibilité API)
- Lecteur de podcast
- Convertisseur de devises
- Bouton Stripe (Checkout Session client)
- **CSS personnalisé** (plan Pro+) : zone de code injectée dans le widget
- **Plugin WordPress** : shortcode `[webwidget id="..."]`
- **SDK/NPM package** pour intégration React/Vue native

---

## Dépendances entre phases

```
Phase 0 ──┬──► Phase 1 ──► Phase 2 ──► Phase 3
          └──────────────────────────► Phase 4 ──► Phases 5 à 12
```

- Phase 0 doit être terminée avant Phase 1 et Phase 4
- Phases 1+2 (SaaS) et Phase 4 (widget framework) peuvent avancer en parallèle
- Phase 3 (dashboard) dépend de Phase 1 (auth) et peut intégrer Phase 4 (catalogue)
- Phases 5–12 dépendent toutes de Phase 4

---

## Nouvelles variables d'environnement à ajouter

```env
# Mode
APP_MODE=selfhosted               # selfhosted | saas

# Better Auth (SaaS)
BETTER_AUTH_SECRET=               # openssl rand -hex 32
BETTER_AUTH_URL=                  # URL publique du backend

# OAuth (SaaS)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe (SaaS)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_AGENCY=

# SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM="WebWidgetTool <noreply@mondomaine.com>"

# Superadmin (SaaS)
SUPERADMIN_EMAIL=
```
