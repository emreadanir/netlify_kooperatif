"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';
import { 
  Search, Plus, Trash2, Edit, Save, X, 
  Loader2, AlertCircle, Database, ArrowLeft, CheckCircle2, Upload, FileSpreadsheet, Download 
} from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx'; 

// Veri Tipi
interface NaceCode {
  id: string;
  MESLEK: string;
  NACE_KODU: string;
  NACE_TANIMI: string;
  UST_LIMIT_TL: number;
}

export default function LimitSorgulamaYonetimi() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [naceList, setNaceList] = useState<NaceCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    MESLEK: '',
    NACE_KODU: '',
    NACE_TANIMI: '',
    UST_LIMIT_TL: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth
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

    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'nace-codes'),
      orderBy('NACE_KODU', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NaceCode[];
      setNaceList(data);
      setLoading(false);
    }, (error) => {
      console.error("Veri çekme hatası:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filtreleme
  const filteredList = useMemo(() => {
    return naceList.filter(item => 
      item.NACE_KODU.includes(searchTerm) || 
      item.MESLEK.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.NACE_TANIMI.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [naceList, searchTerm]);

  // Form İşlemleri
  const resetForm = () => {
    setFormData({ MESLEK: '', NACE_KODU: '', NACE_TANIMI: '', UST_LIMIT_TL: '' });
    setEditingId(null);
  };

  const handleEditClick = (item: NaceCode) => {
    setFormData({
      MESLEK: item.MESLEK,
      NACE_KODU: item.NACE_KODU,
      NACE_TANIMI: item.NACE_TANIMI,
      UST_LIMIT_TL: item.UST_LIMIT_TL.toString()
    });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const docData = {
        MESLEK: formData.MESLEK,
        NACE_KODU: formData.NACE_KODU,
        NACE_TANIMI: formData.NACE_TANIMI,
        UST_LIMIT_TL: Number(formData.UST_LIMIT_TL),
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'nace-codes', editingId), docData);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'nace-codes'), {
            ...docData,
            createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (error) {
      console.error("İşlem hatası:", error);
      alert("Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'nace-codes', id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  // --- EXCEL İŞLEMLERİ ---

  // Örnek Şablon İndirme
  const handleDownloadTemplate = () => {
    const templateData = [
        { MESLEK: "Örnek Meslek", NACE_KODU: "123456", NACE_TANIMI: "Örnek Faaliyet Tanımı", UST_LIMIT_TL: 500000 }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "NaceKodlari");
    XLSX.writeFile(workbook, "nace_yukleme_sablonu.xlsx");
  };

  // Excel Dosyası Yükleme
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
        try {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws) as any[];

            if (data.length === 0) {
                alert("Excel dosyası boş veya okunamadı.");
                setIsUploading(false);
                return;
            }

            // Veri doğrulama ve formatlama
            const formattedData = data.map(row => ({
                MESLEK: row.MESLEK || row.meslek || "Belirtilmemiş",
                NACE_KODU: String(row.NACE_KODU || row.nace_kodu || "").trim(),
                NACE_TANIMI: row.NACE_TANIMI || row.nace_tanimi || "",
                UST_LIMIT_TL: Number(row.UST_LIMIT_TL || row.ust_limit_tl || 0)
            })).filter(item => item.NACE_KODU.length >= 4 && item.UST_LIMIT_TL > 0);

            if (formattedData.length === 0) {
                alert("Geçerli veri bulunamadı. Sütun isimlerinin (MESLEK, NACE_KODU, NACE_TANIMI, UST_LIMIT_TL) doğru olduğundan emin olun.");
                setIsUploading(false);
                return;
            }

            if (!confirm(`${formattedData.length} adet kayıt veritabanına eklenecek. Onaylıyor musunuz?`)) {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            // Batch Yükleme (Firestore limitleri nedeniyle 500'erli gruplar halinde)
            const chunkSize = 450; 
            for (let i = 0; i < formattedData.length; i += chunkSize) {
                const chunk = formattedData.slice(i, i + chunkSize);
                const batch = writeBatch(db);
                
                chunk.forEach((item) => {
                    const docRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'nace-codes'));
                    batch.set(docRef, {
                        ...item,
                        createdAt: serverTimestamp()
                    });
                });

                await batch.commit();
            }

            alert("Veriler başarıyla yüklendi!");
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (error) {
            console.error("Excel yükleme hatası:", error);
            alert("Dosya yüklenirken bir hata oluştu.");
        } finally {
            setIsUploading(false);
        }
    };

    reader.readAsBinaryString(file);
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 p-6 md:p-12">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="text-indigo-500" />
            Limit Sorgulama Yönetimi
          </h1>
          <p className="text-slate-400 text-sm mt-1">NACE kodları ve kredi limitlerini buradan yönetebilirsiniz.</p>
        </div>
        <div className="flex gap-3">
            <Link href="/admin" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-slate-700">
                <ArrowLeft size={16} />
                Geri Dön
            </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        
        {/* --- SOL: FORM ALANI --- */}
        <div className="lg:col-span-4">
          <div className={`bg-slate-800/50 border rounded-2xl p-6 sticky top-6 transition-all duration-300 ${editingId ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-slate-700/50'}`}>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${editingId ? 'text-amber-400' : 'text-white'}`}>
                {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5 text-indigo-400" />}
                {editingId ? 'Kaydı Düzenle' : 'Yeni Kayıt Ekle'}
              </h3>
              {editingId && (
                <button onClick={resetForm} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded transition-colors">
                  <X size={12} /> Vazgeç
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">NACE Kodu</label>
                <input 
                  type="text" 
                  value={formData.NACE_KODU}
                  onChange={(e) => setFormData({...formData, NACE_KODU: e.target.value.replace(/\D/g, '')})}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono tracking-wider"
                  placeholder="Örn: 561107"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Meslek Grubu</label>
                <input 
                  type="text" 
                  value={formData.MESLEK}
                  onChange={(e) => setFormData({...formData, MESLEK: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Örn: Börekçilik"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Detaylı Tanım</label>
                <textarea 
                  rows={3}
                  value={formData.NACE_TANIMI}
                  onChange={(e) => setFormData({...formData, NACE_TANIMI: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none text-sm"
                  placeholder="Vergi levhasında yazan açıklama..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kredi Üst Limiti (TL)</label>
                <input 
                  type="number" 
                  value={formData.UST_LIMIT_TL}
                  onChange={(e) => setFormData({...formData, UST_LIMIT_TL: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="600000"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${
                  editingId 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
                }`}
              >
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : (editingId ? <><Save size={18} /> Güncelle</> : <><Plus size={18} /> Kaydet</>)}
              </button>

            </form>

            {/* --- EXCEL YÜKLEME BÖLÜMÜ --- */}
            <div className="mt-8 pt-6 border-t border-slate-700">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> 
                    Toplu Veri Yükleme (Excel)
                </h4>
                
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Excel (.xlsx) dosyanızı yükleyerek yüzlerce kaydı tek seferde ekleyebilirsiniz. 
                    </p>
                    
                    <button 
                        onClick={handleDownloadTemplate}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                    >
                        <Download size={14} /> Örnek Şablonu İndir
                    </button>

                    <div className="relative group">
                        <input 
                            type="file" 
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        />
                        <button 
                            disabled={isUploading}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-70"
                        >
                            {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload size={16} />}
                            {isUploading ? 'Yükleniyor...' : 'Excel Dosyası Seç ve Yükle'}
                        </button>
                    </div>
                </div>
            </div>

          </div>
        </div>

        {/* --- SAĞ: LİSTE --- */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* Arama ve İstatistik */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
                <div className="relative w-full sm:w-auto flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Kod, meslek veya tanım ara..." 
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-xs text-slate-400 font-medium bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                    Toplam <span className="text-white font-bold">{naceList.length}</span> Kayıt
                </div>
            </div>

            {/* Liste */}
            <div className="space-y-3">
                {filteredList.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-800/20 rounded-2xl border border-slate-700/30 border-dashed">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Kayıt bulunamadı.</p>
                    </div>
                ) : (
                    filteredList.map((item) => (
                        <div key={item.id} className={`bg-slate-800/40 border rounded-xl p-4 transition-all group hover:bg-slate-800/60 hover:border-slate-600 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${editingId === item.id ? 'border-amber-500/50 bg-slate-800/80' : 'border-slate-700/50'}`}>
                            
                            {/* ⭐️ DÜZELTME YAPILAN KISIM:
                                1. w-16 h-16 -> w-auto h-16 ve min-w-[4rem]
                                2. text-lg -> text-sm
                                3. tracking-widest -> tracking-wide
                                4. px-3 eklendi
                            */}
                            <div className="flex items-center justify-center h-16 min-w-[4rem] w-auto px-3 bg-slate-900 rounded-xl border border-slate-700 shrink-0 font-mono text-sm font-bold text-indigo-400 tracking-wide shadow-inner text-center">
                                {item.NACE_KODU}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-white font-bold text-base truncate">{item.MESLEK}</h4>
                                    {editingId === item.id && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">Düzenleniyor</span>}
                                </div>
                                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-2">{item.NACE_TANIMI}</p>
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                    <CheckCircle2 size={12} />
                                    Limit: {formatMoney(item.UST_LIMIT_TL)}
                                </div>
                            </div>

                            <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-end sm:justify-center pl-2 border-l border-slate-700/50 ml-auto">
                                <button 
                                onClick={() => handleEditClick(item)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                title="Düzenle"
                                >
                                <Edit size={18} />
                                </button>
                                <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Sil"
                                >
                                <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}