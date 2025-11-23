"use client";

import React, { useState, useEffect } from 'react';
// Merkezi yapılandırmadan import ediyoruz
import { auth, db } from '@/lib/firebase';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Save, Loader2, ArrowLeft, Percent, AlertCircle, Settings, Layers, Wallet, Calendar, CheckCircle, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function KrediAyarlari() {
  const appId = typeof window !== 'undefined' && (window as any).__app_id ? (window as any).__app_id : 'default-app-id';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Ayarlar State'i
  const [settings, setSettings] = useState({
    annualInterestRate: 25.00,
    rates: {
      pesinMasraf: 1.50,
      blokeSermaye: 2.00,
      riskSermayesi: 1.00,
      teskomb: 0.25,
      bolgeBirligi: 0.25
    },
    limits: {
      business: 1000000,
      building: 2500000,
      vehicle: 2500000
    },
    maxTerms: {
      business: 48,
      building: 60,
      vehicle: 48
    },
    visibility: {
      business: true,
      building: true,
      vehicle: true
    }
  });

  // Auth & Data Fetch
  useEffect(() => {
    if (!auth || !db) return;

    const initAuth = async () => {
      try {
        const token = (window as any).__initial_auth_token;
        if (token) {
          await signInWithCustomToken(auth, token);
        } else {
          if (!auth.currentUser) {
            await signInAnonymously(auth);
          }
        }
      } catch (error) {
        console.error("Oturum açma hatası:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'credit_calculation');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Gelişmiş ayarları yoksayarak sadece temel ayarları alıyoruz
            setSettings(prev => ({ 
              ...prev, 
              ...data,
              rates: { ...prev.rates, ...(data.rates || {}) },
              limits: { ...prev.limits, ...(data.limits || {}) },
              maxTerms: { ...prev.maxTerms, ...(data.maxTerms || {}) }, 
              visibility: { ...prev.visibility, ...(data.visibility || {}) }
            }));
          }
        } catch (error) {
          console.error("Veri çekme hatası:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [appId]);

  const handleSave = async () => {
    if (!user || !db) return;
    setSaving(true);
    setSuccessMessage('');

    try {
      // Gelişmiş ayarları veritabanından temizlemek için sadece mevcut state'i kaydediyoruz
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'credit_calculation');
      await setDoc(docRef, settings);
      setSuccessMessage('Ayarlar başarıyla güncellendi ve web sitesinde yayına alındı.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      alert("Kaydederken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string, section: 'root' | 'rates' | 'limits' | 'maxTerms' = 'root') => {
    const numValue = parseFloat(value);
    if (value !== '' && isNaN(numValue)) return;

    if (section === 'rates') {
      setSettings(prev => ({
        ...prev,
        rates: { ...prev.rates, [field]: value }
      }));
    } else if (section === 'limits') {
      setSettings(prev => ({
        ...prev,
        limits: { ...prev.limits, [field]: value } 
      }));
    } else if (section === 'maxTerms') {
      setSettings(prev => ({
        ...prev,
        maxTerms: { ...prev.maxTerms, [field]: value }
      }));
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleLimitChange = (field: string, value: string) => {
    const rawValue = value.replace(/\D/g, '');
    const numValue = rawValue === '' ? 0 : parseInt(rawValue, 10);

    setSettings(prev => ({
      ...prev,
      limits: { ...prev.limits, [field]: numValue }
    }));
  };

  const formatLimitDisplay = (val: number) => {
    if (!val && val !== 0) return '';
    return new Intl.NumberFormat('tr-TR').format(val);
  };

  const toggleVisibility = (type: 'business' | 'building' | 'vehicle') => {
    setSettings(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [type]: !prev.visibility[type]
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 relative">
      
      {/* Ana İçerik */}
      <div className="p-4 md:p-8 pb-32 max-w-3xl mx-auto">
        
        {/* Header - GÜNCELLENDİ */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Calculator className="text-indigo-500" />
                Kredi Hesaplama Ayarları
            </h1>
            <p className="text-sm text-slate-400 mt-1">Web sitesindeki hesaplama aracının parametrelerini buradan yönetebilirsiniz.</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-slate-700 shrink-0">
            <ArrowLeft size={16} />
            Geri Dön
          </Link>
        </div>

        <div className="space-y-6">
          
          {/* --- GÖRÜNÜRLÜK AYARLARI --- */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Layers size={20} className="text-blue-400" />
              Kredi Türü Görünürlüğü
            </h2>
            <div className="space-y-4">
              {/* İşletme */}
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${settings.visibility.business ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">İşletme Kredisi</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{settings.visibility.business ? 'Görünüyor' : 'Gizli'}</span>
                  </div>
                </div>
                <button onClick={() => toggleVisibility('business')} className={`relative w-12 h-7 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 ${settings.visibility.business ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                  <span className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${settings.visibility.business ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {/* İşyeri */}
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${settings.visibility.building ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-600'}`}></div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">İşyeri Kredisi</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{settings.visibility.building ? 'Görünüyor' : 'Gizli'}</span>
                  </div>
                </div>
                <button onClick={() => toggleVisibility('building')} className={`relative w-12 h-7 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 ${settings.visibility.building ? 'bg-blue-500' : 'bg-slate-600'}`}>
                  <span className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${settings.visibility.building ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {/* Taşıt */}
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${settings.visibility.vehicle ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-600'}`}></div>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">Taşıt Kredisi</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{settings.visibility.vehicle ? 'Görünüyor' : 'Gizli'}</span>
                  </div>
                </div>
                <button onClick={() => toggleVisibility('vehicle')} className={`relative w-12 h-7 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 ${settings.visibility.vehicle ? 'bg-indigo-500' : 'bg-slate-600'}`}>
                  <span className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${settings.visibility.vehicle ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* --- LİMİT AYARLARI --- */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Wallet size={20} className="text-yellow-400" />
              Kredi Üst Limitleri (TL)
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">İşletme Limiti</label>
                  <input 
                    type="text" 
                    value={formatLimitDisplay(settings.limits.business)}
                    onChange={(e) => handleLimitChange('business', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 outline-none font-mono"
                    placeholder="Örn: 1.000.000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">İşyeri Limiti</label>
                  <input 
                    type="text" 
                    value={formatLimitDisplay(settings.limits.building)}
                    onChange={(e) => handleLimitChange('building', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 outline-none font-mono"
                    placeholder="Örn: 2.500.000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Taşıt Limiti</label>
                  <input 
                    type="text" 
                    value={formatLimitDisplay(settings.limits.vehicle)}
                    onChange={(e) => handleLimitChange('vehicle', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 outline-none font-mono"
                    placeholder="Örn: 2.500.000"
                  />
                </div>
            </div>
          </div>

          {/* --- VADE AYARLARI --- */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-pink-400" />
              Kredi Vade Ayarları (Ay)
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">İşletme Maks. Vade</label>
                  <input 
                    type="number" 
                    value={settings.maxTerms.business}
                    onChange={(e) => handleChange('business', e.target.value, 'maxTerms')}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-pink-500 outline-none font-mono"
                    placeholder="Örn: 48"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">İşyeri Maks. Vade</label>
                  <input 
                    type="number" 
                    value={settings.maxTerms.building}
                    onChange={(e) => handleChange('building', e.target.value, 'maxTerms')}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-pink-500 outline-none font-mono"
                    placeholder="Örn: 60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Taşıt Maks. Vade</label>
                  <input 
                    type="number" 
                    value={settings.maxTerms.vehicle}
                    onChange={(e) => handleChange('vehicle', e.target.value, 'maxTerms')}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-pink-500 outline-none font-mono"
                    placeholder="Örn: 48"
                  />
                </div>
            </div>
          </div>

          {/* Faiz Oranı Kartı */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Percent size={20} className="text-indigo-400" />
              Yıllık Faiz Oranı
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Yıllık Faiz (%)</label>
              <input type="number" step="0.01" value={settings.annualInterestRate} onChange={(e) => handleChange('annualInterestRate', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-lg" />
            </div>
          </div>

          {/* Kesinti Oranları Kartı */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings size={20} className="text-emerald-400" />
              Kesinti Oranları (%)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries({
                  pesinMasraf: 'Peşin Masraf',
                  blokeSermaye: 'Bloke Sermaye',
                  riskSermayesi: 'Risk Sermayesi',
                  teskomb: 'TESKOMB Payı',
                  bolgeBirligi: 'Bölge Birliği Payı'
              }).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
                    <input 
                      type="number" step="0.01"
                      value={(settings.rates as any)[key]}
                      onChange={(e) => handleChange(key, e.target.value, 'rates')}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
              ))}
            </div>
          </div>

          {/* Kaydet Butonu */}
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

      {/* BAŞARI MESAJI POP-UP */}
      {successMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
           <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300 pointer-events-auto transform scale-110">
              <div className="bg-white/20 p-2 rounded-full">
                <CheckCircle size={32} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-xl leading-tight">Başarılı!</h4>
                <p className="text-emerald-50 text-sm opacity-90 mt-1">{successMessage}</p>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}