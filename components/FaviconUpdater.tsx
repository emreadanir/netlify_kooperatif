"use client";

import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '@/lib/firebase';

export default function FaviconUpdater() {
  useEffect(() => {
    if (!db) return;

    // Veritabanındaki ayarları dinle
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'layout');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Eğer veritabanında faviconUrl varsa
        if (data.navbar && data.navbar.faviconUrl) {
          const faviconUrl = data.navbar.faviconUrl;
          
          // Mevcut favicon linkini bul veya oluştur
          let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
          
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          
          // URL'i güncelle
          link.href = faviconUrl;
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null; // Bu bileşen ekranda bir şey göstermez, sadece arkaplanda çalışır
}