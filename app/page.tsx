"use client";

import Link from "next/link";
import {
  Settings,
  ShoppingBag,
  Play,
  Shield,
  Star,
  Coins,
  Maximize,
  Minimize,
  LogOut,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useSession } from "@/hooks/useSession";

import styles from "./home.module.css";

/* =========================
   FLOATING ITEM
========================= */
function FloatingItem({
  emoji,
  style,
}: {
  emoji: string;
  style: React.CSSProperties;
}) {
  return (
    <div className={styles.floatingItem} style={style}>
      {emoji}
    </div>
  );
}

/* =========================
   CLOUD
========================= */
function CloudShape({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 200 80"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        pointerEvents: "none",
        opacity: 0.9,
        ...style,
      }}
    >
      <ellipse cx="100" cy="55" rx="90" ry="28" fill="white" />
      <ellipse cx="70" cy="42" rx="45" ry="36" fill="white" />
      <ellipse cx="130" cy="45" rx="40" ry="32" fill="white" />
      <ellipse cx="100" cy="38" rx="35" ry="30" fill="white" />
    </svg>
  );
}

/* =========================
   CITY
========================= */
function CityBuildings() {
  return (
    <svg
      style={{ position: "absolute", bottom: "60px", left: 0, width: "100%", zIndex: 2 }}
      viewBox="0 0 1440 240"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <rect x="0"    y="120" width="70"  height="120" fill="#B3D9FF" rx="4" />
      <rect x="15"   y="80"  width="40"  height="40"  fill="#B3D9FF" rx="4" />
      <rect x="20"   y="60"  width="30"  height="20"  fill="#FFD6E7" rx="2" />
      <rect x="80"   y="80"  width="90"  height="160" fill="#FFD6E7" rx="4" />
      <rect x="100"  y="40"  width="50"  height="40"  fill="#FFD6E7" rx="4" />
      <rect x="115"  y="20"  width="20"  height="20"  fill="#FFAAD4" rx="2" />
      <rect x="180"  y="100" width="80"  height="140" fill="#D4F0B8" rx="4" />
      <rect x="195"  y="65"  width="50"  height="35"  fill="#D4F0B8" rx="4" />
      <rect x="270"  y="60"  width="100" height="180" fill="#FFE4B3" rx="4" />
      <rect x="285"  y="20"  width="70"  height="40"  fill="#FFE4B3" rx="4" />
      <rect x="305"  y="5"   width="30"  height="15"  fill="#FFCC80" rx="2" />
      <rect x="380"  y="90"  width="75"  height="150" fill="#E0C8FF" rx="4" />
      <rect x="395"  y="55"  width="45"  height="35"  fill="#E0C8FF" rx="4" />
      <rect x="470"  y="70"  width="90"  height="170" fill="#B3D9FF" rx="4" />
      <rect x="485"  y="30"  width="60"  height="40"  fill="#B3D9FF" rx="4" />
      <rect x="500"  y="12"  width="30"  height="18"  fill="#80BFFF" rx="2" />
      <rect x="570"  y="95"  width="80"  height="145" fill="#FFDDB3" rx="4" />
      <rect x="585"  y="60"  width="50"  height="35"  fill="#FFDDB3" rx="4" />
      <rect x="660"  y="75"  width="85"  height="165" fill="#D4F0B8" rx="4" />
      <rect x="675"  y="38"  width="55"  height="37"  fill="#D4F0B8" rx="4" />
      <rect x="690"  y="18"  width="25"  height="20"  fill="#A8E063" rx="2" />
      <rect x="755"  y="85"  width="90"  height="155" fill="#FFD6E7" rx="4" />
      <rect x="770"  y="48"  width="60"  height="37"  fill="#FFD6E7" rx="4" />
      <rect x="855"  y="65"  width="95"  height="175" fill="#B3D9FF" rx="4" />
      <rect x="870"  y="25"  width="65"  height="40"  fill="#B3D9FF" rx="4" />
      <rect x="887"  y="8"   width="30"  height="17"  fill="#80BFFF" rx="2" />
      <rect x="960"  y="88"  width="78"  height="152" fill="#E0C8FF" rx="4" />
      <rect x="975"  y="52"  width="48"  height="36"  fill="#E0C8FF" rx="4" />
      <rect x="1050" y="72"  width="88"  height="168" fill="#FFE4B3" rx="4" />
      <rect x="1065" y="32"  width="58"  height="40"  fill="#FFE4B3" rx="4" />
      <rect x="1080" y="14"  width="28"  height="18"  fill="#FFCC80" rx="2" />
      <rect x="1148" y="92"  width="80"  height="148" fill="#D4F0B8" rx="4" />
      <rect x="1163" y="57"  width="50"  height="35"  fill="#D4F0B8" rx="4" />
      <rect x="1238" y="68"  width="90"  height="172" fill="#FFD6E7" rx="4" />
      <rect x="1253" y="28"  width="60"  height="40"  fill="#FFD6E7" rx="4" />
      <rect x="1268" y="10"  width="30"  height="18"  fill="#FFAAD4" rx="2" />
      <rect x="1338" y="98"  width="75"  height="142" fill="#B3D9FF" rx="4" />
      <rect x="1353" y="63"  width="45"  height="35"  fill="#B3D9FF" rx="4" />
      <rect x="1420" y="80"  width="25"  height="160" fill="#E0C8FF" rx="4" />
      <g>
        {[
          [10,90],[10,110],[30,90],[30,110],
          [90,55],[90,75],[90,95],[110,55],[110,75],[110,95],[130,55],[130,75],[130,95],
          [190,110],[190,130],[210,110],[210,130],[230,110],
          [285,75],[285,95],[285,115],[305,75],[305,95],[305,115],[325,75],[325,95],
          [395,100],[395,120],[415,100],[415,120],[435,100],
          [485,80],[485,100],[485,120],[505,80],[505,100],[520,80],[520,100],
          [585,105],[585,125],[605,105],[605,125],[625,105],
          [675,85],[675,105],[675,125],[695,85],[695,105],[715,85],
          [770,95],[770,115],[790,95],[790,115],[810,95],
          [875,72],[875,92],[875,112],[895,72],[895,92],[915,72],
          [980,98],[980,118],[1000,98],[1000,118],
          [1070,82],[1070,102],[1070,122],[1090,82],[1090,102],[1110,82],
          [1168,102],[1168,122],[1188,102],[1188,122],
          [1258,78],[1258,98],[1258,118],[1278,78],[1278,98],[1298,78],
          [1358,108],[1358,128],[1378,108],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="8" height="10" rx="2"
            fill={["#FFF59D","#BBDEFB","#F8BBD9","#C8E6C9","#FFE0B2"][i % 5]}
            opacity="0.9"
          />
        ))}
      </g>
    </svg>
  );
}

/* =========================
   MAIN
========================= */
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { fullscreen, toggle: toggleFullscreen } = useFullscreen();
  const { user, checked, login, logout } = useSession();

  const showAuth = !user;
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState<{
    show: boolean; title: string; message: string;
    type?: "success" | "error" | "confirm";
    confirmLabel?: string; onConfirm?: () => void;
  }>({ show: false, title: "", message: "" });

  const [aboutPopup, setAboutPopup] = useState<"ig" | "wa" | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(80);
  const [sfxVolume, setSfxVolume] = useState(70);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    async function loadSettings() {
      if (!user?.id) return;
      const { data } = await supabase
        .from("users").select("sound_enabled, music_volume, sfx_volume")
        .eq("id", user.id).single();
      if (data) {
        setSoundEnabled(data.sound_enabled ?? true);
        setMusicEnabled((data.music_volume ?? 0) > 0);
        setMusicVolume(data.music_volume ?? 80);
        setSfxVolume(data.sfx_volume ?? 70);
      }
    }
    loadSettings();
  }, [user]);

  function showPopup({ title, message, type = "success", confirmLabel, onConfirm }: {
    title: string; message: string;
    type?: "success" | "error" | "confirm";
    confirmLabel?: string; onConfirm?: () => void;
  }) {
    setPopup({ show: true, title, message, type, onConfirm });
  }
  function closePopup() { setPopup({ show: false, title: "", message: "" }); }

  async function handleLogin() {
    if (!username || !password) {
      showPopup({ title: "Oops!", message: "Isi username dan password dulu ya 🎮", type: "error" }); return;
    }
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*")
      .eq("username", username).eq("password", password).single();
    setLoading(false);
    if (error || !data) {
      showPopup({ title: "Login Gagal", message: "Username atau password salah 😵", type: "error" }); return;
    }
    login(data);
    showPopup({ title: "Berhasil!", message: "Login berhasil 🎉", type: "success" });
  }

  async function handleRegister() {
    if (!username || !password) {
      showPopup({ title: "Oops!", message: "Isi username dan password dulu ya 🎮", type: "error" }); return;
    }
    setLoading(true);
    const { data: existingUser } = await supabase.from("users").select("id").eq("username", username).maybeSingle();
    if (existingUser) {
      setLoading(false);
      showPopup({ title: "Username Dipakai", message: "Coba gunakan username lain 🌟", type: "error" }); return;
    }
    const { data, error: insertError } = await supabase.from("users")
      .insert([{ username, password, points: 0, sound_enabled: true, music_volume: 100, sfx_volume: 100 }])
      .select().single();
    setLoading(false);
    if (insertError) {
      showPopup({ title: "Gagal Daftar", message: insertError?.message || "Gagal daftar", type: "error" }); return;
    }
    login(data);
    showPopup({ title: "Akun Dibuat!", message: "Selamat datang di The Integrity Gauge 🎮", type: "success" });
  }

  function handleLogout() {
    window.dispatchEvent(new CustomEvent("integrity-music-settings", {
      detail: { action: "stop" },
    }));
    logout();
    setUsername("");
    setPassword("");
  }

  async function saveSettings() {
    if (!user?.id) return;
    const finalMusicVolume = musicEnabled ? musicVolume : 0;
    const finalSfxVolume = soundEnabled ? sfxVolume : 0;
    await supabase.from("users").update({
      sound_enabled: soundEnabled,
      music_volume: finalMusicVolume,
      sfx_volume: finalSfxVolume,
    }).eq("id", user.id);

    // Sync to localStorage so MusicProvider & SFX read the correct values
    try {
      const raw = localStorage.getItem("game-user");
      if (raw) {
        const u = JSON.parse(raw);
        u.sound_enabled = soundEnabled;
        u.music_volume = finalMusicVolume;
        u.sfx_volume = finalSfxVolume;
        localStorage.setItem("game-user", JSON.stringify(u));
      }
    } catch {}

    window.dispatchEvent(new CustomEvent("integrity-music-settings", {
      detail: {
        action: "sync",
        musicEnabled,
        musicVolume: finalMusicVolume,
      },
    }));
    setShowSettings(false);
    showPopup({ title: "Tersimpan!", message: "Pengaturan berhasil disimpan 🎵", type: "success" });
  }

  function startMusic() {
    window.dispatchEvent(new CustomEvent("integrity-music-settings", {
      detail: { action: "play", musicEnabled, musicVolume },
    }));
  }

  const floatingItems = [
    { emoji: "💰", top: "8%",  left: "5%",  animDelay: "0s",   duration: "5s" },
    { emoji: "📄", top: "12%", left: "87%", animDelay: "1s",   duration: "6s" },
    { emoji: "🪙", top: "28%", left: "10%", animDelay: "2s",   duration: "4.5s" },
    { emoji: "✉️", top: "8%",  left: "73%", animDelay: "0.5s", duration: "7s" },
    { emoji: "⭐", top: "38%", left: "91%", animDelay: "3s",   duration: "5s" },
    { emoji: "💼", top: "22%", left: "3%",  animDelay: "1.5s", duration: "6s" },
    { emoji: "🏅", top: "48%", left: "6%",  animDelay: "4s",   duration: "4s" },
    { emoji: "📋", top: "32%", left: "80%", animDelay: "2.5s", duration: "8s" },
    { emoji: "🎯", top: "18%", left: "50%", animDelay: "0.8s", duration: "5.5s" },
    { emoji: "🌟", top: "5%",  left: "30%", animDelay: "3.5s", duration: "6s" },
  ];

  if (!checked) return null;

  return (
    <div className={styles.gameRoot}>

      {/* ============================================================
          GAME-STYLE AUTH SCREEN
          Layout: [Karakter Cewe] | [Login Panel] | [Karakter Cowo]
      ============================================================ */}
      {showAuth && (
        <div className={styles.authScreenBg}>
          <div className={styles.authSun} />

          <CloudShape style={{ top: "4%", left: "2%", width: "150px" }} />
          <CloudShape style={{ top: "6%", right: "10%", width: "120px", opacity: 0.75 }} />
          <CloudShape style={{ top: "2%", left: "38%", width: "100px", opacity: 0.6 }} />

          <div className={styles.authFloat} style={{ top: "8%",  left: "4%",  "--delay": "0s",   "--dur": "5s"   } as React.CSSProperties}>💰</div>
          <div className={styles.authFloat} style={{ top: "10%", right: "5%", "--delay": "1s",   "--dur": "6s"   } as React.CSSProperties}>📄</div>
          <div className={styles.authFloat} style={{ top: "40%", left: "3%",  "--delay": "2s",   "--dur": "4.5s" } as React.CSSProperties}>🪙</div>
          <div className={styles.authFloat} style={{ top: "20%", right: "3%", "--delay": "0.5s", "--dur": "7s"   } as React.CSSProperties}>⭐</div>
          <div className={styles.authFloat} style={{ top: "55%", right: "4%", "--delay": "3s",   "--dur": "5s"   } as React.CSSProperties}>🏅</div>
          <div className={styles.authFloat} style={{ top: "70%", left: "5%",  "--delay": "1.5s", "--dur": "6s"   } as React.CSSProperties}>🎯</div>

          {/* ── Three-column layout ── */}
          <div className={styles.authContent}>

            {/* ─────────────────────────────────────────
                KOLOM KIRI — Karakter Cewe
                Ganti src="/assets/characters/karakter-cewe.png"
                dengan path file karakter cewe kamu.
                Ukuran bisa diatur lewat .mascotImg di CSS.
            ───────────────────────────────────────── */}
            <div className={`${styles.mascotWrap} ${styles.mascotLeft}`}>
              <img
                src="assets/img/Karakter Cewe.png"
                alt="Karakter Cewe"
                className={styles.mascotImg}
              />
            </div>

            {/* ─────────────────────────────────────────
                KOLOM TENGAH — Panel Login
            ───────────────────────────────────────── */}
            <div className={styles.authGamePanel}>
              <div className={styles.authGameBadge}>THE INTEGRITY GAUGE</div>

              <h1 className={styles.authGameTitle}>
                {isLogin ? "MASUK" : "DAFTAR"}
              </h1>
              <p className={styles.authGameSub}>
                🎮 Simpan progres & poin permainanmu!
              </p>

              <div className={styles.authTabs}>
                <button
                  className={`${styles.authTab} ${isLogin ? styles.authTabActive : styles.authTabInactive}`}
                  onClick={() => setIsLogin(true)}
                >
                  MASUK
                </button>
                <button
                  className={`${styles.authTab} ${!isLogin ? styles.authTabActive : styles.authTabInactive}`}
                  onClick={() => setIsLogin(false)}
                >
                  DAFTAR
                </button>
              </div>

              <div className={styles.authInputWrap}>
                <span className={styles.authInputIcon}>👤</span>
                <input
                  type="text" placeholder="Username" value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.authGameInput}
                  onKeyDown={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleRegister())}
                />
              </div>

              <div className={styles.authInputWrap}>
                <span className={styles.authInputIcon}>🔒</span>
                <input
                  type="password" placeholder="Password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.authGameInput}
                  onKeyDown={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleRegister())}
                />
              </div>

              <button
                onClick={isLogin ? handleLogin : handleRegister}
                disabled={loading}
                className={styles.authGameBtn}
              >
                {loading ? "⏳ LOADING..." : isLogin ? "▶  MASUK SEKARANG" : "✨  BUAT AKUN BARU"}
              </button>

              <div className={styles.authDivider}>
                <span className={styles.authDividerLine} />
                <span className={styles.authDividerText}>Tentang kami</span>
                <span className={styles.authDividerLine} />
              </div>

              <div className={styles.authSocials}>
                <button className={`${styles.authSocialBtn} ${styles.socialIG}`} onClick={() => setAboutPopup("ig")}> 
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  Instagram
                </button>
                <button className={`${styles.authSocialBtn} ${styles.socialWA}`} onClick={() => setAboutPopup("wa")}> 
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
              </div>

              <p className={styles.authSwitchText}>
                {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                <button className={styles.authSwitchBtn} onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Daftar di sini" : "Masuk di sini"}
                </button>
              </p>

              <div className={styles.authFooterInfo}>
                🔒 Data poin, item toko, dan pengaturan akan tersimpan
              </div>
            </div>

            {/* ─────────────────────────────────────────
                KOLOM KANAN — Karakter Cowo
                Ganti src="/assets/characters/karakter-cowo.png"
                dengan path file karakter cowo kamu.
            ───────────────────────────────────────── */}
            <div className={`${styles.mascotWrap} ${styles.mascotRight}`}>
              <img
                src="assets/img/Karakter Cowo.png"
                alt="Karakter Cowo"
                className={styles.mascotImg}
              />
            </div>
          </div>

          <div className={styles.authGrass} />

          {/* POPUP IG */}
          {aboutPopup === "ig" && (
            <div className={styles.popupOverlay}>
              <div className={styles.aboutPopupCard}>
                <button className={styles.aboutPopupClose} onClick={() => setAboutPopup(null)}>✕</button>
                <div className={styles.aboutPopupHeader}>
                  <div className={styles.aboutPopupIconIG}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </div>
                  <h2 className={styles.aboutPopupTitle}>Instagram Kami</h2>
                  <p className={styles.aboutPopupSub}>Ikuti kami untuk info & update terbaru! 📸</p>
                </div>
                <div className={styles.aboutProfileList}>
                  <a href="https://www.instagram.com/dahabbagus_p/" target="_blank" rel="noopener noreferrer" className={`${styles.aboutProfileCard} ${styles.igCard}`}>
                    <div className={styles.aboutAvatar} style={{ background: "linear-gradient(135deg, #E1306C, #F77737)" }}>A</div>
                    <div className={styles.aboutProfileInfo}>
                      <span className={styles.aboutProfileName}>Dahab Bagus Perkasa</span>
                      <span className={styles.aboutProfileHandle}>@dahabbagus_p</span>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/iamkxr1/" target="_blank" rel="noopener noreferrer" className={`${styles.aboutProfileCard} ${styles.igCard}`}>
                    <div className={styles.aboutAvatar} style={{ background: "linear-gradient(135deg, #4D96FF, #9B59B6)" }}>B</div>
                    <div className={styles.aboutProfileInfo}>
                      <span className={styles.aboutProfileName}>Akhmad Thoriq Aydin .R</span>
                      <span className={styles.aboutProfileHandle}>@iamkxr1</span>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* POPUP WA */}
          {aboutPopup === "wa" && (
            <div className={styles.popupOverlay}>
              <div className={styles.aboutPopupCard}>
                <button className={styles.aboutPopupClose} onClick={() => setAboutPopup(null)}>✕</button>
                <div className={styles.aboutPopupHeader}>
                  <div className={styles.aboutPopupIconWA}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                  </div>
                  <h2 className={styles.aboutPopupTitle}>WhatsApp Kami</h2>
                  <p className={styles.aboutPopupSub}>Salin nomor & hubungi kami langsung! 💬</p>
                </div>
                <div className={styles.aboutProfileList}>
                  <div className={`${styles.aboutProfileCard} ${styles.waCard}`}>
                    <div className={styles.aboutAvatar} style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>A</div>
                    <div className={styles.aboutProfileInfo}>
                      <span className={styles.aboutProfileName}>Dahab Bagus Perkasa</span>
                      <span className={styles.aboutWaNumber}>0896-5233-7277</span>
                    </div>
                    <button className={styles.aboutCopyBtn} onClick={() => {
                      navigator.clipboard.writeText("0896-5233-7277");
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      Salin
                    </button>
                  </div>
                  <div className={`${styles.aboutProfileCard} ${styles.waCard}`}>
                    <div className={styles.aboutAvatar} style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B9D)" }}>B</div>
                    <div className={styles.aboutProfileInfo}>
                      <span className={styles.aboutProfileName}>Akhmad Thoriq Aydin .R</span>
                      <span className={styles.aboutWaNumber}>0812-9721-0998</span>
                    </div>
                    <button className={styles.aboutCopyBtn} onClick={() => {
                      navigator.clipboard.writeText("0812-9721-0998");
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      Salin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LOGOUT */}
      {!showAuth && (
        <div className={styles.logoutBar}>
          <button
            onClick={() => {
              showPopup({
                title: "Logout?", message: "Progress akun tetap tersimpan 🌟",
                type: "confirm",
                onConfirm: () => {
                  handleLogout();
                  closePopup();
                  setTimeout(() => showPopup({ title: "Berhasil Logout", message: "Sampai jumpa lagi 👋", type: "success" }), 200);
                },
              });
            }}
            className={styles.logoutBtn}
          >
            <LogOut size={18} />
            LOGOUT
          </button>
        </div>
      )}

      {/* CUSTOM POPUP */}
      {popup.show && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <div className={`${styles.popupIcon} ${popup.type === "error" ? styles.popupIconError : popup.type === "confirm" ? styles.popupIconConfirm : ""}`}>
              {popup.type === "error" ? "❌" : popup.type === "confirm" ? "🤔" : "🎉"}
            </div>
            <h2 className={styles.popupTitle}>{popup.title}</h2>
            <p className={styles.popupMessage}>{popup.message}</p>
            <div className={styles.popupButtons}>
              {popup.type === "confirm" ? (
                <>
                  <button onClick={closePopup} className={`${styles.popupButton} ${styles.secondary}`}>BATAL</button>
                  <button onClick={popup.onConfirm} className={`${styles.popupButton} ${styles.confirm}`}>{popup.confirmLabel || "YA"}</button>
                </>
              ) : (
                <button onClick={closePopup} className={`${styles.popupButton} ${styles.primary}`}>OKE</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.decorDots} />
      <div className={styles.sun} />
      <CloudShape style={{ top: "4%", left: "2%", width: "180px" }} />
      <CloudShape style={{ top: "8%", left: "28%", width: "140px", opacity: 0.7 }} />
      <CloudShape style={{ top: "3%", right: "22%", width: "160px" }} />
      <CloudShape style={{ top: "18%", right: "3%", width: "120px", opacity: 0.6 }} />

      {mounted && floatingItems.map((item, i) => (
        <FloatingItem key={i} emoji={item.emoji}
          style={{ top: item.top, left: item.left, "--delay": item.animDelay, "--dur": item.duration } as React.CSSProperties}
        />
      ))}

      <div className={`${styles.fullscreenBar} ${styles.animFade}`}>
        <button onClick={toggleFullscreen} className={styles.btnSettings}>
          {fullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          {fullscreen ? "KELUAR" : "FULLSCREEN"}
        </button>
      </div>

      <div className={`${styles.settingsBar} ${styles.animFade}`}>
        <button onClick={() => setShowSettings(true)} className={styles.btnSettings}>
          <Settings size={15} />
          SETTINGS
        </button>
      </div>

      {showSettings && (
        <div className={styles.popupOverlay}>
          <div className={styles.settingsCard}>
            <div style={{ textAlign: "center", fontSize: "34px", marginBottom: "8px" }}>⚙️</div>
            <h2 className={styles.settingsTitle}>SETTINGS</h2>
            <div className={styles.settingsRow}>
              <div className={styles.settingsRowHeader}>
                <span className={styles.settingsLabel}>🔊 Sound Effect</span>
                <button onClick={() => setSoundEnabled(!soundEnabled)} className={`${styles.toggleBtn} ${soundEnabled ? styles.toggleOn : styles.toggleOff}`}>
                  {soundEnabled ? "ON" : "OFF"}
                </button>
              </div>
              <input type="range" min={0} max={100} value={sfxVolume} onChange={(e) => setSfxVolume(Number(e.target.value))} disabled={!soundEnabled} style={{ width: "100%" }} />
              <div className={styles.volumeLabel}>{sfxVolume}%</div>
            </div>
            <div className={styles.settingsRow}>
              <div className={styles.settingsRowHeader}>
                <span className={styles.settingsLabel}>🎵 Background Music</span>
                <button onClick={() => setMusicEnabled(!musicEnabled)} className={`${styles.toggleBtn} ${musicEnabled ? styles.toggleOnMusic : styles.toggleOff}`}>
                  {musicEnabled ? "ON" : "OFF"}
                </button>
              </div>
              <input type="range" min={0} max={100} value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} disabled={!musicEnabled} style={{ width: "100%" }} />
              <div className={styles.volumeLabel}>{musicVolume}%</div>
            </div>
            <div className={styles.settingsBtns}>
              <button onClick={() => setShowSettings(false)} className={styles.settingsBtnCancel}>BATAL</button>
              <button onClick={saveSettings} className={styles.settingsBtnSave}>SIMPAN</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.contentPanel}>
        <div className={`${styles.titleWrapper} ${styles.anim1}`}>
          <div className={styles.titleCard}>
            <svg viewBox="0 0 660 130" width="min(660px, 88vw)" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible", display: "block" }}>
              <defs>
                <path id="arc" d="M 10,110 Q 330,10 650,110" />
                <linearGradient id="kidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#FF6B9D" />
                  <stop offset="25%"  stopColor="#FF8E53" />
                  <stop offset="50%"  stopColor="#FFD93D" />
                  <stop offset="75%"  stopColor="#6BCB77" />
                  <stop offset="100%" stopColor="#4D96FF" />
                </linearGradient>
                <filter id="txtShadow" x="-5%" y="-5%" width="110%" height="130%">
                  <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="rgba(0,0,0,0.15)" />
                </filter>
              </defs>
              <text fontFamily="'Fredoka One', cursive" fontSize="54" fontWeight="900" fill="url(#kidGrad)" filter="url(#txtShadow)" letterSpacing="1">
                <textPath href="#arc" startOffset="50%" textAnchor="middle">The Integrity Gauge</textPath>
              </text>
            </svg>
          </div>
          <p className={styles.titleSub}>🎮 Pilih Jujur, Raih Kemenangan! 🏆</p>
          <div className={styles.titleDivider} />
        </div>

        <div className={`${styles.integrityBadge} ${styles.anim2}`}>
          <Shield size={14} />
          <span>JUJUR vs KORUPSI</span>
          <Star size={12} fill="currentColor" />
          <span>KAMU PILIH!</span>
          <Shield size={14} />
        </div>

        <div className={`${styles.btnGroup} ${styles.anim3}`}>
          <Link href="/play" className={styles.btnPlay}>
            <Play size={24} fill="currentColor" />
            MAIN
          </Link>
          <Link href="/shop" className={styles.btnShop}>
            <ShoppingBag size={22} />
            TOKO
          </Link>
        </div>

        <p className={`${styles.hintText} ${styles.anim4}`}>
          <Coins size={13} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
          Kumpulkan koin dengan jujur & tetap bebas! 🌟
        </p>
      </div>

      <CityBuildings />
      <div className={styles.grass} />
    </div>
  );
}
