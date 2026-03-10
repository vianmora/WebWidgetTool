import React, { useEffect, useState } from 'react';
import api from '../lib/api';

// ── Mock data ──────────────────────────────────────────────────────────────────
function svgPhoto(bg: string, emoji: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${bg}"/><text x="40" y="52" font-size="30" text-anchor="middle">${emoji}</text></svg>`)}`;
}

const MOCK_REVIEWS = [
  { name: 'Alice M.', rating: 5, icon: '👩', text: 'Excellent service, je recommande vraiment cet établissement à tout le monde. L\'équipe est aux petits soins et le résultat est impeccable.', reviewPhotos: [svgPhoto('#dbeafe', '🏪'), svgPhoto('#dcfce7', '🌿')] },
  { name: 'Jean-Paul B.', rating: 5, icon: '👨‍💼', text: 'Top.' },
  { name: 'Sophie K.', rating: 5, icon: '👩‍🦰', text: 'Je suis très satisfaite de la qualité du service, je reviendrai sans hésiter. Les délais sont respectés et la communication est excellente.', reviewPhotos: [svgPhoto('#fef9c3', '✨')] },
  { name: 'Marc L.', rating: 4, icon: '🧔', text: 'Bonne expérience globale, quelques petits points à améliorer mais globalement très positif.' },
  { name: 'Camille D.', rating: 5, icon: '👩‍🎨', text: 'Incroyable ! Je n\'aurais pas pu espérer mieux. Je recommande les yeux fermés à tous mes proches.', reviewPhotos: [svgPhoto('#fce7f3', '🎨'), svgPhoto('#ede9fe', '💜'), svgPhoto('#dbeafe', '🖼️')] },
  { name: 'Thomas R.', rating: 4, icon: '👨‍🔧', text: 'Rapport qualité-prix imbattable.' },
  { name: 'Léa F.', rating: 5, icon: '👩‍💻', text: 'Prise en charge rapide, personnel attentionné. Un vrai plaisir du début à la fin. Merci !', reviewPhotos: [svgPhoto('#dcfce7', '🌸')] },
  { name: 'Nicolas V.', rating: 5, icon: '🧑‍🏫', text: 'Très bonne prestation. Équipe professionnelle et à l\'écoute. Je reviendrai certainement et n\'hésiterai pas à en parler autour de moi.' },
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
  const [liveStats, setLiveStats] = useState<{ averageRating?: number; totalReviews?: number } | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (type !== 'google_reviews' || !config.placeId) {
      setLiveReviews(null);
      setLiveStats(null);
      return;
    }
    setLoadingReviews(true);
    api.get('/api/places/reviews', { params: { placeId: config.placeId } })
      .then(({ data }) => {
        const result = data as { reviews: any[]; averageRating?: number; totalReviews?: number };
        setLiveStats({ averageRating: result.averageRating, totalReviews: result.totalReviews });
        const minRating = Number(config.minRating ?? 1);
        const maxReviews = Number(config.maxReviews ?? 5);
        const filtered = (result.reviews || [])
          .filter((r: any) => r.rating >= minRating)
          .slice(0, maxReviews)
          .map((r: any) => ({
            name: r.author_name,
            rating: r.rating,
            text: r.text || '',
            photoUrl: r.profile_photo_url
              ? `${apiBase}/widget/image?url=${encodeURIComponent(r.profile_photo_url)}`
              : '',
            ago: r.relative_time_description || '',
            reviewPhotos: (r.review_photos || []) as string[],
          }));
        setLiveReviews(filtered.length > 0 ? filtered : null);
      })
      .catch(() => { setLiveReviews(null); setLiveStats(null); })
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

    type ReviewItem = { name: string; rating: number; text: string; photoUrl?: string; icon?: string; ago?: string; reviewPhotos?: string[] };
    const displayReviews: ReviewItem[] = isReviews && liveReviews
      ? liveReviews
      : MOCK_REVIEWS.map(r => ({ ...r, photoUrl: '' }));
    const cards = displayReviews;

    const ReviewCard = ({ r, compact }: { r: ReviewItem; compact?: boolean }) => (
      <div style={{ background: cardBg, borderRadius: 8, padding: compact ? 12 : 14, border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 8 : 10, marginBottom: compact ? 6 : 10 }}>
          {r.photoUrl
            ? <img src={r.photoUrl} alt={r.name} style={{ width: compact ? 28 : 36, height: compact ? 28 : 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            : r.icon
              ? <div style={{ width: compact ? 28 : 36, height: compact ? 28 : 36, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: compact ? 14 : 18, flexShrink: 0 }}>{r.icon}</div>
              : <Avatar name={r.name} size={compact ? 28 : 36} />}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: compact ? 12 : 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
            {r.ago && <div style={{ fontSize: 11, color: textSub }}>{r.ago}</div>}
          </div>
        </div>
        <Stars rating={r.rating} color={accent} />
        <div style={{ fontSize: compact ? 11 : 12, color: textSub, marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.text}</div>
        {r.reviewPhotos && r.reviewPhotos.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto' }}>
            {r.reviewPhotos.map((url, i) => (
              <img key={i} src={url} alt="" style={{ width: compact ? 52 : 64, height: compact ? 52 : 64, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
            ))}
          </div>
        )}
      </div>
    );

    const placeId = config.placeId as string | undefined;
    const reviewUrl = placeId
      ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`
      : '#';

    // Use real place-level stats if loaded, fallback to mock values
    const avgRating: number = liveStats?.averageRating ?? 4.8;
    const totalCount: number = liveStats?.totalReviews ?? 142;
    const roundedAvg = Math.round(avgRating);

    const GoogleLogo = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-3.59-13.46-8.83l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
    );

    const Header = () => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${border}` }}>
        <GoogleLogo />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
          <span style={{ color: '#f59e0b', fontSize: 13, letterSpacing: 1 }}>{'★'.repeat(roundedAvg)}{'☆'.repeat(5 - roundedAvg)}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: textPrimary }}>{avgRating.toFixed(1)}</span>
          {loadingReviews
            ? <span style={{ fontSize: 12, color: textSub }}>Chargement…</span>
            : <span style={{ fontSize: 12, color: textSub }}>{totalCount.toLocaleString('fr-FR')} avis</span>}
        </div>
        <a href={reviewUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-block', padding: '7px 12px', background: accent, color: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
          Nous laisser un avis
        </a>
      </div>
    );

    // ── Carousel ──────────────────────────────────────────────────────────────
    if (layout === 'carousel') {
      const [carouselIdx, setCarouselIdx] = React.useState(0);
      const total = cards.length;
      return (
        <div style={wrap}>
          <Header />
          <div style={{ position: 'relative' }}>
            <div style={{ overflow: 'hidden', borderRadius: 8 }}>
              <div style={{ display: 'flex', transition: 'transform .35s ease', transform: `translateX(-${carouselIdx * 100}%)` }}>
                {cards.map((r, i) => (
                  <div key={i} style={{ minWidth: '100%', boxSizing: 'border-box' }}>
                    <ReviewCard r={r} />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setCarouselIdx(i => (i - 1 + total) % total)}
              style={{ position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', border: `1px solid ${border}`, background: bg, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>←</button>
            <button onClick={() => setCarouselIdx(i => (i + 1) % total)}
              style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', border: `1px solid ${border}`, background: bg, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>→</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
            {cards.map((_, i) => (
              <button key={i} onClick={() => setCarouselIdx(i)}
                style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer', background: i === carouselIdx ? accent : border, transition: 'background .2s' }} />
            ))}
          </div>
        </div>
      );
    }

    // ── Masonry ───────────────────────────────────────────────────────────────
    if (layout === 'masonry') {
      const INITIAL = 4;
      const [showAll, setShowAll] = React.useState(false);
      const visible = showAll ? cards : cards.slice(0, INITIAL);
      const hasMore = cards.length > INITIAL;
      return (
        <div style={wrap}>
          <Header />
          <div style={{ columnCount: 3, columnGap: 10 }}>
            {visible.map((r, i) => (
              <div key={i} style={{ breakInside: 'avoid', marginBottom: 10, display: 'inline-block', width: '100%' }}>
                <ReviewCard r={r} compact />
              </div>
            ))}
          </div>
          {hasMore && !showAll && (
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button onClick={() => setShowAll(true)}
                style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Voir plus
              </button>
            </div>
          )}
        </div>
      );
    }

    // ── Horizontal scroll (list) & Vertical scroll (grid) ────────────────────
    return (
      <div style={wrap}>
        <Header />
        {layout === 'list' ? (
          // Horizontal scroll: single row
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
            {cards.map((r, i) => (
              <div key={i} style={{ flex: '0 0 240px' }}>
                <ReviewCard r={r} compact />
              </div>
            ))}
          </div>
        ) : (
          // Vertical scroll (grid): column with max height
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
            {cards.map((r, i) => <ReviewCard key={i} r={r} />)}
          </div>
        )}
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
