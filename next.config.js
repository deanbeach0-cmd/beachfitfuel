/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'beachfitfuel.com' },
      { protocol: 'https', hostname: 'images.printify.com' },
      { protocol: 'https', hostname: '**.printify.com' },
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
