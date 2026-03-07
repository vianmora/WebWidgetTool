import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { WIDGET_CATALOG, CATEGORIES, getWidgetDef, FieldDefinition } from '../data/widgetCatalog';

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

// ─── Generic field renderer ────────────────────────────────────────────────────
function FieldInput({ field, value, onChange }: { field: FieldDefinition; value: any; onChange: (v: any) => void }) {
  if (field.type === 'toggle') {
    return (
      <div className="flex items-center justify-between">
        <label className="label mb-0">{field.label}</label>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${value ? 'bg-primary' : 'bg-gray-200'}`}
        >
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
        {field.help && <p className="text-xs text-gray-400 mt-1">{field.help}</p>}
      </div>
    );
  }
  if (field.type === 'number') {
    return (
      <div>
        <label className="label">{field.label}</label>
        <input type="number" className="input" value={value ?? ''} min={field.min} max={field.max}
          onChange={e => onChange(parseFloat(e.target.value))} />
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
  // text, url, email, phone
  return (
    <div>
      <label className="label">{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input
        type={field.type === 'phone' ? 'tel' : field.type}
        className="input"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
      />
      {field.help && <p className="text-xs text-gray-400 mt-1">{field.help}</p>}
    </div>
  );
}

// ─── Place search (for Google Reviews) ────────────────────────────────────────
function PlaceSearch({ placeId, onSelect }: { placeId: string; onSelect: (id: string, name: string) => void }) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setSearch(value);
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

  function select(place: PlacePrediction) {
    setSearch(place.description);
    setSuggestions([]);
    setShowDropdown(false);
    onSelect(place.place_id, place.main_text);
  }

  return (
    <div>
      <label className="label">Rechercher votre établissement <span className="text-red-500">*</span></label>
      <div className="relative" ref={dropdownRef}>
        <input className="input" type="text" value={search} onChange={e => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Ex: Boulangerie Martin, Paris..." autoComplete="off" />
        {searching && <span className="absolute right-3 top-2.5 text-gray-400 text-xs">Recherche...</span>}
        {showDropdown && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {suggestions.map(place => (
              <li key={place.place_id} onMouseDown={() => select(place)}
                className="px-4 py-3 cursor-pointer hover:bg-brand-subtle border-b border-gray-100 last:border-0">
                <p className="text-sm font-medium text-brand-text">{place.main_text}</p>
                <p className="text-xs text-gray-400">{place.secondary_text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      {placeId && <p className="text-xs text-green-600 mt-1">✓ Lieu sélectionné</p>}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function NewWidget() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [widgetName, setWidgetName] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const def = selectedType ? getWidgetDef(selectedType) : null;

  function selectWidget(type: string) {
    const d = getWidgetDef(type);
    if (!d || d.status === 'soon') return;
    setSelectedType(type);
    setConfig({ ...d.defaultConfig });
    setWidgetName('');
    setError('');
  }

  function updateConfig(key: string, value: any) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!def) return;
    // Validate required fields
    for (const field of def.fields) {
      if (field.required && !config[field.key]) {
        setError(`Le champ "${field.label}" est requis.`);
        return;
      }
    }
    setLoading(true);
    try {
      const { data } = await api.post('/api/widgets', {
        name: widgetName || def.name,
        type: def.type,
        config,
      });
      navigate(`/widgets/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 1: Catalogue ──
  if (!selectedType) {
    const filteredWidgets = selectedCategory
      ? WIDGET_CATALOG.filter(w => w.category === selectedCategory)
      : WIDGET_CATALOG;

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-gray-400 hover:text-primary transition-colors text-lg leading-none">←</Link>
          <h1 className="text-xl font-bold text-brand-text">Choisir un widget</h1>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-btn text-xs font-semibold transition-all ${!selectedCategory ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-brand-text hover:border-primary/40'}`}
          >
            Tous
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-btn text-xs font-semibold transition-all ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-brand-text hover:border-primary/40'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredWidgets.map(widget => (
            <button
              key={widget.type}
              onClick={() => selectWidget(widget.type)}
              disabled={widget.status === 'soon'}
              className={`text-left card hover:shadow-md transition-all group relative ${widget.status === 'soon' ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/40 cursor-pointer'}`}
            >
              {widget.status === 'soon' && (
                <span className="absolute top-3 right-3 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded font-semibold">Bientôt</span>
              )}
              <div className="text-2xl mb-2">{widget.icon}</div>
              <div className="font-semibold text-sm text-brand-text mb-1 group-hover:text-primary transition-colors">{widget.name}</div>
              <div className="text-xs text-gray-500 line-clamp-2">{widget.description}</div>
              <div className="text-xs text-gray-400 mt-2 font-medium">{widget.category}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Step 2: Config form ──
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSelectedType(null)} className="text-gray-400 hover:text-primary transition-colors text-lg leading-none">←</button>
        <div>
          <h1 className="text-xl font-bold text-brand-text">{def?.icon} {def?.name}</h1>
          <p className="text-xs text-gray-400">{def?.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <p className="text-red-600 text-sm bg-red-50 rounded-btn px-3 py-2">{error}</p>}

        <div className="card flex flex-col gap-4">
          <div>
            <label className="label">Nom du widget</label>
            <input className="input" type="text" value={widgetName} onChange={e => setWidgetName(e.target.value)}
              placeholder={`Ex: ${def?.name} — Mon site`} />
          </div>

          {/* Place search for Google Reviews */}
          {selectedType === 'google_reviews' && (
            <PlaceSearch
              placeId={config.placeId || ''}
              onSelect={(id, name) => {
                updateConfig('placeId', id);
                if (!widgetName) setWidgetName(name);
              }}
            />
          )}

          {/* Generic fields */}
          {def?.fields.filter(f => f.key !== 'placeId' || selectedType !== 'google_reviews').map(field => (
            <FieldInput
              key={field.key}
              field={field}
              value={config[field.key]}
              onChange={v => updateConfig(field.key, v)}
            />
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setSelectedType(null)} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Création...' : 'Créer le widget'}
          </button>
        </div>
      </form>
    </div>
  );
}
