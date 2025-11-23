"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar'; 
import Footer from '@/components/Footer'; 
import { 
  Briefcase, Building2, Truck, Wallet, CreditCard, 
  CheckCircle2, Loader2 
} from 'lucide-react';
import Link from 'next/link';

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';

interface CreditType {
  id: string;
  title: string;
  description: string;
  features: string[];
  iconName: string;
  color: 'amber' | 'indigo' | 'cyan';
  link?: string;
}

const iconMap: { [key: string]: any } = {
  Briefcase,
  Building2,
  Truck,
  Wallet,
  CreditCard
};

export default function KrediCesitleri() {
  const [credits, setCredits] = useState<CreditType[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // ⭐️ YENİ: Sayfa Başlığını Ayarla
  useEffect(() => {
    document.title = "Kredi Çeşitleri | ESKKK";
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

    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'credit-types'),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CreditType[];
      
      setCredits(data);
      setLoading(false);
    }, (err) => {
      console.error("Data fetch error", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col transition-colors duration-500">
      <Navbar />
      
      <main className="flex-grow relative overflow-hidden">
        
        {/* --- GLOBAL ARKA PLAN EFEKTLERİ (Dinamik) --- */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen"></div>
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-accent/10 blur-[90px] rounded-full mix-blend-screen"></div>
            <div className="absolute top-[60%] right-[-15%] w-[800px] h-[800px] bg-foreground/5 rounded-full blur-[140px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 pt-28 pb-12 lg:pt-40 lg:pb-16 text-center">
            <div className="container mx-auto px-4">
                <div className="inline-flex items-center justify-center space-x-3 mb-4 opacity-90">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-accent"></div>
                    <span className="text-accent font-bold tracking-[0.25em] uppercase text-xs md:text-sm">FİNANSAL ÇÖZÜMLER</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-accent"></div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight drop-shadow-2xl">
                  Kredi <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary">Çeşitleri</span>
                </h1>
                
                <p className="text-foreground/60 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
                  İşletmenizi büyütmek, yeni bir iş yeri almak veya aracınızı yenilemek için size en uygun finansman desteğini sunuyoruz.
                </p>
                
                <div className="mt-12 w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
            </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            
            {loading ? (
               <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-accent animate-spin" />
               </div>
            ) : (
                <div className="flex flex-wrap justify-center -m-4">
                    {credits.map((credit) => {
                        // ⭐️ GÜNCELLEME: Renkleri tema renklerine bağladık
                        const colorClasses = {
                            amber: "text-secondary bg-secondary/10 border-secondary/20 group-hover:border-secondary/40 group-hover:shadow-secondary/10",
                            indigo: "text-primary bg-primary/10 border-primary/20 group-hover:border-primary/40 group-hover:shadow-primary/10",
                            cyan: "text-accent bg-accent/10 border-accent/20 group-hover:border-accent/40 group-hover:shadow-accent/10",
                        }[credit.color] || "text-foreground/60 bg-foreground/5 border-foreground/10";

                        const IconComponent = iconMap[credit.iconName] || Briefcase;

                        return (
                            <div key={credit.id} className="w-full md:w-1/2 lg:w-1/3 p-4">
                                <div className={`group flex flex-col h-full bg-foreground/5 backdrop-blur-sm border border-foreground/10 rounded-3xl p-8 transition-all duration-300 hover:bg-foreground/10 hover:-translate-y-2 hover:shadow-2xl ${colorClasses.split(' ').pop()}`}>
                                    
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${colorClasses.split(' ').slice(1, 3).join(' ')}`}>
                                        <IconComponent size={32} className={`${colorClasses.split(' ')[0]}`} />
                                    </div>

                                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-foreground/90 transition-colors">
                                        {credit.title}
                                    </h3>
                                    <p className="text-foreground/60 text-sm leading-relaxed mb-8 flex-grow">
                                        {credit.description}
                                    </p>

                                    <ul className="space-y-3">
                                        {credit.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start text-sm text-foreground/80">
                                                <CheckCircle2 size={16} className={`mr-2 mt-0.5 shrink-0 ${colorClasses.split(' ')[0]}`} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && credits.length === 0 && (
                <div className="text-center py-20 bg-foreground/5 rounded-3xl border border-foreground/10">
                    <p className="text-foreground/60 text-lg">Henüz kredi çeşitleri eklenmemiş.</p>
                    <p className="text-foreground/50 text-sm mt-2">Yönetim panelinden içerik ekleyebilirsiniz.</p>
                </div>
            )}

            {/* Alt Bilgi Alanı */}
            <div className="mt-16 relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/20 to-foreground/10 border border-primary/20 p-8 md:p-12 text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4">
                        <Wallet className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Kredi Hesaplama Aracı</h2>
                    <p className="text-foreground/60 max-w-2xl mx-auto mb-8">
                        İhtiyacınız olan kredi tutarını ve vadeyi belirleyerek tahmini ödeme planınızı hemen oluşturabilirsiniz.
                    </p>
                    <Link href="/kredi-hesaplama">
                        <button className="px-8 py-4 bg-accent hover:bg-accent/80 text-background font-bold rounded-xl shadow-lg shadow-accent/20 transition-all transform hover:scale-105">
                            Hemen Hesapla
                        </button>
                    </Link>
                </div>
            </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}