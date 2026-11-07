import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/medellin-v2',
        destination: '/events/medellin-colombia',
        permanent: false,
      },
      {
        source: '/events/fortcollins-colorado',
        destination: '/events/fort-collins-colorado',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;