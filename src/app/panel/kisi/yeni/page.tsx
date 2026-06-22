import KisiForm from "@/components/KisiForm";
import { kisiEkle } from "@/app/panel/actions";

export default function YeniKisiSayfasi() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-[18px] text-[22px] font-extrabold text-[#0F1B2D]">Yeni Aday İsmi Ekle</h1>
      <div className="rounded-[22px] border border-[#ECEFF3] bg-white p-5 shadow-[0_12px_30px_-22px_rgba(15,27,45,.5)]">
        <KisiForm action={kisiEkle} durumGoster gonderEtiket="Listeye Ekle" />
      </div>
    </div>
  );
}
