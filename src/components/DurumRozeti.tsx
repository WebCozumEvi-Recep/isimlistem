import { DURUM_ETIKET, DURUM_RENK, type SunumDurum } from "@/lib/sabitler";

export default function DurumRozeti({ durum }: { durum: SunumDurum }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${DURUM_RENK[durum]}`}
    >
      {DURUM_ETIKET[durum]}
    </span>
  );
}
