"use client";

import Link from "next/link";
import { ArrowLeft, Share2, SquarePen, Users } from "lucide-react";
import { usePathname, useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { ClassHeroSkeleton } from "./ClassHeroSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { fetchSingleClass } from "@/store/features/classes/thunks/fetch-single-class.thunk";
import { fetchClassSettings } from "@/store/features/classes/thunks/settings/class-setting.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

export default function ClassLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();
    const classId = params.classId as string;

    const dispatch = useAppDispatch();

    // ── Class Details ──────────────────────────────────────────────────────

    const classState = useAppSelector(
        (state) => state.classes.fetchSingleClass.classesByClassId[classId],
    );

    const classDetails = classState?.classDetails;
    const isLoading = classState?.fetch?.loading ?? false;
    const isAdmin = !!classDetails?.isInstructor || !!classDetails?.isAssistant;

    // ── Class Settings (for invite link) ───────────────────────────────────

    const classCode = useAppSelector(
        (state) => state.classes.classSettings.actionsByClass[classId]?.classCode,
    );

    // ── Initialization ─────────────────────────────────────────────────────

    useEffect(() => {
        if (classId && classId !== "undefined") {
            dispatch(fetchSingleClass(classId))
                .unwrap()
                .catch((err) => {
                    console.error("Error fetching class details:", err);
                    toast.error("Failed to load class details", {
                        description: err.message,
                    });
                    router.replace("/404");
                });
        }
    }, [classId, dispatch, router]);

    useEffect(() => {
        if (classId && isAdmin) {
            dispatch(fetchClassSettings(classId));
        }
    }, [classId, isAdmin, dispatch]);

    // ── Tabs ───────────────────────────────────────────────────────────────

    const tabs = [
        {
            id: "updates",
            label: "Updates",
            href: `/classes/${params.classId}/updates`,
        },
        {
            id: "faculty",
            label: "Faculty",
            href: `/classes/${params.classId}/faculty`,
        },
        {
            id: "routine",
            label: "Routine",
            href: `/classes/${params.classId}/routine`,
        },
        {
            id: "groups",
            label: "Groups",
            href: `/classes/${params.classId}/groups`,
        },
        {
            id: "members",
            label: "Members",
            href: `/classes/${params.classId}/members`,
        },
        {
            id: "settings",
            label: "Settings",
            href: `/classes/${params.classId}/settings`,
        },
    ];

    const isActiveTab = (href: string) => pathname === href;
    const loading = isLoading || !classDetails?.classId;

    // ── Handlers ───────────────────────────────────────────────────────────

    const handleShare = async () => {
        if (!classCode) {
            toast.error("Class code not available. Please try again.");
            return;
        }

        const url = `${window.location.origin}/classes/enroll?code=${classCode}`;

        if (navigator.share) {
            await navigator.share({
                title: "Join my class",
                text: "Use this link to join the class",
                url,
            });
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("Invite link copied!");
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Sticky Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 md:px-8 py-3">
                <div className="flex items-center justify-between mx-auto">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.replace("/classes")}
                            className="group flex items-center justify-center p-2 rounded-lg hover:bg-white transition-colors border border-slate-200 bg-white cursor-pointer hover:border-primary/30"
                        >
                            <ArrowLeft
                                className="text-slate-900 group-hover:text-primary group-hover:-translate-x-0.5 transition-all duration-200"
                                size={18}
                            />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900">Class Details</h1>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={handleShare}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                            <Share2 className="text-slate-600" size={20} />
                        </button>
                    )}
                </div>
            </header>

            {/* Class Info Card - Hero Style */}
            <div className="p-2 md:p-3 lg:p-4 mx-auto w-full">
                {loading ? (
                    <ClassHeroSkeleton />
                ) : (
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-lg">
                        {/* Banner */}
                        <Avatar className="absolute inset-0 w-full h-full object-cover rounded-none">
                            <AvatarImage
                                className="object-cover"
                                src={classDetails?.coverImage || undefined}
                                alt={classDetails?.className || "Class Cover Image"}
                            />
                            <AvatarFallback
                                className="rounded-none w-full h-full text-4xl font-bold tracking-widest flex items-center justify-center uppercase"
                                style={{
                                    backgroundColor: `${classDetails?.themeColor}`,
                                    color: classDetails?.themeColor,
                                }}
                            >
                                {classDetails?.className
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </AvatarFallback>
                        </Avatar>

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-black/30" />

                        {/* Concentric rings effect */}
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            viewBox="0 0 200 144"
                            preserveAspectRatio="none"
                        >
                            <circle cx="170" cy="-10" r="100" fill="rgba(255,255,255,0.07)" />
                            <circle cx="170" cy="-10" r="70" fill="rgba(255,255,255,0.06)" />
                            <circle cx="170" cy="-10" r="40" fill="rgba(255,255,255,0.06)" />
                        </svg>

                        <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                            <div className="flex justify-between items-start">
                                <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-white/20 backdrop-blur-md uppercase tracking-wider">
                                    {classDetails?.status === "active" ? "Active" : "Archived"}
                                </span>
                                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
                                    <Users size={14} />
                                    <span className="text-xs font-semibold">
                                        {classDetails?.members} Members
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-100 text-xs font-bold uppercase tracking-widest mb-1">
                                    {classDetails?.department}.{classDetails?.semester}
                                </p>
                                <h2 className="text-2xl font-extrabold mb-4 leading-tight">
                                    {classDetails?.className}
                                </h2>
                                <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                                    <Avatar className="w-10 h-10 rounded-full ring-2 ring-white/30">
                                        <AvatarImage
                                            src={classDetails?.avatarUrl || undefined}
                                            alt={classDetails?.instructor || "Instructor Avatar"}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="w-full h-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white">
                                            {classDetails?.instructor
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs text-gray-50 font-medium">Instructor</p>
                                        <p className="text-sm font-bold">{classDetails?.instructor}</p>
                                    </div>
                                    {/* Edit Button */}
                                    {classDetails?.isInstructor && (
                                        <Link
                                            href={`/classes/edit/${classId}`}
                                            className="flex items-center ml-auto px-3 py-1.5 text-xs font-medium rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
                                        >
                                            <SquarePen className="inline-block mr-1" size={14} />
                                            Edit
                                            <span className="ml-1 hidden sm:inline">Class</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Tabs */}
            <div className="sticky top-16 z-20 bg-slate-100 backdrop-blur-md border-b border-slate-200 mx-auto w-full">
                <div className="flex overflow-x-auto no-scrollbar px-4 relative">
                    {tabs.map((tab) => {
                        const active = isActiveTab(tab.href);
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={`relative flex-none px-4 py-4 text-[12px] md:text-[13px] lg:text-[14px] font-semibold transition-colors overflow-hidden ${active
                                    ? "text-primary font-bold"
                                    : "text-slate-800 hover:text-slate-900"
                                    }`}
                            >
                                {tab.label}
                                {active && (
                                    <>
                                        <motion.span
                                            layoutId="activeGlow"
                                            className="absolute -bottom-1 left-2 right-2 h-3 bg-primary/40 blur-md rounded-full"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                        <motion.span
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-primary"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Page Content */}
            <div className="flex-1">{children}</div>
        </div>
    );
}