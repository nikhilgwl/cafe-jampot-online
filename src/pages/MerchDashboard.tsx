import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    LogOut,
    Settings,
    Search,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    X,
    ArrowLeft,
    ShoppingBag,
    IndianRupee,
    ImageDown,
    RefreshCw,
    ZoomIn,
    ChevronDown,
    ChevronUp,
    Layers,
} from "lucide-react";
import jampotLogo from "@/assets/jampot-logo.png";
import { format, parseISO } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MerchFrame {
    id: string;
    batch_id: string;
    frame_index: number;
    buyer_name: string;
    roll_number: string;
    mobile: string;
    email: string;
    photo_url: string;
    payment_proof_url: string;
    amount: number;
    total_amount: number;
    quantity: number;
    status: OrderStatus;
    created_at: string;
}

// A "batch" is one checkout — potentially multiple frames
interface MerchBatch {
    batch_id: string;
    buyer_name: string;
    roll_number: string;
    mobile: string;
    email: string;
    payment_proof_url: string; // same for all frames in a batch
    total_amount: number;
    quantity: number;
    created_at: string;
    // Derived from frames
    status: OrderStatus;       // "mixed" if frames differ, else unified
    frames: MerchFrame[];
}

type OrderStatus = "pending" | "verified" | "rejected" | "delivered";

const STATUS_CFG: Record<OrderStatus, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200", icon: <Clock className="w-3 h-3" /> },
    verified: { label: "Verified", bg: "bg-green-100", text: "text-green-800", border: "border-green-200", icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-800", border: "border-red-200", icon: <XCircle className="w-3 h-3" /> },
    delivered: { label: "Delivered", bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", icon: <CheckCircle2 className="w-3 h-3" /> },
};

const StatusBadge: React.FC<{ status: OrderStatus; mixed?: boolean }> = ({ status, mixed }) => {
    const cfg = STATUS_CFG[status];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {cfg.icon}
            {mixed ? "Mixed" : cfg.label}
        </span>
    );
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox: React.FC<{ src: string; label: string; onClose: () => void }> = ({ src, label, onClose }) => (
    <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
    >
        <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-white text-sm opacity-80">{label}</span>
                <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>
            <img src={src} alt={label} className="w-full rounded-xl shadow-2xl" style={{ maxHeight: "80vh", objectFit: "contain" }} />
        </div>
    </div>
);

// ─── Batch Detail Panel ───────────────────────────────────────────────────────
const BatchPanel: React.FC<{
    batch: MerchBatch;
    onClose: () => void;
    onStatusChange: (batchId: string, status: OrderStatus) => Promise<void>;
}> = ({ batch, onClose, onStatusChange }) => {
    const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
    const [updating, setUpdating] = useState(false);

    const shortId = batch.batch_id.slice(0, 8).toUpperCase();
    const allSameStatus = batch.frames.every(f => f.status === batch.frames[0].status);
    const batchStatus = allSameStatus ? batch.frames[0].status : "pending";
    const isMixed = !allSameStatus;

    const handleStatus = async (status: OrderStatus) => {
        setUpdating(true);
        await onStatusChange(batch.batch_id, status);
        setUpdating(false);
    };

    return (
        <>
            {lightbox && <Lightbox src={lightbox.src} label={lightbox.label} onClose={() => setLightbox(null)} />}

            <div
                className="fixed inset-0 z-50 flex items-center justify-end"
                style={{ background: "rgba(0,0,0,0.4)" }}
                onClick={onClose}
            >
                <div
                    className="relative h-full w-full max-w-lg bg-background shadow-2xl overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b bg-background/95 backdrop-blur-sm">
                        <div>
                            <p className="text-xs text-muted-foreground font-mono">Batch #{shortId}</p>
                            <h2 className="font-semibold text-base leading-tight">{batch.buyer_name}</h2>
                            <p className="text-xs text-muted-foreground">{batch.quantity} frame{batch.quantity > 1 ? "s" : ""} · ₹{batch.total_amount}</p>
                        </div>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-5 space-y-5">

                        {/* Current status + date */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <StatusBadge status={batchStatus} mixed={isMixed} />
                            <span className="text-xs text-muted-foreground">
                                {format(parseISO(batch.created_at), "dd MMM yyyy, HH:mm")}
                            </span>
                            {isMixed && (
                                <span className="text-xs text-amber-600 font-medium">
                                    ⚠ Frames have different statuses
                                </span>
                            )}
                        </div>

                        {/* Buyer info */}
                        <div className="rounded-lg border bg-muted/30 divide-y text-sm">
                            {[
                                { label: "Name", value: batch.buyer_name },
                                { label: "Roll Number", value: batch.roll_number },
                                { label: "Mobile", value: batch.mobile },
                                { label: "Email", value: batch.email },
                                { label: "Frames", value: `${batch.quantity} × ₹150` },
                                { label: "Total", value: `₹${batch.total_amount}` },
                            ].map(r => (
                                <div key={r.label} className="flex justify-between items-center px-4 py-2.5">
                                    <span className="text-muted-foreground font-medium w-28 shrink-0">{r.label}</span>
                                    <span className="text-right break-all">{r.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Payment proof */}
                        <div>
                            <p className="text-sm font-semibold mb-2">Payment Screenshot</p>
                            <div
                                className="relative rounded-lg overflow-hidden border cursor-zoom-in group"
                                style={{ height: 180 }}
                                onClick={() => setLightbox({ src: batch.payment_proof_url, label: `Payment Proof — Batch #${shortId}` })}
                            >
                                <img src={batch.payment_proof_url} alt="Payment proof"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>

                        {/* All frames */}
                        <div>
                            <p className="text-sm font-semibold mb-3">
                                Print Photos — {batch.quantity} Frame{batch.quantity > 1 ? "s" : ""}
                            </p>
                            <div className="space-y-3">
                                {batch.frames.map(frame => (
                                    <div key={frame.id} className="border rounded-lg overflow-hidden">
                                        {/* Frame header */}
                                        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                Frame {frame.frame_index}
                                            </span>
                                            <StatusBadge status={frame.status} />
                                        </div>
                                        {/* Photo */}
                                        <div
                                            className="relative cursor-zoom-in group"
                                            style={{ height: 160 }}
                                            onClick={() => setLightbox({
                                                src: frame.photo_url,
                                                label: `Frame ${frame.frame_index} — ${batch.buyer_name}`,
                                            })}
                                        >
                                            <img src={frame.photo_url} alt={`Frame ${frame.frame_index}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                        {/* Download link */}
                                        <div className="px-3 py-2">
                                            <a
                                                href={frame.photo_url}
                                                download={`${batch.batch_id}_${batch.buyer_name.replace(/\s+/g, "_")}_${batch.roll_number}_frame${frame.frame_index}of${batch.quantity}.jpg`}
                                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                            >
                                                <Download className="w-3 h-3" /> Download frame {frame.frame_index}
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bulk status update — applies to ALL frames in this batch */}
                        <div>
                            <p className="text-sm font-semibold mb-1">Update Status</p>
                            <p className="text-xs text-muted-foreground mb-3">
                                Applies to all {batch.quantity} frame{batch.quantity > 1 ? "s" : ""} in this order at once.
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {(["pending", "verified", "rejected", "delivered"] as OrderStatus[]).map(s => {
                                    const cfg = STATUS_CFG[s];
                                    const isActive = !isMixed && batchStatus === s;
                                    return (
                                        <button
                                            key={s}
                                            disabled={isActive || updating}
                                            onClick={() => handleStatus(s)}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all
                        ${isActive
                                                    ? `${cfg.bg} ${cfg.text} ${cfg.border} opacity-70 cursor-default`
                                                    : "border-border hover:bg-muted cursor-pointer"
                                                }`}
                                        >
                                            {cfg.icon}
                                            {updating ? "..." : cfg.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string }> = ({
    icon, label, value, sub, color = "text-primary",
}) => (
    <Card>
        <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
                </div>
                <div className={`p-2 rounded-lg bg-muted ${color}`}>{icon}</div>
            </div>
        </CardContent>
    </Card>
);

// ─── Batch Row (expandable) ───────────────────────────────────────────────────
const BatchRow: React.FC<{
    batch: MerchBatch;
    onOpen: () => void;
}> = ({ batch, onOpen }) => {
    const [expanded, setExpanded] = useState(false);
    const shortId = batch.batch_id.slice(0, 8).toUpperCase();
    const allSameStatus = batch.frames.every(f => f.status === batch.frames[0].status);
    const batchStatus = allSameStatus ? batch.frames[0].status : "pending";
    const isMixed = !allSameStatus;

    return (
        <>
            {/* Main batch row */}
            <tr
                className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={onOpen}
            >
                {/* Batch ID */}
                <td className="px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground">#{shortId}</span>
                </td>

                {/* Buyer */}
                <td className="px-4 py-3">
                    <p className="font-medium text-sm">{batch.buyer_name}</p>
                    <p className="text-xs text-muted-foreground">{batch.roll_number}</p>
                </td>

                {/* Contact */}
                <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs">{batch.mobile}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">{batch.email}</p>
                </td>

                {/* Frames */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                        {batch.quantity > 1 && <Layers className="w-3.5 h-3.5 text-muted-foreground" />}
                        <span className="text-sm font-medium">{batch.quantity}</span>
                        {batch.quantity > 1 && (
                            <button
                                onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                                title={expanded ? "Collapse frames" : "Expand frames"}
                            >
                                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                        )}
                    </div>
                </td>

                {/* Photo thumbnails */}
                <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex gap-1">
                        {batch.frames.slice(0, 3).map(f => (
                            <img
                                key={f.id}
                                src={f.photo_url}
                                alt=""
                                className="w-9 h-9 rounded object-cover border"
                                onClick={e => { e.stopPropagation(); onOpen(); }}
                            />
                        ))}
                        {batch.frames.length > 3 && (
                            <div className="w-9 h-9 rounded border bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                                +{batch.frames.length - 3}
                            </div>
                        )}
                    </div>
                </td>

                {/* Payment proof thumb */}
                <td className="px-4 py-3 hidden sm:table-cell">
                    <img
                        src={batch.payment_proof_url}
                        alt="proof"
                        className="w-9 h-9 rounded object-cover border"
                        onClick={e => { e.stopPropagation(); onOpen(); }}
                    />
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                    <StatusBadge status={batchStatus} mixed={isMixed} />
                </td>

                {/* Amount */}
                <td className="px-4 py-3 hidden md:table-cell text-right">
                    <span className="font-semibold text-sm">₹{batch.total_amount}</span>
                    {batch.quantity > 1 && (
                        <p className="text-[10px] text-muted-foreground">{batch.quantity} × ₹150</p>
                    )}
                </td>

                {/* Date */}
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground whitespace-nowrap">
                    {format(parseISO(batch.created_at), "dd MMM, HH:mm")}
                </td>
            </tr>

            {/* Expanded frame rows */}
            {expanded && batch.frames.map(frame => (
                <tr key={frame.id} className="border-b bg-muted/20 text-xs">
                    <td className="px-4 py-2 pl-8 text-muted-foreground font-mono">
                        ↳ Frame {frame.frame_index}
                    </td>
                    <td className="px-4 py-2" colSpan={2} />
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2 hidden sm:table-cell">
                        <img src={frame.photo_url} alt="" className="w-8 h-8 rounded object-cover border" />
                    </td>
                    <td className="px-4 py-2 hidden sm:table-cell" />
                    <td className="px-4 py-2">
                        <StatusBadge status={frame.status} />
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell text-right text-muted-foreground">
                        ₹{frame.amount}
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell" />
                </tr>
            ))}
        </>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const MerchDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [frames, setFrames] = useState<MerchFrame[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<MerchBatch | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
    const [downloading, setDownloading] = useState(false);

    // ── Auth guard ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const guard = async (userId: string) => {
            const [{ data: isStaff }, { data: isAdmin }] = await Promise.all([
                supabase.rpc("has_role", { _user_id: userId, _role: "staff" }),
                supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
            ]);
            if (!isStaff && !isAdmin) {
                toast({ title: "Access Denied", variant: "destructive" });
                navigate("/auth");
            } else {
                loadFrames();
            }
        };
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) navigate("/auth");
            else guard(session.user.id);
        });
    }, []);

    // ── Load all frame rows from DB ─────────────────────────────────────────────
    const loadFrames = async () => {
        setLoading(true);
        const { data, error } = await (supabase
            .from("merch_orders")
            .select("*")
            .order("created_at", { ascending: false }) as any);

        if (error) {
            toast({ title: "Error loading orders", description: error.message, variant: "destructive" });
        } else {
            setFrames((data as MerchFrame[]) || []);
        }
        setLoading(false);
    };

    // ── Group frames into batches ───────────────────────────────────────────────
    const batches: MerchBatch[] = useMemo(() => {
        const map = new Map<string, MerchBatch>();

        // Frames are ordered desc by created_at so the first one we see per batch_id is the latest
        for (const frame of frames) {
            if (!map.has(frame.batch_id)) {
                map.set(frame.batch_id, {
                    batch_id: frame.batch_id,
                    buyer_name: frame.buyer_name,
                    roll_number: frame.roll_number,
                    mobile: frame.mobile,
                    email: frame.email,
                    payment_proof_url: frame.payment_proof_url,
                    total_amount: frame.total_amount,
                    quantity: frame.quantity,
                    created_at: frame.created_at,
                    status: frame.status,
                    frames: [],
                });
            }
            map.get(frame.batch_id)!.frames.push(frame);
        }

        // Sort frames within each batch by frame_index
        const result = Array.from(map.values());
        result.forEach(b => b.frames.sort((a, b) => a.frame_index - b.frame_index));

        // Compute batch-level status
        result.forEach(b => {
            const statuses = new Set(b.frames.map(f => f.status));
            b.status = statuses.size === 1 ? [...statuses][0] : "pending";
        });

        return result;
    }, [frames]);

    // ── Filter batches ──────────────────────────────────────────────────────────
    const filteredBatches = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return batches.filter(b => {
            const matchesSearch = !q || [b.buyer_name, b.roll_number, b.mobile, b.email, b.batch_id]
                .some(f => f.toLowerCase().includes(q));
            const allSame = b.frames.every(f => f.status === b.frames[0].status);
            const bStatus = allSame ? b.frames[0].status : "pending";
            const matchesStatus = statusFilter === "all" || bStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [batches, searchQuery, statusFilter]);

    // ── Stats ───────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const nonRejected = batches.filter(b => {
            const allSame = b.frames.every(f => f.status === b.frames[0].status);
            return !allSame || b.frames[0].status !== "rejected";
        });

        return {
            totalBatches: batches.length,
            totalFrames: frames.length,
            pending: batches.filter(b => b.frames.some(f => f.status === "pending")).length,
            verified: batches.filter(b => b.frames.every(f => f.status === "verified")).length,
            delivered: batches.filter(b => b.frames.every(f => f.status === "delivered")).length,
            revenue: nonRejected.reduce((s, b) => s + b.total_amount, 0),
        };
    }, [batches, frames]);

    // ── Update ALL frames in a batch to the same status ─────────────────────────
    const handleStatusChange = async (batchId: string, status: OrderStatus) => {
        const { error } = await (supabase
            .from("merch_orders")
            .update({ status })
            .eq("batch_id", batchId) as any);

        if (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        } else {
            setFrames(prev => prev.map(f => f.batch_id === batchId ? { ...f, status } : f));
            if (selectedBatch?.batch_id === batchId) {
                setSelectedBatch(prev => prev
                    ? { ...prev, status, frames: prev.frames.map(f => ({ ...f, status })) }
                    : prev
                );
            }
            toast({ title: `All frames marked as ${status}` });
        }
    };

    // ── Build ZIP of all print photos ───────────────────────────────────────────
    const downloadZip = async (targetFrames: MerchFrame[], label: string) => {
        const printable = targetFrames.filter(f => f.status !== "rejected");
        if (printable.length === 0) {
            toast({ title: "No photos to download", description: "All selected frames are rejected." });
            return;
        }

        setDownloading(true);
        toast({ title: `Preparing ${printable.length} photos…` });

        try {
            // Load JSZip from CDN lazily
            if (!(window as any).JSZip) {
                await new Promise<void>((res, rej) => {
                    const s = document.createElement("script");
                    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
                    s.onload = () => res();
                    s.onerror = () => rej(new Error("Failed to load JSZip"));
                    document.head.appendChild(s);
                });
            }

            const JSZip = (window as any).JSZip;
            const zip = new JSZip();
            const folder = zip.folder("merch-print-photos");

            let succeeded = 0;
            let failed = 0;

            await Promise.allSettled(
                printable.map(async frame => {
                    try {
                        const res = await fetch(frame.photo_url);
                        if (!res.ok) throw new Error();
                        const blob = await res.blob();
                        const ext = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
                        const safeName = frame.buyer_name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
                        const frameTag = frame.quantity > 1
                            ? `_frame${frame.frame_index}of${frame.quantity}`
                            : "";
                        const filename = `${frame.batch_id}_${safeName}_${frame.roll_number}${frameTag}.${ext}`;
                        folder.file(filename, blob);
                        succeeded++;
                    } catch {
                        failed++;
                    }
                })
            );

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${label}-${format(new Date(), "yyyy-MM-dd")}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
                title: `Downloaded ${succeeded} photo${succeeded !== 1 ? "s" : ""}`,
                description: failed > 0 ? `${failed} failed to fetch.` : "All photos included.",
            });
        } catch (err: any) {
            toast({ title: "Download failed", description: err.message, variant: "destructive" });
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadAll = () => downloadZip(frames, "merch-all-photos");
    const handleDownloadFiltered = () => {
        const filteredFrames = frames.filter(f =>
            filteredBatches.some(b => b.batch_id === f.batch_id)
        );
        downloadZip(filteredFrames, "merch-filtered-photos");
    };

    // ── Keep selectedBatch in sync with frame updates ───────────────────────────
    const openBatch = (batch: MerchBatch) => {
        // Re-derive from latest frames state so panel always has fresh data
        const freshFrames = frames.filter(f => f.batch_id === batch.batch_id)
            .sort((a, b) => a.frame_index - b.frame_index);
        const allSame = freshFrames.every(f => f.status === freshFrames[0].status);
        setSelectedBatch({
            ...batch,
            frames: freshFrames,
            status: allSame ? freshFrames[0].status : "pending",
        });
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <img src={jampotLogo} alt="" className="w-14 h-14 object-contain animate-pulse" />
                    <p className="text-muted-foreground text-sm">Loading merch orders…</p>
                </div>
            </div>
        );
    }

    const isFiltered = searchQuery.trim() || statusFilter !== "all";
    const filteredFrameCount = frames.filter(f => filteredBatches.some(b => b.batch_id === f.batch_id)).length;

    return (
        <>
            {selectedBatch && (
                <BatchPanel
                    batch={selectedBatch}
                    onClose={() => setSelectedBatch(null)}
                    onStatusChange={handleStatusChange}
                />
            )}

            <div className="min-h-screen bg-background">

                {/* ── Header ── */}
                <header className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                            <img src={jampotLogo} alt="" className="w-9 h-9 object-contain" />
                            <div>
                                <h1 className="font-bold text-base leading-tight">Merch Orders</h1>
                                <p className="text-primary-foreground/60 text-xs">Fridge Magnet Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard")}>
                                <ArrowLeft className="w-4 h-4 mr-1" /> Sales
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => navigate("/admin")}>
                                <Settings className="w-4 h-4 mr-1" /> Admin
                            </Button>
                            <Button
                                variant="outline" size="sm"
                                className="border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100/70"
                                onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))}
                            >
                                <LogOut className="w-4 h-4 mr-1" /> Logout
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto p-4 space-y-5">

                    {/* ── Stats ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                        <StatCard icon={<ShoppingBag className="w-4 h-4" />} label="Orders" value={stats.totalBatches} sub={`${stats.totalFrames} frames`} />
                        <StatCard icon={<Layers className="w-4 h-4" />} label="Total Frames" value={stats.totalFrames} />
                        <StatCard icon={<Clock className="w-4 h-4" />} label="Pending" value={stats.pending} color="text-amber-600" />
                        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Verified" value={stats.verified} color="text-green-600" />
                        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Delivered" value={stats.delivered} color="text-blue-600" />
                        <StatCard icon={<IndianRupee className="w-4 h-4" />} label="Revenue" value={`₹${stats.revenue}`} />
                    </div>

                    {/* ── Controls ── */}
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div className="flex gap-3 flex-1 w-full sm:w-auto">
                                    {/* Search */}
                                    <div className="relative flex-1 max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Name, roll no, mobile…"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>

                                    {/* Status filter */}
                                    <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
                                        <SelectTrigger className="w-36">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="verified">Verified</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <Button variant="outline" size="sm" onClick={loadFrames}>
                                        <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                                    </Button>

                                    {isFiltered && (
                                        <Button variant="outline" size="sm" onClick={handleDownloadFiltered} disabled={downloading}>
                                            <ImageDown className="w-4 h-4 mr-1" />
                                            {downloading ? "Zipping…" : `Download filtered (${filteredFrameCount})`}
                                        </Button>
                                    )}

                                    <Button size="sm" onClick={handleDownloadAll} disabled={downloading} className="gap-1.5">
                                        <Download className="w-4 h-4" />
                                        {downloading ? "Zipping…" : `Download All (${frames.filter(f => f.status !== "rejected").length} photos)`}
                                    </Button>
                                </div>
                            </div>

                            {isFiltered && (
                                <p className="text-xs text-muted-foreground mt-3">
                                    Showing {filteredBatches.length} order{filteredBatches.length !== 1 ? "s" : ""} ({filteredFrameCount} frames) of {batches.length} total
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Orders Table ── */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                Orders
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({filteredBatches.length} order{filteredBatches.length !== 1 ? "s" : ""} · {filteredFrameCount} frame{filteredFrameCount !== 1 ? "s" : ""})
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredBatches.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground">
                                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No orders found</p>
                                    <p className="text-sm mt-1">Try adjusting your search or filter</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/40">
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Batch ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Buyer</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Contact</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Frames</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Photos</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Payment</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground hidden md:table-cell">Amount</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBatches.map(batch => (
                                                <BatchRow
                                                    key={batch.batch_id}
                                                    batch={batch}
                                                    onOpen={() => openBatch(batch)}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ZIP naming info */}
                    <p className="text-xs text-muted-foreground text-center pb-4">
                        ZIP filename format:{" "}
                        <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                            {"<batchId>_<name>_<rollNo>_frame1of3.jpg"}
                        </code>
                        {" "}· Frames from the same order share the same batch ID prefix.
                    </p>
                </main>
            </div>
        </>
    );
};

export default MerchDashboard;