import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { LivePreview, Toggle, LAYOUTS, FORM_DEFAULTS } from './NewWidget';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  profile_photo_url: string;
  relative_time_description: string;
}

interface PreviewData {
  widget: {
    id: string;
    name: string;
    config: {
      theme: string;
      accentColor: string;
      layout: string;
      showHeader: boolean;
      headerTitle: string;
      showAvatar: boolean;
      showDate: boolean;
      truncateText: boolean;
    };
  };
  reviews: Review[];
}

interface Widget {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  createdAt: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
];

function WidgetPreview({ widgetId, apiUrl, refreshKey }: { widgetId: string; apiUrl: string; refreshKey: number }) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${apiUrl}/widget/${widgetId}/reviews`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [widgetId, apiUrl, refreshKey]);

  if (loading) return <p className="text-sm text-gray-400 text-center py-8">Chargement de l'aperçu…</p>;
  if (error) return <p className="text-sm text-red-500 text-center py-4">Erreur : {error}</p>;
  if (!data) return null;

  const c = data.widget.config;

  return (
    <LivePreview
      reviews={data.reviews}
      layout={c.layout || 'list'}
      theme={c.theme || 'light'}
      accentColor={c.accentColor || '#4F46E5'}
      widgetName={data.widget.name}
      showHeader={c.showHeader !== false}
      headerTitle={c.headerTitle || ''}
      showAvatar={c.showAvatar !== false}
      showDate={c.showDate !== false}
      truncateText={c.truncateText !== false}
    />
  );
}

function WebhookJsonPreview({ widgetId, apiUrl, refreshKey }: { widgetId: string; apiUrl: string; refreshKey: number }) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${apiUrl}/widget/${widgetId}/reviews`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [widgetId, apiUrl, refreshKey]);

  if (loading) return <p className="text-sm text-gray-400 text-center py-8">Chargement…</p>;
  if (error) return <p className="text-sm text-red-500 text-center py-4">Erreur : {error}</p>;
  if (!data) return null;

  return (
    <pre className="bg-gray-950 text-blue-300 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed max-h-96">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function WidgetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [widget, setWidget] = useState<Widget | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  // Place autocomplete
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const snippet = `<div id="gw-widget"></div>\n<script src="${apiUrl}/widget.js" data-widget-id="${id}"></script>`;
  const webhookUrl = `${apiUrl}/widget/${id}/reviews`;

  useEffect(() => {
    if (id) api.get(`/api/widgets/${id}`).then(({ data }) => setWidget(data));
  }, [id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function startEditing() {
    if (!widget) return;
    const c = widget.config as any;
    const isWebhook = widget.type === 'google_reviews_webhook';
    setEditForm({
      name: widget.name,
      placeId: c.placeId,
      placeDescription: c.placeDescription || '',
      ...(isWebhook ? {} : {
        layout: c.layout || 'list',
        theme: c.theme || FORM_DEFAULTS.theme,
        accentColor: c.accentColor || FORM_DEFAULTS.accentColor,
        showHeader: c.showHeader !== false,
        headerTitle: c.headerTitle || '',
        showAvatar: c.showAvatar !== false,
        showDate: c.showDate !== false,
        truncateText: c.truncateText !== false,
      }),
      maxReviews: c.maxReviews ?? FORM_DEFAULTS.maxReviews,
      minRating: c.minRating ?? FORM_DEFAULTS.minRating,
      language: c.language || 'fr',
    });
    setSearch(c.placeDescription || '');
    setEditing(true);
    setEditError('');
  }

  function cancelEditing() {
    setEditing(false);
    setEditError('');
    setSuggestions([]);
    setShowDropdown(false);
  }

  function updateField(field: string, value: any) {
    setEditForm((f) => ({ ...f, [field]: value }));
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    updateField('placeId', '');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get('/api/places/search', { params: { q: value } });
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }

  function selectPlace(place: PlacePrediction) {
    setSearch(place.description);
    updateField('placeId', place.place_id);
    updateField('placeDescription', place.description);
    setSuggestions([]);
    setShowDropdown(false);
  }

  async function handleSave() {
    if (!editForm.placeId) {
      setEditError('Veuillez sélectionner un lieu dans la liste.');
      return;
    }
    setSaving(true);
    setEditError('');
    try {
      const { name, ...config } = editForm;
      const { data } = await api.patch(`/api/widgets/${id}`, { name, config });
      setWidget(data);
      setEditing(false);
      setPreviewKey((k) => k + 1);
    } catch {
      setEditError('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  function copySnippet() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce widget définitivement ?')) return;
    setDeleting(true);
    await api.delete(`/api/widgets/${id}`);
    navigate('/');
  }

  if (!widget) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Chargement…
      </div>
    );
  }

  const config = widget.config as any;
  const isWebhook = widget.type === 'google_reviews_webhook';

  const layoutLabel: Record<string, string> = {
    list: 'Liste', grid: 'Grille', stars: 'Étoiles', slider: 'Slider', badge: 'Badge',
  };

  const typeLabel = widget.type === 'google_reviews' ? 'Avis Google'
    : widget.type === 'google_reviews_webhook' ? 'Webhook JSON'
    : widget.type;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-gray-600 text-lg leading-none">←</Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{widget.name}</h1>
              <p className="text-xs text-gray-400">
                {typeLabel}
                {' · '}
                Créé le {new Date(widget.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-5">

        {isWebhook ? (
          /* ── WEBHOOK ─────────────────────────────────────────────── */
          <>
            {/* Endpoint webhook */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Endpoint webhook</h2>
                <button
                  onClick={copyWebhookUrl}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  {copiedUrl ? '✓ Copié !' : 'Copier l\'URL'}
                </button>
              </div>
              <pre className="bg-gray-950 text-green-400 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed">
                GET {webhookUrl}
              </pre>
            </div>

            {/* Exemple curl */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Exemple curl</h2>
              <pre className="bg-gray-950 text-green-400 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed">
                {`curl "${webhookUrl}"`}
              </pre>
            </div>

            {/* Structure de la réponse */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Structure de la réponse</h2>
              <pre className="bg-gray-950 text-blue-300 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed">
{`{
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
}`}
              </pre>
            </div>

            {/* Aperçu live JSON */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Aperçu live</h2>
              {id && <WebhookJsonPreview widgetId={id} apiUrl={apiUrl} refreshKey={previewKey} />}
            </div>
          </>
        ) : (
          /* ── WIDGET ──────────────────────────────────────────────── */
          <>
            {/* Code à intégrer */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Code à intégrer</h2>
                <button
                  onClick={copySnippet}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  {copied ? '✓ Copié !' : 'Copier'}
                </button>
              </div>
              <pre className="bg-gray-950 text-green-400 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed">
                {snippet}
              </pre>
              <p className="text-xs text-gray-400 mt-3">
                Collez ce code dans votre page HTML à l'endroit où vous souhaitez afficher les avis.
              </p>
            </div>

            {/* Aperçu */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Aperçu</h2>
              {id && <WidgetPreview widgetId={id} apiUrl={apiUrl} refreshKey={previewKey} />}
            </div>
          </>
        )}

        {/* Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Configuration</h2>
            {!editing && (
              <button
                onClick={startEditing}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                Modifier
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-5">

              {/* Nom */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nom du widget</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Lieu */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Lieu</label>
                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                    placeholder="Rechercher un établissement…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoComplete="off"
                  />
                  {searching && (
                    <span className="absolute right-3 top-2.5 text-gray-400 text-xs">Recherche…</span>
                  )}
                  {showDropdown && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                      {suggestions.map((place) => (
                        <li
                          key={place.place_id}
                          onMouseDown={() => selectPlace(place)}
                          className="px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                        >
                          <p className="text-sm font-medium text-gray-900">{place.main_text}</p>
                          <p className="text-xs text-gray-400">{place.secondary_text}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {editForm.placeId && (
                  <p className="text-xs text-green-600 mt-1">✓ Lieu sélectionné</p>
                )}
              </div>

              {/* Widget-only fields */}
              {!isWebhook && (
                <>
                  {/* Layout */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Mise en page</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {LAYOUTS.map((l) => (
                        <button
                          key={l.value}
                          type="button"
                          onClick={() => updateField('layout', l.value)}
                          className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                            editForm.layout === l.value
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme + color */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Thème</label>
                      <select
                        value={editForm.theme}
                        onChange={(e) => updateField('theme', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="light">Clair</option>
                        <option value="dark">Sombre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Couleur accent</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editForm.accentColor}
                          onChange={(e) => updateField('accentColor', e.target.value)}
                          className="h-9 w-10 border border-gray-300 rounded-lg cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={editForm.accentColor}
                          onChange={(e) => updateField('accentColor', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Header design */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-700 mb-3">En-tête</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">Afficher l'en-tête</label>
                        <Toggle checked={editForm.showHeader !== false} onChange={v => updateField('showHeader', v)} />
                      </div>
                      {editForm.showHeader !== false && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Titre personnalisé</label>
                          <input
                            type="text"
                            value={editForm.headerTitle || ''}
                            onChange={(e) => updateField('headerTitle', e.target.value)}
                            placeholder="Laissez vide pour utiliser le nom du widget"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reviews design */}
                  {editForm.layout !== 'badge' && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-700 mb-3">Design des avis</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-600">Afficher les avatars</label>
                          <Toggle checked={editForm.showAvatar !== false} onChange={v => updateField('showAvatar', v)} />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-600">Afficher la date</label>
                          <Toggle checked={editForm.showDate !== false} onChange={v => updateField('showDate', v)} />
                        </div>
                        {(editForm.layout === 'list' || editForm.layout === 'grid' || editForm.layout === 'slider') && (
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-600">Tronquer le texte long</label>
                            <Toggle checked={editForm.truncateText !== false} onChange={v => updateField('truncateText', v)} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Filters (shared) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Avis max</label>
                  <select
                    value={editForm.maxReviews}
                    onChange={(e) => updateField('maxReviews', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[3, 5, 10].map((n) => <option key={n} value={n}>{n} avis</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Note minimale</label>
                  <select
                    value={editForm.minRating}
                    onChange={(e) => updateField('minRating', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}★ et +</option>)}
                  </select>
                </div>
              </div>

              {/* Language (shared) */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Langue des avis</label>
                <select
                  value={editForm.language || 'fr'}
                  onChange={(e) => updateField('language', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              {editError && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{editError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {config.placeDescription && (
                <div className="col-span-2">
                  <dt className="text-gray-500 text-xs mb-0.5">Adresse</dt>
                  <dd className="text-gray-900 text-xs">{config.placeDescription}</dd>
                </div>
              )}
              {!isWebhook && (
                <>
                  <div>
                    <dt className="text-gray-500 text-xs mb-0.5">Mise en page</dt>
                    <dd className="text-gray-900">{layoutLabel[config.layout as string] || 'Liste'}</dd>
                  </div>
                </>
              )}
              <div>
                <dt className="text-gray-500 text-xs mb-0.5">Avis max</dt>
                <dd className="text-gray-900">{config.maxReviews}</dd>
              </div>
              <div>
                <dt className="text-gray-500 text-xs mb-0.5">Note minimale</dt>
                <dd className="text-gray-900">{config.minRating}★ et +</dd>
              </div>
              <div>
                <dt className="text-gray-500 text-xs mb-0.5">Langue</dt>
                <dd className="text-gray-900">{LANGUAGES.find(l => l.value === (config.language || 'fr'))?.label || 'Français'}</dd>
              </div>
              {!isWebhook && (
                <>
                  <div>
                    <dt className="text-gray-500 text-xs mb-0.5">Thème</dt>
                    <dd className="text-gray-900">{config.theme === 'dark' ? 'Sombre' : 'Clair'}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <dt className="text-gray-500 text-xs mb-0.5">Couleur accent</dt>
                      <dd className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 rounded border border-gray-200" style={{ background: config.accentColor }} />
                        <span className="text-gray-900 font-mono text-xs">{config.accentColor}</span>
                      </dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-gray-500 text-xs mb-0.5">En-tête</dt>
                    <dd className="text-gray-900">{config.showHeader === false ? 'Masqué' : 'Affiché'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 text-xs mb-0.5">Avatars</dt>
                    <dd className="text-gray-900">{config.showAvatar === false ? 'Masqués' : 'Affichés'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 text-xs mb-0.5">Dates</dt>
                    <dd className="text-gray-900">{config.showDate === false ? 'Masquées' : 'Affichées'}</dd>
                  </div>
                </>
              )}
            </dl>
          )}
        </div>

      </main>
    </div>
  );
}
