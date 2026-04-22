import type { ReitRow } from "@/lib/types";

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export type IcsEvent = {
  uid: string;
  summary: string;
  description: string;
  /** YYYYMMDD (all-day) */
  date?: string;
  /** YYYYMMDDTHHMMSSZ (timed) */
  dtstartUtc?: string;
  /** YYYYMMDDTHHMMSSZ (timed) */
  dtendUtc?: string;
};

export function buildEarningsIcsCalendar(opts: {
  rows: ReitRow[];
  calendarName: string;
  feedUrl: string;
  /** Optional mapper to generate timed events; if omitted, caller can prebuild events. */
  toEvent?: (row: ReitRow) => IcsEvent | null;
}): string {
  const now = new Date();
  const dtstamp =
    now
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z") ?? "19700101T000000Z";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dexus//REIT Q1 Earnings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(opts.calendarName)}`,
    `SOURCE;VALUE=URI:${escapeText(opts.feedUrl)}`,
  ];

  for (const row of opts.rows) {
    const ev = opts.toEvent?.(row);
    if (!ev) continue;

    lines.push("BEGIN:VEVENT", `UID:${ev.uid}`, `DTSTAMP:${dtstamp}`);
    if (ev.dtstartUtc && ev.dtendUtc) {
      lines.push(`DTSTART:${ev.dtstartUtc}`);
      lines.push(`DTEND:${ev.dtendUtc}`);
    } else if (ev.date) {
      lines.push(`DTSTART;VALUE=DATE:${ev.date}`);
    } else {
      continue;
    }
    lines.push(`SUMMARY:${escapeText(ev.summary)}`);
    lines.push(`DESCRIPTION:${escapeText(ev.description).slice(0, 900)}`);
    lines.push("TRANSP:TRANSPARENT", "END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
