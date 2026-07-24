"use client";

import { Download } from "lucide-react";
import { kisiIceAktar } from "@/app/panel/actions";

export default function IceAktarButton() {
  return (
    <form action={kisiIceAktar} className="flex-1">
      <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-3 py-2.5 text-[13px] font-bold text-[#3B4759] hover:bg-slate-50">
        <Download size={17} className="text-[#16A34A]" /> İçe Aktar
        <input
          type="file"
          name="dosya"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        />
      </label>
    </form>
  );
}
