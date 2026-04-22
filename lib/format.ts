import { DateTime } from "luxon";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDateMdyFromIso(isoDate: string): string {
  const dt = DateTime.fromISO(isoDate, { zone: "utc" });
  if (!dt.isValid) return isoDate;
  const mon = MONTHS[dt.month - 1] ?? "";
  return `${mon} ${dt.day}, ${dt.year}`;
}

export function formatTimeAmPmFromHms(hms: string): string {
  // "14:30:00" -> "2:30p"
  const dt = DateTime.fromFormat(hms, "HH:mm:ss", { zone: "utc" });
  if (!dt.isValid) return hms;
  const hour24 = dt.hour;
  const minute = dt.minute;
  const ap = hour24 >= 12 ? "p" : "a";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  const mm = String(minute).padStart(2, "0");
  return `${hour12}:${mm}${ap}`;
}

export function tzLabel(tz: string | null | undefined): string {
  if (!tz) return "ET";
  if (tz === "ET" || tz === "CT" || tz === "PT") return tz;
  return "ET";
}

