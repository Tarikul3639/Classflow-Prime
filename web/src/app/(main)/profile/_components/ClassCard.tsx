"use client";

export enum ClassStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  UPCOMING = 'upcoming',
}
interface ClassCardProps {
  classId: string;
  className: string;
  themeColor?: string;
  coverImage?: string;
  role: string;
  status: ClassStatus;
  enrolledAt: Date;
}

export default function ClassCard({
  className: name,
  themeColor,
  role,
  status,
  enrolledAt,
}: ClassCardProps) {
  const isEnded = status === ClassStatus.ENDED;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 ${
        isEnded ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          style={{
            backgroundColor: `${themeColor}10`,
            color: `${themeColor}`,
            border: `1px solid ${themeColor}20`,
          }}
          className={`h-10 w-10 rounded-lg flex items-center justify-center font-semibold text-base`}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">{name}</p>
          <p className="text-xs text-slate-500 capitalize">
            {role} •{" "}
            {new Date(enrolledAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
            })}
          </p>
        </div>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
          isEnded
            ? "bg-slate-200 text-slate-600"
            : "bg-green-100 text-green-700"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
