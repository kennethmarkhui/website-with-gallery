/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  },
  images: {
    domains: ['res.cloudinary.com'],
    imageSizes: [128],
    deviceSizes: [320, 640, 1080, 2048, 3840],
  },
}

module.exports = nextConfig
