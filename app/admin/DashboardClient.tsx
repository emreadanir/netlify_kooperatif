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
  X,
  Globe,
  Calculator,
  Database,
  ArrowRight,
  Palette // Renk teması ikonu
} from 'lucide-react';
import Link from 'next/link';

// Dashboard Kart Verileri
const dashboardItems = [
  {
    title: "Duyuru Yönetimi",
    description: "Web sitesinde yayınlanacak duyuruları ekleyin, düzenleyin veya silin. Acil duyuruları öne çıkarın.",
    icon: Megaphone,
    href: "/admin/duyurular",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    hoverBorder: "group-hover:border-amber-500/50"
  },
  {
    title: "Sayfa İçerikleri",
    description: "Hakkımızda, İletişim, Faiz Oranları gibi temel sayfaların metinlerini ve görsellerini güncelleyin.",
    icon: FileText,
    href: "/admin/sayfalar",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    hoverBorder: "group-hover:border-blue-500/50"
  },
  {
    title: "Kredi Hesaplama Ayarları",
    description: "Hesaplama aracının faiz oranlarını, kesintilerini, vade seçeneklerini ve limitlerini buradan ayarlayın.",
    icon: Calculator,
    href: "/admin/sayfalar/kredi-hesaplama",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    hoverBorder: "group-hover:border-emerald-500/50"
  },
  {
    title: "Limit Sorgulama (NACE)",
    description: "Vergi levhasındaki NACE kodlarına göre kredi üst limitlerini belirleyin ve Excel ile toplu yükleme yapın.",
    icon: Database,
    href: "/admin/sayfalar/limit-sorgulama",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    hoverBorder: "group-hover:border-indigo-500/50"
  },
  {
    title: "Yönetim Kurulu",
    description: "Kooperatif yönetim kurulu üyelerini ekleyin, bilgilerini düzenleyin ve sıralamasını değiştirin.",
    icon: UserCheck,
    href: "/admin/kadrolar/yonetim-kurulu",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    hoverBorder: "group-hover:border-purple-500/50"
  },
  {
    title: "Denetim Kurulu",
    description: "Kooperatif denetim kurulu üyelerini ekleyin, bilgilerini düzenleyin ve sıralamasını değiştirin.",
    icon: FileSearch,
    href: "/admin/kadrolar/denetim-kurulu",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    hoverBorder: "group-hover:border-cyan-500/50"
  },
  {
    title: "Personel Kadrosu",
    description: "İdari personel, memurlar ve yardımcı hizmetler personelinin bilgilerini yönetin.",
    icon: Users,
    href: "/admin/kadrolar/personel-kadrosu",
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    hoverBorder: "group-hover:border-teal-500/50"
  },
  {
    title: "Site Görünümü & Ayarlar",
    description: "Logo, site başlığı, menü yapısı, footer bilgileri ve sosyal medya linklerini özelleştirebilirsiniz.",
    icon: Settings,
    href: "/admin/ayarlar/site-gorunumu",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    hoverBorder: "group-hover:border-pink-500/50"
  },
  {
    title: "Renk Teması",
    description: "Sitenin ana rengini, arka planını ve vurgu renklerini değiştirerek görünümü kişiselleştirin.",
    icon: Palette,
    href: "/admin/ayarlar/renkler",
    color: "text-fuchsia-400",
    bgColor: "bg-fuchsia-500/10",
    borderColor: "border-fuchsia-500/20",
    hoverBorder: "group-hover:border-fuchsia-500/50"
  }
];

export default function DashboardClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 font-sans flex relative">
      
      {/* MOBİL MENÜ OVERLAY */}
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
            className="px-4 py-3 bg-slate-800 text-white rounded-xl flex items-center gap-3 font-medium cursor-pointer transition-colors shadow-lg shadow-slate-900/50"
          >
            <LayoutDashboard size={20} className="text-blue-400" />
            Giriş
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

          {/* ONLINE İŞLEMLER MENÜSÜ */}
          <details className="group/online select-none"> 
            <summary className="px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center gap-3 font-medium cursor-pointer transition-colors list-none">
              <Globe size={20} />
              <span>Online İşlemler</span>
              <ChevronDown size={16} className="ml-auto transition-transform duration-200 group-open/online:rotate-180 opacity-50" />
            </summary>
            
            <div className="pl-4 mt-1 space-y-1 border-l border-slate-800 ml-6">
              <Link 
                href="/admin/sayfalar/kredi-hesaplama" 
                onClick={() => setIsSidebarOpen(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg flex items-center gap-2 transition-colors"
              >
                 <Calculator size={16} />
                 Kredi Hesaplama
              </Link>
              
              <Link 
                href="/admin/sayfalar/limit-sorgulama" 
                onClick={() => setIsSidebarOpen(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg flex items-center gap-2 transition-colors"
              >
                 <Database size={16} />
                 Limit Sorgulama
              </Link>
            </div>
          </details>

          {/* KADROLAR MENÜSÜ */}
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

          {/* AYARLAR MENÜSÜ */}
          {/* ⭐️ DEĞİŞİKLİK: 'open' özelliği kaldırıldı, varsayılan olarak kapalı */}
          <details className="group/settings select-none"> 
            <summary className="px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center gap-3 font-medium cursor-pointer transition-colors list-none">
              <Settings size={20} />
              <span>Ayarlar</span>
              <ChevronDown size={16} className="ml-auto transition-transform duration-200 group-open/settings:rotate-180 opacity-50" />
            </summary>
            
            <div className="pl-4 mt-1 space-y-1 border-l border-slate-800 ml-6">
                <Link 
                    href="/admin/ayarlar/site-gorunumu"
                    onClick={() => setIsSidebarOpen(false)} 
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Settings size={16} />
                    Üst & Alt Bilgi
                </Link>
                <Link 
                    href="/admin/ayarlar/renkler"
                    onClick={() => setIsSidebarOpen(false)} 
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Palette size={16} />
                    Renk Teması
                </Link>
            </div>
          </details>

        </nav>
      </aside>

      {/* SAĞ İÇERİK ALANI */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen transition-all duration-300">
        
        {/* HEADER */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
           <div className="flex items-center gap-3 md:hidden">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Menu size={24} />
             </button>
             <h1 className="text-lg font-bold text-white">Admin</h1>
           </div>
           <h1 className="text-lg font-bold text-white hidden md:block">Yönetim Paneli</h1>
           <div className="flex items-center gap-4 ml-auto">
              <form action={logout}>
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-all text-xs font-bold cursor-pointer">
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Güvenli Çıkış</span>
                </button>
              </form>
              <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
              <div className="text-right hidden sm:block">
                 <p className="text-sm font-bold text-white">Admin Kullanıcısı</p>
                 <p className="text-xs text-slate-400">Süper Yönetici</p>
              </div>
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">A</div>
           </div>
        </header>

        {/* ANA İÇERİK (DASHBOARD GRID) */}
        <main className="flex-1 p-4 md:p-10 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
              <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
           </div>

           <div className="relative z-10 max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Hoş Geldiniz</h2>
                <p className="text-slate-400 text-sm md:text-base">Sol menüyü kullanarak web sitesinin içeriğini yönetebilirsiniz. İşte yapabilecekleriniz:</p>
              </div>

              {/* KARTLAR GRID YAPISI */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardItems.map((item, index) => (
                  <Link 
                    href={item.href} 
                    key={index}
                    className={`group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.hoverBorder}`}
                  >
                    {/* İkon Kutusu */}
                    <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${item.bgColor} ${item.borderColor} ${item.color}`}>
                       <item.icon size={24} />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white transition-colors flex items-center justify-between">
                        {item.title}
                        <ArrowRight size={18} className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${item.color}`} />
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {item.description}
                    </p>
                  </Link>
                ))}
              </div>

           </div>
        </main>
      </div>
    </div>
  );
}