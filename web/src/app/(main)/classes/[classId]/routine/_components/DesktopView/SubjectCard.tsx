import type { RoutineSlot } from "@/types/routine.types";
import type { SubjectColor } from "../SubjectColors";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

interface SubjectCardProps {
    isAdmin?: boolean;
    day: string;
    slot: RoutineSlot | undefined;
    color: SubjectColor | undefined;
    onEdit: (day: string, slot: RoutineSlot) => void;
    onRemove: (slot: RoutineSlot) => void;
    addRoutineToGoogleCalendar: (slotId: string, periodNo: number) => void;
}

const FALLBACK_COLOR: SubjectColor = {
    border: "hsl(220, 60%, 52%)",
    avatarBg: "hsl(220, 70%, 93%)",
    avatarText: "hsl(220, 55%, 28%)",
};

export function SubjectCard({ day, slot, color, onEdit, onRemove, addRoutineToGoogleCalendar, isAdmin }: SubjectCardProps) {
    if (!slot) {
        return (
            <div className="h-full min-h-22.5 rounded-md border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center">
                <span className="text-[11px] text-gray-300 dark:text-gray-700">
                    No class
                </span>
            </div>
        );
    }

    const c = color ?? FALLBACK_COLOR;

    return (
        <div
            style={{ borderLeftColor: c.border }}
            className={cn(
                "relative group flex flex-col min-h-22.5 rounded-md",
                "border border-gray-100 dark:border-gray-800 border-l-[3px]",
                "px-3 py-2.5 bg-white dark:bg-gray-950",
                "hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150",
            )}
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "absolute top-2 right-2 p-1 rounded-md",
                            "opacity-0 group-hover:opacity-100 transition-opacity",
                            "cursor-pointer outline-none",
                            "hover:bg-gray-100 dark:hover:bg-gray-800",
                        )}
                        aria-label="More options"
                    >
                        <MoreVertical size={13} className="text-gray-400" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44 border border-gray-300">
                    {isAdmin && (
                        <DropdownMenuItem
                            onClick={() => onEdit(day, slot)}
                            className="text-xs gap-2 cursor-pointer"
                        >
                            <Pencil size={11} className="text-muted-foreground" />
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
                            className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                            <Trash2 size={11} />
                            Remove
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <p className="text-[12px] font-semibold leading-snug pr-6 text-gray-800 dark:text-gray-100 mb-1">
                {slot.subject}
            </p>

            {slot.room && (
                <span className="self-start text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 mb-2 leading-none">
                    Room {slot.room}
                </span>
            )}

            <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                <div
                    style={{ background: c.avatarBg, color: c.avatarText }}
                    className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                >
                    {getInitials(slot.teacherName)}
                </div>
                <span className="text-[10px] truncate text-gray-500 dark:text-gray-400">
                    {slot.teacherName}
                </span>
            </div>
        </div>
    );
}