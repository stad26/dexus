import type { ReitRow } from "@/lib/types";
import { releaseDateToYyyymmdd } from "@/lib/parse-release-date";

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export function buildEarningsIcsCalendar(opts: {
  rows: ReitRow[];
  calendarName: string;
  feedUrl: string;
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
    const ymd = releaseDateToYyyymmdd(row.releaseDate);
    if (!ymd) continue;
    const uid = `reit-q1-2026-release-${row.ticker.replace(/[^A-Za-z0-9.-]/g, "")}@dexus-reit-calendar`;
    const statusLabel = row.status === "CONF" ? "Confirmed" : "Estimated";
    const summary = `${row.ticker} — Q1 2026 earnings (${statusLabel})`;
    const descParts = [
      row.name,
      `Release: ${row.releaseDate.replace(/★/g, "")}`,
      `Call: ${row.callDate}`,
      `Exchange: ${row.exchange}`,
      `Notes: ${row.notes}`,
    ];
    const description = escapeText(descParts.join("\\n")).slice(0, 900);

    lines.push("BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;VALUE=DATE:${ymd}`);
    lines.push(`SUMMARY:${escapeText(summary)}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push("TRANSP:TRANSPARENT", "END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
