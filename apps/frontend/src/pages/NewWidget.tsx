import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  profile_photo_url: string;
  relative_time_description: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface FormState {
  name: string;
  placeId: string;
  placeName: string;
  placeDescription: string;
  layout: string;
  maxReviews: number;
  minRating: number;
  theme: string;
  accentColor: string;
}

const MOCK_REVIEWS: Review[] = [
  { author_name: 'Marie Dupont', rating: 5, text: 'Excellent service, personnel très accueillant ! Je recommande vivement.', profile_photo_url: '', relative_time_description: 'il y a 2 semaines' },
  { author_name: 'Jean Martin', rating: 5, text: 'Très bonne expérience, je reviendrai sans hésiter.', profile_photo_url: '', relative_time_description: 'il y a 1 mois' },
  { author_name: 'Sophie Bernard', rating: 4, text: 'Bon rapport qualité-prix, personnel sympathique.', profile_photo_url: '', relative_time_description: 'il y a 3 semaines' },
];

const STEP_LABELS = ['Design', 'Localisation', 'Paramètres'];

// --- Preview components ---

function StarRating({ rating }: { rating: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#FBBF24' : '#D1D5DB' }}>★</span>
      ))}
    </span>
  );
}

function ReviewCardList({ review, isDark }: { review: Review; isDark: boolean }) {
  const bg = isDark ? '#111827' : '#F9FAFB';
  const border = isDark ? '#374151' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subColor = isDark ? '#9CA3AF' : '#6B7280';
  return (
    <div style={{ padding: 16, background: bg, borderRadius: 8, border: `1px solid ${border}`, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: isDark ? '#374151' : '#E5E7EB', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: textColor }}>{review.author_name}</div>
          <StarRating rating={review.rating} />
        </div>
      </div>
      {review.text && <p style={{ color: subColor, margin: 0, fontSize: 14, lineHeight: 1.6 }}>{review.text}</p>}
      {review.relative_time_description && <div style={{ color: subColor, fontSize: 12, marginTop: 8 }}>{review.relative_time_description}</div>}
    </div>
  );
}

function ReviewCardGrid({ review, isDark }: { review: Review; isDark: boolean }) {
  const bg = isDark ? '#111827' : '#F9FAFB';
  const border = isDark ? '#374151' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subColor = isDark ? '#9CA3AF' : '#6B7280';
  return (
    <div style={{ padding: 16, background: bg, borderRadius: 8, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? '#374151' : '#E5E7EB', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: textColor }}>{review.author_name}</div>
          <StarRating rating={review.rating} />
        </div>
      </div>
      {review.text && <p style={{ color: subColor, margin: 0, fontSize: 13, lineHeight: 1.5, flex: 1 }}>{review.text}</p>}
      {review.relative_time_description && <div style={{ color: subColor, fontSize: 11, marginTop: 8 }}>{review.relative_time_description}</div>}
    </div>
  );
}

function ReviewCardStars({ review, isDark }: { review: Review; isDark: boolean }) {
  const border = isDark ? '#374151' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subColor = isDark ? '#9CA3AF' : '#6B7280';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${border}` }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? '#374151' : '#E5E7EB', flexShrink: 0 }} />
      <span style={{ fontWeight: 600, fontSize: 14, color: textColor, flex: 1 }}>{review.author_name}</span>
      <StarRating rating={review.rating} />
      {review.relative_time_description && <span style={{ fontSize: 12, color: subColor, whiteSpace: 'nowrap' }}>{review.relative_time_description}</span>}
    </div>
  );
}

export function LivePreview({ reviews, layout, theme, accentColor, widgetName }: {
  reviews: Review[]; layout: string; theme: string; accentColor: string; widgetName: string;
}) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1F2937' : '#FFFFFF';
  const border = isDark ? '#374151' : '#E5E7EB';
  const subColor = isDark ? '#9CA3AF' : '#6B7280';

  function renderReviews() {
    if (layout === 'grid') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {reviews.map((r, i) => <ReviewCardGrid key={i} review={r} isDark={isDark} />)}
        </div>
      );
    }
    if (layout === 'stars') {
      return <div>{reviews.map((r, i) => <ReviewCardStars key={i} review={r} isDark={isDark} />)}</div>;
    }
    return <div>{reviews.map((r, i) => <ReviewCardList key={i} review={r} isDark={isDark} />)}</div>;
  }

  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', background: bg, borderRadius: 12, padding: 24, border: `1px solid ${border}` }}>
      <h3 style={{ color: accentColor, margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>{widgetName}</h3>
      {renderReviews()}
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: subColor }}>Powered by WebWidget</div>
    </div>
  );
}

// --- Step indicator ---

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                done ? 'bg-indigo-600 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {done ? '✓' : step}
              </div>
              <span className={`text-xs mt-1 font-medium ${active ? 'text-indigo-600' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-16 h-0.5 mb-5 mx-1 transition-colors ${done ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Main component ---

export default function NewWidget() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>({
    name: '',
    placeId: '',
    placeName: '',
    placeDescription: '',
    layout: 'list',
    maxReviews: 5,
    minRating: 4,
    theme: 'light',
    accentColor: '#4F46E5',
  });

  const [previewReviews, setPreviewReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [previewName, setPreviewName] = useState('Aperçu du widget');

  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;

  useEffect(() => {
    api.get('/api/widgets').then(({ data: widgets }) => {
      if (widgets.length > 0) {
        fetch(`${apiUrl}/widget/${widgets[0].id}/reviews`)
          .then(r => r.json())
          .then(d => {
            if (!d.error && d.reviews?.length > 0) {
              setPreviewReviews(d.reviews);
              setPreviewName(d.widget.name);
            }
          })
          .catch(() => {});
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    update('placeId', '');
    update('placeName', '');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get('/api/places/search', { params: { q: value } });
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      } catch { setSuggestions([]); }
      finally { setSearching(false); }
    }, 350);
  }

  function selectPlace(place: PlacePrediction) {
    setSearch(place.description);
    update('placeId', place.place_id);
    update('placeName', place.main_text);
    update('placeDescription', place.description);
    setSuggestions([]);
    setShowDropdown(false);
    api.get('/api/places/reviews', { params: { placeId: place.place_id } })
      .then(({ data }) => { if (data?.length > 0) setPreviewReviews(data); })
      .catch(() => {});
  }

  function nextStep() {
    setError('');
    if (step === 2 && !form.placeId) {
      setError('Veuillez sélectionner un lieu dans la liste.');
      return;
    }
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const { name, placeName, ...config } = form;
      const { data } = await api.post('/api/widgets', {
        name: name || placeName,
        type: 'google_reviews',
        config,
      });
      navigate(`/widgets/${data.id}`);
    } catch {
      setError('Erreur lors de la création du widget.');
    } finally {
      setLoading(false);
    }
  }

  const LAYOUTS = [
    { value: 'list', label: 'Liste', desc: 'Cartes empilées' },
    { value: 'grid', label: 'Grille', desc: '2 colonnes' },
    { value: 'stars', label: 'Étoiles', desc: 'Vue compacte' },
  ];

  const previewProps = {
    reviews: previewReviews.slice(0, form.maxReviews),
    layout: form.layout,
    theme: form.theme,
    accentColor: form.accentColor,
    widgetName: form.name || form.placeName || previewName,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-lg leading-none">←</Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Nouveau widget</h1>
            <p className="text-xs text-gray-400">Avis Google</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <StepIndicator current={step} />

        {/* Two-column layout on large screens */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">

          {/* Left: form */}
          <div className="w-full xl:flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 p-6">

              {/* Étape 1 — Design */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-semibold text-gray-900 mb-1">Choisissez un design</h2>
                    <p className="text-xs text-gray-400 mb-4">L'aperçu se met à jour en temps réel.</p>
                    <div className="grid grid-cols-3 gap-3">
                      {LAYOUTS.map(l => (
                        <button
                          key={l.value}
                          type="button"
                          onClick={() => update('layout', l.value)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            form.layout === l.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className={`text-sm font-semibold ${form.layout === l.value ? 'text-indigo-600' : 'text-gray-700'}`}>{l.label}</p>
                          <p className="text-xs text-gray-400">{l.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thème</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }].map(t => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => update('theme', t.value)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            form.theme === t.value ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur accent</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={form.accentColor}
                        onChange={e => update('accentColor', e.target.value)}
                        className="h-9 w-10 border border-gray-300 rounded-lg cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={form.accentColor}
                        onChange={e => update('accentColor', e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Preview on mobile only (hidden on xl) */}
                  <div className="xl:hidden">
                    <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Aperçu</p>
                    <LivePreview {...previewProps} />
                  </div>
                </div>
              )}

              {/* Étape 2 — Localisation */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-semibold text-gray-900 mb-1">Quel établissement ?</h2>
                    <p className="text-xs text-gray-400 mb-4">Recherchez votre établissement par son nom.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                    <div className="relative" ref={dropdownRef}>
                      <input
                        type="text"
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                        placeholder="Ex: Boulangerie Martin, Paris…"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoComplete="off"
                        autoFocus
                      />
                      {searching && <span className="absolute right-3 top-2.5 text-gray-400 text-xs">Recherche…</span>}
                      {showDropdown && (
                        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                          {suggestions.map(place => (
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
                    {form.placeId && (
                      <p className="text-xs text-green-600 mt-1">✓ {form.placeDescription}</p>
                    )}
                  </div>
                  {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                </div>
              )}

              {/* Étape 3 — Paramètres */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-semibold text-gray-900 mb-1">Paramètres complémentaires</h2>
                    <p className="text-xs text-gray-400 mb-4">Tous les champs sont optionnels.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du widget</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      placeholder={form.placeName || 'Ex: Avis Google — Mon Restaurant'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Si vide, le nom du lieu sera utilisé.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'avis max</label>
                      <select
                        value={form.maxReviews}
                        onChange={e => update('maxReviews', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {[3, 5, 10].map(n => <option key={n} value={n}>{n} avis</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note minimale</label>
                      <select
                        value={form.minRating}
                        onChange={e => update('minRating', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}★ et +</option>)}
                      </select>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-6 pt-5 border-t border-gray-100">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(s => s - 1)} className="text-sm text-gray-500 hover:text-gray-700">
                    ← Précédent
                  </button>
                ) : (
                  <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">Annuler</Link>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Création…' : 'Créer le widget'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: sticky preview (hidden on small screens) */}
          <div className="hidden xl:block xl:w-96 flex-shrink-0">
            <div className="sticky top-6">
              <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Aperçu en temps réel</p>
              <LivePreview {...previewProps} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
