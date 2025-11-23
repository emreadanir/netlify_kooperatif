"use client"; 

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link'; 
import { Users, ShieldCheck, FileText, ArrowRight, Calendar, Bell, ChevronLeft, ChevronRight, Megaphone, X, Loader2 } from 'lucide-react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';

// Duyuru Tipi
interface Announcement {
  id: string;
  title: string;
  summary: string;
  content?: string;
  date: string;
  category: string;
  urgent: boolean;
  order: number;
}

// Sayfa Veri Tipi
interface HomePageData {
  hero: {
    badge: string;
    titlePart1: string;
    titlePart2: string;
    description: string;
    button1Text: string;
    button1Url: string;
    button2Text: string;
    button2Url: string;
  };
  features: {
    card1: { title: string; description: string; buttonText: string; url: string };
    card2: { title: string; description: string; buttonText: string; url: string };
    card3: { title: string; description: string; buttonText: string; url: string };
  };
}

const DEFAULT_HOME_DATA: HomePageData = {
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

const Home: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [pageData, setPageData] = useState<HomePageData>(DEFAULT_HOME_DATA);
  const [user, setUser] = useState<any>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Firebase işlemleri
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

    // 1. Duyurular
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'announcements'), orderBy('order', 'asc'));
    const unsubAnnouncements = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
      setAnnouncements(data);
      setIsLoadingAnnouncements(false);
    }, () => setIsLoadingAnnouncements(false));

    // 2. Sayfa İçeriği (Realtime)
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'home_page');
    const unsubPageData = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const fetchedData = docSnap.data() as HomePageData;
            setPageData({
                hero: { ...DEFAULT_HOME_DATA.hero, ...fetchedData.hero },
                features: {
                    card1: { ...DEFAULT_HOME_DATA.features.card1, ...fetchedData.features?.card1 },
                    card2: { ...DEFAULT_HOME_DATA.features.card2, ...fetchedData.features?.card2 },
                    card3: { ...DEFAULT_HOME_DATA.features.card3, ...fetchedData.features?.card3 },
                }
            });
        }
    });

    return () => {
        unsubAnnouncements();
        unsubPageData();
    };
  }, [user]);

  // Slider Mantığı
  useEffect(() => {
    if (isPaused || announcements.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, announcements.length]);

  const handleNext = () => { if (announcements.length > 0) setActiveIndex((current) => (current + 1) % announcements.length); };
  const handlePrev = () => { if (announcements.length > 0) setActiveIndex((current) => (current - 1 + announcements.length) % announcements.length); };

  return (
    // ⭐️ GÜNCELLEME: bg-[#0f172a] yerine bg-background, text-gray-100 yerine text-foreground
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col transition-colors duration-500">
      <Navbar />

      <main className="flex-grow relative overflow-hidden">
        {/* Arkaplan Efektleri - Renkleri dinamik yapalım */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute top-[5%] right-[-5%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[100px] mix-blend-screen"></div>
            <div className="absolute bottom-[10%] left-1/3 w-[900px] h-[500px] bg-foreground/5 blur-[120px] rounded-full mix-blend-screen"></div>
        </div>

        <section className="relative z-10 pt-28 pb-24 lg:pt-40 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-16">
            
            {/* SOL TARAF (DİNAMİK HERO) */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              {/* ⭐️ GÜNCELLEME: Sabit indigo renkler primary ile değiştirildi */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                {pageData.hero.badge}
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground leading-tight mb-6 drop-shadow-2xl">
                {pageData.hero.titlePart1} <br />
                {/* ⭐️ GÜNCELLEME: Gradient primary ve secondary arasında */}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary">{pageData.hero.titlePart2}</span>
              </h1>
              <p className="text-foreground/60 text-lg lg:text-xl leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                {pageData.hero.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <Link href={pageData.hero.button1Url}>
                  {/* ⭐️ GÜNCELLEME: Buton renkleri */}
                  <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold text-lg shadow-lg shadow-primary/25 transition-all transform hover:scale-105">
                    {pageData.hero.button1Text}
                  </button>
                </Link>
                <Link href={pageData.hero.button2Url}>
                  <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground font-bold text-lg backdrop-blur-sm transition-all flex items-center justify-center gap-2 group">
                    {pageData.hero.button2Text} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </Link>
              </div>
            </div>
            
            {/* SAĞ TARAF: DUYURULAR SLIDER */}
            <div className="w-full lg:w-5/12 relative mt-10 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
              
              {/* ⭐️ GÜNCELLEME: Kart arka planı foreground/5 (cam efekti) */}
              <div className="relative bg-background/60 backdrop-blur-xl border border-foreground/10 rounded-3xl shadow-2xl flex flex-col h-[500px] overflow-hidden group" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
                  
                  {/* Başlık */}
                  <div className="bg-background/80 p-6 border-b border-foreground/10 flex items-center justify-between z-20 absolute top-0 left-0 right-0 rounded-t-3xl backdrop-blur-md">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-secondary/10 rounded-lg border border-secondary/20 text-secondary"><Bell size={20} /></div>
                          <div>
                              <h3 className="font-bold text-lg text-foreground">Duyurular</h3>
                              <p className="text-xs text-foreground/60 flex items-center gap-1">
                                {isLoadingAnnouncements ? 'Yükleniyor...' : isPaused ? 'Akış Duraklatıldı' : 'Otomatik Akış'} 
                                {!isLoadingAnnouncements && <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>}
                              </p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={handlePrev} disabled={announcements.length <= 1} className="p-2 bg-foreground/5 hover:bg-foreground/10 text-foreground/80 rounded-lg transition-colors border border-foreground/10 disabled:opacity-50"><ChevronLeft size={18} /></button>
                          <button onClick={handleNext} disabled={announcements.length <= 1} className="p-2 bg-foreground/5 hover:bg-foreground/10 text-foreground/80 rounded-lg transition-colors border border-foreground/10 disabled:opacity-50"><ChevronRight size={18} /></button>
                      </div>
                  </div>

                  {/* Slider İçeriği */}
                  <div className="relative flex-grow h-full pt-20 pb-12">
                      {isLoadingAnnouncements ? (
                        <div className="h-full flex flex-col items-center justify-center text-foreground/50 gap-3">
                           <Loader2 className="w-8 h-8 animate-spin text-primary" />
                           <span className="text-sm">Veriler yükleniyor...</span>
                        </div>
                      ) : announcements.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-foreground/50 p-8 text-center">
                           <Megaphone className="w-12 h-12 mb-4 opacity-20" />
                           <p className="text-lg font-medium text-foreground/60">Şu an aktif duyuru bulunmuyor.</p>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex transition-transform duration-700 ease-in-out h-full" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                            {announcements.map((item) => (
                                <div key={item.id} className="min-w-full h-full p-8 flex flex-col justify-center relative pt-16">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                                    
                                    <div className="mb-6">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${item.urgent ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                            {item.category}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-foreground/60 text-sm font-medium mb-3">
                                        <Calendar size={16} className="text-secondary" />
                                        {item.date}
                                    </div>
                                    
                                    <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-4 drop-shadow-md line-clamp-3">
                                        {item.title}
                                    </h2>
                                    
                                    <p className="text-foreground/70 leading-relaxed text-sm md:text-base line-clamp-4">
                                        {item.summary}
                                    </p>
                                    
                                    <div className="mt-8">
                                        <button 
                                          onClick={() => setSelectedAnnouncement(item)}
                                          className="inline-flex items-center gap-2 text-secondary font-bold hover:text-primary transition-colors group/link"
                                        >
                                            Detayları İncele 
                                            <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                      )}
                  </div>

                  {/* Alt Göstergeler (Dots) */}
                  {!isLoadingAnnouncements && announcements.length > 0 && (
                    <div className="bg-background/30 p-4 border-t border-foreground/10 flex justify-center items-center gap-2 z-20 absolute bottom-0 left-0 right-0 backdrop-blur-sm">
                        {announcements.map((_, idx) => (
                            <button key={idx} onClick={() => setActiveIndex(idx)} className={`transition-all duration-300 rounded-full ${activeIndex === idx ? 'w-8 h-2 bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)]' : 'w-2 h-2 bg-foreground/20 hover:bg-foreground/40'}`} />
                        ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </section>

        {/* ... Hızlı Erişim Kartları (DİNAMİK) ... */}
        <section className="relative z-10 py-20">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Göz Atın</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                 
                 {/* KART 1 - Renkleri de temaya bağladık */}
                 <div className="group p-8 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 hover:border-secondary/30 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/10 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[50px] -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0"></div>
                    <Users className="w-12 h-12 text-secondary mb-6"/>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{pageData.features.card1.title}</h3>
                    <p className="text-foreground/60 mb-6 text-sm leading-relaxed">{pageData.features.card1.description}</p>
                    <Link href={pageData.features.card1.url} className="inline-flex items-center text-secondary font-semibold hover:text-primary transition-colors group-hover:gap-2">
                        {pageData.features.card1.buttonText} <ArrowRight size={16} className="ml-1"/>
                    </Link>
                 </div>

                 {/* KART 2 */}
                 <div className="group p-8 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 hover:border-primary/30 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0"></div>
                    <FileText className="w-12 h-12 text-primary mb-6"/>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{pageData.features.card2.title}</h3>
                    <p className="text-foreground/60 mb-6 text-sm leading-relaxed">{pageData.features.card2.description}</p>
                    <Link href={pageData.features.card2.url} className="inline-flex items-center text-primary font-semibold hover:text-accent transition-colors group-hover:gap-2">
                        {pageData.features.card2.buttonText} <ArrowRight size={16} className="ml-1"/>
                    </Link>
                 </div>

                 {/* KART 3 */}
                 <div className="group p-8 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 hover:border-accent/30 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[50px] -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-0"></div>
                    <ShieldCheck className="w-12 h-12 text-accent mb-6"/>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{pageData.features.card3.title}</h3>
                    <p className="text-foreground/60 mb-6 text-sm leading-relaxed">{pageData.features.card3.description}</p>
                    <Link href={pageData.features.card3.url} className="inline-flex items-center text-accent font-semibold hover:text-primary transition-colors group-hover:gap-2">
                        {pageData.features.card3.buttonText} <ArrowRight size={16} className="ml-1"/>
                    </Link>
                 </div>

              </div>
           </div>
        </section>
      </main>

      {/* DUYURU DETAY MODALI */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedAnnouncement(null)}
          ></div>
          <div className="relative bg-background border border-foreground/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 lg:p-8 border-b border-foreground/10 flex items-start justify-between bg-foreground/5">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${selectedAnnouncement.urgent ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    {selectedAnnouncement.category}
                  </span>
                  <span className="text-xs text-foreground/60 flex items-center gap-1.5">
                    <Calendar size={12} />
                    {selectedAnnouncement.date}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight break-words">{selectedAnnouncement.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground rounded-lg transition-colors shrink-0 ml-4"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 lg:p-10 overflow-y-auto custom-scrollbar">
              <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap break-all">
                  {selectedAnnouncement.content || selectedAnnouncement.summary}
                </p>
              </div>
            </div>
            <div className="p-4 lg:p-6 border-t border-foreground/10 bg-foreground/5 flex justify-end">
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="px-6 py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground font-bold rounded-xl transition-colors shadow-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Home;