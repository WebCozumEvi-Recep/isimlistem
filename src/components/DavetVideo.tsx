"use client";

import { useEffect, useRef } from "react";

/**
 * YouTube IFrame API ile video izleme takibi. Eşik bazlı (25/50/75/90) bir kez olay gönderir.
 * embedUrl youtube embed ise tracking aktif; değilse düz iframe (vimeo vb.) tracking'siz gösterilir.
 */
export default function DavetVideo({ token, embedUrl }: { token: string; embedUrl: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const gonderilen = useRef<Set<number>>(new Set());

  const youtube = embedUrl.includes("youtube.com/embed/");

  useEffect(() => {
    if (!youtube || !ref.current) return;
    const videoId = embedUrl.split("/embed/")[1]?.split("?")[0];
    if (!videoId) return;

    function sid() {
      return sessionStorage.getItem("il_sid") ?? "anon";
    }
    function gonder(olayTip: string, yuzde?: number) {
      fetch("/api/public/olay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, sessionId: sid(), olayTip, videoYuzde: yuzde }),
        keepalive: true,
      }).catch(() => {});
    }

    let player: { getCurrentTime: () => number; getDuration: () => number } | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    function init() {
      // @ts-expect-error global YT
      player = new window.YT.Player(ref.current, {
        videoId,
        events: {
          onStateChange: (e: { data: number }) => {
            // 1 = playing
            if (e.data === 1) {
              if (!gonderilen.current.has(0)) {
                gonderilen.current.add(0);
                gonder("video_started", 0);
              }
              if (!timer) {
                timer = setInterval(() => {
                  if (!player) return;
                  const sure = player.getDuration();
                  if (!sure) return;
                  const oran = Math.round((player.getCurrentTime() / sure) * 100);
                  for (const esik of [25, 50, 75, 90]) {
                    if (oran >= esik && !gonderilen.current.has(esik)) {
                      gonderilen.current.add(esik);
                      gonder(`video_${esik}`, esik);
                    }
                  }
                }, 2000);
              }
            }
          },
        },
      });
    }

    // @ts-expect-error global YT
    if (window.YT && window.YT.Player) {
      init();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      // @ts-expect-error global callback
      const onceki = window.onYouTubeIframeAPIReady;
      // @ts-expect-error global callback
      window.onYouTubeIframeAPIReady = () => {
        onceki?.();
        init();
      };
    }

    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, embedUrl]);

  if (!youtube) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl shadow-sm">
        <iframe src={embedUrl} className="h-full w-full" allowFullScreen title="video" />
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-2xl shadow-sm">
      <div ref={ref} className="h-full w-full" />
    </div>
  );
}
