import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';
const isVercel = process.env.VERCEL === '1';
const isVercelPreview = process.env.VERCEL_ENV === 'preview';

const scriptSrcDirectives = [
  "'self'",
  "'unsafe-inline'",
  'https://va.vercel-scripts.com',
  ...(isDev ? ["'unsafe-eval'"] : []),
  ...(isVercelPreview ? ['https://vercel.live'] : []),
];

const connectSrcDirectives = [
  "'self'",
  'https://vitals.vercel-insights.com',
  ...(isVercelPreview ? ['https://vercel.live', 'wss://ws-us3.pusher.com'] : []),
];

const frameSrcDirective = isVercelPreview
  ? "frame-src 'self' https://vercel.live"
  : "frame-src 'none'";

const cspDirectives = [
  "default-src 'self'",
  `script-src ${scriptSrcDirectives.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${connectSrcDirectives.join(' ')}`,
  frameSrcDirective,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isVercel ? ['upgrade-insecure-requests'] : []),
];

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspDirectives.join('; '),
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains',
        },
      ]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/medellin',
        destination: '/medellin-colombia/events',
        permanent: true,
      },
      {
        source: '/medellin-v2',
        destination: '/medellin-colombia/events',
        permanent: true,
      },
      {
        source: '/events/fortcollins-colorado',
        destination: '/fort-collins-colorado/events',
        permanent: true,
      },
      {
        source: '/events/fortcollins-colorado/:path*',
        destination: '/fort-collins-colorado/events/:path*',
        permanent: true,
      },
      {
        source: '/events',
        destination: '/',
        permanent: true,
      },
      {
        source: '/events/:city',
        destination: '/:city/events',
        permanent: true,
      },
      {
        source: '/events/:city/:path*',
        destination: '/:city/events/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;