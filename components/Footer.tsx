"use client";

import React, { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, ChevronRight, ArrowRight, Linkedin, Youtube, Globe } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '@/lib/firebase';

// X İkonu
const XIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

interface LinkItem {
    name: string;
    href: string;
}

interface SocialLinkItem {
  platform: string;
  url: string;
}

interface ContactInfo {
  address: string;
  phones: string[];
  emails: string[];
}

interface FooterSettings {
  description: string;
  copyrightText: string;
  socialLinks: SocialLinkItem[]; 
  quickLinksTitle: string;
  quickLinks: LinkItem[];
  legislationLinksTitle: string;
  legislationLinks: LinkItem[];
  logoUrl?: string;
  logoText?: string;
  logoSubText?: string;
  contactInfo: ContactInfo; 
}

const DEFAULT_FOOTER: FooterSettings = {
    description: 'Esnaf ve sanatkarlarımızın finansal ihtiyaçlarına çözüm üretmek, dayanışmayı artırmak ve geleceğe güvenle bakmalarını sağlamak için buradayız.',
    copyrightText: '© 2024 S. S. Nilüfer İlçesi Esnaf ve Sanatkarlar Kredi ve Kefalet Kooperatifi. Tüm hakları saklıdır.',
    socialLinks: [],
    quickLinksTitle: 'Hızlı Erişim',
    quickLinks: [
        { name: 'Anasayfa', href: '/' },
        { name: 'Kredi Çeşitleri', href: '/kredi-cesitleri' },
        { name: 'Kredi Hesaplama', href: '/kredi-kullanim-sartlari' },
        { name: 'Personel Kadrosu', href: '/personel-kadrosu' },
    ],
    legislationLinksTitle: 'Mevzuat',
    legislationLinks: [
        { name: 'Ana Sözleşme', href: '/kanun-ve-yonetmelikler' },
        { name: 'Esnaf ve Sanatkarlar Kanunu', href: '/kanun-ve-yonetmelikler' },
        { name: 'Kredi Yönetmeliği', href: '/kanun-ve-yonetmelikler' },
        { name: 'Bilgi Edinme Hakkı', href: '/kanun-ve-yonetmelikler' }
    ],
    logoUrl: '/kooperatif_logo.webp',
    logoText: 'S. S. NİLÜFER İLÇESİ',
    logoSubText: 'ESNAF VE SANATKARLAR KREDİ VE KEFALET KOOPERATİFİ',
    contactInfo: {
      address: 'Yükleniyor...',
      phones: [],
      emails: []
    }
};

const socialIconMap: Record<string, any> = {
  facebook: Facebook,
  twitter: XIcon, 
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  website: Globe
};

const socialColorClass: Record<string, string> = {
  facebook: "hover:bg-indigo-600 hover:border-indigo-500 shadow-lg hover:shadow-indigo-500/30",
  twitter: "hover:bg-slate-950 hover:border-slate-600 shadow-lg hover:shadow-slate-950/50 text-slate-300 hover:text-white",
  instagram: "hover:bg-pink-600 hover:border-pink-500 shadow-lg hover:shadow-pink-500/30",
  linkedin: "hover:bg-blue-700 hover:border-blue-600 shadow-lg hover:shadow-blue-700/30",
  youtube: "hover:bg-red-600 hover:border-red-500 shadow-lg hover:shadow-red-600/30",
  website: "hover:bg-emerald-600 hover:border-emerald-500 shadow-lg hover:shadow-emerald-600/30"
};

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_FOOTER);
  const [isMounted, setIsMounted] = useState(false);

  const scrollToTop = useCallback((): void => {
    if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    if (!db) return;

    // 1. Site Ayarları (Logo, Menüler, Sosyal Medya vb.)
    const layoutRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'layout');
    const unsubLayout = onSnapshot(layoutRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.footer) {
                const fetchedSocialLinks = data.footer.socialLinks;
                const normalizedSocialLinks = Array.isArray(fetchedSocialLinks) 
                    ? fetchedSocialLinks 
                    : [];

                setSettings(prev => ({
                    ...prev,
                    ...data.footer,
                    socialLinks: normalizedSocialLinks,
                    // contactInfo buradan ALINMIYOR artık
                    quickLinksTitle: data.footer.quickLinksTitle || prev.quickLinksTitle,
                    legislationLinksTitle: data.footer.legislationLinksTitle || prev.legislationLinksTitle,
                    logoUrl: data.navbar?.logoUrl || prev.logoUrl,
                    logoText: data.navbar?.logoText || prev.logoText,
                    logoSubText: data.navbar?.logoSubText || prev.logoSubText,
                }));
            }
        }
    });

    // 2. İletişim Bilgileri (Doğrudan İletişim Sayfası Verisinden)
    const contactRef = doc(db, 'artifacts', appId, 'public', 'data', 'page-content', 'contact-info');
    const unsubContact = onSnapshot(contactRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // İletişim sayfasındaki veri yapısını Footer'a uyarla
            const phones = data.phones?.map((p: any) => p.number) || (data.phone ? [data.phone] : []);
            const emails = data.emails?.map((e: any) => e.address) || (data.email ? [data.email] : []);
            const address = data.address ? `${data.address}\n${data.city || ''}` : 'Adres bilgisi yüklenemedi.';

            setSettings(prev => ({
                ...prev,
                contactInfo: {
                    address,
                    phones,
                    emails
                }
            }));
        }
    });

    return () => {
        unsubLayout();
        unsubContact();
    };
  }, []);

  const getCopyrightText = (text: string) => {
    if (!isMounted) return text;
    const currentYear = new Date().getFullYear();
    if (text.includes('{year}')) return text.replace(/{year}/g, currentYear.toString());
    const copyrightRegex = /(©|Copyright)(\s+)?(\d{4})/i;
    if (copyrightRegex.test(text)) return text.replace(copyrightRegex, (match, p1) => `${p1} ${currentYear}`);
    return text.replace(/202[0-9]/g, currentYear.toString());
  };

  const normalizeUrl = (url: string) => {
    if (!url || url === '#') return '#';
    if (!url.match(/^(http|https|mailto|tel):/)) {
        return `https://${url}`;
    }
    return url;
  };

  return (
    <footer className="relative bg-[#0f172a] pt-16 pb-6 overflow-hidden border-t border-slate-800">
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[700px] h-[700px] bg-indigo-900/20 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* 1. SÜTUN: KURUMSAL KİMLİK */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center cursor-pointer group w-fit gap-4" onClick={scrollToTop}>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/40 via-orange-500/40 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 transform scale-150"></div>
                <img src={settings.logoUrl} alt="Logo" className="h-24 w-24 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 relative z-10" />
              </div>
              <div className="flex flex-col relative">
                <span className="font-bold text-sm text-white leading-tight tracking-wide group-hover:text-amber-400 transition-colors drop-shadow-md">{settings.logoText}</span>
                <span className="text-[9px] text-slate-400 font-bold tracking-[0.2em] uppercase group-hover:text-white transition-colors">{settings.logoSubText}</span>
                <div className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-amber-500 to-transparent group-hover:w-full transition-all duration-700 ease-out opacity-50"></div>
              </div>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed">{settings.description}</p>

            <div className="flex gap-4 pt-2 flex-wrap">
              {settings.socialLinks.map((link, idx) => {
                  if (!link.url || link.url === '#' || link.url.length < 2) return null;
                  
                  const IconComponent = socialIconMap[link.platform] || Globe;
                  const hoverClass = socialColorClass[link.platform] || "hover:bg-slate-700 hover:border-slate-600";

                  return (
                    <a 
                        key={idx} 
                        href={normalizeUrl(link.url)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className={`w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 ${hoverClass}`}
                        title={link.platform === 'twitter' ? 'X (Twitter)' : link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                    >
                        <IconComponent size={18} />
                    </a>
                  );
              })}
            </div>
          </div>

          {/* 2. SÜTUN: HIZLI ERİŞİM */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-amber-500 rounded-full"></span> {settings.quickLinksTitle}
            </h4>
            <ul className="space-y-3">
              {settings.quickLinks.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="group flex items-center text-slate-400 hover:text-amber-400 text-sm transition-colors">
                    <ChevronRight size={14} className="mr-2 text-slate-600 group-hover:text-amber-500 transition-colors" /> {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. SÜTUN: MEVZUAT */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-indigo-500 rounded-full"></span> {settings.legislationLinksTitle}
            </h4>
            <ul className="space-y-3">
              {settings.legislationLinks.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="group flex items-center text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                    <ArrowRight size={14} className="mr-2 text-slate-600 group-hover:text-indigo-500 transition-colors" /> {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. SÜTUN: İLETİŞİM */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-cyan-500 rounded-full"></span> Bize Ulaşın
            </h4>
            <ul className="space-y-5">
              {/* Adres */}
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center text-amber-500 shrink-0 group-hover:border-amber-500/50 transition-colors"><MapPin size={20} /></div>
                <span className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-200 transition-colors whitespace-pre-line">
                    {settings.contactInfo.address}
                </span>
              </li>
              
              {/* Telefonlar (Tek İkon, Liste Halinde) */}
              {settings.contactInfo.phones.length > 0 && (
                <li className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center text-indigo-500 shrink-0 group-hover:border-indigo-500/50 transition-colors">
                        <Phone size={20} />
                    </div>
                    <div className="flex flex-col gap-1 justify-center min-h-[2.5rem]">
                        {settings.contactInfo.phones.map((phone, idx) => (
                            <span key={idx} className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">
                                {phone}
                            </span>
                        ))}
                    </div>
                </li>
              )}
              
              {/* E-Postalar (Tek İkon, Liste Halinde) */}
              {settings.contactInfo.emails.length > 0 && (
                <li className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center text-cyan-500 shrink-0 group-hover:border-cyan-500/50 transition-colors">
                        <Mail size={20} />
                    </div>
                    <div className="flex flex-col gap-1 justify-center min-h-[2.5rem]">
                        {settings.contactInfo.emails.map((email, idx) => (
                            <span key={idx} className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors break-all">
                                {email}
                            </span>
                        ))}
                    </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* --- ALT BİLGİ --- */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative">
          <div className="absolute top-[-1px] left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent"></div>
          <p className="text-slate-500 text-sm text-center md:text-left">
            {getCopyrightText(settings.copyrightText)}
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
            <Link href="#" className="hover:text-white transition-colors">Kullanım Şartları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;