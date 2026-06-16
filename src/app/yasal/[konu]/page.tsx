import { notFound } from "next/navigation";
import Link from "next/link";

const ICERIK: Record<string, { baslik: string; metin: string[] }> = {
  kvkk: {
    baslik: "KVKK Aydınlatma Metni",
    metin: [
      "İsim Listem, kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işler.",
      "Bu davet bağlantısı size özel hazırlanmıştır. Sayfa ziyaretiniz, görüntüleme süreniz, video etkileşiminiz ve buton tıklamalarınız, daveti gönderen kullanıcıya geri bildirim sağlamak amacıyla kaydedilebilir.",
      "IP ve cihaz bilgileriniz açık biçimde saklanmaz; geri döndürülemez şekilde özetlenir (hash).",
      "Verilerinizin silinmesini talep etmek için 'Verilerimi sil' sayfasını kullanabilirsiniz.",
    ],
  },
  gizlilik: {
    baslik: "Gizlilik Politikası",
    metin: [
      "Eklenen aday bilgileri yalnızca ilgili kullanıcının kişisel takip listesinde saklanır ve başka kullanıcılarla paylaşılmaz.",
      "Sistem, adaylara kullanıcı adına otomatik mesaj göndermez. Tüm mesajlar kullanıcının kendi WhatsApp hesabından manuel gönderilir.",
      "Kurumsal firmalar, aday kişisel verilerini yalnızca adayın açık onayı varsa görebilir.",
    ],
  },
  "veri-silme": {
    baslik: "Verilerimi Sil / İletişim",
    metin: [
      "Kişisel verilerinizin silinmesini talep etmek için, daveti gönderen kişiyle iletişime geçebilir veya destek adresimize yazabilirsiniz.",
      "Talebiniz üzerine ilgili davet bağlantısı ve davranış kayıtları silinir/anonimleştirilir.",
      "İletişim: destek@isimlistem.com",
    ],
  },
  cerez: {
    baslik: "Çerez / Analitik Bilgilendirme",
    metin: [
      "Davet sayfalarında, ziyaret deneyimini ölçmek için oturum bazlı teknik kayıtlar tutulur.",
      "Bu kayıtlar pazarlama amaçlı üçüncü taraflarla paylaşılmaz.",
    ],
  },
  kullanim: {
    baslik: "Kullanım Koşulları",
    metin: [
      "İsim Listem, networker’ların kendi aday listelerini takip etmesi ve adaylarına kişiye özel davet linki göndermesi için sunulan bir araçtır.",
      "Kullanıcı, yalnızca iletişim kurma hakkına sahip olduğu kişileri aday olarak ekleyeceğini kabul eder. Sistem adaylara otomatik mesaj göndermez; tüm mesajlar kullanıcının kendi WhatsApp hesabından manuel gönderilir.",
      "Hizmet bir MLM, komisyon, sponsor ağacı veya kazanç planı sistemi değildir. Kullanıcılar arası aday paylaşımı yapılmaz.",
      "Bireysel networker kullanımı ücretsizdir. Kurumsal firmalar için Business panel ayrı koşullarla sunulur.",
      "Hizmet sağlayıcı: WAQUR TEKNOLOJİ TAR. MAD. SAN. VE TİC. LTD. ŞTİ.",
    ],
  },
};

export default async function YasalSayfa({ params }: { params: Promise<{ konu: string }> }) {
  const { konu } = await params;
  const d = ICERIK[konu];
  if (!d) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/" className="text-sm text-indigo-600">← Ana sayfa</Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">{d.baslik}</h1>
      <div className="mt-6 space-y-4">
        {d.metin.map((p, i) => (
          <p key={i} className="text-slate-600">{p}</p>
        ))}
      </div>
    </div>
  );
}
