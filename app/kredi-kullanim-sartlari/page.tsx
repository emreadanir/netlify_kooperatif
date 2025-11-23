"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar'; 
import Footer from '@/components/Footer'; 
import { CheckCircle2, FileText, ShieldCheck, UserCheck, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';

interface TeminatMadde {
    title: string;
    desc: string;
}

interface PageData {
    conditions: string[];
    conditionsActive?: boolean;
    collaterals: TeminatMadde[];
    collateralsActive?: boolean;
    commonDocs: string[];
    documentsActive?: boolean;
    financialDocs: string[];
}

const defaultData: PageData = {
    conditions: [],
    conditionsActive: true,
    collaterals: [],
    collateralsActive: true,
    commonDocs: [],
    documentsActive: true,
    financialDocs: []
};

export default function KrediKullanimSartlari() {
    const [pageData, setPageData] = useState<PageData>(defaultData);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // ⭐️ YENİ: Sayfa Başlığını Ayarla
    useEffect(() => {
        document.title = "Kredi Kullanım Şartları | ESKKK";
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

        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'page-content', 'credit-conditions');
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as PageData;
                setPageData({
                    ...data,
                    conditionsActive: data.conditionsActive !== undefined ? data.conditionsActive : true,
                    collateralsActive: data.collateralsActive !== undefined ? data.collateralsActive : true,
                    documentsActive: data.documentsActive !== undefined ? data.documentsActive : true
                });
            }
            setLoading(false);
        }, (err) => {
            console.error("Data fetch error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="min-h-screen bg-background font-sans text-foreground flex flex-col transition-colors duration-500">
            <Navbar />
            
            <main className="flex-grow relative overflow-hidden">
                
                {/* Arka Plan Efektleri */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen"></div>
                    <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen"></div>
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-secondary/10 blur-[90px] rounded-full mix-blend-screen"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent/15 rounded-full blur-[150px] mix-blend-screen"></div>
                </div>

                <div className="relative z-10 pt-28 pb-12 lg:pt-40 lg:pb-16 text-center">
                    <div className="container mx-auto px-4">
                        <div className="inline-flex items-center justify-center space-x-3 mb-4 opacity-90">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-accent"></div>
                            <span className="text-accent font-bold tracking-[0.25em] uppercase text-xs md:text-sm">BAŞVURU REHBERİ</span>
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-accent"></div>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight drop-shadow-2xl">
                        Kredi Kullanım <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary">Şartları</span>
                        </h1>
                        
                        <p className="text-foreground/60 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
                        Kooperatifimiz kefaletiyle kredi kullanabilmek için gerekli olan temel şartlar, istenen belgeler ve teminat koşulları.
                        </p>
                        
                        <div className="mt-12 w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
                    </div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-20">
                    
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-12 h-12 text-accent animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* 1. BÖLÜM: TEMEL ŞARTLAR */}
                            {pageData.conditionsActive && (
                                <div>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2 bg-accent/10 rounded-lg border border-accent/20">
                                            <UserCheck className="w-6 h-6 text-accent" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground">Kimler Kredi Kullanabilir?</h2>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-6">
                                        {pageData.conditions.map((item, idx) => (
                                            <div key={idx} className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] group p-6 bg-foreground/5 border border-foreground/10 rounded-2xl hover:bg-foreground/10 transition-all duration-300 hover:border-accent/30 flex items-start gap-4">
                                                <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                                                <p className="text-foreground/80 text-sm leading-relaxed group-hover:text-foreground transition-colors">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 2. BÖLÜM: TEMİNATLAR */}
                            {pageData.collateralsActive && (
                                <div className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-background/80 to-primary/10 p-8 lg:p-12">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
                                    
                                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                                </div>
                                                <h2 className="text-2xl font-bold text-foreground">Teminat Koşulları</h2>
                                            </div>
                                            <p className="text-foreground/60 leading-relaxed mb-6">
                                                Kredi kullanımında kooperatifimizin ve bankanın riskini teminat altına almak amacıyla, kredi tutarına ve kişinin mali durumuna göre aşağıdaki teminatlar istenmektedir.
                                            </p>
                                            <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20">
                                                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                <p className="text-primary/80 text-sm">
                                                    Teminat türü ve miktarı, talep edilen kredi limitine göre Yönetim Kurulu tarafından belirlenir.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {pageData.collaterals.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-foreground/10 hover:border-primary/30 transition-colors">
                                                    <div className="w-2 h-2 rounded-full bg-primary shrink-0"></div>
                                                    <div>
                                                        <h4 className="text-foreground font-bold text-sm">{item.title}</h4>
                                                        <p className="text-foreground/60 text-xs mt-0.5">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. BÖLÜM: GEREKLİ BELGELER */}
                            {pageData.documentsActive && (
                                <div>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2 bg-secondary/10 rounded-lg border border-secondary/20">
                                            <FileText className="w-6 h-6 text-secondary" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground">Başvuru İçin Gerekli Belgeler</h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-secondary mb-4 pb-2 border-b border-foreground/10">Ortak Belgeler</h3>
                                            <ul className="space-y-3">
                                                {pageData.commonDocs.map((doc, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                                                        <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 shrink-0"></div>
                                                        {doc}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6">
                                            <h3 className="text-lg font-bold text-secondary mb-4 pb-2 border-b border-foreground/10">Mali Belgeler</h3>
                                            <ul className="space-y-3">
                                                {pageData.financialDocs.map((doc, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                                                        <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 shrink-0"></div>
                                                        {doc}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="mt-16 text-center">
                        <p className="text-foreground/60 mb-6">
                            Şartları sağlıyor musunuz? Hemen ön başvurunuzu yapın, size dönüş yapalım.
                        </p>
                        <Link href="/iletisim">
                            <button className="px-10 py-4 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto">
                                Bize Ulaşın
                                <ArrowRight size={20} />
                            </button>
                        </Link>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}