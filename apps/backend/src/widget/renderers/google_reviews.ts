import { renderStars } from '../core/styles';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string;
  relative_time_description: string;
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

  const cardStyle = `background:${cardBg};border-radius:8px;padding:16px;margin-bottom:12px;border:1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`;
  const gridStyle = layout === 'grid'
    ? `display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px`
    : '';

  let html = `<div style="background:${bg};padding:16px;border-radius:8px;font-family:inherit">`;

  if (reviews.length === 0) {
    html += `<p style="color:${subtextColor};text-align:center">Aucun avis disponible.</p>`;
  } else {
    html += `<div style="${gridStyle}">`;
    for (const r of reviews) {
      const date = new Date(r.time * 1000).toLocaleDateString('fr-FR');
      html += `
        <div style="${cardStyle}">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            ${r.profile_photo_url
              ? `<img src="${r.profile_photo_url}" alt="${r.author_name}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`
              : `<div style="width:40px;height:40px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px">${r.author_name.charAt(0)}</div>`
            }
            <div>
              <div style="font-weight:600;color:${textColor};font-size:14px">${escHtml(r.author_name)}</div>
              <div style="font-size:12px;color:${subtextColor}">${r.relative_time_description || date}</div>
            </div>
          </div>
          ${renderStars(r.rating)}
          ${r.text ? `<p style="margin:10px 0 0;color:${textColor};font-size:13px;line-height:1.5">${escHtml(r.text)}</p>` : ''}
        </div>`;
    }
    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
