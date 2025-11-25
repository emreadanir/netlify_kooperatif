// Bu dosya Next.js tarafından otomatik kullanılır.
// Sayfa içeriği hazırlanırken kullanıcıya anında bu bileşen gösterilir.
// Bu sayede "Render-Blocking" hissi azalır ve FCP (First Contentful Paint) iyileşir.

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]">
      <div className="flex flex-col items-center gap-4">
        {/* Logo veya İkon */}
        <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full animate-pulse"></div>
            <div className="relative bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl">
                {/* Lucide ikonu yerine Saf CSS Spinner kullanıldı. Bu, JS bundle boyutunu ve ilk boyama süresini iyileştirir. */}
                <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
            </div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
            <h3 className="text-white font-bold text-lg tracking-wide">Yükleniyor</h3>
            <p className="text-slate-500 text-xs animate-pulse">Lütfen bekleyiniz...</p>
        </div>
      </div>
    </div>
  );
}