"use client";

import React, { createContext, useContext } from 'react';

// Context oluşturuyoruz
const SiteContext = createContext<any>(null);

// Provider bileşeni: Veriyi sarmaladığı bileşenlere aktarır
export function SiteProvider({ children, settings }: { children: React.ReactNode, settings: any }) {
  return (
    <SiteContext.Provider value={settings}>
      {children}
    </SiteContext.Provider>
  );
}

// Veriyi kullanmak için hook
export function useSiteSettings() {
  return useContext(SiteContext);
}