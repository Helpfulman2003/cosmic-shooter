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
                padding: "20px 12px 40px 12px",
                fontFamily: "'Courier New', monospace",
                color: "#fff",
                overflowX: "hidden",
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 1000,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                    padding: "0 8px",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ 
                        color: "#00cfff", 
                        fontSize: "clamp(16px, 5vw, 22px)", 
                        fontWeight: 900, 
                        letterSpacing: 4,
                        textShadow: "0 0 15px rgba(0,207,255,0.5)"
                    }}>
                        ◈ COSMIC SHOOTER
                    </div>
                    <div style={{ color: "#ffffff40", fontSize: 10, marginTop: 4, letterSpacing: 1 }}>
                        BASE MAINNET • ONCHAIN ARCADE
                    </div>
                </div>
                <div style={{ transform: "scale(0.9)", transformOrigin: "right" }}>
                    <WalletButton />
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 1000,
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 24,
                    justifyContent: "center",
                    alignItems: "flex-start",
                }}
            >
                {/* GAME SECTION */}
                <div
                    style={{
                        flex: "1 1 360px",
                        maxWidth: 480,
                        width: "100%",
                        background: "rgba(0,0,0,0.4)",
                        border: "2px solid rgba(0,207,255,0.15)",
                        borderRadius: 24,
                        padding: 8,
                        boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(0,207,255,0.05)",
                        position: "relative",
                    }}
                >
                    <div style={{ borderRadius: 16, overflow: "hidden", position: "relative" }}>
                        <CosmicGame onGameOver={handleGameOver} />
                    </div>
                </div>

                {/* SIDE PANEL SECTION */}
                <div style={{ 
                    flex: "1 1 320px", 
                    maxWidth: 400, 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: 16 
                }}>
                    {/* NETWORK STATUS */}
                    <div
                        style={{
                            padding: "12px 16px",
                            borderRadius: 16,
                            background: "rgba(0,255,136,0.04)",
                            border: "1px solid rgba(0,255,136,0.15)",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <div style={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: "50%", 
                            background: isConnected ? "#00ff88" : "#ff4466",
                            boxShadow: `0 0 10px ${isConnected ? "#00ff88" : "#ff4466"}`
                        }} />
                        <span style={{ color: isConnected ? "#00ff88" : "#ff4466", fontSize: 12, fontWeight: "bold" }}>
                            {isConnected ? "BASE MAINNET ACTIVE" : "WALLET DISCONNECTED"}
                        </span>
                    </div>

                    {/* INTERACTIVE PANEL */}
                    <div
                        style={{
                            borderRadius: 20,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            overflow: "hidden",
                            backdropFilter: "blur(20px)",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                        }}
                    >
                        {/* TABS */}
                        <div style={{ display: "flex", background: "rgba(0,0,0,0.2)" }}>
                            {(["board", "submit"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    style={{
                                        flex: 1,
                                        padding: "14px",
                                        background: tab === t ? "rgba(0,207,255,0.08)" : "transparent",
                                        border: "none",
                                        color: tab === t ? "#00cfff" : "#ffffff30",
                                        fontFamily: "'Courier New', monospace",
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        borderBottom: tab === t ? "3px solid #00cfff" : "3px solid transparent",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        letterSpacing: 1,
                                    }}
                                >
                                    {t === "board" ? "LEADERBOARD" : "SUBMIT SCORE"}
                                </button>
                            ))}
                        </div>

                        {/* CONTENT AREA */}
                        <div style={{ padding: 20, minHeight: 300 }}>
                            {tab === "board" ? (
                                <Leaderboard currentAddress={address} />
                            ) : (
                                <SubmitScorePanel score={lastScore} onSubmitted={handleSubmitted} />
                            )}
                        </div>
                    </div>

                    {/* INFO FOOTER */}
                    <div
                        style={{
                            padding: "20px",
                            borderRadius: 20,
                            background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                            border: "1px solid rgba(255,255,255,0.06)",
                        }}
                    >
                        <div style={{ color: "#00cfff", fontSize: 13, marginBottom: 12, fontWeight: "bold", letterSpacing: 1 }}>
                            🎮 HOW TO PLAY
                        </div>
                        <div style={{ color: "#ffffff60", fontSize: 12, lineHeight: 2 }}>
                            • 🖱 Move to aim (Auto-fire)<br />
                            • 💥 Destroy enemies for score<br />
                            • ⚡ Keep combo for multiplier<br />
                            • ⛓ Submit results to Base
                        </div>
                    </div>
                </div>
            </div>

            {/* SITE FOOTER */}
            <div style={{ 
                marginTop: 40, 
                padding: "20px", 
                borderTop: "1px solid rgba(255,255,255,0.05)",
                width: "100%",
                maxWidth: 600,
                textAlign: "center"
            }}>
                <div style={{ color: "#ffffff15", fontSize: 11, letterSpacing: 1 }}>
                    BUILT ON BASE • DECENTRALIZED ARCADE ENGINE<br />
                    © 2024 COSMIC SHOOTER LABS
                </div>
            </div>
        </main>
    );
}
