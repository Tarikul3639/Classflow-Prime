"use client";

import type { RoutinePeriod, DaySchedule, RoutineSlot } from "@/types/routine.types";
import { SubjectCard } from "./SubjectCard";
import { formatTo12Hour } from "@/utils/date.utils";
import type { SubjectColor } from "../SubjectColors";

const todayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
});

interface DesktopTableProps {
    isAdmin?: boolean;
    periods: RoutinePeriod[];
    schedule: DaySchedule[];
    loading: boolean;
    error: string | null;
    colorMap: Map<string, SubjectColor>;
    onEdit: (day: string, slot: RoutineSlot) => void;
    onRemove: (slot: RoutineSlot) => void;
    addRoutineToGoogleCalendar: (slotId: string, periodNo: number) => void;
}

function BreakCell({ label }: { label: string }) {
    return (
        <div className="h-full w-full rounded-sm border border-dashed border-red-500/20 bg-red-500/2 flex items-center justify-center px-2 py-2">
            <div className="text-center">
                <p className="text-[11px] font-bold text-primary uppercase">{label}</p>
                <p className="text-[9.5px] text-primary/60 mt-0.5 whitespace-nowrap">Break period</p>
            </div>
        </div>
    );
}

export function DesktopTable({
    isAdmin = false,
    periods,
    schedule,
    loading,
    error,
    colorMap,
    onEdit,
    onRemove,
    addRoutineToGoogleCalendar,
}: DesktopTableProps) {

    if (loading) {
        return (
            <div className="rounded-2xl border border-[#ECEAF8] bg-white p-12 flex flex-col items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
                <p className="text-[13px] text-gray-400">Loading routine...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-[#ECEAF8] bg-white p-12 text-center">
                <p className="text-[13px] text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-[#ECEAF8] bg-white">
            <table
                className="w-full border-collapse"
                style={{ tableLayout: "fixed", minWidth: 720 }}
            >
                <thead>
                    <tr className="bg-slate-100">
                        <th
                            className="text-left pl-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200"
                            style={{ width: 70 }}
                        >
                            Day
                        </th>

                        {periods.map((p) => (
                            <th
                                key={p.periodId}
                                className="py-3.5 px-4.5 text-center border-b border-slate-200 border-l border-l-slate-200"
                            >
                                <p className="text-[12px] font-bold text-slate-700">
                                    {formatTo12Hour(p.startTime)}
                                </p>
                                <p className="text-[10px] text-slate-600 mt-0.5">
                                    {formatTo12Hour(p.endTime)}
                                </p>
                                <p className="text-[9.5px] text-slate-500 mt-1 font-semibold tracking-wide">
                                    {p.label}
                                </p>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {schedule.map((dayData, i) => {
                        const isToday = dayData.day === todayName;
                        const daySlots = dayData.slots ?? [];

                        return (
                            <tr
                                key={dayData.day}
                                className={`border-b border-slate-100 last:border-0 print:bg-transparent ${isToday ? "bg-red-50/50" : ""
                                    }`}
                            >
                                <td
                                    className={`pr-2 py-2 align-middle border-r border-b border-slate-200 print:bg-slate-100 ${isToday ? "bg-red-50" : "bg-slate-100"
                                        }`}
                                >
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <span
                                            className={`text-[11px] font-bold uppercase tracking-widest print:text-slate-400 ${isToday ? "text-red-500" : "text-slate-400"
                                                }`}
                                        >
                                            {dayData.day.slice(0, 3)}
                                        </span>
                                        {isToday && (
                                            <span className="w-1 h-1 rounded-full bg-red-400 shrink-0 print:hidden" />
                                        )}
                                    </div>
                                </td>

                                {periods.map((p) => {
                                    const slot = daySlots.find(
                                        (s) => s.periodNo === p.periodNo,
                                    );

                                    if (p.isBreak) {
                                        if (i !== 0) return null;

                                        return (
                                            <td
                                                key={p.periodId}
                                                rowSpan={schedule.length}
                                                className="px-1.5 py-2 align-stretch border-l border-slate-100 bg-white h-1"
                                            >
                                                <BreakCell label={p.label} />
                                            </td>
                                        );
                                    }

                                    return (
                                        <td
                                            key={p.periodId}
                                            className="px-1.5 py-2 align-top border-l border-slate-100"
                                        >
                                            <SubjectCard
                                                isAdmin={isAdmin}
                                                day={dayData.day}
                                                slot={slot}
                                                color={colorMap.get(slot?.subject ?? "")}
                                                onEdit={onEdit}
                                                onRemove={onRemove}
                                                addRoutineToGoogleCalendar={addRoutineToGoogleCalendar}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}