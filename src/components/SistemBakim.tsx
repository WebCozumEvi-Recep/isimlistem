"use client";

import { useState, useTransition } from "react";
import { migrasyonCalistir, cacheBosalt, demoVerisiOlustur, type BakimSonuc } from "@/app/admin/actions";
import { Database, RefreshCw, Sparkles } from "lucide-react";

export default function SistemBakim() {
  const [bekliyor, basla] = useTransition();
  const [sonuc, setSonuc] = useState<(BakimSonuc & { islem: string }) | null>(null);
  const [aktif, setAktif] = useState<string | null>(null);

  function calistir(islem: string, fn: () => Promise<BakimSonuc>) {
    setAktif(islem);
    setSonuc(null);
    basla(async () => {
      const r = await fn();
      setSonuc({ ...r, islem });
      setAktif(null);
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Sistem Bakımı</h2>
        <p className="mt-1 text-xs text-slate-400">
          Veritabanı güncellemesi (migration) ve önbellek boşaltma. Bu işlemleri yalnızca gerektiğinde çalıştırın.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={bekliyor}
          onClick={() => calistir("migration", migrasyonCalistir)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          <Database size={16} />
          {bekliyor && aktif === "migration" ? "Çalışıyor…" : "Veritabanı Güncelle (Migration)"}
        </button>

        <button
          type="button"
          disabled={bekliyor}
          onClick={() => calistir("cache", cacheBosalt)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          <RefreshCw size={16} />
          {bekliyor && aktif === "cache" ? "Boşaltılıyor…" : "Önbelleği Boşalt"}
        </button>

        {/* GEÇİCİ: demo verisi seed butonu — bir kez kullanıldıktan sonra kaldırılabilir. */}
        <button
          type="button"
          disabled={bekliyor}
          onClick={() => calistir("demo", demoVerisiOlustur)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          <Sparkles size={16} />
          {bekliyor && aktif === "demo" ? "Oluşturuluyor…" : "Demo Verisi Oluştur (geçici)"}
        </button>
      </div>

      {sonuc && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            sonuc.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <p className="mb-1 font-semibold">
            {sonuc.ok ? "✓ Başarılı" : "✗ Hata"} —{" "}
            {sonuc.islem === "migration" ? "Migration" : sonuc.islem === "demo" ? "Demo Verisi" : "Önbellek"}
          </p>
          <pre className="max-h-52 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">{sonuc.mesaj}</pre>
        </div>
      )}
    </div>
  );
}
