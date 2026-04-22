import fs from "node:fs";
import path from "node:path";
import YahooFinance from "yahoo-finance2";

const ROOT = path.resolve(process.cwd());
const dataPath = path.join(ROOT, "data", "reits.json");
const outReport = path.join(ROOT, "data", "earnings-refresh-report.json");

const yf = new YahooFinance();

function isCanadianOrComplexTicker(ticker) {
  return ticker.includes(".UN") || ticker.includes(".TO") || ticker.includes(".V");
}

function normalizeTickerForYahoo(ticker, exchange) {
  if (isCanadianOrComplexTicker(ticker)) return null;
  if (exchange === "TSX" && !ticker.endsWith(".TO")) return `${ticker}.TO`;
  return ticker;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatMonDayYear(dt) {
  const mon = MONTHS[dt.getUTCMonth()];
  const day = String(dt.getUTCDate());
  const year = String(dt.getUTCFullYear());
  return `${mon} ${day}, ${year}`;
}

async function fetchEarningsDate(ticker) {
  // Yahoo: quoteSummary calendarEvents often contains earnings.earningsDate
  const qs = await yf.quoteSummary(ticker, { modules: ["calendarEvents"] });
  const earnings = qs?.calendarEvents?.earnings;
  const list = earnings?.earningsDate;
  const first = Array.isArray(list) ? list[0] : null;
  const seconds = first?.raw ?? null;
  if (!seconds) return null;
  return new Date(seconds * 1000);
}

const rows = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const report = {
  generatedAt: new Date().toISOString(),
  checked: rows.length,
  updated: 0,
  skipped: 0,
  errors: 0,
  rows: [],
};

for (const row of rows) {
  const yTicker = normalizeTickerForYahoo(row.ticker, row.exchange);
  if (!yTicker) {
    report.skipped++;
    report.rows.push({ ticker: row.ticker, yahooTicker: null, action: "skipped", reason: "unsupported ticker format" });
    continue;
  }

  try {
    const dt = await fetchEarningsDate(yTicker);
    if (!dt) {
      report.rows.push({ ticker: row.ticker, yahooTicker: yTicker, action: "no_data" });
      continue;
    }

    const newDate = formatMonDayYear(dt);
    const oldClean = String(row.releaseDate).replace("★", "").trim();

    if (oldClean !== newDate) {
      // Only auto-update if our releaseDate is TBD-ish (or empty) to avoid overwriting confirmed research.
      const canAuto =
        /TBD/i.test(row.callDate) || /TBD/i.test(row.releaseDate) || row.status === "EST";
      if (canAuto) {
        row.releaseDate = row.releaseDate.includes("★") ? `${newDate}★` : newDate;
        report.updated++;
        report.rows.push({ ticker: row.ticker, yahooTicker: yTicker, action: "updated", from: oldClean, to: newDate });
      } else {
        report.rows.push({ ticker: row.ticker, yahooTicker: yTicker, action: "mismatch", from: oldClean, to: newDate });
      }
    } else {
      report.rows.push({ ticker: row.ticker, yahooTicker: yTicker, action: "match" });
    }
  } catch (e) {
    report.errors++;
    report.rows.push({ ticker: row.ticker, yahooTicker: yTicker, action: "error", error: String(e?.message ?? e) });
  }
}

fs.writeFileSync(outReport, JSON.stringify(report, null, 2));
fs.writeFileSync(dataPath, JSON.stringify(rows, null, 2));

console.log(`Done. Updated=${report.updated} Errors=${report.errors} Skipped=${report.skipped}`);
console.log(`Report: ${outReport}`);

