"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import styles from "./page.module.css";

// ── Types ──────────────────────────────────────────────────────────────────

type Attendee = "DK" | "SD";

type Meeting = {
  time: string;
  company: string;
  ticker: string;
  type: "1on1" | "2on1" | "3on1";
  floor: string;
  room: string;
  presenters: { name: string; title: string }[];
  attendees: Attendee[];
  sector: string;
  sectorClass: string;
};

// ── Meeting data ───────────────────────────────────────────────────────────

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

// ── Sub-components ─────────────────────────────────────────────────────────

function AttendeeChip({
  id,
  active,
  onToggle,
}: {
  id: Attendee;
  active: boolean;
  onToggle: (id: Attendee) => void;
}) {
  return (
    <span
      className={`rev-chip ${id.toLowerCase()} ${active ? "on" : "off"}`}
      onClick={() => onToggle(id)}
      title={active ? `Remove ${id}` : `Add ${id}`}
    >
      {id}
    </span>
  );
}

// ── Notes cell ─────────────────────────────────────────────────────────────

type NotesCellProps = {
  ticker: string;
  value: string;
  onChange: (ticker: string, value: string) => void;
  onSave: (ticker: string, value: string) => void;
  saveStatus: "idle" | "saving" | "saved";
};

function NotesCell({ ticker, value, onChange, onSave, saveStatus }: NotesCellProps) {
  return (
    <div style={{ width: "100%" }}>
      <textarea
        className={styles.notesArea}
        value={value}
        placeholder="Tap to add notes..."
        onChange={(e) => onChange(ticker, e.target.value)}
        onBlur={(e) => onSave(ticker, e.target.value)}
        rows={3}
        aria-label={`Notes for ${ticker}`}
      />
      <span
        className={`${styles.saveIndicator} ${saveStatus !== "idle" ? styles.show : ""}`}
      >
        {saveStatus === "saving" ? "Saving…" : "Saved"}
      </span>
    </div>
  );
}

// ── Meeting table ──────────────────────────────────────────────────────────

const ALL_ATTENDEES: Attendee[] = ["DK", "SD"];

type MeetingTableProps = {
  meetings: Meeting[];
  notes: Record<string, string>;
  saveStatus: Record<string, "idle" | "saving" | "saved">;
  attendeeOverrides: Record<string, Attendee[]>;
  onNoteChange: (ticker: string, value: string) => void;
  onNoteSave: (ticker: string, value: string) => void;
  onAttendeeToggle: (ticker: string, id: Attendee) => void;
};

function MeetingTable({
  meetings,
  notes,
  saveStatus,
  attendeeOverrides,
  onNoteChange,
  onNoteSave,
  onAttendeeToggle,
}: MeetingTableProps) {
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
          <th className="no-sort" style={{ width: 200 }}>Pre-Meeting Notes</th>
        </tr>
      </thead>
      <tbody>
        {meetings.map((m) => {
          const activeAttendees = attendeeOverrides[m.ticker] ?? m.attendees;
          return (
            <tr key={m.ticker}>
              <td data-label="" className="mono" style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                {m.time}
              </td>
              <td data-label="Ticker">
                <span className="ticker">{m.ticker}</span>
              </td>
              <td data-label="Company" style={{ fontWeight: 600, fontSize: 10.5 }}>
                {m.company}
              </td>
              <td data-label="">
                <span className={`sector-tag ${m.sectorClass}`}>{m.sector}</span>
              </td>
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
              <td data-label="Room" style={{ textAlign: "center" }}>
                <span className="mono" style={{ color: "var(--ink-light)" }}>
                  Fl {m.floor} · {m.room}
                </span>
              </td>
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
              <td data-label="Dexus">
                <div className="reviewer-cell">
                  {ALL_ATTENDEES.map((a) => (
                    <AttendeeChip
                      key={a}
                      id={a}
                      active={activeAttendees.includes(a)}
                      onToggle={(id) => onAttendeeToggle(m.ticker, id)}
                    />
                  ))}
                </div>
              </td>
              <td data-label="Notes">
                <NotesCell
                  ticker={m.ticker}
                  value={notes[m.ticker] ?? ""}
                  onChange={onNoteChange}
                  onSave={onNoteSave}
                  saveStatus={saveStatus[m.ticker] ?? "idle"}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── localStorage helpers ───────────────────────────────────────────────────

const LS_NOTES_KEY = "bmo_2026_notes";
const LS_ATTENDEES_KEY = "bmo_2026_attendees";

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ── Main client component ──────────────────────────────────────────────────

export function BmoConferenceClient() {
  const supabase = getSupabaseBrowser();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, "idle" | "saving" | "saved">>({});
  const [attendeeOverrides, setAttendeeOverrides] = useState<Record<string, Attendee[]>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Load notes from localStorage first (always), then overlay Supabase data
  useEffect(() => {
    const local = lsGet<Record<string, string>>(LS_NOTES_KEY, {});
    setNotes(local);

    if (!supabase) return;
    supabase
      .from("bmo_2026_notes")
      .select("ticker, notes")
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const remote: Record<string, string> = {};
        for (const row of data) remote[row.ticker] = row.notes ?? "";
        setNotes((prev) => ({ ...prev, ...remote }));
      });
  }, [supabase]);

  // Load attendee overrides from localStorage
  useEffect(() => {
    const stored = lsGet<Record<string, Attendee[]>>(LS_ATTENDEES_KEY, {});
    setAttendeeOverrides(stored);
  }, []);

  const handleNoteChange = useCallback((ticker: string, value: string) => {
    setNotes((prev) => ({ ...prev, [ticker]: value }));
  }, []);

  const handleNoteSave = useCallback(
    async (ticker: string, value: string) => {
      if (saveTimers.current[ticker]) clearTimeout(saveTimers.current[ticker]);
      setSaveStatus((prev) => ({ ...prev, [ticker]: "saving" }));

      // Always persist to localStorage
      const stored = lsGet<Record<string, string>>(LS_NOTES_KEY, {});
      stored[ticker] = value;
      lsSet(LS_NOTES_KEY, stored);

      // Also sync to Supabase if configured
      if (supabase) {
        await supabase
          .from("bmo_2026_notes")
          .upsert({ ticker, notes: value, updated_at: new Date().toISOString() });
      }

      setSaveStatus((prev) => ({ ...prev, [ticker]: "saved" }));
      saveTimers.current[ticker] = setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [ticker]: "idle" }));
      }, 1800);
    },
    [supabase],
  );

  const handleAttendeeToggle = useCallback((ticker: string, id: Attendee) => {
    setAttendeeOverrides((prev) => {
      const allMeetings = [...TUESDAY, ...WEDNESDAY];
      const meeting = allMeetings.find((m) => m.ticker === ticker);
      const current = prev[ticker] ?? meeting?.attendees ?? [];
      const next = current.includes(id)
        ? current.filter((a) => a !== id)
        : [...current, id];
      const updated = { ...prev, [ticker]: next };
      lsSet(LS_ATTENDEES_KEY, updated);
      return updated;
    });
  }, []);

  const tuesdayCount = TUESDAY.length;
  const wednesdayCount = WEDNESDAY.length;
  const totalCount = tuesdayCount + wednesdayCount;

  const tableProps = {
    notes,
    saveStatus,
    attendeeOverrides,
    onNoteChange: handleNoteChange,
    onNoteSave: handleNoteSave,
    onAttendeeToggle: handleAttendeeToggle,
  };

  return (
    <div className={`page ${styles.mobilePagePad}`}>
      <header className={styles.mobileHeader}>
        <div>
          <h1 className={styles.mobileH1}>
            BMO <span>2026</span> REAL ASSETS CONFERENCE
          </h1>
          <div className="subhead">
            InterContinental Barclay Hotel &nbsp;·&nbsp; May 12–13, 2026
            &nbsp;·&nbsp; {totalCount} meetings &nbsp;·&nbsp; David Kruth (PM) &amp; Stephanie Do (Analyst)
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
        style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0 6px" }}
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
        <MeetingTable meetings={TUESDAY} {...tableProps} />
      </div>

      {/* Wednesday */}
      <div
        className={styles.dayRow}
        style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 6px" }}
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
        <MeetingTable meetings={WEDNESDAY} {...tableProps} />
      </div>

      <div className="note" style={{ marginTop: 14 }}>
        <span className="dk-inline">DK</span> = David Kruth (PM) &nbsp;|&nbsp;{" "}
        <span className="sd-inline">SD</span> = Stephanie Do (Analyst)
        &nbsp;|&nbsp; All meetings at the InterContinental Barclay Hotel, New York &nbsp;|&nbsp; Schedule subject to change.
      </div>
    </div>
  );
}
