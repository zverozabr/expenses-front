/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14+ использует app directory по умолчанию
  // experimental: {
  //   appDir: true,
  // },

  // Prevent caching for Telegram WebApp pages
  // This duplicates middleware.ts headers as a fallback
  async headers() {
    return [
      {
        source: '/edit/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
