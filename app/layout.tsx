import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from 'next';
import React from "react";
import FaviconUpdater from "@/components/FaviconUpdater";
import ThemeUpdater from "@/components/ThemeUpdater";

// Font tanımlamaları - LCP Optimizasyonu için 'swap' eklendi
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // ⭐️ ÖNEMLİ: Font yüklenene kadar sistem fontunu gösterir (LCP iyileştirmesi)
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // ⭐️ ÖNEMLİ
});

export const metadata: Metadata = {
  title: "S. S. Nilüfer İlçesi Esnaf ve Sanatkarlar Kredi ve Kefalet Kooperatifi",
  description: "Esnaf ve sanatkarlarımızın finansal ihtiyaçlarına yönelik çözümler sunan kredi kooperatifi resmi web sitesi.",
  icons: {
    icon: '/kooperatif_logo.webp', 
  },
};

interface RootLayoutProps {
  children: React.ReactNode; 
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Temaları ve Favicon'u yöneten bileşenler */}
        <FaviconUpdater />
        <ThemeUpdater />
        
        {children}
      </body>
    </html>
  );
}