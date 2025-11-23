"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer'; 
import { FileText, Download, Eye, Loader2 } from 'lucide-react';

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';

interface DriveLinks {
  view: string;
  download: string;
}

interface Document {
  id: number;
  title: string;
  category: "Sözleşme" | "Kanun";
  date: string;
  size: string;
  fileUrl: string;
}

interface PageData {
  documents: Document[];
}

const getDriveLinks = (url: string): DriveLinks => {
  if (!url || url === "#") return { view: "#", download: "#" };
  if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/(.*?)\//);
      const fileId: string | null = idMatch ? idMatch[1] : null;

      if (fileId) {
        return {
          view: url, 
          download: `https://drive.google.com/uc?export=download&id=${fileId}` 
        };
      }
  }
  return { view: url, download: url };
};

const defaultDocuments: Document[] = [];

export default function KanunVeYonetmelikler() {
  const [documents, setDocuments] = useState<Document[]>(defaultDocuments);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // ⭐️ YENİ: Sayfa Başlığını Ayarla
  useEffect(() => {
    document.title = "Kanun ve Yönetmelikler | ESKKK";
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

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'page-content', 'laws-regulations');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PageData;
        if (data.documents && data.documents.length > 0) {
            setDocuments(data.documents);
        }
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
        
        {/* --- ARKA PLAN EFEKTLERİ (Primary/Secondary) --- */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px] mix-blend-screen"></div>
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-accent/10 blur-[90px] rounded-full mix-blend-screen"></div>
            <div className="absolute top-[60%] right-[-15%] w-[800px] h-[800px] bg-foreground/5 rounded-full blur-[140px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 pt-28 pb-12 lg:pt-40 lg:pb-16 text-center">
            <div className="container mx-auto px-4">
                <div className="inline-flex items-center justify-center space-x-3 mb-4 opacity-90">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary"></div>
                    <span className="text-primary font-bold tracking-[0.25em] uppercase text-xs">YASAL DAYANAKLAR</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary"></div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-4 leading-tight drop-shadow-2xl">
                  Mevzuat ve <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Yönetmelikler</span>
                </h1>
                
                <p className="text-foreground/60 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
                  Kooperatifimizin işleyişini düzenleyen temel kanunlar, ana sözleşmeler ve yasal prosedürlere buradan ulaşabilirsiniz.
                </p>
                
                <div className="mt-8 w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            
            {loading ? (
               <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
               </div>
            ) : (
                <div className="flex flex-wrap justify-center gap-8">
                    {documents.map((doc) => {
                        const links: DriveLinks = getDriveLinks(doc.fileUrl); 
                        
                        return (
                        <div key={doc.id} className="group relative bg-foreground/5 backdrop-blur-sm border border-foreground/10 rounded-2xl p-6 hover:bg-foreground/10 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 flex flex-col sm:flex-row items-start gap-6 w-full md:w-[calc(50%-1rem)]">
                            
                            {/* İkon Alanı */}
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-foreground/5 rounded-xl flex items-center justify-center border border-foreground/10 group-hover:border-secondary/30 group-hover:bg-secondary/10 transition-colors duration-300">
                                    <FileText className="w-7 h-7 text-foreground/60 group-hover:text-secondary transition-colors" />
                                </div>
                            </div>

                            <div className="flex-grow w-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                            doc.category === 'Kanun' 
                                            ? 'bg-secondary/10 text-secondary border border-secondary/20' 
                                            : 'bg-primary/10 text-primary border border-primary/20'
                                        }`}>
                                            {doc.category}
                                        </span>
                                        <h3 className="text-lg font-bold text-foreground/90 mt-3 group-hover:text-foreground transition-colors">
                                            {doc.title}
                                        </h3>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 mt-3 text-xs text-foreground/50 font-medium uppercase tracking-wide">
                                    <span>{doc.size}</span>
                                    <span className="w-1 h-1 bg-foreground/40 rounded-full"></span>
                                    <span>{doc.date}</span>
                                </div>

                                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-foreground/10">
                                    <a 
                                    href={links.view} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 flex-1 bg-foreground/5 hover:bg-foreground/10 text-foreground/80 hover:text-foreground py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer no-underline border border-transparent hover:border-foreground/20"
                                    >
                                        <Eye size={16} />
                                        İncele
                                    </a>
                                    <a 
                                    href={links.download}
                                    className="flex items-center justify-center gap-2 flex-1 bg-primary hover:bg-primary/90 text-background py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 cursor-pointer no-underline"
                                    >
                                        <Download size={16} />
                                        İndir
                                    </a>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            )}

            <div className="mt-16 p-6 bg-foreground/5 border border-foreground/10 rounded-xl text-center backdrop-blur-md">
                <p className="text-foreground/50 text-sm">
                    Listelenen dokümanlar PDF formatındadır. Görüntülemek için cihazınızda PDF okuyucu yüklü olmalıdır.
                </p>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}