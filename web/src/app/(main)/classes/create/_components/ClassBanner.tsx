"use client";

import { WandSparkles } from "lucide-react";

interface ClassBannerProps {
  coverImage: string;
  onRegenerate: () => void;
}

export default function ClassBanner({ coverImage, onRegenerate }: ClassBannerProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="relative h-64 w-full group overflow-hidden">
        {coverImage ? (
          <img
            alt="Class Banner Preview"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            src={coverImage}
          />
        ) : (
          <div className="absolute inset-0 bg-slate-100 animate-pulse" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={onRegenerate}
            className="md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <WandSparkles className="size-4 text-sky-300" />
            <span className="text-xs font-medium tracking-wide">
              Regenerate Banner
            </span>
          </button>
        </div>

        <div className="absolute bottom-4 left-4">
          <p className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-widest border border-none">
            AI Preview
          </p>
        </div>
      </div>
    </div>
  );
}