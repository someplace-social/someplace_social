import { ensureExternalUrl } from './utils';

export type TextSegment =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string };

const COMMON_TLDS =
  'co\\.uk|com\\.co|org\\.co|com\\.mx|com\\.au|co\\.nz|com|org|net|edu|gov|io|co|us|uk|ca|de|es|fr|mx|me|tv|fm|gg|ly|ee|gl|app|dev|ai|info|biz|club|events|social|bar|beer|cafe|live|nyc|studio|shop|store|site|online|space|world|today|guide|news|media|blog|page|link|tech';

const EXCLUDED_URL_CHARS = '\\s<>"\'\\u201c\\u201d\\u2018\\u2019';

const TOKEN_REGEX = new RegExp(
  [
    '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    `https?:\\/\\/[^${EXCLUDED_URL_CHARS}]+`,
    `www\\.[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)+(?::\\d+)?(?:[/?#][^${EXCLUDED_URL_CHARS}]*)?`,
    `(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}(?::\\d+)?[/?#][^${EXCLUDED_URL_CHARS}]*`,
    `(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+(?:${COMMON_TLDS})(?::\\d+)?(?!\\.[a-zA-Z0-9])(?![a-zA-Z0-9@/_?#-])`,
  ].join('|'),
  'gi'
);

export function normalizeProveItText(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed.toLowerCase() === 'x') return '';
  return trimmed;
}

function splitTrailingPunctuation(raw: string): { clean: string; trailing: string } {
  let clean = raw;
  let trailing = '';
  while (clean.length > 0) {
    const lastChar = clean[clean.length - 1];
    if (/[.,;:!?'"\u201c\u201d\u2018\u2019\]}>]/.test(lastChar)) {
      trailing = lastChar + trailing;
      clean = clean.slice(0, -1);
      continue;
    }
    if (lastChar === ')') {
      const openParens = (clean.match(/\(/g) || []).length;
      const closeParens = (clean.match(/\)/g) || []).length;
      if (closeParens > openParens) {
        trailing = lastChar + trailing;
        clean = clean.slice(0, -1);
        continue;
      }
    }
    break;
  }
  return { clean, trailing };
}

function appendTextSegment(segments: TextSegment[], text: string) {
  if (!text) return;
  const last = segments[segments.length - 1];
  if (last && last.type === 'text') {
    last.text += text;
  } else {
    segments.push({ type: 'text', text });
  }
}

export function parseTextWithLinks(text: string): TextSegment[] {
  if (!text) return [];
  const segments: TextSegment[] = [];
  let cursor = 0;

  TOKEN_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_REGEX.exec(text)) !== null) {
    const rawMatch = match[0];
    const matchIndex = match.index;
    const isProtocol = /^https?:\/\//i.test(rawMatch);
    const isEmail = !isProtocol && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawMatch);

    if (!isProtocol && !isEmail && matchIndex > 0) {
      const prevChar = text[matchIndex - 1];
      const beforeSlice = text.slice(Math.max(0, matchIndex - 12), matchIndex).toLowerCase();
      if (/[a-zA-Z0-9@/_-]/.test(prevChar) || /(?:javascript|data|vbscript):$/.test(beforeSlice)) {
        continue;
      }
    }

    const { clean, trailing } = isEmail
      ? { clean: rawMatch, trailing: '' }
      : splitTrailingPunctuation(rawMatch);

    const href = isEmail ? `mailto:${clean}` : ensureExternalUrl(clean);
    if (!clean || !href) {
      continue;
    }

    appendTextSegment(segments, text.slice(cursor, matchIndex));
    segments.push({ type: 'link', text: clean, href });
    appendTextSegment(segments, trailing);
    cursor = matchIndex + rawMatch.length;
  }

  appendTextSegment(segments, text.slice(cursor));
  return segments;
}