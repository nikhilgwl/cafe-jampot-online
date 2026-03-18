import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import jampotLogo from "@/assets/jampot-logo.png";
import qrImage from "@/assets/payment-qr.png";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRICE_PER_FRAME = 150;
const MAX_QTY = 5;

// ─── Types ────────────────────────────────────────────────────────────────────
interface BuyerDetails {
    name: string;
    rollNumber: string;
    mobile: string;
    email: string;
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const btn = {
    base: {
        fontFamily: "'Lora', serif",
        fontSize: "0.95rem",
        borderRadius: 4,
        cursor: "pointer",
        transition: "all 0.2s",
    } as React.CSSProperties,
};

// ─── Jampot Loader ────────────────────────────────────────────────────────────
const JampotLoader: React.FC<{ message?: string }> = ({ message = "Processing..." }) => (
    <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ backgroundColor: "rgba(250,247,242,0.94)", backdropFilter: "blur(4px)" }}
    >
        <img
            src={jampotLogo}
            alt="Loading"
            style={{ width: 64, height: 64, objectFit: "contain", animation: "jampot-pulse 1.4s ease-in-out infinite", borderRadius:"12px" }}
        />
        <p style={{ fontFamily: "'Lora', serif", color: "#7a5c3c", marginTop: 16, fontSize: "0.9rem" }}>
            {message}
        </p>
    </div>
);

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
    <div className="flex items-center justify-center gap-3 mb-8">
        {Array.from({ length: total }, (_, i) => (
            <div
                key={i}
                style={{
                    width: 36, height: 36, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Playfair Display', serif", fontSize: "0.9rem", fontWeight: 600,
                    transition: "all 0.3s ease",
                    background: i + 1 <= current ? "#6b3a1f" : "transparent",
                    color: i + 1 <= current ? "#faf7f2" : "#c4956a",
                    border: i + 1 <= current ? "2px solid #6b3a1f" : "2px solid #c4956a",
                }}
            >
                {i + 1}
            </div>
        ))}
    </div>
);

// ─── Nav Buttons ──────────────────────────────────────────────────────────────
const NavButtons: React.FC<{
    onBack?: () => void;
    onNext?: () => void;
    nextLabel?: string;
    nextDisabled?: boolean;
    loading?: boolean;
}> = ({ onBack, onNext, nextLabel = "Next →", nextDisabled, loading }) => (
    <div className="flex gap-3 mt-6">
        {onBack && (
            <button
                onClick={onBack}
                style={{ ...btn.base, flex: 1, padding: "13px 0", border: "1px solid #c4956a", background: "transparent", color: "#6b3a1f" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5ede3")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
                ← Back
            </button>
        )}
        {onNext && (
            <button
                onClick={onNext}
                disabled={nextDisabled || loading}
                style={{
                    ...btn.base,
                    flex: 2, padding: "13px 0", border: "none",
                    fontFamily: "'Playfair Display', serif",
                    background: nextDisabled || loading ? "#c4a882" : "#6b3a1f",
                    color: "#faf7f2",
                    cursor: nextDisabled || loading ? "not-allowed" : "pointer",
                    boxShadow: nextDisabled ? "none" : "0 4px 12px rgba(107,58,31,0.2)",
                }}
                onMouseEnter={e => { if (!nextDisabled && !loading) e.currentTarget.style.background = "#8B5E3C"; }}
                onMouseLeave={e => { if (!nextDisabled && !loading) e.currentTarget.style.background = "#6b3a1f"; }}
            >
                {loading ? "Please wait..." : nextLabel}
            </button>
        )}
    </div>
);

// ─── Text Field ───────────────────────────────────────────────────────────────
const Field: React.FC<{
    label: string; type?: string; value: string;
    onChange: (v: string) => void; placeholder?: string; error?: string;
}> = ({ label, type = "text", value, onChange, placeholder, error }) => (
    <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "0.88rem", color: "#6b3a1f", marginBottom: 6 }}>
            {label}
        </label>
        <input
            type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{
                width: "100%", padding: "11px 14px", boxSizing: "border-box",
                border: error ? "1.5px solid #c0392b" : "1.5px solid #d4a574",
                borderRadius: 4, background: "#fffdf9", fontFamily: "'Lora', serif",
                fontSize: "0.95rem", color: "#3d1f0d", outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "#6b3a1f")}
            onBlur={e => (e.currentTarget.style.borderColor = error ? "#c0392b" : "#d4a574")}
        />
        {error && <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#c0392b" }}>{error}</p>}
    </div>
);

// ─── Step 1: Buyer Details + Quantity ────────────────────────────────────────
const Step1: React.FC<{
    details: BuyerDetails;
    quantity: number;
    onChange: (d: BuyerDetails) => void;
    onQtyChange: (q: number) => void;
    onNext: () => void;
}> = ({ details, quantity, onChange, onQtyChange, onNext }) => {
    const [errors, setErrors] = useState<Partial<BuyerDetails>>({});

    const validate = () => {
        const e: Partial<BuyerDetails> = {};
        if (!details.name.trim()) e.name = "Name is required";
        if (!details.rollNumber.trim()) e.rollNumber = "Roll number is required";
        if (!/^\d{10}$/.test(details.mobile)) e.mobile = "Enter a valid 10-digit number";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) e.email = "Enter a valid email";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const total = quantity * PRICE_PER_FRAME;

    return (
        <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#3d1f0d", marginBottom: 24, fontWeight: 600 }}>
                Your Details
            </h2>

            <Field label="Full Name" value={details.name}
                onChange={v => onChange({ ...details, name: v })} placeholder="e.g. Varnika Saha" error={errors.name} />
            <Field label="Roll Number" value={details.rollNumber}
                onChange={v => onChange({ ...details, rollNumber: v })} placeholder="e.g. H24177" error={errors.rollNumber} />
            <Field label="Mobile Number" type="tel" value={details.mobile}
                onChange={v => onChange({ ...details, mobile: v })} placeholder="10-digit number" error={errors.mobile} />
            <Field label="Email Address" type="email" value={details.email}
                onChange={v => onChange({ ...details, email: v })} placeholder="you@example.com" error={errors.email} />

            {/* ── Quantity selector ── */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "0.88rem", color: "#6b3a1f", marginBottom: 10 }}>
                    How many frames? <span style={{ color: "#a07850", fontSize: "0.8rem" }}>(max {MAX_QTY})</span>
                </label>

                <div style={{ display: "flex", gap: 10 }}>
                    {Array.from({ length: MAX_QTY }, (_, i) => i + 1).map(q => (
                        <button
                            key={q}
                            onClick={() => onQtyChange(q)}
                            style={{
                                ...btn.base,
                                width: 44, height: 44, border: "none", borderRadius: 8,
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 700, fontSize: "1rem",
                                background: quantity === q ? "#6b3a1f" : "#f0e8de",
                                color: quantity === q ? "#faf7f2" : "#6b3a1f",
                                boxShadow: quantity === q ? "0 3px 10px rgba(107,58,31,0.25)" : "none",
                                transform: quantity === q ? "scale(1.08)" : "scale(1)",
                            }}
                        >
                            {q}
                        </button>
                    ))}
                </div>

                {/* Price preview */}
                <div
                    style={{
                        marginTop: 14, padding: "12px 16px",
                        background: "#fef9f2", border: "1px solid #e8c49a",
                        borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                >
                    <span style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: "#7a5c3c" }}>
                        {quantity} × ₹{PRICE_PER_FRAME}
                    </span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: 700, color: "#6b3a1f" }}>
                        ₹{total}
                    </span>
                </div>

                <p style={{ margin: "8px 0 0", fontSize: "0.78rem", color: "#a07850" }}>
                    You'll upload {quantity} photo{quantity > 1 ? "s" : ""} in the next step — one per frame.
                </p>
            </div>

            <NavButtons onNext={() => { if (validate()) onNext(); }} nextLabel="Next →" />
        </div>
    );
};

// ─── Single photo slot ────────────────────────────────────────────────────────
const PhotoSlot: React.FC<{
    index: number;
    file: File | null;
    onFile: (f: File) => void;
    onRemove: () => void;
}> = ({ index, file, onFile, onRemove }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(() =>
        file ? URL.createObjectURL(file) : null
    );
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState("");

    const handleFile = (f: File) => {
        if (!f.type.startsWith("image/")) { setError("Images only (JPG, PNG…)"); return; }
        if (f.size > 10 * 1024 * 1024) { setError("Max 10MB per photo"); return; }
        setError("");
        onFile(f);
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target?.result as string);
        reader.readAsDataURL(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files[0]; if (f) handleFile(f);
    };

    return (
        <div style={{ marginBottom: 12 }}>
            {/* Slot label */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontFamily: "'Lora', serif", fontSize: "0.82rem", color: "#6b3a1f", fontWeight: 600 }}>
                    Frame {index + 1}
                </label>
                {file && (
                    <button
                        onClick={() => { setPreview(null); setError(""); onRemove(); }}
                        style={{ background: "none", border: "none", color: "#c0392b", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Lora', serif" }}
                    >
                        ✕ Remove
                    </button>
                )}
            </div>

            {/* Drop zone / preview */}
            <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${dragging ? "#6b3a1f" : file ? "#6b3a1f" : "#c4956a"}`,
                    borderRadius: 8, cursor: "pointer", overflow: "hidden",
                    background: dragging ? "#fef3e8" : "#fffdf9", transition: "all 0.2s",
                    minHeight: file ? 0 : 90,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}
            >
                {preview ? (
                    <div style={{ position: "relative", width: "100%" }}>
                        <img
                            src={preview} alt={`Frame ${index + 1}`}
                            style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
                        />
                        <div
                            style={{
                                position: "absolute", inset: 0,
                                background: "linear-gradient(to top, rgba(107,58,31,0.55) 0%, transparent 50%)",
                            }}
                        />
                        <span style={{
                            position: "absolute", bottom: 8, left: 10,
                            color: "#faf7f2", fontSize: "0.72rem", fontFamily: "'Lora', serif",
                        }}>
                            ✓ Uploaded · click to replace
                        </span>
                    </div>
                ) : (
                    <div style={{ padding: "16px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
                        <p style={{ margin: 0, fontFamily: "'Lora', serif", fontSize: "0.8rem", color: "#6b3a1f" }}>
                            Click or drag photo here
                        </p>
                    </div>
                )}
            </div>

            <input
                ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {error && <p style={{ margin: "3px 0 0", fontSize: "0.76rem", color: "#c0392b" }}>{error}</p>}
        </div>
    );
};

// ─── Step 2: Multi-photo Upload ───────────────────────────────────────────────
const Step2: React.FC<{
    quantity: number;
    photos: (File | null)[];
    onPhotos: (photos: (File | null)[]) => void;
    onBack: () => void;
    onNext: () => void;
}> = ({ quantity, photos, onPhotos, onBack, onNext }) => {
    const [error, setError] = useState("");

    const setPhoto = (index: number, file: File) => {
        const updated = [...photos];
        updated[index] = file;
        onPhotos(updated);
    };

    const removePhoto = (index: number) => {
        const updated = [...photos];
        updated[index] = null;
        onPhotos(updated);
    };

    const uploadedCount = photos.filter(Boolean).length;
    const allUploaded = uploadedCount === quantity;

    const handleNext = () => {
        if (!allUploaded) {
            setError(`Please upload all ${quantity} photo${quantity > 1 ? "s" : ""} to continue. You have ${uploadedCount} of ${quantity}.`);
            return;
        }
        setError("");
        onNext();
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#3d1f0d", fontWeight: 600, margin: 0 }}>
                    Upload Photos
                </h2>
                {/* Progress pill */}
                <span style={{
                    fontFamily: "'Lora', serif", fontSize: "0.78rem", fontWeight: 600,
                    padding: "3px 10px", borderRadius: 20,
                    background: allUploaded ? "#d4edda" : "#fef3e8",
                    color: allUploaded ? "#155724" : "#7a5c3c",
                    border: `1px solid ${allUploaded ? "#c3e6cb" : "#e8c49a"}`,
                }}>
                    {uploadedCount}/{quantity} uploaded
                </span>
            </div>

            {/* Tip */}
            <div style={{
                background: "#fef9f0", border: "1px solid #e8c49a", borderRadius: 8,
                padding: "10px 14px", marginBottom: 18,
                display: "flex", alignItems: "flex-start", gap: 10,
            }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#7a5c3c", lineHeight: 1.5 }}>
                    Upload <strong>exactly {quantity} photo{quantity > 1 ? "s" : ""}</strong> — one per frame.
                    Use clear, well-lit photos for the best print quality.
                </p>
            </div>

            {/* Photo slots */}
            {Array.from({ length: quantity }, (_, i) => (
                <PhotoSlot
                    key={i}
                    index={i}
                    file={photos[i] ?? null}
                    onFile={f => setPhoto(i, f)}
                    onRemove={() => removePhoto(i)}
                />
            ))}

            {error && (
                <div style={{
                    background: "#fef0f0", border: "1px solid #f5c6cb",
                    borderRadius: 6, padding: "10px 14px", marginTop: 8,
                }}>
                    <p style={{ margin: 0, color: "#c0392b", fontSize: "0.85rem" }}>{error}</p>
                </div>
            )}

            <NavButtons onBack={onBack} onNext={handleNext} nextLabel="Next →" nextDisabled={!allUploaded} />
        </div>
    );
};

// ─── Step 3: Confirm Order ────────────────────────────────────────────────────
const Step3: React.FC<{
    details: BuyerDetails;
    quantity: number;
    photos: File[];
    onBack: () => void;
    onNext: () => void;
}> = ({ details, quantity, photos, onBack, onNext }) => {
    const total = quantity * PRICE_PER_FRAME;
    const previews = photos.map(f => URL.createObjectURL(f));

    return (
        <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#3d1f0d", marginBottom: 20, fontWeight: 600 }}>
                Confirm Order
            </h2>

            {/* Details summary */}
            <div style={{
                border: "1px solid #d4a574", borderRadius: 10, overflow: "hidden",
                background: "#fffdf9", boxShadow: "0 2px 12px rgba(107,58,31,0.08)", marginBottom: 20,
            }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0e6d6" }}>
                    {[
                        { label: "Name", value: details.name },
                        { label: "Roll Number", value: details.rollNumber },
                        { label: "Mobile", value: details.mobile },
                        { label: "Email", value: details.email },
                    ].map(row => (
                        <div key={row.label} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "7px 0", borderBottom: "1px solid #f0e6d6",
                        }}>
                            <span style={{ fontSize: "0.82rem", color: "#a07850", fontWeight: 600 }}>{row.label}</span>
                            <span style={{ fontSize: "0.88rem", color: "#3d1f0d" }}>{row.value}</span>
                        </div>
                    ))}
                </div>

                <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <span style={{ fontSize: "0.82rem", color: "#a07850", fontWeight: 600 }}>Frames</span>
                        <p style={{ margin: "2px 0 0", fontSize: "0.88rem", color: "#3d1f0d" }}>
                            {quantity} × ₹{PRICE_PER_FRAME}
                        </p>
                    </div>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: "#6b3a1f" }}>
                        ₹{total}
                    </span>
                </div>
            </div>

            {/* Photo thumbnails */}
            <p style={{ fontFamily: "'Lora', serif", fontSize: "0.88rem", color: "#6b3a1f", marginBottom: 10, fontWeight: 600 }}>
                Your Photos ({quantity})
            </p>
            <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(quantity, 3)}, 1fr)`,
                gap: 8, marginBottom: 16,
            }}>
                {previews.map((src, i) => (
                    <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden" }}>
                        <img src={src} alt={`Frame ${i + 1}`}
                            style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                        <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0,
                            background: "rgba(107,58,31,0.65)", padding: "3px 6px",
                        }}>
                            <span style={{ color: "#faf7f2", fontSize: "0.68rem", fontFamily: "'Lora', serif" }}>
                                Frame {i + 1}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ fontSize: "0.78rem", color: "#a07850", textAlign: "center" }}>
                Review carefully — you cannot edit after this step.
            </p>

            <NavButtons onBack={onBack} onNext={onNext} nextLabel={`Pay ₹${total} →`} />
        </div>
    );
};

// ─── Step 4: Payment ──────────────────────────────────────────────────────────
const Step4: React.FC<{
    details: BuyerDetails;
    quantity: number;
    photos: File[];
    onBack: () => void;
    onSuccess: (orderId: string) => void;
}> = ({ details, quantity, photos, onBack, onSuccess }) => {
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [paymentPreview, setPaymentPreview] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitProgress, setSubmitProgress] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);
    const total = quantity * PRICE_PER_FRAME;

    const handlePaymentFile = (f: File) => {
        if (!f.type.startsWith("image/")) { setError("Please upload an image screenshot"); return; }
        setError("");
        setPaymentProof(f);
        const reader = new FileReader();
        reader.onload = e => setPaymentPreview(e.target?.result as string);
        reader.readAsDataURL(f);
    };

    const handleSubmit = async () => {
        if (!paymentProof) { setError("Please upload your payment screenshot"); return; }
        setSubmitting(true);
        setError("");

        try {
            // 1. Generate a shared batch/group ID for all frames in this order
            const batchId = crypto.randomUUID();

            // 2. Upload payment proof once (shared across all frames)
            setSubmitProgress("Uploading payment proof...");
            const proofExt = paymentProof.name.split(".").pop() || "jpg";
            const proofPath = `payment-proofs/${batchId}.${proofExt}`;
            const { error: proofErr } = await supabase.storage
                .from("merch-uploads")
                .upload(proofPath, paymentProof, { contentType: paymentProof.type });
            if (proofErr) throw new Error("Failed to upload payment proof: " + proofErr.message);
            const { data: proofUrlData } = supabase.storage.from("merch-uploads").getPublicUrl(proofPath);

            // 3. Upload each frame photo + insert a row per frame, all sharing the batchId
            const rows: any[] = [];
            for (let i = 0; i < photos.length; i++) {
                setSubmitProgress(`Uploading photo ${i + 1} of ${photos.length}...`);
                const photo = photos[i];
                const photoExt = photo.name.split(".").pop() || "jpg";
                const photoPath = `product-photos/${batchId}-frame-${i + 1}.${photoExt}`;

                const { error: photoErr } = await supabase.storage
                    .from("merch-uploads")
                    .upload(photoPath, photo, { contentType: photo.type });
                if (photoErr) throw new Error(`Failed to upload photo ${i + 1}: ${photoErr.message}`);

                const { data: photoUrlData } = supabase.storage.from("merch-uploads").getPublicUrl(photoPath);

                rows.push({
                    id: crypto.randomUUID(),          // unique row ID per frame
                    batch_id: batchId,               // shared across all frames in this order
                    frame_index: i + 1,              // 1-based frame number
                    buyer_name: details.name,
                    roll_number: details.rollNumber,
                    mobile: details.mobile,
                    email: details.email,
                    photo_url: photoUrlData.publicUrl,
                    payment_proof_url: proofUrlData.publicUrl,
                    amount: PRICE_PER_FRAME,         // per-frame amount
                    total_amount: total,             // total for the whole batch
                    quantity: quantity,              // total frames in batch
                    status: "pending",
                });
            }

            // 4. Batch insert all frame rows
            setSubmitProgress("Saving your order...");
            const { error: insertErr } = await (supabase
                .from("merch_orders")
                .insert(rows) as any);
            if (insertErr) throw new Error("Failed to save order: " + insertErr.message);

            onSuccess(batchId);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            setSubmitting(false);
            setSubmitProgress("");
        }
    };

    return (
        <div>
            {submitting && <JampotLoader message={submitProgress || "Placing your order..."} />}

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#3d1f0d", marginBottom: 6, fontWeight: 600 }}>
                Payment
            </h2>
            <p style={{ color: "#7a5c3c", fontSize: "0.88rem", marginBottom: 20 }}>
                Scan the QR code and pay <strong style={{ color: "#6b3a1f" }}>₹{total}</strong> via UPI
                &nbsp;({quantity} frame{quantity > 1 ? "s" : ""} × ₹{PRICE_PER_FRAME})
            </p>

            {/* QR Code */}
            <div style={{
                background: "#fffdf9", border: "1px solid #d4a574",
                borderRadius: 12, padding: 24, textAlign: "center", marginBottom: 24,
            }}>
                {/* Replace the div below with:
            import qrImage from "@/assets/merch-qr.png";
            <img src={qrImage} alt="UPI QR" style={{ width: 200, height: 200, objectFit: "contain" }} />
        */}
                <div style={{
                    width: 200, height: 200, margin: "0 auto 12px",
                    border: "1px solid #e8c49a", borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#fff", flexDirection: "column", gap: 8,
                    fontSize: "0.78rem", color: "#a07850",
                }}>
                    <img src={qrImage} alt="UPI QR" style={{ width: 200, height: 200, objectFit: "contain" }} />
                </div>

                <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#3d1f0d", fontWeight: 700 }}>
                    ₹{total}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#a07850" }}>
                    Café Jampot · UPI · {quantity} frame{quantity > 1 ? "s" : ""}
                </p>
            </div>

            {/* Payment screenshot upload */}
            <div style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: "#6b3a1f", marginBottom: 10, fontWeight: 500 }}>
                    Upload Payment Screenshot
                </p>
                <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                        border: `2px dashed ${paymentProof ? "#6b3a1f" : "#c4956a"}`,
                        borderRadius: 8, cursor: "pointer",
                        padding: paymentProof ? 12 : "24px 20px",
                        textAlign: "center", background: "#fffdf9", transition: "all 0.2s",
                    }}
                >
                    {paymentPreview ? (
                        <div>
                            <img src={paymentPreview} alt="Proof"
                                style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 6, objectFit: "contain" }} />
                            <p style={{ margin: "8px 0 0", fontSize: "0.76rem", color: "#a07850" }}>Click to replace</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🧾</div>
                            <p style={{ fontFamily: "'Lora', serif", color: "#6b3a1f", margin: 0, fontSize: "0.9rem" }}>
                                Upload payment screenshot
                            </p>
                            <p style={{ color: "#a07850", fontSize: "0.76rem", margin: "4px 0 0" }}>JPG or PNG</p>
                        </>
                    )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handlePaymentFile(f); }} />
            </div>

            {error && (
                <div style={{
                    background: "#fef0f0", border: "1px solid #f5c6cb",
                    borderRadius: 6, padding: "10px 14px", marginBottom: 12,
                }}>
                    <p style={{ margin: 0, color: "#c0392b", fontSize: "0.85rem" }}>{error}</p>
                </div>
            )}

            <NavButtons
                onBack={onBack}
                onNext={handleSubmit}
                nextLabel={`Place Order — ₹${total} 🛍️`}
                nextDisabled={!paymentProof}
                loading={submitting}
            />
        </div>
    );
};

// ─── Root component ───────────────────────────────────────────────────────────
const MerchOrder: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const TOTAL_STEPS = 4;

    const [details, setDetails] = useState<BuyerDetails>({ name: "", rollNumber: "", mobile: "", email: "" });
    const [quantity, setQuantity] = useState(1);
    const [photos, setPhotos] = useState<(File | null)[]>([null]);

    // Keep photos array length in sync with quantity
    const handleQtyChange = (q: number) => {
        setQuantity(q);
        setPhotos(prev => {
            const updated = [...prev];
            while (updated.length < q) updated.push(null);
            return updated.slice(0, q); // trim if reducing
        });
    };

    const handleSuccess = (batchId: string) => {
        navigate("/merch/success", {
            state: {
                orderId: batchId,
                details,
                quantity,
                total: quantity * PRICE_PER_FRAME,
            },
        });
    };

    const cardStyle: React.CSSProperties = {
        background: "#fffdf9",
        border: "1px solid rgba(180,140,100,0.25)",
        borderRadius: 14,
        padding: "32px 28px",
        maxWidth: 560,
        width: "100%",
        boxShadow: "0 4px 24px rgba(107,58,31,0.08)",
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        @keyframes jampot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.88); }
        }
        body { margin: 0; }
      `}</style>

            <div style={{
                minHeight: "100vh", backgroundColor: "#faf7f2",
                fontFamily: "'Lora', serif",
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "40px 16px 60px",
            }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <button onClick={() => navigate("/merch")} style={{ background: "none", border: "none", cursor: "pointer", display: "block", margin: "0 auto 12px" }}>
                        <img src={jampotLogo} alt="Café Jampot" style={{ width: 52, height: 52, objectFit: "contain" }} />
                    </button>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "#3d1f0d", margin: 0, fontWeight: 700 }}>
                        Order Fridge Magnets
                    </h1>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#a07850", margin: "6px 0 0", fontSize: "0.95rem" }}>
                        One last sweet memory
                    </p>
                </div>

                <StepIndicator current={step} total={TOTAL_STEPS} />

                <div style={cardStyle}>
                    {step === 1 && (
                        <Step1
                            details={details}
                            quantity={quantity}
                            onChange={setDetails}
                            onQtyChange={handleQtyChange}
                            onNext={() => setStep(2)}
                        />
                    )}
                    {step === 2 && (
                        <Step2
                            quantity={quantity}
                            photos={photos}
                            onPhotos={setPhotos}
                            onBack={() => setStep(1)}
                            onNext={() => setStep(3)}
                        />
                    )}
                    {step === 3 && photos.every(Boolean) && (
                        <Step3
                            details={details}
                            quantity={quantity}
                            photos={photos as File[]}
                            onBack={() => setStep(2)}
                            onNext={() => setStep(4)}
                        />
                    )}
                    {step === 4 && photos.every(Boolean) && (
                        <Step4
                            details={details}
                            quantity={quantity}
                            photos={photos as File[]}
                            onBack={() => setStep(3)}
                            onSuccess={handleSuccess}
                        />
                    )}
                </div>

                <button
                    onClick={() => navigate("/merch")}
                    style={{ marginTop: 24, background: "none", border: "none", color: "#a07850", fontFamily: "'Lora', serif", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
                >
                    ← Back to home
                </button>
            </div>
        </>
    );
};

export default MerchOrder;