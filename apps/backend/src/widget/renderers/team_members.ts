const NETWORK_URLS: Record<string, string> = {
  linkedin: 'https://linkedin.com/in/', twitter: 'https://x.com/', github: 'https://github.com/',
};

export function render(container: HTMLElement, config: any): void {
  const members: Array<{
    name: string; role: string; bio?: string; photoUrl?: string;
    links?: Array<{ network: string; url: string }>;
  }> = config.members || [];
  const layout = config.layout || 'grid';
  const columns = config.columns || 3;
  const accent = config.accentColor || '#621B7A';
  const theme = config.theme || 'light';
  const isDark = theme === 'dark';
  const bg = isDark ? '#1f2937' : '#ffffff';
  const cardBg = isDark ? '#374151' : '#f9fafb';
  const textColor = isDark ? '#f9fafb' : '#1D1E18';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#4b5563' : '#e5e7eb';

  const gridStyle = layout === 'grid'
    ? `display:grid;grid-template-columns:repeat(${columns},1fr);gap:16px`
    : `display:flex;flex-direction:column;gap:12px`;

  let html = `<div style="${gridStyle}">`;

  for (const m of members) {
    html += `
      <div style="background:${cardBg};border:1px solid ${borderColor};border-radius:8px;padding:20px;text-align:center">
        ${m.photoUrl
          ? `<img src="${m.photoUrl}" alt="${m.name}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;margin:0 auto 12px">`
          : `<div style="width:72px;height:72px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#fff;font-size:24px;font-weight:700">${m.name.charAt(0)}</div>`}
        <div style="font-weight:700;color:${textColor};font-size:15px;margin-bottom:4px">${m.name}</div>
        <div style="color:${accent};font-size:12px;font-weight:600;margin-bottom:${m.bio ? '8px' : '0'}">${m.role}</div>
        ${m.bio ? `<p style="color:${subtextColor};font-size:12px;line-height:1.5;margin:0 0 12px">${m.bio}</p>` : ''}
        ${m.links && m.links.length ? `
          <div style="display:flex;gap:8px;justify-content:center">
            ${m.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" style="color:${accent};font-size:12px;text-decoration:none;font-weight:600">${l.network}</a>`).join('')}
          </div>` : ''}
      </div>`;
  }

  html += '</div>';
  container.innerHTML = html;
}
