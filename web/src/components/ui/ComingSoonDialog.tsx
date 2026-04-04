"use client";

import { Sparkles, X } from "lucide-react";

interface ComingSoonDialogProps {
    open: boolean;
    onClose: () => void;
    feature?: string;
}

export const ComingSoonDialog = ({ open, onClose, feature }: ComingSoonDialogProps) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-6"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl flex flex-col items-center text-center gap-3"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles size={22} className="text-primary" />
                </div>

                {/* Text */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Coming Soon</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {feature
                            ? <><span className="font-semibold text-slate-700">{feature}</span> is not available yet.</>
                            : "This feature is not available yet."
                        }{" "}
                        It will be released in the next update.
                    </p>
                </div>

                {/* Close */}
                <button
                    onClick={onClose}
                    className="mt-1 w-full py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}