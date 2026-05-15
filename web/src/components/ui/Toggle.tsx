"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ToggleProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
  enabled?: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export const Toggle = ({
  icon: Icon,
  iconClassName,
  title,
  description,
  enabled = false,
  disabled = false,
  onToggle,
  ...props
}: ToggleProps) => {
  const cn = (...args: Parameters<typeof clsx>) => twMerge(clsx(...args));

  return (
    <div className="py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-1.5 rounded-lg bg-slate-100 text-slate-600",
            disabled ? "bg-slate-200 text-slate-400" : "",
            iconClassName,
          )}
        >
          <Icon size={18} />
        </div>
        <div>
          <p className={`font-semibold text-sm ${disabled ? "text-slate-500" : "text-slate-900"}`}>{title}</p>
          <p className={`text-xs ${disabled ? "text-slate-400" : "text-slate-500"}`}>{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        {...props}
        className={cn(
          "relative inline-flex h-5 w-9 min-h-5 min-w-9 items-center rounded-full cursor-pointer transition-colors duration-200",
          enabled ? "bg-primary" : "bg-slate-300",
          disabled ? "cursor-not-allowed bg-slate-200" : "",
        )}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ${enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
        />
      </button>
    </div>
  );
};
