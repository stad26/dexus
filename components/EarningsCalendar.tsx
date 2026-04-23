"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { REIT_ROWS } from "@/lib/reits";
import { SECTOR_LABELS } from "@/lib/sector-labels";
import { seekingAlphaUrl } from "@/lib/links";
import { formatDateMdyFromIso, formatTimeAmPmFromHms, tzLabel } from "@/lib/format";
import {
  getSupabaseBrowser,
  eventOverridesToMap,
  reviewRowsToMap,
  type ReitEventOverrideRow,
  type ReitReviewRow,
} from "@/lib/supabase/client";
import type { ReitRow, ReviewerId, ReviewFlags } from "@/lib/types";
import { EMPTY_REVIEW } from "@/lib/types";

const LOCAL_STORAGE_KEY = "dexus_reit_q1_2026_review";

type UiRow = ReitRow & { callStatus?: "CONF" | "EST" | null };

const COL_TO_SORT: Record<number, keyof ReitRow | null> = {
  1: "name",
  2: "sector",
  3: "releaseDate",
  4: "callDate",
  5: "ticker",
  6: "status",
  7: "notes",
};

function getRev(map: Record<string, ReviewFlags>, ticker: string): ReviewFlags {
  return map[ticker] ?? { ...EMPTY_REVIEW };
}

function loadLocalReview(): Record<string, ReviewFlags> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ReviewFlags>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function saveLocalReview(map: Record<string, ReviewFlags>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function EarningsCalendar() {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const [reviewMap, setReviewMap] = useState<Record<string, ReviewFlags>>(() =>
    loadLocalReview(),
  );
  const [overrides, setOverrides] = useState<Record<string, ReitEventOverrideRow>>(
    {},
  );
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [origin] = useState<string>(() =>
    typeof window === "undefined" ? "" : window.location.origin,
  );
  const [revFilters, setRevFilters] = useState<Record<ReviewerId, boolean>>({
    DK: false,
    DL: false,
    SD: false,
  });
  const [reviewedOnly, setReviewedOnly] = useState(false);
  const [sector, setSector] = useState("");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [ordered, setOrdered] = useState<ReitRow[]>(() => [...REIT_ROWS]);
  const [saveFlash, setSaveFlash] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashSaved = useCallback(() => {
    setSaveFlash(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveFlash(false), 1400);
  }, []);

  const mergeRow = useCallback((row: ReitReviewRow) => {
    setReviewMap((prev) => {
      const next = { ...prev };
      const cur = { ...(next[row.ticker] ?? { ...EMPTY_REVIEW }) };
      cur[row.reviewer] = row.reviewed;
      next[row.ticker] = cur;
      saveLocalReview(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.from("reit_review").select("*");
      if (cancelled) return;
      if (error) {
        console.error(error);
        setSupabaseError(error.message);
        return;
      }
      setSupabaseError(null);
      setReviewMap(reviewRowsToMap((data ?? []) as ReitReviewRow[]));
    })();

    (async () => {
      const { data, error } = await supabase
        .from("reit_event_override")
        .select("*");
      if (cancelled) return;
      if (error) {
        console.error(error);
        setSupabaseError(error.message);
        return;
      }
      setOverrides(eventOverridesToMap((data ?? []) as ReitEventOverrideRow[]));
    })();

    const channel = supabase
      .channel("reit_review_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reit_review" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldRow = payload.old as Partial<ReitReviewRow> | null;
            if (oldRow?.ticker && oldRow.reviewer) {
              setReviewMap((prev) => {
                const next = { ...prev };
                const cur = { ...(next[oldRow.ticker!] ?? { ...EMPTY_REVIEW }) };
                cur[oldRow.reviewer as ReviewerId] = false;
                if (!cur.DK && !cur.DL && !cur.SD) delete next[oldRow.ticker!];
                else next[oldRow.ticker!] = cur;
                saveLocalReview(next);
                return next;
              });
            }
            return;
          }
          const row = payload.new as ReitReviewRow;
          if (row?.ticker && row.reviewer) mergeRow(row);
        },
      )
      .subscribe();

    const overridesChannel = supabase
      .channel("reit_event_override_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reit_event_override" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldRow = payload.old as Partial<ReitEventOverrideRow> | null;
            if (!oldRow?.ticker) return;
            setOverrides((prev) => {
              const next = { ...prev };
              delete next[oldRow.ticker!];
              return next;
            });
            return;
          }
          const row = payload.new as ReitEventOverrideRow;
          if (!row?.ticker) return;
          setOverrides((prev) => ({ ...prev, [row.ticker]: row }));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      supabase.removeChannel(overridesChannel);
    };
  }, [supabase, mergeRow]);

  const toggleRevFilter = (key: ReviewerId) => {
    setRevFilters((f) => ({ ...f, [key]: !f[key] }));
  };

  const toggleReviewedOnly = () => setReviewedOnly((v) => !v);

  const onHeaderClick = (col: number) => {
    const key = COL_TO_SORT[col];
    if (key === undefined || key === null) return;
    const nextDir =
      sortCol === col ? ((sortDir * -1) as 1 | -1) : (1 as 1 | -1);
    setSortCol(col);
    setSortDir(nextDir);
    setOrdered((prev) =>
      [...prev].sort((a, b) => String(a[key]).localeCompare(String(b[key])) * nextDir),
    );
  };

  const activeRev = useMemo(
    () => (["DK", "DL", "SD"] as const).filter((k) => revFilters[k]),
    [revFilters],
  );

  const mergedRows = useMemo<UiRow[]>(() => {
    return ordered.map((r) => {
      const o = overrides[r.ticker];
      if (!o) return r;
      // Prefer structured v2 overrides when present; else fall back to legacy text fields.
      const releaseDate =
        o.release_date_d ? formatDateMdyFromIso(o.release_date_d) : o.release_date ?? r.releaseDate;
      const releaseStatus = o.release_status ?? o.status ?? r.status;
      const releaseNotes = o.release_notes ?? o.notes ?? r.notes;

      const callDate =
        o.call_date_d && o.call_time
          ? `${formatDateMdyFromIso(o.call_date_d)}, ${formatTimeAmPmFromHms(o.call_time)} ${tzLabel(o.call_tz)}`
          : o.call_date ?? r.callDate;

      const callStatus = o.call_status ?? null;
      return {
        ...r,
        releaseDate,
        callDate,
        status: releaseStatus,
        notes: releaseNotes,
        callStatus,
      };
    });
  }, [ordered, overrides]);

  const visibleRows = useMemo(() => {
    const q = search.toLowerCase();
    return mergedRows.filter((r) => {
      const rev = getRev(reviewMap, r.ticker);
      const okSector = !sector || r.sector === sector;
      const okSearch =
        !q ||
        r.ticker.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q);
      const okRev =
        activeRev.length === 0 || activeRev.every((x) => rev[x]);
      const okReviewedOnly =
        !reviewedOnly || rev.DK || rev.DL || rev.SD;
      return okSector && okSearch && okRev && okReviewedOnly;
    });
  }, [mergedRows, reviewMap, sector, search, activeRev, reviewedOnly]);

  const counts = useMemo(() => {
    let dk = 0;
    let dl = 0;
    let sd = 0;
    for (const r of mergedRows) {
      const rev = getRev(reviewMap, r.ticker);
      if (rev.DK) dk++;
      if (rev.DL) dl++;
      if (rev.SD) sd++;
    }
    return { dk, dl, sd, total: mergedRows.length };
  }, [mergedRows, reviewMap]);

  const [editing, setEditing] = useState<ReitRow | null>(null);
  const [editReleaseDate, setEditReleaseDate] = useState(""); // YYYY-MM-DD
  const [editReleaseStatus, setEditReleaseStatus] = useState<"CONF" | "EST">("EST");
  const [editReleaseNotes, setEditReleaseNotes] = useState("");

  const [editCallDate, setEditCallDate] = useState(""); // YYYY-MM-DD
  const [editCallTime, setEditCallTime] = useState(""); // HH:MM
  const [editCallTz, setEditCallTz] = useState<"ET" | "CT" | "PT">("ET");
  const [editCallStatus, setEditCallStatus] = useState<"CONF" | "EST">("EST");

  const startEdit = (row: ReitRow) => {
    setEditing(row);
    // Best-effort: if row came from overrides, prefer those stored values from overrides map.
    const o = overrides[row.ticker];
    setEditReleaseDate(o?.release_date_d ?? "");
    setEditReleaseStatus((o?.release_status ?? row.status) as "CONF" | "EST");
    setEditReleaseNotes(o?.release_notes ?? row.notes ?? "");

    setEditCallDate(o?.call_date_d ?? "");
    setEditCallTime(o?.call_time ? o.call_time.slice(0, 5) : "");
    setEditCallTz((o?.call_tz ?? "ET") as "ET" | "CT" | "PT");
    setEditCallStatus((o?.call_status ?? "EST") as "CONF" | "EST");
  };

  const saveEdit = async () => {
    if (!editing) return;
    const ticker = editing.ticker;
    const payload: ReitEventOverrideRow = {
      ticker,
      // legacy fields (kept for backwards compatibility; we’ll also populate these for display)
      release_date: editReleaseDate ? formatDateMdyFromIso(editReleaseDate) : null,
      call_date:
        editCallDate && editCallTime
          ? `${formatDateMdyFromIso(editCallDate)}, ${editCallTime} ${editCallTz}`
          : null,
      status: editReleaseStatus,
      notes: editReleaseNotes.trim() || null,

      // structured v2
      release_date_d: editReleaseDate || null,
      release_status: editReleaseStatus,
      release_notes: editReleaseNotes.trim() || null,
      call_date_d: editCallDate || null,
      call_time: editCallTime ? `${editCallTime}:00` : null,
      call_tz: editCallTz,
      call_status: editCallStatus,
      call_notes: null,
    };

    if (!supabase) {
      setSupabaseError(
        "Supabase is not configured; deploy with env vars to enable editing sync.",
      );
      return;
    }

    const { error } = await supabase.from("reit_event_override").upsert(
      {
        ...payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "ticker" },
    );
    if (error) {
      console.error(error);
      setSupabaseError(error.message);
      return;
    }
    setSupabaseError(null);
    setEditing(null);
    flashSaved();
  };

  const toggleChip = async (ticker: string, reviewer: ReviewerId) => {
    const current = getRev(reviewMap, ticker)[reviewer];
    const nextVal = !current;

    setReviewMap((prev) => {
      const p = { ...prev };
      const cur = { ...(p[ticker] ?? { ...EMPTY_REVIEW }) };
      cur[reviewer] = nextVal;
      p[ticker] = cur;
      saveLocalReview(p);
      return p;
    });

    if (!supabase) {
      flashSaved();
      return;
    }

    const { error } = nextVal
      ? await supabase.from("reit_review").upsert(
          {
            ticker,
            reviewer,
            reviewed: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "ticker,reviewer" },
        )
      : await supabase
          .from("reit_review")
          .delete()
          .eq("ticker", ticker)
          .eq("reviewer", reviewer);

    if (error) {
      console.error(error);
      setSupabaseError(error.message);
      return;
    }

    setSupabaseError(null);
    flashSaved();
  };

  return (
    <div className="page">
      {!supabase ? (
        <div className="config-banner" role="status">
          <strong>Tip:</strong> Live DK/DL/SD sync is off (Supabase not configured).
          Chips will still work and save in this browser.
        </div>
      ) : supabaseError ? (
        <div className="config-banner" role="status">
          <strong>Supabase error:</strong> {supabaseError}
          <br />
          Chips will still work locally, but won’t sync until this is fixed.
        </div>
      ) : null}

      <header>
        <div>
          <h1>
            NORTH AMERICAN REIT <span>Q1 2026</span> EARNINGS CALENDAR
          </h1>
          <div className="subhead">
            Reporting period: January 1 – March 31, 2026 &nbsp;|&nbsp; Releases:
            April–May 2026
          </div>
        </div>
        <div className="meta">
          Generated: April 14, 2026
          <br />
          Sources: Company IR pages, SEC 8-Ks, press releases
          <br />
          <span className="star">★</span> = Already reported
        </div>
      </header>

      <div className="controls">
        <label>Sector:</label>
        <select value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="">All Sectors</option>
          <option value="industrial">Industrial / Logistics</option>
          <option value="retail">Retail / Shopping</option>
          <option value="healthcare">Healthcare</option>
          <option value="residential">Residential</option>
          <option value="office">Office</option>
          <option value="data-center">Data Center</option>
          <option value="tower">Cell Tower</option>
          <option value="self-storage">Self-Storage</option>
          <option value="net-lease">Net Lease</option>
          <option value="hotel">Hotel / Lodging</option>
          <option value="timber">Timber / Farmland</option>
          <option value="casino">Gaming / Casino</option>
          <option value="mortgage">Mortgage REIT</option>
          <option value="specialty">Specialty</option>
          <option value="canadian">Canadian REIT</option>
        </select>

        <label className="ml">Search:</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ticker or name…"
          className="search"
        />

        <div className="divider" />

        <label>Reviewed by:</label>
        <button
          type="button"
          className={`rev-filter-btn dk ${revFilters.DK ? "on" : ""}`}
          onClick={() => toggleRevFilter("DK")}
        >
          <span className="dot" />
          DK
        </button>
        <button
          type="button"
          className={`rev-filter-btn dl ${revFilters.DL ? "on" : ""}`}
          onClick={() => toggleRevFilter("DL")}
        >
          <span className="dot" />
          DL
        </button>
        <button
          type="button"
          className={`rev-filter-btn sd ${revFilters.SD ? "on" : ""}`}
          onClick={() => toggleRevFilter("SD")}
        >
          <span className="dot" />
          SD
        </button>

        <button
          type="button"
          className={`toggle-btn ${reviewedOnly ? "on" : ""}`}
          onClick={toggleReviewedOnly}
        >
          Reviewed Only
        </button>

        <span className={`save-indicator ${saveFlash ? "show" : ""}`}>
          ✓ Saved
        </span>

        <div className="legend">
          <div className="legend-item">
            <span className="badge-c">CONF</span> Confirmed date
          </div>
          <div className="legend-item">
            <span className="badge-e">EST</span> Estimated
          </div>
        </div>
      </div>

      <div className="ics-row">
        <span className="ics-label">Team calendar (ICS):</span>
        <a className="ics-link" href="/api/calendar.ics">
          https://…/api/calendar.ics
        </a>
        {origin ? (
          <>
            <span className="muted">(desktop)</span>
            <a
              className="ics-link"
              href={origin.replace(/^https?:\/\//, "webcal://") + "/api/calendar.ics"}
            >
              webcal://…
            </a>
          </>
        ) : null}
      </div>

      <table>
        <colgroup>
          <col style={{ width: "3%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead>
          <tr>
            <th className="no-sort">#</th>
            <th
              className={sortCol === 1 ? (sortDir === 1 ? "sort-asc" : "sort-desc") : ""}
              data-col={1}
              onClick={() => onHeaderClick(1)}
            >
              Company
            </th>
            <th
              className={sortCol === 2 ? (sortDir === 1 ? "sort-asc" : "sort-desc") : ""}
              data-col={2}
              onClick={() => onHeaderClick(2)}
            >
              Sector
            </th>
            <th
              className={sortCol === 3 ? (sortDir === 1 ? "sort-asc" : "sort-desc") : ""}
              data-col={3}
              onClick={() => onHeaderClick(3)}
            >
              Release Date
            </th>
            <th
              className={sortCol === 4 ? (sortDir === 1 ? "sort-asc" : "sort-desc") : ""}
              data-col={4}
              onClick={() => onHeaderClick(4)}
            >
              Earnings Call
            </th>
            <th
              className={sortCol === 5 ? (sortDir === 1 ? "sort-asc" : "sort-desc") : ""}
              data-col={5}
              onClick={() => onHeaderClick(5)}
            >
              Ticker
            </th>
            <th
              className={sortCol === 6 ? (sortDir === 1 ? "sort-asc" : "sort-desc") : ""}
              data-col={6}
              onClick={() => onHeaderClick(6)}
            >
              Status
            </th>
            <th
              className={sortCol === 7 ? (sortDir === 1 ? "sort-asc" : "sort-desc") : ""}
              data-col={7}
              onClick={() => onHeaderClick(7)}
            >
              Notes
            </th>
            <th className="no-sort">Seeking Alpha</th>
            <th className="no-sort center">
              Reviewed By
              <div className="th-sub">click to toggle</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((r) => {
            const rowNum = ordered.findIndex((x) => x.ticker === r.ticker) + 1;
            const isReported = r.releaseDate.includes("★");
            const statusBadge = r.status === "CONF" ? "badge-c" : "badge-e";
            const dotClass = r.status === "CONF" ? "confirmed" : "estimated";
            const rev = getRev(reviewMap, r.ticker);
            const anyRev = rev.DK || rev.DL || rev.SD;
            const sa = seekingAlphaUrl(r);

            return (
              <tr key={r.ticker} className={anyRev ? "reviewed-row" : undefined}>
                <td className="row-num">{rowNum}</td>
                <td>
                  {r.name}
                  {isReported ? (
                    <>
                      {" "}
                      <span className="star">★</span>
                    </>
                  ) : null}
                </td>
                <td>
                  <span className={`sector-tag s-${r.sector}`}>
                    {SECTOR_LABELS[r.sector] ?? r.sector}
                  </span>
                </td>
                <td className="mono">
                  <span className={`conf-dot ${dotClass}`} />
                  {r.releaseDate.replace("★", "")}
                </td>
                <td className="mono muted">
                  {r.callDate}{" "}
                  {r.callStatus ? (
                    <span className={r.callStatus === "CONF" ? "badge-c" : "badge-e"}>
                      {r.callStatus}
                    </span>
                  ) : null}
                </td>
                <td className="mono ticker">{r.ticker}</td>
                <td>
                  <span className={statusBadge}>{r.status}</span>
                </td>
                <td className="notes">
                  <span>{r.notes}</span>
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => startEdit(r)}
                    title="Edit release/call info"
                  >
                    Edit
                  </button>
                </td>
                <td className="link-cell">
                  <a href={sa} target="_blank" rel="noreferrer noopener">
                    Seeking Alpha
                  </a>
                </td>
                <td>
                  <div className="reviewer-cell">
                    <button
                      type="button"
                      className={`rev-chip dk ${rev.DK ? "on" : "off"}`}
                      title="David Kruth"
                      onClick={() => void toggleChip(r.ticker, "DK")}
                    >
                      DK
                    </button>
                    <button
                      type="button"
                      className={`rev-chip dl ${rev.DL ? "on" : "off"}`}
                      title="Dennis Liu"
                      onClick={() => void toggleChip(r.ticker, "DL")}
                    >
                      DL
                    </button>
                    <button
                      type="button"
                      className={`rev-chip sd ${rev.SD ? "on" : "off"}`}
                      title="Steph Do"
                      onClick={() => void toggleChip(r.ticker, "SD")}
                    >
                      SD
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {editing ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-head">
              <div className="modal-title">
                Edit {editing.ticker} — {editing.name}
              </div>
              <button
                type="button"
                className="modal-x"
                onClick={() => setEditing(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-grid">
              <div className="modal-col">
                <div className="modal-col-title">Earnings release</div>
                <label className="modal-label">
                  Release date
                  <input
                    className="modal-input"
                    type="date"
                    value={editReleaseDate}
                    onChange={(e) => setEditReleaseDate(e.target.value)}
                  />
                </label>
                <label className="modal-label">
                  Release notes
                  <input
                    className="modal-input"
                    value={editReleaseNotes}
                    onChange={(e) => setEditReleaseNotes(e.target.value)}
                    placeholder="After close"
                  />
                </label>
                <label className="modal-label">
                  Release status
                  <select
                    className="modal-input"
                    value={editReleaseStatus}
                    onChange={(e) =>
                      setEditReleaseStatus(e.target.value as "CONF" | "EST")
                    }
                  >
                    <option value="CONF">CONF</option>
                    <option value="EST">EST</option>
                  </select>
                </label>
              </div>

              <div className="modal-col">
                <div className="modal-col-title">Earnings call</div>
                <label className="modal-label">
                  Call date
                  <input
                    className="modal-input"
                    type="date"
                    value={editCallDate}
                    onChange={(e) => setEditCallDate(e.target.value)}
                  />
                </label>
                <label className="modal-label">
                  Call time
                  <input
                    className="modal-input"
                    type="time"
                    value={editCallTime}
                    onChange={(e) => setEditCallTime(e.target.value)}
                  />
                </label>
                <label className="modal-label">
                  Timezone
                  <select
                    className="modal-input"
                    value={editCallTz}
                    onChange={(e) =>
                      setEditCallTz(e.target.value as "ET" | "CT" | "PT")
                    }
                  >
                    <option value="ET">ET</option>
                    <option value="CT">CT</option>
                    <option value="PT">PT</option>
                  </select>
                </label>
                <label className="modal-label">
                  Call status
                  <select
                    className="modal-input"
                    value={editCallStatus}
                    onChange={(e) =>
                      setEditCallStatus(e.target.value as "CONF" | "EST")
                    }
                  >
                    <option value="CONF">CONF</option>
                    <option value="EST">EST</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-secondary" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="button" className="modal-primary" onClick={() => void saveEdit()}>
                Save
              </button>
            </div>
            <div className="modal-foot">
              Changes save to Supabase and update the table + ICS feed automatically.
            </div>
          </div>
        </div>
      ) : null}

      <div className={`no-results ${visibleRows.length === 0 ? "show" : ""}`}>
        No results match your filters.
      </div>

      <div className="count-bar">
        <span>
          Showing <strong>{visibleRows.length}</strong> of {counts.total} REITs
        </span>
        <span className="cb-dk">DK reviewed: {counts.dk}</span>
        <span className="cb-dl">DL reviewed: {counts.dl}</span>
        <span className="cb-sd">SD reviewed: {counts.sd}</span>
      </div>

      <div className="note">
        <strong>Reviewer key:</strong>
        <span className="dk-inline">DK</span> = David Kruth &nbsp;·&nbsp;
        <span className="dl-inline">DL</span> = Dennis Liu &nbsp;·&nbsp;
        <span className="sd-inline">SD</span> = Steph Do &nbsp;·&nbsp; Toggles sync
        live for everyone when Supabase is configured.{" "}
        <strong>Seeking Alpha</strong> opens the symbol earnings hub. &nbsp;|&nbsp;
        <strong>CONF</strong> = date confirmed via SEC 8-K / company press release
        &nbsp;·&nbsp;
        <strong>EST</strong> = estimated from historical reporting patterns
        &nbsp;·&nbsp;
        <span className="star">★</span> = already reported as of April 14, 2026.
        Call times in ET unless noted.
      </div>
    </div>
  );
}
