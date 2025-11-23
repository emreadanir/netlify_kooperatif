"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X, CreditCard, ChevronDown, Calculator, Search } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '@/lib/firebase';

interface SubMenuItem {
    name: string;
    href: string;
}

interface MenuItem {
    id: string;
    name: string;
    href: string;
    subItems: SubMenuItem[];
}

interface NavbarSettings {
  logoUrl: string;
  logoText: string;
  logoSubText: string;
  menuItems: MenuItem[];
}

const DEFAULT_NAVBAR: NavbarSettings = {
    logoUrl: '/kooperatif_logo.webp',
    logoText: 'S. S. NİLÜFER İLÇESİ',
    logoSubText: 'ESNAF VE SANATKARLAR KREDİ VE KEFALET KOOPERATİFİ',
    menuItems: [
      { id: '1', name: 'Anasayfa', href: '/', subItems: [] },
      { id: '2', name: 'Kredi Koşulları', href: '#', subItems: [
          { name: 'Kredi Çeşitleri', href: '/kredi-cesitleri' },
          { name: 'Kredi Kullanım Şartları', href: '/kredi-kullanim-sartlari' },
          { name: 'Faiz Oranı', href: '/faiz-orani' }
        ] 
      },
      { id: '3', name: 'Kanun ve Yönetmelikler', href: '/kanun-ve-yonetmelikler', subItems: [] },
      { id: '4', name: 'Kadromuz', href: '#', subItems: [
          { name: 'Yönetim Kurulu', href: '/yonetim-kurulu' },
          { name: 'Denetim Kurulu', href: '/denetim-kurulu' },
          { name: 'Personel Kadrosu', href: '/personel-kadrosu' }
        ] 
      },
      { id: '5', name: 'İletişim', href: '/iletisim', subItems: [] },
    ]
};

const Navbar: React.FC = () => {
  const [settings, setSettings] = useState<NavbarSettings>(DEFAULT_NAVBAR);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isOnlineMobileOpen, setIsOnlineMobileOpen] = useState<boolean>(false);

  // Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Firestore Realtime Data Fetch
  useEffect(() => {
    if (!db) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'layout');
    
    // ⭐️ Realtime dinleyici: Admin panelinden değişince anlık güncellenir
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.navbar) {
                setSettings(data.navbar as NavbarSettings);
            }
        }
    });

    return () => unsubscribe();
  }, []);

  const closeMenu = useCallback((): void => {
    setIsMenuOpen(false);
    setOpenMobileSubmenu(null);
    setIsOnlineMobileOpen(false);
  }, []);

  const toggleMobileSubmenu = useCallback((name: string): void => {
    setOpenMobileSubmenu(prev => prev === name ? null : name);
  }, []);

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 border-b border-transparent ${
        scrolled || isMenuOpen 
          ? 'bg-[#0f172a]/80 backdrop-blur-xl border-slate-800/50 shadow-lg shadow-black/20' 
          : 'bg-transparent' 
      }`}
    >
      <div className={`absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 transition-opacity duration-500 ${scrolled ? 'opacity-100' : ''}`}></div>

      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10"> 
        <div className="flex justify-between h-28 items-center">
          
          {/* --- LOGO ALANI --- */}
          <Link href="/" className="flex items-center cursor-pointer group relative z-50 gap-5" onClick={closeMenu}>
            <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/40 via-orange-500/40 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 transform scale-150"></div>
                <img 
                  src={settings.logoUrl || '/kooperatif_logo.webp'}
                  alt="Kooperatif Logosu" 
                  className="h-24 w-24 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 relative z-10" 
                />
            </div>
            <div className="flex flex-col relative">
              <span className="font-bold text-lg lg:text-xl text-white leading-tight tracking-wide group-hover:text-amber-400 transition-colors drop-shadow-md">{settings.logoText}</span> 
              <span className="text-[9px] lg:text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase group-hover:text-white transition-colors">{settings.logoSubText}</span>
              <div className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-amber-500 to-transparent group-hover:w-full transition-all duration-700 ease-out opacity-50"></div>
            </div>
          </Link>

          {/* --- MASAÜSTÜ MENÜ --- */}
          <div className="hidden lg:flex items-center space-x-1">
            {settings.menuItems.map((item) => (
              <div key={item.id} className="relative group/menu">
                {item.subItems && item.subItems.length > 0 ? (
                  <button className="flex items-center px-4 py-2.5 text-slate-300 hover:text-white font-medium transition-all duration-300 text-sm rounded-full hover:bg-white/5 border border-transparent hover:border-white/10">
                    {item.name}
                    <ChevronDown size={14} className="ml-1.5 mt-0.5 text-slate-500 group-hover/menu:text-amber-400 transition-colors" />
                  </button>
                ) : (
                  <Link href={item.href} className="flex items-center px-4 py-2.5 text-slate-300 hover:text-white font-medium transition-all duration-300 text-sm rounded-full hover:bg-white/5 border border-transparent hover:border-white/10">
                    {item.name}
                  </Link>
                )}

                {item.subItems && item.subItems.length > 0 && (
                  <div className="absolute left-0 mt-4 w-64 bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 transform origin-top-left translate-y-2 group-hover/menu:translate-y-0 z-50 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500"></div>
                    <div className="p-2">
                      {item.subItems.map((subItem, subIndex) => (
                        <Link key={subIndex} href={subItem.href} className="block px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group/item relative overflow-hidden" onClick={closeMenu}>
                          <span className="relative z-10">{subItem.name}</span>
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* ONLINE İŞLEMLER (Sabit) */}
            <div className="pl-6 ml-2 relative group/online">
              <button className="relative overflow-hidden bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 flex items-center gap-2 text-sm border border-amber-400/20 z-50">
                <div className="absolute inset-0 -translate-x-full group-hover/online:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent z-10"></div>
                <CreditCard size={16} className="text-amber-100 group-hover/online:rotate-12 transition-transform" />
                <span className="relative z-20">Online İşlemler</span>
                <ChevronDown size={14} className="ml-1 relative z-20 group-hover/online:rotate-180 transition-transform" />
              </button>

              <div className="absolute right-0 mt-4 w-72 bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 opacity-0 invisible group-hover/online:opacity-100 group-hover/online:visible transition-all duration-300 transform origin-top-right translate-y-2 group-hover/online:translate-y-0 z-40 overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600"></div>
                 <div className="p-2 space-y-1">
                    <Link href="/kredi-hesaplama" className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/5 group/item transition-colors" onClick={closeMenu}>
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover/item:bg-amber-500/20 transition-colors"><Calculator size={20} className="text-amber-400" /></div>
                        <div><p className="text-sm font-bold text-slate-200 group-hover/item:text-white">Kredi Hesaplama</p><p className="text-[10px] text-slate-400">Ödeme planınızı oluşturun</p></div>
                    </Link>
                    <Link href="/limit-sorgulama" className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/5 group/item transition-colors" onClick={closeMenu}>
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover/item:bg-indigo-500/20 transition-colors"><Search size={20} className="text-indigo-400" /></div>
                        <div><p className="text-sm font-bold text-slate-200 group-hover/item:text-white">Limit Sorgulama</p><p className="text-[10px] text-slate-400">Kredi limitinizi öğrenin</p></div>
                    </Link>
                 </div>
              </div>
            </div>
          </div>

          {/* Mobil Hamburger */}
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-white/5 transition-colors">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBİL MENÜ İÇERİĞİ --- */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-800 h-screen overflow-y-auto absolute w-full top-28 left-0 z-40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-[80px] pointer-events-none"></div>
            
          <div className="px-4 pt-6 pb-32 space-y-3 relative z-10">
            {settings.menuItems.map((item) => (
              <div key={item.id} className="border-b border-slate-800/50 last:border-0 pb-2">
                {item.subItems && item.subItems.length > 0 ? (
                  <div>
                    <button onClick={() => toggleMobileSubmenu(item.name)} className="flex justify-between w-full text-left px-4 py-4 text-base font-bold text-slate-200 hover:text-amber-400 transition-colors rounded-xl hover:bg-white/5">
                      {item.name}
                      <ChevronDown size={20} className={`transform transition-transform duration-300 ${openMobileSubmenu === item.name ? 'rotate-180 text-amber-500' : 'text-slate-500'}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openMobileSubmenu === item.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="bg-black/20 rounded-xl mt-2 p-2 space-y-1 border border-white/5">
                        {item.subItems.map((subItem, subIdx) => (
                          <Link key={subIdx} href={subItem.href} onClick={closeMenu} className="block w-full text-left px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all pl-8 border-l-2 border-transparent hover:border-amber-500">
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={item.href} onClick={closeMenu} className="block w-full text-left px-4 py-4 text-base font-bold text-slate-200 hover:text-amber-400 transition-colors rounded-xl hover:bg-white/5">
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Mobil Online İşlemler */}
            <div className="pt-6 px-2">
               <button onClick={() => setIsOnlineMobileOpen(!isOnlineMobileOpen)} className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-4 py-4 rounded-xl font-bold flex justify-between items-center shadow-lg shadow-amber-900/30 active:scale-[0.98] transition-transform">
                  <div className="flex items-center gap-3"><CreditCard size={20} /><span>Online İşlemler</span></div>
                  <ChevronDown size={20} className={`transition-transform duration-300 ${isOnlineMobileOpen ? 'rotate-180' : ''}`} />
               </button>
               <div className={`overflow-hidden transition-all duration-300 ${isOnlineMobileOpen ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-2 space-y-1">
                      <Link href="/kredi-hesaplama" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-slate-200">
                          <Calculator size={18} className="text-amber-400" /><span className="text-sm font-medium">Kredi Hesaplama Uygulaması</span>
                      </Link>
                      <Link href="/limit-sorgulama" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-slate-200">
                          <Search size={18} className="text-indigo-400" /><span className="text-sm font-medium">Kısıtlı Kredi Limit Sorgulama</span>
                      </Link>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;