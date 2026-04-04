"use client";

import { Sparkles } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ComingSoonDialogProps {
    open: boolean;
    onClose: () => void;
    feature?: string;
}

export const ComingSoonDialog = ({ open, onClose, feature }: ComingSoonDialogProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 🔒 Lock body scroll when open
    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    if (!open || !mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/30 backdrop-blur-sm px-6"
            onClick={onClose}
            // 🔒 Block all pointer events leaking through
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div
                className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl flex flex-col items-center text-center gap-3"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles size={22} className="text-primary" />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-900">Coming Soon</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {feature ? (
                            <><span className="font-semibold text-slate-700">{feature}</span> is not available yet.</>
                        ) : (
                            "This feature is not available yet."
                        )}{" "}
                        It will be released in the next update.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="mt-1 w-full py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>,
        document.body
    );
};