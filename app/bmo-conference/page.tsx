import Link from "next/link";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "BMO 2026 Real Assets Conference — Dexus",
  robots: { index: false, follow: false },
};

type Meeting = {
  time: string;
  company: string;
  ticker: string;
  type: "1on1" | "2on1" | "3on1";
  floor: string;
  room: string;
  presenters: { name: string; title: string }[];
  attendees: ("DK" | "SD")[];
  sector: string;
  sectorClass: string;
};

const TUESDAY: Meeting[] = [
  {
    time: "8:45 – 9:25 AM",
    company: "Easterly Government Properties",
    ticker: "DEA",
    type: "1on1",
    floor: "9th",
    room: "929",
    presenters: [
      { name: "Darrell Crate", title: "CEO" },
      { name: "Allison Marino", title: "CFO" },
      { name: "Cole Bardawill", title: "Director, IR" },
    ],
    attendees: ["DK", "SD"],
    sector: "Gov't / Office",
    sectorClass: "s-office",
  },
  {
    time: "9:30 – 10:10 AM",
    company: "LTC Properties",
    ticker: "LTC",
    type: "1on1",
    floor: "9th",
    room: "958",
    presenters: [
      { name: "Clint Malin", title: "Co-President & Co-CEO" },
      { name: "Pam Kessler", title: "Co-President & Co-CEO" },
      { name: "Cece Chikhale", title: "EVP & CFO" },
    ],
    attendees: ["DK", "SD"],
    sector: "Healthcare",
    sectorClass: "s-healthcare",
  },
  {
    time: "10:15 – 10:55 AM",
    company: "Granite REIT",
    ticker: "GRT.UN",
    type: "2on1",
    floor: "10th",
    room: "1035",
    presenters: [
      { name: "Kevan Gorrie", title: "President & CEO" },
      { name: "Teresa Neto", title: "CFO" },
    ],
    attendees: ["DK", "SD"],
    sector: "Industrial",
    sectorClass: "s-industrial",
  },
  {
    time: "11:00 – 11:40 AM",
    company: "Primaris REIT",
    ticker: "PMZ-UN.TO",
    type: "1on1",
    floor: "9th",
    room: "912",
    presenters: [
      { name: "Alex Avery", title: "CEO" },
      { name: "Rags Davloor", title: "CFO" },
      { name: "Julian Schonfeldt", title: "CIO" },
      { name: "Claire Mahaney", title: "VP, IR & Sustainability" },
    ],
    attendees: ["DK"],
    sector: "Retail",
    sectorClass: "s-retail",
  },
  {
    time: "11:45 AM – 12:25 PM",
    company: "National Health Investors",
    ticker: "NHI",
    type: "1on1",
    floor: "9th",
    room: "962",
    presenters: [
      { name: "Eric Mendelsohn", title: "President & CEO" },
      { name: "John Spaid", title: "EVP, Finance & CFO" },
      { name: "Dana Hambly", title: "VP, Finance & IR" },
    ],
    attendees: ["DK", "SD"],
    sector: "Healthcare",
    sectorClass: "s-healthcare",
  },
  {
    time: "12:30 – 1:10 PM",
    company: "FrontView REIT",
    ticker: "FVR",
    type: "1on1",
    floor: "9th",
    room: "939",
    presenters: [
      { name: "Stephen Preston", title: "CEO" },
      { name: "Pierre Revol", title: "CFO" },
    ],
    attendees: ["DK", "SD"],
    sector: "Net Lease",
    sectorClass: "s-net-lease",
  },
  {
    time: "1:15 – 1:55 PM",
    company: "Equity LifeStyle Properties",
    ticker: "ELS",
    type: "3on1",
    floor: "9th",
    room: "931",
    presenters: [
      { name: "Paul Seavey", title: "EVP & CFO" },
      { name: "Patrick Waite", title: "President & COO" },
      { name: "Adam Leonardi", title: "SVP & Treasurer" },
    ],
    attendees: ["DK", "SD"],
    sector: "Residential",
    sectorClass: "s-residential",
  },
  {
    time: "2:00 – 2:40 PM",
    company: "SmartCentres REIT",
    ticker: "SRU.UN",
    type: "1on1",
    floor: "10th",
    room: "1040",
    presenters: [{ name: "Peter Slan", title: "CFO" }],
    attendees: ["DK", "SD"],
    sector: "Retail",
    sectorClass: "s-retail",
  },
  {
    time: "2:45 – 3:25 PM",
    company: "Boardwalk REIT",
    ticker: "BEI.UN",
    type: "1on1",
    floor: "9th",
    room: "905",
    presenters: [
      { name: "Sam Kolias", title: "CEO Chairman" },
      { name: "Gregg Tinling", title: "CFO" },
      { name: "Vanessa Kolias", title: "VP, Investments & Corp Dev" },
    ],
    attendees: ["DK"],
    sector: "Residential",
    sectorClass: "s-residential",
  },
];

const WEDNESDAY: Meeting[] = [
  {
    time: "9:30 – 10:10 AM",
    company: "Nexus Industrial REIT",
    ticker: "NXR-UN.TO",
    type: "1on1",
    floor: "9th",
    room: "911",
    presenters: [
      { name: "Kelly Hanczyk", title: "CEO" },
      { name: "Mike Rawle", title: "CFO" },
    ],
    attendees: ["DK"],
    sector: "Industrial",
    sectorClass: "s-industrial",
  },
  {
    time: "10:15 – 10:55 AM",
    company: "GO Residential REIT",
    ticker: "GO-U.TO",
    type: "1on1",
    floor: "9th",
    room: "903",
    presenters: [
      { name: "Joshua Gotlib", title: "CEO" },
      { name: "Maxwell Kaufman", title: "COO" },
    ],
    attendees: ["DK", "SD"],
    sector: "Residential",
    sectorClass: "s-residential",
  },
  {
    time: "11:00 – 11:40 AM",
    company: "American Healthcare REIT",
    ticker: "AHR",
    type: "3on1",
    floor: "9th",
    room: "901",
    presenters: [
      { name: "Brian Peay", title: "CFO" },
      { name: "Alan Peterson", title: "VP, IR & Finance" },
    ],
    attendees: ["DK", "SD"],
    sector: "Healthcare",
    sectorClass: "s-healthcare",
  },
];

function AttendeeChip({ id }: { id: "DK" | "SD" }) {
  return (
    <span className={id === "DK" ? "rev-chip dk on" : "rev-chip sd on"}>
      {id}
    </span>
  );
}

function MeetingTable({ meetings }: { meetings: Meeting[] }) {
  return (
    <table style={{ marginBottom: 0 }}>
      <thead>
        <tr>
          <th className="no-sort" style={{ width: 110 }}>Time</th>
          <th className="no-sort" style={{ width: 82 }}>Ticker</th>
          <th className="no-sort">Company</th>
          <th className="no-sort" style={{ width: 80 }}>Sector</th>
          <th className="no-sort center" style={{ width: 46 }}>Type</th>
          <th className="no-sort center" style={{ width: 70 }}>Room</th>
          <th className="no-sort">Management Present</th>
          <th className="no-sort center" style={{ width: 64 }}>Dexus</th>
          <th className="no-sort" style={{ width: 180 }}>Pre-Meeting Notes</th>
        </tr>
      </thead>
      <tbody>
        {meetings.map((m, i) => (
          <tr key={i}>
            {/* Time — on mobile: card header */}
            <td
              data-label=""
              className="mono"
              style={{ whiteSpace: "nowrap", fontWeight: 600 }}
            >
              {m.time}
            </td>

            {/* Ticker */}
            <td data-label="Ticker">
              <span className="ticker">{m.ticker}</span>
            </td>

            {/* Company */}
            <td data-label="Company" style={{ fontWeight: 600, fontSize: 10.5 }}>
              {m.company}
            </td>

            {/* Sector */}
            <td data-label="">
              <span className={`sector-tag ${m.sectorClass}`}>{m.sector}</span>
            </td>

            {/* Type */}
            <td data-label="Type" style={{ textAlign: "center" }}>
              <span
                className="mono"
                style={{
                  fontSize: 9,
                  background: "#eeeae2",
                  borderRadius: 3,
                  padding: "1px 6px",
                  color: "var(--ink-light)",
                  fontWeight: 600,
                }}
              >
                {m.type}
              </span>
            </td>

            {/* Room */}
            <td data-label="Room" style={{ textAlign: "center" }}>
              <span className="mono" style={{ color: "var(--ink-light)" }}>
                Fl {m.floor} · {m.room}
              </span>
            </td>

            {/* Presenters */}
            <td data-label="Mgmt">
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {m.presenters.map((p, j) => (
                  <div key={j} style={{ fontSize: 10, lineHeight: 1.3 }}>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>{" "}
                    <span style={{ color: "var(--ink-light)", fontSize: 9 }}>
                      {p.title}
                    </span>
                  </div>
                ))}
              </div>
            </td>

            {/* Dexus attendees */}
            <td data-label="Dexus">
              <div className="reviewer-cell">
                {m.attendees.map((a) => (
                  <AttendeeChip key={a} id={a} />
                ))}
              </div>
            </td>

            {/* Pre-meeting notes — hidden on mobile via CSS */}
            <td data-label="Notes">
              <div
                style={{
                  fontSize: 9,
                  color: "var(--ink-light)",
                  fontStyle: "italic",
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function BmoConferencePage() {
  const tuesdayCount = TUESDAY.length;
  const wednesdayCount = WEDNESDAY.length;
  const totalCount = tuesdayCount + wednesdayCount;

  return (
    <div className={`page ${styles.mobilePagePad}`}>
      <header className={styles.mobileHeader}>
        <div>
          <h1 className={styles.mobileH1}>
            BMO <span>2026</span> REAL ASSETS CONFERENCE
          </h1>
          <div className="subhead">
            InterContinental Barclay Hotel &nbsp;·&nbsp; May 12–13, 2026
            &nbsp;·&nbsp; {totalCount} meetings &nbsp;·&nbsp; David Kruth
            (PM) &amp; Stephanie Do (Analyst)
          </div>
        </div>
        <div className={`meta ${styles.mobileMeta}`}>
          <Link href="/" className="ics-link">
            ← Earnings Calendar
          </Link>
          <br />
          BMO Capital Markets
          <br />
          Dexus Asset Management
        </div>
      </header>

      {/* Tuesday */}
      <div
        className={styles.dayRow}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          margin: "14px 0 6px",
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            fontWeight: 600,
            color: "white",
            background: "var(--accent)",
            padding: "3px 10px",
            borderRadius: 3,
            letterSpacing: "0.4px",
          }}
        >
          TUESDAY · MAY 12, 2026
        </div>
        <span className="mono" style={{ fontSize: 9, color: "var(--ink-light)" }}>
          {tuesdayCount} meetings · 8:45 AM – 3:25 PM
        </span>
      </div>

      <div className={styles.tableWrap}>
        <MeetingTable meetings={TUESDAY} />
      </div>

      {/* Wednesday */}
      <div
        className={styles.dayRow}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          margin: "18px 0 6px",
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            fontWeight: 600,
            color: "white",
            background: "var(--accent2)",
            padding: "3px 10px",
            borderRadius: 3,
            letterSpacing: "0.4px",
          }}
        >
          WEDNESDAY · MAY 13, 2026
        </div>
        <span className="mono" style={{ fontSize: 9, color: "var(--ink-light)" }}>
          {wednesdayCount} meetings · 9:30 – 11:40 AM
        </span>
      </div>

      <div className={styles.tableWrap}>
        <MeetingTable meetings={WEDNESDAY} />
      </div>

      <div className="note" style={{ marginTop: 14 }}>
        <span className="dk-inline">DK</span> = David Kruth (PM) &nbsp;|&nbsp;{" "}
        <span className="sd-inline">SD</span> = Stephanie Do (Analyst)
        &nbsp;|&nbsp; All meetings at the InterContinental Barclay Hotel, New
        York &nbsp;|&nbsp; Schedule subject to change.
      </div>
    </div>
  );
}
