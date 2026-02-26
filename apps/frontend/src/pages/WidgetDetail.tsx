import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  profile_photo_url: string;
  relative_time_description: string;
}

interface PreviewData {
  widget: { id: string; name: string; config: { theme: string; accentColor: string } };
  reviews: Review[];
}

interface Widget {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  createdAt: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= rating ? '#FBBF24' : '#D1D5DB' }}>★</span>
      ))}
    </span>
  );
}

function ReviewCard({ review, isDark }: { review: Review; isDark: boolean }) {
  const bg = isDark ? '#111827' : '#F9FAFB';
  const border = isDark ? '#374151' : '#E5E7EB';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <div style={{ padding: 16, background: bg, borderRadius: 8, border: `1px solid ${border}`, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {review.profile_photo_url && (
          <img
            src={review.profile_photo_url}
            alt={review.author_name}
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: textColor }}>{review.author_name}</div>
          <StarRating rating={review.rating} />
        </div>
      </div>
      {review.text && (
        <p style={{ color: subColor, margin: 0, fontSize: 14, lineHeight: 1.6 }}>{review.text}</p>
      )}
      {review.relative_time_description && (
        <div style={{ color: subColor, fontSize: 12, marginTop: 8 }}>{review.relative_time_description}</div>
      )}
    </div>
  );
}

function WidgetPreview({ widgetId, apiUrl }: { widgetId: string; apiUrl: string }) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${apiUrl}/widget/${widgetId}/reviews`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [widgetId, apiUrl]);

  if (loading) {
    return <p className="text-sm text-gray-400 text-center py-8">Chargement de l'aperçu…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-500 text-center py-4">Erreur : {error}</p>;
  }
  if (!data) return null;

  const { theme, accentColor } = data.widget.config;
  const isDark = theme === 'dark';
  const bg = isDark ? '#1F2937' : '#FFFFFF';
  const border = isDark ? '#374151' : '#E5E7EB';
  const subColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', background: bg, borderRadius: 12, padding: 24, border: `1px solid ${border}` }}>
      <h3 style={{ color: accentColor, margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>{data.widget.name}</h3>
      {data.reviews.length === 0 ? (
        <p style={{ color: subColor }}>Aucun avis disponible.</p>
      ) : (
        data.reviews.map((review, i) => (
          <ReviewCard key={i} review={review} isDark={isDark} />
        ))
      )}
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: subColor }}>Powered by WebWidget</div>
    </div>
  );
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

        {/* Aperçu */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Aperçu</h2>
          {id && <WidgetPreview widgetId={id} apiUrl={apiUrl} />}
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

      </main>
    </div>
  );
}
