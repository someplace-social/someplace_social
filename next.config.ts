import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
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