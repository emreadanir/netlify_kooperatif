// Bu dosya Next.js tarafından otomatik kullanılır.
// Sayfa içeriği hazırlanırken kullanıcıya anında bu bileşen gösterilir.

export default function Loading() {
  return (
    // ⭐️ GÜNCELLEME: Sabit bg-[#0f172a] yerine bg-background kullanıldı
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        {/* Logo veya İkon */}
        <div className="relative">
            {/* ⭐️ GÜNCELLEME: Sabit indigo-500 yerine primary kullanıldı */}
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse"></div>
            
            {/* ⭐️ GÜNCELLEME: Sabit slate-900 ve slate-800 yerine foreground/5 (transparan) kullanıldı */}
            <div className="relative bg-foreground/5 p-4 rounded-2xl border border-foreground/10 shadow-2xl backdrop-blur-sm">
                {/* ⭐️ GÜNCELLEME: Spinner rengi primary yapıldı */}
                <div className="w-12 h-12 rounded-full border-4 border-foreground/20 border-t-primary animate-spin"></div>
            </div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
            {/* ⭐️ GÜNCELLEME: Metin rengi text-foreground yapıldı */}
            <h3 className="text-foreground font-bold text-lg tracking-wide">Yükleniyor</h3>
            <p className="text-foreground/50 text-xs animate-pulse">Lütfen bekleyiniz...</p>
        </div>
      </div>
    </div>
  );
}