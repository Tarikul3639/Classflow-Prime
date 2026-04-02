"use client";

import { Info, Clock, MapPin, Users, CalendarDays } from "lucide-react";
import { fetchClassOverview } from "@/store/features/classes/thunks/fetch-class-overview.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const ROUTINE: Record<
  string,
  { subject: string; time: string; room: string }[]
> = {
  Sunday: [
    { subject: "Mathematics", time: "08:00 - 09:30", room: "Room 301" },
    { subject: "Physics", time: "10:00 - 11:30", room: "Room 402" },
    { subject: "Chemistry", time: "12:00 - 01:30", room: "Lab 101" },
    { subject: "English", time: "02:00 - 03:30", room: "Room 205" },
  ],
  Monday: [
    { subject: "Mathematics", time: "08:00 - 09:30", room: "Room 301" },
    { subject: "Biology", time: "10:00 - 11:30", room: "Lab 202" },
    { subject: "History", time: "12:00 - 01:30", room: "Room 103" },
    { subject: "English", time: "02:00 - 03:30", room: "Room 205" },
  ],
  Tuesday: [
    { subject: "Physics", time: "08:00 - 09:30", room: "Room 402" },
    { subject: "Mathematics", time: "10:00 - 11:30", room: "Room 301" },
    { subject: "Chemistry", time: "12:00 - 01:30", room: "Lab 101" },
    { subject: "Art", time: "02:00 - 03:30", room: "Studio 01" },
  ],
  Wednesday: [
    { subject: "English", time: "08:00 - 09:30", room: "Room 205" },
    { subject: "Mathematics", time: "10:00 - 11:30", room: "Room 301" },
    { subject: "Biology", time: "12:00 - 01:30", room: "Lab 202" },
    { subject: "History", time: "02:00 - 03:30", room: "Room 103" },
  ],
  Thursday: [
    { subject: "Chemistry", time: "08:00 - 09:30", room: "Lab 101" },
    { subject: "Physics", time: "10:00 - 11:30", room: "Room 402" },
    { subject: "Mathematics", time: "12:00 - 01:30", room: "Room 301" },
    { subject: "English", time: "02:00 - 03:30", room: "Room 205" },
  ],
  Friday: [
    { subject: "History", time: "08:00 - 09:30", room: "Room 103" },
    { subject: "Art", time: "10:00 - 11:30", room: "Studio 01" },
    { subject: "Biology", time: "12:00 - 01:30", room: "Lab 202" },
    { subject: "Mathematics", time: "02:00 - 03:30", room: "Room 301" },
  ],
  Saturday: [
    { subject: "English", time: "08:00 - 09:30", room: "Room 205" },
    { subject: "Chemistry", time: "10:00 - 11:30", room: "Lab 101" },
    { subject: "Physics", time: "12:00 - 01:30", room: "Room 402" },
    { subject: "History", time: "02:00 - 03:30", room: "Room 103" },
  ],
};

const TODAY = DAYS[new Date().getDay()];

export default function OverviewPage() {
  const params = useParams();
  const classId = params.classId as string;
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(
    (state) => state.classes.fetchClassOverview,
  );

  useEffect(() => {
    if (!classId || classId === "undefined") return;
    if (data?.classId === classId) return;
    dispatch(fetchClassOverview(classId)); // Replace with actual class ID
  }, [dispatch]);
  return (
    <main className="bg-slate-50 p-4 space-y-4 mx-auto">
      {/* About */}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-primary" size={20} />
            <span className="text-2xl font-bold text-slate-900">
              {data?.studentsCount || "NA"}
            </span>
          </div>
          <p className="text-xs text-slate-500">Total Students</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="text-primary" size={20} />
            <span className="text-2xl font-bold text-slate-900">
              {data?.updateCount || "NA"}
            </span>
          </div>
          <p className="text-xs text-slate-500">Total Events</p>
        </div>
      </div>

      {/* Weekly Routine */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Weekly Routine
        </h3>

        <div className="space-y-4">
          {DAYS.map((day) => {
            const isToday = day === TODAY;
            const classes = ROUTINE[day];

            return (
              <div key={day}>
                {/* Day Header */}
                <div className="flex items-center gap-2 mb-2">
                  <p
                    className={`text-xs font-bold uppercase tracking-widest ${isToday ? "text-primary" : "text-slate-400"}`}
                  >
                    {day}
                  </p>
                  {isToday && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Classes */}
                <div className="space-y-2 pl-1">
                  {classes.map((cls, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isToday ? "bg-primary/5" : "bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-1 self-stretch rounded-full ${isToday ? "bg-primary" : "bg-slate-200"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${isToday ? "text-slate-800" : "text-slate-700"}`}
                        >
                          {cls.subject}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-slate-400" />
                            <span className="text-[11px] text-slate-400">
                              {cls.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400" />
                            <span className="text-[11px] text-slate-400">
                              {cls.room}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
