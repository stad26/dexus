"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { REIT_ROWS } from "@/lib/reits";
import { SECTOR_LABELS } from "@/lib/sector-labels";
import { seekingAlphaUrl } from "@/lib/links";
import {
  getSupabaseBrowser,
  reviewRowsToMap,
  type ReitReviewRow,
} from "@/lib/supabase/client";
import type { ReitRow, ReviewerId, ReviewFlags } from "@/lib/types";
import { EMPTY_REVIEW } from "@/lib/types";

const COL_TO_SORT: Record<number, keyof ReitRow | null> = {
  1: "name",
  2: "sector",
  3: "releaseDate",
  4: "callDate",
  5: "exchange",
  6: "ticker",
  7: "status",
  8: "notes",
};

function getRev(map: Record<string, ReviewFlags>, ticker: string): ReviewFlags {
  return map[ticker] ?? { ...EMPTY_REVIEW };
}

export function EarningsCalendar() {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const [reviewMap, setReviewMap] = useState<Record<string, ReviewFlags>>({});
  const [revFilters, setRevFilters] = useState<Record<ReviewerId, boolean>>({
    DK: false,
    DL: false,
    SD: false,
  });
  const [reviewedOnly, setReviewedOnly] = useState(false);
  const [sector, setSector] = useState("");
  const [exchange, setExchange] = useState("");
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
        return;
      }
      setReviewMap(reviewRowsToMap((data ?? []) as ReitReviewRow[]));
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

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
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

  const visibleRows = useMemo(() => {
    const q = search.toLowerCase();
    return ordered.filter((r) => {
      const rev = getRev(reviewMap, r.ticker);
      const okSector = !sector || r.sector === sector;
      const okEx = !exchange || r.exchange === exchange;
      const okSearch =
        !q ||
        r.ticker.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q);
      const okRev =
        activeRev.length === 0 || activeRev.every((x) => rev[x]);
      const okReviewedOnly =
        !reviewedOnly || rev.DK || rev.DL || rev.SD;
      return okSector && okEx && okSearch && okRev && okReviewedOnly;
    });
  }, [ordered, reviewMap, sector, exchange, search, activeRev, reviewedOnly]);

  const counts = useMemo(() => {
    let dk = 0;
    let dl = 0;
    let sd = 0;
    for (const r of ordered) {
      const rev = getRev(reviewMap, r.ticker);
      if (rev.DK) dk++;
      if (rev.DL) dl++;
      if (rev.SD) sd++;
    }
    return { dk, dl, sd, total: ordered.length };
  }, [ordered, reviewMap]);

  const toggleChip = async (ticker: string, reviewer: ReviewerId) => {
    const current = getRev(reviewMap, ticker)[reviewer];
    const nextVal = !current;

    if (!supabase) {
      setReviewMap((prev) => {
        const p = { ...prev };
        const cur = { ...(p[ticker] ?? { ...EMPTY_REVIEW }) };
        cur[reviewer] = nextVal;
        p[ticker] = cur;
        return p;
      });
      flashSaved();
      return;
    }

    setReviewMap((prev) => {
      const p = { ...prev };
      const cur = { ...(p[ticker] ?? { ...EMPTY_REVIEW }) };
      cur[reviewer] = nextVal;
      p[ticker] = cur;
      return p;
    });

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
      setReviewMap((prev) => {
        const p = { ...prev };
        const cur = { ...(p[ticker] ?? { ...EMPTY_REVIEW }) };
        cur[reviewer] = current;
        if (!cur.DK && !cur.DL && !cur.SD) delete p[ticker];
        else p[ticker] = cur;
        return p;
      });
      return;
    }

    flashSaved();
  };

  return (
    <div className="page">
      {!supabase ? (
        <div className="config-banner" role="status">
          <strong>Tip:</strong> For live DK/DL/SD sync, add the two Supabase keys
          to <code>.env.local</code> (see <code>.env.example</code>), run the SQL
          in <code>supabase/migrations/</code>, then restart the dev server.
          Until then, chips only stick for this browser.
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

        <label className="ml">Exchange:</label>
        <select value={exchange} onChange={(e) => setExchange(e.target.value)}>
          <option value="">All</option>
          <option value="NYSE">NYSE</option>
          <option value="NASDAQ">NASDAQ</option>
          <option value="TSX">TSX</option>
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
          Subscribe in Outlook / Google Calendar
        </a>
      </div>

      <table>
        <colgroup>
          <col style={{ width: "3%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "4.5%" }} />
          <col style={{ width: "5.5%" }} />
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
              Exch
            </th>
            <th
              className={sortCol === 6 ? (sortDir === 1 ? "sort-asc" : "sort-desc") : ""}
              data-col={6}
              onClick={() => onHeaderClick(6)}
            >
              Ticker
            </th>
            <th
              className={sortCol === 7 ? (sortDir === 1 ? "sort-asc" : "sort-desc") : ""}
              data-col={7}
              onClick={() => onHeaderClick(7)}
            >
              Status
            </th>
            <th
              className={sortCol === 8 ? (sortDir === 1 ? "sort-asc" : "sort-desc") : ""}
              data-col={8}
              onClick={() => onHeaderClick(8)}
            >
              Notes
            </th>
            <th className="no-sort">SA</th>
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
                <td className="mono muted">{r.callDate}</td>
                <td className="exch">{r.exchange}</td>
                <td className="mono ticker">{r.ticker}</td>
                <td>
                  <span className={statusBadge}>{r.status}</span>
                </td>
                <td className="notes">{r.notes}</td>
                <td className="link-cell">
                  <a href={sa} target="_blank" rel="noreferrer noopener">
                    SA
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
        <strong>SA</strong> opens Seeking Alpha (symbol earnings hub). &nbsp;|&nbsp;
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
