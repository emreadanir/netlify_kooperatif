"use client";

import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase'; 
import { 
  Save, Loader2, Layout, Menu, Plus, Trash2,
  ArrowLeft, Image as ImageIcon, Type, 
  Facebook, Instagram, Globe, Linkedin, Youtube,
  MapPin, Phone, Mail 
} from 'lucide-react';
import Link from 'next/link';

// X (Twitter) İkonu Bileşeni
const XIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
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

// --- TİP TANIMLARI ---

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
  faviconUrl: string; 
  menuItems: MenuItem[];
}

interface SocialLinkItem {
  platform: string;
  url: string;
}

// Footer İletişim Tipleri
interface ContactInfoSettings {
  address: string;
  phones: string[];
  emails: string[];
}

interface FooterSettings {
  description: string;
  copyrightText: string;
  socialLinks: SocialLinkItem[];
  quickLinksTitle: string;
  quickLinks: SubMenuItem[];
  legislationLinksTitle: string;
  legislationLinks: SubMenuItem[];
  contactInfo: ContactInfoSettings; 
}

interface LayoutSettings {
  navbar: NavbarSettings;
  footer: FooterSettings;
}

// --- VARSAYILAN VERİLER ---

const DEFAULT_SETTINGS: LayoutSettings = {
  navbar: {
    logoUrl: '/kooperatif_logo.webp',
    logoText: 'S. S. NİLÜFER İLÇESİ',
    logoSubText: 'ESNAF VE SANATKARLAR KREDİ VE KEFALET KOOPERATİFİ',
    faviconUrl: '/favicon.ico', 
    menuItems: [
      { id: '1', name: 'Anasayfa', href: '/', subItems: [] },
      { 
        id: '2', 
        name: 'Kredi Koşulları', 
        href: '#', 
        subItems: [
          { name: 'Kredi Çeşitleri', href: '/kredi-cesitleri' },
          { name: 'Kredi Kullanım Şartları', href: '/kredi-kullanim-sartlari' },
          { name: 'Faiz Oranı', href: '/faiz-orani' }
        ] 
      },
      { id: '3', name: 'Kanun ve Yönetmelikler', href: '/kanun-ve-yonetmelikler', subItems: [] },
      { 
        id: '4', 
        name: 'Kadromuz', 
        href: '#', 
        subItems: [
          { name: 'Yönetim Kurulu', href: '/yonetim-kurulu' },
          { name: 'Denetim Kurulu', href: '/denetim-kurulu' },
          { name: 'Personel Kadrosu', href: '/personel-kadrosu' }
        ] 
      },
      { id: '5', name: 'İletişim', href: '/iletisim', subItems: [] },
    ]
  },
  footer: {
    description: 'Esnaf ve sanatkarlarımızın finansal ihtiyaçlarına çözüm üretmek, dayanışmayı artırmak ve geleceğe güvenle bakmalarını sağlamak için buradayız.',
    copyrightText: '© 2024 S. S. Nilüfer İlçesi Esnaf ve Sanatkarlar Kredi ve Kefalet Kooperatifi. Tüm hakları saklıdır.',
    socialLinks: [
      { platform: 'facebook', url: '#' },
      { platform: 'twitter', url: '#' },
      { platform: 'instagram', url: '#' }
    ],
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
    contactInfo: { 
      address: 'Adres bilgisi giriniz...',
      phones: ['0 (224) ...'],
      emails: ['bilgi@...']
    }
  }
};

// İkon Seçici Yardımcısı
const getSocialIcon = (platform: string) => {
    switch(platform) {
        case 'facebook': return <Facebook className="text-blue-500" size={20} />;
        case 'twitter': return <XIcon className="text-slate-200" size={20} />; 
        case 'instagram': return <Instagram className="text-pink-500" size={20} />;
        case 'linkedin': return <Linkedin className="text-blue-700" size={20} />;
        case 'youtube': return <Youtube className="text-red-600" size={20} />;
        default: return <Globe className="text-gray-400" size={20} />;
    }
};

export default function SiteGorunumuYonetimi() {
  const [activeTab, setActiveTab] = useState<'navbar' | 'footer'>('navbar');
  const [settings, setSettings] = useState<LayoutSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch((err) => console.error("Auth Error:", err));
    });
    return () => unsub();
  }, []);

  // Data Fetch
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'layout');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const mergedSettings: LayoutSettings = {
            navbar: { 
                ...DEFAULT_SETTINGS.navbar, 
                ...(data.navbar || {}),
                faviconUrl: data.navbar?.faviconUrl || DEFAULT_SETTINGS.navbar.faviconUrl
            },
            footer: { 
                ...DEFAULT_SETTINGS.footer, 
                ...(data.footer || {}),
                quickLinksTitle: data.footer?.quickLinksTitle || DEFAULT_SETTINGS.footer.quickLinksTitle,
                legislationLinksTitle: data.footer?.legislationLinksTitle || DEFAULT_SETTINGS.footer.legislationLinksTitle,
                socialLinks: Array.isArray(data.footer?.socialLinks) 
                    ? data.footer.socialLinks 
                    : DEFAULT_SETTINGS.footer.socialLinks,
                contactInfo: {
                    ...DEFAULT_SETTINGS.footer.contactInfo,
                    ...(data.footer?.contactInfo || {})
                }
            }
          };
          setSettings(mergedSettings);
        }
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const cleanedSettings = { ...settings };
      
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'layout');
      await setDoc(docRef, cleanedSettings, { merge: true });
      alert("Görünüm ayarları başarıyla kaydedildi! Değişikliklerin görünmesi için sayfayı yenileyin.");
    } catch (error) {
      console.error("Kayıt hatası:", error);
      alert("Kaydederken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  // --- FOOTER HELPERS ---
  const addFooterLink = (type: 'quickLinks' | 'legislationLinks') => {
    const newLinks = [...settings.footer[type], { name: 'Yeni Link', href: '#' }];
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, [type]: newLinks } }));
  };

  const removeFooterLink = (type: 'quickLinks' | 'legislationLinks', index: number) => {
    const newLinks = [...settings.footer[type]];
    newLinks.splice(index, 1);
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, [type]: newLinks } }));
  };

  const updateFooterLink = (type: 'quickLinks' | 'legislationLinks', index: number, field: keyof SubMenuItem, value: string) => {
    const newLinks = [...settings.footer[type]];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, [type]: newLinks } }));
  };

  // --- SOCIAL MEDIA HELPERS ---
  const addSocialLink = () => {
    const newLinks = [...settings.footer.socialLinks, { platform: 'facebook', url: '' }];
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, socialLinks: newLinks } }));
  };

  const removeSocialLink = (index: number) => {
    const newLinks = [...settings.footer.socialLinks];
    newLinks.splice(index, 1);
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, socialLinks: newLinks } }));
  };

  const updateSocialLink = (index: number, field: keyof SocialLinkItem, value: string) => {
    const newLinks = [...settings.footer.socialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, socialLinks: newLinks } }));
  };

  // --- İLETİŞİM BİLGİLERİ HELPERS ---
  const addPhone = () => {
    const newPhones = [...settings.footer.contactInfo.phones, ''];
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, contactInfo: { ...prev.footer.contactInfo, phones: newPhones } } }));
  };
  const removePhone = (index: number) => {
    const newPhones = [...settings.footer.contactInfo.phones];
    newPhones.splice(index, 1);
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, contactInfo: { ...prev.footer.contactInfo, phones: newPhones } } }));
  };
  const updatePhone = (index: number, value: string) => {
    const newPhones = [...settings.footer.contactInfo.phones];
    newPhones[index] = value;
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, contactInfo: { ...prev.footer.contactInfo, phones: newPhones } } }));
  };

  const addEmail = () => {
    const newEmails = [...settings.footer.contactInfo.emails, ''];
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, contactInfo: { ...prev.footer.contactInfo, emails: newEmails } } }));
  };
  const removeEmail = (index: number) => {
    const newEmails = [...settings.footer.contactInfo.emails];
    newEmails.splice(index, 1);
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, contactInfo: { ...prev.footer.contactInfo, emails: newEmails } } }));
  };
  const updateEmail = (index: number, value: string) => {
    const newEmails = [...settings.footer.contactInfo.emails];
    newEmails[index] = value;
    setSettings(prev => ({ ...prev, footer: { ...prev.footer, contactInfo: { ...prev.footer.contactInfo, emails: newEmails } } }));
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 p-4 md:p-12">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 md:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Layout className="text-indigo-500" />
            Site Görünümü
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">Menü yapısını, logoyu ve alt bilgi alanlarını buradan özelleştirebilirsiniz.</p>
        </div>
        <Link href="/admin" className="w-full md:w-auto px-4 py-3 md:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium border border-slate-700 shrink-0">
            <ArrowLeft size={16} />
            Panele Dön
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700 overflow-x-auto pb-1">
            <button 
                onClick={() => setActiveTab('navbar')}
                className={`px-4 md:px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === 'navbar' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
                <Menu size={18} /> Üst Menü (Navbar)
            </button>
            <button 
                onClick={() => setActiveTab('footer')}
                className={`px-4 md:px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === 'footer' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
                <Layout size={18} /> Alt Bilgi (Footer)
            </button>
        </div>

        {/* --- NAVBAR AYARLARI --- */}
        {activeTab === 'navbar' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {/* Logo ve Kimlik Ayarları */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 md:p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <ImageIcon size={20} className="text-amber-400" /> Site Kimliği
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Logo URL</label>
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                                    <img src={settings.navbar.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                                </div>
                                <input 
                                    type="text" 
                                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 text-white text-sm focus:border-indigo-500 outline-none w-full"
                                    value={settings.navbar.logoUrl}
                                    onChange={(e) => setSettings(prev => ({ ...prev, navbar: { ...prev.navbar, logoUrl: e.target.value } }))}
                                    placeholder="https://..."
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Logonun yüklü olduğu tam URL adresi.</p>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Favicon URL (Sekme İkonu)</label>
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                                    <img src={settings.navbar.faviconUrl} alt="Favicon" className="w-6 h-6 object-contain" />
                                </div>
                                <input 
                                    type="text" 
                                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 text-white text-sm focus:border-indigo-500 outline-none w-full"
                                    value={settings.navbar.faviconUrl}
                                    onChange={(e) => setSettings(prev => ({ ...prev, navbar: { ...prev.navbar, faviconUrl: e.target.value } }))}
                                    placeholder="/favicon.ico"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Favicon'un yüklü olduğu tam URL adresi.</p>
                        </div>

                        {/* Başlıklar */}
                        <div className="space-y-4 md:col-span-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Site Ana Başlığı</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                                    value={settings.navbar.logoText}
                                    onChange={(e) => setSettings(prev => ({ ...prev, navbar: { ...prev.navbar, logoText: e.target.value } }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Alt Başlık / Slogan</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                                    value={settings.navbar.logoSubText}
                                    onChange={(e) => setSettings(prev => ({ ...prev, navbar: { ...prev.navbar, logoSubText: e.target.value } }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- FOOTER AYARLARI --- */}
        {activeTab === 'footer' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {/* Genel Bilgiler */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 md:p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Type size={20} className="text-emerald-400" /> Genel Metinler
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Açıklama Metni</label>
                            <textarea 
                                rows={3}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none resize-none"
                                value={settings.footer.description}
                                onChange={(e) => setSettings(prev => ({ ...prev, footer: { ...prev.footer, description: e.target.value } }))}
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Telif Hakkı (Copyright)</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                                value={settings.footer.copyrightText}
                                onChange={(e) => setSettings(prev => ({ ...prev, footer: { ...prev.footer, copyrightText: e.target.value } }))}
                            />
                        </div>
                    </div>
                </div>

                {/* İLETİŞİM BİLGİLERİ */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 md:p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Phone size={20} className="text-amber-400" /> İletişim Bilgileri
                    </h3>
                    
                    <div className="space-y-6">
                        {/* Adres */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                                <MapPin size={14}/> Adres
                            </label>
                            <textarea 
                                rows={2}
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none resize-none"
                                value={settings.footer.contactInfo.address}
                                onChange={(e) => setSettings(prev => ({ ...prev, footer: { ...prev.footer, contactInfo: { ...prev.footer.contactInfo, address: e.target.value } } }))}
                            ></textarea>
                        </div>

                        {/* Telefonlar */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Phone size={14}/> Telefon Numaraları</label>
                                <button onClick={addPhone} className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded flex items-center gap-1"><Plus size={10} /> Ekle</button>
                            </div>
                            <div className="space-y-2">
                                {settings.footer.contactInfo.phones.map((phone, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="flex-1 bg-slate-900/50 border border-slate-600 rounded px-2 py-2 text-sm text-white outline-none focus:border-amber-500 font-mono w-full"
                                            value={phone}
                                            onChange={(e) => updatePhone(idx, e.target.value)}
                                            placeholder="0 (224) ..."
                                        />
                                        <button onClick={() => removePhone(idx)} className="text-slate-500 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* E-Postalar */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Mail size={14}/> E-Posta Adresleri</label>
                                <button onClick={addEmail} className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded flex items-center gap-1"><Plus size={10} /> Ekle</button>
                            </div>
                            <div className="space-y-2">
                                {settings.footer.contactInfo.emails.map((email, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="flex-1 bg-slate-900/50 border border-slate-600 rounded px-2 py-2 text-sm text-white outline-none focus:border-amber-500 w-full"
                                            value={email}
                                            onChange={(e) => updateEmail(idx, e.target.value)}
                                            placeholder="ornek@mail.com"
                                        />
                                        <button onClick={() => removeEmail(idx)} className="text-slate-500 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Link Grupları */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Hızlı Erişim */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                            <div className="flex-1 mr-0 sm:mr-4">
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Başlık</label>
                                <input 
                                    type="text"
                                    className="w-full bg-transparent border-b border-slate-600 text-lg font-bold text-white focus:border-emerald-500 outline-none pb-1"
                                    value={settings.footer.quickLinksTitle}
                                    onChange={(e) => setSettings(prev => ({ ...prev, footer: { ...prev.footer, quickLinksTitle: e.target.value } }))}
                                />
                            </div>
                            <button onClick={() => addFooterLink('quickLinks')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded flex items-center gap-1 w-fit"><Plus size={12} /> Link Ekle</button>
                        </div>
                        <div className="space-y-2">
                            {settings.footer.quickLinks.map((link, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-2 p-2 bg-slate-900/30 rounded-lg border border-slate-700/30">
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-slate-900/50 border border-slate-600 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                                        value={link.name}
                                        placeholder="Link Adı"
                                        onChange={(e) => updateFooterLink('quickLinks', idx, 'name', e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="flex-1 bg-slate-900/50 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-400 outline-none focus:border-emerald-500 font-mono"
                                            value={link.href}
                                            placeholder="URL"
                                            onChange={(e) => updateFooterLink('quickLinks', idx, 'href', e.target.value)}
                                        />
                                        <button onClick={() => removeFooterLink('quickLinks', idx)} className="text-slate-500 hover:text-red-400 px-2"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mevzuat */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                            <div className="flex-1 mr-0 sm:mr-4">
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Başlık</label>
                                <input 
                                    type="text"
                                    className="w-full bg-transparent border-b border-slate-600 text-lg font-bold text-white focus:border-emerald-500 outline-none pb-1"
                                    value={settings.footer.legislationLinksTitle}
                                    onChange={(e) => setSettings(prev => ({ ...prev, footer: { ...prev.footer, legislationLinksTitle: e.target.value } }))}
                                />
                            </div>
                            <button onClick={() => addFooterLink('legislationLinks')} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded flex items-center gap-1 w-fit"><Plus size={12} /> Link Ekle</button>
                        </div>
                        <div className="space-y-2">
                            {settings.footer.legislationLinks.map((link, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-2 p-2 bg-slate-900/30 rounded-lg border border-slate-700/30">
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-slate-900/50 border border-slate-600 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                                        value={link.name}
                                        placeholder="Link Adı"
                                        onChange={(e) => updateFooterLink('legislationLinks', idx, 'name', e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="flex-1 bg-slate-900/50 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-400 outline-none focus:border-emerald-500 font-mono"
                                            value={link.href}
                                            placeholder="URL"
                                            onChange={(e) => updateFooterLink('legislationLinks', idx, 'href', e.target.value)}
                                        />
                                        <button onClick={() => removeFooterLink('legislationLinks', idx)} className="text-slate-500 hover:text-red-400 px-2"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sosyal Medya */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Globe size={20} className="text-pink-400" /> Sosyal Medya Hesapları
                        </h3>
                        <button onClick={addSocialLink} className="text-xs bg-pink-600 hover:bg-pink-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Plus size={14} /> Yeni Hesap
                        </button>
                    </div>
                    <div className="space-y-3">
                        {settings.footer.socialLinks.map((link, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="bg-slate-800 p-2 rounded-lg border border-slate-600 shrink-0">
                                        {getSocialIcon(link.platform)}
                                    </div>
                                    <div className="flex-1 sm:hidden">
                                        <span className="text-sm font-bold text-white capitalize">{link.platform}</span>
                                    </div>
                                    <button onClick={() => removeSocialLink(index)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors sm:hidden">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                                    <div className="col-span-1 hidden sm:block">
                                        <select 
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs focus:border-pink-500 outline-none appearance-none"
                                            value={link.platform}
                                            onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                                        >
                                            <option value="facebook">Facebook</option>
                                            <option value="twitter">X (Twitter)</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="youtube">YouTube</option>
                                            <option value="website">Web Sitesi</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs focus:border-pink-500 outline-none"
                                            placeholder="https://..."
                                            value={link.url}
                                            onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button onClick={() => removeSocialLink(index)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors hidden sm:block">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {settings.footer.socialLinks.length === 0 && (
                            <p className="text-center text-slate-500 text-sm py-4">Henüz sosyal medya hesabı eklenmemiş.</p>
                        )}
                    </div>
                </div>

            </div>
        )}

        {/* KAYDET BUTONU */}
        <div className="sticky bottom-6 flex justify-end mt-8 z-30">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md -z-10 rounded-2xl transform scale-110"></div>
            <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-indigo-900/30 transition-all transform hover:scale-105 flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto justify-center"
            >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
        </div>

      </div>
    </div>
  );
}