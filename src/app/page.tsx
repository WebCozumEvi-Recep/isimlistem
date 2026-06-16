import Link from "next/link";
import { getSession } from "@/lib/session";
import Reveal from "@/components/Reveal";
import {
  MessageCircle, Link2, Eye, BarChart3, UserPlus, Send, CalendarClock,
  ShieldCheck, Sparkles, ArrowRight, Building2, Flame, Check,
} from "lucide-react";

export default async function Landing() {
  const session = await getSession();
  const girisCta = session
    ? { href: "/panel", etiket: "Panele Git" }
    : { href: "/auth/giris", etiket: "Giriş Yap" };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white">İ</span>
            İsim Listem
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#nasil" className="hover:text-slate-900">Nasıl Çalışır</a>
            <a href="#ozellikler" className="hover:text-slate-900">Özellikler</a>
            <a href="#paketler" className="hover:text-slate-900">Paketler</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href={girisCta.href} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              {girisCta.etiket}
            </Link>
            {!session && (
              <Link href="/auth/kayit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                Ücretsiz Başla
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="anim-blob absolute -left-24 top-0 h-96 w-96 rounded-full bg-indigo-300/40 blur-3xl" />
          <div className="anim-blob absolute right-0 top-20 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl [animation-delay:4s]" />
          <div className="anim-blob absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-200/40 blur-3xl [animation-delay:8s]" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <div className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles size={14} /> Networker'lar için ücretsiz aday takip sistemi
            </div>
            <h1 className="anim-fade-up anim-delay-100 mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Adayını ekle,<br />
              <span className="text-shine">kişiye özel davet</span> gönder,<br />
              ne yaptığını gör.
            </h1>
            <p className="anim-fade-up anim-delay-200 mt-5 max-w-md text-lg text-slate-600">
              WhatsApp'tan kişiye özel davet linki gönder; adayın sayfada ne yaptığını
              canlı takip et ve <span className="font-semibold text-slate-900">doğru zamanda</span> ara.
            </p>
            <div className="anim-fade-up anim-delay-300 mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/kayit" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl hover:shadow-indigo-500/40">
                Ücretsiz Başla
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <a href="#nasil" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50">
                Nasıl Çalışır?
              </a>
            </div>
            <p className="anim-fade-up anim-delay-500 mt-4 text-sm text-slate-400">
              Kredi kartı yok · Bireysel kullanım tamamen ücretsiz
            </p>
          </div>

          {/* Telefon mockup */}
          <div className="anim-fade-up anim-delay-300 relative mx-auto w-full max-w-sm">
            <div className="anim-float rounded-[2.5rem] border-8 border-slate-900 bg-white shadow-2xl">
              <div className="rounded-[2rem] bg-gradient-to-b from-slate-50 to-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold">Ahmet Yılmaz</span>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">🔥 Skor 95</span>
                </div>
                <div className="space-y-2.5">
                  <MockSatir icon={Eye} etiket="Açılma" deger="3 kez" />
                  <MockSatir icon={BarChart3} etiket="Sayfada" deger="4dk 32sn" />
                  <MockSatir icon={Flame} etiket="Video" deger="%62 izledi" />
                  <MockSatir icon={MessageCircle} etiket="Aksiyon" deger="Bilgi istedi" vurgu />
                </div>
                <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 py-2.5 text-center text-sm font-semibold text-white">
                  WhatsApp'ta Aç
                </div>
              </div>
            </div>
            <div className="anim-float absolute -right-3 -top-3 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-xs font-semibold shadow-lg [animation-delay:1s]">
              ✅ Ahmet linki açtı
            </div>
            <div className="anim-float absolute -bottom-2 -left-3 rounded-2xl border border-slate-100 bg-white px-3 py-2 text-xs font-semibold shadow-lg [animation-delay:2.5s]">
              📅 Randevu talebi
            </div>
          </div>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section id="nasil" className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">4 adımda işin biter</h2>
          <p className="mt-3 text-slate-600">Karmaşık CRM yok. Sadece akış.</p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: UserPlus, baslik: "Adayını Ekle", metin: "Adayını listene ekle, tipini ve sıcaklığını belirle." },
            { icon: Link2, baslik: "Link Oluştur", metin: "Kişiye özel, tahmin edilemez davet linki üret." },
            { icon: Send, baslik: "WhatsApp'tan Gönder", metin: "Hazır mesajı kendi WhatsApp'ından tek tıkla gönder." },
            { icon: Eye, baslik: "Davranışı İzle", metin: "Aday sayfada ne yaptı? Açtı mı, izledi mi, ilgilendi mi?" },
          ].map((a, i) => (
            <Reveal key={a.baslik} delay={i * 100}>
              <div className="group h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white">
                  <a.icon size={22} />
                </div>
                <div className="mt-4 text-sm font-bold text-indigo-600">Adım {i + 1}</div>
                <h3 className="mt-1 text-lg font-bold">{a.baslik}</h3>
                <p className="mt-1 text-sm text-slate-600">{a.metin}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Özellikler */}
      <section id="ozellikler" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">İhtiyacın olan her şey</h2>
            <p className="mt-3 text-slate-600">Aday takibinden davranış analizine, tek panelde.</p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: MessageCircle, baslik: "WhatsApp Mesaj Hazırlama", metin: "Değişkenli hazır kalıplarla mesajını saniyede hazırla, kendi numaranla gönder." },
              { icon: Link2, baslik: "Kişiye Özel Davet Linki", metin: "Her aday için ayrı, kişiselleştirilmiş davet sayfası ve link." },
              { icon: BarChart3, baslik: "Davranış Takibi", metin: "Açılma, sayfada süre, scroll, video izleme, buton tıklamaları." },
              { icon: Flame, baslik: "Otomatik Aday Skoru", metin: "Davranışa göre hesaplanan ilgi skoru ile sıcak adayı kaçırma." },
              { icon: CalendarClock, baslik: "Randevu Yönetimi", metin: "Aday sayfadan randevu ister, sen onayla/ertele/tamamla." },
              { icon: ShieldCheck, baslik: "KVKK Uyumlu", metin: "Aday verisi kişisel CRM'inde; otomatik spam mesaj asla gönderilmez." },
            ].map((o, i) => (
              <Reveal key={o.baslik} delay={(i % 3) * 100}>
                <div className="h-full rounded-2xl border border-slate-100 bg-white p-6 transition hover:shadow-lg">
                  <o.icon className="text-indigo-600" size={26} />
                  <h3 className="mt-4 text-lg font-bold">{o.baslik}</h3>
                  <p className="mt-1 text-sm text-slate-600">{o.metin}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Paketler */}
      <section id="paketler" className="mx-auto max-w-5xl px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Sana uygun olanı seç</h2>
          <p className="mt-3 text-slate-600">Bireysel kullanım ücretsiz; firmalar için kurumsal panel.</p>
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-bold">Networker</h3>
              <p className="mt-1 text-slate-500">Bağımsız networker'lar için</p>
              <div className="mt-4 text-4xl font-extrabold">Ücretsiz</div>
              <ul className="mt-6 space-y-3 text-sm">
                {["Sınırsız aday ekleme", "Hazır + kişisel mesaj kalıpları", "Davet sayfası oluşturma", "Davranış takibi & aday skoru", "Randevu & bildirimler"].map((x) => (
                  <li key={x} className="flex items-center gap-2 text-slate-700"><Check size={16} className="text-emerald-500" /> {x}</li>
                ))}
              </ul>
              <Link href="/auth/kayit" className="mt-8 rounded-xl bg-slate-900 py-3 text-center font-semibold text-white transition hover:bg-slate-800">
                Hemen Başla
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white shadow-xl shadow-indigo-500/30">
              <div className="absolute right-5 top-5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Kurumsal</div>
              <h3 className="flex items-center gap-2 text-xl font-bold"><Building2 size={22} /> Business</h3>
              <p className="mt-1 text-indigo-100">Firmalar ve ekipler için</p>
              <div className="mt-4 text-4xl font-extrabold">Teklife Özel</div>
              <ul className="mt-6 space-y-3 text-sm">
                {["Firma logolu davet sayfaları", "Merkezi hazır mesaj kalıpları", "Networker davet & yönetimi", "Anonim performans raporları", "Kampanya bazlı sayfalar"].map((x) => (
                  <li key={x} className="flex items-center gap-2"><Check size={16} className="text-emerald-300" /> {x}</li>
                ))}
              </ul>
              <a href="mailto:destek@isimlistem.com" className="mt-8 rounded-xl bg-white py-3 text-center font-semibold text-indigo-700 transition hover:bg-indigo-50">
                İletişime Geç
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <Reveal>
          <div className="gradient-anim relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-16 text-center text-white">
            <h2 className="text-3xl font-bold sm:text-4xl">Bugün ilk adayını ekle</h2>
            <p className="mx-auto mt-3 max-w-xl text-indigo-100">
              Kayıt 30 saniye sürer. İlk davet linkini hemen oluştur.
            </p>
            <Link href="/auth/kayit" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-indigo-700 transition hover:bg-indigo-50">
              Ücretsiz Hesap Aç <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row">
          <span className="font-semibold text-slate-700">İsim Listem © {new Date().getFullYear()}</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/yasal/kvkk" className="hover:text-slate-900">KVKK</Link>
            <Link href="/yasal/gizlilik" className="hover:text-slate-900">Gizlilik</Link>
            <Link href="/yasal/cerez" className="hover:text-slate-900">Çerez</Link>
            <Link href="/auth/giris" className="hover:text-slate-900">Giriş</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MockSatir({ icon: Icon, etiket, deger, vurgu }: { icon: React.ComponentType<{ size?: number; className?: string }>; etiket: string; deger: string; vurgu?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${vurgu ? "border-indigo-200 bg-indigo-50" : "border-slate-100 bg-white"}`}>
      <span className="flex items-center gap-2 text-slate-500"><Icon size={15} className="text-slate-400" /> {etiket}</span>
      <span className={`font-semibold ${vurgu ? "text-indigo-700" : "text-slate-900"}`}>{deger}</span>
    </div>
  );
}
