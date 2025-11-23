"use client";

import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';
import { 
  Save, Loader2, LayoutTemplate, ArrowLeft, Type, MousePointer2, Layers, Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';

// --- TİP TANIMLARI ---
interface HeroSection {
  badge: string;
  titlePart1: string;
  titlePart2: string; // Renkli kısım
  description: string;
  button1Text: string;
  button1Url: string;
  button2Text: string;
  button2Url: string;
}

interface FeatureCard {
  title: string;
  description: string;
  buttonText: string;
  url: string;
}

interface HomePageData {
  hero: HeroSection;
  features: {
    card1: FeatureCard;
    card2: FeatureCard;
    card3: FeatureCard;
  };
}

// --- VARSAYILAN VERİLER ---
const DEFAULT_DATA: HomePageData = {
  hero: {
    badge: "Güçlü Esnaf, Güçlü Gelecek",
    titlePart1: "Esnafımızın",
    titlePart2: "Yanındayız.",
    description: "Düşük faizli kredi imkanları, esnek ödeme koşulları ve devlet destekli finansman çözümleriyle işletmenizi büyütmek için buradayız.",
    button1Text: "Bize Ulaşın",
    button1Url: "/iletisim",
    button2Text: "Kredi Detayları",
    button2Url: "/kredi-cesitleri"
  },
  features: {
    card1: { title: "Yönetim Kadromuz", description: "Deneyimli ve güvenilir ekibimizle tanışın, kooperatifimizi daha yakından tanıyın.", buttonText: "İncele", url: "/yonetim-kurulu" },
    card2: { title: "Kredi Koşulları", description: "İşletme, yatırım ve taşıt kredisi seçeneklerimiz ve uygun faiz oranlarımız.", buttonText: "Detaylar", url: "/kredi-kullanim-sartlari" },
    card3: { title: "Mevzuat", description: "Kooperatif ana sözleşmesi, kanunlar ve yasal yönetmelikler hakkında bilgi alın.", buttonText: "Oku", url: "/kanun-ve-yonetmelikler" }
  }
};

export default function AnaSayfaYonetimi() {
  const [data, setData] = useState<HomePageData>(DEFAULT_DATA);
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

  // Veri Çekme
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'home_page');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as HomePageData;
          // Eksik alanları varsayılanlarla tamamla
          setData({
            hero: { ...DEFAULT_DATA.hero, ...fetchedData.hero },
            features: { 
                card1: { ...DEFAULT_DATA.features.card1, ...fetchedData.features?.card1 },
                card2: { ...DEFAULT_DATA.features.card2, ...fetchedData.features?.card2 },
                card3: { ...DEFAULT_DATA.features.card3, ...fetchedData.features?.card3 },
            }
          });
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
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'home_page');
      await setDoc(docRef, data);
      alert("Ana sayfa içerikleri başarıyla güncellendi!");
    } catch (error) {
      console.error("Kayıt hatası:", error);
      alert("Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  // Helper: Nested obje güncelleme
  const updateHero = (field: keyof HeroSection, value: string) => {
    setData(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const updateFeature = (cardKey: 'card1' | 'card2' | 'card3', field: keyof FeatureCard, value: string) => {
    setData(prev => ({
        ...prev,
        features: {
            ...prev.features,
            [cardKey]: { ...prev.features[cardKey], [field]: value }
        }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 p-6 md:p-12">
      
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <LayoutTemplate className="text-blue-500" />
            Ana Sayfa Yönetimi
          </h1>
          <p className="text-slate-400 text-sm mt-1">Giriş ekranındaki başlıkları, metinleri ve yönlendirme kartlarını buradan düzenleyebilirsiniz.</p>
        </div>
        <Link href="/admin/sayfalar" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-slate-700">
            <ArrowLeft size={16} />
            Geri Dön
        </Link>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 1. HERO BÖLÜMÜ */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                <Type className="text-amber-400" size={24} />
                <h3 className="text-xl font-bold text-white">Karşılama (Hero) Alanı</h3>
            </div>

            <div className="space-y-5">
                {/* Üst Rozet */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Üst Rozet Metni</label>
                    <input 
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none"
                        value={data.hero.badge}
                        onChange={(e) => updateHero('badge', e.target.value)}
                    />
                </div>

                {/* Başlıklar */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Başlık 1. Satır (Beyaz)</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none"
                            value={data.hero.titlePart1}
                            onChange={(e) => updateHero('titlePart1', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Başlık 2. Satır (Renkli)</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-amber-400 text-sm font-bold focus:border-amber-500 outline-none"
                            value={data.hero.titlePart2}
                            onChange={(e) => updateHero('titlePart2', e.target.value)}
                        />
                    </div>
                </div>

                {/* Açıklama */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Açıklama Metni</label>
                    <textarea 
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none resize-none"
                        value={data.hero.description}
                        onChange={(e) => updateHero('description', e.target.value)}
                    ></textarea>
                </div>

                {/* Butonlar */}
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-700/50">
                    <div className="space-y-3">
                        <p className="text-sm font-bold text-white flex items-center gap-2"><MousePointer2 size={14}/> Buton 1 (Renkli)</p>
                        <input 
                            type="text" 
                            placeholder="Buton Metni"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 outline-none"
                            value={data.hero.button1Text}
                            onChange={(e) => updateHero('button1Text', e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="Link URL (/iletisim)"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-400 text-xs focus:border-amber-500 outline-none font-mono"
                            value={data.hero.button1Url}
                            onChange={(e) => updateHero('button1Url', e.target.value)}
                        />
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm font-bold text-white flex items-center gap-2"><MousePointer2 size={14}/> Buton 2 (Şeffaf)</p>
                        <input 
                            type="text" 
                            placeholder="Buton Metni"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 outline-none"
                            value={data.hero.button2Text}
                            onChange={(e) => updateHero('button2Text', e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="Link URL (/kredi-cesitleri)"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-400 text-xs focus:border-amber-500 outline-none font-mono"
                            value={data.hero.button2Url}
                            onChange={(e) => updateHero('button2Url', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* 2. ÖNE ÇIKAN KARTLAR */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                <Layers className="text-indigo-400" size={24} />
                <h3 className="text-xl font-bold text-white">Hızlı Erişim Kartları</h3>
            </div>

            <div className="flex flex-col gap-6">
                
                {/* KART 1 */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 relative group hover:border-amber-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-xl"></div>
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-amber-400 text-sm font-bold uppercase tracking-wider">Kart 1 (Yönetim)</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Kart Başlığı</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-amber-500 outline-none"
                                placeholder="Başlık"
                                value={data.features.card1.title}
                                onChange={(e) => updateFeature('card1', 'title', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Yönlendirme Linki</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-slate-300 text-sm font-mono focus:border-amber-500 outline-none"
                                    placeholder="/link"
                                    value={data.features.card1.url}
                                    onChange={(e) => updateFeature('card1', 'url', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Açıklama Metni</label>
                        <textarea 
                            rows={2}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-300 text-sm focus:border-amber-500 outline-none resize-none"
                            placeholder="Açıklama"
                            value={data.features.card1.description}
                            onChange={(e) => updateFeature('card1', 'description', e.target.value)}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Buton Metni</label>
                        <input 
                            type="text" 
                            className="w-full md:w-1/2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-amber-500 outline-none"
                            placeholder="Örn: İncele"
                            value={data.features.card1.buttonText}
                            onChange={(e) => updateFeature('card1', 'buttonText', e.target.value)}
                        />
                    </div>
                </div>

                {/* KART 2 */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 relative group hover:border-indigo-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl"></div>
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-indigo-400 text-sm font-bold uppercase tracking-wider">Kart 2 (Kredi)</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Kart Başlığı</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-indigo-500 outline-none"
                                placeholder="Başlık"
                                value={data.features.card2.title}
                                onChange={(e) => updateFeature('card2', 'title', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Yönlendirme Linki</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-slate-300 text-sm font-mono focus:border-indigo-500 outline-none"
                                    placeholder="/link"
                                    value={data.features.card2.url}
                                    onChange={(e) => updateFeature('card2', 'url', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Açıklama Metni</label>
                        <textarea 
                            rows={2}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-300 text-sm focus:border-indigo-500 outline-none resize-none"
                            placeholder="Açıklama"
                            value={data.features.card2.description}
                            onChange={(e) => updateFeature('card2', 'description', e.target.value)}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Buton Metni</label>
                        <input 
                            type="text" 
                            className="w-full md:w-1/2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-indigo-500 outline-none"
                            placeholder="Örn: Detaylar"
                            value={data.features.card2.buttonText}
                            onChange={(e) => updateFeature('card2', 'buttonText', e.target.value)}
                        />
                    </div>
                </div>

                {/* KART 3 */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 relative group hover:border-cyan-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 rounded-l-xl"></div>
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-cyan-400 text-sm font-bold uppercase tracking-wider">Kart 3 (Mevzuat)</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Kart Başlığı</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                                placeholder="Başlık"
                                value={data.features.card3.title}
                                onChange={(e) => updateFeature('card3', 'title', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Yönlendirme Linki</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-slate-300 text-sm font-mono focus:border-cyan-500 outline-none"
                                    placeholder="/link"
                                    value={data.features.card3.url}
                                    onChange={(e) => updateFeature('card3', 'url', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Açıklama Metni</label>
                        <textarea 
                            rows={2}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-300 text-sm focus:border-cyan-500 outline-none resize-none"
                            placeholder="Açıklama"
                            value={data.features.card3.description}
                            onChange={(e) => updateFeature('card3', 'description', e.target.value)}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Buton Metni</label>
                        <input 
                            type="text" 
                            className="w-full md:w-1/2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-500 outline-none"
                            placeholder="Örn: Oku"
                            value={data.features.card3.buttonText}
                            onChange={(e) => updateFeature('card3', 'buttonText', e.target.value)}
                        />
                    </div>
                </div>

            </div>
        </div>

        {/* KAYDET */}
        <div className="sticky bottom-6 flex justify-end z-20">
            <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-900/30 transition-all transform hover:scale-105 flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
        </div>

      </div>
    </div>
  );
}