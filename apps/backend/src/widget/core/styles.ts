export function injectStyles(css: string, id: string): void {
  if (document.getElementById(`ww-styles-${id}`)) return;
  const style = document.createElement('style');
  style.id = `ww-styles-${id}`;
  style.textContent = css;
  document.head.appendChild(style);
}

export const BASE_CSS = `
  .ww-widget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; box-sizing: border-box; }
  .ww-widget *, .ww-widget *::before, .ww-widget *::after { box-sizing: inherit; }
  .ww-widget a { color: inherit; }
  .ww-stars { display: inline-flex; gap: 2px; }
  .ww-star { color: #f59e0b; font-size: 16px; }
  .ww-star.empty { color: #d1d5db; }
  .ww-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .ww-powered-by { text-align: center; padding: 8px; font-size: 11px; color: #9ca3af; margin-top: 8px; }
  .ww-powered-by a { color: #621B7A; text-decoration: none; font-weight: 600; }
  .ww-quota-banner { background: #fef3c7; border: 1px solid #f59e0b; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #92400e; text-align: center; margin-bottom: 8px; }
`;

export function renderStars(rating: number): string {
  const full = Math.round(rating);
  let html = '<span class="ww-stars" aria-label="' + rating + ' étoiles">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="ww-star${i > full ? ' empty' : ''}">★</span>`;
  }
  return html + '</span>';
}
