import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import jampotLogo from "@/assets/jampot-logo.png";

// ─── Auto-load ALL photos from src/assets/merch-photos/ ──────────────────────
// Vite's import.meta.glob scans the folder at BUILD TIME — no manual list needed.
// Just drop your photos into src/assets/merch-photos/ and they appear automatically.
const photoModules = import.meta.glob(
    "/src/assets/merch-photos/*",
    { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

const ALL_PHOTOS: string[] = Object.values(photoModules);

// Fisher-Yates shuffle for variety on each page load
const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const SHUFFLED = shuffle(ALL_PHOTOS);
// Duplicate for seamless infinite scroll
const STRIP_ITEMS = SHUFFLED.length > 0 ? [...SHUFFLED, ...SHUFFLED] : [];
// Use up to 6 photos for the hero crossfade (re-shuffled so they differ from strip)
const HERO_PHOTOS = shuffle(ALL_PHOTOS).slice(0, 6);

// Fallback colored placeholders if folder is empty
const FALLBACK_COLORS = [
    "#8B5E3C", "#A0785A", "#C4956A", "#D4A574", "#B8860B",
    "#6B4226", "#9C6B4E", "#E8C49A", "#7D5A3C", "#BFA080",
    "#5C3D1E", "#C8A882", "#8B6914", "#A67C52", "#D2B48C",
    "#704214", "#B8860B", "#CD853F", "#8B4513", "#DEB887",
];
const FALLBACK_STRIP = [...FALLBACK_COLORS, ...FALLBACK_COLORS];

// ─── Photo Strip ──────────────────────────────────────────────────────────────
const PhotoStrip: React.FC<{ direction: "left" | "right" }> = ({ direction }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const hasPhotos = STRIP_ITEMS.length > 0;
    const items = hasPhotos ? STRIP_ITEMS : FALLBACK_STRIP;

    return (
        <div
            style={{
                overflow: "hidden",
                width: "100%",
                maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: 16,
                    padding: "20px 0",   // generous vertical padding so rotated corners aren't clipped
                    width: "max-content",
                    animation: `merch-scroll-${direction} 600s linear infinite`,
                    animationPlayState: isPaused ? "paused" : "running",
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => { setIsPaused(false); setHoveredIdx(null); }}
            >
                {items.map((item, i) => {
                    // Slight alternating tilt for that natural polaroid-wall feel
                    // Odd items tilt slightly right, even slightly left, with small variance
                    const tiltAngles = [-2.5, 1.8, -1.2, 2.8, -2.0, 1.4, -3.0, 2.2, -1.6, 2.6];
                    const baseTilt = tiltAngles[i % tiltAngles.length];
                    const isHovered = hoveredIdx === i;

                    return (
                        <div
                            key={i}
                            style={{
                                // Polaroid outer shell — white card with padding
                                width: 124,
                                flexShrink: 0,
                                background: "#fff",
                                padding: "7px 7px 22px 7px",   // more padding at bottom = polaroid caption area
                                borderRadius: 3,
                                cursor: "pointer",
                                userSelect: "none",
                                position: "relative",
                                transform: isHovered
                                    ? `rotate(0deg) scale(1.2) translateY(-8px)`
                                    : `rotate(${baseTilt}deg) scale(1) translateY(0)`,
                                transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease",
                                boxShadow: isHovered
                                    ? "0 18px 40px rgba(0,0,0,0.35)"
                                    : "0 3px 12px rgba(0,0,0,0.22)",
                                zIndex: isHovered ? 20 : 1,
                            }}
                            onMouseEnter={() => setHoveredIdx(i)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        >
                            {/* Photo area */}
                            <div style={{ width: "100%", height: 90, overflow: "hidden", borderRadius: 1 }}>
                                {hasPhotos ? (
                                    <img
                                        src={item}
                                        alt=""
                                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                        draggable={false}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100%", height: "100%", background: item,
                                            opacity: 0.8, display: "flex", alignItems: "center",
                                            justifyContent: "center", fontSize: 26,
                                        }}
                                    >
                                        📸
                                    </div>
                                )}
                            </div>
                            {/* Polaroid caption strip — the white area at the bottom */}
                            {/* Already handled by the parent padding-bottom: 22px */}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Hero Background Crossfade ────────────────────────────────────────────────
const HeroBackground: React.FC = () => {
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        if (HERO_PHOTOS.length < 2) return;
        const id = setInterval(() => {
            setActiveIdx(prev => (prev + 1) % HERO_PHOTOS.length);
        }, 6000);
        return () => clearInterval(id);
    }, []);

    if (HERO_PHOTOS.length === 0) {
        return (
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, #2c1206 0%, #5a2a10 35%, #8B5E3C 70%, #c4956a 100%)",
                }}
            />
        );
    }

    return (
        <>
            {HERO_PHOTOS.map((src, i) => (
                <img
                    key={src}
                    src={src}
                    alt=""
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: i === activeIdx ? 1 : 0,
                        transition: "opacity 2s ease-in-out",
                        zIndex: i === activeIdx ? 1 : 0,
                    }}
                    draggable={false}
                />
            ))}
            <div style={{ position: "absolute", inset: 0, background: "rgba(20,8,0,0.68)", zIndex: 2 }} />
        </>
    );
};

// ─── Jampot Loader ────────────────────────────────────────────────────────────
const JampotLoader: React.FC = () => (
    <div
        style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#faf7f2",
        }}
    >
        {/* Dark rounded square background — matches the logo card style in screenshot */}
        <div
            style={{
                width: 120,
                height: 120,
                borderRadius: 28,
                background: "#1a0d05",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "jampot-pulse 1.4s ease-in-out infinite",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}
        >
            <img
                src={jampotLogo}
                alt="Loading"
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: "16px"
                }}
            />
        </div>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Merch: React.FC = () => {
    const navigate = useNavigate();
    const [pageLoading, setPageLoading] = useState(true);
    const [merchOpen, setMerchOpen] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await (supabase
                    .from("merch_settings")
                    .select("is_open")
                    .limit(1)
                    .maybeSingle() as any);
                setMerchOpen(data?.is_open ?? true);
            } catch {
                setMerchOpen(true);
            } finally {
                setTimeout(() => setPageLoading(false), 800);
            }
        };
        fetch();
    }, []);

    if (pageLoading) return <JampotLoader />;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

        @keyframes merch-scroll-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes merch-scroll-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @keyframes jampot-pulse {
          0%, 100% { opacity: 1;    transform: scale(1); }
          50%       { opacity: 0.28; transform: scale(0.84); }
        }
        @keyframes mfu {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mfu-1 { animation: mfu 0.6s 0.05s ease both; }
        .mfu-2 { animation: mfu 0.6s 0.18s ease both; }
        .mfu-3 { animation: mfu 0.6s 0.30s ease both; }
        .mfu-4 { animation: mfu 0.6s 0.42s ease both; }
        .mfu-5 { animation: mfu 0.6s 0.56s ease both; }

        .merch-btn {
          background: #6b3a1f;
          color: #faf7f2;
          border: none;
          padding: 15px 44px;
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          letter-spacing: 0.04em;
          border-radius: 4px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(107,58,31,0.3);
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .merch-btn:hover {
          background: #8B5E3C;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(107,58,31,0.4);
        }
        .merch-btn:active { transform: translateY(0); }

        .how-card {
          background: rgba(255,252,245,0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(180,140,100,0.22);
          border-radius: 14px;
          padding: 28px 22px;
          text-align: center;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .how-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 36px rgba(107,58,31,0.13);
        }
      `}</style>

            <div style={{ fontFamily: "'Lora', serif", backgroundColor: "#faf7f2", minHeight: "100vh", overflowX: "hidden" }}>

                {/* Top strip */}
                <div style={{ paddingTop: 16 }}>
                    <PhotoStrip direction="left" />
                </div>

                {/* Hero */}
                <section
                    style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        minHeight: "74vh",
                        padding: "56px 24px 64px",
                    }}
                >
                    <HeroBackground />

                    {/* Fade to page bg at bottom */}
                    <div
                        style={{
                            position: "absolute",
                            inset: "auto 0 0 0",
                            height: "38%",
                            background: "linear-gradient(to bottom, transparent, #faf7f2)",
                            zIndex: 3,
                        }}
                    />

                    <div style={{ position: "relative", zIndex: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                        {/* Logo in dark rounded square — matches product logo card style */}
                        <div
                            className="mfu-1"
                            style={{
                                width: 110,
                                height: 110,
                                borderRadius: 26,
                                background: "#1a0d05",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                                flexShrink: 0,
                            }}
                        >
                            <img
                                src={jampotLogo}
                                alt="Café Jampot"
                                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "16px" }}
                            />
                        </div>

                        <h1 className="mfu-2" style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2.4rem, 6vw, 4.4rem)",
                            fontWeight: 700,
                            color: "#faf7f2",
                            lineHeight: 1.1,
                            textShadow: "0 2px 20px rgba(0,0,0,0.45)",
                            margin: 0,
                        }}>
                            Café Jampot
                        </h1>

                        <p className="mfu-3" style={{
                            fontFamily: "'Playfair Display', serif",
                            fontStyle: "italic",
                            fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
                            color: "#e8c49a",
                            margin: 0,
                        }}>
                            Sayonara '26
                        </p>

                        <p className="mfu-3" style={{
                            fontSize: "0.78rem",
                            color: "#d4a574",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            margin: 0,
                        }}>
                            — The Last Polaroid —
                        </p>

                        <p className="mfu-4" style={{
                            color: "rgba(255,252,245,0.88)",
                            fontSize: "clamp(0.88rem, 2vw, 1rem)",
                            maxWidth: 460,
                            lineHeight: 1.75,
                            marginTop: 4,
                        }}>
                            One last memory, always within reach. A custom fridge magnet photo frame —
                            stick it on your almirah, your fridge, wherever home feels like.
                        </p>

                        {merchOpen ? (
                            <button className="merch-btn mfu-5" onClick={() => navigate("/merch/order")}>
                                Order Now @ ₹150/- per piece
                            </button>
                        ) : (
                            <div className="mfu-5" style={{
                                background: "rgba(255,252,245,0.1)",
                                border: "1px solid rgba(255,252,245,0.22)",
                                borderRadius: 10,
                                padding: "18px 28px",
                                color: "#e8c49a",
                                maxWidth: 420,
                                lineHeight: 1.65,
                                backdropFilter: "blur(10px)",
                            }}>
                                <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Orders are currently closed</p>
                                <p style={{ margin: 0, fontSize: "0.88rem", opacity: 0.85 }}>
                                    Please contact Jampot partners for further details.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* How it works */}
                <section style={{ padding: "48px 24px 60px", maxWidth: 920, margin: "0 auto" }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
                        textAlign: "center",
                        color: "#3d1f0d",
                        marginBottom: 40,
                        fontWeight: 700,
                    }}>
                        How It Works
                    </h2>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
                        {[
                            { icon: "📋", title: "Fill Your Details", desc: "Name, roll number, mobile and email — quick and easy" },
                            { icon: "📸", title: "Upload Your Photo", desc: "Choose a clear, well-lit photo for the best print quality" },
                            { icon: "✅", title: "Confirm Order", desc: "Review everything before you lock it in" },
                            { icon: "💳", title: "Pay & Done", desc: "Scan our UPI QR, upload the screenshot and you're set" },
                        ].map((step, i) => (
                            <div key={i} className="how-card">
                                <div style={{ fontSize: 38, marginBottom: 14 }}>{step.icon}</div>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: "#3d1f0d", marginBottom: 8, fontWeight: 600 }}>
                                    {step.title}
                                </h3>
                                <p style={{ fontSize: "0.85rem", color: "#7a5c3c", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Bottom strip */}
                <div style={{ paddingBottom: 24 }}>
                    <PhotoStrip direction="right" />
                </div>

                {/* Footer */}
                <footer style={{
                    textAlign: "center",
                    padding: "20px 24px",
                    borderTop: "1px solid rgba(180,140,100,0.18)",
                    color: "#a07850",
                    fontSize: "0.8rem",
                }}>
                    <p style={{ margin: 0 }}>Made with ♥ by Café Jampot · XLRI '26</p>
                    <p style={{ margin: "4px 0 0" }}>Contact: +91 8824820098</p>
                </footer>
            </div>
        </>
    );
};

export default Merch;