"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAccount } from "wagmi";
import WalletButton from "@/components/WalletButton";
import Leaderboard from "@/components/Leaderboard";
import SubmitScorePanel from "@/components/SubmitScorePanel";

const CosmicGame = dynamic(() => import("@/components/CosmicGame"), { ssr: false });

export default function Home() {
    const { address, isConnected } = useAccount();
    const [lastScore, setLastScore] = useState(0);
    const [showSubmit, setShowSubmit] = useState(false);
    const [tab, setTab] = useState<"board" | "submit">("board");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleGameOver = useCallback(
        (score: number) => {
            setLastScore(score);
            setShowSubmit(true);
            if (score > 0 && isConnected) {
                setTab("submit");
                // Tự động cuộn xuống phần nhập điểm sau 500ms
                setTimeout(() => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }, 500);
            }
        },
        [isConnected]
    );

    const handleSubmitted = useCallback(() => {
        setTab("board");
    }, []);

    if (!mounted) {
        return (
            <main
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(160deg, #020510 0%, #040a1a 50%, #06051a 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "16px",
                    fontFamily: "'Courier New', monospace",
                }}
            />
        );
    }

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "linear-gradient(160deg, #020510 0%, #040a1a 50%, #06051a 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px",
                fontFamily: "'Courier New', monospace",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 800,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    padding: "0 4px",
                }}
            >
                <div>
                    <div style={{ color: "#00cfff", fontSize: 18, fontWeight: "bold", letterSpacing: 3 }}>
                        ◈ COSMIC SHOOTER
                    </div>
                    <div style={{ color: "#ffffff30", fontSize: 10, marginTop: 2 }}>
                        BASE MAINNET • ONCHAIN LEADERBOARD
                    </div>
                </div>
                <WalletButton />
            </div>

            <div
                style={{
                    width: "100%",
                    maxWidth: 900,
                    display: "flex",
                    gap: "20px",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "flex-start",
                }}
            >
                {/* GAME CONTAINER */}
                <div
                    style={{
                        background: "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(0,207,255,0.2)",
                        borderRadius: 16,
                        overflow: "hidden",
                        boxShadow: "0 0 40px rgba(0,207,255,0.08), inset 0 0 60px rgba(0,0,20,0.8)",
                        flex: "1 1 360px",
                        maxWidth: "400px",
                        position: "relative",
                        aspectRatio: "2/3",
                        maxHeight: "80vh",
                    }}
                >
                    <CosmicGame onGameOver={handleGameOver} />
                </div>

                {/* SIDE PANEL */}
                <div style={{ flex: "1 1 300px", minWidth: "300px", maxWidth: "400px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {!isConnected && (
                        <div
                            style={{
                                padding: 16,
                                borderRadius: 12,
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <div style={{ color: "#ffffff60", fontSize: 12, marginBottom: 10, textAlign: "center" }}>
                                Connect wallet to submit scores onchain
                            </div>
                            <WalletButton />
                        </div>
                    )}

                    {isConnected && (
                        <div
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                background: "rgba(0,255,136,0.06)",
                                border: "1px solid rgba(0,255,136,0.2)",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 6px #00ff88" }} />
                            <span style={{ color: "#00ff88", fontSize: 11 }}>Base mainnet</span>
                            <a
                                href="https://docs.base.org/base-chain/network-information/network-faucets"
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#ffffff40", fontSize: 10, marginLeft: "auto" }}
                            >
                                Get ETH ↗
                            </a>
                        </div>
                    )}

                    <div
                        style={{
                            borderRadius: 12,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {(["board", "submit"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        background: tab === t ? "rgba(0,207,255,0.1)" : "transparent",
                                        border: "none",
                                        color: tab === t ? "#00cfff" : "#ffffff40",
                                        fontFamily: "'Courier New', monospace",
                                        fontSize: 11,
                                        cursor: "pointer",
                                        borderBottom: tab === t ? "2px solid #00cfff" : "2px solid transparent",
                                        fontWeight: tab === t ? "bold" : "normal",
                                        letterSpacing: 1,
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {t === "board" ? "LEADERBOARD" : "SUBMIT SCORE"}
                                    {t === "submit" && showSubmit && lastScore > 0 && (
                                        <span
                                            style={{
                                                marginLeft: 6,
                                                background: "#ff4488",
                                                color: "#fff",
                                                fontSize: 10,
                                                padding: "1px 5px",
                                                borderRadius: 4,
                                            }}
                                        >
                                            NEW
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div style={{ padding: 16 }}>
                            {tab === "board" ? (
                                <Leaderboard currentAddress={address} />
                            ) : (
                                <SubmitScorePanel score={lastScore} onSubmitted={handleSubmitted} />
                            )}
                        </div>
                    </div>

                    <div
                        style={{
                            padding: "12px 16px",
                            borderRadius: 12,
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                        }}
                    >
                        <div style={{ color: "#ffffff60", fontSize: 11, lineHeight: 1.8 }}>
                            <div style={{ color: "#ffffff80", marginBottom: 6, fontWeight: "bold" }}>HOW TO PLAY</div>
                            🖱 Move mouse / touch to aim<br />
                            🔫 Auto-fires bullets<br />
                            💥 Hit enemies to score<br />
                            🔗 Submit best score onchain<br />
                            ⚡ Combos multiply points!
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ color: "#ffffff20", fontSize: 10, marginTop: 20, textAlign: "center" }}>
                Built on Base • Powered by wagmi + viem<br />
                Smart contract on Base mainnet
            </div>
        </main>
    );
}
