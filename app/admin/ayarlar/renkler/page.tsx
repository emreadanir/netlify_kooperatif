"use client";

import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';
import { 
  Save, Loader2, Palette, ArrowLeft, RotateCcw
} from 'lucide-react';
import Link from 'next/link';

// Varsayılan Renkler (Tailwind Slate/Indigo/Amber temelli)
const DEFAULT_THEME = {
  primary: '#4f46e5',   // Indigo 600
  secondary: '#d97706', // Amber 600
  background: '#0f172a', // Slate 900
  foreground: '#f1f5f9', // Slate 100
  accent: '#06b6d4',     // Cyan 500
};

export default function RenkYonetimi() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
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
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'theme');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTheme({ ...DEFAULT_THEME, ...docSnap.data() });
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
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'theme');
      await setDoc(docRef, theme);
      alert("Tema renkleri başarıyla güncellendi! Sitede anlık olarak değişecektir.");
    } catch (error) {
      console.error("Kayıt hatası:", error);
      alert("Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (confirm("Varsayılan renklere dönmek istediğinize emin misiniz?")) {
      setTheme(DEFAULT_THEME);
    }
  };

  const updateColor = (key: keyof typeof DEFAULT_THEME, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 p-6 md:p-12">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Palette className="text-pink-500" />
            Renk Ayarları
          </h1>
          <p className="text-slate-400 text-sm mt-1">Sitenin genel renk temasını buradan özelleştirebilirsiniz.</p>
        </div>
        <Link href="/admin" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-slate-700 shrink-0">
            <ArrowLeft size={16} />
            Panele Dön
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            
            <div className="grid md:grid-cols-2 gap-8">
                
                {/* Sol: Renk Seçiciler */}
                <div className="space-y-6">
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Ana Renk (Primary)</label>
                        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
                            <input 
                                type="color" 
                                value={theme.primary} 
                                onChange={(e) => updateColor('primary', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                            />
                            <input 
                                type="text" 
                                value={theme.primary}
                                onChange={(e) => updateColor('primary', e.target.value)}
                                className="bg-transparent text-white font-mono text-sm outline-none w-full uppercase"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Butonlar, başlıklar ve vurgular için kullanılır.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">İkincil Renk (Secondary)</label>
                        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
                            <input 
                                type="color" 
                                value={theme.secondary} 
                                onChange={(e) => updateColor('secondary', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                            />
                            <input 
                                type="text" 
                                value={theme.secondary}
                                onChange={(e) => updateColor('secondary', e.target.value)}
                                className="bg-transparent text-white font-mono text-sm outline-none w-full uppercase"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Rozetler, ikonlar ve alt vurgular için kullanılır.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Vurgu Rengi (Accent)</label>
                        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
                            <input 
                                type="color" 
                                value={theme.accent} 
                                onChange={(e) => updateColor('accent', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                            />
                            <input 
                                type="text" 
                                value={theme.accent}
                                onChange={(e) => updateColor('accent', e.target.value)}
                                className="bg-transparent text-white font-mono text-sm outline-none w-full uppercase"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Özel ikonlar ve gradyan geçişleri için kullanılır.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Arka Plan Rengi</label>
                        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
                            <input 
                                type="color" 
                                value={theme.background} 
                                onChange={(e) => updateColor('background', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                            />
                            <input 
                                type="text" 
                                value={theme.background}
                                onChange={(e) => updateColor('background', e.target.value)}
                                className="bg-transparent text-white font-mono text-sm outline-none w-full uppercase"
                            />
                        </div>
                    </div>

                </div>

                {/* Sağ: Önizleme */}
                <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700 flex flex-col gap-6" style={{ backgroundColor: theme.background }}>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Canlı Önizleme</h3>
                    
                    {/* Kart Örneği */}
                    <div className="rounded-2xl border p-6 relative overflow-hidden" style={{ borderColor: `${theme.primary}40`, backgroundColor: `${theme.primary}10` }}>
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: theme.primary }}></div>
                        <h4 className="text-xl font-bold mb-2" style={{ color: theme.foreground }}>Örnek Başlık</h4>
                        <p className="text-sm opacity-80 mb-4" style={{ color: theme.foreground }}>
                            Bu alan seçtiğiniz renklerin sitede nasıl görüneceğini simüle eder.
                        </p>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: theme.primary }}>
                                Birinci Buton
                            </button>
                            <button className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: theme.secondary }}>
                                İkinci Buton
                            </button>
                        </div>
                    </div>

                    {/* Rozetler */}
                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold border" style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                            Vurgu Rozeti
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold border" style={{ borderColor: `${theme.secondary}40`, backgroundColor: `${theme.secondary}20`, color: theme.secondary }}>
                            İkincil Rozet
                        </span>
                    </div>

                </div>
            </div>

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-700">
                <button 
                    onClick={resetToDefault}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-700"
                >
                    <RotateCcw size={16} /> Varsayılana Dön
                </button>

                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-900/30 transition-all transform hover:scale-105 flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}