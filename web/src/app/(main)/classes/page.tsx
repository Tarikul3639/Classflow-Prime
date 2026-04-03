"use client";

import React, { useState, useEffect } from "react";
import { Search, Users, Plus, UserPlus, BookOpen } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IClass,
  fetchEnrolledClasses,
} from "@/store/features/classes/thunks/fetch-enrolled-classes.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { TopLoader } from "@/components/ui/TopLoader";

const Classes: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();
  const { classes, loading } = useAppSelector(
    (state) => state.classes.fetchEnrolledClasses,
  );

  const filters = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "archived", label: "Archived" },
  ];

  useEffect(() => {
    if (classes.length > 0) return; // Don't fetch again if we already have classes in state
    setTimeout(() => {}, 5000);
    dispatch(fetchEnrolledClasses())
      .unwrap()
      .then(() => {
        // toast.success("Classes loaded successfully");
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load classes");
      });
  }, [dispatch]);

  // TODO: Just for demo purposes, we should handle this better in the thunk itself and ensure it always returns an object
  const safeClasses = Array.isArray(classes) ? classes : [];

  const filteredClasses = safeClasses
    .filter((cls) => {
      if (activeFilter === "active") return cls.status === "active";
      if (activeFilter === "archived") return cls.status === "archived";
      return true; // for "all"
    })
    .filter(
      (cls) =>
        cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.classId.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
        <div className="px-4 lg:px-8 pt-4 pb-4">
          <div className="flex items-center gap-3 mx-auto mb-2">
            <div className="flex items-center gap-4 flex-1 pb-4 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="size-5.5" />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 truncate">
                  My Classes
                </h1>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-slate-600 text-xs font-medium">
                    {safeClasses.length} active sessions
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/classes/enroll"
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <UserPlus size={18} />
                <span>Enroll</span>
              </Link>
              <Link
                href="/classes/create"
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 border border-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Plus size={18} />
                <span>Create</span>
              </Link>
            </div>

            {/* Mobile Buttons */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                href="/classes/enroll"
                className="flex items-center justify-center w-10 h-10 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
              >
                <UserPlus size={18} />
              </Link>
              <Link
                href="/classes/create"
                className="flex items-center justify-center w-10 h-10 bg-primary border border-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus size={18} />
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-slate-400" size={18} />
              </div>
              <input
                className="block w-full rounded-xl border-none bg-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                placeholder="Search by class name or code..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-4 lg:px-8 pb-4">
          <div className="mx-auto flex gap-2 overflow-x-auto no-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === filter.id
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "bg-slate-200 text-slate-600 border border-transparent hover:border-slate-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        <div className="mx-auto px-4 lg:px-8 py-6 relative">
          <main className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] md:grid-cols-[repeat(auto-fit,minmax(300px,300px))] justify-start">
            {filteredClasses.map((cls) => (
              <Link
                href={`/classes/${cls.classId}/updates`}
                key={cls.classId}
                className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col w-full h-full sm:max-w-75 sm:min-w-70"
                style={{
                  border: `1px solid ${cls.themeColor}40`,
                  boxShadow: `0 2px 10px ${cls.themeColor}20`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${cls.themeColor}60`;
                  e.currentTarget.style.boxShadow = `0 4px 50px ${cls.themeColor}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${cls.themeColor}40`;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Banner */}
                <div className="relative h-28 sm:h-36 overflow-hidden bg-slate-100">
                  <Avatar className="absolute inset-0 w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage
                      className="object-cover"
                      src={cls.coverImage || undefined}
                      alt={cls.title}
                    />
                    <AvatarFallback
                      className="rounded-none w-full h-full text-4xl font-bold tracking-widest flex items-center justify-center uppercase"
                      style={{
                        backgroundColor: `${cls.themeColor}50`,
                        color: cls.themeColor,
                      }}
                    >
                      {cls.title
                        .split(" ")
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
                    <circle
                      cx="170"
                      cy="-10"
                      r="100"
                      fill="rgba(255,255,255,0.07)"
                    />
                    <circle
                      cx="170"
                      cy="-10"
                      r="70"
                      fill="rgba(255,255,255,0.06)"
                    />
                    <circle
                      cx="170"
                      cy="-10"
                      r="40"
                      fill="rgba(255,255,255,0.06)"
                    />
                  </svg>

                  {/* Status Badge */}
                  <div
                    className="absolute top-3 right-3 text-[11px] font-semibold tracking-widest px-2 py-0.5 pb-1 rounded-full text-white"
                    style={{ backgroundColor: `${cls.themeColor}` }}
                  >
                    {cls.status.charAt(0).toUpperCase() +
                      cls.status.slice(1).toLowerCase()}
                  </div>

                  {/* Department Label */}
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: cls.themeColor }} // colored dot
                      />
                      {cls.department}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div
                  className="relative p-4 flex flex-col flex-1 bg-white overflow-hidden gap-2 sm:gap-3"
                  style={{
                    borderTop: `2px solid ${cls.themeColor}`,
                    background: `linear-gradient(160deg, ${cls.themeColor}08 0%, #ffffff 40%)`,
                  }}
                >
                  {/* Soft color wash from top */}
                  <div
                    className="absolute inset-x-0 top-0 h-24 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 140% 100% at 85% -20%, ${cls.themeColor}18, transparent 65%)`,
                    }}
                  />

                  {/* Title */}
                  <h3 className="text-md font-bold text-[#203044] leading-tight line-clamp-2">
                    {cls.title}
                  </h3>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 ml-1">
                    <Avatar className="w-8 h-8 border border-slate-200">
                      <AvatarImage
                        src={cls.avatarUrl || undefined}
                        alt={cls.instructor}
                      />
                      <AvatarFallback
                        className="w-full h-full text-sm font-semibold text-center p-1"
                        style={{
                          backgroundColor: cls.themeColor,
                          color: "#fff",
                        }}
                      >
                        {cls.instructor
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-[9px] uppercase font-bold leading-none text-black opacity-60">
                        Instructor
                      </p>
                      <span className="text-[13px] font-semibold">
                        {cls.instructor}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    className="pt-2 mt-auto flex items-center justify-between"
                    style={{ borderTop: `1px solid ${cls.themeColor}30` }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users size={16} className="text-slate-400" />
                      <span className="text-xs font-semibold text-[#4d5d73]">
                        {cls.students} Students
                      </span>
                    </div>
                    <div
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{
                        backgroundColor: `${cls.themeColor}15`,
                        color: cls.themeColor,
                      }}
                    >
                      {cls.semester}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </main>

          {!loading && filteredClasses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <BookOpen className="text-slate-300" size={28} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No classes found
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : activeFilter !== "all"
                      ? `You have no ${activeFilter} classes`
                      : "Create or enroll in a class to get started"}
                </p>
              </div>
              {!searchQuery && activeFilter === "all" && (
                <Link
                  href="/classes/create"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} />
                  Create a class
                </Link>
              )}
            </div>
          )}

          <TopLoader isLoading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Classes;
