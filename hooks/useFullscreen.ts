"use client";

import { useCallback, useEffect, useState } from "react";

export function useFullscreen() {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setFullscreen(Boolean(document.fullscreenElement));

    const handler = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);

    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return { fullscreen, toggle };
}
