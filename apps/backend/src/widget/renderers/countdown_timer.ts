export function render(container: HTMLElement, config: any): void {
  const targetDate = new Date(config.targetDate || Date.now() + 86400000);
  const labels = config.labels || { days: 'Jours', hours: 'Heures', minutes: 'Minutes', seconds: 'Secondes' };
  const expiredMessage = config.expiredMessage || 'Événement terminé';
  const accent = config.accentColor || '#621B7A';
  const theme = config.theme || 'light';
  const isDark = theme === 'dark';
  const bg = isDark ? '#1f2937' : '#f9fafb';
  const textColor = isDark ? '#f9fafb' : '#1D1E18';

  container.innerHTML = `
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;padding:16px;background:${bg};border-radius:8px">
      ${['days','hours','minutes','seconds'].map(unit => `
        <div style="text-align:center;min-width:64px">
          <div id="ww-ct-${container.id}-${unit}"
               style="font-size:36px;font-weight:700;color:${accent};line-height:1">00</div>
          <div style="font-size:12px;color:${textColor};margin-top:4px">${labels[unit] || unit}</div>
        </div>
      `).join('<div style="font-size:36px;font-weight:700;color:'+textColor+';align-self:center">:</div>')}
    </div>`;

  const id = `ww-ct-${container.id}`;

  function tick() {
    const now = Date.now();
    const diff = Math.max(0, targetDate.getTime() - now);
    if (diff === 0) {
      container.innerHTML = `<div style="text-align:center;padding:16px;color:${textColor};background:${bg};border-radius:8px">${expiredMessage}</div>`;
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    document.getElementById(`${id}-days`)!.textContent = pad(d);
    document.getElementById(`${id}-hours`)!.textContent = pad(h);
    document.getElementById(`${id}-minutes`)!.textContent = pad(m);
    document.getElementById(`${id}-seconds`)!.textContent = pad(s);
    setTimeout(tick, 1000);
  }

  // Give the container an id if it doesn't have one
  if (!container.id) container.id = 'ww-' + Math.random().toString(36).slice(2);
  tick();
}
