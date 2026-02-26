import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface Widget {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  createdAt: string;
}

export default function WidgetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [widget, setWidget] = useState<Widget | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const snippet = `<div id="gw-widget"></div>\n<script src="${apiUrl}/widget.js" data-widget-id="${id}"></script>`;

  useEffect(() => {
    if (id) {
      api.get(`/api/widgets/${id}`).then(({ data }) => setWidget(data));
    }
  }, [id]);

  function copySnippet() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-gray-600 text-lg leading-none">←</Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{widget.name}</h1>
              <p className="text-xs text-gray-400">
                {widget.type === 'google_reviews' ? 'Avis Google' : widget.type}
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

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">

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

        {/* Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Configuration</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-500 text-xs mb-0.5">Place ID</dt>
              <dd className="font-mono text-gray-900 text-xs truncate">{config.placeId}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs mb-0.5">Avis max</dt>
              <dd className="text-gray-900">{config.maxReviews}</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs mb-0.5">Note minimale</dt>
              <dd className="text-gray-900">{config.minRating}★ et +</dd>
            </div>
            <div>
              <dt className="text-gray-500 text-xs mb-0.5">Thème</dt>
              <dd className="text-gray-900">{config.theme === 'dark' ? 'Sombre' : 'Clair'}</dd>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <dt className="text-gray-500 text-xs mb-0.5">Couleur accent</dt>
                <dd className="flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-4 rounded border border-gray-200"
                    style={{ background: config.accentColor }}
                  />
                  <span className="text-gray-900 font-mono text-xs">{config.accentColor}</span>
                </dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Info aperçu */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
          Pour voir le widget en action, intégrez le snippet dans une page HTML et ouvrez-la dans votre navigateur.
        </div>
      </main>
    </div>
  );
}
