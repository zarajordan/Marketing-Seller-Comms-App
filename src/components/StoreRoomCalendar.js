import React, { useState, useMemo } from 'react';
import { Modal, TextInput, Select, SelectItem } from '@carbon/react';
import { toast } from 'react-toastify';
import { dayNum, dayToStr, fmtDay, endDay, windowAvailability } from '../lib/storeRoomAvailability';
import { updateStoreRoomReservation, createStoreRoomReservations, deleteStoreRoomReservation } from '../lib/supabaseData';

const DAY = 86400000;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_CHIPS = 3;

const smallBtn = {
  height: 34, padding: '0 1rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
  background: '#fff', color: '#0f62fe', border: '1px solid #0f62fe', cursor: 'pointer',
};

const KIND = {
  Approved: { background: '#0f62fe', color: '#fff' },
  Pending:  { background: '#fcf4d6', color: '#5e4600' },
  Overdue:  { background: '#da1e28', color: '#fff' },
};

const kindOf = (r, today) => (r.status === 'Approved' && dayNum(r.needed_to) < today ? 'Overdue' : r.status);
const longDay = (n) => fmtDay(n, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const range = (r) => `${fmtDay(dayNum(r.needed_from))} – ${fmtDay(dayNum(r.needed_to))}`;

const actBtn = (kind, disabled) => {
  const kinds = {
    primary: { background: '#0f62fe', color: '#fff', border: '1px solid #0f62fe' },
    danger:  { background: '#fff', color: '#da1e28', border: '1px solid #da1e28' },
    outline: { background: '#fff', color: '#0f62fe', border: '1px solid #0f62fe' },
  };
  return {
    ...kinds[kind], height: 30, padding: '0 0.8rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600,
    fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
  };
};

// Admin / marketing only: approve, reject, return, change dates & quantity, remove.
function BookingActions({ r, approved, item, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [f, setF] = useState({ from: r.needed_from, to: r.needed_to, qty: r.quantity });

  const clashMsg = (from, to, qty) => {
    if (!item) return null;
    const { free } = windowAvailability(approved, item, from, to, r.id);
    return free >= qty ? null : `Only ${free} of "${r.item_name}" free for those dates`;
  };

  const run = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); toast.success(okMsg); setEditing(false); setConfirmDelete(false); onChanged(); }
    catch (err) { toast.error('Update failed: ' + err.message); }
    finally { setBusy(false); }
  };

  const setStatus = (status) => {
    if (status === 'Approved') {
      const c = clashMsg(r.needed_from, r.needed_to, r.quantity);
      if (c) { toast.error(c); return; }
    }
    run(() => updateStoreRoomReservation(r.id, { status }), `${r.item_name} marked ${status.toLowerCase()}`);
  };

  const save = () => {
    const qty = parseInt(f.qty, 10);
    if (!f.from || !f.to) { toast.error('Both dates are required'); return; }
    if (f.to < f.from) { toast.error('Return date must be on or after the shipping date'); return; }
    if (!qty || qty < 1) { toast.error('Quantity must be at least 1'); return; }
    if (r.status === 'Approved') {
      const c = clashMsg(f.from, f.to, qty);
      if (c) { toast.error(c); return; }
    }
    run(() => updateStoreRoomReservation(r.id, { needed_from: f.from, needed_to: f.to, quantity: qty }), 'Booking updated');
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {r.status === 'Pending' && (
          <>
            <button type="button" style={actBtn('primary', busy)} disabled={busy} onClick={() => setStatus('Approved')}>Approve</button>
            <button type="button" style={actBtn('danger', busy)} disabled={busy} onClick={() => setStatus('Rejected')}>Reject</button>
          </>
        )}
        {r.status === 'Approved' && (
          <button type="button" style={actBtn('primary', busy)} disabled={busy} onClick={() => setStatus('Returned')}>Mark returned</button>
        )}
        <button type="button" style={actBtn('outline', busy)} disabled={busy} onClick={() => setEditing((e) => !e)}>{editing ? 'Cancel edit' : 'Edit'}</button>
        {!confirmDelete
          ? <button type="button" style={actBtn('danger', busy)} disabled={busy} onClick={() => setConfirmDelete(true)}>Delete</button>
          : (
            <>
              <button type="button" style={{ ...actBtn('danger', busy), background: '#da1e28', color: '#fff' }} disabled={busy}
                onClick={() => run(() => deleteStoreRoomReservation(r.id), 'Booking deleted')}>Confirm delete</button>
              <button type="button" style={actBtn('outline', busy)} onClick={() => setConfirmDelete(false)}>Keep</button>
            </>
          )}
      </div>
      {editing && (
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, alignItems: 'end' }}>
          <TextInput id={`ed-from-${r.id}`} type="date" size="sm" labelText="Ships" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
          <TextInput id={`ed-to-${r.id}`} type="date" size="sm" labelText="Returns" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
          <TextInput id={`ed-qty-${r.id}`} type="number" min="1" size="sm" labelText="Quantity" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} />
          <button type="button" style={{ ...actBtn('primary', busy), height: 32 }} disabled={busy} onClick={save}>Save</button>
        </div>
      )}
    </div>
  );
}

function DayRow({ r, today, admin, approved, item, onChanged }) {
  const kind = kindOf(r, today);
  const who = [r.event_name || (admin ? 'Untitled event' : ''), ].filter(Boolean).join('') + (r.event_type ? ` (${r.event_type})` : '');
  const by = r.requester_name || r.requester_email;
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.6rem 0', borderTop: '1px solid #e0e0e0' }}>
      <span style={{ width: 6, alignSelf: 'stretch', borderRadius: 3, flexShrink: 0, background: KIND[kind].background, border: kind === 'Pending' ? '1px dashed #b28600' : 'none' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600 }}>
          {r.item_name} × {r.quantity}
          <span style={{ marginLeft: 8, fontSize: '0.78rem', fontWeight: 600, color: kind === 'Overdue' ? '#a2191f' : kind === 'Pending' ? '#8e6a00' : '#0e6027' }}>
            {kind === 'Overdue' ? 'Overdue – not marked returned' : admin ? r.status : 'Booked'}
          </span>
        </div>
        {(who || by) && (
          <div style={{ fontSize: '0.85rem', color: '#393939' }}>{[who, by].filter(Boolean).join(' · ')}</div>
        )}
        <div style={{ fontSize: '0.82rem', color: '#525252' }}>
          {range(r)}{r.event_date ? ` · Event ${fmtDay(dayNum(r.event_date))}` : ''}{r.courier ? ` · Courier: ${r.courier}` : ''}
        </div>
        {admin && <BookingActions r={r} approved={approved} item={item} onChanged={onChanged} />}
      </div>
    </div>
  );
}

function DaySection({ title, rows, ...rowProps }) {
  if (rows.length === 0) return null;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h4 style={{ margin: '0 0 0.15rem', fontSize: '0.9rem', fontWeight: 700 }}>
        {title} <span style={{ color: '#6f6f6f', fontWeight: 500 }}>({rows.length})</span>
      </h4>
      {rows.map(({ r }) => <DayRow key={r.id} r={r} {...rowProps} item={rowProps.items.find((i) => i.id === r.item_id)} />)}
    </div>
  );
}

const EMPTY_ADD = { item_id: '', quantity: 1, event_name: '', from: '', to: '' };

// Admin / marketing only: book an item out directly (goes straight in as Approved).
function AddBookingModal({ open, onClose, items, approved, currentUser, defaultDay, onSaved }) {
  const [f, setF] = useState(EMPTY_ADD);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (open) { const d = dayToStr(defaultDay); setF({ ...EMPTY_ADD, from: d, to: d }); }
  }, [open, defaultDay]);

  const submit = async () => {
    const item = items.find((i) => i.id === f.item_id);
    const qty = parseInt(f.quantity, 10);
    if (!item) { toast.error('Choose an item'); return; }
    if (!f.event_name.trim()) { toast.error('Event name is required'); return; }
    if (!f.from || !f.to || f.to < f.from) { toast.error('Enter a shipping date and a return date on or after it'); return; }
    if (!qty || qty < 1) { toast.error('Quantity must be at least 1'); return; }
    const { free } = windowAvailability(approved, item, f.from, f.to);
    if (free < qty) { toast.error(`Only ${free} of "${item.name}" free for those dates`); return; }
    setSaving(true);
    try {
      await createStoreRoomReservations([{
        item_id: item.id, item_name: item.name, quantity: qty, event_name: f.event_name.trim(),
        requester_name: currentUser?.name || null, requester_email: currentUser?.email,
        needed_from: f.from, needed_to: f.to, status: 'Approved',
      }]);
      toast.success('Booking added');
      onClose();
      onSaved();
    } catch (err) {
      toast.error('Could not add booking: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} modalHeading="Add booking" primaryButtonText={saving ? 'Saving…' : 'Add booking'} secondaryButtonText="Cancel"
      primaryButtonDisabled={saving} onRequestSubmit={submit} onRequestClose={onClose} size="sm">
      <p style={{ marginTop: 0, fontSize: '0.85rem', color: '#525252' }}>Use this to block an item out for an event without a seller request. It is approved straight away.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Select id="ab-item" labelText="Item *" value={f.item_id} onChange={(e) => setF({ ...f, item_id: e.target.value })}>
          <SelectItem value="" text="Select an item…" />
          {items.map((i) => <SelectItem key={i.id} value={i.id} text={`${i.name} (${i.quantity} in stock)`} />)}
        </Select>
        <TextInput id="ab-event" labelText="Event name *" value={f.event_name} onChange={(e) => setF({ ...f, event_name: e.target.value })} />
        <TextInput id="ab-qty" type="number" min="1" labelText="Quantity *" value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} />
        <TextInput id="ab-from" type="date" labelText="Date required for shipping *" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
        <TextInput id="ab-to" type="date" labelText="Expected return date *" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
      </div>
    </Modal>
  );
}

// Month calendar of bookings. Click any day to see what ships, what is due back and what is already out.
export default function StoreRoomCalendar({ live, items, today, showPending, setShowPending, admin, currentUser, onChanged }) {
  const t0 = new Date(today * DAY);
  const [month, setMonth] = useState({ y: t0.getUTCFullYear(), m: t0.getUTCMonth() });
  const [selectedDay, setSelectedDay] = useState(today);
  const [showAdd, setShowAdd] = useState(false);
  const approved = useMemo(() => live.filter((r) => r.status === 'Approved'), [live]);

  const entries = useMemo(
    () => live
      .map((r) => ({ r, start: dayNum(r.needed_from), end: r.status === 'Approved' ? endDay(r) : dayNum(r.needed_to) }))
      .filter((e) => e.start != null && e.end != null),
    [live]
  );
  const stock = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i.quantity])), [items]);

  const activeOn = (d) => entries.filter((e) => e.start <= d && e.end >= d);
  // Items with more units booked on day d than are in stock.
  const clashesOn = (d) => {
    const byItem = {};
    activeOn(d).forEach(({ r }) => { byItem[r.item_id] = (byItem[r.item_id] || 0) + r.quantity; });
    return Object.entries(byItem).filter(([id, qty]) => qty > (stock[id] ?? Infinity)).map(([id, qty]) => ({ id, qty }));
  };

  const first = Date.UTC(month.y, month.m, 1) / DAY;
  const lead = (new Date(first * DAY).getUTCDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(Date.UTC(month.y, month.m + 1, 0)).getUTCDate();
  const weeks = Math.ceil((lead + daysInMonth) / 7);
  const gridStart = first - lead;

  const shiftMonth = (delta) => setMonth(({ y, m }) => {
    const d = new Date(Date.UTC(y, m + delta, 1));
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  });
  const goToday = () => { setMonth({ y: t0.getUTCFullYear(), m: t0.getUTCMonth() }); setSelectedDay(today); };

  const dayEntries = activeOn(selectedDay);
  const shipping = dayEntries.filter((e) => e.start === selectedDay);
  const returning = dayEntries.filter((e) => dayNum(e.r.needed_to) === selectedDay && e.start !== selectedDay);
  const stillOut = dayEntries.filter((e) => e.start < selectedDay && dayNum(e.r.needed_to) !== selectedDay);
  const dayClashes = clashesOn(selectedDay);
  const sectionProps = { today, admin, approved, items, onChanged };
  const itemName = (id) => items.find((i) => i.id === id)?.name || 'Item';

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, marginRight: 'auto' }}>
          {fmtDay(first, { month: 'long', year: 'numeric' })}
        </h3>
        {admin && (
          <label style={{ fontSize: '0.85rem', display: 'inline-flex', gap: 6, alignItems: 'center', marginRight: '0.75rem' }}>
            <input type="checkbox" checked={showPending} onChange={(e) => setShowPending(e.target.checked)} /> Show pending requests
          </label>
        )}
        {admin && <button type="button" style={{ ...smallBtn, background: '#0f62fe', color: '#fff' }} onClick={() => setShowAdd(true)}>+ Add booking</button>}
        <button type="button" style={smallBtn} onClick={() => shiftMonth(-1)}>← Prev</button>
        <button type="button" style={smallBtn} onClick={goToday}>Today</button>
        <button type="button" style={smallBtn} onClick={() => shiftMonth(1)}>Next →</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#393939' }}>
        {[['Approved', 'Approved – item is out'], ['Pending', 'Pending'], ['Overdue', 'Overdue – not marked returned']].filter(([k]) => admin || k !== 'Pending').map(([k, l]) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 10, borderRadius: 3, ...KIND[k], border: k === 'Pending' ? '1px dashed #b28600' : 'none' }} />{l}
          </span>
        ))}
        <span style={{ color: '#a2191f', fontWeight: 600 }}>⚠ Clash – more booked than in stock</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) minmax(280px, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
        {/* Month grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden', minWidth: 0 }}>
          {WEEKDAYS.map((w) => (
            <div key={w} style={{ background: '#f4f4f4', padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>{w}</div>
          ))}
          {Array.from({ length: weeks * 7 }, (_, i) => {
            const d = gridStart + i;
            const inMonth = d >= first && d < first + daysInMonth;
            const act = activeOn(d);
            const clash = act.length > 0 && clashesOn(d).length > 0;
            const isToday = d === today;
            const isSel = d === selectedDay;
            const weekend = i % 7 >= 5;
            const sorted = [...act].sort((a, b) => (b.start === d) - (a.start === d));
            return (
              <button
                key={d} type="button" onClick={() => setSelectedDay(d)}
                aria-label={`${longDay(d)}: ${act.length} booking${act.length === 1 ? '' : 's'}`}
                style={{
                  minHeight: 104, padding: 4, textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer',
                  border: 'none', borderRight: i % 7 === 6 ? 'none' : '1px solid #ececec', borderTop: i >= 7 ? '1px solid #ececec' : 'none',
                  background: isSel ? '#e5f0ff' : weekend ? '#fafafa' : '#fff', opacity: inMonth ? 1 : 0.45,
                  outline: isSel ? '2px solid #0f62fe' : 'none', outlineOffset: -2,
                  display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0,
                }}
              >
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700, minWidth: 22, height: 22, borderRadius: 11, padding: '0 4px',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: isToday ? '#0f62fe' : 'transparent', color: isToday ? '#fff' : '#161616',
                  }}>{fmtDay(d, { day: 'numeric' })}</span>
                  {clash && <span title="More booked than in stock" style={{ color: '#a2191f', fontSize: '0.8rem', fontWeight: 700 }}>⚠</span>}
                </span>
                {sorted.slice(0, MAX_CHIPS).map(({ r }) => {
                  const k = kindOf(r, today);
                  return (
                    <span key={r.id} style={{
                      ...KIND[k], border: k === 'Pending' ? '1px dashed #b28600' : '1px solid transparent', borderRadius: 4,
                      fontSize: '0.7rem', fontWeight: 600, padding: '1px 4px', overflow: 'hidden', whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis', display: 'block',
                    }}>
                      {r.item_name} ×{r.quantity}
                    </span>
                  );
                })}
                {act.length > MAX_CHIPS && <span style={{ fontSize: '0.7rem', color: '#525252', fontWeight: 600 }}>+{act.length - MAX_CHIPS} more</span>}
              </button>
            );
          })}
        </div>

        {/* Selected day */}
        <div style={{ minWidth: 0, background: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem 1.1rem' }}>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 700 }}>{longDay(selectedDay)}</h3>
          <p style={{ margin: '0 0 0.9rem', fontSize: '0.85rem', color: '#525252' }}>
            {dayEntries.length === 0 ? 'Nothing is booked on this day.' : `${dayEntries.length} booking${dayEntries.length === 1 ? '' : 's'} active`}
          </p>

          {dayClashes.map((c) => (
            <div key={c.id} style={{ background: '#fff1f1', color: '#a2191f', borderRadius: 6, padding: '0.5rem 0.75rem', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              ⚠ {itemName(c.id)}: {c.qty} booked but only {stock[c.id]} in stock
            </div>
          ))}

          <DaySection title="Shipping out" rows={shipping} {...sectionProps} />
          <DaySection title="Due back" rows={returning} {...sectionProps} />
          <DaySection title="Already out" rows={stillOut} {...sectionProps} />
        </div>
      </div>
      {admin && (
        <AddBookingModal open={showAdd} onClose={() => setShowAdd(false)} items={items} approved={approved}
          currentUser={currentUser} defaultDay={selectedDay} onSaved={onChanged} />
      )}
    </div>
  );
}
