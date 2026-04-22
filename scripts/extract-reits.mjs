import fs from "node:fs";

const htmlPath =
  process.argv[2] ?? "C:/Users/steph/Downloads/REIT_Q1_2026_Earnings_Calendar.html";
const html = fs.readFileSync(htmlPath, "utf8");
const marker = "const reits = ";
const start = html.indexOf(marker);
if (start < 0) throw new Error("const reits not found");
let i = start + marker.length;
if (html[i] !== "[") throw new Error("expected [");
let depth = 0;
let end = -1;
for (; i < html.length; i++) {
  const c = html[i];
  if (c === "[") depth++;
  else if (c === "]") {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
if (end < 0) throw new Error("unclosed array");

const code = html.slice(start + marker.length, end + 1);
const reits = eval(code);
const seen = new Set();
const rows = [];
for (const r of reits) {
  if (seen.has(r[0])) continue;
  seen.add(r[0]);
  rows.push({
    ticker: r[0],
    name: r[1],
    sector: r[2],
    releaseDate: r[3],
    callDate: r[4],
    exchange: r[5],
    status: r[6],
    notes: r[7],
  });
}

const outDir = new URL("../data/", import.meta.url);
fs.mkdirSync(outDir, { recursive: true });
const outFile = new URL("../data/reits.json", import.meta.url);
fs.writeFileSync(outFile, JSON.stringify(rows, null, 2));
console.log("Wrote", rows.length, "rows to", outFile.pathname);
