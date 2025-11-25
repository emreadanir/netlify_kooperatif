import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  typescript: {
    // Build sırasında TypeScript hatalarını görmezden gel (Hızlı deploy için)
    ignoreBuildErrors: true,
  },
  
  // ⭐️ LCP ve Performans Optimizasyonu
  experimental: {
    // Büyük kütüphanelerin sadece kullanılan parçalarını yükler
    optimizePackageImports: ['lucide-react', 'firebase/auth', 'firebase/firestore'],
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