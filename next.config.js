/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    deviceSizes: [640, 768, 1024, 1280, 1440],
    domains: ["image.tmdb.org"],
  }
}

module.exports = nextConfig
