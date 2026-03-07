export function render(container: HTMLElement, config: any): void {
  const networks: string[] = config.networks || ['facebook', 'x', 'linkedin', 'whatsapp', 'copy'];
  const url = config.url || '';
  const title = config.title || '';
  const position = config.position || 'inline';
  const orientation = config.orientation || 'horizontal';

  const shareUrls: Record<string, () => string> = {
    facebook: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || location.href)}`,
    x:        () => `https://x.com/intent/tweet?url=${encodeURIComponent(url || location.href)}&text=${encodeURIComponent(title)}`,
    linkedin: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || location.href)}`,
    whatsapp: () => `https://wa.me/?text=${encodeURIComponent((title ? title + ' ' : '') + (url || location.href))}`,
  };
  const labels: Record<string, string> = { facebook: 'Facebook', x: 'X', linkedin: 'LinkedIn', whatsapp: 'WhatsApp', copy: 'Copier' };
  const colors: Record<string, string> = { facebook: '#1877F2', x: '#000', linkedin: '#0A66C2', whatsapp: '#25D366', copy: '#6b7280' };

  const isFloating = position === 'floating';
  const flexDir = orientation === 'vertical' ? 'flex-direction:column' : '';
  const posStyle = isFloating ? 'position:fixed;right:16px;top:50%;transform:translateY(-50%);z-index:9999;flex-direction:column' : '';

  let html = `<div style="display:flex;gap:8px;flex-wrap:wrap;${flexDir}${posStyle}">`;

  for (const net of networks) {
    const color = colors[net] || '#621B7A';
    html += `<button
      data-ww-share="${net}"
      style="display:inline-flex;align-items:center;gap:6px;background:${color};color:#fff;
             border:none;border-radius:5px;padding:8px 12px;font-size:13px;font-weight:600;
             cursor:pointer;transition:opacity .2s"
      onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'"
      aria-label="Partager sur ${labels[net] || net}">
      ${labels[net] || net}
    </button>`;
  }
  html += '</div>';

  container.innerHTML = html;

  // Attach click handlers
  container.querySelectorAll('[data-ww-share]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const net = (btn as HTMLElement).dataset.wwShare!;
      if (net === 'copy') {
        navigator.clipboard.writeText(url || location.href).then(() => {
          (btn as HTMLElement).textContent = 'Copié !';
          setTimeout(() => { (btn as HTMLElement).textContent = 'Copier'; }, 2000);
        });
      } else {
        window.open(shareUrls[net]?.(), '_blank', 'width=600,height=400');
      }
    });
  });
}
