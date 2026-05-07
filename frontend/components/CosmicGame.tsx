"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────
interface Vec2 { x: number; y: number }
interface Entity { pos: Vec2; vel: Vec2; r: number; life: number }
interface Bullet extends Entity { color: string }
interface Enemy extends Entity { maxLife: number; type: "asteroid" | "ship" | "boss"; rotation: number; rotSpeed: number }
interface Particle extends Entity { color: string; size: number; alpha: number }
interface Star { x: number; y: number; z: number; pz: number }

interface GameState {
  phase: "menu" | "playing" | "gameover";
  score: number;
  highScore: number;
  lives: number;
  level: number;
  combo: number;
  comboTimer: number;
}

// ─── Constants ────────────────────────────────────────────────────
const W = 480, H = 700;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 12;
const FIRE_RATE = 8;

export default function CosmicGame({ onGameOver }: { onGameOver: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>({
    phase: "menu", score: 0, highScore: 0, lives: 3, level: 1, combo: 1, comboTimer: 0,
  });
  const [displayState, setDisplayState] = useState(stateRef.current);
  const animRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef<Vec2>({ x: W / 2, y: H - 100 });
  const touchRef = useRef<Vec2 | null>(null);

  // Game entities
  const playerRef = useRef({ pos: { x: W / 2, y: H - 100 }, angle: -Math.PI / 2 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef(0);
  const fireTimerRef = useRef(0);
  const isFiringRef = useRef(false);
  const scorePopupsRef = useRef<{ x: number; y: number; val: number; alpha: number; vy: number }[]>([]);

  // Audio context
  const audioRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: "shoot" | "explode" | "hit" | "powerup") => {
    if (typeof window === "undefined") return;
    if (!audioRef.current) {
      try { audioRef.current = new AudioContext(); } catch { return; }
    }
    const ctx = audioRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    switch (type) {
      case "shoot":
        osc.type = "square";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
        break;
      case "explode":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
        break;
      case "hit":
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
        break;
      case "powerup":
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
        break;
    }
  }, []);

  const initStars = useCallback(() => {
    starsRef.current = Array.from({ length: 200 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      z: Math.random() * W, pz: 0,
    }));
  }, []);

  const spawnParticles = useCallback((x: number, y: number, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particlesRef.current.push({
        pos: { x, y },
        vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        r: Math.random() * 4 + 1,
        life: 1,
        color,
        size: Math.random() * 3 + 1,
        alpha: 1,
      });
    }
  }, []);

  const spawnEnemy = useCallback(() => {
    const gs = stateRef.current;
    const level = gs.level;
    const rand = Math.random();
    const isBoss = level % 5 === 0 && frameRef.current % (60 * 30) < 5;

    let type: Enemy["type"] = "asteroid";
    if (isBoss) type = "boss";
    else if (rand > 0.7 + level * 0.02) type = "ship";

    const x = Math.random() * (W - 40) + 20;
    const life = type === "boss" ? 20 : type === "ship" ? 3 : 2;
    const speed = 0.8 + level * 0.3 + Math.random() * 1.5;

    enemiesRef.current.push({
      pos: { x, y: -30 },
      vel: { x: type === "ship" ? (Math.random() - 0.5) * 2 : 0, y: speed },
      r: type === "boss" ? 35 : type === "ship" ? 18 : 20 + Math.random() * 15,
      life, maxLife: life,
      type, rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
    });
  }, []);

  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Engine glow
    const glowAlpha = 0.6 + Math.sin(frame * 0.2) * 0.4;
    const gradient = ctx.createRadialGradient(0, 20, 2, 0, 20, 20);
    gradient.addColorStop(0, `rgba(0,200,255,${glowAlpha})`);
    gradient.addColorStop(1, "rgba(0,200,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(0, 20, 20, 0, Math.PI * 2); ctx.fill();

    // Thruster flame
    ctx.fillStyle = `rgba(255,${100 + Math.sin(frame * 0.3) * 50},0,0.9)`;
    ctx.beginPath();
    ctx.moveTo(-6, 18); ctx.lineTo(6, 18);
    ctx.lineTo(0, 30 + Math.random() * 8); ctx.closePath(); ctx.fill();

    // Ship body
    ctx.fillStyle = "#00cfff";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(14, 14);
    ctx.lineTo(7, 8);
    ctx.lineTo(0, 12);
    ctx.lineTo(-7, 8);
    ctx.lineTo(-14, 14);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Cockpit
    ctx.fillStyle = "rgba(0,255,200,0.8)";
    ctx.beginPath(); ctx.ellipse(0, -2, 5, 9, 0, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }, []);

  const drawEnemy = useCallback((ctx: CanvasRenderingContext2D, e: Enemy) => {
    ctx.save();
    ctx.translate(e.pos.x, e.pos.y);
    ctx.rotate(e.rotation);

    const healthPct = e.life / e.maxLife;
    if (e.type === "asteroid") {
      ctx.fillStyle = `hsl(${20 + healthPct * 20},60%,${25 + healthPct * 15}%)`;
      ctx.strokeStyle = "#ff6b35";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const pts = 8;
      for (let i = 0; i < pts; i++) {
        const a = (i / pts) * Math.PI * 2;
        const jitter = e.r * (0.8 + Math.sin(i * 2.3) * 0.2);
        const px = Math.cos(a) * jitter;
        const py = Math.sin(a) * jitter;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Crater details
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath(); ctx.arc(-e.r * 0.3, -e.r * 0.2, e.r * 0.2, 0, Math.PI * 2); ctx.fill();
    } else if (e.type === "ship") {
      ctx.fillStyle = `hsl(0,${60 + healthPct * 20}%,${35 + healthPct * 10}%)`;
      ctx.strokeStyle = "#ff2244";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 18); ctx.lineTo(12, -10); ctx.lineTo(0, -6); ctx.lineTo(-12, -10); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ff8800";
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    } else {
      // Boss
      const pulse = 0.95 + Math.sin(Date.now() * 0.005) * 0.05;
      ctx.scale(pulse, pulse);
      ctx.fillStyle = `hsl(280,80%,${25 + healthPct * 15}%)`;
      ctx.strokeStyle = "#cc44ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const r = i % 2 === 0 ? e.r : e.r * 0.6;
        const px = Math.cos(a) * r; const py = Math.sin(a) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(200,100,255,0.6)";
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    }

    // Health bar
    if (e.maxLife > 1) {
      ctx.rotate(-e.rotation);
      const bw = e.r * 2, bh = 4;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(-bw / 2, e.r + 6, bw, bh);
      ctx.fillStyle = healthPct > 0.5 ? "#44ff88" : healthPct > 0.25 ? "#ffaa00" : "#ff3344";
      ctx.fillRect(-bw / 2, e.r + 6, bw * healthPct, bh);
    }

    ctx.restore();
  }, []);

  const startGame = useCallback(() => {
    stateRef.current = { phase: "playing", score: 0, highScore: stateRef.current.highScore, lives: 3, level: 1, combo: 1, comboTimer: 0 };
    playerRef.current = { pos: { x: W / 2, y: H - 100 }, angle: -Math.PI / 2 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    scorePopupsRef.current = [];
    frameRef.current = 0;
    fireTimerRef.current = 0;
    setDisplayState({ ...stateRef.current });
  }, []);

  const endGame = useCallback(() => {
    const gs = stateRef.current;
    if (gs.score > gs.highScore) gs.highScore = gs.score;
    gs.phase = "gameover";
    setDisplayState({ ...gs });
    onGameOver(gs.score);
  }, [onGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    initStars();

    const loop = () => {
      const gs = stateRef.current;
      frameRef.current++;

      // ── Draw background ──
      ctx.fillStyle = "#040615";
      ctx.fillRect(0, 0, W, H);

      // Starfield warp
      const stars = starsRef.current;
      ctx.fillStyle = "#ffffff";
      for (const s of stars) {
        s.pz = s.z;
        s.z -= 3 + gs.level * 0.3;
        if (s.z <= 0) { s.z = W; s.x = Math.random() * W; s.y = Math.random() * H; s.pz = s.z; }
        const sx = (s.x - W / 2) * (W / s.z) + W / 2;
        const sy = (s.y - H / 2) * (W / s.z) + H / 2;
        const px = (s.x - W / 2) * (W / s.pz) + W / 2;
        const py = (s.y - H / 2) * (W / s.pz) + H / 2;
        const size = (1 - s.z / W) * 3;
        ctx.strokeStyle = `rgba(255,255,255,${size / 3})`;
        ctx.lineWidth = size;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
      }

      if (gs.phase === "menu") {
        // Menu screen
        ctx.save();
        ctx.fillStyle = "#00cfff";
        ctx.font = "bold 48px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.shadowBlur = 20; ctx.shadowColor = "#00cfff";
        ctx.fillText("COSMIC", W / 2, H / 2 - 60);
        ctx.fillText("SHOOTER", W / 2, H / 2 - 10);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px 'Courier New', monospace";
        ctx.fillText("Click / Tap to Start", W / 2, H / 2 + 50);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "13px 'Courier New', monospace";
        ctx.fillText("Mouse / Touch to Move • Auto-Fire", W / 2, H / 2 + 80);
        if (gs.highScore > 0) {
          ctx.fillStyle = "#ffd700";
          ctx.font = "14px 'Courier New', monospace";
          ctx.fillText(`Best: ${gs.highScore.toLocaleString()}`, W / 2, H / 2 + 110);
        }
        ctx.restore();
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      if (gs.phase === "gameover") {
        ctx.save();
        ctx.fillStyle = "#ff3355";
        ctx.font = "bold 40px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.shadowBlur = 20; ctx.shadowColor = "#ff3355";
        ctx.fillText("GAME OVER", W / 2, H / 2 - 60);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "22px 'Courier New', monospace";
        ctx.fillText(`Score: ${gs.score.toLocaleString()}`, W / 2, H / 2 - 10);
        if (gs.score === gs.highScore && gs.score > 0) {
          ctx.fillStyle = "#ffd700";
          ctx.font = "16px 'Courier New', monospace";
          ctx.fillText("★ NEW HIGH SCORE! ★", W / 2, H / 2 + 25);
        }
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "14px 'Courier New', monospace";
        ctx.fillText("Check panel below to submit score", W / 2, H / 2 + 60);
        ctx.fillStyle = "#00cfff";
        ctx.font = "14px 'Courier New', monospace";
        ctx.fillText("Click to Play Again", W / 2, H / 2 + 95);
        ctx.restore();
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      // ── PLAYING ──

      // Spawn enemies
      const spawnRate = Math.max(20, 80 - gs.level * 6);
      if (frameRef.current % spawnRate === 0) spawnEnemy();

      // Level up
      const newLevel = Math.floor(gs.score / 500) + 1;
      if (newLevel > gs.level) { gs.level = newLevel; }

      // Player movement
      const player = playerRef.current;
      const target = touchRef.current || mouseRef.current;
      const dx = target.x - player.pos.x;
      const dy = target.y - player.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        player.pos.x += (dx / dist) * Math.min(dist, PLAYER_SPEED);
        player.pos.y += (dy / dist) * Math.min(dist, PLAYER_SPEED);
      }
      player.pos.x = Math.max(20, Math.min(W - 20, player.pos.x));
      player.pos.y = Math.max(20, Math.min(H - 20, player.pos.y));

      // Auto-fire
      fireTimerRef.current++;
      if (fireTimerRef.current >= FIRE_RATE) {
        fireTimerRef.current = 0;
        const spread = gs.level >= 3 ? [-0.15, 0, 0.15] : [0];
        for (const angle of spread) {
          bulletsRef.current.push({
            pos: { x: player.pos.x, y: player.pos.y - 20 },
            vel: { x: Math.sin(angle) * BULLET_SPEED, y: -Math.cos(angle) * BULLET_SPEED },
            r: 4, life: 1,
            color: gs.level >= 5 ? "#ff88ff" : gs.level >= 3 ? "#00ffaa" : "#00cfff",
          });
        }
        if (frameRef.current % 2 === 0) playSound("shoot");
      }

      // Update bullets
      bulletsRef.current = bulletsRef.current.filter(b => {
        b.pos.x += b.vel.x; b.pos.y += b.vel.y;
        return b.pos.y > -20 && b.pos.y < H + 20 && b.pos.x > -20 && b.pos.x < W + 20;
      });

      // Update enemies
      enemiesRef.current = enemiesRef.current.filter(e => {
        e.pos.x += e.vel.x; e.pos.y += e.vel.y;
        e.rotation += e.rotSpeed;
        // Ship sinusoidal movement
        if (e.type === "ship") e.vel.x = Math.sin(frameRef.current * 0.05) * 2;
        // Boss shoots back
        if (e.type === "boss" && frameRef.current % 60 === 0) {
          const bdx = player.pos.x - e.pos.x;
          const bdy = player.pos.y - e.pos.y;
          const bd = Math.sqrt(bdx * bdx + bdy * bdy);
          // Enemy bullet stored with negative life as marker
          particlesRef.current.push({
            pos: { x: e.pos.x, y: e.pos.y },
            vel: { x: (bdx / bd) * 4, y: (bdy / bd) * 4 },
            r: 6, life: 2, color: "#ff4400", size: 6, alpha: 1,
          });
        }
        if (e.pos.y > H + 50) { if (e.type !== "asteroid") { gs.lives--; if (gs.lives <= 0) endGame(); } return false; }
        return e.life > 0;
      });

      // Collision: bullets vs enemies
      for (let bi = bulletsRef.current.length - 1; bi >= 0; bi--) {
        const b = bulletsRef.current[bi];
        for (let ei = enemiesRef.current.length - 1; ei >= 0; ei--) {
          const e = enemiesRef.current[ei];
          const dx = b.pos.x - e.pos.x, dy = b.pos.y - e.pos.y;
          if (dx * dx + dy * dy < (b.r + e.r) ** 2) {
            e.life--;
            bulletsRef.current.splice(bi, 1);
            spawnParticles(b.pos.x, b.pos.y, 4, b.color);
            if (e.life <= 0) {
              const pts = (e.type === "boss" ? 500 : e.type === "ship" ? 150 : 50) * gs.combo;
              gs.score += pts;
              gs.combo = Math.min(gs.combo + 1, 10);
              gs.comboTimer = 120;
              scorePopupsRef.current.push({ x: e.pos.x, y: e.pos.y, val: pts, alpha: 1, vy: -1.5 });
              spawnParticles(e.pos.x, e.pos.y, e.type === "boss" ? 40 : 15,
                e.type === "boss" ? "#cc44ff" : e.type === "ship" ? "#ff4422" : "#ff9944");
              playSound("explode");
              enemiesRef.current.splice(ei, 1);
            } else { playSound("hit"); }
            break;
          }
        }
      }

      // Combo timer
      if (gs.comboTimer > 0) { gs.comboTimer--; } else { gs.combo = 1; }

      // Collision: player vs enemies
      for (const e of enemiesRef.current) {
        const dx = player.pos.x - e.pos.x, dy = player.pos.y - e.pos.y;
        if (dx * dx + dy * dy < (15 + e.r) ** 2) {
          gs.lives--;
          spawnParticles(player.pos.x, player.pos.y, 20, "#00cfff");
          playSound("hit");
          e.life = 0;
          if (gs.lives <= 0) { endGame(); break; }
          player.pos = { x: W / 2, y: H - 100 };
        }
      }

      // Update & draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.pos.x += p.vel.x; p.pos.y += p.vel.y;
        p.vel.y += 0.05;
        p.life -= 0.025;
        p.alpha = p.life;
        if (p.life <= 0) return false;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.pos.x, p.pos.y, p.r * p.life, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        return true;
      });

      // Draw bullets
      for (const b of bulletsRef.current) {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 10; ctx.shadowColor = b.color;
        ctx.beginPath(); ctx.arc(b.pos.x, b.pos.y, b.r, 0, Math.PI * 2); ctx.fill();
        // Bullet trail
        ctx.strokeStyle = b.color;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.pos.x, b.pos.y);
        ctx.lineTo(b.pos.x - b.vel.x * 3, b.pos.y - b.vel.y * 3);
        ctx.stroke();
        ctx.restore();
      }

      // Draw enemies
      for (const e of enemiesRef.current) drawEnemy(ctx, e);

      // Draw player
      drawPlayer(ctx, player.pos.x, player.pos.y, frameRef.current);

      // Score popups
      scorePopupsRef.current = scorePopupsRef.current.filter(p => {
        p.y += p.vy; p.alpha -= 0.02;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.val > 200 ? "#ffd700" : "#ffffff";
        ctx.font = `bold ${p.val > 200 ? 20 : 14}px 'Courier New', monospace`;
        ctx.textAlign = "center";
        ctx.shadowBlur = 8; ctx.shadowColor = ctx.fillStyle;
        ctx.fillText(`+${p.val}`, p.x, p.y);
        ctx.restore();
        return p.alpha > 0;
      });

      // HUD
      ctx.save();
      ctx.fillStyle = "rgba(0,10,30,0.7)";
      ctx.fillRect(0, 0, W, 50);

      ctx.fillStyle = "#00cfff";
      ctx.font = "bold 20px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.fillText(gs.score.toLocaleString(), 12, 32);

      // Lives
      ctx.textAlign = "right";
      for (let i = 0; i < gs.lives; i++) {
        ctx.fillStyle = "#ff4488";
        ctx.font = "16px sans-serif";
        ctx.fillText("♥", W - 12 - i * 22, 32);
      }

      // Level & combo
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff80";
      ctx.font = "12px 'Courier New', monospace";
      ctx.fillText(`LVL ${gs.level}`, W / 2, 20);
      if (gs.combo > 1) {
        ctx.fillStyle = `hsl(${gs.combo * 20},100%,60%)`;
        ctx.font = `bold 16px 'Courier New', monospace`;
        ctx.shadowBlur = 12; ctx.shadowColor = ctx.fillStyle;
        ctx.fillText(`${gs.combo}x COMBO!`, W / 2, 40);
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      setDisplayState({ ...gs });
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [initStars, spawnEnemy, drawPlayer, drawEnemy, spawnParticles, playSound, endGame]);

  const handleClick = useCallback(() => {
    const gs = stateRef.current;
    if (gs.phase === "menu") startGame();
    else if (gs.phase === "gameover") startGame();
  }, [startGame]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    mouseRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const t = e.touches[0];
    touchRef.current = {
      x: (t.clientX - rect.left) * scaleX,
      y: (t.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleTouchEnd = useCallback(() => { touchRef.current = null; }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouch}
      onTouchStart={(e) => { handleTouch(e); if (stateRef.current.phase !== "playing") handleClick(); }}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: "none", touchAction: "none", userSelect: "none" }}
      className="w-full max-w-sm mx-auto block rounded-xl"
    />
  );
}
