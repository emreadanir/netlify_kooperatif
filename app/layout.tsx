import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from 'next';
import React from "react";
import FaviconUpdater from "@/components/FaviconUpdater";
import ThemeUpdater from "@/components/ThemeUpdater";
import { SiteProvider } from "@/components/SiteContext"; 

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

async function getSiteSettings() {
  try {
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

// ⭐️ GÜNCELLENMİŞ METADATA (Browser Title Desteği)
export async function generateMetadata(): Promise<Metadata> {
  const { layout } = await getSiteSettings();

  const defaultTitle = "S. S. Nilüfer ESKKK";
  const defaultDesc = "Esnaf ve sanatkarlarımızın finansal ihtiyaçlarına yönelik çözümler sunan kredi kooperatifi resmi web sitesi.";
  const defaultIcon = "/kooperatif_logo.webp"; 

  // 1. Öncelik: Panelden girilen "Tarayıcı Başlığı"
  // 2. Öncelik: Panelden girilen "Logo Metni"
  // 3. Öncelik: Kod içindeki varsayılan (defaultTitle)
  const siteName = layout?.navbar?.browserTitle || layout?.navbar?.logoText || "ESKKK";
  
  // Tam başlık: BrowserTitle varsa onu kullan, yoksa LogoText + SubText kullan
  const fullTitle = layout?.navbar?.browserTitle || (layout?.navbar?.logoText ? `${layout.navbar.logoText} ${layout.navbar.logoSubText || ''}` : defaultTitle);
  
  const dbDesc = layout?.footer?.description || defaultDesc;
  const dbIcon = layout?.navbar?.faviconUrl || defaultIcon;

  const iconType = dbIcon.endsWith('.ico') ? 'image/x-icon' : 
                   dbIcon.endsWith('.svg') ? 'image/svg+xml' : 
                   dbIcon.endsWith('.png') ? 'image/png' : 
                   'image/webp';

  return {
    title: {
      default: fullTitle,
      template: `%s | ${siteName}`
    },
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

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const { theme, layout } = await getSiteSettings();

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
        {serverThemeStyles && (
          <style dangerouslySetInnerHTML={{ __html: serverThemeStyles }} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SiteProvider settings={layout}>
            <FaviconUpdater />
            <ThemeUpdater />
            {children}
        </SiteProvider>
      </body>
    </html>
  );
}