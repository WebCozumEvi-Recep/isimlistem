import {
  KAYNAK_TIPLERI,
  KAYNAK_ETIKET,
  SUNUM_DURUMLARI,
  DURUM_ETIKET,
  ADAY_TIPLERI,
  ADAY_TIPI_ETIKET,
  SICAKLIKLAR,
  SICAKLIK_ETIKET,
} from "@/lib/sabitler";

type Kisi = {
  adSoyad: string;
  telefon: string | null;
  email: string | null;
  sehir: string | null;
  adayTipi: string;
  sicaklik: string;
  kaynakTip: string;
  kaynakNot: string | null;
  durum: string;
  oncelik: number;
  notlar: string | null;
  sonrakiTakip: Date | null;
};

// Yeni kayıtta durum alanı gösterilir; düzenlemede durum ayrı action ile yönetilir.
export default function KisiForm({
  kisi,
  action,
  durumGoster = false,
  gonderEtiket = "Kaydet",
}: {
  kisi?: Partial<Kisi>;
  action: (formData: FormData) => void;
  durumGoster?: boolean;
  gonderEtiket?: string;
}) {
  const takipDeger = kisi?.sonrakiTakip
    ? new Date(kisi.sonrakiTakip).toISOString().slice(0, 10)
    : "";

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Alan label="Ad Soyad *" name="adSoyad" deger={kisi?.adSoyad} required />
        <Alan label="GSM Telefon *" name="telefon" deger={kisi?.telefon ?? ""} type="tel" required />
        <Alan label="E-posta" name="email" deger={kisi?.email ?? ""} type="email" />
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Kaynak / Bağ</span>
          <select
            name="kaynakTip"
            defaultValue={kisi?.kaynakTip ?? "DIGER"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
          >
            {KAYNAK_TIPLERI.map((k) => (
              <option key={k} value={k}>
                {KAYNAK_ETIKET[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Alan label="Şehir" name="sehir" deger={kisi?.sehir ?? ""} />
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Aday Tipi</span>
          <select
            name="adayTipi"
            defaultValue={kisi?.adayTipi ?? "GENEL"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
          >
            {ADAY_TIPLERI.map((t) => (
              <option key={t} value={t}>{ADAY_TIPI_ETIKET[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Sıcaklık</span>
          <select
            name="sicaklik"
            defaultValue={kisi?.sicaklik ?? "ILIK"}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
          >
            {SICAKLIKLAR.map((s) => (
              <option key={s} value={s}>{SICAKLIK_ETIKET[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <Alan
        label="Bağ açıklaması (ör: üniversiteden arkadaşım)"
        name="kaynakNot"
        deger={kisi?.kaynakNot ?? ""}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {durumGoster && (
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Durum</span>
            <select
              name="durum"
              defaultValue={kisi?.durum ?? "YENI"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
            >
              {SUNUM_DURUMLARI.map((d) => (
                <option key={d} value={d}>
                  {DURUM_ETIKET[d]}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Öncelik (0-5)</span>
          <input
            name="oncelik"
            type="number"
            min={0}
            max={5}
            defaultValue={kisi?.oncelik ?? 0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
          />
        </div>
        <Alan
          label="Sonraki Takip Tarihi"
          name="sonrakiTakip"
          deger={takipDeger}
          type="date"
        />
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-slate-700">Notlar</span>
        <textarea
          name="notlar"
          defaultValue={kisi?.notlar ?? ""}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-emerald-500 px-5 py-2.5 font-medium text-white hover:bg-emerald-600"
      >
        {gonderEtiket}
      </button>
    </form>
  );
}

function Alan({
  label,
  name,
  deger,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  deger?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={deger ?? ""}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}
