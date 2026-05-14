"use client";

import Link from "next/link";
import { ArrowLeft, Coins, Pause, Play, RotateCcw, Shield, Backpack } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./play.module.css";

type DropType = "honest" | "corrupt" | "police";
type Phase = "ready" | "running" | "paused" | "ended" | "inventory";

type InventoryItem = {
  id: number;
  item_name: string;
  emoji: string;
  description: string;
  rarity: string;
  count: number;
  instances: number[];
};

type Drop = {
  id: number;
  type: DropType;
  label: string;
  symbol: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  money: number;
  integrity: number;
};

type DropTemplate = {
  type: DropType;
  label: string;
  symbol: string;
  money: number;
  integrity: number;
};

type GameUser = {
  id: number;
  points?: number;
};

const PLAYER_WIDTH = 86;
const PLAYER_HEIGHT = 72;

const HONEST_ITEMS: DropTemplate[] = [
  { type: "honest", label: "Koin Resmi", symbol: "C", money: 12, integrity: 4 },
  { type: "honest", label: "Dokumen Sah", symbol: "D", money: 18, integrity: 6 },
  { type: "honest", label: "Bukti Pajak", symbol: "P", money: 22, integrity: 7 },
];

const CORRUPT_ITEMS: DropTemplate[] = [
  { type: "corrupt", label: "Amplop Uang", symbol: "A", money: 55, integrity: -9 },
  { type: "corrupt", label: "Emas Gelap", symbol: "G", money: 80, integrity: -13 },
  { type: "corrupt", label: "Koper Suap", symbol: "K", money: 120, integrity: -18 },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function readUser(): GameUser | null {
  try {
    const raw = localStorage.getItem("game-user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function PlayPage() {
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const dropsRef = useRef<Drop[]>([]);
  const keysRef = useRef({ left: false, right: false });
  const lastFrameRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const idRef = useRef(1);
  const savedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("ready");
  const [drops, setDrops] = useState<Drop[]>([]);
  const [playerX, setPlayerX] = useState(50);
  const [money, setMoney] = useState(0);
  const [integrity, setIntegrity] = useState(100);
  const [corruption, setCorruption] = useState(0);
  const [stunnedUntil, setStunnedUntil] = useState(0);
  const [isStunned, setIsStunned] = useState(false);
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shieldUntil, setShieldUntil] = useState(0);
  const [magnetUntil, setMagnetUntil] = useState(0);
  const [boostUntil, setBoostUntil] = useState(0);
  const [hasCrown, setHasCrown] = useState(false);
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [isMagnetActive, setIsMagnetActive] = useState(false);
  const [isBoostActive, setIsBoostActive] = useState(false);

  const [notice, setNotice] = useState("Pilih aman atau cepat kaya. Semua ada konsekuensinya.");
  const [savedStatus, setSavedStatus] = useState("");

  const moneyRef = useRef(money);
  const integrityRef = useRef(integrity);
  const corruptionRef = useRef(corruption);
  const playerXRef = useRef(playerX);
  const phaseRef = useRef(phase);
  const startedAtRef = useRef(0);
  
  const shieldUntilRef = useRef(0);
  const magnetUntilRef = useRef(0);
  const boostUntilRef = useRef(0);
  const hasCrownRef = useRef(false);
  const crownTimerRef = useRef(0);

  useEffect(() => { moneyRef.current = money; }, [money]);
  useEffect(() => { integrityRef.current = integrity; }, [integrity]);
  useEffect(() => { corruptionRef.current = corruption; }, [corruption]);
  useEffect(() => { playerXRef.current = playerX; }, [playerX]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  
  useEffect(() => { shieldUntilRef.current = shieldUntil; }, [shieldUntil]);
  useEffect(() => { magnetUntilRef.current = magnetUntil; }, [magnetUntil]);
  useEffect(() => { boostUntilRef.current = boostUntil; }, [boostUntil]);
  useEffect(() => { hasCrownRef.current = hasCrown; }, [hasCrown]);

  const fetchInventory = useCallback(async () => {
    const user = readUser();
    if (!user) return;
    
    const { data: itemsData } = await supabase.from('shop_items').select('*');
    if (!itemsData) return;
    
    const { data: invData } = await supabase.from('user_inventory').select('*').eq('user_id', user.id);
    if (!invData) return;
    
    const grouped = new Map<number, InventoryItem>();
    let crown = false;
    
    invData.forEach(inv => {
      const itemDef = itemsData.find((i: any) => i.id === inv.item_id);
      if (!itemDef) return;
      if (itemDef.id === 4) {
        crown = true;
        return; // Do not show passive item in inventory list
      }
      
      if (!grouped.has(itemDef.id)) {
        grouped.set(itemDef.id, { 
          id: itemDef.id,
          item_name: itemDef.item_name,
          emoji: itemDef.emoji,
          description: itemDef.description,
          rarity: itemDef.rarity,
          count: 0, 
          instances: [] 
        });
      }
      const group = grouped.get(itemDef.id)!;
      group.count++;
      group.instances.push(inv.id);
    });
    
    setHasCrown(crown);
    setInventory(Array.from(grouped.values()));
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const useItem = useCallback(async (item: InventoryItem) => {
    if (phaseRef.current !== "inventory" && phaseRef.current !== "running") return;
    if (item.count <= 0) return;
    if (item.id === 4) return;
    
    const now = performance.now();
    if (item.id === 1) setShieldUntil(now + 5000);
    else if (item.id === 2) setMagnetUntil(now + 10000);
    else if (item.id === 3) setBoostUntil(now + 8000);
    
    setInventory(prev => prev.map(i => {
      if (i.id === item.id) {
        return { ...i, count: i.count - 1, instances: i.instances.slice(1) };
      }
      return i;
    }).filter(i => i.count > 0));
    
    const instanceId = item.instances[0];
    await supabase.from('user_inventory').delete().eq('id', instanceId);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("integrity-music-settings", {
      detail: { action: "stop" }
    }));
    return () => {
      window.dispatchEvent(new CustomEvent("integrity-music-settings", {
        detail: { action: "play" }
      }));
    };
  }, []);

  const rank = useMemo(() => {
    if (integrity >= 85) return { label: "Badge Kehormatan", shop: "Diskon upgrade besar", tone: "good" };
    if (integrity >= 60) return { label: "Warga Teladan", shop: "Harga shop normal", tone: "ok" };
    if (integrity >= 35) return { label: "Diawasi", shop: "Upgrade lebih mahal", tone: "warn" };
    return { label: "Risiko Tinggi", shop: "Polisi makin sering", tone: "bad" };
  }, [integrity]);

  const saveProgress = useCallback(async () => {
    if (savedRef.current || moneyRef.current <= 0) return;
    savedRef.current = true;

    const user = readUser();
    if (!user?.id) {
      setSavedStatus("Skor sesi belum tersimpan karena belum login.");
      return;
    }

    const { data } = await supabase.from("users").select("points").eq("id", user.id).single();
    const currentPoints = Number(data?.points ?? user.points ?? 0);
    const nextPoints = currentPoints + moneyRef.current;
    const { error } = await supabase.from("users").update({ points: nextPoints }).eq("id", user.id);

    if (error) {
      setSavedStatus("Uang sesi belum tersimpan ke database.");
      savedRef.current = false;
      return;
    }

    localStorage.setItem("game-user", JSON.stringify({ ...user, points: nextPoints }));
    setSavedStatus(`Uang sesi +${moneyRef.current} tersimpan ke saldo toko.`);
  }, []);

  const endGame = useCallback((message: string) => {
    setPhase("ended");
    setNotice(message);
    void saveProgress();
  }, [saveProgress]);

  const resetGame = useCallback(() => {
    dropsRef.current = [];
    savedRef.current = false;
    setDrops([]);
    setPlayerX(50);
    setMoney(0);
    setIntegrity(100);
    setCorruption(0);
    setStunnedUntil(0);
    setIsStunned(false);
    setNotice("Pilih aman atau cepat kaya. Semua ada konsekuensinya.");
    setSavedStatus("");
    setPhase("ready");
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    startedAtRef.current = performance.now();
    lastFrameRef.current = performance.now();
    spawnTimerRef.current = 0;
    setPhase("running");
  }, [resetGame]);

  const spawnDrop = useCallback((width: number, now: number) => {
    const lowIntegrityPressure = Math.max(0, (80 - integrityRef.current) / 80);
    let policeChance = 0;
    if (integrityRef.current < 80) {
      policeChance = clamp(0.05 + corruptionRef.current * 0.015 + lowIntegrityPressure * 0.45, 0.05, 0.6);
    }
    const roll = Math.random();
    const difficultySpeed = 165 + lowIntegrityPressure * 120 + (now - startedAtRef.current) / 800;

    let dropBase: DropTemplate;

    if (roll < policeChance) {
      dropBase = { type: "police", label: "Polisi", symbol: "!", money: -45, integrity: -6 };
    } else {
      // Stabilize honest vs corrupt item spawn rates
      const itemRoll = Math.random();
      if (itemRoll < 0.35) {
        dropBase = CORRUPT_ITEMS[Math.floor(Math.random() * CORRUPT_ITEMS.length)];
      } else {
        dropBase = HONEST_ITEMS[Math.floor(Math.random() * HONEST_ITEMS.length)];
      }
    }

    const size = dropBase.type === "police" ? 54 : 46;
    dropsRef.current.push({
      id: idRef.current++,
      ...dropBase,
      x: Math.random() * Math.max(1, width - size),
      y: -size,
      size,
      speed: difficultySpeed + Math.random() * 95,
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keysRef.current.left = true;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keysRef.current.right = true;
      if (event.key === " " && phaseRef.current === "running") setPhase("paused");
      else if (event.key === " " && phaseRef.current === "paused") setPhase("running");
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keysRef.current.left = false;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keysRef.current.right = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let raf = 0;

    function loop(now: number) {
      const arena = arenaRef.current;
      if (!arena || phaseRef.current !== "running") {
        lastFrameRef.current = now;
        raf = requestAnimationFrame(loop);
        return;
      }

      const rect = arena.getBoundingClientRect();
      const dt = Math.min(32, now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;
      
      if (hasCrownRef.current) {
        crownTimerRef.current -= dt * 1000;
        if (crownTimerRef.current <= 0) {
          setIntegrity(v => clamp(v + 1, 0, 100));
          crownTimerRef.current = 1000;
        }
      }

      const stunned = now < stunnedUntil;
      setIsStunned(stunned);
      
      const isShieldActive = now < shieldUntilRef.current;
      const isMagnetActive = now < magnetUntilRef.current;
      const isBoostActive = now < boostUntilRef.current;
      setIsShieldActive(isShieldActive);
      setIsMagnetActive(isMagnetActive);
      setIsBoostActive(isBoostActive);
      
      const moveSpeed = stunned ? 0 : 410;
      const direction = Number(keysRef.current.right) - Number(keysRef.current.left);
      const nextPlayerX = clamp(playerXRef.current + direction * moveSpeed * dt, 0, rect.width - PLAYER_WIDTH);
      playerXRef.current = nextPlayerX;
      setPlayerX(nextPlayerX);

      spawnTimerRef.current -= dt * 1000;
      const spawnDelay = clamp(820 - corruptionRef.current * 18 - (100 - integrityRef.current) * 4, 280, 820);
      if (spawnTimerRef.current <= 0) {
        spawnDrop(rect.width, now);
        spawnTimerRef.current = spawnDelay;
      }

      const playerBox = {
        left: nextPlayerX,
        right: nextPlayerX + PLAYER_WIDTH,
        top: rect.height - PLAYER_HEIGHT - 18,
        bottom: rect.height - 18,
      };

      const nextDrops: Drop[] = [];

      for (const drop of dropsRef.current) {
        let movedX = drop.x;
        let movedY = drop.y + drop.speed * dt;
        
        if (isMagnetActive && drop.type === "honest") {
          const dx = playerBox.left + PLAYER_WIDTH/2 - (drop.x + drop.size/2);
          const dy = playerBox.top + PLAYER_HEIGHT/2 - (drop.y + drop.size/2);
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist > 0 && dist < 450) {
            movedX += (dx / dist) * 220 * dt;
            movedY += (dy / dist) * 220 * dt;
          }
        }

        const moved = { ...drop, x: movedX, y: movedY };
        const dropBox = {
          left: moved.x,
          right: moved.x + moved.size,
          top: moved.y,
          bottom: moved.y + moved.size,
        };

        const hit = dropBox.right > playerBox.left &&
          dropBox.left < playerBox.right &&
          dropBox.bottom > playerBox.top &&
          dropBox.top < playerBox.bottom;

        if (hit) {
          if (moved.type === "honest") {
            const val = isBoostActive ? moved.money * 2 : moved.money;
            setMoney((value) => value + val);
            setIntegrity((value) => clamp(value + moved.integrity, 0, 100));
            setNotice(`${moved.label}: uang kecil, integritas naik.`);
          } else if (moved.type === "corrupt") {
            if (isShieldActive) {
              setNotice("Dilindungi oleh Perisai! Efek korupsi diabaikan.");
              setShieldUntil(0);
            } else {
              const val = isBoostActive ? moved.money * 2 : moved.money;
              setMoney((value) => value + val);
              setIntegrity((value) => clamp(value + moved.integrity, 0, 100));
              setCorruption((value) => value + 1);
              setNotice(`${moved.label}: uang besar, tapi polisi makin waspada.`);
            }
          } else {
            if (isShieldActive) {
              setNotice("Dilindungi oleh Perisai dari Polisi!");
              setShieldUntil(0);
            } else {
              setMoney((value) => Math.max(0, value - Math.max(35, Math.floor(value * 0.25))));
              setIntegrity((value) => clamp(value + moved.integrity, 0, 100));
              setStunnedUntil(now + 1400);
              setIsStunned(true);
              setNotice("Kena polisi. Uang berkurang dan kamu terkena stun.");
            }
          }
          continue;
        }

        if (moved.y < rect.height + 80) nextDrops.push(moved);
      }

      dropsRef.current = nextDrops;
      setDrops(nextDrops);
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [endGame, spawnDrop, stunnedUntil]);

  return (
    <main className={styles.page}>
      <section
        ref={arenaRef}
        className={styles.arena}
      >
        <div className={styles.skyline} />

        <button className={styles.inventoryToggle} onClick={() => {
            if (phase === "running") setPhase("inventory");
            else if (phase === "inventory") setPhase("running");
        }}>
          <Backpack size={20} color="#2f3270" />
        </button>

        <header className={styles.topHud}>
          <div className={styles.statPill}>
            <Coins size={16} />
            {money}
          </div>
          <button
            className={styles.iconButton}
            onClick={() => setPhase((value) => value === "running" ? "paused" : value === "paused" ? "running" : value)}
            type="button"
          >
            {phase === "paused" ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </header>

        <aside className={styles.legend}>
          <div className={styles.legendTitle}>Panduan Item</div>
          <div className={styles.legendCard}>
            <span className={`${styles.legendMark} ${styles.honest}`}>C</span>
            <div>
              <strong>Item Jujur</strong>
              <p>Koin, dokumen, pajak. Uang sedikit, integritas naik.</p>
            </div>
          </div>
          <div className={styles.legendCard}>
            <span className={`${styles.legendMark} ${styles.corrupt}`}>A</span>
            <div>
              <strong>Item Korupsi</strong>
              <p>Amplop, emas, koper. Uang besar, integritas turun.</p>
            </div>
          </div>
          <div className={styles.legendCard}>
            <span className={`${styles.legendMark} ${styles.police}`}>!</span>
            <div>
              <strong>Polisi</strong>
              <p>Muncul lebih sering saat integritas rendah.</p>
            </div>
          </div>
        </aside>

        <div className={styles.integrityPanel}>
          <div className={styles.integrityHeader}>
            <Shield size={16} />
            Integritas
            <span>{integrity}%</span>
          </div>
          <div className={styles.integrityTrack}>
            <div
              className={`${styles.integrityFill} ${styles[rank.tone]}`}
              style={{ width: `${integrity}%` }}
            />
          </div>
          <div className={styles.rankText}>{rank.label} - {rank.shop}</div>
        </div>

        <div className={styles.notice}>{notice}</div>

        {drops.map((drop) => (
          <div
            key={drop.id}
            className={`${styles.drop} ${styles[drop.type]}`}
            style={{
              width: drop.size,
              height: drop.size,
              transform: `translate(${drop.x}px, ${drop.y}px)`,
            }}
            title={drop.label}
          >
            {drop.symbol}
          </div>
        ))}

        <div
          className={`${styles.player} ${isStunned ? styles.stunned : ""} ${isShieldActive ? styles.playerHasShield : ""} ${isMagnetActive ? styles.playerHasMagnet : ""} ${isBoostActive ? styles.playerHasBoost : ""}`}
          style={{ transform: `translateX(${playerX}px)` }}
        >
          {hasCrown && <div className={styles.crownEmoji}>👑</div>}
          <div className={styles.playerHead} />
          <div className={styles.playerBody}>YOU</div>
        </div>

        <div className={styles.touchControls}>
          <button
            type="button"
            onPointerDown={() => { keysRef.current.left = true; }}
            onPointerUp={() => { keysRef.current.left = false; }}
            onPointerLeave={() => { keysRef.current.left = false; }}
          >
            KIRI
          </button>
          <button
            type="button"
            onPointerDown={() => { keysRef.current.right = true; }}
            onPointerUp={() => { keysRef.current.right = false; }}
            onPointerLeave={() => { keysRef.current.right = false; }}
          >
            KANAN
          </button>
        </div>

        {phase !== "running" && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              {phase === "inventory" ? (
                <>
                  <div className={styles.inventoryTitle}>Inventory</div>
                  <div style={{ maxHeight: "45vh", overflowY: "auto", margin: "14px 0", display: "flex", flexDirection: "column", gap: 8 }}>
                    {inventory.length === 0 ? (
                      <div style={{ textAlign: "center", fontSize: 13, color: "#667085" }}>Kosong</div>
                    ) : (
                      inventory.map((item) => (
                        <div
                          key={item.id}
                          className={`${styles.inventoryItem} ${item.id === 4 ? styles.passive : ""}`}
                          onClick={() => useItem(item)}
                        >
                          <div className={styles.itemEmoji}>{item.emoji}</div>
                          <div className={styles.itemInfo}>
                            <div className={styles.itemName}>{item.item_name}</div>
                            <div style={{ fontSize: 11, color: "#667085", textAlign: "left" }}>{item.description}</div>
                          </div>
                          {item.id !== 4 && item.count > 0 && (
                            <div className={styles.itemCount}>x{item.count}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" onClick={() => setPhase("running")}>
                      <Play size={17} />
                      LANJUT MAIN
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1>{phase === "ended" ? "Sesi Selesai" : phase === "paused" ? "Pause" : "The Integrity Gauge"}</h1>
                  <p>
                    Tangkap item jatuh. Item jujur aman, item korupsi cepat kaya tapi membuat polisi makin sering datang.
                  </p>
                  {phase === "ended" && (
                    <div className={styles.resultBox}>
                      <span>Total koin: {money}</span>
                      <span>Integritas akhir: {integrity}%</span>
                      {savedStatus && <small>{savedStatus}</small>}
                    </div>
                  )}
                  <div className={styles.modalActions}>
                    <button type="button" onClick={phase === "ended" ? resetGame : startGame}>
                      {phase === "ended" ? <RotateCcw size={17} /> : <Play size={17} />}
                      ULANG
                    </button>
                    {phase === "ended" && (
                      <button type="button" onClick={() => window.location.href = "/"}>
                        <ArrowLeft size={17} />
                        KE MENU
                      </button>
                    )}
                    {phase === "paused" && (
                      <>
                        <button type="button" onClick={() => setPhase("running")}>
                          <Play size={17} />
                          LANJUT
                        </button>
                        <button type="button" onClick={() => endGame("Sesi diakhiri secara manual. Koin masuk ke saldo toko.")}>
                          <Coins size={17} />
                          SIMPAN & AKHIRI
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
