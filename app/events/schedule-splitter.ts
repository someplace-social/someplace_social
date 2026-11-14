import type { Event } from '../lib/google-sheets';

const ORDERED_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const DAILY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const DAY_TOKEN_TO_SHORT: Record<string, string> = {
  sun: 'Sun',
  sunday: 'Sun',
  sundays: 'Sun',
  mon: 'Mon',
  monday: 'Mon',
  mondays: 'Mon',
  tue: 'Tue',
  tues: 'Tue',
  tuesday: 'Tue',
  tuesdays: 'Tue',
  wed: 'Wed',
  weds: 'Wed',
  wednesday: 'Wed',
  wednesdays: 'Wed',
  thu: 'Thu',
  thur: 'Thu',
  thurs: 'Thu',
  thursday: 'Thu',
  thursdays: 'Thu',
  fri: 'Fri',
  friday: 'Fri',
  fridays: 'Fri',
  sat: 'Sat',
  saturday: 'Sat',
  saturdays: 'Sat',
};

type ScheduleSpec = {
  isDayMapped: boolean;
  byDay: Map<string, string>;
  unlabeled: string[];
};

function expandDayRange(startDay: string, endDay: string): string[] | null {
  const startIdx = ORDERED_DAYS.indexOf(startDay as (typeof ORDERED_DAYS)[number]);
  const endIdx = ORDERED_DAYS.indexOf(endDay as (typeof ORDERED_DAYS)[number]);
  if (startIdx === -1 || endIdx === -1) return null;
  const result: string[] = [];
  if (startIdx <= endIdx) {
    for (let i = startIdx; i <= endIdx; i++) {
      result.push(ORDERED_DAYS[i]);
    }
  } else {
    for (let i = startIdx; i < ORDERED_DAYS.length; i++) {
      result.push(ORDERED_DAYS[i]);
    }
    for (let i = 0; i <= endIdx; i++) {
      result.push(ORDERED_DAYS[i]);
    }
  }
  return result;
}

function parseDaysExpression(expr: string): string[] | null {
  const trimmed = (expr || '').trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower === 'daily' || lower === 'everyday' || lower === 'every day') {
    return [...DAILY_DAYS];
  }
  const parts = trimmed
    .split(/\s*(?:,|&|\band\b)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  const days: string[] = [];
  for (const part of parts) {
    const rangeMatch = part.match(/^([a-zA-Z]+)\s*(?:[\u2013\u2014\-]|\bto\b)\s*([a-zA-Z]+)$/i);
    if (rangeMatch) {
      const startShort = DAY_TOKEN_TO_SHORT[rangeMatch[1].toLowerCase()];
      const endShort = DAY_TOKEN_TO_SHORT[rangeMatch[2].toLowerCase()];
      if (!startShort || !endShort) return null;
      const expanded = expandDayRange(startShort, endShort);
      if (!expanded) return null;
      for (const d of expanded) {
        if (!days.includes(d)) days.push(d);
      }
      continue;
    }
    const short = DAY_TOKEN_TO_SHORT[part.toLowerCase()];
    if (!short) return null;
    if (!days.includes(short)) {
      days.push(short);
    }
  }
  return days.length > 0 ? days : null;
}

function splitOutsideParens(input: string, delimiters: Set<string>): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '(') {
      depth++;
      current += ch;
    } else if (ch === ')') {
      depth = Math.max(0, depth - 1);
      current += ch;
    } else if (depth === 0 && delimiters.has(ch)) {
      const trimmed = current.trim();
      if (trimmed) parts.push(trimmed);
      current = '';
    } else {
      current += ch;
    }
  }
  const tail = current.trim();
  if (tail) parts.push(tail);
  return parts;
}

function isTimeLike(str: string): boolean {
  return /^\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|a|p)?$/i.test(str.trim());
}

function segmentHasDayAnnotation(seg: string): boolean {
  const parenMatch = seg.match(/\(([^)]+)\)/);
  if (parenMatch && parseDaysExpression(parenMatch[1])) {
    return true;
  }
  const colonMatch = seg.match(/^(.+?)\s*:\s*(.+)$/);
  if (colonMatch && parseDaysExpression(colonMatch[1]) && /\d/.test(colonMatch[2])) {
    return true;
  }
  const leadMatch = seg.match(
    /^([a-zA-Z,\s&/-]+?)\s+(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|a|p)?)$/i
  );
  if (leadMatch && parseDaysExpression(leadMatch[1])) {
    return true;
  }
  const trailMatch = seg.match(
    /^(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|a|p)?)\s+([a-zA-Z,\s&/-]+)$/i
  );
  if (trailMatch && parseDaysExpression(trailMatch[2])) {
    return true;
  }
  return false;
}

function parseScheduleSpec(raw: string): ScheduleSpec {
  const trimmed = (raw || '').trim();
  const byDay = new Map<string, string>();
  const unlabeled: string[] = [];
  if (!trimmed) {
    return { isDayMapped: false, byDay, unlabeled };
  }
  const primaryChunks = splitOutsideParens(trimmed, new Set(['/', ';', '|']));
  const segments: string[] = [];
  for (const chunk of primaryChunks) {
    const subChunks = splitOutsideParens(chunk, new Set([',', '&']));
    if (
      subChunks.length > 1 &&
      subChunks.every((s) => segmentHasDayAnnotation(s) || isTimeLike(s))
    ) {
      segments.push(...subChunks);
    } else {
      segments.push(chunk);
    }
  }
  let isDayMapped = false;
  for (const seg of segments) {
    const parenMatch = seg.match(/\(([^)]+)\)/);
    if (parenMatch) {
      const days = parseDaysExpression(parenMatch[1]);
      if (days && days.length > 0) {
        const timeVal = seg
          .replace(parenMatch[0], '')
          .replace(/^[\s:,-]+|[\s:,-]+$/g, '')
          .trim();
        for (const d of days) {
          byDay.set(d, timeVal);
        }
        isDayMapped = true;
        continue;
      }
    }
    const colonMatch = seg.match(/^(.+?)\s*:\s*(.+)$/);
    if (colonMatch) {
      const days = parseDaysExpression(colonMatch[1]);
      if (days && /\d/.test(colonMatch[2])) {
        const timeVal = colonMatch[2].trim();
        for (const d of days) {
          byDay.set(d, timeVal);
        }
        isDayMapped = true;
        continue;
      }
    }
    const leadMatch = seg.match(
      /^([a-zA-Z,\s&/-]+?)\s+(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|a|p)?)$/i
    );
    if (leadMatch) {
      const days = parseDaysExpression(leadMatch[1]);
      if (days) {
        const timeVal = leadMatch[2].trim();
        for (const d of days) {
          byDay.set(d, timeVal);
        }
        isDayMapped = true;
        continue;
      }
    }
    const trailMatch = seg.match(
      /^(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|a|p)?)\s+([a-zA-Z,\s&/-]+)$/i
    );
    if (trailMatch) {
      const days = parseDaysExpression(trailMatch[2]);
      if (days) {
        const timeVal = trailMatch[1].trim();
        for (const d of days) {
          byDay.set(d, timeVal);
        }
        isDayMapped = true;
        continue;
      }
    }
    unlabeled.push(seg.trim());
  }
  return { isDayMapped, byDay, unlabeled };
}

export function expandEventSchedules(event: Event): Event[] {
  const startSpec = parseScheduleSpec(event.startTime);
  const endSpec = parseScheduleSpec(event.endTime);
  const hasDayMapped = startSpec.isDayMapped || endSpec.isDayMapped;
  const hasMultiUnlabeled =
    startSpec.unlabeled.length > 1 || endSpec.unlabeled.length > 1;
  if (!hasDayMapped && !hasMultiUnlabeled) {
    return [event];
  }
  const parsedDays = parseDaysExpression(event.dayOfWeek || '');
  if (hasDayMapped) {
    const targetDays: string[] =
      parsedDays && parsedDays.length > 0
        ? parsedDays
        : Array.from(new Set([...startSpec.byDay.keys(), ...endSpec.byDay.keys()]));
    if (targetDays.length === 0) {
      return [event];
    }
    return targetDays.map((day, idx) => {
      let resolvedStart: string;
      if (startSpec.isDayMapped) {
        resolvedStart =
          startSpec.byDay.get(day) ??
          (startSpec.unlabeled.length === 1 ? startSpec.unlabeled[0] : '');
      } else if (startSpec.unlabeled.length === targetDays.length) {
        resolvedStart = startSpec.unlabeled[idx];
      } else {
        resolvedStart = startSpec.unlabeled[0] ?? event.startTime;
      }

      let resolvedEnd: string;
      if (endSpec.isDayMapped) {
        resolvedEnd =
          endSpec.byDay.get(day) ??
          (endSpec.unlabeled.length === 1 ? endSpec.unlabeled[0] : '');
      } else if (endSpec.unlabeled.length === targetDays.length) {
        resolvedEnd = endSpec.unlabeled[idx];
      } else {
        resolvedEnd = endSpec.unlabeled[0] ?? event.endTime;
      }

      const splitId =
        targetDays.length > 1 && event.id
          ? `${event.id}-${day.toLowerCase()}`
          : event.id;

      return {
        ...event,
        id: splitId,
        dayOfWeek: day,
        startTime: resolvedStart,
        endTime: resolvedEnd,
      };
    });
  }
  const slotCount = Math.max(startSpec.unlabeled.length, endSpec.unlabeled.length);
  if (parsedDays && parsedDays.length === slotCount) {
    return parsedDays.map((day, idx) => ({
      ...event,
      id: event.id ? `${event.id}-${day.toLowerCase()}` : event.id,
      dayOfWeek: day,
      startTime: startSpec.unlabeled[idx] ?? startSpec.unlabeled[0] ?? '',
      endTime: endSpec.unlabeled[idx] ?? endSpec.unlabeled[0] ?? '',
    }));
  }
  if (parsedDays && parsedDays.length === 1) {
    const day = parsedDays[0];
    return Array.from({ length: slotCount }, (_, idx) => ({
      ...event,
      id: event.id ? `${event.id}-${day.toLowerCase()}-${idx + 1}` : event.id,
      dayOfWeek: day,
      startTime: startSpec.unlabeled[idx] ?? startSpec.unlabeled[0] ?? '',
      endTime: endSpec.unlabeled[idx] ?? endSpec.unlabeled[0] ?? '',
    }));
  }
  return [event];
}