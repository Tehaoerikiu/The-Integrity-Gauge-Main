"use client";

import { useEffect, useRef } from "react";

type MusicEventDetail = {
  action?: "play" | "stop" | "sync";
  musicEnabled?: boolean;
  musicVolume?: number;
};

const MUSIC_SRC = "/assets/sound/Paper Crown Parade.mp3.mpeg";

function readMusicSettings() {
  try {
    const raw = localStorage.getItem("game-user");
    const user = raw ? JSON.parse(raw) : null;
    const volume = Number(user?.music_volume ?? 80);
    return {
      enabled: volume > 0,
      volume: Math.max(0, Math.min(100, volume)),
    };
  } catch {
    return { enabled: true, volume: 80 };
  }
}

export default function MusicProvider() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const allowedToPlayRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = readMusicSettings().volume / 100;
    audioRef.current = audio;

    function syncAndMaybePlay(detail?: MusicEventDetail) {
      const settings = readMusicSettings();
      const enabled = detail?.musicEnabled ?? settings.enabled;
      const volume = detail?.musicVolume ?? settings.volume;

      audio.volume = Math.max(0, Math.min(100, volume)) / 100;

      if (detail?.action === "stop" || !enabled) {
        audio.pause();
        audio.currentTime = 0;
        allowedToPlayRef.current = false;
        return;
      }

      if (detail?.action === "play") {
        allowedToPlayRef.current = true;
      }

      if (allowedToPlayRef.current && enabled) {
        audio.play().catch(() => {});
      }
    }

    function unlockMusic() {
      allowedToPlayRef.current = true;
      syncAndMaybePlay({ action: "play" });
    }

    function handleSettings(event: Event) {
      syncAndMaybePlay((event as CustomEvent<MusicEventDetail>).detail);
    }

    window.addEventListener("pointerdown", unlockMusic, { once: true });
    window.addEventListener("keydown", unlockMusic, { once: true });
    window.addEventListener("integrity-music-settings", handleSettings);

    return () => {
      audio.pause();
      window.removeEventListener("pointerdown", unlockMusic);
      window.removeEventListener("keydown", unlockMusic);
      window.removeEventListener("integrity-music-settings", handleSettings);
    };
  }, []);

  return null;
}
