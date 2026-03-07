export function render(container: HTMLElement, config: any): void {
  const phone = (config.phone || '').replace(/\D/g, '');
  const message = encodeURIComponent(config.message || '');
  const position = config.position || 'bottom-right';
  const label = config.label || '';
  const size = config.size || 56;
  const color = '#25D366';

  const posStyle = position === 'bottom-left'
    ? 'bottom:20px;left:20px'
    : 'bottom:20px;right:20px';

  const el = document.createElement('div');
  el.innerHTML = `
    <a href="https://wa.me/${phone}${message ? '?text=' + message : ''}"
       target="_blank" rel="noopener"
       style="position:fixed;${posStyle};z-index:9999;
              display:flex;align-items:center;gap:8px;
              background:${color};color:#fff;
              border-radius:${label ? '28px' : '50%'};
              width:${label ? 'auto' : size + 'px'};
              height:${size}px;
              padding:${label ? '0 16px 0 14px' : '0'};
              justify-content:center;
              box-shadow:0 4px 12px rgba(0,0,0,.25);
              text-decoration:none;font-weight:600;font-size:14px;
              transition:transform .2s,box-shadow .2s"
       onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 6px 16px rgba(0,0,0,.3)'"
       onmouseout="this.style.transform='';this.style.boxShadow='0 4px 12px rgba(0,0,0,.25)'"
       aria-label="Nous contacter sur WhatsApp">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.845L0 24l6.335-1.502A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.013-1.375l-.36-.214-3.724.883.93-3.617-.235-.372A9.817 9.817 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818 5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818z"/>
      </svg>
      ${label ? `<span>${label}</span>` : ''}
    </a>`;
  document.body.appendChild(el.firstElementChild!);
}
