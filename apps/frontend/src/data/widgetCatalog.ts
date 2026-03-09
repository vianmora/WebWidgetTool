export interface WidgetTemplate {
  id: string;
  label: string;
  config: Record<string, any>;
}

export interface WidgetDefinition {
  type: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  image?: string;
  status: 'available' | 'soon';
  defaultConfig: Record<string, any>;
  fields: FieldDefinition[];
  apiWidget?: boolean;
  templates?: WidgetTemplate[];
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'color' | 'url' | 'email' | 'phone' | 'toggle' | 'array' | 'date';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  required?: boolean;
  help?: string;
}

export const WIDGET_CATALOG: WidgetDefinition[] = [
  // ── Avis & témoignages ──
  {
    type: 'google_reviews',
    name: 'Google Reviews',
    description: 'Affichez vos avis Google directement sur votre site.',
    category: 'Avis & Témoignages',
    icon: '⭐',
    image: '/google-reviews-banner.png',
    status: 'available',
    apiWidget: true,
    defaultConfig: { placeId: '', maxReviews: 5, minRating: 4, theme: 'light', accentColor: '#621B7A', layout: 'list', language: 'fr' },
    templates: [
      { id: 'list-light', label: 'Liste claire', config: { layout: 'list', theme: 'light' } },
      { id: 'grid-light', label: 'Grille claire', config: { layout: 'grid', theme: 'light' } },
      { id: 'list-dark', label: 'Liste sombre', config: { layout: 'list', theme: 'dark' } },
      { id: 'grid-dark', label: 'Grille sombre', config: { layout: 'grid', theme: 'dark' } },
    ],
    fields: [
      { key: 'placeId', label: 'Établissement Google', type: 'text', placeholder: 'ChIJ...', required: true, help: 'Recherchez votre établissement par nom ci-dessus' },
      { key: 'maxReviews', label: 'Nombre d\'avis max', type: 'number', min: 1, max: 20 },
      { key: 'minRating', label: 'Note minimale', type: 'select', options: [1,2,3,4,5].map(n => ({ value: String(n), label: `${n} étoile${n>1?'s':''} et +` })) },
      { key: 'layout', label: 'Disposition', type: 'select', options: [{ value: 'list', label: 'Liste' }, { value: 'grid', label: 'Grille' }] },
      { key: 'theme', label: 'Thème', type: 'select', options: [{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }] },
      { key: 'accentColor', label: 'Couleur d\'accent', type: 'color' },
      { key: 'language', label: 'Langue des avis', type: 'select', options: [{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }] },
    ],
  },
  {
    type: 'testimonials',
    name: 'Témoignages',
    description: 'Affichez des témoignages clients saisis manuellement.',
    category: 'Avis & Témoignages',
    icon: '💬',
    status: 'soon',
    defaultConfig: { items: [], layout: 'grid', theme: 'light', accentColor: '#621B7A' },
    templates: [
      { id: 'grid-light', label: 'Grille claire', config: { layout: 'grid', theme: 'light' } },
      { id: 'list-light', label: 'Liste claire', config: { layout: 'list', theme: 'light' } },
      { id: 'grid-dark', label: 'Grille sombre', config: { layout: 'grid', theme: 'dark' } },
      { id: 'list-dark', label: 'Liste sombre', config: { layout: 'list', theme: 'dark' } },
    ],
    fields: [
      { key: 'layout', label: 'Disposition', type: 'select', options: [{ value: 'grid', label: 'Grille' }, { value: 'list', label: 'Liste' }] },
      { key: 'theme', label: 'Thème', type: 'select', options: [{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }] },
      { key: 'accentColor', label: 'Couleur d\'accent', type: 'color' },
    ],
  },
  {
    type: 'rating_badge',
    name: 'Badge de note',
    description: 'Affichez votre note globale en un coup d\'œil.',
    category: 'Avis & Témoignages',
    icon: '🏅',
    status: 'soon',
    defaultConfig: { source: 'google', rating: 4.8, reviewCount: 120, sourceUrl: '', shape: 'pill', theme: 'light', accentColor: '#621B7A' },
    templates: [
      { id: 'pill-light', label: 'Pilule claire', config: { shape: 'pill', theme: 'light' } },
      { id: 'square-dark', label: 'Carte sombre', config: { shape: 'square', theme: 'dark' } },
    ],
    fields: [
      { key: 'source', label: 'Source', type: 'select', options: [{ value: 'google', label: 'Google' }, { value: 'trustpilot', label: 'Trustpilot' }, { value: 'tripadvisor', label: 'TripAdvisor' }] },
      { key: 'rating', label: 'Note (ex: 4.8)', type: 'number', min: 0, max: 5 },
      { key: 'reviewCount', label: 'Nombre d\'avis', type: 'number', min: 0 },
      { key: 'sourceUrl', label: 'Lien vers les avis', type: 'url' },
      { key: 'shape', label: 'Forme', type: 'select', options: [{ value: 'pill', label: 'Pilule' }, { value: 'square', label: 'Carré' }] },
      { key: 'accentColor', label: 'Couleur', type: 'color' },
    ],
  },
  // ── Boutons sociaux ──
  {
    type: 'whatsapp_button',
    name: 'Bouton WhatsApp',
    description: 'Bouton de contact WhatsApp flottant sur votre site.',
    category: 'Boutons sociaux',
    icon: '💚',
    status: 'soon',
    defaultConfig: { phone: '', message: 'Bonjour, je vous contacte depuis votre site web.', position: 'bottom-right', label: '', size: 56 },
    templates: [
      { id: 'right', label: 'Flottant droite', config: { position: 'bottom-right' } },
      { id: 'left', label: 'Flottant gauche', config: { position: 'bottom-left' } },
    ],
    fields: [
      { key: 'phone', label: 'Numéro (format international)', type: 'phone', placeholder: '33612345678', required: true },
      { key: 'message', label: 'Message pré-rempli', type: 'textarea', placeholder: 'Bonjour...' },
      { key: 'label', label: 'Texte du bouton (optionnel)', type: 'text', placeholder: 'Nous contacter' },
      { key: 'position', label: 'Position', type: 'select', options: [{ value: 'bottom-right', label: 'Bas droite' }, { value: 'bottom-left', label: 'Bas gauche' }] },
    ],
  },
  {
    type: 'telegram_button',
    name: 'Bouton Telegram',
    description: 'Bouton de contact Telegram flottant.',
    category: 'Boutons sociaux',
    icon: '✈️',
    status: 'soon',
    defaultConfig: { username: '', label: '', position: 'bottom-right', size: 56 },
    templates: [
      { id: 'right', label: 'Flottant droite', config: { position: 'bottom-right' } },
      { id: 'left', label: 'Flottant gauche', config: { position: 'bottom-left' } },
    ],
    fields: [
      { key: 'username', label: 'Nom d\'utilisateur Telegram', type: 'text', placeholder: 'moncompte', required: true },
      { key: 'label', label: 'Texte (optionnel)', type: 'text' },
      { key: 'position', label: 'Position', type: 'select', options: [{ value: 'bottom-right', label: 'Bas droite' }, { value: 'bottom-left', label: 'Bas gauche' }] },
    ],
  },
  {
    type: 'social_icons',
    name: 'Icônes réseaux sociaux',
    description: 'Liens vers vos profils, en icônes stylisées.',
    category: 'Boutons sociaux',
    icon: '🔗',
    status: 'soon',
    defaultConfig: { links: [], size: 32, color: 'brand', layout: 'row' },
    templates: [
      { id: 'row', label: 'Rangée colorée', config: { layout: 'row', color: 'brand' } },
      { id: 'column', label: 'Colonne monochrome', config: { layout: 'column', color: 'monochrome' } },
    ],
    fields: [
      { key: 'size', label: 'Taille (px)', type: 'number', min: 16, max: 64 },
      { key: 'color', label: 'Couleur', type: 'select', options: [{ value: 'brand', label: 'Couleur de marque' }, { value: 'monochrome', label: 'Monochrome' }] },
      { key: 'layout', label: 'Orientation', type: 'select', options: [{ value: 'row', label: 'Horizontal' }, { value: 'column', label: 'Vertical' }] },
    ],
  },
  {
    type: 'social_share',
    name: 'Boutons de partage',
    description: 'Permettez à vos visiteurs de partager votre contenu.',
    category: 'Boutons sociaux',
    icon: '📤',
    status: 'soon',
    defaultConfig: { networks: ['facebook', 'x', 'linkedin', 'whatsapp', 'copy'], position: 'inline', orientation: 'horizontal' },
    fields: [
      { key: 'position', label: 'Position', type: 'select', options: [{ value: 'inline', label: 'Intégré' }, { value: 'floating', label: 'Flottant' }] },
      { key: 'orientation', label: 'Orientation', type: 'select', options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }] },
    ],
  },
  // ── Médias & contenu ──
  {
    type: 'logo_carousel',
    name: 'Carrousel de logos',
    description: 'Logos clients / partenaires en défilement automatique.',
    category: 'Médias & Contenu',
    icon: '🖼️',
    status: 'soon',
    defaultConfig: { logos: [], speed: 30, pauseOnHover: true, height: 60 },
    fields: [
      { key: 'speed', label: 'Vitesse (secondes/boucle)', type: 'number', min: 5, max: 120 },
      { key: 'height', label: 'Hauteur des logos (px)', type: 'number', min: 30, max: 120 },
      { key: 'pauseOnHover', label: 'Pause au survol', type: 'toggle' },
    ],
  },
  {
    type: 'image_gallery',
    name: 'Galerie d\'images',
    description: 'Galerie photo avec lightbox, grille ou carrousel.',
    category: 'Médias & Contenu',
    icon: '📷',
    status: 'soon',
    defaultConfig: { images: [], layout: 'grid', columns: 3, lightbox: true },
    templates: [
      { id: 'grid', label: 'Grille', config: { layout: 'grid' } },
      { id: 'carousel', label: 'Carrousel', config: { layout: 'carousel' } },
    ],
    fields: [
      { key: 'layout', label: 'Disposition', type: 'select', options: [{ value: 'grid', label: 'Grille' }, { value: 'carousel', label: 'Carrousel' }] },
      { key: 'columns', label: 'Colonnes', type: 'number', min: 1, max: 6 },
      { key: 'lightbox', label: 'Lightbox au clic', type: 'toggle' },
    ],
  },
  {
    type: 'pdf_viewer',
    name: 'Visionneuse PDF',
    description: 'Intégrez un document PDF directement sur votre page.',
    category: 'Médias & Contenu',
    icon: '📄',
    status: 'soon',
    defaultConfig: { pdfUrl: '', height: 600, showToolbar: true },
    fields: [
      { key: 'pdfUrl', label: 'URL du PDF', type: 'url', required: true },
      { key: 'height', label: 'Hauteur (px)', type: 'number', min: 200, max: 1200 },
      { key: 'showToolbar', label: 'Afficher la barre d\'outils', type: 'toggle' },
    ],
  },
  // ── Conversion & Engagement ──
  {
    type: 'countdown_timer',
    name: 'Compte à rebours',
    description: 'Créez de l\'urgence avec un timer jusqu\'à une date.',
    category: 'Conversion & Engagement',
    icon: '⏱️',
    status: 'soon',
    defaultConfig: { targetDate: '', expiredMessage: 'Événement terminé', theme: 'light', accentColor: '#621B7A' },
    templates: [
      { id: 'light', label: 'Clair', config: { theme: 'light' } },
      { id: 'dark', label: 'Sombre', config: { theme: 'dark' } },
    ],
    fields: [
      { key: 'targetDate', label: 'Date/heure cible', type: 'date', required: true },
      { key: 'expiredMessage', label: 'Message à l\'expiration', type: 'text' },
      { key: 'theme', label: 'Thème', type: 'select', options: [{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }] },
      { key: 'accentColor', label: 'Couleur', type: 'color' },
    ],
  },
  {
    type: 'cookie_banner',
    name: 'Bannière cookie',
    description: 'Bandeau de consentement RGPD personnalisable.',
    category: 'Conversion & Engagement',
    icon: '🍪',
    status: 'soon',
    defaultConfig: { message: 'Nous utilisons des cookies pour améliorer votre expérience.', acceptLabel: 'Accepter', rejectLabel: 'Refuser', position: 'bottom', privacyUrl: '', accentColor: '#621B7A' },
    fields: [
      { key: 'message', label: 'Message', type: 'textarea' },
      { key: 'acceptLabel', label: 'Bouton accepter', type: 'text' },
      { key: 'rejectLabel', label: 'Bouton refuser', type: 'text' },
      { key: 'privacyUrl', label: 'Lien politique de confidentialité', type: 'url' },
      { key: 'position', label: 'Position', type: 'select', options: [{ value: 'bottom', label: 'Bas' }, { value: 'top', label: 'Haut' }] },
      { key: 'accentColor', label: 'Couleur du bouton', type: 'color' },
    ],
  },
  {
    type: 'back_to_top',
    name: 'Retour en haut',
    description: 'Bouton flottant pour remonter en haut de page.',
    category: 'Conversion & Engagement',
    icon: '⬆️',
    status: 'soon',
    defaultConfig: { threshold: 300, position: 'bottom-right', shape: 'circle', accentColor: '#621B7A' },
    fields: [
      { key: 'threshold', label: 'Apparaît après (px scrollés)', type: 'number', min: 100, max: 1000 },
      { key: 'position', label: 'Position', type: 'select', options: [{ value: 'bottom-right', label: 'Bas droite' }, { value: 'bottom-left', label: 'Bas gauche' }] },
      { key: 'shape', label: 'Forme', type: 'select', options: [{ value: 'circle', label: 'Cercle' }, { value: 'square', label: 'Carré' }] },
      { key: 'accentColor', label: 'Couleur', type: 'color' },
    ],
  },
  // ── Informations pratiques ──
  {
    type: 'business_hours',
    name: 'Horaires d\'ouverture',
    description: 'Affichez vos horaires avec statut ouvert/fermé en temps réel.',
    category: 'Informations pratiques',
    icon: '🕐',
    status: 'soon',
    defaultConfig: { timezone: 'Europe/Paris', hours: [], openLabel: 'Ouvert', closedLabel: 'Fermé', theme: 'light', accentColor: '#621B7A' },
    templates: [
      { id: 'light', label: 'Clair', config: { theme: 'light' } },
      { id: 'dark', label: 'Sombre', config: { theme: 'dark' } },
    ],
    fields: [
      { key: 'timezone', label: 'Fuseau horaire', type: 'select', options: [{ value: 'Europe/Paris', label: 'Europe/Paris' }, { value: 'Europe/London', label: 'Europe/London' }, { value: 'America/New_York', label: 'America/New_York' }] },
      { key: 'openLabel', label: 'Label "Ouvert"', type: 'text' },
      { key: 'closedLabel', label: 'Label "Fermé"', type: 'text' },
      { key: 'theme', label: 'Thème', type: 'select', options: [{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }] },
      { key: 'accentColor', label: 'Couleur', type: 'color' },
    ],
  },
  {
    type: 'google_map',
    name: 'Google Maps',
    description: 'Intégrez une carte Google Maps avec votre localisation.',
    category: 'Informations pratiques',
    icon: '📍',
    status: 'soon',
    defaultConfig: { address: '', placeId: '', zoom: 15, height: 400, showMarker: true },
    fields: [
      { key: 'address', label: 'Adresse (ou Place ID ci-dessous)', type: 'text', placeholder: '10 rue de la Paix, Paris' },
      { key: 'placeId', label: 'Google Place ID (prioritaire)', type: 'text', placeholder: 'ChIJ...' },
      { key: 'zoom', label: 'Zoom (1-20)', type: 'number', min: 1, max: 20 },
      { key: 'height', label: 'Hauteur (px)', type: 'number', min: 150, max: 800 },
    ],
  },
  {
    type: 'faq',
    name: 'FAQ / Accordéon',
    description: 'Questions/Réponses en accordéon interactif.',
    category: 'Informations pratiques',
    icon: '❓',
    status: 'soon',
    defaultConfig: { items: [], allowMultiple: false, defaultOpen: -1, theme: 'light', accentColor: '#621B7A' },
    templates: [
      { id: 'light', label: 'Clair', config: { theme: 'light' } },
      { id: 'dark', label: 'Sombre', config: { theme: 'dark' } },
    ],
    fields: [
      { key: 'allowMultiple', label: 'Permettre plusieurs ouverts', type: 'toggle' },
      { key: 'theme', label: 'Thème', type: 'select', options: [{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }] },
      { key: 'accentColor', label: 'Couleur', type: 'color' },
    ],
  },
  {
    type: 'pricing_table',
    name: 'Tableau de prix',
    description: 'Comparez vos offres avec un tableau de pricing.',
    category: 'Informations pratiques',
    icon: '💰',
    status: 'soon',
    defaultConfig: { plans: [], currency: '€', theme: 'light', accentColor: '#621B7A' },
    templates: [
      { id: 'light', label: 'Clair', config: { theme: 'light' } },
      { id: 'dark', label: 'Sombre', config: { theme: 'dark' } },
    ],
    fields: [
      { key: 'currency', label: 'Devise', type: 'text', placeholder: '€' },
      { key: 'theme', label: 'Thème', type: 'select', options: [{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }] },
      { key: 'accentColor', label: 'Couleur principale', type: 'color' },
    ],
  },
  {
    type: 'team_members',
    name: 'Membres de l\'équipe',
    description: 'Présentez votre équipe avec photos et réseaux sociaux.',
    category: 'Informations pratiques',
    icon: '👥',
    status: 'soon',
    defaultConfig: { members: [], layout: 'grid', columns: 3, theme: 'light', accentColor: '#621B7A' },
    templates: [
      { id: 'grid', label: 'Grille', config: { layout: 'grid', theme: 'light' } },
      { id: 'list', label: 'Liste', config: { layout: 'list', theme: 'light' } },
    ],
    fields: [
      { key: 'layout', label: 'Disposition', type: 'select', options: [{ value: 'grid', label: 'Grille' }, { value: 'list', label: 'Liste' }] },
      { key: 'columns', label: 'Colonnes', type: 'number', min: 1, max: 6 },
      { key: 'theme', label: 'Thème', type: 'select', options: [{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }] },
      { key: 'accentColor', label: 'Couleur', type: 'color' },
    ],
  },
  // ── Coming soon ──
  { type: 'instagram_feed', name: 'Instagram Feed', description: 'Affichez votre feed Instagram.', category: 'Réseaux sociaux', icon: '📸', status: 'soon', defaultConfig: {}, fields: [] },
  { type: 'youtube_gallery', name: 'YouTube Gallery', description: 'Galerie de vos vidéos YouTube.', category: 'Réseaux sociaux', icon: '▶️', status: 'soon', defaultConfig: {}, fields: [] },
  { type: 'contact_form', name: 'Formulaire de contact', description: 'Formulaire de contact personnalisable.', category: 'Conversion & Engagement', icon: '✉️', status: 'soon', defaultConfig: {}, fields: [] },
  { type: 'popup', name: 'Popup / Modal', description: 'Popup avec déclencheur personnalisable.', category: 'Conversion & Engagement', icon: '📣', status: 'soon', defaultConfig: {}, fields: [] },
  { type: 'newsletter_signup', name: 'Newsletter', description: 'Formulaire d\'inscription newsletter.', category: 'Conversion & Engagement', icon: '📧', status: 'soon', defaultConfig: {}, fields: [] },
  { type: 'trustpilot_reviews', name: 'Trustpilot Reviews', description: 'Affichez vos avis Trustpilot.', category: 'Avis & Témoignages', icon: '⭐', status: 'soon', defaultConfig: {}, fields: [] },
];

export const CATEGORIES = [...new Set(WIDGET_CATALOG.map(w => w.category))];

export function getWidgetDef(type: string): WidgetDefinition | undefined {
  return WIDGET_CATALOG.find(w => w.type === type);
}
