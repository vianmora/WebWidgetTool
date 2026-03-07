export function render(container: HTMLElement, config: any): void {
  const threshold = config.threshold || 300;
  const position = config.position || 'bottom-right';
  const shape = config.shape || 'circle';
  const accent = config.accentColor || '#621B7A';

  const posStyle = position === 'bottom-left' ? 'bottom:24px;left:24px' : 'bottom:24px;right:24px';
  const borderRadius = shape === 'circle' ? '50%' : '8px';

  const btn = document.createElement('button');
  btn.setAttribute('aria-label', 'Retour en haut');
  btn.style.cssText = `position:fixed;${posStyle};z-index:9999;width:44px;height:44px;
    border-radius:${borderRadius};background:${accent};color:#fff;border:none;
    cursor:pointer;display:none;align-items:center;justify-content:center;
    box-shadow:0 4px 12px rgba(0,0,0,.25);transition:opacity .2s,transform .2s;
    font-size:20px`;
  btn.innerHTML = '↑';

  document.body.appendChild(btn);

  const onScroll = () => {
    if (window.scrollY > threshold) {
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
