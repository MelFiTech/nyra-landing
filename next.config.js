/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }
  
  module.exports = nextConfig