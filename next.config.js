/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    minimumCacheTTL: 31536000,
  },
  compress: false,
  poweredByHeader: false,
}

module.exports = nextConfig
