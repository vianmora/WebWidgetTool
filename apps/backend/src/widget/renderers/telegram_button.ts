export function render(container: HTMLElement, config: any): void {
  const username = config.username || '';
  const label = config.label || '';
  const position = config.position || 'bottom-right';
  const size = config.size || 56;
  const color = '#0088cc';

  const posStyle = position === 'bottom-left' ? 'bottom:20px;left:20px' : 'bottom:20px;right:20px';

  const el = document.createElement('a');
  el.href = `https://t.me/${username}`;
  el.target = '_blank';
  el.rel = 'noopener';
  el.setAttribute('aria-label', 'Nous contacter sur Telegram');
  el.style.cssText = `position:fixed;${posStyle};z-index:9999;display:flex;align-items:center;gap:8px;
    background:${color};color:#fff;border-radius:${label ? '28px' : '50%'};
    width:${label ? 'auto' : size + 'px'};height:${size}px;
    padding:${label ? '0 16px 0 14px' : '0'};justify-content:center;
    box-shadow:0 4px 12px rgba(0,0,0,.25);text-decoration:none;font-weight:600;font-size:14px;
    transition:transform .2s,box-shadow .2s`;
  el.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.16 13.48l-2.952-.924c-.643-.203-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.98.079z"/>
    </svg>
    ${label ? `<span>${label}</span>` : ''}`;
  el.addEventListener('mouseover', () => { el.style.transform = 'scale(1.05)'; });
  el.addEventListener('mouseout', () => { el.style.transform = ''; });
  document.body.appendChild(el);
}
