import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    // Optional: same-origin /api in dev (no browser CORS). Set in .env.local:
    //   NEXT_DEV_PROXY_DJANGO_URL=http://127.0.0.1:8000
    //   NEXT_PUBLIC_API_URL=http://localhost:3000/api
    const proxy = process.env.NEXT_DEV_PROXY_DJANGO_URL?.replace(/\/$/, '');
    if (process.env.NODE_ENV === 'development' && proxy) {
      return [{ source: '/api/:path*', destination: `${proxy}/api/:path*` }];
    }
    return [];
  },
};

export default nextConfig;
