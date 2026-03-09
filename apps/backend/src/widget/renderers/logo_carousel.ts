export function render(container: HTMLElement, config: any): void {
  const logos: Array<{ imageUrl: string; altText?: string; linkUrl?: string }> = config.logos || [];
  const speed = config.speed || 30; // seconds for one full loop
  const pauseOnHover = config.pauseOnHover !== false;
  const height = config.height || 60;
  const uid = 'ww-lc-' + Math.random().toString(36).slice(2);

  // Duplicate logos for seamless loop
  const allLogos = [...logos, ...logos];

  const logoHtml = allLogos.map(l => {
    const inner = `<img src="${l.imageUrl}" alt="${l.altText || ''}" style="height:${height}px;max-width:160px;object-fit:contain;filter:grayscale(60%);transition:filter .2s" onmouseover="this.style.filter='grayscale(0)'" onmouseout="this.style.filter='grayscale(60%)'">`;
    return l.linkUrl
      ? `<a href="${l.linkUrl}" target="_blank" rel="noopener" style="display:flex;align-items:center;padding:0 24px;flex-shrink:0">${inner}</a>`
      : `<div style="display:flex;align-items:center;padding:0 24px;flex-shrink:0">${inner}</div>`;
  }).join('');

  const style = document.createElement('style');
  style.textContent = `
    @keyframes ww-scroll-${uid} {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    #${uid} .ww-track { animation: ww-scroll-${uid} ${speed}s linear infinite; }
    ${pauseOnHover ? `#${uid}:hover .ww-track { animation-play-state: paused; }` : ''}
  `;
  document.head.appendChild(style);

  container.innerHTML = `
    <div id="${uid}" style="overflow:hidden;position:relative;width:100%">
      <div class="ww-track" style="display:flex;width:max-content">${logoHtml}</div>
    </div>`;
}
