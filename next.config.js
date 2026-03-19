/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['he'],
    defaultLocale: 'he',
  },
}

module.exports = nextConfig
