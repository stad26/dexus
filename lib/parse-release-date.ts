const MONTHS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

/** Returns YYYYMMDD in UTC calendar date parts for all-day ICS, or null if unparsable. */
export function releaseDateToYyyymmdd(releaseDate: string): string | null {
  const cleaned = releaseDate.replace(/★/g, "").trim();
  const m = cleaned.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/);
  if (!m) return null;
  const mon = MONTHS[m[1]];
  if (!mon) return null;
  const day = m[2].padStart(2, "0");
  const year = m[3];
  return `${year}${mon}${day}`;
}
