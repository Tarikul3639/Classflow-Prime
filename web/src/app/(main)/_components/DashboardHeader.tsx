"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { ComingSoonDialog } from "@/components/ui/ComingSoonDialog";

const SECOND_COLORS = [
  "text-indigo-500",
  "text-violet-500",
  "text-purple-500",
  "text-pink-500",
  "text-rose-500",
  "text-orange-500",
  "text-amber-500",
  "text-yellow-500",
  "text-lime-500",
  "text-emerald-500",
  "text-teal-500",
  "text-cyan-500",
  "text-sky-500",
  "text-blue-500",
] as const;

function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  const pad = (n: number) => String(n).padStart(2, "0");
  let h = time.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const sec = time.getSeconds();
  const secColor = SECOND_COLORS[sec % SECOND_COLORS.length];
  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-baseline gap-1 select-none">
      {/* Hours */}
      <span className="text-[17px] font-bold tracking-tight text-slate-900 tabular-nums">
        {pad(h)}
      </span>

      {/* Blinking colon — animate-pulse is built-in Tailwind */}
      <span className="text-[17px] font-bold text-primary animate-pulse">
        :
      </span>

      {/* Minutes */}
      <span className="text-[17px] font-bold tracking-tight text-slate-900 tabular-nums">
        {pad(time.getMinutes())}
      </span>

      {/* Seconds — color shifts every second */}
      <span className={"text-[13px] font-semibold tabular-nums ml-0.5 transition-colors duration-700 " + secColor}>
        {pad(sec)}
      </span>

      {/* AM/PM */}
      <span className="text-[11px] font-semibold text-slate-400 ml-0.5">
        {ampm}
      </span>

      {/* Divider */}
      <span className="w-px h-4 bg-slate-200 mx-2 self-center" />

      {/* Date */}
      <span className="text-[11px] font-medium text-slate-400 tracking-wide">
        {dateStr}
      </span>
    </div>
  );
}

export default function DashboardHeader() {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              onClick={() => setShowDialog(true)}
              type="text"
              placeholder="Search classes, updates..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white border border-transparent focus:border-primary/30 transition-all"
            />
          </div>
        </div>

        <div className="flex-1" />

        {/* Live clock */}
        <LiveClock />
      </header>

      {/* Coming soon dialog for search */}
      <ComingSoonDialog feature="Dashboard search" onClose={() => setShowDialog(false)} open={showDialog} />
    </>
  );
}