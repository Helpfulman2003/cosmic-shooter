"use client";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useEffect, useState } from "react";

function shortenAddress(addr: string) {
  return addr === "0x0000000000000000000000000000000000000000"
    ? "—"
    : `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const RANK_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32", "#aabbff", "#aabbff"];

export default function Leaderboard({ currentAddress }: { currentAddress?: string }) {
  const { topPlayers, refetch } = useLeaderboard();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refetch().finally(() => setLoading(false));
    const interval = setInterval(() => refetch(), 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  const validPlayers = (topPlayers as any[] || []).filter(
    (p) => p.player !== "0x0000000000000000000000000000000000000000"
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "0 4px 8px 4px",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <span style={{ color: "#ffffff40", fontSize: 10, fontWeight: "bold", letterSpacing: 1 }}>TOP PILOTS</span>
        <span style={{ color: "#ffffff40", fontSize: 10, fontWeight: "bold", letterSpacing: 1 }}>SCORE</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#ffffff40", fontSize: 12 }}>
            LOADING BLOCKCHAIN DATA...
          </div>
        ) : validPlayers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#ffffff20", fontSize: 12 }}>
            NO DATA ONCHAIN YET
          </div>
        ) : (
          validPlayers.map((entry, i) => {
            const isMe = currentAddress && entry.player.toLowerCase() === currentAddress.toLowerCase();
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: isMe ? "rgba(0,207,255,0.12)" : "rgba(255,255,255,0.02)",
                  border: isMe ? "1px solid rgba(0,207,255,0.3)" : "1px solid rgba(255,255,255,0.05)",
                  transition: "transform 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ 
                    color: RANK_COLORS[i] || "#ffffff30",
                    fontWeight: "900",
                    fontSize: 14,
                    width: 20
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ 
                      color: isMe ? "#00cfff" : "#fff", 
                      fontSize: 13, 
                      fontWeight: "bold",
                      letterSpacing: 0.5
                    }}>
                      {entry.nickname || "Anonymous"}
                    </span>
                    <span style={{ color: "#ffffff30", fontSize: 9 }}>
                      {shortenAddress(entry.player)}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ 
                    color: RANK_COLORS[i] || "#00cfff", 
                    fontSize: 15, 
                    fontWeight: "900",
                    fontFamily: "monospace"
                  }}>
                    {Number(entry.score).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && validPlayers.length > 0 && (
        <div style={{ 
          marginTop: 12, 
          textAlign: "center", 
          fontSize: 10, 
          color: "#ffffff20",
          fontStyle: "italic"
        }}>
          Updating live from Base Mainnet
        </div>
      )}
    </div>
  );
}
