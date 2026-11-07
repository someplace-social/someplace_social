export function parseHour(timeStr: string): number {
  if (!timeStr) return 18;
  const cleaned = timeStr.trim().toLowerCase();

  const match = cleaned.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const meridian = match[3];

    if (meridian) {
      const isPm = meridian.startsWith('p');
      const isAm = meridian.startsWith('a');
      if (isPm && hour < 12) hour += 12;
      if (isAm && hour === 12) hour = 0;
    } else {
      if (hour >= 1 && hour <= 6) {
        hour += 12;
      }
    }
    return hour + minute / 60;
  }

  const numMatch = cleaned.match(/\d+/);
  return numMatch ? parseInt(numMatch[0], 10) : 18;
}

export function formatTimeLabel(timeStr: string): string {
  if (!timeStr) return '';
  const cleaned = timeStr.trim();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/i);
  if (match) {
    const hour = match[1];
    const minute = match[2] && match[2] !== '00' ? `:${match[2]}` : '';
    const meridian = (match[3] || 'p').toLowerCase().startsWith('a') ? 'a' : 'p';
    return `${hour}${minute}${meridian}`;
  }
  return cleaned;
}

export function formatTimeRange(startTime: string, endTime: string): { start: string; end?: string } {
  const start = formatTimeLabel(startTime);
  const end = endTime ? formatTimeLabel(endTime) : undefined;
  return { start, end };
}

export function isFreePrice(price: string): boolean {
  if (!price) return true;
  const p = price.trim().toLowerCase();
  return p.startsWith('free') || p.startsWith('gratis') || p === '0' || p === '$0';
}

export function matchesDay(eventDays: string, targetDayName: string): boolean {
  if (!eventDays || !targetDayName) return false;
  return eventDays.toLowerCase().includes(targetDayName.toLowerCase());
}

export function ensureExternalUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}