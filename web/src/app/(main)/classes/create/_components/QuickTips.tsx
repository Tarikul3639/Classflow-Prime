"use client";

const DEFAULT_TIPS = [
  "Use a clear, descriptive class name",
  "Banner images work best at 1200x400px",
  "Course codes help students identify classes",
];

interface QuickTipsProps {
  tips?: string[];
}

export default function QuickTips({ tips = DEFAULT_TIPS }: QuickTipsProps) {
  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-6">
      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
        <svg
          className="text-primary"
          fill="none"
          height="20"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="20"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        Quick Tips
      </h3>
      <ul className="space-y-2 text-xs text-slate-600">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}