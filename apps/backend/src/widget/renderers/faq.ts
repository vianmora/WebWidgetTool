export function render(container: HTMLElement, config: any): void {
  const items: Array<{ question: string; answer: string }> = config.items || [];
  const allowMultiple: boolean = config.allowMultiple ?? false;
  const defaultOpen: number = config.defaultOpen ?? -1;
  const accent = config.accentColor || '#621B7A';
  const theme = config.theme || 'light';
  const isDark = theme === 'dark';
  const bg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1D1E18';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const uid = 'ww-faq-' + Math.random().toString(36).slice(2);

  let html = `<div id="${uid}" style="background:${bg};border-radius:8px;overflow:hidden;border:1px solid ${borderColor}">`;
  items.forEach((item, i) => {
    const isOpen = i === defaultOpen;
    html += `
      <div style="border-bottom:1px solid ${borderColor}">
        <button data-faq="${i}" style="width:100%;text-align:left;padding:16px;background:none;border:none;
          cursor:pointer;display:flex;justify-content:space-between;align-items:center;
          color:${textColor};font-size:14px;font-weight:600;gap:12px"
          aria-expanded="${isOpen}">
          <span>${item.question}</span>
          <span data-faq-icon="${i}" style="font-size:18px;color:${accent};transition:transform .2s;transform:${isOpen ? 'rotate(45deg)' : 'none'};flex-shrink:0">+</span>
        </button>
        <div data-faq-panel="${i}" style="max-height:${isOpen ? '1000px' : '0'};overflow:hidden;transition:max-height .3s ease">
          <div style="padding:0 16px 16px;color:${isDark ? '#d1d5db' : '#4b5563'};font-size:13px;line-height:1.6">${item.answer}</div>
        </div>
      </div>`;
  });
  html += '</div>';
  container.innerHTML = html;

  // Accordion logic
  const root = container.querySelector(`#${uid}`)!;
  root.querySelectorAll('[data-faq]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = (btn as HTMLElement).dataset.faq!;
      const panel = root.querySelector(`[data-faq-panel="${idx}"]`) as HTMLElement;
      const icon = root.querySelector(`[data-faq-icon="${idx}"]`) as HTMLElement;
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      if (!allowMultiple) {
        root.querySelectorAll('[data-faq-panel]').forEach(p => { (p as HTMLElement).style.maxHeight = '0'; });
        root.querySelectorAll('[data-faq-icon]').forEach(ic => { (ic as HTMLElement).style.transform = 'none'; });
        root.querySelectorAll('[data-faq]').forEach(b => b.setAttribute('aria-expanded', 'false'));
      }

      if (!isExpanded) {
        panel.style.maxHeight = '1000px';
        icon.style.transform = 'rotate(45deg)';
        btn.setAttribute('aria-expanded', 'true');
      } else {
        panel.style.maxHeight = '0';
        icon.style.transform = 'none';
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });
}
