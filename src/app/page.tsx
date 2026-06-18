import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAyar } from "@/lib/ayarlar";
import { hostFirma } from "@/lib/host";
import Reveal from "@/components/Reveal";
import LandingNav from "@/components/LandingNav";
import SSS from "@/components/SSS";
import {
  MessageCircle, Link2, Eye, BarChart3, UserPlus, Send, CalendarClock, ShieldCheck,
  ArrowRight, Building2, Flame, Check, FileText, ListChecks, MousePointerClick,
  PlayCircle, Sparkles, Layers, RefreshCw, Users, Phone, Mail, MapPin,
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

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingNav session={!!session} logoUrl={ayar.logoUrl} siteAdi={ayar.siteAdi} slogan={ayar.slogan} />

      {/* 2. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="anim-blob absolute -left-20 top-0 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="anim-blob absolute right-0 top-24 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl [animation-delay:5s]" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <div className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles size={14} /> Bireysel networker’lara ücretsiz
            </div>
            <h1 className="anim-fade-up anim-delay-100 mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Network işinde<br />adaylarını <span className="text-emerald-600">kaybetme</span>.
            </h1>
            <p className="anim-fade-up anim-delay-200 mt-5 max-w-md text-lg text-slate-600">
              Adaylarını ekle, kişiye özel WhatsApp mesajı hazırla, özel davet linkini gönder ve
              adayın sayfada ne yaptığını takip et.
            </p>
            <div className="anim-fade-up anim-delay-300 mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/kayit" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600">
                Ücretsiz Hesap Oluştur <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <a href="#kurumsal" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50">
                Kurumsal Firma İçin İncele
              </a>
            </div>
            <ul className="anim-fade-up anim-delay-500 mt-6 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
              {["Ücretsiz networker hesabı", "WhatsApp ile manuel gönderim", "Adaya özel davet linki", "Video & sayfa etkileşim takibi"].map((x) => (
                <li key={x} className="flex items-center gap-2"><Check size={15} className="text-emerald-500" /> {x}</li>
              ))}
            </ul>
          </div>

          {/* Hero mockup: aday listesi + kart */}
          <div className="anim-fade-up anim-delay-300 relative mx-auto w-full max-w-sm">
            <div className="anim-float rounded-[2.5rem] border-8 border-slate-900 bg-white shadow-2xl">
              <div className="rounded-[2rem] bg-slate-50 p-4">
                <p className="px-1 pb-3 text-sm font-bold text-slate-900">Adaylarım</p>
                <div className="space-y-2">
                  <AdayKart ad="Ahmet Yılmaz" etiket="Sıcak Aday" skor="95" renk="orange" vurgu />
                  <AdayKart ad="Elif Demir" etiket="Ilık" skor="40" renk="amber" />
                  <AdayKart ad="Mehmet Kaya" etiket="Yeni" skor="10" renk="slate" />
                </div>
                <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">Ahmet Yılmaz</span>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 font-bold text-orange-700">🔥 Skor 95</span>
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-500">
                    <MiniSatir e="Davet linki" d="3 kez açıldı" />
                    <MiniSatir e="Video" d="%75 izlendi" />
                    <MiniSatir e="Aksiyon" d="Randevu talep etti" vurgu />
                  </div>
                </div>
              </div>
            </div>
            <div className="anim-float absolute -right-3 top-10 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-xs font-semibold shadow-lg [animation-delay:1.5s]">✅ Link açıldı</div>
            <div className="anim-float absolute -left-3 bottom-12 rounded-2xl border border-slate-100 bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-lg [animation-delay:3s]">📅 Randevu talebi</div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Network işinde en büyük sorun: takip dağınıklığı</h2>
          <p className="mt-3 text-slate-600">
            Kime ne zaman yazdığını, kimin sunumu izlediğini, kime tekrar dönmen gerektiğini hatırlamak zor.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MessageCircle, b: "Adaylar WhatsApp’ta kaybolur", m: "Kime ne gönderildiği takip edilemez." },
            { icon: Eye, b: "Sunum izlendi mi belli değil", m: "Aday linke girdi mi, videoyu izledi mi bilinmez." },
            { icon: CalendarClock, b: "Takip zamanı kaçırılır", m: "Sıcak adaylara geç dönülür, fırsat kaybedilir." },
            { icon: FileText, b: "Mesaj yazmak zaman alır", m: "Her adaya tekrar tekrar mesaj hazırlamak yorucu." },
          ].map((p, i) => (
            <Reveal key={p.b} delay={i * 90}>
              <div className="h-full rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <p.icon className="text-rose-500" size={24} />
                <h3 className="mt-3 font-bold text-slate-900">{p.b}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.m}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4. ÇÖZÜM — 4 adım */}
      <section id="nasil" className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">İsim Listem tüm süreci tek ekranda toplar</h2>
            <p className="mt-3 text-slate-300">Adayını ekle, mesajını hazırla, davet linkini gönder, ilgiyi takip et.</p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: UserPlus, b: "Adayını ekle", m: "Ad, telefon, kaynak, durum ve takip tarihini kaydet." },
              { icon: MessageCircle, b: "Mesajını hazırla", m: "Hazır WhatsApp kalıplarını kullan ya da kendininkini yaz." },
              { icon: Link2, b: "Özel davet linkini gönder", m: "Her aday için kişiye özel link mesaja eklenir." },
              { icon: Eye, b: "İlgiyi takip et", m: "Açtı mı, izledi mi, butona bastı mı, randevu istedi mi gör." },
            ].map((a, i) => (
              <Reveal key={a.b} delay={i * 100}>
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                  <span className="text-sm font-bold text-emerald-400">Adım {i + 1}</span>
                  <a.icon className="mt-3 text-emerald-400" size={26} />
                  <h3 className="mt-3 text-lg font-bold">{a.b}</h3>
                  <p className="mt-1 text-sm text-slate-300">{a.m}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ÖZELLİKLER — 9 */}
      <section id="ozellikler" className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Networker’ın günlük işine özel araçlar</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ListChecks, b: "Aday Takip CRM’i", m: "Tüm potansiyel müşteri ve iş ortaklarını tek listede yönet." },
            { icon: MessageCircle, b: "WhatsApp Mesaj Kalıpları", m: "İlk temas, takip, sunum, randevu ve itiraz için hazır mesajlar." },
            { icon: Send, b: "WhatsApp Mesaj Gönder", m: "Mesaj WhatsApp’ta hazır açılır, gönderme işlemini sen yaparsın." },
            { icon: Link2, b: "Adaya Özel Davet Linki", m: "Her adaya özel, networker’a ve adaya özel çalışan tanıtım linki." },
            { icon: Layers, b: "Modüler Davet Sayfası", m: "Metin, görsel, video, buton, SSS, form ve randevu modülleri." },
            { icon: PlayCircle, b: "Video İzleme Takibi", m: "Aday videoyu başlattı mı, ne kadar izledi, sayfada ne kadar kaldı?" },
            { icon: CalendarClock, b: "Randevu Talebi", m: "Aday ‘Beni ara’, ‘Randevu oluştur’ veya ‘Bilgi istiyorum’ diyebilir." },
            { icon: Flame, b: "Aday İlgi Skoru", m: "Link açma, video, scroll, tıklama ve randevuya göre sıcaklık." },
            { icon: RefreshCw, b: "Otomatik Durum Güncelleme", m: "Link açıldıysa ‘Davet açıldı’, randevu istediyse ‘Randevu talep etti’." },
          ].map((o, i) => (
            <Reveal key={o.b} delay={(i % 3) * 90}>
              <div className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><o.icon size={22} /></div>
                <h3 className="mt-4 text-lg font-bold">{o.b}</h3>
                <p className="mt-1 text-sm text-slate-600">{o.m}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 6 + 7. DAVET SAYFASI & ANALİTİK */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl space-y-20 px-4">
          {/* Davet sayfası */}
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">Her aday için kişiye özel tanıtım sayfası</h2>
                <p className="mt-4 text-slate-600">
                  WhatsApp mesajının altına sıradan bir link değil, adaya özel hazırlanmış,
                  takip edilebilir bir davet sayfası ekle.
                </p>
                <ul className="mt-6 grid grid-cols-2 gap-2 text-sm text-slate-700">
                  {["Kişisel karşılama", "Networker bilgisi", "Video & görsel", "Sık sorulan sorular", "İlgileniyorum", "Randevu oluştur", "WhatsApp’tan yaz", "Form & onay"].map((x) => (
                    <li key={x} className="flex items-center gap-2"><Check size={15} className="text-emerald-500" /> {x}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="mx-auto w-full max-w-xs rounded-[2rem] border-8 border-slate-900 bg-white shadow-2xl">
                <div className="space-y-3 rounded-[1.5rem] bg-gradient-to-b from-slate-50 to-white p-5">
                  <p className="text-sm font-bold">Merhaba Ahmet 👋</p>
                  <p className="text-xs text-slate-500">Sana özel hazırladığım kısa tanıtımı inceleyebilirsin.</p>
                  <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-900 text-white"><PlayCircle size={34} /></div>
                  <button className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white">İlgileniyorum</button>
                  <button className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700">Daha detaylı bilgi istiyorum</button>
                  <button className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700">Randevu oluştur</button>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Analitik */}
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1" delay={120}>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Ahmet Yılmaz</span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">Skor 95 · Sıcak</span>
                </div>
                <div className="mt-4 space-y-2">
                  <AnalitikSatir icon={Eye} e="Link açıldı" d="3 kez" />
                  <AnalitikSatir icon={BarChart3} e="Sayfada kaldı" d="4 dk 32 sn" />
                  <AnalitikSatir icon={PlayCircle} e="Video izleme" d="%75" />
                  <AnalitikSatir icon={MousePointerClick} e="Tıklanan buton" d="Bilgi istiyorum" />
                  <AnalitikSatir icon={CalendarClock} e="Randevu" d="Talep etti" vurgu />
                </div>
              </div>
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">Aday gerçekten ilgilendi mi? Artık tahmin etme, gör.</h2>
                <p className="mt-4 text-slate-600">
                  Davet linkini gönderip beklemek yerine adayın davranışlarını izle. Kim girdi,
                  kim videoyu izledi, kim randevu istedi — tek ekranda.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8. NETWORKER */}
      <section id="networker" className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><Users size={14} /> Bireysel Networker</span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Bağımsız networker’lar için tamamen ücretsiz</h2>
              <p className="mt-4 text-slate-600">
                Adaylarını takip etmek, mesajlarını hazırlamak ve davet linklerini göndermek için ödeme yapman gerekmez.
              </p>
              <Link href="/auth/kayit" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600">
                Ücretsiz Networker Hesabı Oluştur <ArrowRight size={18} />
              </Link>
              <p className="mt-4 text-xs text-slate-400">Komisyon sistemi, sponsor ağacı veya network yapısı yoktur. Her kullanıcı kendi adaylarını yönetir.</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ul className="space-y-3">
              {["Adaylarını düzenli tut", "WhatsApp mesajlarını hızlandır", "Kime döneceğini unutma", "Sıcak adayları önceliklendir", "Sunum linklerinin etkisini gör", "Randevu taleplerini kaçırma"].map((x) => (
                <li key={x} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <Check size={16} className="text-emerald-500" /> {x}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 9. KURUMSAL */}
      <section id="kurumsal" className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"><Building2 size={14} /> Business</span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Şirketinizin networker’ları içerik hazırlamakla uğraşmasın</h2>
            <p className="mt-4 text-slate-300">
              Mesaj kalıplarını, davet sayfalarını ve videoları merkezden hazırlayın; temsilcileriniz sadece
              aday eklesin ve hazır davet linkini WhatsApp’tan göndersin.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Layers, b: "Merkezi içerik yönetimi", m: "Tüm networker’lar aynı doğru ve güncel içeriği kullanır." },
              { icon: FileText, b: "Hazır davet sayfaları", m: "Video, görsel, SSS ve randevu butonlarıyla profesyonel sayfalar." },
              { icon: Link2, b: "Networker kayıt linki", m: "Temsilcilerinizi firma kayıt kodu ile sisteme dahil edin." },
              { icon: BarChart3, b: "Performans raporları", m: "Hangi sayfa, mesaj ve kampanya daha iyi çalışıyor görün." },
              { icon: Sparkles, b: "Markalı deneyim", m: "Firma logosu, renkleri ve içerikleriyle kurumsal görünüm." },
              { icon: ShieldCheck, b: "Gizlilik odaklı", m: "Komisyon/sponsor takibi yok; sadece içerik ve etkileşim yönetimi." },
            ].map((o, i) => (
              <Reveal key={o.b} delay={(i % 3) * 90}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
                  <o.icon className="text-emerald-400" size={24} />
                  <h3 className="mt-3 font-bold">{o.b}</h3>
                  <p className="mt-1 text-sm text-slate-300">{o.m}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={`mailto:${ayar.destekEmail ?? "info@waqur.com"}?subject=Business Demo`} className="rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-600">Business Demo Talep Et</a>
            <a href="#ozellikler" className="rounded-xl border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">Kurumsal Özellikleri İncele</a>
          </div>
        </div>
      </section>

      {/* 10. KİMLER KULLANMALI */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Kimler için uygun?</h2>
        </Reveal>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {["Network marketing yapanlar", "Doğrudan satış temsilcileri", "Ürün müşterisi takip edenler", "İş ortağı adayı takip edenler", "Saha satış ekipleri", "WhatsApp’tan satış yapanlar", "Kurumsal network firmaları", "Ürün/fırsat tanıtımı yapan ekipler"].map((x) => (
            <span key={x} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">{x}</span>
          ))}
        </div>
      </section>

      {/* 13. KARŞILAŞTIRMA */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Defter, Excel ve WhatsApp notlarından daha fazlası</h2>
          </Reveal>
          <Reveal>
            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Özellik</th>
                    <th className="px-4 py-3 text-center font-medium text-slate-500">Defter/Excel</th>
                    <th className="px-4 py-3 text-center font-medium text-slate-500">WhatsApp</th>
                    <th className="px-4 py-3 text-center font-bold text-emerald-600">İsim Listem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ["Aday listesi", "Var", "Dağınık"],
                    ["Takip tarihi", "Zor", "Yok"],
                    ["Hazır mesaj", "Yok", "Kopyala-yapıştır"],
                    ["Adaya özel link", "Yok", "Yok"],
                    ["Video izleme takibi", "Yok", "Yok"],
                    ["Randevu talebi", "Yok", "Yok"],
                    ["Aday skoru", "Yok", "Yok"],
                    ["Kurumsal hazır içerik", "Yok", "Yok"],
                  ].map((r) => (
                    <tr key={r[0]}>
                      <td className="px-4 py-3 font-medium text-slate-900">{r[0]}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{r[1]}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{r[2]}</td>
                      <td className="px-4 py-3 text-center"><Check size={18} className="mx-auto text-emerald-500" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 12. GÜVEN & GİZLİLİK */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div>
              <ShieldCheck className="text-emerald-600" size={36} />
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Aday listen senin kontrolünde</h2>
              <p className="mt-4 text-slate-600">
                İsim Listem, adaylara senin adına otomatik mesaj göndermez. Her mesajı kendi WhatsApp
                hesabından manuel gönderirsin. Adayların senin kişisel takip listende kalır.
              </p>
              <Link href="/yasal/gizlilik" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:underline">
                Gizlilik Politikası’nı İncele <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ul className="space-y-3">
              {["Otomatik WhatsApp spam gönderimi yok", "Adaylar başka kullanıcılara gösterilmez", "Ortak aday havuzu yok", "Network/sponsor sistemi yok", "Aday davranışları sadece takip amacıyla kullanılır", "Firma aday verisini ancak izinli modelde görür"].map((x) => (
                <li key={x} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
                  <Check size={16} className="text-emerald-500" /> {x}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 14. SSS */}
      <section id="sss" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Sık Sorulan Sorular</h2>
          </Reveal>
          <SSS />
        </div>
      </section>

      {/* 15. FINAL CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 text-center text-white">
            <div className="pointer-events-none absolute inset-0">
              <div className="anim-blob absolute -left-10 top-0 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl" />
              <div className="anim-blob absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl [animation-delay:4s]" />
            </div>
            <h2 className="relative text-3xl font-bold sm:text-4xl">Adaylarını artık rastgele değil, sistemli takip et.</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-slate-300">
              Adayını ekle, kişiye özel davet linkini oluştur, WhatsApp’tan gönder ve adayın ilgisini takip et.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/auth/kayit" className="rounded-xl bg-emerald-500 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-600">Ücretsiz Başla</Link>
              <a href={`mailto:${ayar.destekEmail ?? "info@waqur.com"}?subject=Business Demo`} className="rounded-xl border border-white/20 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10">Business Demo Talep Et</a>
            </div>
            <p className="relative mt-4 text-sm text-slate-400">Bireysel networker kullanımı ücretsizdir. Kurumsal firmalar için Business panel sunulur.</p>
          </div>
        </Reveal>
      </section>

      {/* 16. FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            {ayar.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ayar.logoUrl} alt={ayar.siteAdi} className="h-10 w-auto max-w-[200px] object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-sm font-bold text-white">İL</span>
                <span className="font-bold text-slate-900">{ayar.siteAdi}</span>
              </div>
            )}
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Networker’lar için aday takip ve kişiye özel davet sistemi. Bireysel kullanım ücretsiz.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Ürün</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><a href="#nasil" className="hover:text-slate-900">Nasıl Çalışır</a></li>
              <li><a href="#ozellikler" className="hover:text-slate-900">Özellikler</a></li>
              <li><a href="#kurumsal" className="hover:text-slate-900">Kurumsal Firmalar</a></li>
              <li><Link href="/auth/kayit" className="hover:text-slate-900">Ücretsiz Başla</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Yasal</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="/yasal/uyelik" className="hover:text-slate-900">Üyelik Sözleşmesi</Link></li>
              <li><Link href="/yasal/kullanim" className="hover:text-slate-900">Kullanım Koşulları</Link></li>
              <li><Link href="/yasal/mesafeli" className="hover:text-slate-900">Mesafeli Satış</Link></li>
              <li><Link href="/yasal/gizlilik" className="hover:text-slate-900">Gizlilik Politikası</Link></li>
              <li><Link href="/yasal/kvkk" className="hover:text-slate-900">KVKK Aydınlatma</Link></li>
              <li><Link href="/yasal/cerez" className="hover:text-slate-900">Çerez Politikası</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">İletişim</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0" /> Çakmak Mh. Alemdağ Cd. No:488/3 Ümraniye / İstanbul</li>
              <li className="flex items-center gap-2"><Phone size={15} /> +90 850 302 40 04</li>
              <li className="flex items-center gap-2"><Mail size={15} /> {ayar.destekEmail ?? "info@waqur.com"}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-slate-400">
            WAQUR TEKNOLOJİ TAR. MAD. SAN. VE TİC. LTD. ŞTİ. © {new Date().getFullYear()} — Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}

function AdayKart({ ad, etiket, skor, renk, vurgu }: { ad: string; etiket: string; skor: string; renk: string; vurgu?: boolean }) {
  const renkler: Record<string, string> = {
    orange: "bg-orange-100 text-orange-700", amber: "bg-amber-100 text-amber-700", slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${vurgu ? "border-emerald-300 bg-emerald-50" : "border-slate-100 bg-white"}`}>
      <div>
        <div className="text-sm font-semibold text-slate-900">{ad}</div>
        <div className="text-[11px] text-slate-500">{etiket}</div>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${renkler[renk]}`}>{skor}</span>
    </div>
  );
}

function MiniSatir({ e, d, vurgu }: { e: string; d: string; vurgu?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span>{e}</span>
      <span className={`font-semibold ${vurgu ? "text-emerald-600" : "text-slate-700"}`}>{d}</span>
    </div>
  );
}

function AnalitikSatir({ icon: Icon, e, d, vurgu }: { icon: React.ComponentType<{ size?: number; className?: string }>; e: string; d: string; vurgu?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${vurgu ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}>
      <span className="flex items-center gap-2 text-slate-500"><Icon size={15} className="text-slate-400" /> {e}</span>
      <span className={`font-semibold ${vurgu ? "text-emerald-700" : "text-slate-900"}`}>{d}</span>
    </div>
  );
}
