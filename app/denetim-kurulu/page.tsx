"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer'; 
import { Loader2 } from 'lucide-react';

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';

interface AuditMember {
  id: string;
  name: string;
  title: string;
  image: string;
  order: number;
}

export default function DenetimKurulu() {
  const [members, setMembers] = useState<AuditMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // ⭐️ YENİ: Sayfa Başlığını Ayarla
  useEffect(() => {
    document.title = "Denetim Kurulu | ESKKK";
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
      collection(db, 'artifacts', appId, 'public', 'data', 'audit-members'),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditMember[];
      
      setMembers(data);
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
        
        {/* --- ARKA PLAN EFEKTLERİ --- */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-accent/20 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] mix-blend-screen"></div>
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-foreground/5 blur-[90px] rounded-full mix-blend-screen"></div>
            <div className="absolute top-[60%] right-[-15%] w-[800px] h-[800px] bg-secondary/15 rounded-full blur-[140px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent/15 rounded-full blur-[150px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 pt-28 pb-12 lg:pt-40 lg:pb-16 text-center">
            <div className="container mx-auto px-4">
                <div className="inline-flex items-center justify-center space-x-3 mb-4 opacity-90">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-accent"></div>
                    <span className="text-accent font-bold tracking-[0.25em] uppercase text-xs">ŞEFFAFLIK & GÜVEN</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-accent"></div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-4 leading-tight drop-shadow-2xl">
                  Denetim <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-accent">Kurulu</span>
                </h1>
                
                <p className="text-foreground/60 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
                  Kooperatifimizin işleyişini, mali yapısını ve mevzuata uygunluğunu denetleyen yetkili organımız.
                </p>
                
                <div className="mt-8 w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
            </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            
            {loading ? (
               <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-accent animate-spin" />
               </div>
            ) : (
                <>
                    <div className="flex flex-wrap justify-center gap-12 mt-8">
                        {members.map((member) => (
                        <div key={member.id} className="group flex flex-col items-center transform transition duration-300 hover:-translate-y-2">
                            
                            <div className="relative w-56 h-72 p-1.5 rounded-lg bg-gradient-to-br from-foreground/20 via-foreground/40 to-foreground/20 shadow-[0_0_25px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_40px_rgba(var(--color-accent),0.35)] transition-shadow duration-300 group-hover:from-accent group-hover:to-primary">
                            <div className="w-full h-full bg-background rounded overflow-hidden border-2 border-background/50 relative">
                                <img 
                                src={member.image} 
                                alt={member.name} 
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-60"></div>
                            </div>
                            </div>

                            <div className="text-center mt-5">
                            <h3 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors drop-shadow-sm">
                                {member.name}
                            </h3>
                            <p className="text-foreground/60 text-sm mt-1 font-medium uppercase tracking-wider group-hover:text-foreground transition-colors">
                                {member.title}
                            </p>
                            
                            <div className="w-0 group-hover:w-12 h-0.5 bg-gradient-to-r from-accent to-primary mx-auto mt-3 transition-all duration-300"></div>
                            </div>
                        </div>
                        ))}
                    </div>

                    {members.length === 0 && (
                        <div className="text-center text-foreground/50 py-10">
                            Henüz denetim kurulu üyesi eklenmemiş.
                        </div>
                    )}
                </>
            )}

        </div>
      </main>

      <Footer />
    </div>
  );
}