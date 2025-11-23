"use client";

import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '@/lib/firebase';

// Varsayılan değerler (Firestore'da veri yoksa veya yüklenirken)
const DEFAULT_THEME = {
  primary: '#4f46e5',
  secondary: '#d97706',
  background: '#0f172a',
  foreground: '#f1f5f9',
  accent: '#06b6d4',
};

export default function ThemeUpdater() {
  useEffect(() => {
    if (!db) return;

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'theme');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const theme = docSnap.data();
        const root = document.documentElement;

        // CSS Değişkenlerini Güncelle
        if (theme.primary) root.style.setProperty('--primary', theme.primary);
        if (theme.secondary) root.style.setProperty('--secondary', theme.secondary);
        if (theme.background) root.style.setProperty('--background', theme.background);
        if (theme.foreground) root.style.setProperty('--foreground', theme.foreground);
        if (theme.accent) root.style.setProperty('--accent', theme.accent);
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}