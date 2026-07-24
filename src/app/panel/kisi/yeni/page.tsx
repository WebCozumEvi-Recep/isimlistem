import KisiForm from "@/components/KisiForm";
import { kisiEkle } from "@/app/panel/actions";

// Mobil uygulama "Rehberden Seç" ile bu sayfaya ?ad=&tel=&email= ile gelir;
// form bu değerlerle önceden doldurulur.
export default async function YeniKisiSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ ad?: string; tel?: string; email?: string }>;
}) {
  const sp = await searchParams;
  const onDoldur =
    sp.ad || sp.tel || sp.email
      ? { adSoyad: sp.ad ?? "", telefon: sp.tel ?? "", email: sp.email ?? "" }
      : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-[18px] text-[22px] font-extrabold text-[#0F1B2D]">Yeni Aday İsmi Ekle</h1>
      <div className="rounded-[22px] border border-[#ECEFF3] bg-white p-5 shadow-[0_12px_30px_-22px_rgba(15,27,45,.5)]">
        <KisiForm action={kisiEkle} kisi={onDoldur} durumGoster gonderEtiket="Listeye Ekle" />
      </div>
    </div>
  );
}
