import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/medellin',
        destination: '/events/medellin-colombia',
        permanent: true,
      },
      {
        source: '/medellin-v2',
        destination: '/events/medellin-colombia',
        permanent: true,
      },
      {
        source: '/events/fortcollins-colorado',
        destination: '/events/fort-collins-colorado',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;