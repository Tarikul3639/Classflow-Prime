"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface StepSuccessProps {
    onGoToLogin: () => void;
}

export const StepSuccess: React.FC<StepSuccessProps> = ({ onGoToLogin }) => {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onGoToLogin();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [onGoToLogin]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
        >
            {/* Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="mx-auto mb-6 w-20 h-20 bg-linear-to-br from-primary to-primary rounded-full flex items-center justify-center shadow-sm shadow-primary"
            >
                <CheckCircle2 size={40} className="text-white" />
            </motion.div>

            {/* Content */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-[#0f172a] text-lg md:text-xl font-extrabold tracking-tight">
                    Account Created Successfully!
                </h2>

                <p className="text-slate-700 text-xs md:text-sm font-medium mt-2 leading-relaxed max-w-sm mx-auto">
                    Your account has been created successfully. You can now login with your credentials.
                </p>

                <p className="text-slate-400 text-xs mt-4">
                    Redirecting to sign in in{" "}
                    <span className="font-bold text-primary">{countdown}s</span>...
                </p>

                <button
                    onClick={onGoToLogin}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-sm bg-primary text-white text-xs font-semibold shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 hover:scale-101 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                    Go to Sign In
                    <ArrowRight className="size-3.5" />
                </button>
            </motion.div>
        </motion.div>
    );
};