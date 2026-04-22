import { REIT_ROWS } from "@/lib/reits";
import { buildEarningsIcsCalendar } from "@/lib/ics";
import { releaseDateToYyyymmdd } from "@/lib/parse-release-date";
import { callDateToUtcRange } from "@/lib/parse-call-datetime";
import { DateTime } from "luxon";
import { createClient } from "@supabase/supabase-js";

type OverrideRow = {
  ticker: string;
  release_date: string | null;
  call_date: string | null;
  status: "CONF" | "EST" | null;
  notes: string | null;
  release_date_d?: string | null;
  release_status?: "CONF" | "EST" | null;
  release_notes?: string | null;
  call_date_d?: string | null;
  call_time?: string | null; // HH:MM:SS
  call_tz?: "ET" | "CT" | "PT" | null;
  call_status?: "CONF" | "EST" | null;
};

function releaseDateWithNotesToUtcRange(releaseDate: string, notes: string) {
  const ymd = releaseDateToYyyymmdd(releaseDate);
  if (!ymd) return null;
  const n = (notes ?? "").toLowerCase();
  // Heuristic defaults (ET):
  // - Before open: 8:00–9:00 ET
  // - After close: 16:15–17:15 ET
  // - Otherwise: 12:00–13:00 ET
  let hour = 12;
  let minute = 0;
  if (n.includes("before open")) {
    hour = 8;
    minute = 0;
  } else if (n.includes("after close")) {
    hour = 16;
    minute = 15;
  }

  const dtLocal = DateTime.fromFormat(ymd, "yyyyMMdd", {
    zone: "America/New_York",
  }).set({ hour, minute, second: 0, millisecond: 0 });
  if (!dtLocal.isValid) return null;
  return {
    startUtc: dtLocal.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'"),
    endUtc: dtLocal.plus({ hours: 1 }).toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'"),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const feedUrl = `${url.origin}/api/calendar.ics`;

  // Pull overrides from Supabase (public read). If env isn't set, just use JSON.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const overrides: Record<string, OverrideRow> = {};
  if (supabaseUrl && supabaseAnon) {
    try {
      const sb = createClient(supabaseUrl, supabaseAnon);
      const { data } = await sb.from("reit_event_override").select("*");
      for (const r of (data ?? []) as unknown as OverrideRow[]) {
        if (r?.ticker) overrides[r.ticker] = r;
      }
    } catch {
      // ignore; feed still works
    }
  }

  const rows = REIT_ROWS.map((r) => {
    const o = overrides[r.ticker];
    if (!o) return r;
    // If structured release fields exist, format them into the legacy string fields used by the UI/ICS.
    const releaseDate =
      o.release_date_d
        ? DateTime.fromISO(o.release_date_d, { zone: "utc" }).toFormat("LLL d, yyyy")
        : o.release_date ?? r.releaseDate;

    const releaseNotes = o.release_notes ?? o.notes ?? r.notes;

    let callDate = o.call_date ?? r.callDate;
    if (o.call_date_d && o.call_time) {
      const tz = o.call_tz ?? "ET";
      const dt = DateTime.fromISO(o.call_date_d, { zone: "utc" });
      const dateStr = dt.isValid ? dt.toFormat("LLL d, yyyy") : o.call_date_d;
      const t = DateTime.fromFormat(o.call_time, "HH:mm:ss", { zone: "utc" });
      const timeStr = t.isValid ? t.toFormat("h:mma").toLowerCase() : o.call_time;
      callDate = `${dateStr}, ${timeStr} ${tz}`;
    }
    return {
      ...r,
      releaseDate,
      callDate,
      status: o.release_status ?? o.status ?? r.status,
      notes: releaseNotes,
    };
  });

  const body = buildEarningsIcsCalendar({
    rows,
    calendarName: "North American REIT — Q1 2026 earnings calls",
    feedUrl,
    toEvent: (row) => {
      const statusLabel = row.status === "CONF" ? "Confirmed" : "Estimated";
      const summary = `${row.ticker} — Q1 2026 earnings call (${statusLabel})`;
      const uid = `reit-q1-2026-call-${row.ticker.replace(/[^A-Za-z0-9.-]/g, "")}@dexus-reit-calendar`;

      const descLines = [
        row.name,
        `Call: ${row.callDate}`,
        `Release: ${row.releaseDate.replace(/★/g, "")}`,
        `Exchange: ${row.exchange}`,
        `Notes: ${row.notes}`,
      ];

      const timed = callDateToUtcRange(row.callDate);
      if (timed) {
        return {
          uid,
          summary,
          description: descLines.join("\n"),
          dtstartUtc: timed.startUtc,
          dtendUtc: timed.endUtc,
        };
      }

      // Fallback: infer a reasonable time window from release notes (before open / after close)
      const inferred = releaseDateWithNotesToUtcRange(row.releaseDate, row.notes);
      if (inferred) {
        return {
          uid,
          summary,
          description: descLines.join("\n"),
          dtstartUtc: inferred.startUtc,
          dtendUtc: inferred.endUtc,
        };
      }

      // Last resort: all-day placeholder on release date
      const ymd = releaseDateToYyyymmdd(row.releaseDate);
      if (!ymd) return null;
      return {
        uid,
        summary,
        description: descLines.join("\n"),
        date: ymd,
      };
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // Shorter cache so subscriptions pick up edits quickly.
      "Cache-Control": "public, max-age=300",
      "Content-Disposition": "inline; filename=\"reit-q1-2026.ics\"",
    },
  });
}
