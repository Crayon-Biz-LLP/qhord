/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // In production Docker, NODE_ENV=production and backend is reachable via Docker service name.
    // In local dev, proxy to localhost:4000.
    const apiTarget =
      process.env.NODE_ENV === 'production'
        ? 'http://backend:4000/api'
        : (process.env.API_INTERNAL_BASE_URL || 'http://localhost:4000/api');
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
