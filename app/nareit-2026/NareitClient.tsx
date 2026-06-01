"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// ── Types ──────────────────────────────────────────────────────────────────

type Attendee = "DK" | "SD";
const ALL_ATTENDEES: Attendee[] = ["DK", "SD"];

type CorpAttendee = { name: string; title: string };

type NareitMeeting = {
  id: string; // unique key for notes/attendees (e.g. "bmo-rexr")
  company: string;
  ticker: string;
  broker: "BMO" | "JPM";
  isVirtual?: boolean; // JPM Teams meetings
  defaultAttendees: Attendee[];
  sector: string;
  sectorClass: string;
  location?: string;
  corpAttendees?: CorpAttendee[];
  jpmAttendee?: string;
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
  extras?: { location?: string; corpAttendees?: CorpAttendee[] },
): NareitMeeting {
  return { id, ticker, company, broker: "BMO", sector, sectorClass, defaultAttendees, ...extras };
}

function jpm(
  id: string,
  ticker: string,
  company: string,
  sector: string,
  sectorClass: string,
  defaultAttendees: Attendee[] = [],
  isVirtual = false,
  extras?: { location?: string; corpAttendees?: CorpAttendee[]; jpmAttendee?: string },
): NareitMeeting {
  return { id, ticker, company, broker: "JPM", isVirtual, sector, sectorClass, defaultAttendees, ...extras };
}

const TUESDAY: DaySlot[] = [
  {
    kind: "meetings",
    time: "8:00 AM",
    bmo: [],
    jpm: [jpm("jpm-lxp", "LXP", "LXP Industrial Trust", "Industrial", "s-industrial", ["DK", "SD"], false, {
      location: "New York Hilton Midtown · Suite 612",
      jpmAttendee: "Anthony Paolone",
      corpAttendees: [
        { name: "Will Eglin", title: "Chairman & CEO" },
        { name: "Nathan Brunner", title: "Chief Financial Officer" },
        { name: "Brendan Mullinix", title: "EVP, Chief Investment Officer" },
        { name: "James Dudley", title: "EVP, Director of Asset Management" },
      ],
    })],
  },
  {
    kind: "meetings",
    time: "9:00 AM",
    bmo: [
      bmo("bmo-rexr", "REXR", "Rexford Industrial Realty", "Industrial", "s-industrial", ["SD"], {
        location: "Hilton Club · Suite 4225",
        corpAttendees: [
          { name: "Laura Clark", title: "CEO" },
          { name: "Michael Fitzmaurice", title: "" },
          { name: "Mikayla Lynch", title: "IR" },
        ],
      }),
      bmo("bmo-cube", "CUBE", "CubeSmart", "Self Storage", "s-diversified", ["SD"], {
        location: "Hilton Club · Clinton Suite, 2nd Floor",
      }),
    ],
    jpm: [],
  },
  {
    kind: "meetings",
    time: "10:00 AM",
    bmo: [bmo("bmo-esrt", "ESRT", "Empire State Realty Trust", "Office", "s-office", ["SD"], {
      location: "Hilton Club · Networking Room",
    })],
    jpm: [],
  },
  {
    kind: "meetings",
    time: "11:00 AM",
    bmo: [bmo("bmo-egp", "EGP", "EastGroup Properties", "Industrial", "s-industrial", ["SD"], {
      location: "Hilton Club · REITPac Suite",
      corpAttendees: [
        { name: "Staci Tyler", title: "CFO" },
        { name: "Brent Wood", title: "COO" },
        { name: "Casey Edgecombe", title: "IR" },
      ],
    })],
    jpm: [jpm("jpm-akr", "AKR", "Acadia Realty Trust", "Retail", "s-retail", ["DK", "SD"], false, {
      location: "New York Hilton Midtown · Suite 4341",
      jpmAttendee: "Michael Mueller",
      corpAttendees: [
        { name: "John Gottfried", title: "CFO" },
        { name: "John Damoulis", title: "Corporate Finance & Portfolio Analyst" },
      ],
    })],
  },
  {
    kind: "meetings",
    time: "1:00 PM",
    bmo: [
      bmo("bmo-sui", "SUI", "Sun Communities", "Residential", "s-residential", ["SD"], {
        location: "Hilton Club · Suite 4329",
        corpAttendees: [
          { name: "Charles Young", title: "CEO" },
          { name: "John McLaren", title: "COO" },
          { name: "Aaron Weiss", title: "CIO" },
          { name: "Fernando Castro-Caratini", title: "CFO" },
        ],
      }),
      bmo("bmo-trno", "TRNO", "Terreno Realty", "Industrial", "s-industrial", ["SD"], {
        location: "Hilton Club · Networking Room",
      }),
    ],
    jpm: [
      jpm("jpm-cube", "CUBE", "CubeSmart", "Self Storage", "s-diversified", ["DK", "SD"], false, {
        location: "New York Hilton Midtown · FL 2, Clinton Room",
        jpmAttendee: "Michael Mueller",
        corpAttendees: [
          { name: "Chris Marr", title: "CEO" },
          { name: "Tim Martin", title: "CFO" },
          { name: "Josh Schutzer", title: "VP Finance" },
          { name: "Brett Hoffman", title: "SVP Store Operations" },
        ],
      }),
      jpm("jpm-safe", "SAFE", "Safehold", "Net Lease", "s-net-lease", ["DK", "SD"], false, {
        location: "New York Hilton Midtown · Suite 521",
        jpmAttendee: "Anthony Paolone",
        corpAttendees: [
          { name: "Jay Sugarman", title: "Chairman & CEO" },
          { name: "Michael Trachtenberg", title: "President" },
          { name: "Brett Asnas", title: "CFO" },
          { name: "Pearse Hoffman", title: "SVP, Capital Markets & IR" },
        ],
      }),
    ],
  },
  {
    kind: "meetings",
    time: "2:00 PM",
    bmo: [bmo("bmo-frt", "FRT", "Federal Realty Investment Trust", "Retail", "s-retail", ["DK", "SD"], {
      location: "Hilton Club · REITPac Suite",
      corpAttendees: [
        { name: "Don Wood", title: "CEO" },
        { name: "Dan Guglielmone", title: "CFO" },
        { name: "Jill Sawyer", title: "IR" },
      ],
    })],
    jpm: [],
  },
  // KIM + STAG (BMO) and CURB (JPM) concurrent
  {
    kind: "meetings",
    time: "3:00 PM",
    bmo: [
      bmo("bmo-kim", "KIM", "Kimco Realty", "Retail", "s-retail"),
      bmo("bmo-stag", "STAG", "STAG Industrial", "Industrial", "s-industrial", ["SD"], {
        location: "Hilton Club · Suite 506",
      }),
    ],
    jpm: [jpm("jpm-curb", "CURB", "Curbline Properties", "Retail", "s-retail", ["DK", "SD"], false, {
      location: "New York Hilton Midtown · Suite 540",
      jpmAttendee: "Hong Zhang",
      corpAttendees: [
        { name: "David Lukes", title: "CEO" },
        { name: "Conor Fennerty", title: "CFO" },
        { name: "Stephanie Ruys de Perez", title: "VP, Capital Markets" },
      ],
    })],
  },
  {
    kind: "special",
    time: "4:00–6:00 PM",
    label: "REIT Cocktails @ Ocean Prime (patio outdoors) · SD",
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
  {
    kind: "special",
    time: "7:00 PM",
    label: "NAREIT Net Lease Group Dinner · SD",
    subtitle: "La Grand Boucherie",
    color: "#fdf3e3",
  },
];

const WEDNESDAY: DaySlot[] = [
  {
    kind: "meetings",
    time: "8:00 AM",
    bmo: [bmo("bmo-eqix", "EQIX", "Equinix", "Data Center", "s-data-center", ["DK", "SD"], {
      location: "Hilton Club · Suite 4221",
      corpAttendees: [
        { name: "Olivier Leonetti", title: "CFO" },
        { name: "Phillip Konieczny", title: "SVP Finance" },
      ],
    })],
    jpm: [],
  },
  {
    kind: "meetings",
    time: "9:00 AM",
    bmo: [bmo("bmo-hr", "HR", "Healthcare Realty Trust", "Healthcare", "s-healthcare", ["SD"], {
      location: "Hilton Club · Suite 4233",
      corpAttendees: [
        { name: "Pete Scott", title: "CEO" },
        { name: "Dan Gabbay", title: "CFO" },
        { name: "Rob Hull", title: "COO" },
      ],
    })],
    jpm: [],
  },
  {
    kind: "meetings",
    time: "10:00 AM",
    bmo: [],
    jpm: [jpm("jpm-cuz", "CUZ", "Cousins Properties", "Office", "s-office", ["DK", "SD"], false, {
      location: "New York Hilton Midtown · Bellow Lobby, Concourse H",
      jpmAttendee: "Anthony Paolone",
      corpAttendees: [
        { name: "Colin Connolly", title: "CEO" },
        { name: "Gregg Adzema", title: "CFO" },
        { name: "Kennedy Hicks", title: "Chief Investment Officer" },
        { name: "Roni Imbeaux", title: "VP, Finance & IR" },
      ],
    })],
  },
  // BRX (BMO) and IVT (JPM) concurrent at 11 AM
  {
    kind: "meetings",
    time: "11:00 AM",
    bmo: [bmo("bmo-brx", "BRX", "Brixmor Property Group", "Retail", "s-retail", ["DK", "SD"], {
      location: "Hilton Club · REITPac Suite",
      corpAttendees: [
        { name: "Brian Finnegan", title: "CEO" },
        { name: "Steve Gallagher", title: "CFO" },
        { name: "Mark Horgan", title: "CIO" },
        { name: "Stacy Slater", title: "IR" },
      ],
    })],
    jpm: [jpm("jpm-ivt", "IVT", "InvenTrust Properties", "Retail", "s-retail", ["DK", "SD"], false, {
      location: "New York Hilton Midtown · ReitPac Suite",
      jpmAttendee: "Hong Zhang",
      corpAttendees: [
        { name: "Daniel Busch", title: "President & CEO" },
        { name: "Mike Phillips", title: "EVP, CFO & Treasurer" },
        { name: "Christy David", title: "EVP, Chief Operating Officer & General Counsel" },
        { name: "Dave Heimberger", title: "Chief Information Officer" },
      ],
    })],
  },
  {
    kind: "special",
    time: "12:15 PM",
    label: "Lunch · Dexus / BTIG · Mike Gorman",
    subtitle: "Location TBD",
    color: "#f5f0e8",
  },
  {
    kind: "meetings",
    time: "2:00 PM",
    bmo: [bmo("bmo-irt", "IRT", "Independence Realty Trust", "Residential", "s-residential", ["SD"], {
      location: "Bryant · 2nd Floor",
      corpAttendees: [
        { name: "Scott Schaeffer", title: "CEO" },
        { name: "Jim Sebra", title: "CFO" },
      ],
    })],
    jpm: [],
  },
  {
    kind: "meetings",
    time: "4:00 PM",
    bmo: [bmo("bmo-ohi", "OHI", "Omega Healthcare Investors", "Healthcare", "s-healthcare", ["DK", "SD"], {
      location: "Hilton Club · Suite 4240",
      corpAttendees: [
        { name: "Taylor Pickett", title: "CEO" },
        { name: "Vikas Gupta", title: "CIO" },
      ],
    })],
    jpm: [],
  },
  // SBRA meeting concurrent with reception start
  {
    kind: "meetings",
    time: "5:00 PM",
    bmo: [bmo("bmo-sbra", "SBRA", "Sabra Health Care REIT", "Healthcare", "s-healthcare", ["DK", "SD"], {
      location: "Hilton Club · Suite 511",
      corpAttendees: [
        { name: "Rick Matros", title: "CEO" },
        { name: "Michael Costa", title: "CFO" },
        { name: "Darrin Smith", title: "CIO" },
        { name: "Lukas Hartwich", title: "EVP Finance" },
      ],
    })],
    jpm: [],
  },
  {
    kind: "special",
    time: "5:00–8:00 PM",
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
      {meeting.location && (
        <div className={styles.meetingLocation}>{meeting.location}</div>
      )}
      {meeting.jpmAttendee && (
        <div className={styles.meetingJpmContact}>JPM: {meeting.jpmAttendee}</div>
      )}
      {meeting.corpAttendees && meeting.corpAttendees.length > 0 && (
        <details className={styles.corpAttendeesDetails}>
          <summary className={styles.corpAttendeesSummary}>
            {meeting.corpAttendees.length} attendee{meeting.corpAttendees.length !== 1 ? "s" : ""}
          </summary>
          <div className={styles.corpAttendeeList}>
            {meeting.corpAttendees.map((a) => (
              <div key={a.name} className={styles.corpAttendeeItem}>
                <span className={styles.corpAttendeeName}>{a.name}</span>
                <span className={styles.corpAttendeeTitle}>{a.title}</span>
              </div>
            ))}
          </div>
        </details>
      )}
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
