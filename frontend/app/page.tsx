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
                background: "radial-gradient(circle at top, #060b26 0%, #020510 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px 16px 60px 16px",
                fontFamily: "'Courier New', monospace",
                color: "#fff",
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 800,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 32,
                }}
            >
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ 
                        color: "#00cfff", 
                        fontSize: "clamp(18px, 6vw, 24px)", 
                        fontWeight: 900, 
                        letterSpacing: 4,
                        textShadow: "0 0 15px rgba(0,207,255,0.5)"
                    }}>
                        ◈ COSMIC SHOOTER
                    </div>
                    <div style={{ color: "#ffffff30", fontSize: 10, marginTop: 4, letterSpacing: 1 }}>
                        BASE MAINNET • ONCHAIN ARCADE
                    </div>
                </div>
                <div style={{ transform: "scale(0.95)", transformOrigin: "right" }}>
                    <WalletButton />
                </div>
            </div>

            {/* CONTENT WRAPPER */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 800,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 32,
                }}
            >
                {/* GAME SECTION */}
                <div
                    style={{
                        width: "100%",
                        maxWidth: 440,
                        background: "rgba(0,0,0,0.4)",
                        border: "2px solid rgba(0,207,255,0.2)",
                        borderRadius: 24,
                        padding: 8,
                        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 20px rgba(0,207,255,0.05)",
                    }}
                >
                    <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "2/3" }}>
                        <CosmicGame onGameOver={handleGameOver} />
                    </div>
                </div>

                {/* INTERACTIVE PANEL SECTION */}
                <div style={{ 
                    width: "100%",
                    maxWidth: 440,
                    display: "flex", 
                    flexDirection: "column", 
                    gap: 16 
                }}>
                    {/* NETWORK STATUS */}
                    <div
                        style={{
                            padding: "14px 20px",
                            borderRadius: 16,
                            background: "rgba(0,255,136,0.05)",
                            border: "1px solid rgba(0,255,136,0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <div style={{ 
                            width: 10, 
                            height: 10, 
                            borderRadius: "50%", 
                            background: isConnected ? "#00ff88" : "#ff4466",
                            boxShadow: `0 0 12px ${isConnected ? "#00ff88" : "#ff4466"}`
                        }} />
                        <span style={{ color: isConnected ? "#00ff88" : "#ff4466", fontSize: 13, fontWeight: "bold", letterSpacing: 1 }}>
                            {isConnected ? "BASE MAINNET ACTIVE" : "WALLET DISCONNECTED"}
                        </span>
                    </div>

                    {/* TABS & LISTS */}
                    <div
                        style={{
                            borderRadius: 24,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            overflow: "hidden",
                            backdropFilter: "blur(20px)",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                        }}
                    >
                        <div style={{ display: "flex", background: "rgba(0,0,0,0.3)" }}>
                            {(["board", "submit"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    style={{
                                        flex: 1,
                                        padding: "16px",
                                        background: tab === t ? "rgba(0,207,255,0.1)" : "transparent",
                                        border: "none",
                                        color: tab === t ? "#00cfff" : "#ffffff30",
                                        fontFamily: "'Courier New', monospace",
                                        fontSize: 13,
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        borderBottom: tab === t ? "3px solid #00cfff" : "3px solid transparent",
                                        transition: "all 0.3s",
                                        letterSpacing: 1,
                                    }}
                                >
                                    {t === "board" ? "LEADERBOARD" : "SUBMIT"}
                                </button>
                            ))}
                        </div>

                        <div style={{ padding: "24px 16px", minHeight: 320 }}>
                            {tab === "board" ? (
                                <Leaderboard currentAddress={address} />
                            ) : (
                                <SubmitScorePanel score={lastScore} onSubmitted={handleSubmitted} />
                            )}
                        </div>
                    </div>

                    {/* INFO CARD */}
                    <div
                        style={{
                            padding: "24px",
                            borderRadius: 24,
                            background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <div style={{ color: "#00cfff", fontSize: 14, marginBottom: 14, fontWeight: "bold", letterSpacing: 1.5 }}>
                            🎮 HOW TO PLAY
                        </div>
                        <div style={{ color: "#ffffff50", fontSize: 12, lineHeight: 2.2 }}>
                            • 🖱 Move to aim & shoot automatically<br />
                            • 💥 Destroy enemies for high score<br />
                            • ⚡ Keep combo active for multiplier<br />
                            • ⛓ Submit results to Base Mainnet
                        </div>
                    </div>
                </div>
            </div>

            {/* SITE FOOTER */}
            <div style={{ 
                marginTop: 60, 
                padding: "30px 20px", 
                borderTop: "1px solid rgba(255,255,255,0.05)",
                width: "100%",
                maxWidth: 600,
                textAlign: "center"
            }}>
                <div style={{ color: "#ffffff15", fontSize: 11, letterSpacing: 1.5, lineHeight: 1.8 }}>
                    BUILT ON BASE • DECENTRALIZED ARCADE<br />
                    © 2024 COSMIC SHOOTER LABS
                </div>
            </div>
        </main>
    );
}
