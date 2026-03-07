import React, { useEffect, useState } from 'react';
import api from '../lib/api';

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  { name: 'Alice M.', rating: 5, text: 'Excellent service, je recommande vraiment cet établissement à tout le monde.' },
  { name: 'Jean-Paul B.', rating: 5, text: 'Très professionnel, équipe sympathique et résultats vraiment au rendez-vous.' },
  { name: 'Sophie K.', rating: 5, text: 'Je suis très satisfaite de la qualité du service, je reviendrai.' },
  { name: 'Marc L.', rating: 4, text: 'Bonne expérience globale, quelques petits points à améliorer mais globalement top.' },
];

const MOCK_TEAM = [
  { name: 'Sophie Martin', role: 'Directrice Générale' },
  { name: 'Lucas Bernard', role: 'Responsable Technique' },
  { name: 'Emma Petit', role: 'Designer UX' },
  { name: 'Marc Leroy', role: 'Commercial' },
  { name: 'Julie Moreau', role: 'Marketing' },
  { name: 'Paul Dupont', role: 'Support Client' },
];

const MOCK_FAQ = [
  { q: 'Comment fonctionne ce service ?', a: 'Notre service permet d\'intégrer facilement des widgets dynamiques sur votre site web en quelques minutes, sans compétences techniques.' },
  { q: 'Quel est le tarif ?', a: '' },
  { q: 'Comment intégrer le widget ?', a: '' },
  { q: 'Puis-je personnaliser les couleurs ?', a: '' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 600, color: '#6b7280', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Stars({ rating, color }: { rating: number; color: string }) {
  return <span style={{ color, fontSize: 13, letterSpacing: 1 }}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function WidgetLivePreview({ type, config }: { type: string; config: Record<string, any> }) {
  // Fetch real Google Reviews when placeId is set
  const [liveReviews, setLiveReviews] = useState<typeof MOCK_REVIEWS | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (type !== 'google_reviews' || !config.placeId) {
      setLiveReviews(null);
      return;
    }
    setLoadingReviews(true);
    api.get('/api/places/reviews', { params: { placeId: config.placeId } })
      .then(({ data }) => {
        const minRating = Number(config.minRating ?? 1);
        const maxReviews = Number(config.maxReviews ?? 5);
        const filtered = (data as any[])
          .filter(r => r.rating >= minRating)
          .slice(0, maxReviews)
          .map(r => ({
            name: r.author_name,
            rating: r.rating,
            text: r.text || '',
            photoUrl: r.profile_photo_url
              ? `${apiBase}/widget/image?url=${encodeURIComponent(r.profile_photo_url)}`
              : '',
            ago: r.relative_time_description || '',
          }));
        setLiveReviews(filtered.length > 0 ? filtered : null);
      })
      .catch(() => setLiveReviews(null))
      .finally(() => setLoadingReviews(false));
  }, [type, config.placeId, config.minRating, config.maxReviews]);

  const isDark = config.theme === 'dark';
  const accent = config.accentColor || '#621B7A';
  const layout = config.layout || 'list';

  const bg = isDark ? '#111827' : '#ffffff';
  const cardBg = isDark ? '#1f2937' : '#f9fafb';
  const textPrimary = isDark ? '#f3f4f6' : '#111827';
  const textSub = isDark ? '#9ca3af' : '#6b7280';
  const border = isDark ? '#374151' : '#e5e7eb';

  const wrap: React.CSSProperties = {
    background: bg, borderRadius: 12, padding: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14, color: textPrimary, overflow: 'hidden',
  };

  // ── Google Reviews / Testimonials ────────────────────────────────────────────
  if (type === 'google_reviews' || type === 'testimonials') {
    const isReviews = type === 'google_reviews';

    // Use real reviews if available, otherwise mock data
    type ReviewItem = { name: string; rating: number; text: string; photoUrl?: string; ago?: string };
    const displayReviews: ReviewItem[] = isReviews && liveReviews
      ? liveReviews
      : MOCK_REVIEWS.map(r => ({ ...r, photoUrl: '' }));
    const cards = displayReviews.slice(0, layout === 'grid' ? 4 : 3);

    const ReviewCard = ({ r }: { r: ReviewItem }) => (
      <div style={{ background: cardBg, borderRadius: 8, padding: layout === 'grid' ? 12 : 14, border: `1px solid ${border}`, ...(layout === 'list' ? { display: 'flex', gap: 12 } : {}) }}>
        {layout === 'list' ? (
          <>
            {r.photoUrl
              ? <img src={r.photoUrl} alt={r.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              : <Avatar name={r.name} size={36} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
              <Stars rating={r.rating} color={accent} />
              {r.ago && <div style={{ fontSize: 11, color: textSub }}>{r.ago}</div>}
              <div style={{ fontSize: 12, color: textSub, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.text}</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {r.photoUrl
                ? <img src={r.photoUrl} alt={r.name} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                : <Avatar name={r.name} size={26} />}
              <div style={{ fontWeight: 600, fontSize: 12 }}>{r.name}</div>
            </div>
            <Stars rating={r.rating} color={accent} />
            <div style={{ fontSize: 11, color: textSub, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.text}</div>
          </>
        )}
      </div>
    );

    return (
      <div style={wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${border}` }}>
          <div style={{ width: 32, height: 32, background: accent, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⭐</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{isReviews ? 'Google Reviews' : 'Témoignages'}</div>
            <div style={{ fontSize: 12, color: textSub }}>
              {isReviews && liveReviews ? `${liveReviews.length} avis chargés` : '4.8 ★ · aperçu'}
            </div>
          </div>
          {isReviews && loadingReviews && <div style={{ fontSize: 11, color: textSub }}>Chargement...</div>}
        </div>
        <div style={layout === 'grid' ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } : { display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cards.map((r, i) => <ReviewCard key={i} r={r} />)}
        </div>
      </div>
    );
  }

  // ── Rating badge ─────────────────────────────────────────────────────────────
  if (type === 'rating_badge') {
    const isPill = config.shape !== 'square';
    return (
      <div style={{ ...wrap, display: 'flex', justifyContent: 'center', padding: 32 }}>
        {isPill ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: accent, borderRadius: 999, padding: '12px 28px', color: 'white' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{config.rating || '4.8'}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{config.source || 'Google'}</div>
            </div>
            <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.3)' }} />
            <div>
              <div style={{ color: '#fbbf24', fontSize: 18, letterSpacing: 2 }}>★★★★★</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{config.reviewCount || 124} avis</div>
            </div>
          </div>
        ) : (
          <div style={{ background: isDark ? cardBg : '#fff', border: `1px solid ${border}`, borderRadius: 12, padding: 28, textAlign: 'center', minWidth: 140 }}>
            <div style={{ fontSize: 11, color: textSub, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 1 }}>{config.source || 'Google'}</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: accent, lineHeight: 1 }}>{config.rating || '4.8'}</div>
            <div style={{ color: '#fbbf24', fontSize: 22, margin: '8px 0' }}>★★★★★</div>
            <div style={{ fontSize: 12, color: textSub }}>{config.reviewCount || 124} avis</div>
          </div>
        )}
      </div>
    );
  }

  // ── WhatsApp / Telegram button ───────────────────────────────────────────────
  if (type === 'whatsapp_button' || type === 'telegram_button') {
    const isWA = type === 'whatsapp_button';
    const btnColor = isWA ? '#25d366' : '#0088cc';
    const isLeft = config.position?.includes('left');
    const label = config.label;
    return (
      <div style={{ ...wrap, position: 'relative', minHeight: 180, padding: 16 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ height: 8, background: cardBg, borderRadius: 4, marginBottom: 10, width: `${90 - i * 8}%` }} />)}
        <div style={{ position: 'absolute', bottom: 16, [isLeft ? 'left' : 'right']: 16, display: 'flex', alignItems: 'center', gap: 8, flexDirection: isLeft ? 'row' : 'row-reverse' }}>
          {label && <div style={{ background: btnColor, color: 'white', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600 }}>{label}</div>}
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: btnColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: `0 4px 14px ${btnColor}66` }}>
            {isWA ? '💬' : '✈️'}
          </div>
        </div>
      </div>
    );
  }

  // ── Social icons ─────────────────────────────────────────────────────────────
  if (type === 'social_icons') {
    const isMono = config.color === 'monochrome';
    const networks = [{ l: 'f', c: '#1877f2' }, { l: 'in', c: '#0077b5' }, { l: 'X', c: '#111' }, { l: 'yt', c: '#ff0000' }];
    const isColumn = config.layout === 'column';
    return (
      <div style={{ ...wrap, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
        <div style={{ display: 'flex', flexDirection: isColumn ? 'column' : 'row', gap: 12, alignItems: 'center' }}>
          {networks.map(n => (
            <div key={n.l} style={{ width: 40, height: 40, borderRadius: '50%', background: isMono ? '#6b7280' : n.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>{n.l}</div>
          ))}
        </div>
      </div>
    );
  }

  // ── Countdown timer ──────────────────────────────────────────────────────────
  if (type === 'countdown_timer') {
    const blocks: [string, string][] = [['12', 'Jours'], ['08', 'Heures'], ['34', 'Min'], ['52', 'Sec']];
    return (
      <div style={{ ...wrap, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 }}>
        {blocks.map(([num, unit]) => (
          <div key={unit} style={{ textAlign: 'center' }}>
            <div style={{ background: isDark ? accent : cardBg, border: isDark ? 'none' : `1px solid ${border}`, borderRadius: 10, padding: '12px 16px', minWidth: 58 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: isDark ? 'white' : accent, lineHeight: 1 }}>{num}</div>
            </div>
            <div style={{ fontSize: 11, color: textSub, marginTop: 6 }}>{unit}</div>
          </div>
        ))}
      </div>
    );
  }

  // ── FAQ ──────────────────────────────────────────────────────────────────────
  if (type === 'faq') {
    return (
      <div style={wrap}>
        {MOCK_FAQ.map((item, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${border}`, padding: '13px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ fontWeight: i === 0 ? 600 : 400, fontSize: 13 }}>{item.q}</div>
              <div style={{ color: i === 0 ? accent : textSub, fontSize: 20, fontWeight: 300, flexShrink: 0 }}>{i === 0 ? '−' : '+'}</div>
            </div>
            {i === 0 && item.a && <div style={{ fontSize: 12, color: textSub, marginTop: 10, lineHeight: 1.6 }}>{item.a}</div>}
          </div>
        ))}
      </div>
    );
  }

  // ── Team members ─────────────────────────────────────────────────────────────
  if (type === 'team_members') {
    const members = MOCK_TEAM.slice(0, layout === 'grid' ? 6 : 4);
    return (
      <div style={wrap}>
        {layout === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {members.map((m, i) => (
              <div key={i} style={{ textAlign: 'center', background: cardBg, borderRadius: 8, padding: 14, border: `1px solid ${border}` }}>
                <Avatar name={m.name} size={44} />
                <div style={{ fontWeight: 600, fontSize: 12, marginTop: 8 }}>{m.name.split(' ')[0]}</div>
                <div style={{ fontSize: 11, color: accent, marginTop: 2 }}>{m.role}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {members.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: cardBg, borderRadius: 8, padding: 12, border: `1px solid ${border}` }}>
                <Avatar name={m.name} size={40} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: accent }}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Business hours ───────────────────────────────────────────────────────────
  if (type === 'business_hours') {
    const days = [
      { day: 'Lundi', hours: '09:00 – 18:00', open: true },
      { day: 'Mardi', hours: '09:00 – 18:00', open: true },
      { day: 'Mercredi', hours: '09:00 – 18:00', open: true },
      { day: 'Jeudi', hours: '09:00 – 18:00', open: true },
      { day: 'Vendredi', hours: '09:00 – 17:00', open: true },
      { day: 'Samedi', hours: '10:00 – 14:00', open: true },
      { day: 'Dimanche', hours: 'Fermé', open: false },
    ];
    return (
      <div style={wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${border}` }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontWeight: 600, color: '#22c55e' }}>{config.openLabel || 'Ouvert'}</span>
          <span style={{ color: textSub, fontSize: 12 }}>· Ferme à 18:00</span>
        </div>
        {days.map((d, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < days.length - 1 ? `1px solid ${border}` : 'none' }}>
            <span style={{ fontSize: 13, color: d.open ? textPrimary : textSub }}>{d.day}</span>
            <span style={{ fontSize: 13, color: d.open ? textSub : '#ef4444', fontFamily: 'monospace' }}>{d.hours}</span>
          </div>
        ))}
      </div>
    );
  }

  // ── Pricing table ────────────────────────────────────────────────────────────
  if (type === 'pricing_table') {
    const currency = config.currency || '€';
    const plans = [
      { name: 'Gratuit', price: '0', features: ['1 widget', '100 vues/mois'], featured: false },
      { name: 'Starter', price: '19', features: ['10 widgets', '10k vues/mois', 'Support'], featured: true },
      { name: 'Pro', price: '49', features: ['Illimité', 'Vues illimitées', '24/7'], featured: false },
    ];
    return (
      <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, alignItems: 'start' }}>
        {plans.map((p, i) => (
          <div key={i} style={{ background: p.featured ? accent : cardBg, borderRadius: 10, padding: 16, border: p.featured ? 'none' : `1px solid ${border}`, transform: p.featured ? 'scale(1.04)' : 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: p.featured ? 'white' : textPrimary }}>{p.name}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: p.featured ? 'white' : accent, margin: '8px 0' }}>
              {p.price}<span style={{ fontSize: 13, fontWeight: 400 }}>{currency}/m</span>
            </div>
            {p.features.map((f, j) => (
              <div key={j} style={{ fontSize: 11, color: p.featured ? 'rgba(255,255,255,0.8)' : textSub, padding: '2px 0' }}>✓ {f}</div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ── Image gallery ────────────────────────────────────────────────────────────
  if (type === 'image_gallery') {
    if (config.layout === 'carousel') {
      return (
        <div style={{ ...wrap, padding: 0 }}>
          <div style={{ background: cardBg, borderRadius: 12, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: textSub }}>🖼</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: 14 }}>
            {[0,1,2,3,4].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === 2 ? accent : border }} />)}
          </div>
        </div>
      );
    }
    const cols = Math.min(config.columns || 3, 4);
    return (
      <div style={{ ...wrap, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 }}>
        {Array.from({ length: cols * 2 }).map((_, i) => (
          <div key={i} style={{ background: cardBg, borderRadius: 6, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textSub, fontSize: 22, border: `1px solid ${border}` }}>🖼</div>
        ))}
      </div>
    );
  }

  // ── Logo carousel ────────────────────────────────────────────────────────────
  if (type === 'logo_carousel') {
    const h = Math.min(config.height || 60, 80);
    return (
      <div style={wrap}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' as const }}>
          {['ACME', 'Globex', 'Initech', 'Hooli', 'Pied Piper'].map(name => (
            <div key={name} style={{ height: h, display: 'flex', alignItems: 'center', padding: '0 18px', background: cardBg, borderRadius: 8, border: `1px solid ${border}`, color: textSub, fontWeight: 700, fontSize: 13 }}>{name}</div>
          ))}
        </div>
      </div>
    );
  }

  // ── Cookie banner ────────────────────────────────────────────────────────────
  if (type === 'cookie_banner') {
    const isTop = config.position === 'top';
    const Banner = () => (
      <div style={{ background: isDark ? '#1f2937' : '#fff', border: `1px solid ${border}`, borderRadius: 8, padding: 14, margin: 10 }}>
        <div style={{ fontSize: 12, color: textSub, marginBottom: 10 }}>{config.message || 'Nous utilisons des cookies pour améliorer votre expérience.'}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: accent, color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{config.acceptLabel || 'Accepter'}</button>
          <button style={{ background: 'transparent', color: textSub, border: `1px solid ${border}`, borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>{config.rejectLabel || 'Refuser'}</button>
        </div>
      </div>
    );
    const Lines = () => <>{[0,1,2].map(i => <div key={i} style={{ height: 8, background: cardBg, margin: '8px 14px', borderRadius: 4 }} />)}</>;
    return (
      <div style={{ ...wrap, position: 'relative', minHeight: 140, padding: 0 }}>
        {isTop ? <><Banner /><Lines /></> : <><Lines /><Banner /></>}
      </div>
    );
  }

  // ── Back to top ──────────────────────────────────────────────────────────────
  if (type === 'back_to_top') {
    const isLeft = config.position?.includes('left');
    const isCircle = config.shape !== 'square';
    return (
      <div style={{ ...wrap, position: 'relative', minHeight: 140 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ height: 8, background: cardBg, borderRadius: 4, marginBottom: 10, width: `${90 - i * 8}%` }} />)}
        <div style={{ position: 'absolute', bottom: 16, [isLeft ? 'left' : 'right']: 16, width: 44, height: 44, background: accent, borderRadius: isCircle ? '50%' : 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>↑</div>
      </div>
    );
  }

  // ── Google map ───────────────────────────────────────────────────────────────
  if (type === 'google_map') {
    return (
      <div style={{ ...wrap, padding: 0 }}>
        <div style={{ height: 160, background: '#e5e7eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 36 }}>📍</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>{config.address || 'Adresse non renseignée'}</div>
        </div>
      </div>
    );
  }

  // ── Social share ─────────────────────────────────────────────────────────────
  if (type === 'social_share') {
    const nets = [{ l: 'Facebook', c: '#1877f2' }, { l: 'X', c: '#111' }, { l: 'LinkedIn', c: '#0077b5' }, { l: 'WhatsApp', c: '#25d366' }];
    return (
      <div style={{ ...wrap, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
          {nets.map(n => <div key={n.l} style={{ background: n.c, color: 'white', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 600 }}>{n.l}</div>)}
        </div>
      </div>
    );
  }

  // ── PDF viewer ───────────────────────────────────────────────────────────────
  if (type === 'pdf_viewer') {
    return (
      <div style={{ ...wrap, padding: 0 }}>
        <div style={{ height: 180, background: cardBg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 36 }}>📄</div>
          <div style={{ fontSize: 12, color: textSub }}>Visionneuse PDF</div>
          {config.pdfUrl && <div style={{ fontSize: 11, color: accent, maxWidth: 200, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{config.pdfUrl}</div>}
        </div>
      </div>
    );
  }

  // ── Generic fallback ─────────────────────────────────────────────────────────
  return (
    <div style={{ ...wrap, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
      <div style={{ textAlign: 'center', color: textSub }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔧</div>
        <div style={{ fontSize: 13 }}>Configurez les paramètres pour voir l'aperçu</div>
      </div>
    </div>
  );
}
