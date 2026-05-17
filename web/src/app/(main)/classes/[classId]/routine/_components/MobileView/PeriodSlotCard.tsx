import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTo12Hour } from "@/utils/date.utils";
import { cn } from "@/lib/utils";

import type {
    RoutineSlot,
    RoutinePeriod,
    DayOfWeek,
} from "@/types/routine.types";
import type { SubjectColor } from "../SubjectColors";

interface PeriodSlotCardProps {
    slot: RoutineSlot;
    period: RoutinePeriod;
    activeDay: DayOfWeek;
    color?: SubjectColor; // Subject color configuration
    isLast?: boolean;
    isAdmin?: boolean;
    className?: string;
    onEdit: (slot: RoutineSlot) => void;
    onRemove: (slot: RoutineSlot) => void;
    addRoutineToGoogleCalendar: (slotId: string, periodNo: number) => void;
}

/**
 * Extract initials from a full name (max 2 characters)
 */
function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

/**
 * Weekday mapping (index-based)
 */
const DAYS: DayOfWeek[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

/**
 * Check whether the given period is currently active
 */
function checkIsActive(period: RoutinePeriod, activeDay: DayOfWeek): boolean {
    const todayName = DAYS[new Date().getDay()];

    // If selected day is not today, period is not active
    if (activeDay !== todayName) return false;

    // Convert HH:MM time to total minutes
    const toMin = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    };

    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

    return nowMin >= toMin(period.startTime) && nowMin < toMin(period.endTime);
}

export function PeriodSlotCard({
    slot,
    period,
    activeDay,
    color,
    isLast = false,
    isAdmin = false,
    className,
    onEdit,
    onRemove,
    addRoutineToGoogleCalendar,
}: PeriodSlotCardProps) {
    const isActive = checkIsActive(period, activeDay);

    return (
        <div className={cn("flex gap-2 sm:gap-3 min-w-0", className)}>
            {/* Time column */}
            <div className="flex flex-col items-center pt-3.5 w-13 sm:w-14 shrink-0 gap-1">
                <span className="w-full text-center text-[12px] sm:text-[12px] font-semibold text-foreground leading-none tabular-nums">
                    {formatTo12Hour(period.startTime)}
                </span>
                <span className="w-full text-center text-[10px] sm:text-[11px] text-muted-foreground leading-none tabular-nums">
                    {formatTo12Hour(period.endTime)}
                </span>
                <span
                    className={cn(
                        "w-full text-center text-[9px] sm:text-[11px] font-bold uppercase tracking-wide mt-0.5",
                        isActive ? "text-primary" : "text-muted-foreground/50",
                    )}
                >
                    P{period.periodNo}
                </span>
            </div>

            {/* Spine column */}
            <div className="flex flex-col items-center w-4 sm:w-5 shrink-0">
                <div
                    className={cn(
                        "w-2.5 h-2.5 rounded-full border-2 mt-3.5 shrink-0 z-11 transition-all",
                        isActive
                            ? "bg-primary border-primary ring-2 ring-primary/20"
                            : "bg-background border-muted-foreground/30",
                    )}
                    // When inactive, apply subject color to the dot
                    style={
                        !isActive && color
                            ? { borderColor: color.border, backgroundColor: color.border }
                            : undefined
                    }
                />
                {!isLast && (
                    <div
                        className={cn(
                            "w-px flex-1 mt-1 min-h-4 rounded-full",
                            isActive ? "bg-primary/30" : "bg-border",
                        )}
                        style={
                            color
                                ? { backgroundColor: color.border, opacity: 0.2 }
                                : undefined
                        }
                    />
                )}
            </div>

            {/* Card */}
            <div
                className={cn(
                    "flex-1 min-w-0 rounded-md p-3 sm:p-3.5 relative transition-colors mb-3",
                    isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "bg-background text-foreground border border-border",
                )}
                // When inactive, apply subject color border accent
                style={
                    !isActive && color
                        ? {
                            borderLeftWidth: "3px",
                            borderLeftColor: color.border,
                        }
                        : undefined
                }
            >
                {/* menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                "absolute top-2.5 right-2.5 p-1.5 rounded-lg opacity-40 hover:opacity-100 transition-opacity cursor-pointer outline-none",
                                isActive ? "hover:bg-white/10" : "hover:bg-black/5",
                            )}
                            aria-label="More options"
                        >
                            <MoreVertical size={14} />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-44 border border-gray-300">

                        {isAdmin && (
                            <DropdownMenuItem
                                onClick={() => onEdit(slot)}
                                className="gap-2.5 cursor-pointer"
                            >
                                <Pencil size={13} className="text-muted-foreground" />
                                Edit
                            </DropdownMenuItem>
                        )}

                        {/* ADD to google Calender */}
                        <DropdownMenuItem
                            onClick={() => addRoutineToGoogleCalendar(slot.slotId, slot.periodNo)}
                            className="gap-2.5 cursor-pointer"
                        >
                            <Plus size={13} className="text-muted-foreground" />
                            Add to Calendar
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {isAdmin && (
                            <DropdownMenuItem
                                onClick={() => onRemove(slot)}
                                className="gap-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <Trash2 size={13} />
                                Remove
                            </DropdownMenuItem>
                        )}

                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Subject */}
                <p
                    className={cn(
                        "font-semibold text-sm sm:text-[15px] leading-snug truncate",
                        isAdmin ? "pr-7" : "pr-1",
                    )}
                >
                    {slot.subject}
                </p>

                {/* Room */}
                {slot.room && (
                    <p
                        className={cn(
                            "text-[12px] sm:text-[13px] mt-0.5 truncate",
                            isActive ? "text-primary-foreground/65" : "text-muted-foreground",
                        )}
                    >
                        {slot.room}
                    </p>
                )}

                {/* Teacher */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 min-w-0">
                    <div
                        className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] sm:text-[12px] font-bold shrink-0",
                            !color && !isActive && "bg-primary/10 text-primary",
                            isActive && "bg-white/20 text-primary-foreground",
                        )}
                        // Apply subject-based avatar colors when available
                        style={
                            !isActive && color
                                ? {
                                    backgroundColor: color.avatarBg,
                                    color: color.avatarText,
                                }
                                : undefined
                        }
                    >
                        {getInitials(slot.teacherName)}
                    </div>

                    <span
                        className={cn(
                            "text-[12px] sm:text-[13px] truncate min-w-0",
                            isActive ? "text-primary-foreground/75" : "text-muted-foreground",
                        )}
                    >
                        {slot.teacherName}
                    </span>
                </div>
            </div>
        </div>
    );
}
