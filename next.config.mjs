/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./lib/generated/prisma/**', './node_modules/.prisma/**'],
    '/*': ['./lib/generated/prisma/**', './node_modules/.prisma/**'],
  },
};

export default nextConfig;
