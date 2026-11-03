import React, { useState, useMemo } from 'react';
import { dayNum, todayNum, fmtDay, endDay, peakBooked } from '../lib/storeRoomAvailability';
import StoreRoomCalendar from './StoreRoomCalendar';

const SPAN = 28;          // days shown at once
const LABEL_W = 210;
const LANE_H = 30;

const card = { background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' };
const smallBtn = {
  height: 34, padding: '0 1rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
  background: '#fff', color: '#0f62fe', border: '1px solid #0f62fe', cursor: 'pointer',
};

const COLORS = {
  Approved: { background: '#0f62fe', color: '#fff', border: '1px solid #0f62fe' },
  Pending:  { background: '#fcf4d6', color: '#5e4600', border: '1px dashed #b28600' },
  Overdue:  { background: '#da1e28', color: '#fff', border: '1px solid #da1e28' },
};

const range = (r) => `${fmtDay(dayNum(r.needed_from))} – ${fmtDay(dayNum(r.needed_to))}`;
const barKind = (r, today) => (r.status === 'Approved' && dayNum(r.needed_to) < today ? 'Overdue' : r.status);

function Legend() {
  const chip = (k, label) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#393939' }}>
      <span style={{ width: 16, height: 10, borderRadius: 3, ...COLORS[k] }} />{label}
    </span>
  );
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {chip('Approved', 'Approved – item is out')}
      {chip('Pending', 'Pending – not yet approved')}
      {chip('Overdue', 'Overdue – not marked returned')}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#a2191f', fontWeight: 600 }}>
        ⚠ Clash – more booked than in stock
      </span>
    </div>
  );
}

// Compact list used for "Out now" and "Going out soon".
function BookingList({ title, empty, rows, onSelect, today, admin }) {
  return (
    <div style={{ flex: '1 1 340px', minWidth: 0 }}>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>{title} <span style={{ color: '#6f6f6f', fontWeight: 500 }}>({rows.length})</span></h3>
      {rows.length === 0 ? (
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#6f6f6f' }}>{empty}</p>
      ) : rows.map((r) => {
        const overdue = r.status === 'Approved' && dayNum(r.needed_to) < today;
        return (
          <button
            key={r.id} type="button" onClick={() => onSelect(r.id)}
            style={{ display: 'flex', width: '100%', textAlign: 'left', gap: '0.75rem', alignItems: 'center', padding: '0.5rem 0', border: 'none', borderTop: '1px solid #ececec', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 600 }}>{r.item_name} × {r.quantity}</span>
              {admin && (
                <span style={{ display: 'block', fontSize: '0.82rem', color: '#525252' }}>
                  {r.event_name || 'Untitled event'} · {r.requester_name || r.requester_email}
                </span>
              )}
            </span>
            <span style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', color: overdue ? '#a2191f' : '#393939', fontWeight: overdue ? 700 : 500 }}>
              {overdue ? `Overdue – was due ${fmtDay(dayNum(r.needed_to))}` : range(r)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function assignLanes(entries) {
  const sorted = [...entries].sort((a, b) => a.start - b.start || a.end - b.end);
  const laneEnds = [];
  sorted.forEach((e) => {
    let i = laneEnds.findIndex((end) => end < e.start);
    if (i === -1) i = laneEnds.length;
    laneEnds[i] = e.end;
    e.lane = i;
  });
  return { entries: sorted, lanes: Math.max(1, laneEnds.length) };
}

export default function StoreRoomSchedule({ items, reservations, admin, currentUser, onChanged }) {
  const today = todayNum();
  const [winStart, setWinStart] = useState(today - 3);
  const [selectedId, setSelectedId] = useState(null);
  const [showPending, setShowPending] = useState(true);
  const [hideEmpty, setHideEmpty] = useState(true);
  const [q, setQ] = useState('');
  const [mode, setMode] = useState('calendar');
  const winEnd = winStart + SPAN - 1;

  const approved = useMemo(() => reservations.filter((r) => r.status === 'Approved'), [reservations]);
  const outNow = approved
    .filter((r) => dayNum(r.needed_from) <= today)
    .sort((a, b) => dayNum(a.needed_to) - dayNum(b.needed_to));
  const goingOut = approved
    .filter((r) => dayNum(r.needed_from) > today && dayNum(r.needed_from) <= today + 7)
    .sort((a, b) => dayNum(a.needed_from) - dayNum(b.needed_from));

  const live = useMemo(
    () => reservations.filter((r) => r.status === 'Approved' || (showPending && r.status === 'Pending')),
    [reservations, showPending]
  );

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items
      .filter((i) => !term || [i.name, i.category, i.storage_code].some((v) => (v || '').toLowerCase().includes(term)))
      .map((item) => {
        const mine = live.filter((r) => r.item_id === item.id);
        const entries = mine
          .map((r) => ({ r, start: dayNum(r.needed_from), end: r.status === 'Approved' ? endDay(r) : dayNum(r.needed_to) }))
          .filter((e) => e.start != null && e.end != null && e.start <= winEnd && e.end >= winStart);
        const { entries: laid, lanes } = assignLanes(entries);
        const clash = peakBooked(mine, item.id, winStart, winEnd) > item.quantity;
        return { item, entries: laid, lanes, clash };
      })
      .filter((row) => !hideEmpty || row.entries.length > 0);
  }, [items, live, q, hideEmpty, winStart, winEnd]);

  const selected = reservations.find((r) => r.id === selectedId);
  const days = Array.from({ length: SPAN }, (_, i) => winStart + i);
  const isWeekend = (d) => [0, 6].includes(new Date(d * 86400000).getUTCDay());
  const cellBg = (d) => (d === today ? '#e5f0ff' : isWeekend(d) ? '#f4f4f4' : 'transparent');

  const stat = (label, value, danger) => (
    <div style={{ flex: '1 1 140px', background: danger && value > 0 ? '#fff1f1' : '#f4f4f4', borderRadius: 10, padding: '0.75rem 1rem' }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: danger && value > 0 ? '#a2191f' : '#161616', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#525252' }}>{label}</div>
    </div>
  );

  const overdueCount = outNow.filter((r) => dayNum(r.needed_to) < today).length;

  return (
    <div>
      {/* At a glance */}
      <div style={card}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {stat('Bookings out right now', outNow.length)}
          {stat('Overdue (not marked returned)', overdueCount, true)}
          {stat('Going out in the next 7 days', goingOut.length)}
          {stat('Due back in the next 7 days', approved.filter((r) => dayNum(r.needed_to) >= today && dayNum(r.needed_to) <= today + 7 && dayNum(r.needed_from) <= today).length)}
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <BookingList title="Out now" empty="Nothing is out at the moment." rows={outNow} onSelect={setSelectedId} today={today} admin={admin} />
          <BookingList title="Going out in the next 7 days" empty="Nothing is due to leave this week." rows={goingOut} onSelect={setSelectedId} today={today} admin={admin} />
        </div>
      </div>

      {/* View switch */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[['calendar', 'Calendar'], ['timeline', 'Timeline by item']].map(([id, label]) => (
          <button
            key={id} type="button" onClick={() => setMode(id)}
            style={{
              border: mode === id ? '1px solid #0f62fe' : '1px solid #e0e0e0', background: mode === id ? '#0f62fe' : '#fff',
              color: mode === id ? '#fff' : '#161616', borderRadius: 999, padding: '0.45rem 1.1rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >{label}</button>
        ))}
      </div>

      {mode === 'calendar' && (
        <StoreRoomCalendar live={live} items={items} today={today} showPending={showPending} setShowPending={setShowPending} admin={admin} currentUser={currentUser} onChanged={onChanged} />
      )}

      {/* Selected booking */}
      {mode === 'timeline' && selected && (admin ? (
        <div style={{ ...card, border: '1px solid #0f62fe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selected.item_name} × {selected.quantity}
                <span style={{ marginLeft: 8, fontSize: '0.8rem', fontWeight: 600, color: selected.status === 'Pending' ? '#8e6a00' : '#0e6027' }}>{selected.status}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#393939', marginTop: 4 }}>
                {selected.event_name || 'Untitled event'}{selected.event_type ? ` (${selected.event_type})` : ''} · {selected.requester_name || selected.requester_email}
                {selected.requester_name ? ` · ${selected.requester_email}` : ''}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#393939', marginTop: 4 }}>
                Ship by {fmtDay(dayNum(selected.needed_from), { day: 'numeric', month: 'short', year: 'numeric' })}
                {selected.event_date ? ` · Event ${fmtDay(dayNum(selected.event_date), { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                {' · '}Return by {fmtDay(dayNum(selected.needed_to), { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <button type="button" style={smallBtn} onClick={() => setSelectedId(null)}>Close</button>
          </div>
        </div>
      ) : (
        <div style={{ ...card, border: '1px solid #0f62fe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontWeight: 600 }}>{selected.item_name} × {selected.quantity} · out {range(selected)}</div>
            <button type="button" style={smallBtn} onClick={() => setSelectedId(null)}>Close</button>
          </div>
        </div>
      ))}

      {/* Timeline */}
      {mode === 'timeline' && <div style={card}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, marginRight: 'auto' }}>
            Schedule · {fmtDay(winStart, { day: 'numeric', month: 'short' })} – {fmtDay(winEnd, { day: 'numeric', month: 'short', year: 'numeric' })}
          </h3>
          <button type="button" style={smallBtn} onClick={() => setWinStart((w) => w - 14)}>← 2 weeks</button>
          <button type="button" style={smallBtn} onClick={() => setWinStart(today - 3)}>Today</button>
          <button type="button" style={smallBtn} onClick={() => setWinStart((w) => w + 14)}>2 weeks →</button>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.9rem' }}>
          <input
            type="search" placeholder="Filter items…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter items"
            style={{ height: 34, padding: '0 0.75rem', border: '1px solid #8d8d8d', borderRadius: 6, fontFamily: 'inherit', minWidth: 220 }}
          />
          {admin && (
            <label style={{ fontSize: '0.85rem', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={showPending} onChange={(e) => setShowPending(e.target.checked)} /> Show pending requests
            </label>
          )}
          <label style={{ fontSize: '0.85rem', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} /> Hide items with nothing booked in this period
          </label>
        </div>
        <div style={{ marginBottom: '0.9rem' }}><Legend /></div>

        <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: 8 }}>
          <div style={{ minWidth: 960 }}>
            {/* Header */}
            <div style={{ display: 'flex', background: '#f4f4f4', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ width: LABEL_W, flexShrink: 0, padding: '0.5rem 0.75rem', fontWeight: 700, fontSize: '0.85rem' }}>Item</div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${SPAN}, 1fr)` }}>
                {days.map((d, i) => (
                  <div key={d} style={{ textAlign: 'center', padding: '0.25rem 0', background: d === today ? '#d0e2ff' : 'transparent', borderLeft: '1px solid #e0e0e0', lineHeight: 1.2 }}>
                    <div style={{ fontSize: '0.65rem', color: '#6f6f6f', minHeight: 12 }}>
                      {i === 0 || new Date(d * 86400000).getUTCDate() === 1 ? fmtDay(d, { month: 'short' }) : ''}
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: d === today ? 700 : 500 }}>{fmtDay(d, { day: 'numeric' })}</div>
                    <div style={{ fontSize: '0.65rem', color: '#6f6f6f' }}>{fmtDay(d, { weekday: 'narrow' })}</div>
                  </div>
                ))}
              </div>
            </div>

            {rows.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#525252', fontSize: '0.9rem' }}>
                {items.length === 0 ? 'No items in the store room yet.' : 'Nothing is booked in this period. Use the arrows to look further ahead.'}
              </div>
            )}

            {rows.map(({ item, entries, lanes, clash }) => (
              <div key={item.id} style={{ display: 'flex', borderBottom: '1px solid #ececec' }}>
                <div style={{ width: LABEL_W, flexShrink: 0, padding: '0.5rem 0.75rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6f6f6f' }}>
                    {item.quantity} in stock{item.storage_code ? ` · ${item.storage_code}` : ''}
                  </div>
                  {clash && <div style={{ fontSize: '0.75rem', color: '#a2191f', fontWeight: 700 }}>⚠ Clash in this period</div>}
                </div>
                <div style={{ flex: 1, position: 'relative', minHeight: lanes * LANE_H + 8 }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${SPAN}, 1fr)` }}>
                    {days.map((d) => <div key={d} style={{ borderLeft: '1px solid #ececec', background: cellBg(d) }} />)}
                  </div>
                  {entries.map(({ r, start, end, lane }) => {
                    const s = Math.max(start, winStart);
                    const e = Math.min(end, winEnd);
                    const kind = barKind(r, today);
                    return (
                      <button
                        key={r.id} type="button" onClick={() => setSelectedId(r.id)}
                        title={admin
                          ? `${r.item_name} × ${r.quantity}\n${r.event_name || 'Untitled event'} – ${r.requester_name || r.requester_email}\n${range(r)} (${r.status}${kind === 'Overdue' ? ', overdue' : ''})`
                          : `${r.item_name} × ${r.quantity}\nOut ${range(r)}${kind === 'Overdue' ? ' (overdue)' : ''}`}
                        style={{
                          position: 'absolute', top: 4 + lane * LANE_H, height: LANE_H - 4,
                          left: `calc(${((s - winStart) / SPAN) * 100}% + 1px)`, width: `calc(${((e - s + 1) / SPAN) * 100}% - 2px)`,
                          ...COLORS[kind], borderRadius: 6, padding: '0 6px', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit',
                          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textAlign: 'left', cursor: 'pointer',
                          outline: selectedId === r.id ? '2px solid #161616' : 'none', outlineOffset: 1,
                        }}
                      >
                        {admin ? (r.event_name || 'Untitled') : 'Booked'} × {r.quantity}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#6f6f6f' }}>
          A booking occupies an item from its shipping date to its return date. If it hasn't been marked returned by then it stays red until it is.
        </p>
      </div>}
    </div>
  );
}
