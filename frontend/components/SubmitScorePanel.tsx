"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useSubmitScore, usePlayerData } from "@/hooks/useLeaderboard";

interface Props {
  score?: number;
  onSubmitted?: () => void;
}

export default function SubmitScorePanel({ score = 0, onSubmitted = () => { } }: Props) {
  const { address } = useAccount();
  const [nickname, setNickname] = useState("");
  const { submit, isPending, isConfirming, isSuccess, error, hash } = useSubmitScore();
  const playerData = usePlayerData(address);

  useEffect(() => {
    if (playerData?.nickname) setNickname(playerData.nickname);
  }, [playerData]);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(onSubmitted, 2000);
    }
  }, [isSuccess, onSubmitted]);

  if (!address) return null;

  const canSubmit = score > 0;

  if (isSuccess) {
    return (
      <div style={{
        padding: "16px",
        borderRadius: 12,
        background: "rgba(0,255,136,0.1)",
        border: "1px solid rgba(0,255,136,0.3)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 20 }}>✅</div>
        <div style={{ color: "#00ff88", fontFamily: "'Courier New', monospace", fontSize: 13, marginTop: 8 }}>
          Score submitted onchain!
        </div>
        {hash && (
          <a
            href={`https://basescan.org/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#00cfff", fontSize: 11, fontFamily: "'Courier New', monospace", display: "block", marginTop: 6 }}
          >
            View tx ↗
          </a>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: "12px",
      borderRadius: 12,
      background: "rgba(0,207,255,0.08)",
      border: "1px solid rgba(0,207,255,0.3)",
      boxShadow: "0 0 20px rgba(0,207,255,0.1)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: "#ffffff80", fontFamily: "'Courier New', monospace", fontSize: 12 }}>
          YOUR SCORE
        </span>
        <span style={{ color: "#00cfff", fontFamily: "'Courier New', monospace", fontSize: 20, fontWeight: "bold" }}>
          {Number(score).toLocaleString()}
        </span>
      </div>



      {score === 0 && (
        <div style={{ color: "#ffffff40", fontSize: 12, fontFamily: "'Courier New', monospace", marginBottom: 10, textAlign: "center" }}>
          Play a game first!
        </div>
      )}

      {canSubmit && (
        <>
          <input
            type="text"
            placeholder="Enter nickname (max 16 chars)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 16))}
            maxLength={16}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#ffffff",
              fontFamily: "'Courier New', monospace",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 10,
            }}
          />

          <button
            onClick={() => nickname.trim() && submit(score, nickname.trim())}
            disabled={isPending || isConfirming || !nickname.trim()}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 8,
              background: isPending || isConfirming
                ? "rgba(0,207,255,0.2)"
                : "linear-gradient(135deg, #0066ff, #00cfff)",
              border: "none",
              color: "#ffffff",
              fontFamily: "'Courier New', monospace",
              fontSize: 15,
              fontWeight: "bold",
              cursor: isPending || isConfirming || !nickname.trim() ? "not-allowed" : "pointer",
              letterSpacing: 1.5,
              transition: "all 0.2s",
              boxShadow: "0 4px 15px rgba(0,102,255,0.3)",
            }}
          >
            {isPending ? "⏳ XÁC NHẬN TRÊN VÍ…" : isConfirming ? "⛓ ĐANG LƯU VÀO BASE…" : "⬆ GỬI ĐIỂM LÊN BASE"}
          </button>

          {error && (
            <div style={{ color: "#ff4466", fontSize: 11, fontFamily: "'Courier New', monospace", marginTop: 8, textAlign: "center" }}>
              {(error as any).shortMessage || error.message}
            </div>
          )}
        </>
      )}
    </div>
  );
}
