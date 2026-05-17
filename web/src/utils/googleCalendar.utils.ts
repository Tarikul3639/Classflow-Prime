import type { Routine } from "@/types/routine.types";
import { toast } from "sonner";

export function addRoutineToGoogleCalendar(
    routine: Routine,
    slotId: string,
    periodNo: number
) {
    const slot = routine.schedule
        .flatMap((day) =>
            day.slots.map((s) => ({
                ...s,
                day: day.day,
            }))
        )
        .find((s) => s.slotId === slotId && s.periodNo === periodNo);

    const period = routine.periods.find((p) => p.periodNo === periodNo);

    if (!slot || !period) {
        toast.error("❌ Slot or Period not found");
        console.error("❌ Slot or Period not found");
        return;
    }

    const title = encodeURIComponent(slot.subject);

    const details = encodeURIComponent(
        `${slot.teacherName} | Room: ${slot.room} | Day: ${slot.day}`
    );

    const getDateOfWeekday = (weekday: string) => {
        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];

        const today = new Date();
        const targetIndex = days.indexOf(weekday);
        const diff = targetIndex - today.getDay();

        const date = new Date(today);
        date.setDate(today.getDate() + diff);

        return date;
    };

    const buildDateTime = (weekday: string, time: string) => {
        const date = getDateOfWeekday(weekday);

        const [h, m] = time.split(":").map(Number);

        date.setHours(h, m, 0, 0);

        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const start = buildDateTime(slot.day, period.startTime);
    const end = buildDateTime(slot.day, period.endTime);

    const rrule = "RRULE:FREQ=WEEKLY";

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}&recur=${encodeURIComponent(
        rrule
    )}`;

    toast.success("📅 Opening Google Calendar...");

    console.log("📅 ROUTINE GOOGLE CALENDAR DEBUG", {
        slotId,
        periodNo,
        subject: slot.subject,
        teacher: slot.teacherName,
        room: slot.room,
        day: slot.day,
        startDateTime: start,
        endDateTime: end,
        recurrence: rrule,
    });

    window.open(url, "_blank");
}