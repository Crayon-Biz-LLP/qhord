/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // seenode.app (cloud): NEXT_PUBLIC_API_BASE_URL is set to the Render backend URL at build time
    // Docker Compose (self-hosted): no NEXT_PUBLIC_API_BASE_URL, backend reachable via Docker service name
    // Local dev: fall back to localhost:4000
    const apiTarget =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === 'production' ? 'http://backend:4000/api' : null) ||
      process.env.API_INTERNAL_BASE_URL ||
      'http://localhost:4000/api';
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
