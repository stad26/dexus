import { REIT_ROWS } from "@/lib/reits";
import { buildEarningsIcsCalendar } from "@/lib/ics";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const feedUrl = `${url.origin}/api/calendar.ics`;
  const body = buildEarningsIcsCalendar({
    rows: REIT_ROWS,
    calendarName: "North American REIT — Q1 2026 earnings releases",
    feedUrl,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
    },
  });
}
