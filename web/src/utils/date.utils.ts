// data.utils.ts

/**
 * Date Utilities
 *
 * Functions for formatting and manipulating dates.
 * Assumes all input dates are in ISO format (UTC) and converts them to LOCAL time for display.
 *
 * Output Examples:
 * - "Today • 10:30 AM"         → if the date is today
 * - "Tomorrow • 10:30 AM"      → if the date is tomorrow
 * - "Yesterday • 10:30 AM"     → if the date is yesterday
 * - "after 3 days"             → if within the next relativeDaysLimit
 * - "3 days before"            → if within the past relativeDaysLimit
 * - "Wed, Oct 27, 2024"        → if beyond relativeDaysLimit
 *
 * Options:
 * - showTime: boolean            → include time display
 * - showYear: boolean            → include year for dates beyond limit
 * - relativeDaysLimit: number    → max days for "after X days"/"X days before"
 * - showTimeAfterLimit: boolean  → show time even for dates beyond limit
 * - timeOnly: boolean            → show only time (ignores date)
 */
interface FormatOptions {
  showTime?: boolean;
  showYear?: boolean;
  relativeDaysLimit?: number;
  showTimeAfterLimit?: boolean;
  timeOnly?: boolean;
}

export function formatRelativeDate(
  dateStr: string,
  options: FormatOptions = {},
): string {
  const {
    showTime = false,
    showYear = true,
    relativeDaysLimit = 7,
    showTimeAfterLimit = false,
    timeOnly = false,
  } = options;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  // Just time
  if (timeOnly) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Normalize to LOCAL midnight
  const normalize = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = normalize(new Date());
  const target = normalize(date);

  const diffDays = Math.floor(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  let relative: string | null = null;

  if (diffDays === 0) relative = "Today";
  else if (diffDays === 1) relative = "Tomorrow";
  else if (diffDays === -1) relative = "Yesterday";
  else if (diffDays > 1 && diffDays <= relativeDaysLimit)
    relative = `after ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  else if (diffDays < -1 && diffDays >= -relativeDaysLimit)
    relative = `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago`;

  // Base date formatting if beyond limit
  let datePart: string;
  if (relative) {
    datePart = relative;
  } else {
    const opts: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: showYear ? "numeric" : undefined,
    };
    datePart = date.toLocaleDateString("en-US", opts);
  }

  // Add time
  const shouldShowTime = showTime || (!relative && showTimeAfterLimit);
  if (shouldShowTime) {
    const timePart = date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} • ${timePart}`;
  }

  return datePart;
}

/**
 * @param localDate 
 * @param localTime 
 * @returns UTC ISO string (e.g. "2024-10-27T14:30:00.000Z")
 */

/** Local YYYY-MM-DD + HH:mm → UTC ISO string */
export function localToISO(localDate: string, localTime: string): string {
  if (!localDate || !localTime) return "";
  return new Date(`${localDate}T${localTime}`).toISOString();
}

/** UTC ISO → local YYYY-MM-DD */
export function isoToLocalDate(iso: string): string {
  if (!iso) return "";

  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** UTC ISO → local HH:mm */
export function isoToLocalTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
