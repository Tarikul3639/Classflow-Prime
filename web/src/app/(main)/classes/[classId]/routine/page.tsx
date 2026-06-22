"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/ui/EmptyState";
import { Header } from "./_components/Header";
import { DesktopTable } from "./_components/DesktopView/DesktopTable";
import { DayTabs } from "./_components/MobileView/DayTabs";
import { PeriodSlotCard } from "./_components/MobileView/PeriodSlotCard";
import { PeriodSlotDialog } from "./_components/PeriodSlotDialog";
import { CreateRoutineDialog } from "./_components/CreateRoutineDialog";
import { RoutineSkeleton } from "./_components/RoutineSkeleton";
import { buildSubjectColorMap } from "./_components/SubjectColors";
import { toast } from "sonner";

import type {
    RoutineSlot,
    RoutinePeriod,
    DayOfWeek,
} from "@/types/routine.types";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchRoutine } from "@/store/features/classes/thunks/routine/fetchRoutine.thunk";
import { createRoutine } from "@/store/features/classes/thunks/routine/createRoutine.thunk";
import { addSlot } from "@/store/features/classes/thunks/routine/addSlotThunk";
import { editSlot } from "@/store/features/classes/thunks/routine/editSlotThunk";
import { removeSlot } from "@/store/features/classes/thunks/routine/removeSlotThunk";
import { deleteRoutine } from "@/store/features/classes/thunks/routine/deleteRoutine.thunk";

import { addRoutineToGoogleCalendar } from "@/utils/googleCalendar.utils";

const DAYS: DayOfWeek[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export default function ClassRoutine() {
    const dispatch = useAppDispatch();
    const { classId } = useParams() as { classId: string };
    const printRef = useRef<HTMLDivElement | null>(null);

    // ── Redux state ────────────────────────────────────────────────────────

    const { loading: fetching, isFetched, error: fetchError } = useAppSelector(
        (state) => state.classes.routine.fetchRoutine,
    );

    const { loading: creating, error: createError } = useAppSelector(
        (state) => state.classes.routine.createRoutine,
    );

    const { loading: addingSlot, error: addSlotError } = useAppSelector(
        (state) => state.classes.routine.addSlot,
    );

    const { loading: editingSlot, error: editSlotError } = useAppSelector(
        (state) => state.classes.routine.editSlot,
    );

    const { loading: deletingRoutine, error: deleteRoutineError } =
        useAppSelector((state) => state.classes.routine.deleteRoutine);

    // Class details for admin check and refetching on class change
    const classEntry = useAppSelector(
        (state) => state.classes.fetchSingleClass.classesByClassId[classId],
    );
    const classDetails = classEntry?.classDetails;
    const classFetching = classEntry?.fetch.loading ?? false;

    const isAdmin = !!(classDetails?.isInstructor || classDetails?.isAssistant);

    const routine = useAppSelector(
        (state) => state.classes.routine.routines[classId],
    );

    // ── Memoized subject wise color map ────────────────────────────────────

    const colorMap = useMemo(
        () =>
            buildSubjectColorMap(routine?.schedule.map((d) => d.slots ?? []) ?? []),
        [routine?.schedule],
    );

    // ── Local state ────────────────────────────────────────────────────────

    const [activeDay, setActiveDay] = useState<DayOfWeek>("Sunday");
    const [slotDialogOpen, setSlotDialogOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<RoutineSlot | undefined>();
    const [selectedDay, setSelectedDay] = useState<string | undefined>();

    // ── Fetch routine ──────────────────────────────────────────────────────

    useEffect(() => {
        if (classId) dispatch(fetchRoutine(classId));
    }, [classId, dispatch]);

    // ── Auto-select today's day once routine loads ─────────────────────────

    useEffect(() => {
        if (!routine?.schedule?.length) return;

        const todayName = DAYS[new Date().getDay()];
        const hasToday = routine.schedule.some((d) => d.day === todayName);

        setActiveDay(hasToday ? todayName : (routine.schedule[0].day as DayOfWeek));
    }, [routine?.routineId]);

    // ── Handlers ───────────────────────────────────────────────────────────

    function onEdit(day: string, slot: RoutineSlot) {
        setSelectedDay(day);
        setSelectedSlot(slot);
        setSlotDialogOpen(true);
    }

    async function onRemove(slot: RoutineSlot) {
        if (!slot.slotId) return;

        const promise = dispatch(
            removeSlot({ classId, slotId: slot.slotId }),
        ).unwrap();

        toast.promise(promise, {
            loading: "Removing slot...",
            success: "Slot removed successfully",
            error: "Failed to remove slot",
        });

        try {
            await promise;
        } catch (err) {
            console.error("Failed to remove slot:", err);
        }
    }

    function handleDialogClose() {
        setSlotDialogOpen(false);
        setSelectedSlot(undefined);
        setSelectedDay(undefined);
    }

    async function handleAdd(day: string, slot: RoutineSlot) {
        try {
            await dispatch(
                addSlot({
                    classId,
                    day,
                    periodNo: slot.periodNo,
                    subject: slot.subject,
                    teacherName: slot.teacherName,
                    room: slot.room,
                }),
            ).unwrap();
            handleDialogClose();
        } catch (err) {
            console.error("Failed to add slot:", err);
        }
    }

    async function handleEdit(day: string, slot: RoutineSlot) {
        if (!selectedSlot?.slotId) return;
        try {
            await dispatch(
                editSlot({
                    classId,
                    slotId: selectedSlot.slotId,
                    day,
                    periodNo: slot.periodNo,
                    subject: slot.subject,
                    teacherName: slot.teacherName,
                    room: slot.room,
                }),
            ).unwrap();
            handleDialogClose();
        } catch (err) {
            console.error("Failed to edit slot:", err);
        }
    }

    async function handleCreateRoutine(
        periods: Omit<RoutinePeriod, "periodId">[],
    ) {
        try {
            await dispatch(createRoutine({ classId, periods })).unwrap();
            setCreateOpen(false);
        } catch (error) {
            console.error("Failed to create routine:", error);
        }
    }

    async function onDeleteRoutine() {
        try {
            await dispatch(deleteRoutine({ classId })).unwrap();
        } catch (error) {
            console.error("Failed to delete routine:", error);
        }
    }

    // ── Print ──────────────────────────────────────────────────────────────

    // function onPrint() {
    //     const printArea = printRef.current;
    //     if (!printArea) return window.print();

    //     const clone = printArea.cloneNode(true) as HTMLElement;
    //     clone.id = "__print_clone__";
    //     document.body.appendChild(clone);
    //     window.print();
    //     document.body.removeChild(clone);
    // }

    function onPrint() {
        const printArea = printRef.current;
        if (!printArea) return window.print();

        // Temporarily make the hidden element visible for cloning
        const wasHidden = printArea.classList.contains('hidden');
        if (wasHidden) {
            printArea.classList.remove('hidden');
            printArea.classList.add('block');
        }

        const clone = printArea.cloneNode(true) as HTMLElement;

        // Restore original classes
        if (wasHidden) {
            printArea.classList.add('hidden');
            printArea.classList.remove('block');
        }

        clone.id = "__print_clone__";
        document.body.appendChild(clone);
        window.print();
        document.body.removeChild(clone);
    }

    // ── Error ──────────────────────────────────────────────────────────────

    if (fetchError) {
        return (
            <div className="min-h-screen bg-[#F5F4FE] flex items-center justify-center">
                <p className="text-[13px] text-red-400">{fetchError}</p>
            </div>
        );
    }

    // ── Derived UI State ───────────────────────────────────────────────────────
    const isLoading = fetching || classFetching || !isFetched;

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <>
            {isLoading ? (
                <RoutineSkeleton />
            ) : (
                <div className="bg-[#F5F4FE]">
                    <div className="h-full overflow-hidden bg-gray-50 md:px-4">
                        {routine ? (
                            <>
                                <Header
                                    isAdmin={isAdmin}
                                    open={slotDialogOpen}
                                    loading={deletingRoutine}
                                    error={deleteRoutineError}
                                    setOpen={setSlotDialogOpen}
                                    onDeleteRoutine={onDeleteRoutine}
                                    onTodayClick={() => setActiveDay(DAYS[new Date().getDay()])}
                                    onPrint={onPrint}
                                />

                                {/* Desktop */}
                                <div
                                    ref={printRef}
                                    className="print-area hidden px-4 py-6 md:block"
                                >
                                    <DesktopTable
                                        isAdmin={isAdmin}
                                        periods={routine.periods}
                                        schedule={routine.schedule}
                                        loading={fetching}
                                        error={fetchError}
                                        colorMap={colorMap}
                                        onEdit={onEdit}
                                        onRemove={onRemove}
                                        addRoutineToGoogleCalendar={(slotId, periodNo) =>
                                            addRoutineToGoogleCalendar(routine, slotId, periodNo)
                                        }
                                    />
                                </div>

                                {/* Mobile */}
                                <div className="md:hidden">
                                    <DayTabs
                                        activeDay={activeDay}
                                        days={routine.schedule.map((d) => d.day) as DayOfWeek[]}
                                        onDayChange={setActiveDay}
                                    />

                                    <div className="px-4 pb-24 pt-3">
                                        {(() => {
                                            const daySchedule = routine.schedule.find(
                                                (d) => d.day === activeDay,
                                            );
                                            const slots = daySchedule?.slots ?? [];
                                            const periods = routine.periods.filter((p) => !p.isBreak);

                                            return (
                                                <div className="space-y-0">
                                                    {periods.map((period, index) => {
                                                        const slot = slots.find(
                                                            (s) => s.periodNo === period.periodNo,
                                                        );
                                                        if (!slot) return null;

                                                        return (
                                                            <PeriodSlotCard
                                                                key={period.periodId}
                                                                isAdmin={isAdmin}
                                                                slot={slot}
                                                                period={period}
                                                                activeDay={activeDay}
                                                                isLast={index === periods.length - 1}
                                                                color={colorMap.get(slot.subject)}
                                                                onEdit={(slot) => onEdit(activeDay, slot)}
                                                                onRemove={(slot) => onRemove(slot)}
                                                                addRoutineToGoogleCalendar={(slotId, periodNo) =>
                                                                    addRoutineToGoogleCalendar(routine, slotId, periodNo)
                                                                }
                                                            />
                                                        );
                                                    })}

                                                    {slots.length === 0 && (
                                                        <EmptyState
                                                            icon={CalendarDays}
                                                            size="md"
                                                            title="No Classes"
                                                            description="No routine slots scheduled for this day. Enjoy your free time!"
                                                            className="h-65"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <EmptyState
                                icon={CalendarDays}
                                size="md"
                                title="No Routine Created"
                                description="Create a routine structure and start assigning class slots."
                                actionLabel={isAdmin ? "Create Routine" : undefined}
                                onAction={isAdmin ? () => setCreateOpen(true) : undefined}
                                className="h-80"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Slot Dialog */}
            <PeriodSlotDialog
                loading={addingSlot || editingSlot}
                error={addSlotError || editSlotError}
                open={slotDialogOpen}
                periods={routine?.periods ?? []}
                defaultDay={selectedDay}
                editData={selectedSlot}
                onClose={handleDialogClose}
                onSubmit={selectedSlot ? handleEdit : handleAdd}
            />

            {/* Create Routine */}
            <CreateRoutineDialog
                loading={creating}
                error={createError}
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onConfirm={handleCreateRoutine}
            />
        </>
    );
}
