"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export default function ErrorState({
    message = "Something went wrong",
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            {/* Icon */}
            <div className="p-3 rounded-full bg-red-50 border border-red-100 shadow-sm">
                <AlertTriangle className="text-red-500" size={22} />
            </div>

            {/* Message */}
            <p className="text-sm md:text-base text-slate-600 max-w-xs">
                {message}
            </p>

            {/* Retry Button */}
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-primary rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] transition-all active:scale-95 cursor-pointer"
                >
                    <RefreshCw size={14} />
                    Retry
                </button>
            )}
        </div>
    );
}