import fs from "node:fs";
import path from "node:path";
import YahooFinance from "yahoo-finance2";

const ROOT = path.resolve(process.cwd());
const dataPath = path.join(ROOT, "data", "reits-q2.json");
const outReport = path.join(ROOT, "data", "earnings-refresh-report-q2.json");

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Q2 2026 reporting window: July 1 – August 31, 2026
const Q2_START = new Date("2026-07-01T00:00:00Z");
const Q2_END   = new Date("2026-08-31T23:59:59Z");

function isQ2Date(dt) {
  return dt >= Q2_START && dt <= Q2_END;
}

function isCanadianOrComplexTicker(ticker) {
  return ticker.includes(".UN") || ticker.includes(".TO") || ticker.includes(".V");
}

function normalizeTickerForYahoo(ticker, exchange) {
  if (isCanadianOrComplexTicker(ticker)) return null;
  if (exchange === "TSX" && !ticker.endsWith(".TO")) return `${ticker}.TO`;
  return ticker;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(dt) {
  return `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
}

function fmtCallTime(dt) {
  // dt is UTC; convert to ET (UTC-4 in summer)
  const etMs = dt.getTime() - 4 * 60 * 60 * 1000;
  const etDate = new Date(etMs);
  let h = etDate.getUTCHours();
  const m = etDate.getUTCMinutes();
  const ampm = h >= 12 ? "p" : "a";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  const mStr = m === 0 ? "" : `:${String(m).padStart(2, "0")}`;
  return `${h}${mStr}${ampm} ET`;
}

async function fetchQ2Dates(ticker) {
  const qs = await yf.quoteSummary(ticker, { modules: ["calendarEvents"] });
  const e = qs?.calendarEvents?.earnings;
  if (!e) return null;

  const earningsDate = e.earningsDate?.[0] ? new Date(e.earningsDate[0]) : null;
  const earningsCallDate = e.earningsCallDate?.[0] ? new Date(e.earningsCallDate[0]) : null;
  const isEstimate = e.isEarningsDateEstimate ?? true;

  // Case 1: earningsDate is within Q2 window (company hasn't reported yet or just reported)
  if (earningsDate && isQ2Date(earningsDate)) {
    return {
      releaseDate: fmtDate(earningsDate),
      callDateObj: earningsCallDate && isQ2Date(earningsCallDate) ? earningsCallDate : earningsDate,
      isEstimate,
    };
  }

  // Case 2: earningsDate is Q3/Q4 (company already reported Q2); use earningsCallDate for Q2 actuals
  if (earningsCallDate && isQ2Date(earningsCallDate)) {
    return {
      releaseDate: fmtDate(earningsCallDate),
      callDateObj: earningsCallDate,
      isEstimate: false, // if Yahoo has the call date, it happened — it's confirmed
    };
  }

  return null;
}

const rows = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const report = {
  generatedAt: new Date().toISOString(),
  checked: rows.length,
  updated: 0,
  skipped: 0,
  no_data: 0,
  errors: 0,
  rows: [],
};

for (const row of rows) {
  const yTicker = normalizeTickerForYahoo(row.ticker, row.exchange);
  if (!yTicker) {
    report.skipped++;
    report.rows.push({ ticker: row.ticker, action: "skipped", reason: "unsupported ticker format" });
    continue;
  }

  try {
    const result = await fetchQ2Dates(yTicker);
    if (!result) {
      report.no_data++;
      report.rows.push({ ticker: row.ticker, action: "no_data" });
      continue;
    }

    const { releaseDate: newDate, callDateObj, isEstimate } = result;
    const oldDate = String(row.releaseDate).replace(/★/g, "").trim();
    const newStatus = isEstimate ? "EST" : "CONF";
    const newCallDate = `${newDate}, ${fmtCallTime(callDateObj)}`;

    const dateChanged = oldDate !== newDate;
    const statusChanged = row.status !== newStatus;

    if (dateChanged || statusChanged) {
      const oldStatus = row.status;
      row.releaseDate = newDate;
      row.status = newStatus;
      // Update callDate only if it currently has TBD or no time, or if the date changed
      if (/TBD/i.test(row.callDate) || dateChanged) {
        row.callDate = newCallDate;
      }
      report.updated++;
      report.rows.push({
        ticker: row.ticker,
        action: "updated",
        releaseDateFrom: oldDate,
        releaseDateTo: newDate,
        statusFrom: oldStatus,
        statusTo: newStatus,
        callDate: row.callDate,
      });
    } else {
      report.rows.push({ ticker: row.ticker, action: "match", date: newDate, status: newStatus });
    }
  } catch (err) {
    report.errors++;
    report.rows.push({ ticker: row.ticker, action: "error", error: String(err?.message ?? err) });
  }
}

fs.writeFileSync(outReport, JSON.stringify(report, null, 2));
fs.writeFileSync(dataPath, JSON.stringify(rows, null, 2));

console.log(`Done. Updated=${report.updated} No-data=${report.no_data} Errors=${report.errors} Skipped=${report.skipped}`);
console.log(`Report: ${outReport}`);
