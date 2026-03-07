import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { getWidgetDef, FieldDefinition } from '../data/widgetCatalog';

interface Widget {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  createdAt: string;
}

function FieldInput({ field, value, onChange }: { field: FieldDefinition; value: any; onChange: (v: any) => void }) {
  if (field.type === 'toggle') {
    return (
      <div className="flex items-center justify-between">
        <label className="label mb-0">{field.label}</label>
        <button type="button" onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${value ? 'bg-primary' : 'bg-gray-200'}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>
    );
  }
  if (field.type === 'select') {
    return (
      <div>
        <label className="label">{field.label}</label>
        <select className="input" value={value ?? ''} onChange={e => onChange(e.target.value)}>
          {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === 'color') {
    return (
      <div>
        <label className="label">{field.label}</label>
        <div className="flex gap-2">
          <input type="color" value={value || '#621B7A'} onChange={e => onChange(e.target.value)} className="h-9 w-10 border border-gray-200 rounded-btn cursor-pointer p-0.5" />
          <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="input font-mono" placeholder="#621B7A" />
        </div>
      </div>
    );
  }
  if (field.type === 'textarea') {
    return (
      <div>
        <label className="label">{field.label}</label>
        <textarea className="input min-h-[80px] resize-y" value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} rows={3} />
      </div>
    );
  }
  if (field.type === 'number') {
    return (
      <div>
        <label className="label">{field.label}</label>
        <input type="number" className="input" value={value ?? ''} min={field.min} max={field.max} onChange={e => onChange(parseFloat(e.target.value))} />
      </div>
    );
  }
  if (field.type === 'date') {
    return (
      <div>
        <label className="label">{field.label}</label>
        <input type="datetime-local" className="input" value={value ?? ''} onChange={e => onChange(e.target.value)} />
      </div>
    );
  }
  return (
    <div>
      <label className="label">{field.label}</label>
      <input type={field.type === 'phone' ? 'tel' : field.type} className="input" value={value ?? ''}
        onChange={e => onChange(e.target.value)} placeholder={field.placeholder} />
      {field.help && <p className="text-xs text-gray-400 mt-1">{field.help}</p>}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="btn-secondary text-xs px-3 py-1.5"
    >
      {copied ? '✓ Copié' : 'Copier'}
    </button>
  );
}

function SnippetTabs({ widgetId, isApiWidget }: { widgetId: string; isApiWidget: boolean }) {
  const [tab, setTab] = useState<'html' | 'wordpress' | 'webflow' | 'webhook'>('html');
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

  const htmlSnippet = `<div data-ww-id="${widgetId}"></div>\n<script src="${baseUrl}/widget.js" async></script>`;
  const wpSnippet = `[webwidget id="${widgetId}"]`;
  const webflowSnippet = `<!-- Coller dans "Before </body> tag" dans les paramètres du site Webflow -->\n<script src="${baseUrl}/widget.js" async></script>\n\n<!-- Coller dans un élément "Embed" à l'endroit souhaité -->\n<div data-ww-id="${widgetId}"></div>`;
  const webhookSnippet = `GET ${baseUrl}/widget/${widgetId}/data`;

  const allTabs = isApiWidget
    ? (['html', 'wordpress', 'webflow', 'webhook'] as const)
    : (['html', 'wordpress', 'webflow'] as const);

  const snippets: Record<string, string> = { html: htmlSnippet, wordpress: wpSnippet, webflow: webflowSnippet, webhook: webhookSnippet };
  const tabLabels: Record<string, string> = { html: 'HTML', wordpress: 'WordPress', webflow: 'Webflow', webhook: 'Webhook' };

  return (
    <div>
      <div className="flex gap-1 mb-3 flex-wrap">
        {allTabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-btn transition-all ${tab === t ? 'bg-primary text-white' : 'text-gray-500 hover:text-brand-text'}`}>
            {tabLabels[t]}
          </button>
        ))}
      </div>
      {tab === 'webhook' ? (
        <div>
          <div className="relative bg-brand-text rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-green-400 whitespace-pre-wrap break-all font-mono">{webhookSnippet}</pre>
            <div className="absolute top-2 right-2"><CopyButton text={webhookSnippet} /></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Retourne les données JSON brutes — utile pour une intégration personnalisée ou headless.</p>
        </div>
      ) : (
        <div className="relative bg-brand-text rounded-lg p-4 overflow-x-auto">
          <pre className="text-xs text-green-400 whitespace-pre-wrap break-all font-mono">{snippets[tab]}</pre>
          <div className="absolute top-2 right-2"><CopyButton text={snippets[tab]} /></div>
        </div>
      )}
    </div>
  );
}

export default function WidgetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [widget, setWidget] = useState<Widget | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    api.get(`/api/widgets/${id}`).then(({ data }) => {
      setWidget(data);
      setConfig(data.config);
      setName(data.name);
      setLoading(false);
    }).catch(() => navigate('/'));
  }, [id]);

  const def = widget ? getWidgetDef(widget.type) : null;

  function updateConfig(key: string, value: any) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/api/widgets/${id}`, { name, config });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/api/widgets/${id}`);
      navigate('/');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Chargement...</div>;
  if (!widget) return null;

  const isApiWidget = !!def?.apiWidget;
  const isWebhookOnly = !!config.webhookOnly;
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const previewSrcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#F8F8F8}</style></head><body><div data-ww-id="${widget.id}"></div><script src="${baseUrl}/widget.js" async></script></body></html>`;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-gray-400 hover:text-primary transition-colors text-lg leading-none">←</Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-brand-text">{def?.icon} {widget.name}</h1>
          <p className="text-xs text-gray-400">{def?.name || widget.type}{isWebhookOnly && ' · Webhook'}</p>
        </div>
        <button onClick={() => setShowDeleteConfirm(true)} className="text-xs text-red-500 hover:text-red-700 transition-colors">
          Supprimer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {error && <p className="text-red-600 text-sm bg-red-50 rounded-btn px-3 py-2">{error}</p>}

          <div className="card flex flex-col gap-4">
            <div>
              <label className="label">Nom du widget</label>
              <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            {def?.fields.filter(f => f.key !== 'placeId' || !isApiWidget).map(field => (
              <FieldInput key={field.key} field={field} value={config[field.key]} onChange={v => updateConfig(field.key, v)} />
            ))}
            {!def && (
              <p className="text-xs text-gray-500">Type de widget : <code className="bg-gray-100 px-1 rounded">{widget.type}</code></p>
            )}
          </div>

          <button type="submit" disabled={saving} className="btn-primary self-end">
            {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé' : 'Enregistrer'}
          </button>
        </form>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Webhook-only: prominent endpoint */}
          {isWebhookOnly ? (
            <div className="card">
              <h3 className="font-semibold text-brand-text text-sm mb-1">Endpoint webhook</h3>
              <p className="text-xs text-gray-400 mb-3">Appelez cette URL pour récupérer les données JSON brutes.</p>
              <div className="relative bg-brand-text rounded-lg p-4">
                <pre className="text-xs text-green-400 font-mono break-all whitespace-pre-wrap">{`GET ${baseUrl}/widget/${widget.id}/data`}</pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={`${baseUrl}/widget/${widget.id}/data`} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="card">
                <h3 className="font-semibold text-brand-text text-sm mb-3">Intégrer ce widget</h3>
                <SnippetTabs widgetId={widget.id} isApiWidget={isApiWidget} />
              </div>
              {/* Live preview */}
              <div className="card">
                <h3 className="font-semibold text-brand-text text-sm mb-3">Aperçu</h3>
                <div className="rounded-btn overflow-hidden border border-gray-100 bg-brand-subtle" style={{ minHeight: 200 }}>
                  <iframe
                    key={saved ? 'saved' : 'initial'}
                    srcDoc={previewSrcdoc}
                    className="w-full"
                    style={{ minHeight: 200, border: 'none' }}
                    title="Aperçu du widget"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">L'aperçu se met à jour après chaque sauvegarde.</p>
              </div>
            </>
          )}

          <div className="card text-xs text-gray-500 flex flex-col gap-1">
            <div className="flex justify-between"><span>ID</span><code className="font-mono text-brand-text">{widget.id}</code></div>
            <div className="flex justify-between"><span>Type</span><span className="font-medium text-brand-text">{def?.name || widget.type}</span></div>
            <div className="flex justify-between"><span>Créé le</span><span>{new Date(widget.createdAt).toLocaleDateString('fr-FR')}</span></div>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-brand-text mb-2">Supprimer ce widget ?</h2>
            <p className="text-sm text-gray-500 mb-6">Cette action est irréversible. Le snippet d'intégration cessera de fonctionner.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">Annuler</button>
              <button onClick={handleDelete} disabled={deleting} className="btn-primary bg-red-600 hover:bg-red-700">
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
