export function render(container: HTMLElement, config: any): void {
  const address = config.address || '';
  const placeId = config.placeId || '';
  const zoom = config.zoom || 15;
  const height = config.height || 400;
  const showMarker = config.showMarker !== false;

  let src = '';
  if (placeId) {
    src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyD-placeholder&q=place_id:${placeId}&zoom=${zoom}`;
  } else if (address) {
    src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=m&z=${zoom}&output=embed&iwloc=near`;
  }

  container.innerHTML = `
    <div style="border-radius:8px;overflow:hidden;width:100%;height:${height}px">
      <iframe
        src="${src}"
        width="100%" height="100%"
        style="border:0;display:block"
        allowfullscreen loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Google Maps">
      </iframe>
    </div>`;
}
