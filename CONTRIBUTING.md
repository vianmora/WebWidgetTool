# Guide de contribution

Merci de votre interet pour WebWidget Tool. Ce document explique comment contribuer au projet.

---

## Avant de commencer

- Verifiez que votre idee n'est pas deja couverte par une issue existante
- Pour une fonctionnalite importante, ouvrez une issue avant de commencer a coder — cela evite les efforts gaches
- Les corrections de bugs et ameliorations de documentation sont toujours bienvenues sans discussion prealable

---

## Environnement de developpement

### Prerequis

- Node.js >= 20
- Docker + Docker Compose
- Git

### Installation

```bash
git clone https://github.com/votre-org/web-widget-tool.git
cd web-widget-tool

cp .env.example .env
# Editez .env avec vos valeurs de dev

docker compose -f docker/compose.dev.yml up -d
```

### Lancer en mode dev local (sans Docker pour le code)

```bash
# Terminal 1 — Backend
cd apps/backend
npm install
npm run dev        # http://localhost:4000

# Terminal 2 — Frontend
cd apps/frontend
npm install
npm run dev        # http://localhost:5173

# Terminal 3 — Widget.js (rebuild a chaque modification)
cd apps/backend
npm run build:widget
```

### Commandes utiles

```bash
# Backend
npm run build          # Compile TypeScript + bundle widget.js
npm run build:widget   # Bundle widget.js uniquement (esbuild)

# Frontend
npm run build          # Build React pour production
npm run lint           # ESLint

# Prisma
npx prisma studio      # Interface visuelle de la base de donnees
npx prisma migrate dev --name ma_migration   # Creer une migration
npx prisma generate    # Regenerer le client apres modification du schema
```

---

## Structure du projet

```
apps/backend/src/
├── lib/            # Utilitaires (auth, mailer, stripe, planLimits, mode)
├── middleware/     # authUnified (JWT selfhosted + Better Auth SaaS)
├── routes/         # auth, widgets, billing, admin, public
└── widget/
    ├── core/       # styles.ts, badge.ts (utilitaires partagés par les renderers)
    ├── renderers/  # Un fichier par type de widget
    └── index.ts    # Entry point du bundle widget.js

apps/frontend/src/
├── context/        # UserContext
├── components/     # Navbar
├── pages/          # Dashboard, NewWidget, WidgetDetail, Billing, Admin, Login...
└── data/
    └── widgetCatalog.ts   # Catalogue centralise de tous les widgets
```

---

## Ajouter un nouveau widget

C'est la contribution la plus courante. Voici les etapes :

### 1. Declarer le widget dans le catalogue

Editez `apps/frontend/src/data/widgetCatalog.ts` et ajoutez une entree dans `WIDGET_CATALOG` :

```typescript
{
  type: 'mon_widget',
  name: 'Mon Widget',
  description: 'Description courte de ce que fait le widget.',
  icon: '🔧',
  category: 'Interaction',  // choisir parmi CATEGORIES
  status: 'available',      // ou 'soon' pour l'afficher sans l'activer
  defaultConfig: {
    title: 'Titre par defaut',
    color: '#621B7A',
  },
  fields: [
    { key: 'title', label: 'Titre', type: 'text', required: true },
    { key: 'color', label: 'Couleur', type: 'color' },
  ],
}
```

Types de champs disponibles : `text`, `textarea`, `number`, `url`, `email`, `phone`, `color`, `select`, `toggle`, `date`.

### 2. Creer le renderer

Creez `apps/backend/src/widget/renderers/mon_widget.ts` :

```typescript
export function renderMonWidget(container: HTMLElement, config: Record<string, any>): void {
  const el = document.createElement('div');
  el.className = 'ww-mon-widget';
  el.innerHTML = `<p>${config.title || 'Mon Widget'}</p>`;

  // Injecter les styles si necessaire
  const style = document.createElement('style');
  style.textContent = `.ww-mon-widget { /* vos styles */ }`;
  document.head.appendChild(style);

  container.appendChild(el);
}
```

Regles importantes :
- Prefixez toutes les classes CSS avec `.ww-` pour eviter les conflits
- N'utilisez aucune dependance externe (le bundle doit rester autonome)
- Gerez le cas ou `config` contient des valeurs manquantes ou invalides

### 3. Enregistrer le renderer

Dans `apps/backend/src/widget/index.ts`, importez et ajoutez votre renderer :

```typescript
import { renderMonWidget } from './renderers/mon_widget';

const RENDERERS: Record<string, (el: HTMLElement, cfg: Record<string, any>) => void> = {
  // ...renderers existants...
  mon_widget: renderMonWidget,
};
```

Si votre widget est flottant (s'attache a `document.body` plutot qu'a son conteneur), ajoutez son type dans `BODY_WIDGETS` :

```typescript
const BODY_WIDGETS = new Set(['whatsapp_button', 'telegram_button', 'cookie_banner', 'back_to_top', 'mon_widget']);
```

### 4. Rebuilder et tester

```bash
cd apps/backend
npm run build:widget
```

Creez un widget de ce type dans le dashboard et testez le snippet HTML dans une page de test.

---

## Conventions de code

### TypeScript

- Pas de `any` sauf dans les configurations de widgets (les configs sont des `Record<string, any>` par design)
- Pas de `!` non-null assertion sauf quand le contexte garantit la valeur
- Les fonctions exportees sont documentees uniquement si leur signature ne suffit pas

### CSS dans les renderers

- Toujours prefixer avec `.ww-` : `.ww-card`, `.ww-btn`, `.ww-overlay`
- Utiliser des variables CSS pour les couleurs configurables via `config`
- Les styles sont injectes dans `<head>` via un element `<style>` — verifiez qu'ils ne sont pas injectes plusieurs fois si `initAll()` est appele

### Commits

Format : `type(scope): message court`

```
feat(widget): add youtube_gallery renderer
fix(billing): handle webhook signature failure gracefully
docs(self-hosting): add nginx reverse proxy example
refactor(auth): extract session validation to helper
```

Types : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Soumettre une Pull Request

1. Forkez le repo et creez une branche depuis `main` :
   ```bash
   git checkout -b feat/mon-widget
   ```

2. Codez votre modification en suivant les conventions ci-dessus

3. Verifiez que le build TypeScript passe :
   ```bash
   cd apps/backend && npx tsc --noEmit
   cd apps/frontend && npm run build
   ```

4. Poussez et ouvrez une PR vers `main`

5. Decrivez dans la PR :
   - Ce que fait la modification
   - Comment la tester
   - Des captures d'ecran si c'est visuel

---

## Signaler un bug

Ouvrez une issue avec :
- La version utilisee (tag Git ou commit)
- Le mode de deploiement (`selfhosted` ou `saas`, Docker ou local)
- Les etapes pour reproduire
- Le comportement observe vs attendu
- Les logs pertinents (`docker logs <container>`)

---

## Questions

Ouvrez une issue avec le label `question`.
