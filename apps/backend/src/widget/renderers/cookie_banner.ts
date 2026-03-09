const STORAGE_KEY = 'ww-cookie-consent';

export function render(container: HTMLElement, config: any): void {
  if (localStorage.getItem(STORAGE_KEY)) return; // already answered

  const message = config.message || 'Nous utilisons des cookies pour améliorer votre expérience.';
  const acceptLabel = config.acceptLabel || 'Accepter';
  const rejectLabel = config.rejectLabel || 'Refuser';
  const position = config.position || 'bottom';
  const privacyUrl = config.privacyUrl || '';
  const accent = config.accentColor || '#621B7A';

  const posStyle = position === 'top' ? 'top:0;left:0;right:0' : 'bottom:0;left:0;right:0';

  const banner = document.createElement('div');
  banner.style.cssText = `position:fixed;${posStyle};z-index:99999;background:#1D1E18;color:#fff;
    padding:16px 24px;display:flex;align-items:center;justify-content:space-between;
    gap:16px;flex-wrap:wrap;box-shadow:0 -2px 12px rgba(0,0,0,.2)`;

  banner.innerHTML = `
    <span style="font-size:13px;line-height:1.5">
      ${message}
      ${privacyUrl ? ` <a href="${privacyUrl}" target="_blank" style="color:#9EE992;font-weight:600">En savoir plus</a>` : ''}
    </span>
    <div style="display:flex;gap:8px;flex-shrink:0">
      <button id="ww-cookie-reject" style="background:transparent;border:1px solid #fff;color:#fff;
        padding:8px 16px;border-radius:5px;font-size:13px;cursor:pointer;font-weight:600">
        ${rejectLabel}
      </button>
      <button id="ww-cookie-accept" style="background:${accent};border:none;color:#fff;
        padding:8px 16px;border-radius:5px;font-size:13px;cursor:pointer;font-weight:600">
        ${acceptLabel}
      </button>
    </div>`;

  document.body.appendChild(banner);

  const dismiss = (value: 'accepted' | 'rejected') => {
    localStorage.setItem(STORAGE_KEY, value);
    banner.style.transform = 'translateY(100%)';
    banner.style.transition = 'transform .3s';
    setTimeout(() => banner.remove(), 300);
  };

  banner.querySelector('#ww-cookie-accept')!.addEventListener('click', () => dismiss('accepted'));
  banner.querySelector('#ww-cookie-reject')!.addEventListener('click', () => dismiss('rejected'));
}
