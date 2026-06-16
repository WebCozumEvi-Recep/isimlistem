"use client";

import { useEffect, useRef } from "react";

/**
 * Public davet sayfası davranış takibi:
 * - açılış (first_opened / page_opened)
 * - scroll eşikleri (25/50/75/100) — eşik başına bir kez
 * - sayfada süre (periyodik + kapanışta sendBeacon)
 * Video event'leri ileride YouTube/Vimeo SDK ile eklenecek.
 */
export default function DavetTracker({ token }: { token: string }) {
  const sessionRef = useRef<string>("");
  const gonderilenScroll = useRef<Set<number>>(new Set());
  const baslangic = useRef<number>(Date.now());

  useEffect(() => {
    let sid = sessionStorage.getItem("il_sid");
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem("il_sid", sid);
    }
    sessionRef.current = sid;

    const ilkMi = !sessionStorage.getItem(`il_opened_${token}`);
    sessionStorage.setItem(`il_opened_${token}`, "1");
    gonder({ olayTip: ilkMi ? "first_opened" : "page_opened" });

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (max <= 0) return;
      const oran = Math.round((h.scrollTop / max) * 100);
      for (const esik of [25, 50, 75, 100]) {
        if (oran >= esik && !gonderilenScroll.current.has(esik)) {
          gonderilenScroll.current.add(esik);
          gonder({ olayTip: `scroll_${esik}`, scrollYuzde: esik });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const sureGonder = (beacon = false) => {
      const sn = Math.round((Date.now() - baslangic.current) / 1000);
      gonder({ olayTip: "time_on_page", sayfadaSure: sn }, beacon);
    };
    const interval = setInterval(() => sureGonder(false), 15000);
    const onHide = () => sureGonder(true);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide();
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onHide);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function gonder(
    veri: { olayTip: string; scrollYuzde?: number; videoYuzde?: number; sayfadaSure?: number; olayDeger?: string },
    beacon = false
  ) {
    const payload = JSON.stringify({ token, sessionId: sessionRef.current, ...veri });
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon("/api/public/olay", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/public/olay", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }

  return null;
}
