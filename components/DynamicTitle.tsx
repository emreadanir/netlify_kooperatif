"use client";

import { useEffect } from 'react';
import { useSiteSettings } from '@/components/SiteContext';

interface DynamicTitleProps {
  pageTitle: string;
}

export default function DynamicTitle({ pageTitle }: DynamicTitleProps) {
  const settings = useSiteSettings();

  useEffect(() => {
    // 1. Öncelik: Panelden girilen "Tarayıcı Başlığı"
    // 2. Öncelik: Panelden girilen "Logo Metni" (Kısa Ad)
    // 3. Öncelik: Varsayılan
    const siteName = settings?.navbar?.browserTitle || settings?.navbar?.logoText || 'ESKKK';
    
    // Tarayıcı başlığını güncelle
    document.title = `${pageTitle} | ${siteName}`;
  }, [pageTitle, settings]);

  return null;
}