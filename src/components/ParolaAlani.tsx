"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function ParolaAlani({
  label = "Parola",
  name = "parola",
  autoComplete,
}: {
  label?: string;
  name?: string;
  autoComplete?: string;
}) {
  const [goster, setGoster] = useState(false);
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <input
          name={name}
          type={goster ? "text" : "password"}
          required
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-11 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        <button
          type="button"
          onClick={() => setGoster((g) => !g)}
          aria-label={goster ? "Parolayı gizle" : "Parolayı göster"}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
        >
          {goster ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}
