// DashboardSkeleton.tsx
"use client";

// ── Primitive ──────────────────────────────────────────────────────────────

function Bone({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
    );
}

// ── Header Skeleton ────────────────────────────────────────────────────────

function HeaderSkeleton() {
    return (
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center gap-4">
            {/* Clock */}
            <div className="flex items-baseline gap-1">
                <Bone className="h-5 w-12" />
                <Bone className="h-5 w-1 mx-1" />
                <Bone className="h-5 w-12" />
                <Bone className="h-3.5 w-6 ml-1" />
                <Bone className="h-3 w-6 ml-1" />
                <div className="hidden sm:block w-px h-4 bg-slate-200 mx-2" />
                <Bone className="hidden sm:block h-3 w-20" />
            </div>

            <div className="flex-1" />

            {/* Desktop buttons */}
            <div className="hidden md:flex items-center gap-2">
                <Bone className="h-9 w-24 rounded-lg" />
                <Bone className="h-9 w-24 rounded-lg" />
            </div>

            {/* Mobile buttons */}
            <div className="md:hidden flex items-center gap-2">
                <Bone className="h-10 w-10 rounded-lg" />
                <Bone className="h-10 w-10 rounded-lg" />
            </div>
        </div>
    );
}

// ── Welcome Skeleton ───────────────────────────────────────────────────────

function WelcomeSkeleton() {
    return (
        <div className="px-4 sm:px-6 pt-5 pb-1">
            <div className="bg-slate-200 animate-pulse rounded-2xl px-5 py-5 relative overflow-hidden h-45">
                <div className="flex items-center justify-between mb-3">
                    <Bone className="h-3 w-20 bg-slate-300" />
                    <Bone className="h-5 w-24 rounded-full bg-slate-300" />
                </div>
                <Bone className="h-7 w-48 mb-2 bg-slate-300" />
                <Bone className="h-3 w-64 mb-1 bg-slate-300" />
                <Bone className="h-3 w-48 mb-4 bg-slate-300" />
                <Bone className="h-7 w-28 rounded-full bg-slate-300" />
            </div>
        </div>
    );
}

// ── Stats Skeleton ─────────────────────────────────────────────────────────

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="flex flex-col gap-1 rounded-2xl p-3 sm:p-4 lg:p-5 bg-white shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <Bone className="size-5 rounded" />
                        <Bone className="h-4 w-14 rounded-full" />
                    </div>
                    <Bone className="h-3 w-24 mt-1" />
                    <Bone className="h-8 w-10 mt-1" />
                </div>
            ))}
        </div>
    );
}

// ── Section Header Skeleton ────────────────────────────────────────────────

function SectionHeaderSkeleton({ rightElement = true }: { rightElement?: boolean }) {
    return (
        <div className="px-6 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Bone className="h-5 w-28" />
                <Bone className="h-5 w-7 rounded-full" />
            </div>
            {rightElement && <Bone className="h-5 w-16 rounded-full" />}
        </div>
    );
}

// ── Class Card Skeleton ────────────────────────────────────────────────────

function ClassCardSkeleton() {
    return (
        <div className="relative rounded overflow-hidden bg-white border border-slate-100">
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-slate-200" />

            <div className="pl-5 pr-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Bone className="h-4 w-32" />
                    <Bone className="h-5 w-14 rounded-full" />
                </div>
                <Bone className="h-3 w-24" />
            </div>

            <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Bone className="size-5 rounded-full" />
                    <Bone className="h-3 w-16" />
                </div>
                <div className="flex items-center gap-1">
                    <Bone className="h-3 w-12" />
                </div>
            </div>
        </div>
    );
}

function MyClassesSkeleton() {
    return (
        <section>
            <SectionHeaderSkeleton />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-6 pb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <ClassCardSkeleton key={i} />
                ))}
            </div>
        </section>
    );
}

// ── Update Card Skeleton ───────────────────────────────────────────────────

function UpdateCardSkeleton() {
    return (
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3">
            <Bone className="size-9 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                    <Bone className="h-4 w-16 rounded" />
                    <Bone className="h-3 w-24" />
                </div>
                <Bone className="h-4 w-3/4" />
                <Bone className="h-3 w-full" />
                <Bone className="h-3 w-2/3" />
                <div className="flex items-center gap-3 mt-2">
                    <Bone className="h-3 w-16" />
                    <Bone className="h-3 w-12" />
                    <Bone className="h-3 w-20 ml-auto" />
                </div>
            </div>
        </div>
    );
}

function RecentUpdatesSkeleton() {
    return (
        <section>
            <SectionHeaderSkeleton rightElement={false} />
            <div className="flex flex-col gap-3 px-6 pb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <UpdateCardSkeleton key={i} />
                ))}
            </div>
        </section>
    );
}

// ── Faculty Card Skeleton ──────────────────────────────────────────────────

function FacultyCardSkeleton() {
    return (
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3">
            <Bone className="size-10 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
                <Bone className="h-4 w-32" />
                <Bone className="h-3 w-24" />
                <Bone className="h-3 w-20" />
                <div className="mt-2.5 space-y-1.5">
                    <Bone className="h-3 w-40" />
                    <Bone className="h-3 w-28" />
                    <Bone className="h-5 w-24 rounded" />
                </div>
            </div>
        </div>
    );
}

function FacultySkeleton() {
    return (
        <section>
            <div className="px-6 mb-3">
                <Bone className="h-5 w-20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-6 pb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <FacultyCardSkeleton key={i} />
                ))}
            </div>
        </section>
    );
}

// ── Study Group Card Skeleton ──────────────────────────────────────────────

function GroupCardSkeleton() {
    return (
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
            <Bone className="size-10 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                    <Bone className="h-4 w-32" />
                    <Bone className="h-4 w-14 rounded" />
                </div>
                <Bone className="h-3 w-48" />
                <Bone className="h-3 w-20" />
            </div>
            <Bone className="size-8 rounded-xl shrink-0" />
        </div>
    );
}

function StudyGroupsSkeleton() {
    return (
        <section>
            <SectionHeaderSkeleton rightElement={false} />
            <div className="flex flex-col gap-3 px-6 pb-6">
                {Array.from({ length: 2 }).map((_, i) => (
                    <GroupCardSkeleton key={i} />
                ))}
            </div>
        </section>
    );
}

// ── Main Export ────────────────────────────────────────────────────────────

export default function DashboardSkeleton() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <HeaderSkeleton />
            <main className="flex-1 overflow-y-auto pb-24">
                <WelcomeSkeleton />
                <StatsSkeleton />
                <MyClassesSkeleton />
                <RecentUpdatesSkeleton />
                <FacultySkeleton />
                <StudyGroupsSkeleton />
            </main>
        </div>
    );
}