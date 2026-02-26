import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';

interface FormState {
  name: string;
  placeId: string;
  apiKey: string;
  maxReviews: number;
  minRating: number;
  theme: string;
  accentColor: string;
}

export default function NewWidget() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>({
    name: '',
    placeId: '',
    apiKey: '',
    maxReviews: 5,
    minRating: 4,
    theme: 'light',
    accentColor: '#4F46E5',
  });

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { name, ...config } = form;
      const { data } = await api.post('/api/widgets', {
        name,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-lg leading-none">←</Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Nouveau widget</h1>
            <p className="text-xs text-gray-400">Avis Google</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du widget</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Ex: Avis Google — Mon Restaurant"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Place ID</label>
            <input
              type="text"
              value={form.placeId}
              onChange={(e) => update('placeId', e.target.value)}
              placeholder="ChIJ…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Trouvez votre Place ID sur{' '}
              <a
                href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-500 hover:underline"
              >
                Google Place Finder
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clé API Google Maps</label>
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => update('apiKey', e.target.value)}
              placeholder="AIza…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              La clé doit avoir l'API <strong>Places</strong> activée.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'avis max</label>
              <select
                value={form.maxReviews}
                onChange={(e) => update('maxReviews', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[3, 5, 10].map((n) => (
                  <option key={n} value={n}>{n} avis</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note minimale</label>
              <select
                value={form.minRating}
                onChange={(e) => update('minRating', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}★ et +</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thème</label>
              <select
                value={form.theme}
                onChange={(e) => update('theme', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur accent</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => update('accentColor', e.target.value)}
                  className="h-9 w-10 border border-gray-300 rounded-lg cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={form.accentColor}
                  onChange={(e) => update('accentColor', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Link to="/" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Création…' : 'Créer le widget'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
