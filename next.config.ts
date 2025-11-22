import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // NOT: 'eslint' ayarı kaldırıldı çünkü Next.js yeni sürümlerinde bu dosya üzerinden desteklenmiyor.
  // Lint kontrolünü devre dışı bırakmak için package.json'daki build komutunu güncelledik.
  
  typescript: {
    // Build sırasında TypeScript hatalarını görmezden gel (Hızlı deploy için)
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;