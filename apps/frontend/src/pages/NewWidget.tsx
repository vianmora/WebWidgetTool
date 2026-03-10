import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { WIDGET_CATALOG, CATEGORIES, getWidgetDef, FieldDefinition } from '../data/widgetCatalog';
import WidgetLivePreview from '../components/WidgetLivePreview';

type Step = 'catalog' | 'template' | 'config';

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

// ─── Template thumbnail (SVG mockups) ─────────────────────────────────────────
function TemplateThumbnail({ type, templateId, className = 'w-full h-auto rounded-lg' }: {
  type: string;
  templateId: string;
  className?: string;
}) {
  const isDark = templateId.includes('dark');
  const isGrid = templateId.includes('grid');
  const isLeft = templateId.includes('left');
  const bg = isDark ? '#111827' : '#ffffff';
  const card = isDark ? '#1f2937' : '#f9fafb';
  const stroke = isDark ? '#374151' : '#e5e7eb';
  const textFill = isDark ? '#d1d5db' : '#374151';
  const subFill = isDark ? '#6b7280' : '#9ca3af';
  const accent = '#621B7A';
  const svgProps = { viewBox: '0 0 240 150', className, xmlns: 'http://www.w3.org/2000/svg' };

  if (type === 'google_reviews' || type === 'testimonials') {
    const isReview = type === 'google_reviews';
    if (isGrid) {
      return (
        <svg {...svgProps}>
          <rect width="240" height="150" fill={bg} rx="8"/>
          {([[10,8],[130,8],[10,80],[130,80]] as [number,number][]).map(([x,y],i) => (
            <g key={i}>
              <rect x={x} y={y} width="100" height="64" fill={card} rx="6" stroke={stroke} strokeWidth="0.5"/>
              <circle cx={x+14} cy={y+18} r="9" fill={subFill}/>
              <rect x={x+30} y={y+12} width="54" height="6" fill={textFill} rx="2"/>
              {isReview && [0,1,2,3,4].map(s => <rect key={s} x={x+30+s*11} y={y+22} width="9" height="6" fill="#fbbf24" rx="1"/>)}
              {!isReview && <text key="q" x={x+8} y={y+26} fontSize="16" fill={accent} opacity="0.4">"</text>}
              <rect x={x+10} y={y+36} width="80" height="4" fill={subFill} rx="2"/>
              <rect x={x+10} y={y+44} width="64" height="4" fill={subFill} rx="2"/>
              {!isReview && <circle cx={x+18} cy={y+56} r="6" fill={subFill}/>}
              {!isReview && <rect x={x+28} y={y+52} width="44" height="4" fill={textFill} rx="2"/>}
            </g>
          ))}
        </svg>
      );
    }
    return (
      <svg {...svgProps}>
        <rect width="240" height="150" fill={bg} rx="8"/>
        {[0,1,2].map(i => {
          const y = 8 + i * 46;
          return (
            <g key={i}>
              <rect x="10" y={y} width="220" height="38" fill={card} rx="6" stroke={stroke} strokeWidth="0.5"/>
              <circle cx="28" cy={y+19} r="11" fill={subFill}/>
              {isReview && <>
                <rect x="46" y={y+9} width="70" height="6" fill={textFill} rx="2"/>
                {[0,1,2,3,4].map(s => <rect key={s} x={46+s*13} y={y+19} width="10" height="7" fill="#fbbf24" rx="1"/>)}
                <rect x="46" y={y+30} width="140" height="4" fill={subFill} rx="2"/>
              </>}
              {!isReview && <>
                <text x="44" y={y+18} fontSize="14" fill={accent} opacity="0.4">"</text>
                <rect x="54" y={y+9} width="140" height="5" fill={subFill} rx="2"/>
                <rect x="54" y={y+18} width="110" height="4" fill={subFill} rx="2"/>
                <rect x="46" y={y+28} width="60" height="4" fill={textFill} rx="2"/>
              </>}
            </g>
          );
        })}
      </svg>
    );
  }

  if (type === 'rating_badge') {
    const isPill = templateId.includes('pill');
    return (
      <svg {...svgProps}>
        <rect width="240" height="150" fill={bg} rx="8"/>
        {isPill ? (
          <g>
            <rect x="30" y="45" width="180" height="60" fill={accent} rx="30"/>
            <rect x="56" y="63" width="44" height="24" fill="rgba(255,255,255,0.15)" rx="12"/>
            <rect x="60" y="70" width="36" height="10" fill="white" rx="3"/>
            <rect x="116" y="58" width="78" height="8" fill="rgba(255,255,255,0.7)" rx="2"/>
            <rect x="116" y="70" width="60" height="6" fill="rgba(255,255,255,0.5)" rx="2"/>
            <rect x="116" y="80" width="70" height="5" fill="rgba(255,255,255,0.4)" rx="2"/>
          </g>
        ) : (
          <g>
            <rect x="60" y="15" width="120" height="120" fill={isDark ? card : '#fff'} rx="12" stroke={stroke} strokeWidth="1"/>
            <rect x="80" y="32" width="80" height="8" fill={textFill} rx="3"/>
            <rect x="88" y="50" width="64" height="20" fill={accent} rx="6"/>
            <rect x="78" y="80" width="84" height="8" fill="#fbbf24" rx="2"/>
            <rect x="88" y="96" width="64" height="6" fill={subFill} rx="2"/>
            <rect x="92" y="110" width="56" height="6" fill={subFill} rx="2"/>
          </g>
        )}
      </svg>
    );
  }

  if (type === 'whatsapp_button' || type === 'telegram_button') {
    const btnColor = type === 'whatsapp_button' ? '#25d366' : '#0088cc';
    const cx = isLeft ? 28 : 212;
    return (
      <svg {...svgProps}>
        <rect width="240" height="150" fill={bg} rx="8"/>
        {[18,34,50,66,82].map(y => <rect key={y} x="20" y={y} width="200" height="10" fill={card} rx="3" stroke={stroke} strokeWidth="0.5"/>)}
        <rect x="20" y="100" width="200" height="40" fill={card} rx="6" stroke={stroke} strokeWidth="0.5"/>
        <circle cx={cx} cy="128" r="16" fill={btnColor}/>
        <rect x={cx-8} y="122" width="16" height="2" fill="white" rx="1"/>
        <rect x={cx-8} y="126" width="12" height="2" fill="white" rx="1"/>
        <rect x={cx-8} y="130" width="14" height="2" fill="white" rx="1"/>
      </svg>
    );
  }

  if (type === 'social_icons') {
    const isRow = templateId === 'row';
    const colors = isRow
      ? ['#1877f2','#e4405f','#0077b5','#1da1f2']
      : ['#374151','#374151','#374151','#374151'];
    return (
      <svg {...svgProps}>
        <rect width="240" height="150" fill={bg} rx="8"/>
        {isRow ? (
          [0,1,2,3].map(i => (
            <circle key={i} cx={72+i*32} cy="75" r="18" fill={colors[i]}/>
          ))
        ) : (
          [0,1,2,3].map(i => (
            <circle key={i} cx="120" cy={22+i*32} r="14" fill={colors[i]}/>
          ))
        )}
      </svg>
    );
  }

  if (type === 'image_gallery') {
    const isCarousel = templateId === 'carousel';
    return (
      <svg {...svgProps}>
        <rect width="240" height="150" fill={bg} rx="8"/>
        {isCarousel ? (
          <g>
            <rect x="10" y="15" width="220" height="100" fill={card} rx="8" stroke={stroke} strokeWidth="1"/>
            <rect x="20" y="22" width="200" height="80" fill={subFill} rx="4" opacity="0.25"/>
            <rect x="88" y="52" width="64" height="20" fill={subFill} rx="3" opacity="0.3"/>
            <circle cx="28" cy="128" r="10" fill={accent} opacity="0.8"/>
            <rect x="22" y="124" width="12" height="8" fill="transparent"/>
            <rect x="24" y="126" width="2" height="4" fill="white" rx="1"/>
            <rect x="28" y="124" width="2" height="8" fill="white" rx="1"/>
            <circle cx="212" cy="128" r="10" fill={accent} opacity="0.8"/>
            <rect x="210" y="126" width="2" height="4" fill="white" rx="1"/>
            <rect x="214" y="124" width="2" height="8" fill="white" rx="1"/>
            {[0,1,2,3,4].map(i => <circle key={i} cx={100+i*10} cy="128" r="3" fill={i===2?accent:subFill} opacity="0.6"/>)}
          </g>
        ) : (
          <g>
            {([[8,8],[88,8],[168,8],[8,82],[88,82],[168,82]] as [number,number][]).map(([x,y],i) => (
              <rect key={i} x={x} y={y} width="72" height="56" fill={subFill} rx="4" opacity="0.25"/>
            ))}
          </g>
        )}
      </svg>
    );
  }

  if (type === 'faq') {
    return (
      <svg {...svgProps}>
        <rect width="240" height="150" fill={bg} rx="8"/>
        {/* First item open */}
        <rect x="10" y="8" width="220" height="50" fill={card} rx="6" stroke={stroke} strokeWidth="0.5"/>
        <rect x="20" y="18" width="150" height="6" fill={textFill} rx="2"/>
        <rect x="210" y="17" width="12" height="8" fill="transparent"/>
        <rect x="212" y="20" width="8" height="2" fill={accent} rx="1"/>
        <rect x="20" y="32" width="180" height="4" fill={subFill} rx="2"/>
        <rect x="20" y="40" width="150" height="4" fill={subFill} rx="2"/>
        {/* Closed items */}
        {[66,96,126].map((y, i) => (
          <g key={i}>
            <rect x="10" y={y} width="220" height="26" fill={card} rx="6" stroke={stroke} strokeWidth="0.5"/>
            <rect x="20" y={y+10} width={140-i*10} height="6" fill={textFill} rx="2" opacity="0.7"/>
            <rect x="212" y={y+9} width="8" height="2" fill={subFill} rx="1"/>
            <rect x="215" y={y+6} width="2" height="8" fill={subFill} rx="1"/>
          </g>
        ))}
      </svg>
    );
  }

  if (type === 'team_members') {
    if (isGrid) {
      return (
        <svg {...svgProps}>
          <rect width="240" height="150" fill={bg} rx="8"/>
          {([[8,8],[88,8],[168,8],[8,84],[88,84],[168,84]] as [number,number][]).map(([x,y],i) => (
            <g key={i}>
              <rect x={x} y={y} width="72" height="60" fill={card} rx="6" stroke={stroke} strokeWidth="0.5"/>
              <circle cx={x+36} cy={y+22} r="14" fill={subFill}/>
              <rect x={x+12} y={y+42} width="48" height="5" fill={textFill} rx="2"/>
              <rect x={x+16} y={y+51} width="40" height="4" fill={subFill} rx="2"/>
            </g>
          ))}
        </svg>
      );
    }
    return (
      <svg {...svgProps}>
        <rect width="240" height="150" fill={bg} rx="8"/>
        {[0,1,2,3].map(i => {
          const y = 8 + i * 34;
          return (
            <g key={i}>
              <rect x="10" y={y} width="220" height="28" fill={card} rx="6" stroke={stroke} strokeWidth="0.5"/>
              <circle cx="28" cy={y+14} r="10" fill={subFill}/>
              <rect x="44" y={y+7} width="80" height="5" fill={textFill} rx="2"/>
              <rect x="44" y={y+16} width="60" height="4" fill={subFill} rx="2"/>
              {[0,1,2].map(s => <circle key={s} cx={182+s*14} cy={y+14} r="5" fill={subFill} opacity="0.4"/>)}
            </g>
          );
        })}
      </svg>
    );
  }

  if (type === 'countdown_timer') {
    return (
      <svg {...svgProps}>
        <rect width="240" height="150" fill={bg} rx="8"/>
        {([['12','J'],['08','H'],['34','M'],['52','S']] as [string,string][]).map(([num, unit], i) => {
          const x = 14 + i * 56;
          return (
            <g key={i}>
              <rect x={x} y="30" width="50" height="60" fill={isDark ? accent : card} rx="10" stroke={isDark ? 'none' : stroke} strokeWidth="1"/>
              <rect x={x+8} y="42" width="34" height="18" fill={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(98,27,122,0.08)'} rx="4"/>
              <text x={x+25} y="56" fontSize="16" fontWeight="bold" textAnchor="middle" fill={isDark ? 'white' : accent}>{num}</text>
              <text x={x+25} y="102" fontSize="10" textAnchor="middle" fill={subFill}>{unit}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (type === 'business_hours') {
    return (
      <svg {...svgProps}>
        <rect width="240" height="150" fill={bg} rx="8"/>
        <rect x="10" y="8" width="220" height="134" fill={card} rx="8" stroke={stroke} strokeWidth="0.5"/>
        <circle cx="28" cy="26" r="8" fill="#22c55e"/>
        <rect x="44" y="22" width="70" height="6" fill={textFill} rx="2"/>
        <rect x="44" y="32" width="50" height="4" fill={subFill} rx="2"/>
        <rect x="18" y="46" width="204" height="1" fill={stroke}/>
        {['Lun','Mar','Mer','Jeu','Ven','Sam'].map((day, i) => {
          const y = 54 + i * 15;
          const closed = i === 5;
          return (
            <g key={day}>
              <rect x="20" y={y} width="28" height="5" fill={closed ? subFill : textFill} rx="2" opacity={closed ? 0.5 : 0.8}/>
              <rect x="148" y={y} width="62" height="5" fill={closed ? '#ef4444' : subFill} rx="2" opacity={closed ? 0.6 : 0.7}/>
            </g>
          );
        })}
      </svg>
    );
  }

  if (type === 'pricing_table') {
    return (
      <svg {...svgProps}>
        <rect width="240" height="150" fill={bg} rx="8"/>
        {([[8, false],[84, true],[160, false]] as [number,boolean][]).map(([x, featured], i) => (
          <g key={i}>
            <rect x={x} y={featured ? 4 : 14} width="68" height={featured ? 142 : 122} fill={featured ? accent : card} rx="8" stroke={featured ? 'none' : stroke} strokeWidth="0.5"/>
            <rect x={x+8} y={(featured ? 4 : 14)+12} width="52" height="6" fill={featured ? 'rgba(255,255,255,0.9)' : textFill} rx="2"/>
            <rect x={x+8} y={(featured ? 4 : 14)+26} width="36" height="12" fill={featured ? 'rgba(255,255,255,0.2)' : 'rgba(98,27,122,0.08)'} rx="4"/>
            <rect x={x+10} y={(featured ? 4 : 14)+30} width="32" height="4" fill={featured ? 'white' : accent} rx="2"/>
            {[0,1,2,3].map(j => (
              <rect key={j} x={x+10} y={(featured ? 4 : 14)+50+j*14} width="48" height="4" fill={featured ? 'rgba(255,255,255,0.6)' : subFill} rx="2"/>
            ))}
          </g>
        ))}
      </svg>
    );
  }

  if (type === 'logo_carousel') {
    return (
      <svg {...svgProps}>
        <rect width="240" height="150" fill={bg} rx="8"/>
        {[16,76,136,196].map(x => (
          <g key={x}>
            <rect x={x} y="55" width="44" height="40" fill={card} rx="4" stroke={stroke} strokeWidth="0.5"/>
            <rect x={x+8} y="65" width="28" height="20" fill={subFill} rx="2" opacity="0.2"/>
          </g>
        ))}
      </svg>
    );
  }

  // Generic fallback
  return (
    <svg {...svgProps}>
      <rect width="240" height="150" fill={bg} rx="8"/>
      <rect x="20" y="28" width="200" height="94" fill={card} rx="8" stroke={stroke} strokeWidth="1"/>
      <rect x="36" y="48" width="168" height="10" fill={subFill} rx="3" opacity="0.5"/>
      <rect x="36" y="66" width="136" height="8" fill={subFill} rx="3" opacity="0.4"/>
      <rect x="36" y="82" width="150" height="8" fill={subFill} rx="3" opacity="0.4"/>
      <rect x="36" y="98" width="96" height="8" fill={accent} rx="3" opacity="0.4"/>
    </svg>
  );
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchError, setSearchError] = useState<'api_key_missing' | 'api_error' | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setSearch(value);
    setActiveIndex(-1);
    setSearchError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get('/api/places/search', { params: { q: value } });
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      } catch (err: any) {
        setSuggestions([]);
        const msg: string = err?.response?.data?.error || '';
        if (msg.includes('API_KEY_MISSING') || msg.toLowerCase().includes('api key') || msg.includes('GOOGLE_MAPS_API_KEY')) {
          setSearchError('api_key_missing');
        } else {
          setSearchError('api_error');
        }
      }
      finally { setSearching(false); }
    }, 350);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => {
        const next = Math.min(i + 1, suggestions.length - 1);
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => {
        const next = Math.max(i - 1, 0);
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      select(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  }

  function select(place: PlacePrediction) {
    setSearch(place.description);
    setSuggestions([]);
    setShowDropdown(false);
    setActiveIndex(-1);
    onSelect(place.place_id, place.main_text);
  }

  return (
    <div>
      <label className="label">Rechercher votre établissement <span className="text-red-500">*</span></label>
      <div className="relative" ref={dropdownRef}>
        <input className="input" type="text" value={search}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Ex: Boulangerie Martin, Paris..." autoComplete="off" />
        {searching && <span className="absolute right-3 top-2.5 text-gray-400 text-xs">Recherche...</span>}
        {searchError === 'api_key_missing' && (
          <p className="mt-1.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-btn px-3 py-2">
            ⚠️ Clé API Google Maps non configurée sur le serveur. Contactez l'administrateur.
          </p>
        )}
        {searchError === 'api_error' && (
          <p className="mt-1.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-btn px-3 py-2">
            ⚠️ Erreur lors de la recherche. Vérifiez que la clé API Google Maps est valide.
          </p>
        )}
        {showDropdown && (
          <ul ref={listRef} className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {suggestions.map((place, i) => (
              <li key={place.place_id} onMouseDown={() => select(place)}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 ${i === activeIndex ? 'bg-brand-subtle' : 'hover:bg-brand-subtle'}`}>
                <p className="text-sm font-medium text-brand-text">{place.main_text}</p>
                <p className="text-xs text-gray-400">{place.secondary_text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      {placeId && <p className="text-xs text-green-600 mt-1">Lieu sélectionné</p>}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function NewWidget() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('catalog');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [widgetName, setWidgetName] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiMenuOpen, setApiMenuOpen] = useState<string | null>(null);
  const [pendingExtra, setPendingExtra] = useState<Record<string, any>>({});

  const def = selectedType ? getWidgetDef(selectedType) : null;
  const templates = def?.templates ?? [];

  function selectWidget(type: string, extra: Record<string, any> = {}) {
    const d = getWidgetDef(type);
    if (!d || d.status === 'soon') return;
    const tmpl = d.templates ?? [];
    setSelectedType(type);
    setPendingExtra(extra);
    setApiMenuOpen(null);
    setError('');

    if (tmpl.length >= 2 && !extra.webhookOnly) {
      setSelectedTemplateIdx(0);
      setStep('template');
    } else {
      const templateConfig = tmpl[0]?.config ?? {};
      setConfig({ ...d.defaultConfig, ...templateConfig, ...extra });
      setWidgetName('');
      setStep('config');
    }
  }

  function continueToConfig() {
    if (!def) return;
    const tmpl = def.templates ?? [];
    const templateConfig = tmpl[selectedTemplateIdx]?.config ?? {};
    setConfig({ ...def.defaultConfig, ...templateConfig, ...pendingExtra });
    setWidgetName('');
    setError('');
    setStep('config');
  }

  function goBackFromConfig() {
    if (templates.length >= 2 && !pendingExtra.webhookOnly) {
      setStep('template');
    } else {
      setStep('catalog');
      setSelectedType(null);
    }
  }

  function updateConfig(key: string, value: any) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!def) return;
    for (const field of def.fields) {
      if (field.required && !config[field.key]) {
        if (field.key === 'placeId') {
          setError('Veuillez sélectionner un établissement via la recherche.');
        } else {
          setError(`Le champ "${field.label}" est requis.`);
        }
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

  // ── Step 1: Catalogue ──────────────────────────────────────────────────────
  if (step === 'catalog') {
    const widgetCard = (widget: typeof WIDGET_CATALOG[0]) => (
      <div key={widget.type} className="relative">
        <button
          onClick={() => widget.status !== 'soon' && selectWidget(widget.type)}
          disabled={widget.status === 'soon'}
          className={`w-full text-left card hover:shadow-md transition-all group relative ${widget.status === 'soon' ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/40 cursor-pointer'}`}
        >
          {widget.status === 'soon' && (
            <span className="absolute top-3 right-3 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded font-semibold">Bientôt</span>
          )}
          {widget.apiWidget && widget.status !== 'soon' && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setApiMenuOpen(apiMenuOpen === widget.type ? null : widget.type); }}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="2.5" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13.5" r="1.5"/>
              </svg>
            </button>
          )}
          {widget.image
            ? <img src={widget.image} alt={widget.name} className="h-8 w-auto object-contain mb-2" />
            : <div className="text-2xl mb-2">{widget.icon}</div>}
          <div className="font-semibold text-sm text-brand-text mb-1 group-hover:text-primary transition-colors">{widget.name}</div>
          <div className="text-xs text-gray-500 line-clamp-2">{widget.description}</div>
        </button>
        {widget.apiWidget && apiMenuOpen === widget.type && (
          <div className="absolute right-0 top-10 z-20 w-52 bg-white rounded-lg border border-gray-200 shadow-lg py-1">
            <button onClick={() => selectWidget(widget.type)}
              className="w-full text-left px-4 py-2.5 text-sm text-brand-text hover:bg-brand-subtle flex items-center gap-2">
              <span>🎨</span> Créer un widget visuel
            </button>
            <button onClick={() => selectWidget(widget.type, { webhookOnly: true })}
              className="w-full text-left px-4 py-2.5 text-sm text-brand-text hover:bg-brand-subtle flex items-center gap-2">
              <span>🔗</span> Créer un webhook
            </button>
          </div>
        )}
      </div>
    );

    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-gray-400 hover:text-primary transition-colors text-lg leading-none">←</Link>
          <h1 className="text-xl font-bold text-brand-text">Tous les widgets</h1>
        </div>

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

        {selectedCategory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {WIDGET_CATALOG.filter(w => w.category === selectedCategory).map(widgetCard)}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {CATEGORIES.map(cat => {
              const widgets = WIDGET_CATALOG.filter(w => w.category === cat);
              if (widgets.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-sm font-semibold text-brand-text">{cat}</h2>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {widgets.map(widgetCard)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Shared page shell (steps template + config) ───────────────────────────
  const totalSteps = templates.length >= 2 && !pendingExtra.webhookOnly ? 2 : 1;
  const currentStep = step === 'template' ? 1 : totalSteps;
  const stepLabel = step === 'template' ? 'Template' : 'Paramètres';

  const PageShell = ({ children }: { children: React.ReactNode }) => (
    <div className="py-8 px-4">
      {/* Breadcrumb + step indicator */}
      <div className="max-w-6xl mx-auto mb-5 flex items-center justify-between">
        <nav className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => { setStep('catalog'); setSelectedType(null); }}
            className="text-gray-400 hover:text-primary transition-colors"
          >
            ← Tous les widgets
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500 font-medium">{def?.name}</span>
          <span className="text-gray-300">/</span>
          <span className="text-brand-text font-semibold">{stepLabel}</span>
        </nav>
        {totalSteps > 1 && (
          <span className="text-xs text-gray-400 font-medium">Étape {currentStep}/{totalSteps}</span>
        )}
      </div>

      {/* Main frame */}
      <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Widget identity strip */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center gap-3">
          {def?.image
            ? <img src={def.image} alt={def?.name} className="h-7 w-auto object-contain" />
            : <span className="text-xl">{def?.icon}</span>}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-brand-text leading-tight">{def?.name}</h1>
            <p className="text-xs text-gray-400 truncate">{def?.description}</p>
          </div>
          {step === 'config' && templates[selectedTemplateIdx] && !pendingExtra.webhookOnly && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-btn font-medium whitespace-nowrap">
              {templates[selectedTemplateIdx].label}
            </span>
          )}
        </div>

        {children}
      </div>
    </div>
  );

  // ── Step 2: Template picker ────────────────────────────────────────────────
  if (step === 'template') {
    const getTemplateConfig = (template: typeof templates[0]) => ({
      ...def?.defaultConfig,
      accentColor: '#621B7A',
      ...template.config,
    });

    return (
      <PageShell>
        <div className="p-6">
          <h2 className="text-sm font-semibold text-brand-text mb-1">Choisissez un template</h2>
          <p className="text-xs text-gray-400 mb-6">Sélectionnez le style qui correspond le mieux à votre site. Le nombre de carte par ligne ou colonne est paramétrable dans l'étape d'après.</p>

          <div className="grid grid-cols-4 gap-6">
            {/* Template thumbnails — 1/4 */}
            <div className="col-span-1 flex flex-col gap-3">
              {templates.map((template, idx) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateIdx(idx)}
                  className={`rounded-xl border-2 transition-all text-left overflow-hidden w-full ${
                    selectedTemplateIdx === idx
                      ? 'border-primary shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Scaled-down live preview */}
                  <div className="relative overflow-hidden" style={{ height: 100 }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0,
                      width: 'calc(100% / 0.44)',
                      transform: 'scale(0.44)',
                      transformOrigin: 'top left',
                      pointerEvents: 'none',
                    }}>
                      <WidgetLivePreview type={selectedType!} config={getTemplateConfig(template)} />
                    </div>
                  </div>
                  <p className={`text-xs py-1.5 text-center font-medium border-t ${
                    selectedTemplateIdx === idx ? 'text-primary border-primary/20 bg-primary/5' : 'text-gray-500 border-gray-100'
                  }`}>
                    {template.label}
                  </p>
                </button>
              ))}
            </div>

            {/* Large live preview — 3/4 */}
            <div className="col-span-3 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex flex-col">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold px-4 pt-4 pb-3 border-b border-gray-100">
                Aperçu — {templates[selectedTemplateIdx]?.label}
              </p>
              <div className="p-4 flex-1">
                <WidgetLivePreview
                  type={selectedType!}
                  config={getTemplateConfig(templates[selectedTemplateIdx])}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-6 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { setStep('catalog'); setSelectedType(null); }}
              className="btn-secondary"
            >
              ← Retour
            </button>
            <button onClick={continueToConfig} className="btn-primary">
              Continuer →
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Step 3: Config form ────────────────────────────────────────────────────
  return (
    <PageShell>
      <div className="p-6">
        <h2 className="text-sm font-semibold text-brand-text mb-1">Configurez votre widget</h2>
        <p className="text-xs text-gray-400 mb-6">Personnalisez l'apparence et le comportement de votre widget</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-red-600 text-sm bg-red-50 rounded-btn px-3 py-2">{error}</p>}

            <div>
              <label className="label">Nom du widget</label>
              <input
                className="input"
                type="text"
                value={widgetName}
                onChange={e => setWidgetName(e.target.value)}
                placeholder={`Ex: ${def?.name} — Mon site`}
              />
            </div>

            {selectedType === 'google_reviews' && (
              <PlaceSearch
                placeId={config.placeId || ''}
                onSelect={(id, name) => {
                  updateConfig('placeId', id);
                  if (!widgetName) setWidgetName(name);
                }}
              />
            )}

            {def?.fields.filter(f => f.key !== 'placeId' || selectedType !== 'google_reviews').map(field => (
              <FieldInput
                key={field.key}
                field={field}
                value={config[field.key]}
                onChange={v => updateConfig(field.key, v)}
              />
            ))}

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
              <button type="button" onClick={goBackFromConfig} className="btn-secondary">← Retour</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Création...' : 'Créer le widget →'}
              </button>
            </div>
          </form>

          {/* Right: live preview */}
          <div className="hidden lg:block sticky top-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 overflow-hidden">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold text-center">Aperçu en direct</p>
              <WidgetLivePreview type={selectedType!} config={config} />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
