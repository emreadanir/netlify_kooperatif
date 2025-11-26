import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from 'next';
import React from "react";
import FaviconUpdater from "@/components/FaviconUpdater";
import ThemeUpdater from "@/components/ThemeUpdater";

// Firebase importları
import { db, appId } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Sayfanın statik (cache) olarak değil, her istekte dinamik sunulmasını sağlar.
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

// --- VERİ ÇEKME FONKSİYONLARI ---

// Tema ve Layout ayarlarını sunucu tarafında çeken yardımcı fonksiyon
async function getSiteSettings() {
  try {
    // Paralel olarak hem tema hem de layout (favicon/başlık) verilerini çekiyoruz
    const [themeSnap, layoutSnap] = await Promise.all([
      getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'theme')),
      getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'layout'))
    ]);

    return {
      theme: themeSnap.exists() ? themeSnap.data() : null,
      layout: layoutSnap.exists() ? layoutSnap.data() : null
    };
  } catch (error) {
    console.error("Sunucu tarafında site ayarları çekilemedi:", error);
    return { theme: null, layout: null };
  }
}

// ⭐️ DİNAMİK METADATA (Favicon Sorununun Çözümü)
// Bu fonksiyon sayfa oluşturulurken çalışır ve doğru favicon/başlığı HTML'e gömer.
export async function generateMetadata(): Promise<Metadata> {
  const { layout } = await getSiteSettings();

  // Varsayılan değerler
  const defaultTitle = "S. S. Nilüfer İlçesi Esnaf ve Sanatkarlar Kredi ve Kefalet Kooperatifi";
  const defaultDesc = "Esnaf ve sanatkarlarımızın finansal ihtiyaçlarına yönelik çözümler sunan kredi kooperatifi resmi web sitesi.";
  const defaultIcon = "/kooperatif_logo.webp"; 

  // Veritabanından gelen veriler (varsa)
  const dbTitle = layout?.navbar?.logoText ? `${layout.navbar.logoText} ${layout.navbar.logoSubText || ''}` : defaultTitle;
  const dbDesc = layout?.footer?.description || defaultDesc;
  const dbIcon = layout?.navbar?.faviconUrl || defaultIcon;

  // İkon türünü dosya uzantısına göre belirle (Browser'a ipucu vermek için)
  // Bu, tarayıcının doğru dosyayı tanımasına yardımcı olur ve önbellek sorunlarını azaltır.
  const iconType = dbIcon.endsWith('.ico') ? 'image/x-icon' : 
                   dbIcon.endsWith('.svg') ? 'image/svg+xml' : 
                   dbIcon.endsWith('.png') ? 'image/png' : 
                   'image/webp'; // Varsayılan webp kabul ediyoruz

  return {
    title: dbTitle,
    description: dbDesc,
    icons: {
      icon: { url: dbIcon, type: iconType },
      shortcut: { url: dbIcon, type: iconType },
      apple: { url: dbIcon, type: iconType },
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode; 
}

// Async Server Component
export default async function RootLayout({
  children,
}: RootLayoutProps) {
  // Tema verisini (CSS değişkenleri için) alıyoruz
  const { theme } = await getSiteSettings();

  // CSS değişkenlerini oluştur
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
        {/* Sunucu tarafında oluşturulan stilleri (Renkler) en başa ekliyoruz */}
        {serverThemeStyles && (
          <style dangerouslySetInnerHTML={{ __html: serverThemeStyles }} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* İstemci tarafı güncellemeleri için bileşenler çalışmaya devam eder */}
        <FaviconUpdater />
        <ThemeUpdater />
        
        {children}
      </body>
    </html>
  );
}