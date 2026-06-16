"use client";

import { Upload } from "lucide-react";
import { kisiIceAktar } from "@/app/panel/actions";

export default function IceAktarButton() {
  return (
    <form action={kisiIceAktar} className="flex items-center">
      <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <Upload size={16} /> İçe Aktar
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
