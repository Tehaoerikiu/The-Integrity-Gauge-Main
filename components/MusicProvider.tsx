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
    const sfxVolume = Number(user?.sfx_volume ?? 80);
    return {
      enabled: volume > 0,
      volume: Math.max(0, Math.min(100, volume)),
      sfxVolume: Math.max(0, Math.min(100, sfxVolume)),
    };
  } catch {
    return { enabled: true, volume: 80, sfxVolume: 80 };
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

    let isExternallyStopped = false;

    function syncAndMaybePlay(detail?: MusicEventDetail) {
      const settings = readMusicSettings();
      const enabled = detail?.musicEnabled ?? settings.enabled;
      const volume = detail?.musicVolume ?? settings.volume;

      audio.volume = Math.max(0, Math.min(100, volume)) / 100;

      if (detail?.action === "stop") {
        isExternallyStopped = true;
      } else if (detail?.action === "play") {
        isExternallyStopped = false;
      }

      if (isExternallyStopped || !enabled) {
        audio.pause();
        audio.currentTime = 0;
        return;
      }

      if (detail?.action === "play") {
        allowedToPlayRef.current = true;
      }

      if (allowedToPlayRef.current && enabled) {
        audio.play().catch(() => { });
      }
    }

    function unlockMusic() {
      allowedToPlayRef.current = true;
      syncAndMaybePlay();
    }

    function handleSettings(event: Event) {
      syncAndMaybePlay((event as CustomEvent<MusicEventDetail>).detail);
    }

    const clickAudio = new Audio("/assets/sound/Button Click.mp3");

    function handleGlobalClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const button = target.closest("button") || target.closest("a");

      if (button && button.dataset.noClickSound !== "true") {
        const settings = readMusicSettings();
        if (settings.sfxVolume > 0) {
          clickAudio.volume = Math.max(0, Math.min(100, settings.sfxVolume)) / 100;
          clickAudio.currentTime = 0;
          clickAudio.play().catch(() => { });
        }
      }
    }

    window.addEventListener("pointerdown", unlockMusic, { once: true });
    window.addEventListener("keydown", unlockMusic, { once: true });
    window.addEventListener("integrity-music-settings", handleSettings);
    window.addEventListener("click", handleGlobalClick);

    return () => {
      audio.pause();
      window.removeEventListener("pointerdown", unlockMusic);
      window.removeEventListener("keydown", unlockMusic);
      window.removeEventListener("integrity-music-settings", handleSettings);
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  return null;
}
