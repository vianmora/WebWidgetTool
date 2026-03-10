import { renderStars } from '../core/styles';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string;
  relative_time_description: string;
  review_photos?: string[];
}

export function render(container: HTMLElement, widgetConfig: any, data: any): void {
  const reviews: Review[] = data.reviews || [];
  const theme = widgetConfig.theme || 'light';
  const accent = widgetConfig.accentColor || '#621B7A';
  const layout = widgetConfig.layout || 'list';

  const isDark = theme === 'dark';
  const bg = isDark ? '#1f2937' : '#ffffff';
  const cardBg = isDark ? '#374151' : '#f9fafb';
  const textColor = isDark ? '#f9fafb' : '#1D1E18';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#4b5563' : '#e5e7eb';

  const placeId: string | undefined = widgetConfig.placeId;
  const totalReviews: number | undefined = data.totalReviews;
  const averageRating: number | undefined = data.averageRating;
  const colors: Colors = { bg, cardBg, textColor, subtextColor, borderColor, accent, isDark, placeId, totalReviews, averageRating };

  if (layout === 'carousel') {
    renderCarousel(container, reviews, colors);
    return;
  }

  if (layout === 'masonry') {
    renderMasonry(container, reviews, colors);
    return;
  }

  // list = horizontal scroll (single row), grid = vertical scroll (column)
  const c = colors;
  const cardStyle = `background:${cardBg};border-radius:8px;padding:16px;border:1px solid ${borderColor}`;
  const wrapStyle = layout === 'list'
    ? `display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;scrollbar-width:thin`
    : `display:flex;flex-direction:column;gap:12px`;
  const cardWrapStyle = layout === 'list'
    ? `flex:0 0 280px`
    : '';

  let html = `<div style="background:${bg};padding:16px;border-radius:8px;font-family:inherit">`;
  html += headerHtml(c);

  if (reviews.length === 0) {
    html += `<p style="color:${subtextColor};text-align:center">Aucun avis disponible.</p>`;
  } else {
    html += `<div style="${wrapStyle}">`;
    for (const r of reviews) {
      const date = new Date(r.time * 1000).toLocaleDateString('fr-FR');
      html += `
        <div style="${cardWrapStyle}">
          <div style="${cardStyle}">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              ${r.profile_photo_url
                ? `<img src="${r.profile_photo_url}" alt="${escHtml(r.author_name)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`
                : `<div style="width:40px;height:40px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px">${r.author_name.charAt(0)}</div>`
              }
              <div>
                <div style="font-weight:600;color:${textColor};font-size:14px">${escHtml(r.author_name)}</div>
                <div style="font-size:12px;color:${subtextColor}">${r.relative_time_description || date}</div>
              </div>
            </div>
            ${renderStars(r.rating)}
            ${r.text ? `<p style="margin:10px 0 0;color:${textColor};font-size:13px;line-height:1.5">${escHtml(r.text)}</p>` : ''}
            ${r.review_photos && r.review_photos.length > 0 ? `
            <div style="display:flex;gap:6px;margin-top:10px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin">
              ${r.review_photos.map(url => `<img src="${url}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:6px;flex-shrink:0">`).join('')}
            </div>` : ''}
          </div>
        </div>`;
    }
    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

// ── Masonry ───────────────────────────────────────────────────────────────────

const MASONRY_INITIAL = 4;

function renderMasonry(container: HTMLElement, reviews: Review[], c: Colors): void {
  if (reviews.length === 0) {
    container.innerHTML = `<div style="background:${c.bg};padding:16px;border-radius:8px;font-family:inherit"><p style="color:${c.subtextColor};text-align:center">Aucun avis disponible.</p></div>`;
    return;
  }

  const cardStyle = `background:${c.cardBg};border-radius:8px;padding:16px;border:1px solid ${c.borderColor};break-inside:avoid;display:inline-block;width:100%;box-sizing:border-box;margin-bottom:12px`;

  const renderCard = (r: Review, hidden: boolean) => {
    const date = new Date(r.time * 1000).toLocaleDateString('fr-FR');
    return `
      <div class="ww-m-card" style="${cardStyle}${hidden ? ';display:none' : ''}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          ${r.profile_photo_url
            ? `<img src="${r.profile_photo_url}" alt="${escHtml(r.author_name)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`
            : `<div style="width:40px;height:40px;border-radius:50%;background:${c.accent};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px">${r.author_name.charAt(0)}</div>`
          }
          <div>
            <div style="font-weight:600;color:${c.textColor};font-size:14px">${escHtml(r.author_name)}</div>
            <div style="font-size:12px;color:${c.subtextColor}">${r.relative_time_description || date}</div>
          </div>
        </div>
        ${renderStars(r.rating)}
        ${r.text ? `<p style="margin:10px 0 0;color:${c.textColor};font-size:13px;line-height:1.5">${escHtml(r.text)}</p>` : ''}
        ${r.review_photos && r.review_photos.length > 0 ? `
        <div style="display:flex;gap:6px;margin-top:10px;overflow-x:auto;padding-bottom:4px">
          ${r.review_photos.map(url => `<img src="${url}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:6px;flex-shrink:0">`).join('')}
        </div>` : ''}
      </div>`;
  };

  const hasMore = reviews.length > MASONRY_INITIAL;
  const cards = reviews.map((r, i) => renderCard(r, i >= MASONRY_INITIAL)).join('');

  container.innerHTML = `
    <div style="background:${c.bg};padding:16px;border-radius:8px;font-family:inherit">
      ${headerHtml(c)}
      <div class="ww-masonry" style="column-count:3;column-gap:12px">
        ${cards}
      </div>
      ${hasMore ? `
      <div class="ww-m-more-wrap" style="text-align:center;margin-top:4px">
        <button class="ww-m-more" style="background:${c.accent};color:#fff;border:none;border-radius:6px;padding:8px 24px;font-size:13px;font-weight:600;cursor:pointer">Voir plus</button>
      </div>` : ''}
    </div>`;

  if (hasMore) {
    container.querySelector('.ww-m-more')!.addEventListener('click', () => {
      container.querySelectorAll<HTMLElement>('.ww-m-card').forEach(el => { el.style.display = 'inline-block'; });
      (container.querySelector('.ww-m-more-wrap') as HTMLElement).style.display = 'none';
    });
  }
}

// ── Carousel ──────────────────────────────────────────────────────────────────

interface Colors { bg: string; cardBg: string; textColor: string; subtextColor: string; borderColor: string; accent: string; isDark: boolean; placeId?: string; totalReviews?: number; averageRating?: number; }

const GOOGLE_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-3.59-13.46-8.83l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>`;

function headerHtml(c: Colors): string {
  const reviewUrl = c.placeId
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(c.placeId)}`
    : '#';
  const stars = c.averageRating
    ? `<span style="color:#f59e0b;font-size:13px;letter-spacing:1px">${'★'.repeat(Math.round(c.averageRating))}${'☆'.repeat(5 - Math.round(c.averageRating))}</span>`
    : '';
  return `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid ${c.borderColor}">
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">${GOOGLE_LOGO}</div>
      <div style="flex:1;min-width:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        ${stars}
        ${c.averageRating !== undefined
          ? `<span style="font-weight:700;color:${c.textColor};font-size:14px">${c.averageRating.toFixed(1)}</span>`
          : ''}
        ${c.totalReviews !== undefined
          ? `<span style="font-size:12px;color:${c.subtextColor}">${c.totalReviews.toLocaleString('fr-FR')} avis</span>`
          : ''}
      </div>
      <a href="${reviewUrl}" target="_blank" rel="noopener noreferrer"
        style="display:inline-block;padding:7px 14px;background:${c.accent};color:#fff;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;white-space:nowrap;flex-shrink:0">
        Nous laisser un avis
      </a>
    </div>`;
}

function renderCarousel(container: HTMLElement, reviews: Review[], c: Colors): void {
  if (reviews.length === 0) {
    container.innerHTML = `<div style="background:${c.bg};padding:16px;border-radius:8px;font-family:inherit"><p style="color:${c.subtextColor};text-align:center">Aucun avis disponible.</p></div>`;
    return;
  }

  const arrowStyle = `position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:36px;height:36px;border-radius:50%;background:${c.bg};border:1px solid ${c.borderColor};box-shadow:0 1px 4px rgba(0,0,0,.12);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;color:${c.textColor};transition:background .15s`;

  const slides = reviews.map((r) => {
    const date = new Date(r.time * 1000).toLocaleDateString('fr-FR');
    return `
      <div class="ww-cr-slide" style="min-width:100%;box-sizing:border-box;padding:0 4px">
        <div style="background:${c.cardBg};border-radius:12px;padding:24px;border:1px solid ${c.borderColor}">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            ${r.profile_photo_url
              ? `<img src="${r.profile_photo_url}" alt="${escHtml(r.author_name)}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0">`
              : `<div style="width:48px;height:48px;border-radius:50%;background:${c.accent};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0">${r.author_name.charAt(0)}</div>`}
            <div>
              <div style="font-weight:600;color:${c.textColor};font-size:15px">${escHtml(r.author_name)}</div>
              <div style="font-size:12px;color:${c.subtextColor}">${r.relative_time_description || date}</div>
            </div>
          </div>
          ${renderStars(r.rating)}
          ${r.text ? `<p style="margin:12px 0 0;color:${c.textColor};font-size:14px;line-height:1.6">${escHtml(r.text)}</p>` : ''}
          ${r.review_photos && r.review_photos.length > 0 ? `
          <div style="display:flex;gap:8px;margin-top:12px;overflow-x:auto;padding-bottom:4px">
            ${r.review_photos.map(url => `<img src="${url}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:6px;flex-shrink:0">`).join('')}
          </div>` : ''}
        </div>
      </div>`;
  }).join('');

  const dots = reviews.map((_, i) => `
    <button class="ww-cr-dot" data-i="${i}" style="width:8px;height:8px;border-radius:50%;border:none;cursor:pointer;padding:0;background:${i === 0 ? c.accent : c.borderColor};transition:background .2s"></button>
  `).join('');

  container.innerHTML = `
    <div style="background:${c.bg};padding:16px;border-radius:8px;font-family:inherit">
      ${headerHtml(c)}
      <div style="position:relative">
        <button class="ww-cr-prev" style="${arrowStyle};left:-8px">&#8592;</button>
        <div style="overflow:hidden;border-radius:8px">
          <div class="ww-cr-track" style="display:flex;transition:transform .35s ease;will-change:transform">
            ${slides}
          </div>
        </div>
        <button class="ww-cr-next" style="${arrowStyle};right:-8px">&#8594;</button>
      </div>
      <div style="display:flex;justify-content:center;gap:6px;margin-top:14px">${dots}</div>
    </div>`;

  // Attach interactivity after DOM is set
  let idx = 0;
  const total = reviews.length;
  const track = container.querySelector<HTMLElement>('.ww-cr-track')!;
  const dotEls = container.querySelectorAll<HTMLElement>('.ww-cr-dot');

  function update() {
    track.style.transform = `translateX(-${idx * 100}%)`;
    dotEls.forEach((d, i) => { d.style.background = i === idx ? c.accent : c.borderColor; });
  }

  container.querySelector('.ww-cr-prev')!.addEventListener('click', () => { idx = (idx - 1 + total) % total; update(); });
  container.querySelector('.ww-cr-next')!.addEventListener('click', () => { idx = (idx + 1) % total; update(); });
  dotEls.forEach((d, i) => d.addEventListener('click', () => { idx = i; update(); }));
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
