# Cahier des charges — WebWidget Tool v2

## 1. Vision & objectifs

Faire évoluer WebWidget Tool de son état actuel (outil mono-admin auto-hébergé, un seul widget Google Reviews) vers une plateforme de widgets intégrables à deux modes de fonctionnement :

- **Mode SaaS** : hébergé sur un domaine central, vendu en abonnement à des utilisateurs finaux (agences, TPE/PME, indépendants)
- **Mode self-hosted** : inchangé dans l'esprit, un seul compte admin via variables d'environnement, toutes les fonctionnalités disponibles sans restriction

Les deux modes partagent exactement le même code. Le mode est détecté à l'exécution via une variable d'environnement `APP_MODE=saas|selfhosted`.

---

## 2. Modes de déploiement

### 2.1 Mode self-hosted (existant, à conserver)

- Un seul compte admin défini par `ADMIN_EMAIL` + `ADMIN_PASSWORD`
- Aucune notion de plan ou de limite
- Tous les widgets disponibles, nombre illimité
- Pas de stripe, pas d'email d'inscription
- Déploiement identique à aujourd'hui (Docker Compose, Coolify, etc.)

### 2.2 Mode SaaS (nouveau)

- Inscription/connexion par email + mot de passe (avec confirmation email)
- Connexion OAuth optionnelle : Google, Facebook, GitHub
- Plans d'abonnement (voir section 4)
- Compte super-admin séparé (via env var) pour gérer les utilisateurs, voir les métriques globales, gérer les plans
- Facturation via Stripe (abonnements + portail de facturation self-service)

---

## 3. Gestion des utilisateurs (mode SaaS)

### 3.1 Modèle de données

```
User
  id, email, passwordHash, emailVerified
  plan: free | starter | pro | agency
  stripeCustomerId, stripeSubscriptionId
  createdAt, updatedAt

Widget (existant)
  + userId (foreign key)
  + isActive (bool, pour désactiver si plan expiré)
```

### 3.2 Authentification

- **Librairie retenue : Better Auth** (TypeScript-natif, adapter Prisma officiel, gère email/password + OAuth + refresh tokens + sessions httpOnly cookie)
- Email de vérification à l'inscription
- Réinitialisation de mot de passe par email
- OAuth Google, Facebook, et GitHub via Better Auth
- Better Auth génère ses propres tables Prisma (sessions, accounts, verifications) via migration dédiée

### 3.3 Roles

| Role | Description |
|---|---|
| `user` | compte standard, voit et gère ses propres widgets |
| `superadmin` | accès backoffice global (défini par env var en SaaS) |

---

## 4. Modèle économique (mode SaaS)

### 4.1 Plans proposés

| Plan | Prix indicatif | Widgets max | Vues/mois | Fonctionnalités |
|---|---|---|---|---|
| Free | 0 €/mois | 1 | 500 | widgets de base, badge "Powered by" obligatoire |
| Starter | ~9 €/mois | 5 | 10 000 | tous les widgets, sans badge |
| Pro | ~19 €/mois | 20 | 100 000 | analytics, CSS personnalisé |
| Agency | ~49 €/mois | illimité | illimité | tout + support prioritaire |

### 4.2 Limites techniques

- Comptage des vues : `GET /widget/:id/reviews` incrémente un compteur mensuel par userId
- Si quota dépassé : la réponse retourne quand même les données mais le widget affiche un bandeau dégradé (pas de coupure brutale)
- Upgrade proposé automatiquement dans le dashboard quand on approche de la limite

### 4.3 Stripe

- Checkout Session à la sélection d'un plan
- Webhook Stripe pour synchroniser les changements d'abonnement (`customer.subscription.updated`, `invoice.payment_failed`, etc.)
- Portail de facturation Stripe self-service (gérer carte, télécharger factures, annuler)

---

## 5. Architecture technique cible

### 5.1 Schéma global

```
                          [Stripe Webhooks]
                                |
[Browser]──► [Frontend React]──►[Backend Express/Node]──►[PostgreSQL]
                                          │
                              [Google Places API]
                              [SMTP propre (Nodemailer)]
                              [Stripe API]
```

Pas de changement de stack. Ajouts :
- **Better Auth** pour toute la gestion auth (email/password, OAuth, sessions, refresh tokens)
- **Nodemailer** pour les emails transactionnels sur SMTP propre (host/port/user/pass configurables via env)
- Stripe SDK
- Tables Better Auth + table `users` via migration Prisma

### 5.2 Nouvelles routes backend

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Inscription (SaaS seulement) |
| POST | /api/auth/verify-email | — | Vérification email |
| POST | /api/auth/forgot-password | — | Demande reset |
| POST | /api/auth/reset-password | — | Nouveau mot de passe |
| GET | /api/auth/me | JWT | Profil utilisateur courant |
| GET | /api/auth/google | — | OAuth Google |
| GET | /api/billing/checkout | JWT | Crée une Stripe Checkout Session |
| GET | /api/billing/portal | JWT | Redirige vers portail Stripe |
| POST | /api/billing/webhook | — (sig Stripe) | Webhook Stripe |
| GET | /api/admin/users | superadmin | Liste users (backoffice) |
| PATCH | /api/admin/users/:id | superadmin | Changer plan manuellement |

### 5.3 Nouvelles pages frontend

| Route | Description |
|---|---|
| /register | Formulaire d'inscription |
| /verify-email | Confirmation email |
| /forgot-password | Demande reset |
| /reset-password | Nouveau mot de passe |
| /billing | Page abonnement, plan actuel, bouton upgrade/portail |
| /admin | Backoffice superadmin (users, métriques) |

---

## 6. Catalogue de widgets

Chaque widget a un `type` (string) et un `config` (JSONB) spécifique. Ci-dessous le catalogue cible, groupé par catégorie. La priorité d'implémentation est indiquée (P1 = premier sprint, P2 = deuxième, P3 = plus tard).

### 6.1 Avis & témoignages

| Widget | Type | Priorité | Notes |
|---|---|---|---|
| Google Reviews | `google_reviews` | P1 (existant) | — |
| Trustpilot Reviews | `trustpilot_reviews` | P1 | Scraping public ou API Business |
| TripAdvisor Reviews | `tripadvisor_reviews` | P2 | Scraping public |
| Yelp Reviews | `yelp_reviews` | P2 | API Yelp Fusion |
| Booking.com Reviews | `booking_reviews` | P3 | Scraping |
| Airbnb Reviews | `airbnb_reviews` | P3 | Scraping |
| G2 / Capterra Reviews | `g2_reviews` | P3 | Scraping |
| Témoignages manuels | `testimonials` | P1 | Saisie manuelle dans le dashboard, photo uploadable |
| Vidéo-témoignages | `video_testimonials` | P2 | URL YouTube/Vimeo par témoignage |
| Note globale (badge) | `rating_badge` | P1 | Affiche note + étoiles, lien vers source |

### 6.2 Réseaux sociaux — Feeds

| Widget | Type | Priorité | Notes |
|---|---|---|---|
| Instagram Feed | `instagram_feed` | P1 | OAuth Instagram Basic Display API |
| Facebook Page Feed | `facebook_feed` | P2 | Graph API |
| X/Twitter Feed | `twitter_feed` | P2 | API v2 (payante, à confirmer) ou embed natif |
| TikTok Feed | `tiktok_feed` | P2 | oEmbed ou API TikTok |
| YouTube Gallery | `youtube_gallery` | P1 | Data API v3, clé fournie par l'utilisateur |
| Pinterest Board | `pinterest_board` | P3 | API Pinterest |
| LinkedIn Posts | `linkedin_feed` | P3 | API très restrictive, à évaluer |

### 6.3 Réseaux sociaux — Boutons & compteurs

| Widget | Type | Priorité | Notes |
|---|---|---|---|
| Bouton WhatsApp | `whatsapp_button` | P1 | Lien wa.me + message prérempli + position flottante |
| Bouton Messenger | `messenger_button` | P2 | Plugin Messenger officiel |
| Bouton Telegram | `telegram_button` | P1 | Lien t.me |
| Boutons de partage | `social_share` | P1 | FB, X, LinkedIn, WhatsApp, copier lien |
| Icônes réseaux sociaux | `social_icons` | P1 | Liens vers profils, style/taille configurables |
| Compteurs de followers | `follower_count` | P2 | Agrège plusieurs réseaux |

### 6.4 Médias & contenu

| Widget | Type | Priorité | Notes |
|---|---|---|---|
| Galerie d'images | `image_gallery` | P1 | Upload ou liens externes, lightbox, grille/carousel |
| Visionneuse PDF | `pdf_viewer` | P1 | URL PDF, rendu via PDF.js |
| Galerie vidéo YouTube | `youtube_gallery` | P1 | voir section 6.2 |
| Carrousel de logos | `logo_carousel` | P1 | Défilement automatique, logos clients/partenaires |
| Slider avant/après | `before_after` | P2 | Comparaison image glissante |
| Flux RSS | `rss_feed` | P2 | URL de flux RSS, n articles, extrait |
| Lecteur de podcast | `podcast_player` | P3 | URL flux RSS podcast |

### 6.5 Conversion & engagement

| Widget | Type | Priorité | Notes |
|---|---|---|---|
| Formulaire de contact | `contact_form` | P1 | Champs configurables, envoi par email (SMTP) ou webhook |
| Popup / Modal | `popup` | P1 | Déclencheur : délai, scroll %, intention de sortie |
| Bannière cookie | `cookie_banner` | P1 | RGPD, personnalisable, mémorise le consentement |
| Inscription newsletter | `newsletter_signup` | P1 | Intégration Mailchimp / Brevo / webhook custom |
| Compte à rebours | `countdown_timer` | P1 | Date/heure cible, affichage jours/h/min/sec |
| Barre de progression | `progress_bar` | P2 | Animée, label configurable (objectif de collecte, avancement projet) |
| Effet machine à écrire | `typewriter` | P2 | Liste de phrases, vitesse configurable |
| Bouton retour en haut | `back_to_top` | P1 | Position, style, seuil de déclenchement |
| Notification de vente | `sales_notification` | P2 | "Jean D. vient d'acheter…" (données manuelles ou webhook) |

### 6.6 Informations pratiques

| Widget | Type | Priorité | Notes |
|---|---|---|---|
| Horaires d'ouverture | `business_hours` | P1 | Jours/plages horaires, fuseau horaire, message "ouvert/fermé" temps réel |
| Google Maps | `google_map` | P1 | Adresse ou Place ID, zoom, style de carte |
| FAQ / Accordéon | `faq` | P1 | Questions/réponses, expand/collapse |
| Tableau de prix | `pricing_table` | P1 | 2–4 colonnes, mise en avant du plan recommandé |
| Membres de l'équipe | `team_members` | P1 | Photo, nom, rôle, liens réseaux |
| Calendrier d'événements | `events_calendar` | P2 | Saisie manuelle ou intégration Google Calendar |
| Météo | `weather` | P2 | OpenWeatherMap, ville ou coordonnées |
| Convertisseur de devises | `currency_converter` | P3 | Taux en temps réel (API open) |
| QR Code | `qr_code` | P2 | URL ou texte, style configurables |

### 6.7 Paiement (léger)

| Widget | Type | Priorité | Notes |
|---|---|---|---|
| Bouton PayPal | `paypal_button` | P2 | Lien PayPal.me ou bouton natif |
| Bouton de don | `donation_button` | P2 | Montants suggérés, Stripe ou PayPal |
| Bouton achat Stripe | `stripe_button` | P3 | Crée une Checkout Session via clé publiable fournie |

---

## 7. Évolutions du dashboard

- **Catalogue de widgets** : page de sélection visuelle avec vignettes, filtres par catégorie, badge "nouveau"/"bientôt"
- **Éditeur de widget** : prévisualisation live en temps réel à droite du formulaire de configuration
- **Snippet d'intégration** : HTML + WordPress shortcode + Webflow custom code, bouton copier
- **Analytics** (plan Pro+) : vues par widget, par période (7j/30j/90j), graphe simple
- **CSS personnalisé** (plan Pro+) : zone de code CSS injectée dans le widget
- **Multi-langue** : widget.js et dashboard disponibles en FR/EN minimum

---

## 8. widget.js — évolutions

- Fichier unique servi par le backend (comme aujourd'hui)
- Supporte plusieurs widgets sur la même page (`data-widget-id` par balise)
- Injecte son propre CSS en shadow DOM ou namespaced pour éviter les conflits
- Badge "Powered by WebWidget" conditionnel selon le plan de l'utilisateur
- Chargement asynchrone, non-bloquant

---

## 9. Charte graphique

### 9.1 Palette de couleurs

| Rôle | Valeur | Usage |
|---|---|---|
| Primary | `#621B7A` | Boutons principaux, header, liens actifs, fond des sections mises en avant |
| Accent | `#9EE992` | Badges, indicateurs de succès, highlights sur fond primary |
| Texte clair | `#1D1E18` | Texte sur fond blanc/clair |
| Texte foncé | `#FFFFFF` | Texte sur fond primary ou sombre |

### 9.2 Thème

- **Thème clair uniquement** (pas de mode sombre à implémenter)
- Fond principal : blanc (`#FFFFFF`) ou gris très clair (`#F8F8F8`)

### 9.3 Boutons

- `border-radius` réduit : **4–6 px** (pas de boutons "pilule")
- Bouton primaire : fond `#621B7A`, texte `#FFFFFF`
- Bouton secondaire/outline : bordure `#621B7A`, texte `#621B7A`, fond transparent
- Bouton accent : fond `#9EE992`, texte `#1D1E18`
- Pas de shadow prononcée, style plat avec légère élévation au hover

### 9.4 Typographie & UI générale

- Interface en français par défaut
- Composants Tailwind CSS, variables CSS custom pour les couleurs de la charte
- Les widgets embarqués (widget.js) proposent leur propre thème configurable (clair/sombre, `accentColor`) indépendamment du dashboard

---

## 10. Contraintes & principes

- **Rétrocompatibilité self-hosted** : `APP_MODE=selfhosted` (valeur par défaut) doit faire fonctionner l'app exactement comme aujourd'hui, sans configuration Stripe ni SMTP obligatoires
- **Pas de vendor lock-in** : le SMTP est configurable (any SMTP), Stripe est optionnel en self-hosted
- **Données** : en mode SaaS, chaque utilisateur ne voit que ses propres widgets (isolation par `userId`)
- **Stack inchangée** : Node/Express/TypeScript, React/Vite, PostgreSQL/Prisma, Docker
- **Sécurité** : rate limiting sur `/api/auth/login` et `/api/auth/register`, refresh tokens révocables
- **Charte graphique** : respecter la palette et les règles de la section 9 pour toute nouvelle interface
- **Séquençage** : priorité à l'infrastructure SaaS (auth, billing, multi-tenant) avant l'expansion du catalogue de widgets ; les widgets sont ensuite ajoutés catégorie par catégorie selon les priorités P1/P2/P3
- **SMTP** : propre serveur SMTP, configuré via variables d'environnement (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`)
