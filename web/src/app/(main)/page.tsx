"use client";

import React from "react";
import {
  Search,
  Bell,
  GraduationCap,
  CheckSquare,
  ClipboardList,
  Calendar,
  BookOpen,
  User,
  LayoutDashboard,
  Upload,
  Megaphone,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    {
      icon: GraduationCap,
      label: "GPA",
      value: "3.8",
      badge: "+0.2",
      badgeColor: "bg-green-100 text-green-600",
    },
    {
      icon: CheckSquare,
      label: "Attendance",
      value: "95%",
      badge: "Avg",
      badgeColor: "bg-slate-100 text-slate-600",
    },
    {
      icon: ClipboardList,
      label: "Assignments",
      value: "4 Pending",
      badge: null,
      badgeColor: "",
    },
    {
      icon: Calendar,
      label: "Next Exam",
      value: "2 Days",
      badge: "Urgent",
      badgeColor: "bg-red-100 text-red-500",
    },
  ];

  const schedule = [
    {
      time: "09:00",
      period: "AM",
      title: "Advanced Physics",
      location: "Room 302",
      instructor: "Dr. Watson",
      status: "Ongoing",
      isActive: true,
      students: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDaqv74l4834W5aw6bzxblNSUbNN_2AcsNmM1f8l5kAkQGmmNKc2In34y75u36--c8YWmzBTCSFnl_CxmamGudAbjSJYlFqfZy3s1jU1Cj9cdwtb1WqKP7s87hVRFZqWpgKuXScd_2RoP9S2VZ8s_C2xMyMK4FJZlh5XOjdS7jdEmbIJFBCkpzV570_zuv9hVZXy_zrdQTGnI_UvhFg8NfcoWoLhctmb8Kr32sN4MJo5IYe5Mh9NveAVf7O6W5y1aNSuTIZ01NNxqoO",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBGB_H8ZWN8ewqW9l-h1RBlRlXemInJ2F55q7tcT7dOcoG0JzYMyKR32P4o8vx35EYuf1VrCxXXD1iUkbPQwsSIQTbuT63jL7HBQFtaGMbuDyaeg9Jxy5fFIZ-E2T2v8feTePqCMY2RsvgCwr3JXjeIl_Vm5SGuiEzafmbizV2Q57V8KkrxTTArx2aNlQYFX1jEm-t0Eliu1eMEidSBBl7wEPOsnH3I446mgg64mJwWGUPQxqZaZE-43R31BGmH8bXqSItp6Ae68oTB",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAb7MqSH2Dqq8F67IEeEgsWx6bwkjHaM4rzzQJCuYRP39X6-W4mIgm-nasQ6uU4dzIjiV-4IjkaaiQeOeI72ZX2D85-vt3myMrbzCPWt__7dDL8RvtWxh5tHlHr6NAVcXXqE8k0lO4MmdZgGWPIZaoBb_WAHFJoBZR4a0CeVJ_52YvK1m-MbWVf24Ocv3EUmbWWAC5ZC22iMvYCbSQ8qjl8dpy5mOVpf9xrTEBRo_sGf2uY2R3sh0WBaEV44BMBetAPmGdXcfbZtaoI",
      ],
      count: 12,
    },
    {
      time: "11:30",
      period: "AM",
      title: "Calculus II",
      location: "Room 105",
      instructor: "Prof. Smith",
      duration: "1h 30m duration",
      isActive: false,
    },
    {
      time: "02:00",
      period: "PM",
      title: "Literature History",
      location: "Library Hall",
      instructor: "Mrs. Davis",
      duration: "45m duration",
      isActive: false,
    },
  ];

  const updates = [
    {
      icon: Upload,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
      title: "Assignment Graded",
      description:
        'Your submission for "Modern History Essay" has been graded.',
      time: "2 hours ago",
    },
    {
      icon: Megaphone,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      title: "Class Canceled",
      description:
        "Tomorrow's 9:00 AM Chemistry Lab is canceled due to maintenance.",
      time: "5 hours ago",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="hidden sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-4 mx-auto">
          {/* Left Side: Profile & Identity */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div
                className="size-11 rounded-xl ring-2 ring-primary/10 bg-cover bg-center shadow-sm transition-transform group-hover:scale-105"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuClNnw6aauNG2u0MAaUdo4ceSc6pryAsYYQBSLldRLmEEyjwRzswwlPm0ykikSqyo50QI8GfPxSAga7wjXvcEzps9DYx8yQtRa7bMole4kgdoR8AT1YkLNfxsoc3HM0X8iQLh1EsR-yDgfqRzzt_l5KwJMJpoHFqbl6NLJdfptBT6SnN9hs3KZfBEAc2jy56wyEFGDUnjAqY3SnflCRblIB9QvN8EDapruEYXcYqAUTqh-8RwQ8DB0y1K7tv48PMq2KZNdivzE1Zfdv")',
                }}
              />
              {/* Active Pulse - Shows the system is "Live" as per ClassFlow specs */}
              <span className="absolute -bottom-1 -right-1 size-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200" />
            {/* Subtle Divider */}
            <div className="flex flex-col">
              <h2 className="text-lg font-bold leading-none tracking-tight text-slate-900 mb-1">
                Dashboard
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wider">
                  v2.0
                </span>
                <p className="text-[12px] font-medium text-primary/80">
                  ClassFlow
                </p>
              </div>
            </div>
          </div>

          {/* Center Spacer / Search (Optional expansion) */}
          <div className="flex-1" />

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center size-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-white hover:shadow-md hover:text-primary transition-all border border-transparent hover:border-slate-100">
              <Search size={19} />
            </button>

            <button className="relative flex items-center justify-center size-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-white hover:shadow-md hover:text-primary transition-all border border-transparent hover:border-slate-100">
              <Bell size={19} />
              <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {/* Welcome Section */}
        <div className="px-6 pt-6 pb-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Good morning, Alex!
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Here's what's happening in your classes today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex flex-col gap-1 rounded-2xl p-5 bg-white shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="text-primary" size={24} />
                  {stat.badge && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.badgeColor}`}
                    >
                      {stat.badge}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  {stat.label}
                </p>
                <p className="text-slate-900 text-2xl font-bold">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Today's Schedule */}
        <div className="px-6 mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Today's Schedule</h3>
          <Link href="#" className="text-sm font-medium text-primary">
            View Calendar
          </Link>
        </div>

        <div className="flex flex-col gap-3 px-6 pb-6">
          {schedule.map((item, index) => (
            <div key={index} className="flex items-stretch gap-4">
              <div className="flex flex-col items-center justify-start pt-1 w-12">
                <span
                  className={`text-sm font-bold ${
                    item.isActive ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  {item.time}
                </span>
                <span className="text-xs text-slate-500">{item.period}</span>
                {index < schedule.length - 1 && (
                  <div className="w-px h-full bg-slate-200 mt-2"></div>
                )}
              </div>
              <div
                className={`flex-1 rounded-2xl p-4 ${
                  item.isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 relative overflow-hidden"
                    : "bg-white border border-slate-100"
                }`}
              >
                {item.isActive && (
                  <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <GraduationCap size={144} />
                  </div>
                )}
                <div className="relative z-10">
                  {item.status && (
                    <span className="inline-block px-2 py-1 rounded-md bg-white/20 text-xs font-semibold mb-2 backdrop-blur-sm">
                      {item.status}
                    </span>
                  )}
                  <h4
                    className={`text-lg font-bold ${
                      item.isActive ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`text-sm mb-${item.students ? "3" : "2"} ${
                      item.isActive ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    {item.location} • {item.instructor}
                  </p>
                  {item.students ? (
                    <div className="flex -space-x-2 overflow-hidden">
                      {item.students.map((student, idx) => (
                        <img
                          key={idx}
                          alt=""
                          className="inline-block size-6 rounded-full ring-2 ring-primary"
                          src={student}
                        />
                      ))}
                      <div className="flex items-center justify-center size-6 rounded-full ring-2 ring-primary bg-white text-primary text-[10px] font-bold">
                        +{item.count}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="text-slate-500" size={16} />
                      <span className="text-xs text-slate-500">
                        {item.duration}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Updates */}
        <div className="px-6 mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent Updates</h3>
          <Link href="#" className="text-sm font-medium text-primary">
            View All
          </Link>
        </div>

        <div className="flex flex-col gap-3 px-6 pb-6">
          {updates.map((update, index) => {
            const Icon = update.icon;
            return (
              <div
                key={index}
                className="p-4 bg-white rounded-2xl border border-slate-100 flex items-start gap-3"
              >
                <div
                  className={`size-10 rounded-full ${update.iconBg} flex items-center justify-center shrink-0`}
                >
                  <Icon className={update.iconColor} size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {update.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {update.description}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">
                    {update.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
