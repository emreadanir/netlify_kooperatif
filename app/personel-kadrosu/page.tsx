"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'; 
import Footer from '../../components/Footer'; 
import { Loader2 } from 'lucide-react';

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';

interface StaffMember {
  id: string;
  name: string;
  title: string;
  image: string;
  category: 'manager' | 'accounting' | 'officer' | 'service';
  order: number;
}

export default function PersonelKadrosu() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // ⭐️ YENİ: Sayfa Başlığını Ayarla
  useEffect(() => {
    document.title = "Personel Kadrosu | ESKKK";
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
      collection(db, 'artifacts', appId, 'public', 'data', 'staff-members'),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StaffMember[];
      
      setMembers(data);
      setLoading(false);
    }, (err) => {
      console.error("Data fetch error", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const manager = members.find(m => m.category === 'manager');
  const accountingTeam = members.filter(m => m.category === 'accounting');
  const officersTeam = members.filter(m => m.category === 'officer');
  const serviceTeam = members.filter(m => m.category === 'service');

  const MemberCard = ({ member }: { member: StaffMember }) => (
    <div className="group flex flex-col items-center transform transition duration-300 hover:-translate-y-2">
      <div className="relative w-40 h-52 p-1 rounded-lg bg-gradient-to-br from-foreground/20 via-foreground/40 to-foreground/20 shadow-lg group-hover:shadow-[0_0_25px_rgba(var(--color-primary),0.3)] transition-shadow duration-300 group-hover:from-primary group-hover:to-accent">
        <div className="w-full h-full bg-background rounded overflow-hidden border-2 border-background/50 relative">
           <img 
             src={member.image} 
             alt={member.name} 
             className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-60"></div>
        </div>
      </div>

      <div className="text-center mt-3">
        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
          {member.name}
        </h3>
        <p className="text-foreground/60 text-[11px] mt-0.5 font-medium uppercase tracking-wide group-hover:text-foreground transition-colors">
          {member.title}
        </p>
        <div className="w-0 group-hover:w-8 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto mt-2 transition-all duration-300"></div>
      </div>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center mb-12 mt-4">
        <div className="h-px bg-gradient-to-r from-transparent to-foreground/20 w-16 sm:w-32"></div>
        <h2 className="mx-6 text-foreground/80 text-sm font-bold uppercase tracking-[0.2em] text-center">
            {title}
        </h2>
        <div className="h-px bg-gradient-to-l from-transparent to-foreground/20 w-16 sm:w-32"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col transition-colors duration-500">
      <Navbar />
      
      <main className="flex-grow relative overflow-hidden">
        
        {/* --- ARKA PLAN EFEKTLERİ --- */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen"></div>
            <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] mix-blend-screen"></div>
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-secondary/10 blur-[100px] rounded-full mix-blend-screen"></div>
            <div className="absolute top-[60%] right-[-15%] w-[800px] h-[800px] bg-primary/15 rounded-full blur-[140px] mix-blend-screen"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent/15 rounded-full blur-[150px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 pt-28 pb-12 lg:pt-40 lg:pb-16 text-center">
            <div className="container mx-auto px-4">
                <div className="inline-flex items-center justify-center space-x-3 mb-4 opacity-90">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary"></div>
                    <span className="text-primary font-bold tracking-[0.25em] uppercase text-xs">HİZMET & GÜVEN</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary"></div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-4 leading-tight drop-shadow-2xl">
                  Personel <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">Kadrosu</span>
                </h1>
                
                <p className="text-foreground/60 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed">
                  Esnafımıza güler yüzle ve profesyonellikle hizmet veren idari ve yardımcı kadromuz.
                </p>
                
                <div className="mt-8 w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
            </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16">
            
            {loading ? (
               <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
               </div>
            ) : (
              <>
                {manager && (
                  <div className="flex justify-center mb-20">
                    <div className="group relative flex flex-col items-center transform transition duration-500 hover:scale-105">
                      <div className="relative w-48 h-64 p-1.5 rounded-xl bg-gradient-to-br from-secondary via-primary to-secondary shadow-[0_0_35px_rgba(var(--color-secondary),0.3)] z-10">
                        <div className="w-full h-full bg-background rounded-lg overflow-hidden border-4 border-background/50 relative">
                           <img src={manager.image} alt={manager.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-secondary text-background text-[10px] font-bold px-4 py-1 rounded-full shadow-lg border border-white/20 whitespace-nowrap uppercase tracking-wider">
                            MÜDÜR
                        </div>
                      </div>
                      <div className="text-center mt-5">
                        <h2 className="text-2xl font-bold text-foreground group-hover:text-secondary transition-colors drop-shadow-md">{manager.name}</h2>
                        <p className="text-secondary font-medium text-sm mt-1 uppercase tracking-wider opacity-90">{manager.title}</p>
                      </div>
                    </div>
                  </div>
                )}

                {accountingTeam.length > 0 && (
                    <div>
                        <SectionHeader title="Muhasebe Servisi" />
                        <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
                            {accountingTeam.map((member) => <MemberCard key={member.id} member={member} />)}
                        </div>
                    </div>
                )}

                {officersTeam.length > 0 && (
                    <div>
                        <SectionHeader title="Memurlar" />
                        <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
                            {officersTeam.map((member) => <MemberCard key={member.id} member={member} />)}
                        </div>
                    </div>
                )}

                {serviceTeam.length > 0 && (
                    <div>
                        <SectionHeader title="Yardımcı Hizmetler" />
                        <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
                            {serviceTeam.map((member) => <MemberCard key={member.id} member={member} />)}
                        </div>
                    </div>
                )}
                
                {members.length === 0 && (
                    <div className="text-center text-foreground/50 py-10">
                        Henüz personel eklenmemiş.
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