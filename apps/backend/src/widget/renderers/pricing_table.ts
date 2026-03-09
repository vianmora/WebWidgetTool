export function render(container: HTMLElement, config: any): void {
  const plans: Array<{
    name: string; price: string; period?: string;
    features: string[]; ctaLabel?: string; ctaUrl?: string; highlighted?: boolean;
  }> = config.plans || [];
  const currency = config.currency || '€';
  const accent = config.accentColor || '#621B7A';
  const theme = config.theme || 'light';
  const isDark = theme === 'dark';
  const textColor = isDark ? '#f9fafb' : '#1D1E18';
  const bg = isDark ? '#1f2937' : '#ffffff';
  const cardBg = isDark ? '#374151' : '#f9fafb';
  const borderColor = isDark ? '#4b5563' : '#e5e7eb';

  let html = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">`;

  for (const plan of plans) {
    const hlBg = plan.highlighted ? accent : (isDark ? '#374151' : '#ffffff');
    const hlText = plan.highlighted ? '#ffffff' : textColor;
    const hlBorder = plan.highlighted ? accent : borderColor;

    html += `
      <div style="background:${hlBg};border:2px solid ${hlBorder};border-radius:8px;padding:24px;
                  display:flex;flex-direction:column;gap:12px;position:relative">
        ${plan.highlighted ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);
          background:#9EE992;color:#1D1E18;padding:3px 14px;border-radius:4px;font-size:11px;font-weight:700">
          Recommandé</div>` : ''}
        <div style="font-size:16px;font-weight:700;color:${hlText}">${plan.name}</div>
        <div style="display:flex;align-items:baseline;gap:4px">
          <span style="font-size:32px;font-weight:800;color:${plan.highlighted ? '#9EE992' : accent}">${plan.price}</span>
          <span style="color:${hlText};opacity:.7;font-size:13px">${currency}${plan.period ? ' / ' + plan.period : ''}</span>
        </div>
        <ul style="list-style:none;padding:0;margin:0;flex:1;display:flex;flex-direction:column;gap:8px">
          ${plan.features.map(f => `
            <li style="display:flex;align-items:center;gap:8px;font-size:13px;color:${hlText}">
              <span style="color:${plan.highlighted ? '#9EE992' : accent};font-weight:700">✓</span>${f}
            </li>`).join('')}
        </ul>
        ${plan.ctaLabel ? `<a href="${plan.ctaUrl || '#'}"
          style="display:block;text-align:center;padding:10px;border-radius:5px;font-weight:700;
                 font-size:14px;text-decoration:none;
                 background:${plan.highlighted ? '#9EE992' : accent};
                 color:${plan.highlighted ? '#1D1E18' : '#ffffff'};
                 transition:opacity .2s"
          onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
          ${plan.ctaLabel}
        </a>` : ''}
      </div>`;
  }

  html += '</div>';
  container.innerHTML = html;
}
