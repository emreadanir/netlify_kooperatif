"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer'; 
import { Search, CreditCard, TrendingUp, ShieldAlert, CheckCircle2, AlertCircle, Loader2, FileText, Briefcase, Barcode, Info } from 'lucide-react';
import Link from 'next/link';

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';

interface NaceData {
    MESLEK: string;
    NACE_KODU: string;
    NACE_TANIMI: string;
    UST_LIMIT_TL: number;
}

export default function LimitSorgulama() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(true); 
  const [searchResult, setSearchResult] = useState<'found' | 'notfound' | 'error' | null>(null); 
  const [foundData, setFoundData] = useState<NaceData | null>(null); 
  const [naceCode, setNaceCode] = useState<string>('');
  const [naceVerileri, setNaceVerileri] = useState<NaceData[]>([]);
  const [user, setUser] = useState<any>(null);

  // ⭐️ YENİ: Sayfa Başlığını Ayarla
  useEffect(() => {
    document.title = "Limit Sorgulama | ESKKK";
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

    const fetchData = async () => {
      try {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'nace-codes'));
        const querySnapshot = await getDocs(q);
        
        const data: NaceData[] = [];
        querySnapshot.forEach((doc) => {
            data.push(doc.data() as NaceData);
        });
        
        setNaceVerileri(data);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (naceCode.length < 4) { 
        setSearchResult('error'); 
        setFoundData(null);
        return;
    }
    
    setIsLoading(true);
    setSearchResult(null);
    setFoundData(null);

    setTimeout(() => {
      const result: NaceData | undefined = naceVerileri.find(item => item.NACE_KODU === naceCode);
      
      if (result) {
        setFoundData(result);
        setSearchResult('found');
      } else {
        setSearchResult('notfound');
      }
      setIsLoading(false);
    }, 800);
  };

  const formatMoney = (val: number): string => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col transition-colors duration-500">
      <Navbar />
      
      <main className="flex-grow relative overflow-hidden">
        
        {/* --- GLOBAL ARKA PLAN EFEKTLERİ (Primary/Secondary) --- */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-1/3 w-[900px] h-[500px] bg-accent/20 blur-[120px] rounded-full mix-blend-screen"></div>
        </div>

        <div className="relative z-10 pt-28 pb-12 lg:pt-40 lg:pb-16 text-center">
            <div className="container mx-auto px-4">
                <div className="inline-flex items-center justify-center space-x-3 mb-4 opacity-90">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-secondary"></div>
                    <span className="text-secondary font-bold tracking-[0.25em] uppercase text-xs md:text-sm">LİMİT & RİSK DURUMU</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-secondary"></div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight drop-shadow-2xl">
                  NACE Kodu İle <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-accent">Limit Sorgulama</span>
                </h1>
                
                <p className="text-foreground/60 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
                  Vergi levhanızda yer alan "Ana Faaliyet Kodu" (NACE) ile kooperatifimiz limitleri dahilinde kullanabileceğiniz azami tutarı öğrenin.
                </p>
                
                <div className="mt-12 w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>
            </div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            
            <div className="bg-foreground/5 backdrop-blur-xl border border-foreground/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>

                <form onSubmit={handleSearch} className="relative z-10">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-background/50 rounded-full mb-4 border border-foreground/10 shadow-inner">
                            <Search className="w-8 h-8 text-secondary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">NACE Kodu Sorgula</h3>
                        <p className="text-foreground/60 text-xs mt-2">Lütfen NACE kodunuzu bitişik giriniz (Örn: 561107)</p>
                        
                        {dataLoading && (
                            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-primary">
                                <Loader2 className="animate-spin w-3 h-3" /> Veritabanı hazırlanıyor...
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="relative">
                                <input 
                                  type="text" 
                                  maxLength={6}
                                  value={naceCode}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNaceCode(e.target.value.replace(/\D/g, ''))}
                                  className="w-full bg-background/60 border border-foreground/10 rounded-xl px-5 py-4 text-lg text-foreground placeholder-foreground/30 focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all tracking-widest text-center font-mono"
                                  placeholder="Kod Giriniz"
                                  disabled={dataLoading}
                                />
                                <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                            </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={isLoading || naceCode.length < 4 || dataLoading}
                          className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Kontrol Ediliyor...
                                </>
                            ) : (
                                <>
                                    Limiti Göster
                                    <CreditCard className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {searchResult === 'found' && foundData && (
                    <div className="mt-8 pt-8 border-t border-foreground/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gradient-to-br from-accent/30 to-background/50 border border-accent/30 rounded-2xl p-6">
                            <div className="flex items-center justify-center gap-2 text-accent mb-6">
                                <CheckCircle2 size={24} />
                                <span className="text-base font-bold uppercase tracking-wider">Kayıt Bulundu</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                                    <div className="flex items-center gap-2 text-foreground/60">
                                        <Briefcase size={16} />
                                        <span className="text-sm">Meslek Grubu</span>
                                    </div>
                                    <span className="text-foreground font-semibold text-right">{foundData.MESLEK}</span>
                                </div>
                                
                                <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                                    <div className="flex items-center gap-2 text-foreground/60">
                                        <Barcode size={16} />
                                        <span className="text-sm">NACE Kodu</span>
                                    </div>
                                    <span className="text-foreground font-mono">{foundData.NACE_KODU}</span>
                                </div>

                                <div className="flex flex-col gap-1 border-b border-foreground/10 pb-2">
                                    <div className="flex items-center gap-2 text-foreground/60">
                                        <FileText size={16} />
                                        <span className="text-sm">Tanım</span>
                                    </div>
                                    <span className="text-foreground/80 text-sm italic mt-1">{foundData.NACE_TANIMI}</span>
                                </div>
                                
                                <div className="pt-2 text-center">
                                    <p className="text-foreground/60 text-xs uppercase tracking-widest mb-1">Kredi Üst Limiti</p>
                                    <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary drop-shadow-lg">
                                        {formatMoney(foundData.UST_LIMIT_TL)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {searchResult === 'notfound' && (
                    <div className="mt-8 pt-8 border-t border-foreground/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gradient-to-br from-red-900/30 to-background/50 border border-red-500/30 rounded-2xl p-6 text-center">
                            <div className="flex items-center justify-center gap-2 text-red-400 mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Kayıt Bulunamadı</h3>
                            <p className="text-foreground/60 text-sm">
                                Girdiğiniz <strong>{naceCode}</strong> kodu ile eşleşen bir kayıt sistemimizde bulunamadı. Lütfen kodu kontrol edip tekrar deneyiniz.
                            </p>
                        </div>
                    </div>
                )}

                {searchResult === 'error' && (
                    <div className="mt-8 pt-8 border-t border-foreground/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gradient-to-br from-secondary/30 to-background/50 border border-secondary/30 rounded-2xl p-6 text-center">
                            <div className="flex items-center justify-center gap-2 text-secondary mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Hatalı Giriş</h3>
                            <p className="text-foreground/60 text-sm">
                                Lütfen NACE kodunu doğru formatta (en az 4 haneli, bitişik ve sadece rakamlardan oluşacak şekilde) giriniz.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-16">
                <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-2xl">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary mb-4">
                        <TrendingUp size={20} />
                    </div>
                    <h4 className="text-foreground font-bold mb-2">NACE Kodu Nedir?</h4>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                        İş yerinizin faaliyet alanını belirleyen 6 haneli koddur. Vergi levhanızda "Ana Faaliyet Kodu" başlığı altında bulabilirsiniz.
                    </p>
                </div>

                <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-2xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                        <ShieldAlert size={20} />
                    </div>
                    <h4 className="text-foreground font-bold mb-2">Risk Grubu</h4>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                        Kredi limitiniz sadece NACE koduna değil, kredi notunuza ve geçmiş ödeme performansınıza göre de değişiklik gösterebilir.
                    </p>
                </div>

                <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-2xl">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-4">
                        <CreditCard size={20} />
                    </div>
                    <h4 className="text-foreground font-bold mb-2">Mevcut Borçlar</h4>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                        Halkbank veya diğer kooperatiflerdeki mevcut risk bakiyeniz, burada görünen yeni limitinizden düşülür.
                    </p>
                </div>
            </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}