"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export default function SubmitButton({
  children,
  bekleyenMetin,
  className,
}: {
  children: React.ReactNode;
  bekleyenMetin?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className ?? ""} inline-flex items-center justify-center gap-2 disabled:opacity-70`}>
      {pending && <Loader2 size={16} className="animate-spin" />}
      {pending ? bekleyenMetin ?? "İşleniyor..." : children}
    </button>
  );
}
