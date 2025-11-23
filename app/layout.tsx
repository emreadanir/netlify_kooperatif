import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from 'next';
import React from "react";
import FaviconUpdater from "@/components/FaviconUpdater"; // ⭐️ YENİ

// Font tanımlamaları
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S. S. Nilüfer İlçesi Esnaf ve Sanatkarlar Kredi ve Kefalet Kooperatifi",
  description: "Esnaf ve sanatkarlarımızın finansal ihtiyaçlarına yönelik çözümler sunan kredi kooperatifi resmi web sitesi.",
  icons: {
    icon: '/kooperatif_logo.webp', // Varsayılan olarak logoyu ayarla
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
        {/* ⭐️ Favicon Güncelleyiciyi Buraya Ekliyoruz */}
        <FaviconUpdater />
        
        {children}
      </body>
    </html>
  );
}