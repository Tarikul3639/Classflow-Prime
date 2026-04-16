"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export const RICH_TEXT_STLYES = cn(
    "w-full outline-none text-slate-900 text-[12px] md:text-[13px] leading-relaxed",
    "break-words overflow-wrap-anywhere whitespace-pre-wrap",

    "[&_h1]:text-[13px] [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:my-2",
    "[&_h2]:text-[12px] [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:my-2",
    "[&_h3]:text-[11px] [&_h3]:font-semibold [&_h3]:text-slate-700 [&_h3]:my-1",

    "[&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_s]:line-through",

    "[&_ul]:list-disc [&_ul]:ml-4 md:[&_ul]:ml-5 [&_ul]:my-2",
    "[&_ol]:list-decimal [&_ol]:ml-4 md:[&_ol]:ml-5 [&_ol]:my-2",
    "[&_li]:my-0.5",

    "[&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-3 [&_blockquote]:text-slate-500 [&_blockquote]:italic [&_blockquote]:my-2",
    "[&_code]:bg-slate-100 [&_code]:text-rose-500 [&_code]:text-[12px] [&_code]:font-mono [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded",

    "[&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-700 [&_a]:break-all",
    "[&_hr]:border-slate-100 [&_hr]:my-4",
    "[&_p]:mb-2 last:[&_p]:mb-0"
);

interface Props {
    html: string;
    className?: string;
    maxHeight?: number;
}

export function RichTextContent({
    html,
    className = "",
    maxHeight = 120,
}: Props) {
    const [expanded, setExpanded] = useState(false);
    const [shouldShowButton, setShouldShowButton] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;

        // Check overflow
        const isOverflowing = el.scrollHeight > maxHeight;
        setShouldShowButton(isOverflowing);
    }, [html, maxHeight]);

    return (
        <div className="w-full">
            <div
                ref={contentRef}
                className={cn(
                    RICH_TEXT_STLYES,
                    "transition-all duration-300 overflow-hidden",
                    !expanded && shouldShowButton && "max-h-30",
                    className
                )}
                style={!expanded && shouldShowButton ? { maxHeight } : undefined}
                dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Gradient only if needed */}
            {!expanded && shouldShowButton && (
                <div className="h-8 -mt-8 bg-linear-to-t from-white to-transparent pointer-events-none" />
            )}

            {/* Button only if needed */}
            {shouldShowButton && (
                <button
                    onClick={() => setExpanded((prev) => !prev)}
                    className="text-blue-600 text-xs mt-1 hover:underline cursor-pointer"
                >
                    {expanded ? "Show less" : "Show more"}
                </button>
            )}
        </div>
    );
}