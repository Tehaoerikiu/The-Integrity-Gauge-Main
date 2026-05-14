"use client";

import { useCallback, useEffect, useState } from "react";

export interface GameUser {
  id: number;
  username: string;
  points: number;
  sound_enabled: boolean;
  music_volume: number;
  sfx_volume: number;
}

function readUser(): GameUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("game-user");
    const expiry = localStorage.getItem("game-user-expired");

    if (!raw || !expiry) return null;

    if (Date.now() > Number(expiry)) {
      localStorage.removeItem("game-user");
      localStorage.removeItem("game-user-expired");
      return null;
    }

    return JSON.parse(raw) as GameUser;
  } catch {
    return null;
  }
}

export function useSession() {
  const [user, setUser] = useState<GameUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setUser(readUser());
    setChecked(true);
  }, []);

  const login = useCallback((data: GameUser) => {
    const expired = Date.now() + 1000 * 60 * 60 * 24 * 21;
    localStorage.setItem("game-user", JSON.stringify(data));
    localStorage.setItem("game-user-expired", expired.toString());
    setUser(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("game-user");
    localStorage.removeItem("game-user-expired");
    setUser(null);
  }, []);

  const updateUser = useCallback((partial: Partial<GameUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem("game-user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { user, checked, login, logout, updateUser };
}
