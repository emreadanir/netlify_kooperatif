import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from 'next';
import React from "react";
import FaviconUpdater from "@/components/FaviconUpdater";
import ThemeUpdater from "@/components/ThemeUpdater";

// Firebase importları (Sunucu tarafında veri çekmek için)
import { db, appId } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// ⭐️ KRİTİK EKLEME: Sayfanın statik (cache) olarak değil, her istekte dinamik sunulmasını sağlar.
// Netlify'da eski renklerin gelmesini (caching) engeller.
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "S. S. Nilüfer İlçesi Esnaf ve Sanatkarlar Kredi ve Kefalet Kooperatifi",
  description: "Esnaf ve sanatkarlarımızın finansal ihtiyaçlarına yönelik çözümler sunan kredi kooperatifi resmi web sitesi.",
  icons: {
    icon: '/kooperatif_logo.webp', 
  },
};

// Sunucu tarafında tema verisini çeken fonksiyon
async function getThemeData() {
  try {
    // Not: Sunucu tarafında 'window' olmadığı için appId lib/firebase.ts içindeki
    // varsayılan değere ('kooperatif-v1') düşecektir.
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'theme');
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return snapshot.data();
    }
  } catch (error) {
    console.error("Sunucu tarafında tema çekilemedi:", error);
  }
  return null;
}

interface RootLayoutProps {
  children: React.ReactNode; 
}

// Async Server Component
export default async function RootLayout({
  children,
}: RootLayoutProps) {
  // Veriyi sunucuda bekle ve çek
  const theme = await getThemeData();

  // Eğer tema varsa CSS değişkenlerini oluştur
  const serverThemeStyles = theme ? `
    :root {
      --primary: ${theme.primary};
      --secondary: ${theme.secondary};
      --background: ${theme.background};
      --foreground: ${theme.foreground};
      --accent: ${theme.accent};
    }
  ` : '';

  return (
    <html lang="tr">
      <head>
        {/* Sunucu tarafında oluşturulan stilleri en başa ekliyoruz */}
        {serverThemeStyles && (
          <style dangerouslySetInnerHTML={{ __html: serverThemeStyles }} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FaviconUpdater />
        <ThemeUpdater />
        
        {children}
      </body>
    </html>
  );
}