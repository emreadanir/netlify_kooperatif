"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer'; 
import { Percent, TrendingDown, Calendar, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';

interface ListData {
  label: string;
  value: string;
}

interface PageData {
  annualRate: string;
  description: string;
  termOptions: ListData[];
  deductionRates: ListData[];
  disclaimer: string;
}

const defaultData: PageData = {
  annualRate: "25,00",
  description: "Halkbank kaynaklı kredilerde uygulanan güncel yıllık faiz oranıdır.",
  termOptions: [
    { label: "İşletme Kredisi", value: "60 Aya Kadar" },
    { label: "Yatırım Kredisi", value: "120 Aya Kadar" },
    { label: "Ödeme Periyodu", value: "1 - 3 - 6 Aylık" }
  ],
  deductionRates: [
    { label: "Bloke Sermaye", value: "%1.5" },
    { label: "Bölge Birliği Payı", value: "%0.25" },
    { label: "Masraf Karşılığı", value: "%1.25" }
  ],
  disclaimer: "Belirtilen faiz oranları ve kesintiler, piyasa koşullarına ve Hazine ve Maliye Bakanlığı'nın düzenlemelerine göre değişkenlik gösterebilir. Güncel oranlar için lütfen kooperatifimizle iletişime geçiniz."
};

const FaizOrani: React.FC = () => {
  const [pageData, setPageData] = useState<PageData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // ⭐️ YENİ: Sayfa Başlığını Ayarla
  useEffect(() => {
    document.title = "Faiz Oranları | ESKKK";
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch((err) => console.error("Auth Error:", err));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'page-content', 'interest-rates');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPageData(docSnap.data() as PageData);
      }
      setLoading(false);
    }, (err) => {
      console.error("Data fetch error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const [rateMain, rateDecimal] = (pageData.annualRate || "25,00").split(',');

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col transition-colors duration-500">
      <Navbar />
      
      <main className="flex-grow relative overflow-hidden">
        
        {/* --- ARKA PLAN EFEKTLERİ (Accent/Secondary) --- */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen"></div>
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/10 blur-[90px] rounded-full mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent/15 rounded-full blur-[150px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 pt-28 pb-12 lg:pt-40 lg:pb-16 text-center">
            <div className="container mx-auto px-4">
                <div className="inline-flex items-center justify-center space-x-3 mb-4 opacity-90">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-accent"></div>
                    <span className="text-accent font-bold tracking-[0.25em] uppercase text-xs md:text-sm">GÜNCEL & AVANTAJLI</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-accent"></div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight drop-shadow-2xl">
                  Faiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary">Oranları</span>
                </h1>
                
                <p className="text-foreground/60 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
                  Esnafımıza özel, devlet destekli ve piyasa koşullarına göre en uygun kredi faiz oranları.
                </p>
                
                <div className="mt-12 w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
            </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            
            {loading ? (
               <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-accent animate-spin" />
               </div>
            ) : (
            <>
                {/* BÜYÜK FAİZ KARTI */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                    
                    <div className="relative bg-foreground/5 backdrop-blur-xl border border-foreground/10 rounded-3xl p-8 md:p-16 text-center overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -ml-16 -mb-16"></div>

                        <div className="relative z-10 flex flex-col items-center justify-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold uppercase tracking-wider mb-8">
                                <TrendingDown size={16} />
                                Yıllık Faiz Oranı
                            </div>

                            <div className="flex items-baseline justify-center font-extrabold text-white drop-shadow-lg">
                                <span className="text-4xl md:text-6xl text-foreground/40 mr-2">%</span>
                                <span className="text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/60 tracking-tighter">{rateMain}</span>
                                {rateDecimal && <span className="text-4xl md:text-6xl text-foreground/40 ml-1">,{rateDecimal}</span>}
                            </div>

                            <p className="text-foreground/60 mt-8 max-w-lg mx-auto text-lg">
                                {pageData.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* DETAY BİLGİLERİ GRID */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    
                    {/* Vade Seçenekleri */}
                    <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-8 hover:bg-foreground/10 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                                <Calendar size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Vade Seçenekleri</h3>
                        </div>
                        <ul className="space-y-4">
                            {pageData.termOptions.map((item, idx) => (
                                <li key={idx} className="flex justify-between items-center text-sm border-b border-foreground/10 pb-3 last:border-0">
                                    <span className="text-foreground/60">{item.label}</span>
                                    <span className="text-foreground font-semibold">{item.value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kesinti ve Masraflar */}
                    <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-8 hover:bg-foreground/10 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <Percent size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Kesinti Oranları</h3>
                        </div>
                        <ul className="space-y-4">
                            {pageData.deductionRates.map((item, idx) => (
                                <li key={idx} className="flex justify-between items-center text-sm border-b border-foreground/10 pb-3 last:border-0">
                                    <span className="text-foreground/60">{item.label}</span>
                                    <span className="text-foreground font-semibold">{item.value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* DİPNOT */}
                <div className="mt-8 flex items-start gap-4 p-6 bg-primary/5 border border-primary/10 rounded-xl">
                    <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground/70 leading-relaxed">
                        <p>{pageData.disclaimer}</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <Link href="/kredi-hesaplama">
                        <button className="px-10 py-4 bg-accent hover:bg-accent/90 text-background font-bold text-lg rounded-xl shadow-lg shadow-accent/20 transition-all transform hover:scale-105">
                            Kredi Hesaplama Aracına Git
                        </button>
                    </Link>
                </div>
            </>
            )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FaizOrani;