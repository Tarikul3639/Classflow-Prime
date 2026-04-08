"use client";

import React from "react";

export const ClassesSkeleton: React.FC = () => {
    // Generate skeleton cards based on grid
    const skeletonCards = Array.from({ length: 6 });

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="mx-auto px-4 lg:px-8 py-6 relative">
                <main className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] md:grid-cols-[repeat(auto-fit,minmax(300px,300px))] justify-start">
                    {skeletonCards.map((_, index) => (
                        <div
                            key={index}
                            className="group relative rounded-xl overflow-hidden flex flex-col w-full h-full sm:max-w-75 sm:min-w-70 bg-white border border-slate-200"
                            style={{
                                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                            }}
                        >
                            {/* Banner Skeleton */}
                            <div className="relative h-28 sm:h-36 overflow-hidden bg-linear-to-br from-slate-200 to-slate-100 animate-pulse">
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            </div>

                            {/* Content Skeleton */}
                            <div className="relative p-4 flex flex-col flex-1 bg-white gap-3">
                                {/* Title Skeleton - 2 lines */}
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded-md animate-pulse w-full" />
                                    <div className="h-4 bg-slate-200 rounded-md animate-pulse w-3/4" />
                                </div>

                                {/* Instructor Skeleton */}
                                <div className="flex items-center gap-2 ml-1">
                                    {/* Avatar */}
                                    <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse shrink-0" />
                                    <div className="flex flex-col flex-1 gap-1">
                                        <div className="h-3 bg-slate-200 rounded animate-pulse w-12" />
                                        <div className="h-2 bg-slate-200 rounded animate-pulse w-20" />
                                    </div>
                                </div>

                                {/* Spacer */}
                                {/* <div className="flex-1" /> */}

                                {/* Footer Skeleton */}
                                <div className="pt-2 mt-auto flex items-center justify-between border-t border-slate-100">
                                    {/* Students count */}
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-3 bg-slate-200 rounded animate-pulse" />
                                        <div className="h-2 bg-slate-200 rounded animate-pulse w-16" />
                                    </div>
                                    {/* Semester badge */}
                                    <div className="h-4 bg-slate-200 rounded animate-pulse w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
};