import { renderStars } from '../core/styles';

interface Testimonial {
  name: string; role?: string; company?: string;
  text: string; rating?: number; photoUrl?: string;
}

export function render(container: HTMLElement, config: any): void {
  const items: Testimonial[] = config.items || [];
  const layout = config.layout || 'grid';
  const accent = config.accentColor || '#621B7A';
  const theme = config.theme || 'light';
  const isDark = theme === 'dark';
  const bg = isDark ? '#1f2937' : '#ffffff';
  const cardBg = isDark ? '#374151' : '#f9fafb';
  const textColor = isDark ? '#f9fafb' : '#1D1E18';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#4b5563' : '#e5e7eb';

  const gridStyle = layout === 'grid'
    ? 'display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px'
    : 'display:flex;flex-direction:column;gap:12px';

  let html = `<div style="${gridStyle}">`;

  for (const t of items) {
    html += `
      <div style="background:${cardBg};border:1px solid ${borderColor};border-radius:8px;padding:20px">
        ${t.rating ? `<div style="margin-bottom:10px">${renderStars(t.rating)}</div>` : ''}
        <p style="color:${textColor};font-size:13px;line-height:1.6;margin:0 0 16px;font-style:italic">"${t.text}"</p>
        <div style="display:flex;align-items:center;gap:10px">
          ${t.photoUrl
            ? `<img src="${t.photoUrl}" alt="${t.name}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`
            : `<div style="width:40px;height:40px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">${t.name.charAt(0)}</div>`}
          <div>
            <div style="font-weight:700;color:${textColor};font-size:13px">${t.name}</div>
            ${t.role || t.company ? `<div style="color:${subtextColor};font-size:11px">${[t.role, t.company].filter(Boolean).join(' — ')}</div>` : ''}
          </div>
        </div>
      </div>`;
  }

  html += '</div>';
  container.innerHTML = html;
}
