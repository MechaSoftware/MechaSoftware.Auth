const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'mechasoftware_auth',
  output: 'standalone',
  assetPrefix: isProd ? 'https://cdn.mecha.software/auth/' : undefined,
  poweredByHeader: false,
  experimental: {
    serverActions: true
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/unused/:path*',
          destination: 'https://domain.tld/:path*',
        },
      ],
    }
  },
};

module.exports = nextConfig;