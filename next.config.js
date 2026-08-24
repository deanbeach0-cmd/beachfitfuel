/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'beachfitfuel.com' },
      { protocol: 'https', hostname: 'www.beachfitfuel.com' },
      { protocol: 'https', hostname: '**.square.site' },
      { protocol: 'https', hostname: '**.squareup.com' },
      { protocol: 'https', hostname: '**.squarespace.com' },
      { protocol: 'https', hostname: 'items-images-production.s3.us-west-2.amazonaws.com' },
      { protocol: 'https', hostname: 'files.cdn.printful.com' },
      { protocol: 'https', hostname: '**.cdn.printful.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // Square SDK uses BigInt — keep it server-only, never bundle for client
  // (Next.js 14 uses experimental.serverComponentsExternalPackages)
  experimental: {
    serverComponentsExternalPackages: ['square'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias['square'] = false
    }
    return config
  },
}

module.exports = nextConfig
