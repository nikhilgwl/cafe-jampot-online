import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jampotLogo from "@/assets/jampot-logo.png";

interface LocationState {
    orderId: string;  // this is the batchId
    quantity: number;
    total: number;
    details: {
        name: string;
        rollNumber: string;
        mobile: string;
        email: string;
    };
}

const MerchSuccess: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | null;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!state?.orderId) { navigate("/merch"); return; }
        setTimeout(() => setVisible(true), 100);
    }, [state, navigate]);

    if (!state?.orderId) return null;

    const { details, orderId, quantity, total } = state;
    const shortId = orderId.slice(0, 8).toUpperCase();

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes checkmark-pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110px) rotate(360deg); opacity: 0; }
        }
        .sc { animation: checkmark-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .sf1 { animation: fade-up 0.6s 0.3s ease forwards; opacity: 0; }
        .sf2 { animation: fade-up 0.6s 0.5s ease forwards; opacity: 0; }
        .sf3 { animation: fade-up 0.6s 0.7s ease forwards; opacity: 0; }
        .sf4 { animation: fade-up 0.6s 0.9s ease forwards; opacity: 0; }
      `}</style>

            <div style={{
                minHeight: "100vh", backgroundColor: "#faf7f2",
                fontFamily: "'Lora', serif",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "40px 16px",
            }}>
                {/* Confetti */}
                <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                    {visible && ["🍫", "✨", "🎉", "💛", "🌟", "🤎", "✨", "🎊", "🖼️", "📸"].map((emoji, i) => (
                        <div key={i} style={{
                            position: "absolute", top: -20, left: `${8 + i * 10}%`, fontSize: "1.4rem",
                            animation: `confetti-fall ${1.5 + i * 0.18}s ${i * 0.08}s ease-out forwards`,
                        }}>
                            {emoji}
                        </div>
                    ))}
                </div>

                <div style={{
                    background: "#fffdf9", border: "1px solid rgba(180,140,100,0.25)",
                    borderRadius: 16, padding: "40px 32px", maxWidth: 500, width: "100%",
                    boxShadow: "0 8px 32px rgba(107,58,31,0.1)",
                    textAlign: "center", position: "relative", zIndex: 1,
                }}>
                    {/* Check */}
                    <div className="sc" style={{
                        width: 72, height: 72, borderRadius: "50%",
                        background: "linear-gradient(135deg, #6b3a1f, #a0622a)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 8px 24px rgba(107,58,31,0.3)",
                    }}>
                        <span style={{ fontSize: 32, color: "#faf7f2" }}>✓</span>
                    </div>

                    <h1 className="sf1" style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(1.6rem, 4vw, 2rem)",
                        color: "#3d1f0d", margin: "0 0 4px", fontWeight: 700,
                    }}>
                        Order Placed!
                    </h1>

                    <p className="sf1" style={{
                        fontFamily: "'Playfair Display', serif", fontStyle: "italic",
                        color: "#a07850", margin: "0 0 28px", fontSize: "0.95rem",
                    }}>
                        We'll deliver your {quantity > 1 ? `${quantity} frames` : "frame"} soon 📦
                    </p>

                    {/* Frames summary banner */}
                    {quantity > 1 && (
                        <div className="sf2" style={{
                            background: "#6b3a1f", borderRadius: 8, padding: "10px 16px",
                            marginBottom: 20, display: "flex", justifyContent: "space-between",
                        }}>
                            <span style={{ color: "#e8c49a", fontSize: "0.85rem", fontFamily: "'Lora', serif" }}>
                                {quantity} Fridge Magnet Frames
                            </span>
                            <span style={{ color: "#faf7f2", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                                ₹{total}
                            </span>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="sf2" style={{
                        background: "#fef9f2", border: "1px solid #e8c49a",
                        borderRadius: 10, padding: "18px 20px", marginBottom: 20, textAlign: "left",
                    }}>
                        <p style={{
                            fontFamily: "'Playfair Display', serif", fontSize: "0.82rem",
                            color: "#a07850", margin: "0 0 12px",
                            letterSpacing: "0.08em", textTransform: "uppercase",
                        }}>
                            Order Summary
                        </p>

                        {[
                            { label: "Order ID", value: `#${shortId}` },
                            { label: "Name", value: details.name },
                            { label: "Roll No.", value: details.rollNumber },
                            { label: "Mobile", value: details.mobile },
                            { label: "Email", value: details.email },
                            { label: "Frames", value: `${quantity} × ₹150` },
                            { label: "Total Paid", value: `₹${total}` },
                        ].map(row => (
                            <div key={row.label} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                                padding: "6px 0", borderBottom: "1px solid #f0e6d6", gap: 12,
                            }}>
                                <span style={{ fontSize: "0.8rem", color: "#a07850", fontWeight: 600, flexShrink: 0 }}>
                                    {row.label}
                                </span>
                                <span style={{ fontSize: "0.86rem", color: "#3d1f0d", textAlign: "right", wordBreak: "break-all" }}>
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* What's next */}
                    <div className="sf3" style={{
                        background: "#fef3e8", border: "1px solid #e8c49a",
                        borderRadius: 8, padding: "14px 16px", marginBottom: 24, textAlign: "left",
                    }}>
                        <p style={{ margin: "0 0 6px", fontSize: "0.85rem", color: "#6b3a1f", fontWeight: 600 }}>
                            What happens next?
                        </p>
                        <p style={{ margin: 0, fontSize: "0.82rem", color: "#7a5c3c", lineHeight: 1.6 }}>
                            Our team will verify your payment and prepare your {quantity > 1 ? `${quantity} custom fridge magnets` : "custom fridge magnet"}.
                            We'll reach out on your mobile number for delivery. Expect delivery within 3–5 days.
                        </p>
                    </div>

                    {/* CTAs */}
                    <div className="sf4" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <button
                            onClick={() => navigate("/merch")}
                            style={{
                                width: "100%", padding: "13px 0", background: "#6b3a1f",
                                border: "none", borderRadius: 4, color: "#faf7f2",
                                fontFamily: "'Playfair Display', serif", fontSize: "0.95rem",
                                cursor: "pointer", boxShadow: "0 4px 12px rgba(107,58,31,0.2)",
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#8B5E3C")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#6b3a1f")}
                        >
                            Order More
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            style={{
                                width: "100%", padding: "12px 0", background: "transparent",
                                border: "1px solid #c4956a", borderRadius: 4, color: "#6b3a1f",
                                fontFamily: "'Lora', serif", fontSize: "0.9rem",
                                cursor: "pointer", transition: "background 0.2s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f5ede3")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                            Back to Café Jampot Menu
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: 28, textAlign: "center", opacity: 0.55 }}>
                    <img src={jampotLogo} alt="" style={{ width: 30, height: 30, objectFit: "contain" }} />
                    <p style={{ margin: "4px 0 0", fontSize: "0.76rem", color: "#a07850" }}>
                        Made with ♥ by Café Jampot · XLRI '26
                    </p>
                </div>
            </div>
        </>
    );
};

export default MerchSuccess;