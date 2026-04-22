import { DateTime } from "luxon";

const TZ_TO_IANA: Record<string, string> = {
  ET: "America/New_York",
  CT: "America/Chicago",
  PT: "America/Los_Angeles",
  PDT: "America/Los_Angeles",
  PST: "America/Los_Angeles",
};

function parseTimeToken(t: string): { hour: number; minute: number } | null {
  // Examples: "9:00a", "12:00p", "5:30p"
  const m = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])$/i);
  if (!m) return null;
  const rawHour = Number(m[1]);
  const minute = Number(m[2] ?? "0");
  const ap = m[3].toLowerCase();
  if (rawHour < 1 || rawHour > 12) return null;
  if (minute < 0 || minute > 59) return null;
  let hour = rawHour % 12;
  if (ap === "p") hour += 12;
  return { hour, minute };
}

export function callDateToUtcRange(callDate: string): { startUtc: string; endUtc: string } | null {
  // Example inputs:
  // "Apr 29, 2026, 9:00a"
  // "Apr 28, 2026, 11:00a CT"
  // "May 6, 2026, 2:00p PDT"
  // "Apr 28, 2026, TBD"
  const parts = callDate.split(",").map((p) => p.trim());
  if (parts.length < 2) return null;
  const datePart = `${parts[0]} ${parts[1]}`; // "Apr 29 2026"
  const timePartRaw = parts.slice(2).join(",").trim(); // "9:00a" or "11:00a CT" or "TBD"
  if (!timePartRaw || /tbd/i.test(timePartRaw)) return null;

  const timeTokens = timePartRaw.split(/\s+/).filter(Boolean);
  const timeToken = timeTokens[0]?.toLowerCase().replace(/\./g, "") ?? "";
  const tzToken = (timeTokens[1] ?? "ET").toUpperCase();
  const zone = TZ_TO_IANA[tzToken] ?? TZ_TO_IANA.ET;

  const time = parseTimeToken(timeToken);
  if (!time) return null;

  const dtLocal = DateTime.fromFormat(datePart, "LLL d yyyy", { zone }).set({
    hour: time.hour,
    minute: time.minute,
    second: 0,
    millisecond: 0,
  });
  if (!dtLocal.isValid) return null;

  const startUtc = dtLocal.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
  const endUtc = dtLocal.plus({ hours: 1 }).toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
  return { startUtc, endUtc };
}

