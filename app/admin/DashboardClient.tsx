"use client";

import React, { useState } from 'react';
import { logout } from '@/app/actions/auth';
import { 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  Megaphone, 
  Briefcase, 
  UserCheck, 
  FileSearch, 
  Users, 
  ChevronDown,
  FileText,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardClient() {
  // Mobil menü durumu
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 font-sans flex relative">
      
      {/* MOBİL MENÜ OVERLAY (Siyah Arka Plan) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SOL MENÜ (SIDEBAR) */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Yönetim Paneli</h2>
            <p className="text-xs text-slate-500 mt-1">Kooperatif v1.0</p>
          </div>
          {/* Mobilde menüyü kapatma butonu */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <Link 
            href="/admin" 
            onClick={() => setIsSidebarOpen(false)}
            className="px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center gap-3 font-medium cursor-pointer transition-colors"
          >
            <LayoutDashboard size={20} />
            Anasayfa
          </Link>
          
          <Link 
            href="/admin/duyurular" 
            onClick={() => setIsSidebarOpen(false)}
            className="px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center gap-3 font-medium cursor-pointer transition-colors"
          >
            <Megaphone size={20} />
            Duyurular
          </Link>

          <Link 
            href="/admin/sayfalar" 
            onClick={() => setIsSidebarOpen(false)}
            className="px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center gap-3 font-medium cursor-pointer transition-colors"
          >
            <FileText size={20} />
            Sayfalar
          </Link>

          <details className="group/kadro select-none"> 
            <summary className="px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center gap-3 font-medium cursor-pointer transition-colors list-none">
              <Briefcase size={20} />
              <span>Kadrolar</span>
              <ChevronDown size={16} className="ml-auto transition-transform duration-200 group-open/kadro:rotate-180 opacity-50" />
            </summary>
            
            <div className="pl-4 mt-1 space-y-1 border-l border-slate-800 ml-6">
              <Link 
                href="/admin/kadrolar/yonetim-kurulu" 
                onClick={() => setIsSidebarOpen(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg flex items-center gap-2 transition-colors"
              >
                 <UserCheck size={16} />
                 Yönetim Kurulu
              </Link>
              
              <Link 
                href="/admin/kadrolar/denetim-kurulu" 
                onClick={() => setIsSidebarOpen(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg flex items-center gap-2 transition-colors"
              >
                 <FileSearch size={16} />
                 Denetim Kurulu
              </Link>
              
              <Link 
                href="/admin/kadrolar/personel-kadrosu" 
                onClick={() => setIsSidebarOpen(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg flex items-center gap-2 transition-colors"
              >
                 <Users size={16} />
                 Personel Kadrosu
              </Link>
            </div>
          </details>

          <div className="px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center gap-3 font-medium cursor-pointer transition-colors opacity-50 cursor-not-allowed" title="Yakında">
            <Settings size={20} />
            Ayarlar
          </div>
        </nav>
      </aside>

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen transition-all duration-300">
        
        {/* HEADER */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
           
           {/* Mobilde Menü Butonu */}
           <div className="flex items-center gap-3 md:hidden">
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
             >
                <Menu size={24} />
             </button>
             <h1 className="text-lg font-bold text-white">Admin</h1>
           </div>

           {/* Masaüstü Başlık (Mobilde Gizli) */}
           <h1 className="text-lg font-bold text-white hidden md:block">Yönetim Paneli</h1>
           
           <div className="flex items-center gap-4 ml-auto">
              
              {/* GÜVENLİ ÇIKIŞ BUTONU */}
              <form action={logout}>
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-all text-xs font-bold cursor-pointer">
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Güvenli Çıkış</span>
                </button>
              </form>

              {/* Ayırıcı Çizgi */}
              <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

              <div className="text-right hidden sm:block">
                 <p className="text-sm font-bold text-white">Admin Kullanıcısı</p>
                 <p className="text-xs text-slate-400">Süper Yönetici</p>
              </div>
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                A
              </div>
           </div>
        </header>

        {/* ANA İÇERİK */}
        <main className="flex-1 p-4 md:p-10 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
              <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
           </div>

           <div className="relative z-10 max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Hoş Geldiniz</h2>
                <p className="text-slate-400 text-sm md:text-base">Sol menüyü kullanarak web sitesinin içeriğini yönetebilirsiniz. İşte yapabilecekleriniz:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Tip 1: Duyurular */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
                      <Megaphone size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Duyuru Yönetimi</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Web sitesinde yayınlanacak duyuruları ekleyebilir, düzenleyebilir veya silebilirsiniz. Önemli duyuruları "Acil" olarak işaretleyerek anasayfada öne çıkarabilirsiniz.
                  </p>
                </div>

                {/* Tip 2: Sayfalar */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                      <FileText size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Sayfa Yönetimi</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Sitenizdeki "Hakkımızda", "İletişim" gibi temel sayfaların içeriklerini buradan düzenleyebilir ve yönetebilirsiniz.
                  </p>
                </div>

                {/* Tip 3: Yönetim Kurulu */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <UserCheck size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Yönetim Kadrosu</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Yönetim kurulu üyelerini ekleyebilir ve görevlerini güncelleyebilirsiniz. Listeyi sürükle-bırak yöntemiyle kolayca yeniden sıralayabilirsiniz.
                  </p>
                </div>

                {/* Tip 4: Diğer Kadrolar */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 group-hover:scale-110 transition-transform">
                      <Users size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Diğer Kadrolar</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Denetim kurulu üyelerini ve idari personelleri yönetebilirsiniz. Personelleri "Muhasebe", "Memur" gibi kategorilere ayırarak düzenli bir görünüm sağlayabilirsiniz.
                  </p>
                </div>

              </div>
           </div>
        </main>
      </div>
    </div>
  );
}