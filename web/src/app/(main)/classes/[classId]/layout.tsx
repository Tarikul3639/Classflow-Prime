"use client";

import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { fetchSingleClass } from "@/store/features/classes/thunks/fetch-single-class.thunk";
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
  const { classDetails, isLoading, error } = useAppSelector(
    (state) => state.classes.fetchSingleClass,
  );

  useEffect(() => {
    if (classId && classId !== "undefined") {
      dispatch(fetchSingleClass(classId))
        .unwrap()
        .then((res) => {})
        .catch((err) => {
          console.error("Error fetching class details:", err);
          toast.error("Failed to load class details", {
            description: err.message,
          });
          router.replace("/404");
        });
    }
  }, [classId]);

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

  const tabIndex = tabs.findIndex((t) => t.href === pathname);
  const [direction, setDirection] = useState(0);
  const prevTabIndex = useRef(tabIndex);

  useEffect(() => {
    const newDirection = tabIndex > prevTabIndex.current ? 1 : -1;
    setDirection(newDirection);
    prevTabIndex.current = tabIndex;
  }, [tabIndex]);

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
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 cursor-pointer transition-colors">
            <Share2 className="text-slate-600" size={20} />
          </button>
        </div>
      </header>

      {/* Class Info Card - Hero Style */}
      <div className="p-2 md:p-3 lg:p-4 mx-auto w-full">
        <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-lg">
          {/* Banner */}
          <Avatar className="absolute inset-0 w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-300">
            <AvatarImage
              className="object-cover"
              src={classDetails?.coverImage || undefined}
              alt={classDetails?.name || "Class Cover Image"}
            />
            <AvatarFallback
              className="rounded-none w-full h-full text-4xl font-bold tracking-widest flex items-center justify-center uppercase"
              style={{
                backgroundColor: `${classDetails?.themeColor}`,
                color: classDetails?.themeColor,
              }}
            >
              {classDetails?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-xs font-semibold">
                  {classDetails?.members} Members
                </span>
              </div>
            </div>

            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">
                {classDetails?.department}.{classDetails?.semester}
              </p>
              <h2 className="text-2xl font-extrabold mb-4 leading-tight">
                {classDetails?.name}
              </h2>
              <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                <Avatar
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center font-bold text-sm shadow-sm shadow--blue-500/50"
                  style={{ boxShadow: classDetails?.themeColor }}
                >
                  <AvatarImage
                    src={classDetails?.avatarUrl || undefined}
                    alt={classDetails?.instructor || "Instructor Avatar"}
                  />
                  <AvatarFallback className="w-full h-full text-sm font-semibold bg-white/20 text-white text-center p-1">
                    0a5.
                    {classDetails?.instructor
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-blue-100 font-medium">
                    Instructor
                  </p>
                  <p className="text-sm font-bold">
                    {classDetails?.instructor}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                className={`relative flex-none px-4 py-4 text-[12px] md:text-[13px] lg:text-[14px] font-semibold transition-colors overflow-hidden ${
                  active
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
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                    <motion.span
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 ">{children}</div>
    </div>
  );
}
