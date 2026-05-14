"use client";

import Link from "next/link";
import {
  ArrowLeft, Coins, ShoppingCart, Star, Sparkles,
  Crown, Zap, Shield, CheckCircle, Maximize, Minimize,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useFullscreen } from "@/hooks/useFullscreen";
import styles from "./shop.module.css";

// ─── Types ────────────────────────────────────────────────
interface ShopItem {
  id: number;          // numeric ID from DB
  emoji: string;
  name: string;
  desc: string;
  price: number;
  tag?: string;
  tagColor?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const RARITY_COLORS: Record<ShopItem["rarity"], string> = {
  common: "#94A3B8",
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F59E0B",
};
const RARITY_LABEL: Record<ShopItem["rarity"], string> = {
  common: "Biasa",
  rare: "Langka",
  epic: "Epik",
  legendary: "Legendaris",
};

// ─── Cloud / Float helpers ────────────────────────────────
function CloudShape({ style }: { style: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", pointerEvents: "none", opacity: 0.85, ...style }}>
      <ellipse cx="100" cy="55" rx="90" ry="28" fill="white" />
      <ellipse cx="70" cy="42" rx="45" ry="36" fill="white" />
      <ellipse cx="130" cy="45" rx="40" ry="32" fill="white" />
      <ellipse cx="100" cy="38" rx="35" ry="30" fill="white" />
    </svg>
  );
}
function FloatingItem({ emoji, style }: { emoji: string; style: React.CSSProperties }) {
  return <div className={styles.floatingItem} style={style}>{emoji}</div>;
}

// ─── Item Card ────────────────────────────────────────────
function ItemCard({
  item,
  isOwned,
  onBuy,
}: {
  item: ShopItem;
  isOwned: boolean;
  onBuy: (item: ShopItem) => Promise<boolean>;
}) {
  const [pop, setPop] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleBuy() {
    if (busy) return;

    try {
      const audio = new Audio("/assets/sound/Purchase.mp3");
      const raw = localStorage.getItem("game-user");
      const user = raw ? JSON.parse(raw) : null;
      const sfxVolume = Number(user?.sfx_volume ?? 80);
      if (sfxVolume > 0) {
        audio.volume = Math.max(0, Math.min(100, sfxVolume)) / 100;
        audio.play().catch(() => { });
      }
    } catch { }

    setBusy(true);
    const success = await onBuy(item);
    setBusy(false);
    if (success) {
      setPop(true);
      setTimeout(() => setPop(false), 400);
    }
  }

  return (
    <div className={`${styles.itemCard} ${styles[`rarity_${item.rarity}`]} ${pop ? styles.popAnim : ""}`}>
      <div className={styles.rarityRibbon} style={{ background: RARITY_COLORS[item.rarity] }}>
        {RARITY_LABEL[item.rarity]}
      </div>
      {item.tag && (
        <div className={styles.tagBadge} style={{ background: item.tagColor }}>{item.tag}</div>
      )}
      <div className={styles.itemEmoji}>{item.emoji}</div>
      <div className={styles.itemName}>{item.name}</div>
      <div className={styles.itemDesc}>{item.desc}</div>
      <div className={styles.itemFooter}>
        <div className={styles.itemPrice}>
          {item.price === 0 ? (
            <span className={styles.freeLabel}>GRATIS!</span>
          ) : (
            <><Coins size={14} className={styles.coinIcon} /><span>{item.price}</span></>
          )}
        </div>
        <button
          className={styles.buyBtn}
          onClick={handleBuy}
          disabled={busy}
          data-no-click-sound="true"
        >
          {busy ? <span className={styles.buySpinner} /> :
            <><ShoppingCart size={14} /> BELI</>}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function ShopPage() {
  const [mounted, setMounted] = useState(false);
  const { fullscreen, toggle: toggleFullscreen } = useFullscreen();

  const [items, setItems] = useState<ShopItem[]>([]);
  const [coins, setCoins] = useState<number | null>(null); // null = still loading
  const [ownedItemIds, setOwnedItemIds] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | ShopItem["rarity"]>("all");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current user safely
  function getUser() {
    try {
      const raw = localStorage.getItem("game-user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  // ── Fetch items from DB ──
  async function fetchItems() {
    const { data, error } = await supabase.from("shop_items").select("*").order("price");
    if (error) { console.error("[shop] fetchItems error:", error); return; }
    if (!data) return;
    setItems(data.map(row => ({
      id: Number(row.id),
      emoji: row.emoji ?? "🎁",
      name: row.item_name ?? row.name ?? "",
      desc: row.description ?? "",
      price: Number(row.price) || 0,
      rarity: row.rarity ?? "common",
      tag: row.tag ?? undefined,
      tagColor: row.tag_color ?? undefined,
    })));
  }

  // ── Fetch coins from DB (source of truth) ──
  async function fetchCoins() {
    const user = getUser();
    if (!user?.id) { setCoins(0); return; }
    const { data, error } = await supabase
      .from("users")
      .select("points")
      .eq("id", user.id)
      .single();
    if (error) {
      console.error("[shop] fetchCoins error:", error);
      setCoins(0);
      return;
    }
    const pts = Number(data?.points) || 0;
    setCoins(pts);
    // Keep localStorage in sync so home page shows correct value
    try {
      const raw = localStorage.getItem("game-user");
      if (raw) {
        const u = JSON.parse(raw);
        u.points = pts;
        localStorage.setItem("game-user", JSON.stringify(u));
      }
    } catch { }
  }

  // ── Fetch owned items ──
  async function fetchInventory() {
    const user = getUser();
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("user_inventory")
      .select("item_id")
      .eq("user_id", user.id);
    if (error) {
      console.error("[shop] fetchInventory error:", error);
      return;
    }
    if (data) setOwnedItemIds(new Set(data.map(r => Number(r.item_id))));
  }

  useEffect(() => {
    setMounted(true);
    fetchItems();
    fetchCoins();
    fetchInventory();
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  // ── Buy handler — returns true on success ──
  async function handleBuy(item: ShopItem): Promise<boolean> {
    const user = getUser();
    if (!user?.id) {
      showToast("❌ Kamu belum login!", "err");
      return false;
    }

    // Re-fetch coins from DB to make sure we have the real value
    const { data: freshUser, error: fetchErr } = await supabase
      .from("users")
      .select("points")
      .eq("id", user.id)
      .single();

    if (fetchErr || !freshUser) {
      showToast("❌ Gagal cek saldo koin!", "err");
      return false;
    }

    const currentCoins = Number(freshUser.points) || 0;

    // Check if enough coins
    if (item.price > 0 && currentCoins < item.price) {
      showToast(`❌ Koin tidak cukup! (punya ${currentCoins}, butuh ${item.price})`, "err");
      setCoins(currentCoins); // sync display
      return false;
    }



    const newCoins = item.price === 0 ? currentCoins + 100 : currentCoins - item.price;

    // 1. Update coins in DB
    const { error: updateErr } = await supabase
      .from("users")
      .update({ points: newCoins })
      .eq("id", user.id);

    if (updateErr) {
      console.error("[shop] update coins error:", updateErr);
      showToast("❌ Gagal update koin: " + updateErr.message, "err");
      return false;
    }

    // 2. Insert inventory (only if it's a real item, price >= 0 and not coin refill)
    if (item.price > 0 || item.name !== "Kantong Koin +100") {
      const { error: invErr } = await supabase
        .from("user_inventory")
        .insert({ user_id: user.id, item_id: item.id });

      if (invErr) {
        console.error("[shop] insert inventory error:", invErr);
        // Rollback coins
        await supabase.from("users").update({ points: currentCoins }).eq("id", user.id);
        showToast("❌ Gagal simpan inventory: " + invErr.message, "err");
        return false;
      }

      setOwnedItemIds(prev => new Set([...prev, item.id]));
    }

    // 3. Update local state & localStorage
    setCoins(newCoins);
    try {
      const raw = localStorage.getItem("game-user");
      if (raw) {
        const u = JSON.parse(raw);
        u.points = newCoins;
        localStorage.setItem("game-user", JSON.stringify(u));
      }
    } catch { }

    showToast(
      item.price === 0
        ? "💰 +100 koin berhasil ditambahkan!"
        : `✅ ${item.name} berhasil dibeli!`,
      "ok"
    );
    return true;
  }

  const filtered = filter === "all" ? items : items.filter(i => i.rarity === filter);

  const floats = [
    { emoji: "🪙", top: "6%", left: "4%", delay: "0s", dur: "5s" },
    { emoji: "⭐", top: "10%", left: "88%", delay: "1.2s", dur: "6s" },
    { emoji: "🎁", top: "30%", left: "2%", delay: "2s", dur: "4s" },
    { emoji: "💎", top: "20%", left: "92%", delay: "0.5s", dur: "7s" },
    { emoji: "🌟", top: "5%", left: "45%", delay: "3s", dur: "5s" },
    { emoji: "🏅", top: "45%", left: "96%", delay: "1.8s", dur: "6s" },
  ];

  return (
    <div className={styles.shopRoot}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.decorDots} />
      <div className={styles.sun} />

      <CloudShape style={{ top: "3%", left: "5%", width: "160px" }} />
      <CloudShape style={{ top: "7%", left: "32%", width: "130px", opacity: 0.6 }} />
      <CloudShape style={{ top: "2%", right: "18%", width: "150px" }} />
      <CloudShape style={{ top: "16%", right: "2%", width: "110px", opacity: 0.5 }} />

      {mounted && floats.map((f, i) => (
        <FloatingItem key={i} emoji={f.emoji}
          style={{ top: f.top, left: f.left, "--delay": f.delay, "--dur": f.dur } as React.CSSProperties} />
      ))}

      {/* ── Header ── */}
      <header className={`${styles.header} ${styles.animFade}`}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={16} /> KEMBALI
        </Link>

        <div className={styles.shopTitle}>
          <ShoppingCart size={22} />
          <span>TOKO</span>
          <Sparkles size={18} />
        </div>

        <div className={styles.walletChip}>
          <Coins size={15} className={styles.walletIcon} />
          <span className={styles.walletAmount}>
            {coins === null ? "..." : coins}
          </span>
        </div>

        <button type="button" className={styles.fsBtn} onClick={toggleFullscreen}>
          {fullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </header>

      {/* ── Promo banner ── */}
      <div className={`${styles.promoBanner} ${styles.anim1}`}>
        <Crown size={16} />
        <span>Belanja &amp; Jadi Pahlawan Integritas! Koin kamu:</span>
        <span className={styles.promoCoin}>
          <Coins size={13} /> {coins ?? "..."}
        </span>
        <Zap size={16} />
      </div>

      {/* ── Filter ── */}
      <div className={`${styles.filterRow} ${styles.anim2}`}>
        {(["all", "common", "rare", "epic", "legendary"] as const).map(f => (
          <button key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
            style={filter === f && f !== "all"
              ? { borderColor: RARITY_COLORS[f as ShopItem["rarity"]], color: RARITY_COLORS[f as ShopItem["rarity"]] }
              : {}}
            onClick={() => setFilter(f)}>
            {f === "all" ? "🛒 Semua" :
              f === "common" ? "⚪ Biasa" :
                f === "rare" ? "🔵 Langka" :
                  f === "epic" ? "🟣 Epik" : "🌟 Legendaris"}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      <div className={`${styles.itemGrid} ${styles.anim3}`}>
        {items.length === 0 ? (
          <div className={styles.loadingItems}>⏳ Memuat item...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.loadingItems}>🔍 Tidak ada item kategori ini</div>
        ) : filtered.map((item, i) => (
          <div key={item.id} style={{ animationDelay: `${0.4 + i * 0.07}s` }} className={styles.cardWrapper}>
            <ItemCard
              item={item}
              isOwned={ownedItemIds.has(item.id)}
              onBuy={handleBuy}
            />
          </div>
        ))}
      </div>

      {/* ── Tip strip ── */}
      <div className={`${styles.tipStrip} ${styles.anim4}`}>
        <Shield size={14} />
        <span>💡 Tips: Mainkan dengan jujur untuk mendapatkan lebih banyak koin!</span>
        <Star size={12} fill="#FFD93D" color="#FFD93D" />
      </div>

      <div className={styles.grass} />

      {/* ── Toast ── */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "err" ? styles.toastErr : ""}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}