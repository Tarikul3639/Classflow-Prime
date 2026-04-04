export default function DashboardSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Welcome */}
            <div className="px-6 pt-6 pb-2">
                <div className="h-8 w-56 bg-slate-200 rounded-xl mb-2" />
                <div className="h-4 w-80 bg-slate-100 rounded-lg" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl p-5 bg-white border border-slate-100 flex flex-col gap-3">
                        <div className="h-5 w-5 bg-slate-200 rounded-md" />
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                        <div className="h-7 w-10 bg-slate-200 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Section: My Classes */}
            <div className="px-6 mb-3 flex items-center justify-between">
                <div className="h-5 w-28 bg-slate-200 rounded-lg" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-6 pb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-white border border-slate-100">
                        <div className="h-2 w-full bg-slate-200" />
                        <div className="p-4 flex flex-col gap-3">
                            <div className="h-4 w-3/4 bg-slate-200 rounded" />
                            <div className="h-3 w-1/2 bg-slate-100 rounded" />
                            <div className="h-3 w-full bg-slate-100 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Section: Recent Updates */}
            <div className="px-6 mb-3 flex items-center justify-between">
                <div className="h-5 w-36 bg-slate-200 rounded-lg" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
            <div className="flex flex-col gap-3 px-6 pb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3">
                        <div className="size-9 rounded-xl bg-slate-100 shrink-0" />
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="h-3 w-1/3 bg-slate-200 rounded" />
                            <div className="h-4 w-3/4 bg-slate-200 rounded" />
                            <div className="h-3 w-full bg-slate-100 rounded" />
                            <div className="h-3 w-2/3 bg-slate-100 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Section: Faculty */}
            <div className="px-6 mb-3 flex items-center justify-between">
                <div className="h-5 w-20 bg-slate-200 rounded-lg" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-6 pb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-slate-200 shrink-0" />
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="h-4 w-3/4 bg-slate-200 rounded" />
                            <div className="h-3 w-1/2 bg-slate-100 rounded" />
                            <div className="h-3 w-2/3 bg-slate-100 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Section: Study Groups */}
            <div className="px-6 mb-3 flex items-center justify-between">
                <div className="h-5 w-28 bg-slate-200 rounded-lg" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
            <div className="flex flex-col gap-3 px-6 pb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-slate-100 shrink-0" />
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="h-4 w-1/2 bg-slate-200 rounded" />
                            <div className="h-3 w-3/4 bg-slate-100 rounded" />
                        </div>
                        <div className="size-8 rounded-xl bg-slate-100 shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}