export function render(container: HTMLElement, config: any): void {
  const pdfUrl = config.pdfUrl || '';
  const height = config.height || 600;
  const showToolbar = config.showToolbar !== false;

  container.innerHTML = `
    <div style="width:100%;height:${height}px;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
      <iframe
        src="${pdfUrl}${showToolbar ? '' : '#toolbar=0&navpanes=0'}"
        width="100%" height="100%"
        style="border:0;display:block"
        title="Document PDF">
      </iframe>
    </div>`;
}
