"use client";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useEffect, useState } from "react";

function shortenAddress(addr: string) {
  return addr === "0x0000000000000000000000000000000000000000"
    ? "—"
    : `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const RANK_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32", "#aabbff", "#aabbff"];
const RANK_EMOJI = ["🥇", "🥈", "🥉", "4", "5", "6", "7", "8", "9", "10"];

export default function Leaderboard({ currentAddress }: { currentAddress?: string }) {
  const { topPlayers, refetch } = useLeaderboard();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refetch().finally(() => setLoading(false));
    const interval = setInterval(() => refetch(), 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  const validPlayers = (topPlayers as any[]).filter(
    (p) => p.player !== "0x0000000000000000000000000000000000000000"
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ color: "#00cfff", fontFamily: "'Courier New', monospace", fontSize: 14, fontWeight: "bold", letterSpacing: 2 }}>
          ◈ ONCHAIN LEADERBOARD
        </h3>
        <button
          onClick={() => refetch()}
          style={{ color: "#ffffff60", fontSize: 11, fontFamily: "'Courier New', monospace", cursor: "pointer", background: "none", border: "none" }}
        >
          ↻ REFRESH
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#ffffff40", fontFamily: "'Courier New', monospace", fontSize: 12, padding: "20px 0" }}>
          Loading…
        </div>
      ) : validPlayers.length === 0 ? (
        <div style={{ textAlign: "center", color: "#ffffff40", fontFamily: "'Courier New', monospace", fontSize: 12, padding: "20px 0" }}>
          No scores yet. Be the first!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {validPlayers.map((p, i) => {
            const isMe = currentAddress && p.player.toLowerCase() === currentAddress.toLowerCase();
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: isMe ? "rgba(0,207,255,0.12)" : "rgba(255,255,255,0.04)",
                  border: isMe ? "1px solid rgba(0,207,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ width: 20, textAlign: "center", fontSize: 14 }}>
                  {RANK_EMOJI[i]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 13,
                    fontWeight: "bold",
                    color: isMe ? "#00cfff" : RANK_COLORS[i] || "#ffffff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {p.nickname || shortenAddress(p.player)}
                    {isMe && <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.7 }}>YOU</span>}
                  </div>
                  <div style={{ fontSize: 10, color: "#ffffff40", fontFamily: "'Courier New', monospace" }}>
                    {shortenAddress(p.player)}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 15,
                  fontWeight: "bold",
                  color: RANK_COLORS[i] || "#ffffff",
                  textShadow: i === 0 ? "0 0 10px #ffd700" : "none",
                }}>
                  {Number(p.score).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
