"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// ── Types ──────────────────────────────────────────────────────────────────

type Attendee = "DK" | "SD";
const ALL_ATTENDEES: Attendee[] = ["DK", "SD"];

type NareitMeeting = {
  id: string; // unique key for notes/attendees (e.g. "bmo-rexr")
  company: string;
  ticker: string;
  broker: "BMO" | "JPM";
  isVirtual?: boolean; // JPM Teams meetings
  defaultAttendees: Attendee[];
  sector: string;
  sectorClass: string;
};

// A slot where one or more BMO + JPM meetings run concurrently
type MeetingSlot = {
  kind: "meetings";
  time: string;
  bmo: NareitMeeting[];
  jpm: NareitMeeting[];
};

type EventAttendee = {
  name: string;
  title: string;
  firm: string;
  bio: string;
  group: "investor" | "bmo";
};

// A special full-row event (networking, reception, etc.)
type SpecialSlot = {
  kind: "special";
  time: string;
  label: string;
  subtitle?: string;
  color?: string; // override background
  attendees?: EventAttendee[];
};

type DaySlot = MeetingSlot | SpecialSlot;

// ── Schedule data ──────────────────────────────────────────────────────────

function bmo(
  id: string,
  ticker: string,
  company: string,
  sector: string,
  sectorClass: string,
  defaultAttendees: Attendee[] = [],
): NareitMeeting {
  return { id, ticker, company, broker: "BMO", sector, sectorClass, defaultAttendees };
}

function jpm(
  id: string,
  ticker: string,
  company: string,
  sector: string,
  sectorClass: string,
  defaultAttendees: Attendee[] = [],
  isVirtual = false,
): NareitMeeting {
  return { id, ticker, company, broker: "JPM", isVirtual, sector, sectorClass, defaultAttendees };
}

const TUESDAY: DaySlot[] = [
  {
    kind: "meetings",
    time: "8:00 AM",
    bmo: [],
    jpm: [jpm("jpm-lxp", "LXP", "LXP Industrial Trust", "Industrial", "s-industrial")],
  },
  {
    kind: "meetings",
    time: "9:00 AM",
    bmo: [bmo("bmo-rexr", "REXR", "Rexford Industrial Realty", "Industrial", "s-industrial", ["SD"])],
    jpm: [],
  },
  {
    kind: "meetings",
    time: "10:00 AM",
    bmo: [bmo("bmo-esrt", "ESRT", "Empire State Realty Trust", "Office", "s-office")],
    jpm: [jpm("jpm-cuz", "CUZ", "Cousins Properties", "Office", "s-office", ["DK"], true)],
  },
  {
    kind: "meetings",
    time: "11:00 AM",
    bmo: [bmo("bmo-egp", "EGP", "EastGroup Properties", "Industrial", "s-industrial", ["SD"])],
    jpm: [jpm("jpm-akr", "AKR", "Acadia Realty Trust", "Retail", "s-retail", ["SD"])],
  },
  {
    kind: "meetings",
    time: "1:00 PM",
    bmo: [bmo("bmo-sui", "SUI", "Sun Communities", "Residential", "s-residential", ["SD"])],
    jpm: [jpm("jpm-safe", "SAFE", "Safehold", "Net Lease", "s-net-lease", ["SD"])],
  },
  {
    kind: "meetings",
    time: "2:00 PM",
    bmo: [bmo("bmo-frt", "FRT", "Federal Realty Investment Trust", "Retail", "s-retail", ["SD"])],
    jpm: [],
  },
  // KIM (BMO) and CURB (JPM) concurrent
  {
    kind: "meetings",
    time: "3:00 PM",
    bmo: [bmo("bmo-kim", "KIM", "Kimco Realty", "Retail", "s-retail")],
    jpm: [jpm("jpm-curb", "CURB", "Curbline Properties", "Retail", "s-retail", ["SD"])],
  },
  {
    kind: "special",
    time: "4:00–6:00 PM",
    label: "REIT Cocktails @ Ocean Prime (patio outdoors)",
    subtitle: "Ocean Prime · Swing by when you can!",
    color: "#e8f4f0",
    attendees: [
      {
        name: "Alysia Rodgers", firm: "Calvert Research & Management", group: "investor",
        title: "VP, Real Estate Responsible Investing",
        bio: "Leads real estate responsible investing at Calvert (Morgan Stanley), applying ESG principles to REIT evaluation and impact investing.",
      },
      {
        name: "Valeria Loo-Kung", firm: "DWS Group", group: "investor",
        title: "Equity Analyst",
        bio: "Covers real estate equities at DWS; prior experience at BMO Capital Markets, Blackstone's LivCor, and urban planning.",
      },
      {
        name: "Ying Zheng", firm: "Schonfeld Strategic Advisors", group: "investor",
        title: "Analyst",
        bio: "REIT-focused analyst within Schonfeld's fundamental equity pod; multi-strategy hedge fund with ~$14B AUM.",
      },
      {
        name: "Diane Wade, CFA", firm: "CBRE Investment Management", group: "investor",
        title: "Head of Sustainability, Listed Securities",
        bio: "Leads sustainability for CBRE IM's listed real assets strategies; co-chairs the Listed Real Assets Sustainability Committee.",
      },
      {
        name: "Kristin Brown", firm: "First Sentier Investors", group: "investor",
        title: "Investor Relations Officer",
        bio: "IRO at First Sentier with a sell-side REIT research background; bridges equity analysis expertise with institutional investor relations.",
      },
      {
        name: "Dana Guess", firm: "BlackRock", group: "investor",
        title: "VP, Investment Stewardship",
        bio: "Part of BlackRock's Investment Stewardship team, engaging with companies on governance, sustainability, and shareholder interests.",
      },
      {
        name: "Jennifer Zhao", firm: "AEW Capital Management", group: "investor",
        title: "VP, Real Estate Securities",
        bio: "Covers listed REITs at AEW Capital Management, one of the world's largest real estate investment managers (~$90B AUM).",
      },
      {
        name: "Christina Chiu", firm: "Empire State Realty Trust", group: "investor",
        title: "President",
        bio: "Promoted to President of ESRT in Feb 2024 after serving as CFO/COO; prior 18 years at Morgan Stanley as MD overseeing global listed real assets.",
      },
      {
        name: "Alua Askarbek, CFA", firm: "Omega Healthcare Investors", group: "investor",
        title: "Director, Corporate Development",
        bio: "Leads corporate development at Omega Healthcare (OHI), a healthcare REIT focused on skilled nursing and senior living; previously at BlackRock in global real asset securities.",
      },
      {
        name: "Jessica Long", firm: "NAREIT", group: "investor",
        title: "SVP, Environmental Stewardship & Sustainability",
        bio: "NAREIT's sustainability lead; staff liaison for the Real Estate Sustainability Council and steward of environmental programs for member REITs.",
      },
      {
        name: "Laura Rapaport", firm: "North Bridge", group: "investor",
        title: "Founder & CEO",
        bio: "Founded North Bridge in 2021, a NYC-based C-PACE lender providing sustainable financing to institutional CRE borrowers; ex-L&L Holding and Tishman Speyer.",
      },
      {
        name: "Robin Fisher", firm: "Blace", group: "investor",
        title: "Founder & CEO",
        bio: "Founded Blace, an event-tech marketplace connecting clients with premium venues and experiences; named LA Magazine 2024 Woman of Impact.",
      },
      {
        name: "Jill Sawyer", firm: "Federal Realty Investment Trust", group: "investor",
        title: "SVP, Head of Investor Relations",
        bio: "Leads IR at Federal Realty (FRT); 15+ years spanning IR, capital markets, and equity research.",
      },
      { name: "John P. Kim",      firm: "BMO Capital Markets", group: "bmo",
        title: "Managing Director, Senior REIT Analyst",
        bio: "Covering U.S. and APAC REITs since 2002; prior stints at CLSA and BofA Merrill Lynch leading top-ranked Asia property research.",
      },
      { name: "Juan Sanabria",    firm: "BMO Capital Markets", group: "bmo",
        title: "Managing Director, Senior REIT Analyst",
        bio: "Covers 70+ listed U.S. REITs; ex-Head of IR at Ventas and BofA equity analyst; recognized for climate-risk real estate research.",
      },
      { name: "Ari Klein",        firm: "BMO Capital Markets", group: "bmo",
        title: "Director, Equity Research",
        bio: "Covers ~27 REIT and real estate stocks at BMO; prior experience at Bank of America.",
      },
      { name: "Eric Borden",      firm: "BMO Capital Markets", group: "bmo",
        title: "VP, Equity Research",
        bio: "Covers net lease and diversified REITs (STAG, ADC, EPRT); recently initiated on FrontView REIT with Outperform.",
      },
      { name: "Victoria DeOdene", firm: "BMO Capital Markets", group: "bmo",
        title: "Associate, Equity Sales",
        bio: "Equity sales desk at BMO Capital Markets, supporting institutional real estate and financial sector clients.",
      },
      { name: "Jacqueline Beer",  firm: "BMO Capital Markets", group: "bmo",
        title: "MD, Head of Strategic Initiatives & Partnerships",
        bio: "15+ years across strategy, innovation, PE, investment banking, and management consulting at BMO.",
      },
      { name: "Nana Petrosyan",   firm: "BMO Capital Markets", group: "bmo",
        title: "Research/Onboarding Coordinator, Equity Sales",
        bio: "Supports BMO's equity sales team with research coordination and client onboarding.",
      },
    ],
  },
];

const WEDNESDAY: DaySlot[] = [
  {
    kind: "meetings",
    time: "8:00 AM",
    bmo: [bmo("bmo-eqix", "EQIX", "Equinix", "Data Center", "s-data-center")],
    jpm: [],
  },
  {
    kind: "meetings",
    time: "9:00 AM",
    bmo: [bmo("bmo-hr", "HR", "Healthcare Realty Trust", "Healthcare", "s-healthcare")],
    jpm: [],
  },
  // BRX (BMO) and IVT (JPM) concurrent at 11 AM
  {
    kind: "meetings",
    time: "11:00 AM",
    bmo: [bmo("bmo-brx", "BRX", "Brixmor Property Group", "Retail", "s-retail")],
    jpm: [jpm("jpm-ivt", "IVT", "InvenTrust Properties", "Retail", "s-retail", ["DK"], true)],
  },
  {
    kind: "meetings",
    time: "1:00 PM",
    bmo: [],
    jpm: [jpm("jpm-tbc", "TBC", "To Be Confirmed", "Diversified", "s-diversified")],
  },
  {
    kind: "meetings",
    time: "2:00 PM",
    bmo: [bmo("bmo-irt", "IRT", "Independence Realty Trust", "Residential", "s-residential")],
    jpm: [],
  },
  {
    kind: "meetings",
    time: "4:00 PM",
    bmo: [bmo("bmo-ohi", "OHI", "Omega Healthcare Investors", "Healthcare", "s-healthcare")],
    jpm: [],
  },
  // SBRA meeting concurrent with reception start
  {
    kind: "meetings",
    time: "5:00 PM",
    bmo: [bmo("bmo-sbra", "SBRA", "Sabra Health Care REIT", "Healthcare", "s-healthcare")],
    jpm: [],
  },
  {
    kind: "special",
    time: "5:00 PM",
    label: "BMO REITweek Reception 2026",
    subtitle: "Mastro's Steakhouse · 1285 6th Ave, New York, NY 10019",
    color: "#f0e8f5",
  },
];

// ── localStorage helpers ───────────────────────────────────────────────────

const LS_NOTES = "nareit_2026_notes";
const LS_ATTENDEES = "nareit_2026_attendees";

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
    /* ignore */
  }
}

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

type MeetingCardProps = {
  meeting: NareitMeeting;
  noteValue: string;
  noteStatus: "idle" | "saving" | "saved";
  activeAttendees: Attendee[];
  onNoteChange: (id: string, value: string) => void;
  onNoteSave: (id: string, value: string) => void;
  onAttendeeToggle: (id: string, a: Attendee) => void;
};

function MeetingCard({
  meeting,
  noteValue,
  noteStatus,
  activeAttendees,
  onNoteChange,
  onNoteSave,
  onAttendeeToggle,
}: MeetingCardProps) {
  const isBmo = meeting.broker === "BMO";
  return (
    <div className={`${styles.card} ${isBmo ? styles.cardBmo : styles.cardJpm}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardLeft}>
          <span className={`ticker ${isBmo ? styles.tickerBmo : styles.tickerJpm}`}>
            {meeting.ticker}
          </span>
          {meeting.isVirtual && (
            <span className={styles.virtualBadge} title="Microsoft Teams">Teams</span>
          )}
        </div>
        <div className={styles.cardAttendees}>
          {ALL_ATTENDEES.map((a) => (
            <AttendeeChip
              key={a}
              id={a}
              active={activeAttendees.includes(a)}
              onToggle={(id) => onAttendeeToggle(meeting.id, id)}
            />
          ))}
        </div>
      </div>
      <div className={styles.cardCompany}>{meeting.company}</div>
      <span className={`sector-tag ${meeting.sectorClass}`}>{meeting.sector}</span>
      <textarea
        className={styles.notesArea}
        value={noteValue}
        placeholder="Add notes…"
        rows={2}
        onChange={(e) => onNoteChange(meeting.id, e.target.value)}
        onBlur={(e) => onNoteSave(meeting.id, e.target.value)}
        aria-label={`Notes for ${meeting.ticker}`}
      />
      {noteStatus !== "idle" && (
        <span className={styles.saveIndicator}>
          {noteStatus === "saving" ? "Saving…" : "Saved ✓"}
        </span>
      )}
    </div>
  );
}

// ── Day table ──────────────────────────────────────────────────────────────

type DayTableProps = {
  slots: DaySlot[];
  notes: Record<string, string>;
  saveStatus: Record<string, "idle" | "saving" | "saved">;
  attendeeOverrides: Record<string, Attendee[]>;
  onNoteChange: (id: string, value: string) => void;
  onNoteSave: (id: string, value: string) => void;
  onAttendeeToggle: (id: string, a: Attendee) => void;
};

function DayTable({
  slots,
  notes,
  saveStatus,
  attendeeOverrides,
  onNoteChange,
  onNoteSave,
  onAttendeeToggle,
}: DayTableProps) {
  return (
    <table className={styles.dayTable}>
      <thead>
        <tr>
          <th style={{ width: 72 }}>Time</th>
          <th className={styles.thBmo}>BMO</th>
          <th className={styles.thJpm}>JPM</th>
        </tr>
      </thead>
      <tbody>
        {slots.map((slot, i) => {
          if (slot.kind === "special") {
            const investors = slot.attendees?.filter((a) => a.group === "investor") ?? [];
            const bmoAttendees = slot.attendees?.filter((a) => a.group === "bmo") ?? [];
            return (
              <tr key={i} className={styles.specialRow}>
                <td className={`mono ${styles.timeCell}`}>{slot.time}</td>
                <td
                  colSpan={2}
                  className={styles.specialCell}
                  style={slot.color ? { background: slot.color } : undefined}
                >
                  <span className={styles.specialLabel}>{slot.label}</span>
                  {slot.subtitle && (
                    <span className={styles.specialSub}>{slot.subtitle}</span>
                  )}
                  {slot.attendees && slot.attendees.length > 0 && (
                    <details className={styles.attendeeDetails}>
                      <summary className={styles.attendeeSummary}>
                        {slot.attendees.length} attendees
                      </summary>
                      {investors.length > 0 && (
                        <>
                          <div className={styles.attendeeGroupLabel}>Investors &amp; Corporates</div>
                          <div className={styles.attendeeGrid}>
                            {investors.map((a) => (
                              <div key={a.name} className={`${styles.attendeeChip} ${styles.chipPending}`}>
                                <span className={styles.chipName}>{a.name}</span>
                                <span className={styles.chipTitle}>{a.title}</span>
                                <span className={styles.chipFirm}>{a.firm}</span>
                                <span className={styles.chipBio}>{a.bio}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      {bmoAttendees.length > 0 && (
                        <>
                          <div className={styles.attendeeGroupLabel}>BMO Capital Markets</div>
                          <div className={styles.attendeeGrid}>
                            {bmoAttendees.map((a) => (
                              <div key={a.name} className={`${styles.attendeeChip} ${styles.chipBmo}`}>
                                <span className={styles.chipName}>{a.name}</span>
                                <span className={styles.chipTitle}>{a.title}</span>
                                <span className={styles.chipBio}>{a.bio}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </details>
                  )}
                </td>
              </tr>
            );
          }

          const { time, bmo, jpm } = slot;
          const isEmpty = bmo.length === 0 && jpm.length === 0;
          if (isEmpty) return null;

          return (
            <tr key={i} className={styles.meetingRow}>
              <td className={`mono ${styles.timeCell}`}>{time}</td>
              <td className={styles.bmoCell}>
                {bmo.length === 0 ? (
                  <span className={styles.emptySlot}>—</span>
                ) : (
                  <div className={styles.cardStack}>
                    {bmo.map((m) => (
                      <MeetingCard
                        key={m.id}
                        meeting={m}
                        noteValue={notes[m.id] ?? ""}
                        noteStatus={saveStatus[m.id] ?? "idle"}
                        activeAttendees={attendeeOverrides[m.id] ?? m.defaultAttendees}
                        onNoteChange={onNoteChange}
                        onNoteSave={onNoteSave}
                        onAttendeeToggle={onAttendeeToggle}
                      />
                    ))}
                  </div>
                )}
              </td>
              <td className={styles.jpmCell}>
                {jpm.length === 0 ? (
                  <span className={styles.emptySlot}>—</span>
                ) : (
                  <div className={styles.cardStack}>
                    {jpm.map((m) => (
                      <MeetingCard
                        key={m.id}
                        meeting={m}
                        noteValue={notes[m.id] ?? ""}
                        noteStatus={saveStatus[m.id] ?? "idle"}
                        activeAttendees={attendeeOverrides[m.id] ?? m.defaultAttendees}
                        onNoteChange={onNoteChange}
                        onNoteSave={onNoteSave}
                        onAttendeeToggle={onAttendeeToggle}
                      />
                    ))}
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Main client component ──────────────────────────────────────────────────

export function NareitClient() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, "idle" | "saving" | "saved">>({});
  const [attendeeOverrides, setAttendeeOverrides] = useState<Record<string, Attendee[]>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Load from localStorage on mount
  useEffect(() => {
    setNotes(lsGet(LS_NOTES, {}));
    setAttendeeOverrides(lsGet(LS_ATTENDEES, {}));
  }, []);

  const handleNoteChange = useCallback((id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleNoteSave = useCallback((id: string, value: string) => {
    if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
    setSaveStatus((prev) => ({ ...prev, [id]: "saving" }));

    const stored = lsGet<Record<string, string>>(LS_NOTES, {});
    stored[id] = value;
    lsSet(LS_NOTES, stored);

    setSaveStatus((prev) => ({ ...prev, [id]: "saved" }));
    saveTimers.current[id] = setTimeout(() => {
      setSaveStatus((prev) => ({ ...prev, [id]: "idle" }));
    }, 1800);
  }, []);

  const handleAttendeeToggle = useCallback((id: string, a: Attendee) => {
    // Find the meeting's default attendees
    const allMeetings = [
      ...TUESDAY.flatMap((s) => (s.kind === "meetings" ? [...s.bmo, ...s.jpm] : [])),
      ...WEDNESDAY.flatMap((s) => (s.kind === "meetings" ? [...s.bmo, ...s.jpm] : [])),
    ];
    const meeting = allMeetings.find((m) => m.id === id);

    setAttendeeOverrides((prev) => {
      const current = prev[id] ?? meeting?.defaultAttendees ?? [];
      const next = current.includes(a) ? current.filter((x) => x !== a) : [...current, a];
      const updated = { ...prev, [id]: next };
      lsSet(LS_ATTENDEES, updated);
      return updated;
    });
  }, []);

  const tuesdayMeetings = TUESDAY.flatMap((s) =>
    s.kind === "meetings" ? s.bmo.length + s.jpm.length : 0,
  ).reduce((a, b) => a + b, 0);

  const wednesdayMeetings = WEDNESDAY.flatMap((s) =>
    s.kind === "meetings" ? s.bmo.length + s.jpm.length : 0,
  ).reduce((a, b) => a + b, 0);

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
      <header className={styles.pageHeader}>
        <div>
          <h1>
            NAREIT <span>REITweek</span> 2026
          </h1>
          <div className="subhead">
            New York Hilton Midtown &nbsp;·&nbsp; June 2–3, 2026
            &nbsp;·&nbsp; {tuesdayMeetings + wednesdayMeetings} meetings
            &nbsp;·&nbsp; David Kruth (PM) &amp; Stephanie Do (Analyst)
          </div>
        </div>
        <div className="meta" style={{ textAlign: "right" }}>
          <Link href="/bmo-conference" className="ics-link">
            ← BMO Conference
          </Link>
          <br />
          <Link href="/" className="ics-link">
            ← Earnings Calendar
          </Link>
          <br />
          BMO Capital Markets &amp; JPMorgan
          <br />
          Dexus Asset Management
        </div>
      </header>

      <div className={styles.brokerLegend}>
        <span className={styles.legendBmo}>BMO Capital Markets</span>
        <span className={styles.legendJpm}>JPMorgan</span>
        <span className={styles.legendNote}>
          Click <span className="dk-inline">DK</span> / <span className="sd-inline">SD</span> chips to toggle attendance. Notes save automatically.
        </span>
      </div>

      {/* Tuesday */}
      <div className={styles.dayHeader}>
        <div className={styles.dayBadge} style={{ background: "var(--accent)" }}>
          TUESDAY · JUNE 2, 2026
        </div>
        <span className="mono" style={{ fontSize: 9, color: "var(--ink-light)" }}>
          {tuesdayMeetings} meetings · 8:00 AM – 6:00 PM
        </span>
      </div>
      <div className={styles.tableWrap}>
        <DayTable slots={TUESDAY} {...tableProps} />
      </div>

      {/* Wednesday */}
      <div className={styles.dayHeader} style={{ marginTop: 22 }}>
        <div className={styles.dayBadge} style={{ background: "var(--accent2)" }}>
          WEDNESDAY · JUNE 3, 2026
        </div>
        <span className="mono" style={{ fontSize: 9, color: "var(--ink-light)" }}>
          {wednesdayMeetings} meetings · 8:00 AM – 5:00 PM + Reception
        </span>
      </div>
      <div className={styles.tableWrap}>
        <DayTable slots={WEDNESDAY} {...tableProps} />
      </div>

      <div className="note" style={{ marginTop: 14 }}>
        <span className="dk-inline">DK</span> = David Kruth (PM) &nbsp;|&nbsp;{" "}
        <span className="sd-inline">SD</span> = Stephanie Do (Analyst)
        &nbsp;|&nbsp; BMO meetings at The Hilton Club · 1335 6th Ave, New York &nbsp;|&nbsp;
        Times marked TBD — update in the data file once confirmed.
        &nbsp;|&nbsp; Schedule subject to change.
      </div>
    </div>
  );
}
