import { renderStars } from '../core/styles';

export function render(container: HTMLElement, config: any, data: any): void {
  const source = config.source || 'google';
  const rating = data.rating || config.rating || 0;
  const reviewCount = data.reviewCount || config.reviewCount || 0;
  const sourceUrl = config.sourceUrl || '#';
  const shape = config.shape || 'pill';
  const accent = config.accentColor || '#621B7A';
  const theme = config.theme || 'light';
  const isDark = theme === 'dark';
  const bg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1D1E18';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const SOURCE_LABELS: Record<string, string> = {
    google: 'Google', trustpilot: 'Trustpilot', yelp: 'Yelp', tripadvisor: 'TripAdvisor',
  };

  const borderRadius = shape === 'pill' ? '50px' : '8px';

  container.innerHTML = `
    <a href="${sourceUrl}" target="_blank" rel="noopener" style="
      display:inline-flex;align-items:center;gap:10px;
      background:${bg};border:1px solid ${borderColor};
      border-radius:${borderRadius};padding:10px 16px;
      text-decoration:none;
      box-shadow:0 2px 8px rgba(0,0,0,.08)">
      <div>
        <div style="font-weight:700;font-size:20px;color:${accent};line-height:1">${rating.toFixed(1)}</div>
        <div style="margin-top:2px">${renderStars(rating)}</div>
        ${reviewCount ? `<div style="font-size:11px;color:${textColor};opacity:.7;margin-top:2px">${reviewCount} avis</div>` : ''}
      </div>
      <div style="width:1px;background:${borderColor};height:40px"></div>
      <div style="font-size:12px;font-weight:600;color:${textColor}">${SOURCE_LABELS[source] || source}</div>
    </a>`;
}
