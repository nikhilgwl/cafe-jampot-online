import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import productImage from "@/assets/merch-photos/product.jpeg";
import jampotLogo from "@/assets/cafe-jampot-logo.png";

// ─── Photo strip (background decoration) ────────────────────────────────────
const photoModules = import.meta.glob(
    "/src/assets/merch-photos/*.jpg",
    { eager: true, as: "url" }
) as Record<string, string>;

const ALL_PHOTOS: string[] = Object.values(photoModules).filter(
    (p) => !p.includes("product")
);

const STRIP_COUNT = 3;
const PHOTOS_PER_STRIP = 8;

function pickRandom(arr: string[], n: number): string[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, arr.length));
}

// ─── Feature pill ────────────────────────────────────────────────────────────
const FeaturePill: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(30,15,8,0.88)",
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: 100,
            padding: "7px 14px",
            fontSize: 13,
            color: "#fff",
            whiteSpace: "nowrap" as const,
            backdropFilter: "blur(6px)",
        }}
    >
        <span style={{ fontSize: 15 }}>{icon}</span>
        {text}
    </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const Merch: React.FC = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState<boolean | null>(null);
    const [strips] = useState(() =>
        Array.from({ length: STRIP_COUNT }, () => pickRandom(ALL_PHOTOS, PHOTOS_PER_STRIP))
    );

    const stylesInjected = useRef(false);
    useEffect(() => {
        if (stylesInjected.current) return;
        stylesInjected.current = true;
        const style = document.createElement("style");
        style.textContent = `
      @keyframes scrollUp {
        from { transform: translateY(0); }
        to   { transform: translateY(-50%); }
      }
      @keyframes scrollDown {
        from { transform: translateY(-50%); }
        to   { transform: translateY(0); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(28px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes productFloat {
        0%, 100% { transform: translateY(0px) rotate(-1deg); }
        50%       { transform: translateY(-10px) rotate(-1deg); }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes jampot-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.28;transform:scale(0.84)} }
      .merch-cta-btn:hover {
        transform: translateY(-2px) scale(1.02) !important;
        box-shadow: 0 16px 48px rgba(0,0,0,0.35) !important;
      }
      .merch-cta-btn:active { transform: scale(0.98) !important; }
      .feature-card:hover {
        background: rgba(55,28,14,0.95) !important;
        transform: translateY(-2px);
      }
      @media (max-width: 768px) {
        .merch-hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        .merch-detail-grid { grid-template-columns: 1fr !important; }
        .merch-steps-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 480px) {
        .merch-steps-grid { grid-template-columns: 1fr !important; }
      }
    `;
        document.head.appendChild(style);
    }, []);

    useEffect(() => {
        supabase
            .from("merch_settings")
            .select("is_open")
            .limit(1)
            .maybeSingle()
            .then(({ data }) => setIsOpen(data?.is_open ?? true));
    }, []);

    if (isOpen === null) {
        return (
            <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#faf7f2" }}>
                <div style={{ width: 120, height: 120, borderRadius: 28, background: "#1a0d05", display: "flex", alignItems: "center", justifyContent: "center", animation: "jampot-pulse 1.4s ease-in-out infinite", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
                    <img src={jampotLogo} alt="Loading" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 16 }} />
                </div>
                <style>{`@keyframes jampot-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.28;transform:scale(0.84)} }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0f0806", fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>

            {/* ── Background photo strips ── */}
            <div style={{ position: "fixed", inset: 0, display: "flex", gap: 10, overflow: "hidden", opacity: 0.55, pointerEvents: "none", zIndex: 0 }}>
                {strips.map((photos, si) => {
                    const doubled = [...photos, ...photos];
                    const dir = si % 2 === 0 ? "scrollUp" : "scrollDown";
                    const dur = [80, 95, 72][si];
                    return (
                        <div key={si} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, animation: `${dir} ${dur}s linear infinite` }}>
                            {doubled.map((src, i) => (
                                <div key={i} style={{ background: "#fff", padding: "5px 5px 16px", borderRadius: 3, flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                                    <img src={src} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* ── Overlay — lighter so photos breathe through ── */}
            <div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, rgba(10,5,3,0.94) 0%, rgba(10,5,3,0.90) 100%)", zIndex: 1, pointerEvents: "none" }} />

            {/* ── Content ── */}
            <div style={{ position: "relative", zIndex: 2 }}>

                {/* Nav */}
                <nav style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button
                        onClick={() => navigate("/")}
                        style={{ background: "rgba(30,15,8,0.85)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 100, color: "#fff", fontSize: 13, padding: "7px 16px", cursor: "pointer", backdropFilter: "blur(8px)" }}
                    >
                        ← Back to Menu
                    </button>
                    <div style={{ background: "rgba(30,15,8,0.85)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 100, padding: "5px 14px", color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                        A Café Jampot Original
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section
                    className="merch-hero-grid"
                    style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 64px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}
                >
                    {/* Left: Text */}
                    <div style={{ animation: "fadeInUp 0.7s ease both" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(40,25,5,0.92)", border: "1px solid rgba(255,215,100,0.45)", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: "#ffd764", marginBottom: 20, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                            <img src={jampotLogo} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />
                            By Café Jampot
                        </div>

                        <h1 style={{ fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 800, color: "#fff", lineHeight: 1.08, margin: "0 0 20px", fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em" }}>
                            Your Memories.
                            <br />
                            <span style={{ background: "linear-gradient(90deg, #ffd764, #ffb347, #ffd764)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s linear infinite" }}>
                                Always Within Reach.
                            </span>
                        </h1>

                        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, marginBottom: 32, maxWidth: 420 }}>
                            A crystal-clear acrylic magnetic frame crafted by Café Jampot — snap your favourite photo in, stick it on your fridge, almirah, or any magnetic surface. A little piece of your time here, always in sight.
                        </p>

                        {/* Price */}
                        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 32 }}>
                            <span style={{ fontSize: 42, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>₹150</span>
                            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", textDecoration: "line-through" }}>₹250</span>
                            <span style={{ background: "#22c55e", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 100 }}>40% OFF</span>
                        </div>

                        {/* Feature pills */}
                        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 36 }}>
                            <FeaturePill icon="🔮" text="High-Gloss Acrylic" />
                            <FeaturePill icon="🧲" text="Magnetic — Sticks Anywhere" />
                            <FeaturePill icon="📐" text="Ultra-Thin Profile" />
                            <FeaturePill icon="🔄" text="Swappable Photos" />
                        </div>

                        {isOpen ? (
                            <button
                                className="merch-cta-btn"
                                onClick={() => navigate("/merch/order")}
                                style={{ background: "linear-gradient(135deg, #ffd764 0%, #ffb347 100%)", color: "#1a0d05", border: "none", borderRadius: 16, padding: "18px 40px", fontSize: 17, fontWeight: 800, cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 32px rgba(255,215,100,0.35)", letterSpacing: "-0.01em" }}
                            >
                                Order My Frame — ₹150
                            </button>
                        ) : (
                            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "18px 32px", color: "rgba(255,255,255,0.5)", fontSize: 15, maxWidth: 340 }}>
                                Orders are currently closed. Contact Jampot partners for details.
                            </div>
                        )}

                        <p style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                            Pay via UPI · Delivered to hostel · No returns
                        </p>
                    </div>

                    {/* Right: Product Image — THE STAR */}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", animation: "fadeInUp 0.7s 0.15s ease both" }}>
                        <div style={{ position: "relative", animation: "productFloat 6s ease-in-out infinite" }}>
                            {/* Ambient glow */}
                            <div style={{ position: "absolute", inset: -40, background: "radial-gradient(ellipse at center, rgba(255,215,100,0.22) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
                            <img
                                src={productImage}
                                alt="XLRI Acrylic Magnetic Photo Frame"
                                style={{ width: "100%", maxWidth: 520, height: "auto", display: "block", borderRadius: 20, filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.65))", position: "relative" }}
                            />
                        </div>
                    </div>
                </section>

                {/* ── PRODUCT DETAIL SECTION ── */}
                <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
                    <div
                        className="merch-detail-grid"
                        style={{ background: "rgba(20,10,5,0.92)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 28, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr" }}
                    >
                        {/* Full-bleed product image */}
                        <div style={{ position: "relative", background: "#1a0d05" }}>
                            <img
                                src={productImage}
                                alt="Frame detail"
                                style={{ width: "100%", height: "100%", minHeight: 420, objectFit: "cover", objectPosition: "center", display: "block" }}
                            />
                            <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", borderRadius: 100, padding: "5px 12px", fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                                Actual product
                            </div>
                        </div>

                        {/* Features */}
                        <div style={{ padding: "40px 36px" }}>
                            <p style={{ fontSize: 11, color: "#ffd764", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 12 }}>
                                What you're getting
                            </p>
                            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 28, fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
                                A keepsake from Jampot,<br />not just a photo frame
                            </h2>

                            {[
                                { icon: "🔮", title: "High-Gloss Acrylic", desc: "Crystal clarity with deep gloss finish. Your photo looks like it's printed inside glass." },
                                { icon: "🧲", title: "Magnetic — Sticks Anywhere", desc: "Fridge, almirah, metal locker, whiteboard — anywhere magnetic. No drilling, no nails." },
                                { icon: "📐", title: "Ultra-Thin Flush Profile", desc: "Sleek and slim, it sits flush against any surface without sticking out." },
                                { icon: "🔄", title: "Swap Photos Anytime", desc: "Snap the magnets open, slide a new photo in, snap shut. Tool-free, takes 10 seconds." },
                            ].map((f) => (
                                <div
                                    key={f.title}
                                    className="feature-card"
                                    style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18, background: "rgba(40,20,10,0.9)", borderRadius: 14, padding: "14px 16px", transition: "all 0.2s ease", cursor: "default" }}
                                >
                                    <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{f.icon}</span>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{f.title}</div>
                                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px", textAlign: "center" as const }}>
                    <p style={{ fontSize: 11, color: "#ffd764", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>How it works</p>
                    <h2 style={{ fontSize: 30, fontWeight: 700, color: "#fff", marginBottom: 40, fontFamily: "'Playfair Display', serif" }}>Order in 4 simple steps</h2>

                    <div className="merch-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                        {[
                            { step: "01", title: "Fill your details", desc: "Name, roll number, hostel, and how many frames you want" },
                            { step: "02", title: "Upload your photo", desc: "Upload the batch photo you want printed in the frame" },
                            { step: "03", title: "Pay via UPI", desc: "Scan the QR and pay ₹150 per frame, then upload the screenshot" },
                            { step: "04", title: "Get it delivered", desc: "We print and deliver to your hostel within a few days" },
                        ].map((s) => (
                            <div key={s.step} style={{ background: "rgba(20,10,5,0.92)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 20, padding: "28px 20px", textAlign: "left" as const }}>
                                <div style={{ fontSize: 36, fontWeight: 900, color: "rgba(255,215,100,0.2)", fontFamily: "'Playfair Display', serif", lineHeight: 1, marginBottom: 14 }}>{s.step}</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.title}</div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── BOTTOM CTA ── */}
                {isOpen && (
                    <section style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px 80px", textAlign: "center" as const }}>
                        <div style={{ background: "linear-gradient(135deg, rgba(35,18,5,0.97), rgba(28,14,4,0.97))", border: "1px solid rgba(255,215,100,0.35)", borderRadius: 28, padding: "48px 40px" }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>📸</div>
                            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>
                                That photo deserves better than your camera roll
                            </h2>
                            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 28, lineHeight: 1.6 }}>
                                ₹150 for something you'll stick on your fridge and smile at every morning. Orders are open now.
                            </p>
                            <button
                                className="merch-cta-btn"
                                onClick={() => navigate("/merch/order")}
                                style={{ background: "linear-gradient(135deg, #ffd764 0%, #ffb347 100%)", color: "#1a0d05", border: "none", borderRadius: 14, padding: "16px 36px", fontSize: 16, fontWeight: 800, cursor: "pointer", transition: "all 0.2s ease", boxShadow: "0 8px 32px rgba(255,215,100,0.3)" }}
                            >
                                Order Now — ₹150
                            </button>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <div style={{ textAlign: "center" as const, padding: "24px", borderTop: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                    Café Jampot · XLRI Jamshedpur · +91 8824820098
                </div>
            </div>
        </div>
    );
};

export default Merch;