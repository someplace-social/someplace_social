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

export function formatTimeRange(
  startTime: string,
  endTime: string
): { start: string; end?: string } {
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

export function getTagStyle(tag: string): { color: string; background: string } {
  const t = (tag || '').trim().toLowerCase();
  if (t.includes('science')) {
    return { color: '#0f5c5c', background: '#d3efec' };
  }
  if (t.includes('craft')) {
    return { color: '#8a3d0c', background: '#fde4cf' };
  }
  if (t.includes('food') || t.includes('drink')) {
    return { color: '#6b5200', background: '#f4eab8' };
  }
  if (t.includes('community') || t.includes('social')) {
    return { color: '#3b4a54', background: '#e1e7ea' };
  }
  if (t.includes('music') || t.includes('bluegrass')) {
    return { color: '#5b2a86', background: '#ecdcf7' };
  }
  if (t.includes('trivia')) {
    return { color: '#2d3f7a', background: '#dde4f7' };
  }
  if (t.includes('open mic') || t.includes('mic') || t.includes('comedy')) {
    return { color: '#8a1f4f', background: '#fbdce9' };
  }
  if (t.includes('dance') || t.includes('salsa') || t.includes('bachata')) {
    return { color: '#852b2b', background: '#f9dede' };
  }
  if (t.includes('sport') || t.includes('fitness') || t.includes('yoga') || t.includes('walk')) {
    return { color: '#1f6a42', background: '#d7f0df' };
  }
  if (t.includes('language') || t.includes('english') || t.includes('spanish')) {
    return { color: '#2c4f7c', background: '#dbe5f7' };
  }
  return { color: '#4f483e', background: '#f3ead4' };
}