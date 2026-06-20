import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAyar } from "@/lib/ayarlar";
import { hostFirma } from "@/lib/host";
import Reveal from "@/components/Reveal";
import LandingNav from "@/components/LandingNav";
import SSS from "@/components/SSS";
import TalepFormu from "@/components/TalepFormu";
import {
  MessageCircle, BarChart3, UserPlus, Send, CalendarClock, ShieldCheck,
  ArrowRight, Building2, Flame, Check, ListChecks,
  PlayCircle, Layers, Phone, Mail, MapPin,
  VideoOff, Timer, User, X,
} from "lucide-react";

export const metadata = {
  title: "İsim Listem — Networker’lar için aday takip ve kişiye özel davet sistemi",
  description:
    "Adaylarını ekle, kişiye özel WhatsApp davet linki gönder, adayın sayfada ne yaptığını takip et. Bireysel networker’lara ücretsiz.",
};

export const dynamic = "force-dynamic";

export default async function Landing() {
  // Firma alt-alanından gelindiyse doğrudan kayıt/giriş akışına yönlendir.
  const firma = await hostFirma();
  if (firma) redirect("/auth/kayit");

  const session = await getSession();
  const ayar = await getAyar();
  const destek = ayar.destekEmail ?? "info@waqur.com";

  return (
    <div className="min-h-screen bg-[#fcf8fa] text-[#1b1b1d]">
      <LandingNav session={!!session} logoUrl={ayar.logoUrl} siteAdi={ayar.siteAdi} slogan={ayar.slogan} />

      {/* 2. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-[#fcf8fa]">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="anim-blob absolute -left-20 top-0 h-80 w-80 rounded-full bg-green-200/40 blur-3xl" />
          <div className="anim-blob absolute right-0 top-24 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl [animation-delay:5s]" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:py-24 md:px-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h1 className="anim-fade-up text-4xl font-extrabold leading-[1.1] tracking-tight text-[#0b1c30] sm:text-5xl">
              Network işinde adaylarını kaybetme. İsim Listem ile takip et, davet linkini gönder, ilgiyi ölç.
            </h1>
            <p className="anim-fade-up anim-delay-200 max-w-md text-lg text-slate-600">
              Network marketing ve doğrudan satış yapanlar için ücretsiz aday takip uygulaması.
              Adaylarını ekle, kişiye özel WhatsApp mesajı hazırla, özel davet linkini gönder,
              adayın sayfada ne yaptığını takip et.
            </p>
            <div className="anim-fade-up anim-delay-300 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/kayit" className="group inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-green-500/30 transition hover:bg-green-600">
                Ücretsiz Hesap Oluştur <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <a href="#kurumsal" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 font-semibold text-[#0b1c30] transition hover:bg-slate-50">
                Kurumsal Firma İçin İncele
              </a>
            </div>
          </div>

          {/* Hero görsel */}
          <div className="anim-fade-up anim-delay-300 relative mx-auto w-full max-w-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwwBbTYqGFawIGD1kU22_BNS4lCMLamn4K0JEFD2G_74ijqgVT9KdEJXDp64gWUk5y5CA1RimyT04nPZuytjUzdWExRq6FW7KLC8fQzKJ1pogduZ7xKSjiJbec2IeuVaeIZNLOu_M0e15X5FVQT0PT-OJ3eES9KVlVHMztgsuuwqqvzvtEZCuYgDRpiduuqRrEDcTsCk0-er-0CiUT0uuOLW1FpuJdPGG_S1WhtpdcgQZdDP3jBpJ0bCQ1qNJVXZ_K_MevnG-wVhQ"
              alt="İsim Listem aday kartı — Ahmet Yılmaz, skor 95"
              className="anim-float w-full rounded-2xl border border-slate-200 object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* 3. PROBLEM */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-[#0b1c30] sm:text-4xl">Network işinde en büyük sorun: takip dağınıklığı</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MessageCircle, b: "WhatsApp Kaosu", m: "Mesajlar arasında kaybolan adaylar, kime ne gönderdiğini unutma derdi." },
              { icon: VideoOff, b: "Bilinmeyen İzleme", m: "Gönderdiğin sunum videosunu gerçekten izlediler mi? Ne kadarını izlediler? Belirsizlik." },
              { icon: CalendarClock, b: "Kaçan Takipler", m: "Zamanında dönüş yapılmadığı için soğuyan ve kaybedilen potansiyel iş ortakları." },
              { icon: Timer, b: "Manuel Yazım Kaybı", m: "Aynı mesajları tekrar tekrar yazmakla harcanan değerli zaman." },
            ].map((p, i) => (
              <Reveal key={p.b} delay={i * 90}>
                <div className="flex h-full flex-col gap-2 rounded-xl border border-slate-100 bg-white p-6 text-left shadow-sm">
                  <p.icon className="text-rose-500" size={28} />
                  <h3 className="mt-2 text-xl font-bold text-[#0b1c30]">{p.b}</h3>
                  <p className="text-sm text-slate-600">{p.m}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ÇÖZÜM — 4 adım */}
      <section id="nasil" className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-[#0b1c30] sm:text-4xl">İsim Listem tüm süreci tek ekranda toplar</h2>
          </Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: UserPlus, b: "1. Adayını Ekle", m: "Hızlıca isim ve numara ile adayını listene dahil et." },
              { icon: MessageCircle, b: "2. Mesajını Hazırla", m: "Hazır şablonlarla kişiye özel WhatsApp mesajını oluştur." },
              { icon: Send, b: "3. Linkini Gönder", m: "Ona özel, takip edilebilir davet linkini ilet." },
              { icon: BarChart3, b: "4. İlgiyi Takip Et", m: "Ne zaman tıkladı, ne kadar izledi anında gör." },
            ].map((a, i) => (
              <Reveal key={a.b} delay={i * 100}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                    <a.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0b1c30]">{a.b}</h3>
                  <p className="text-sm text-slate-600">{a.m}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ÖZELLİKLER */}
      <section id="ozellikler" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-[#0b1c30] sm:text-4xl">Networker’ın günlük işine özel araçlar</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ListChecks, b: "Aday Takip CRM", m: "Tüm adaylarını tek bir listede, durumlarına göre organize et." },
              { icon: MessageCircle, b: "WhatsApp Kalıpları", m: "Sık kullanılan mesajları kaydet, tek tıkla adayına uyarla." },
              { icon: Send, b: "wa.me Entegrasyonu", m: "Rehbere kaydetmeden doğrudan WhatsApp üzerinden mesaj gönder." },
              { icon: Layers, b: "Modüler Davet Sayfası", m: "Sunum videonu, iletişim bilgilerini içeren şık sayfalar oluştur." },
              { icon: PlayCircle, b: "Video Takibi", m: "Videonun ne kadarının izlendiğini yüzde olarak takip et." },
              { icon: CalendarClock, b: "Randevu Talebi", m: "Adayların sayfandan kolayca toplantı talep etsin." },
            ].map((o, i) => (
              <Reveal key={o.b} delay={(i % 3) * 90}>
                <div className="h-full rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600"><o.icon size={22} /></div>
                  <h3 className="mt-4 text-xl font-bold text-[#0b1c30]">{o.b}</h3>
                  <p className="mt-1 text-sm text-slate-600">{o.m}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600"><Flame size={22} /></div>
              <h3 className="mt-4 text-xl font-bold text-[#0b1c30]">Aday Skorlama</h3>
              <p className="mt-1 text-sm text-slate-600">Etkileşimlere göre adayların ilgisini otomatik puanla, sıcak adaylara odaklan.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6 + 7. DAVET SAYFASI & ANALİTİK — bento */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Davet sayfası */}
            <Reveal className="lg:col-span-5">
              <div className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#0b1c30] sm:text-3xl">Her aday için kişiye özel tanıtım sayfası</h2>
                  <p className="mt-3 text-lg text-slate-600">
                    WhatsApp mesajının altına sıradan bir link değil, adaya özel hazırlanmış
                    takip edilebilir bir davet sayfası ekle.
                  </p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkvPgPIhuS2iHL391L_xvMvp132hbPPCi7uq6Ewt_SvrJhnpZcTosLwFTlVVmZKNOLCDzUu9r8oASuwUE0kGpSoZptMKN-i1VAQiEEUAXpurxiF0kfW1T2cwoTruNnlqyQSmLf5jke_REVen2kwK8Gr5_6NIKl5AzM5ZMdSOy6cYCqKBYv8s7xDvAPAUY_U95ZCdhmm265zminFDevPT3M07-g7dn6H5ZI3SqjPQfviBsiMEYAwtKwJIEw8_m0SGYXosqg5vAWr2k"
                  alt="Kişiye özel davet sayfası önizlemesi"
                  className="mx-auto mt-auto w-full max-w-[280px] translate-y-6 object-contain drop-shadow-2xl"
                />
              </div>
            </Reveal>

            {/* Analitik */}
            <Reveal className="lg:col-span-7" delay={120}>
              <div className="flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-[#0b1c30] p-8 text-white shadow-xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold sm:text-3xl">Aday gerçekten ilgilendi mi? Artık tahmin etme, gör.</h2>
                  <p className="mt-3 text-lg text-slate-300">
                    Davet linkini gönderip beklemek yerine adayın davranışlarını anlık olarak
                    takip et ve doğru zamanda hamle yap.
                  </p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU9pKY_YhAJdGIRgmsb-z_ymgpP5-C6POswB-yMxHSjuy_5qlCe0b_hc_ZJEqzos0foT7308nxm1-fX_ifRVMyEt-nGQ8bOrgwypiAIZufBucxERP931XK6HTog6ORICxaqJ0-WTrBqo686pjLmhbtZOPxOSxIG-cJTSNkeC342ozFCJbv4DeAahNhefLUh3zGVdAV73KHua5YA-9ofEZIaTK284D0W8KaZ4_VnFW0sf19nCJuF3M2xgBt_t3Ar5HGpuXBAdqvEbg"
                  alt="Aday dashboard — Link açıldı 1.245, sayfada 4:32, video %75, skor %90"
                  className="mt-auto w-full rounded-xl border border-white/10 object-cover shadow-lg"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8. NETWORKER vs KURUMSAL */}
      <section id="networker" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-10">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bireysel */}
            <Reveal>
              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#0b1c30]"><User size={22} /></div>
                <h3 className="mb-4 text-2xl font-bold text-[#0b1c30] sm:text-3xl">Bireysel networker’lar için tamamen ücretsiz</h3>
                <ul className="flex-grow space-y-2 text-slate-600">
                  {["Profesyonel bir görünüm kazan.", "Öncelikli takip edilecekleri belirle.", "Zamandan tasarruf et."].map((x) => (
                    <li key={x} className="flex items-start gap-2"><Check size={18} className="mt-0.5 shrink-0 text-green-500" /> {x}</li>
                  ))}
                </ul>
                <Link href="/auth/kayit" className="mt-8 w-full rounded-lg bg-green-500 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-green-600">
                  Hemen Başla (Ücretsiz)
                </Link>
              </div>
            </Reveal>
            {/* Kurumsal */}
            <Reveal delay={120}>
              <div id="kurumsal" className="flex h-full flex-col rounded-2xl bg-[#0b1c30] p-8 text-white shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"><Building2 size={22} /></div>
                <h3 className="mb-4 text-2xl font-bold sm:text-3xl">Şirketinizin networker’ları içerik hazırlamakla uğraşmasın</h3>
                <ul className="flex-grow space-y-2 text-slate-300">
                  {["Merkezi içerik yönetimi.", "Ekibe özel hazır şablonlar.", "Ekip performans raporları."].map((x) => (
                    <li key={x} className="flex items-start gap-2"><Check size={18} className="mt-0.5 shrink-0 text-green-400" /> {x}</li>
                  ))}
                </ul>
                <TalepFormu tip="KURUMSAL" etiket="Kurumsal İletişime Geç" className="mt-8 w-full rounded-lg bg-white px-6 py-3.5 text-center font-semibold text-[#0b1c30] transition hover:bg-slate-100" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 9. KARŞILAŞTIRMA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-[#0b1c30] sm:text-4xl">Neden İsim Listem?</h2>
          </Reveal>
          <Reveal>
            <div className="mt-10 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Özellik</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Defter / Excel</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">WhatsApp Notları</th>
                    <th className="bg-green-500/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#0b1c30]">İsim Listem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    "Aday Organizasyonu", "Video İzleme Takibi", "Kişiye Özel Davet Sayfası", "Aday Skorlama",
                  ].map((r) => (
                    <tr key={r} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-[#0b1c30]">{r}</td>
                      <td className="px-4 py-3 text-center"><X size={16} className="mx-auto text-rose-400" /></td>
                      <td className="px-4 py-3 text-center"><X size={16} className="mx-auto text-rose-400" /></td>
                      <td className="bg-green-500/5 px-4 py-3 text-center"><Check size={16} className="mx-auto text-green-500" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10. GÜVEN & SSS */}
      <section id="sss" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-10">
          <Reveal>
            <div className="mb-12 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <ShieldCheck className="mx-auto text-[#0b1c30]" size={32} />
              <p className="mt-3 text-slate-600">
                <strong className="text-[#0b1c30]">Güvenlik Notu:</strong> İsim Listem bir MLM veya saadet zinciri değildir.
                Kimseye otomatik spam mesaj göndermez. Sadece sizin yönettiğiniz profesyonel bir takip aracıdır.
              </p>
            </div>
          </Reveal>
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold text-[#0b1c30] sm:text-4xl">Sıkça Sorulan Sorular</h2>
          </Reveal>
          <div className="mt-8">
            <SSS />
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="bg-[#0b1c30] py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4 md:px-10">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Adaylarını artık rastgele değil, sistemli takip et.</h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/kayit" className="rounded-lg bg-green-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-green-600">
              Ücretsiz Hesabını Oluştur
            </Link>
            <TalepFormu tip="DEMO" etiket="Business Demo Talep Et" className="rounded-lg border border-white/20 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10" />
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-10">
          <div>
            {ayar.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ayar.logoUrl} alt={ayar.siteAdi} className="h-10 w-auto max-w-[200px] object-contain" />
            ) : (
              <div className="text-2xl font-black text-[#0b1c30]">{ayar.siteAdi}</div>
            )}
            <p className="mt-3 text-sm text-slate-500">WAQUR TEKNOLOJİ</p>
            <p className="text-sm text-slate-500">Ümraniye / İstanbul</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#0b1c30]">Ürün</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><a href="#nasil" className="hover:text-green-600">Nasıl Çalışır</a></li>
              <li><a href="#ozellikler" className="hover:text-green-600">Özellikler</a></li>
              <li><a href="#kurumsal" className="hover:text-green-600">Kurumsal Firmalar</a></li>
              <li><Link href="/auth/kayit" className="hover:text-green-600">Ücretsiz Başla</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#0b1c30]">Yasal</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="/yasal/uyelik" className="hover:text-green-600">Üyelik Sözleşmesi</Link></li>
              <li><Link href="/yasal/kullanim" className="hover:text-green-600">Kullanım Koşulları</Link></li>
              <li><Link href="/yasal/gizlilik" className="hover:text-green-600">Gizlilik Politikası</Link></li>
              <li><Link href="/yasal/kvkk" className="hover:text-green-600">KVKK Aydınlatma</Link></li>
              <li><Link href="/yasal/cerez" className="hover:text-green-600">Çerez Politikası</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#0b1c30]">İletişim</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" /> Çakmak Mh. Alemdağ Cd. No:488/3 Ümraniye / İstanbul</li>
              <li className="flex items-center gap-2"><Phone size={15} /> +90 850 302 40 04</li>
              <li className="flex items-center gap-2"><Mail size={15} /> {destek}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-slate-400 md:px-10">
            WAQUR TEKNOLOJİ TAR. MAD. SAN. VE TİC. LTD. ŞTİ. © {new Date().getFullYear()} — Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}

