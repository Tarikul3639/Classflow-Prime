export const ClassHeroSkeleton = () => {
    return (
        <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-sm bg-slate-200 animate-pulse">
            {/* Top row: status badge + members badge */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    {/* Status badge */}
                    <div className="h-6 w-16 rounded-full bg-slate-300" />
                    {/* Members badge */}
                    <div className="h-6 w-24 rounded-lg bg-slate-300" />
                </div>

                <div className="space-y-3">
                    {/* Department + Semester */}
                    <div className="h-3 w-32 rounded-full bg-slate-300" />
                    {/* Class name */}
                    <div className="h-7 w-56 rounded-lg bg-slate-300" />
                    {/* Divider */}
                    <div className="pt-3 border-t border-slate-300 flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-slate-300 shrink-0" />
                        <div className="space-y-1.5">
                            {/* "Instructor" label */}
                            <div className="h-2.5 w-16 rounded-full bg-slate-300" />
                            {/* Instructor name */}
                            <div className="h-3.5 w-28 rounded-full bg-slate-300" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}