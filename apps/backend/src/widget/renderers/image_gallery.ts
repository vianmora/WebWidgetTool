export function render(container: HTMLElement, config: any): void {
  const images: Array<{ url: string; caption?: string }> = config.images || [];
  const layout = config.layout || 'grid';
  const columns = config.columns || 3;
  const lightbox = config.lightbox !== false;
  const uid = 'ww-ig-' + Math.random().toString(36).slice(2);

  const gridStyle = `display:grid;grid-template-columns:repeat(${columns},1fr);gap:8px`;
  const carouselStyle = `display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory`;

  let html = `<div id="${uid}" style="${layout === 'carousel' ? carouselStyle : gridStyle}">`;
  images.forEach((img, i) => {
    html += `
      <div style="${layout === 'carousel' ? 'flex-shrink:0;scroll-snap-align:start;width:280px' : ''}position:relative;overflow:hidden;border-radius:6px;cursor:${lightbox ? 'pointer' : 'default'};aspect-ratio:1"
           ${lightbox ? `data-ww-lb="${i}"` : ''}>
        <img src="${img.url}" alt="${img.caption || ''}"
             style="width:100%;height:100%;object-fit:cover;transition:transform .3s"
             onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform=''">
        ${img.caption ? `<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.6);color:#fff;font-size:11px;padding:6px 8px">${img.caption}</div>` : ''}
      </div>`;
  });
  html += '</div>';

  if (lightbox) {
    html += `
      <div id="${uid}-lb" style="display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.9);
           align-items:center;justify-content:center;flex-direction:column;gap:16px" role="dialog">
        <button id="${uid}-lb-close" style="position:absolute;top:16px;right:24px;background:none;border:none;
          color:#fff;font-size:32px;cursor:pointer;line-height:1">×</button>
        <img id="${uid}-lb-img" src="" alt="" style="max-width:90vw;max-height:80vh;object-fit:contain;border-radius:6px">
        <p id="${uid}-lb-cap" style="color:#fff;font-size:13px;text-align:center"></p>
        <div style="display:flex;gap:16px">
          <button id="${uid}-lb-prev" style="background:#fff3;border:none;color:#fff;font-size:24px;padding:8px 16px;border-radius:5px;cursor:pointer">‹</button>
          <button id="${uid}-lb-next" style="background:#fff3;border:none;color:#fff;font-size:24px;padding:8px 16px;border-radius:5px;cursor:pointer">›</button>
        </div>
      </div>`;
  }

  container.innerHTML = html;

  if (lightbox && images.length) {
    const lb = document.getElementById(`${uid}-lb`)!;
    const lbImg = document.getElementById(`${uid}-lb-img`) as HTMLImageElement;
    const lbCap = document.getElementById(`${uid}-lb-cap`)!;
    let current = 0;

    const show = (i: number) => {
      current = (i + images.length) % images.length;
      lbImg.src = images[current].url;
      lbCap.textContent = images[current].caption || '';
      lb.style.display = 'flex';
    };

    container.querySelectorAll('[data-ww-lb]').forEach(el => {
      el.addEventListener('click', () => show(parseInt((el as HTMLElement).dataset.wwLb!)));
    });
    document.getElementById(`${uid}-lb-close`)!.addEventListener('click', () => { lb.style.display = 'none'; });
    document.getElementById(`${uid}-lb-prev`)!.addEventListener('click', () => show(current - 1));
    document.getElementById(`${uid}-lb-next`)!.addEventListener('click', () => show(current + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.style.display = 'none'; });
  }
}
