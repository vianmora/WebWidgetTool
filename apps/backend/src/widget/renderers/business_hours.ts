const DAY_NAMES_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

interface DayHours { day: number; open: string; close: string; closed?: boolean }

export function render(container: HTMLElement, config: any): void {
  const hours: DayHours[] = config.hours || [];
  const timezone: string = config.timezone || 'Europe/Paris';
  const openLabel = config.openLabel || 'Ouvert';
  const closedLabel = config.closedLabel || 'Fermé';
  const accent = config.accentColor || '#621B7A';
  const theme = config.theme || 'light';
  const isDark = theme === 'dark';
  const bg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1D1E18';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  // Determine if currently open
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todayHours = hours.find(h => h.day === currentDay);
  const isOpen = todayHours && !todayHours.closed && currentTime >= todayHours.open && currentTime < todayHours.close;

  const statusColor = isOpen ? '#16a34a' : '#dc2626';
  const statusText = isOpen ? openLabel : closedLabel;

  let html = `<div style="background:${bg};border-radius:8px;overflow:hidden;border:1px solid ${borderColor}">
    <div style="padding:16px;border-bottom:1px solid ${borderColor};display:flex;align-items:center;justify-content:space-between">
      <span style="font-weight:700;color:${textColor};font-size:15px">Horaires</span>
      <span style="background:${statusColor}20;color:${statusColor};border-radius:4px;padding:3px 10px;font-size:12px;font-weight:600">${statusText}</span>
    </div>
    <div>`;

  const orderedDays = [1, 2, 3, 4, 5, 6, 0]; // Lun → Dim
  for (const dayNum of orderedDays) {
    const entry = hours.find(h => h.day === dayNum);
    const isToday = dayNum === currentDay;
    const rowBg = isToday ? (isDark ? '#374151' : '#f9fafb') : 'transparent';
    html += `
      <div style="display:flex;justify-content:space-between;padding:10px 16px;background:${rowBg};border-bottom:1px solid ${borderColor}">
        <span style="color:${textColor};font-size:13px;font-weight:${isToday ? '700' : '400'}">${DAY_NAMES_FR[dayNum]}</span>
        <span style="color:${entry && !entry.closed ? textColor : '#9ca3af'};font-size:13px">
          ${entry && !entry.closed ? `${entry.open} – ${entry.close}` : closedLabel}
        </span>
      </div>`;
  }

  html += '</div></div>';
  container.innerHTML = html;
}
