"use client";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { baseMainnet } from "@/lib/wagmi";
import { useState } from "react";

export default function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [showMenu, setShowMenu] = useState(false);

  const isWrongChain = isConnected && chain?.id !== baseMainnet.id;

  if (!isConnected) {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {connectors.slice(0, 3).map((c) => (
          <button
            key={c.id}
            onClick={() => connect({ connector: c })}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "rgba(0,207,255,0.1)",
              border: "1px solid rgba(0,207,255,0.3)",
              color: "#00cfff",
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s",
            }}
          >
            {c.name === "Injected" ? "🦊 MetaMask" : c.name === "MetaMask" ? "🦊 MetaMask" : c.name === "Coinbase Wallet" ? "🔵 Coinbase" : c.name}
          </button>
        ))}
      </div>
    );
  }

  if (isWrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: baseMainnet.id })}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          background: "rgba(255,100,50,0.15)",
          border: "1px solid rgba(255,100,50,0.4)",
          color: "#ff6432",
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ⚠ Switch to Base mainnet
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          background: "rgba(0,255,136,0.1)",
          border: "1px solid rgba(0,255,136,0.3)",
          color: "#00ff88",
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          cursor: "pointer",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", display: "inline-block" }} />
        {address?.slice(0, 6)}…{address?.slice(-4)}
        <span style={{ opacity: 0.6 }}>▾</span>
      </button>
      {showMenu && (
        <div style={{
          position: "absolute",
          top: "110%",
          right: 0,
          background: "#0a0f1e",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: 4,
          zIndex: 100,
          minWidth: 140,
        }}>
          <button
            onClick={() => { disconnect(); setShowMenu(false); }}
            style={{
              display: "block",
              width: "100%",
              padding: "8px 12px",
              background: "none",
              border: "none",
              color: "#ff4466",
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
