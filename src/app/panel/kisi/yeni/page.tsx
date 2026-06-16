import KisiForm from "@/components/KisiForm";
import { kisiEkle } from "@/app/panel/actions";

export default function YeniKisiSayfasi() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Yeni Kişi Ekle</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <KisiForm action={kisiEkle} durumGoster gonderEtiket="Listeye Ekle" />
      </div>
    </div>
  );
}
