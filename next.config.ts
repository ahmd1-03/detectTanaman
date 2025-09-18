import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ✅ Biar build tetap jalan walau ada error TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Biar build tetap jalan walau ada error ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Konfigurasi domain gambar eksternal
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
