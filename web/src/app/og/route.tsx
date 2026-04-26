import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: 80,
                    background: "#ffffff",
                    color: "#0f172a",
                    position: "relative",
                    fontFamily: "sans-serif",
                }}
            >
                {/* Grid Background */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                        opacity: 0.5,
                        display: "flex",
                    }}
                />

                {/* Accent Frame */}
                <div
                    style={{
                        position: "absolute",
                        top: 40,
                        bottom: 40,
                        left: 40,
                        right: 40,
                        border: "2px solid #3f97e420",
                        borderRadius: 32,
                        display: "flex",
                    }}
                />

                {/* MAIN CONTENT */}
                <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
                        {/* Logo Box */}
                        <div
                            style={{
                                width: 100,
                                height: 100,
                                background: "#3f97e4",
                                borderRadius: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 20px 25px -5px rgba(63, 151, 228, 0.3)",
                                marginRight: 30,
                            }}
                        >
                            {/* Properly Formatted SVG for Satori */}
                            <svg
                                width="60"
                                height="60"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white" // Icon color inside blue box
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ display: "flex" }}
                            >
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                            </svg>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div
                                style={{
                                    fontSize: 22,
                                    color: "#3f97e4",
                                    letterSpacing: "0.3em",
                                    textTransform: "uppercase",
                                    fontWeight: 700,
                                    display: "flex",
                                    marginBottom: 8,
                                }}
                            >
                                ClassFlow Prime
                            </div>
                            <div
                                style={{
                                    fontSize: 80,
                                    fontWeight: 900,
                                    color: "#0f172a",
                                    lineHeight: 1,
                                    letterSpacing: "-0.04em",
                                    display: "flex",
                                }}
                            >
                                Smart Academic
                            </div>
                            <div
                                style={{
                                    fontSize: 80,
                                    fontWeight: 900,
                                    color: "#0f172a",
                                    lineHeight: 1,
                                    letterSpacing: "-0.04em",
                                    display: "flex",
                                }}
                            >
                                Workflow.
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            fontSize: 28,
                            color: "#64748b",
                            maxWidth: 850,
                            lineHeight: 1.5,
                            display: "flex",
                            marginTop: 10,
                        }}
                    >
                        A high-performance workspace designed for modern educational environments.
                        Centralize exams, class routines, and team collaboration.
                    </div>

                    <div style={{ display: "flex", marginTop: 40 }}>
                        {["Production Ready", "Next-Gen UI", "Classflow Standard"].map((tag) => (
                            <div
                                key={tag}
                                style={{
                                    padding: "12px 24px",
                                    borderRadius: 100,
                                    background: "#f1f5f9",
                                    border: "1px solid #e2e8f0",
                                    fontSize: 20,
                                    color: "#334155",
                                    fontWeight: 600,
                                    display: "flex",
                                    marginRight: 15,
                                }}
                            >
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    style={{
                        position: "absolute",
                        bottom: 70,
                        right: 80,
                        display: "flex",
                    }}
                >
                    <div
                        style={{
                            fontSize: 20,
                            color: "#94a3b8",
                            letterSpacing: "0.1em",
                            fontWeight: 500,
                        }}
                    >
                        classflow-prime.vercel.app
                    </div>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}