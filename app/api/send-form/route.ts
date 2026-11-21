import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { SITE_URL } from '../../lib/cities';

const MAX_BODY_BYTES = 32_768;
const MAX_FORM_TYPE_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 10_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const MAX_TRACKED_IPS = 1_000;

const ALLOWED_FORM_PREFIXES = [
  'Question / Message',
  'Submit an Event',
  'Edit a Listing',
] as const;

const ipRequests = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const forwarded =
    request.headers.get('x-vercel-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for') ||
    '';
  return forwarded.split(',')[0].trim() || 'unknown';
}

function checkRateLimit(ip: string, now: number): {
  limited: boolean;
  retryAfterSeconds: number;
} {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const existing = ipRequests.get(ip) || [];
  const recent = existing.filter((ts) => ts > windowStart);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipRequests.set(ip, recent);
    const oldest = recent[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000)
    );
    return { limited: true, retryAfterSeconds };
  }

  if (!ipRequests.has(ip) && ipRequests.size >= MAX_TRACKED_IPS) {
    for (const [key, timestamps] of ipRequests.entries()) {
      if (timestamps.every((ts) => ts <= windowStart)) {
        ipRequests.delete(key);
      }
    }
    if (ipRequests.size >= MAX_TRACKED_IPS) {
      const oldestKey = ipRequests.keys().next().value;
      if (oldestKey !== undefined) {
        ipRequests.delete(oldestKey);
      }
    }
  }

  recent.push(now);
  ipRequests.set(ip, recent);
  return { limited: false, retryAfterSeconds: 0 };
}

function isAllowedOrigin(request: Request): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site')?.toLowerCase();
  if (secFetchSite === 'cross-site') {
    return false;
  }

  const originHeader = request.headers.get('origin');
  if (!originHeader) {
    return true;
  }

  let originUrl: URL;
  try {
    originUrl = new URL(originHeader);
  } catch {
    return false;
  }

  if (originUrl.protocol !== 'https:' && originUrl.protocol !== 'http:') {
    return false;
  }

  const originHost = originUrl.host.toLowerCase();
  const siteHost = new URL(SITE_URL).host.toLowerCase();
  const bareSiteHost = siteHost.replace(/^www\./, '');
  const requestHost = (
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    ''
  )
    .split(',')[0]
    .trim()
    .toLowerCase();

  if (
    originHost === siteHost ||
    originHost === bareSiteHost ||
    (requestHost && originHost === requestHost)
  ) {
    return true;
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1')
  ) {
    return true;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.EMAIL_RECIPIENT;
    if (!apiKey || !recipientEmail) {
      console.error('Form email environment variables are not configured.');
      return NextResponse.json(
        { success: false, message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden.' },
        { status: 403 }
      );
    }

    const clientIp = getClientIp(request);
    const rate = checkRateLimit(clientIp, Date.now());
    if (rate.limited) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many submissions. Please wait a few minutes and try again.',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfterSeconds) },
        }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return NextResponse.json(
        { success: false, message: 'Unsupported content type.' },
        { status: 415 }
      );
    }

    const contentLengthHeader = request.headers.get('content-length');
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);
      if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
        return NextResponse.json(
          { success: false, message: 'Submission is too large.' },
          { status: 413 }
        );
      }
    }

    const rawText = await request.text();
    if (rawText.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, message: 'Submission is too large.' },
        { status: 413 }
      );
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    if (
      typeof parsedBody !== 'object' ||
      parsedBody === null ||
      Array.isArray(parsedBody)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const body = parsedBody as Record<string, unknown>;

    if (typeof body.hp === 'string' && body.hp.trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Form submitted successfully.',
      });
    }

    const rawFormType = body.formType;
    const rawMessage = body.message;
    if (typeof rawFormType !== 'string' || typeof rawMessage !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please fill out all required fields.' },
        { status: 400 }
      );
    }

    const formType = rawFormType
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const isAllowedFormType =
      formType.length > 0 &&
      formType.length <= MAX_FORM_TYPE_LENGTH &&
      ALLOWED_FORM_PREFIXES.some(
        (prefix) => formType === prefix || formType.startsWith(`${prefix} (`)
      );

    if (!isAllowedFormType) {
      return NextResponse.json(
        { success: false, message: 'Invalid form submission.' },
        { status: 400 }
      );
    }

    const message = rawMessage.replace(/\u0000/g, '').trim();
    if (message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please enter a message under 10,000 characters.',
        },
        { status: 400 }
      );
    }

    const fromAddress =
      process.env.RESEND_FROM_EMAIL ||
      'Someplace Social <onboarding@resend.dev>';

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: recipientEmail,
      subject: `New Form Submission: ${formType}`,
      text: message,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { success: false, message: 'Error sending email.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully.',
    });
  } catch (error) {
    console.error('Error processing form:', error);
    return NextResponse.json(
      { success: false, message: 'Server error.' },
      { status: 500 }
    );
  }
}