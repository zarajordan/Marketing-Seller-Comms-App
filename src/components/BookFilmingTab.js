import React, { useState, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';

const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const STATUS_STYLES = {
  Pending:   { background: '#fef3c7', color: '#92400e' },
  Confirmed: { background: '#d1fae5', color: '#065f46' },
  Completed: { background: '#dde8ff', color: '#1e40af' },
  Cancelled: { background: '#fee2e2', color: '#991b1b' },
};

const today = new Date();
const fmt = (d) => d.toISOString().slice(0, 10);

// ── Filming Calendar ──────────────────────────────────────────────────────────
function FilmingCalendar({ bookings, selectedDate, onSelectDate, currentMonth, onChangeMonth }) {
  const todayDate = new Date();
  const { year, month } = currentMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const startOffset = (firstDay + 6) % 7;

  const byDate = useMemo(() => {
    const m = {};
    bookings.forEach(b => { if (!m[b.date]) m[b.date] = []; m[b.date].push(b); });
    return m;
  }, [bookings]);

  const calCells = [];
  for (let i = 0; i < startOffset; i++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);

  const dotColor = (bks) => {
    if (bks.some(b => b.status === 'Confirmed')) return '#16a34a';
    if (bks.some(b => b.status === 'Pending'))   return '#d97706';
    if (bks.some(b => b.status === 'Completed')) return '#2563eb';
    return '#9ca3af';
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <button onClick={() => onChangeMonth(-1)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
        <span style={{ fontSize: '15px', fontWeight: 700, flex: 1, textAlign: 'center' }}>{monthLabel}</span>
        <button onClick={() => onChangeMonth(1)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '3px' }}>
        {dayLabels.map(d => <div key={d} style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textAlign: 'center', padding: '3px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {calCells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === fmt(todayDate);
          const isSelected = selectedDate === dateStr;
          const dayBookings = (byDate[dateStr] || []).filter(b => b.status !== 'Cancelled');
          const hasBooking = dayBookings.length > 0;
          return (
            <div key={day} onClick={() => onSelectDate(isSelected ? null : dateStr)}
              style={{ textAlign: 'center', padding: '6px 2px 8px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', background: isSelected ? '#2563eb' : isToday ? '#eff6ff' : hasBooking ? '#f0fdf4' : 'transparent', color: isSelected ? '#fff' : isToday ? '#2563eb' : '#374151', fontWeight: isToday || isSelected ? 700 : 400, border: isSelected ? '2px solid #2563eb' : isToday ? '1px solid #bfdbfe' : hasBooking ? '1px solid #bbf7d0' : '1px solid transparent', position: 'relative', minHeight: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              <span>{day}</span>
              {hasBooking && !isSelected && (
                <span style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {dayBookings.slice(0, 3).map((b, bi) => (
                    <span key={bi} style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor([b]), display: 'inline-block' }} />
                  ))}
                </span>
              )}
              {hasBooking && isSelected && <span style={{ fontSize: '10px', fontWeight: 700 }}>{dayBookings.length}</span>}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
        {[['#16a34a', 'Confirmed'], ['#d97706', 'Pending'], ['#2563eb', 'Completed'], ['#eff6ff', 'Today']].map(([bg, lbl]) => (
          <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6b7280' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: bg, display: 'inline-block', border: lbl === 'Today' ? '1px solid #bfdbfe' : 'none' }} />
            {lbl}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Booking Form Modal ────────────────────────────────────────────────────────
function BookingFormModal({ initial, onSave, onClose }) {
  const emptyForm = { date: '', timeStart: '', timeEnd: '', topic: '', partnerName: '', clientName: '', approvalsConfirmed: false, participants: '', yourName: '', yourEmail: '', ibmTeam: '', notes: '', status: 'Pending' };
  const parseSlot = (slot = '') => { const parts = slot.split(/[–\-]/); return { timeStart: parts[0]?.trim() || '', timeEnd: parts[1]?.trim() || '' }; };
  const [form, setForm] = useState(initial ? { ...emptyForm, ...initial, ...parseSlot(initial.timeSlot) } : emptyForm);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!initial;
  const inputStyle = { width: '100%', padding: '9px 11px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const lbl = (t, req) => <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>{t}{req ? ' *' : ''}</label>;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '92%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '14px', zIndex: 1001, padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{isEdit ? '✏️ Edit Booking' : '🎬 Add Filming Slot'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave({ ...form, timeSlot: form.timeStart && form.timeEnd ? `${form.timeStart}–${form.timeEnd}` : form.timeStart || '', ...(initial?.id ? { id: initial.id } : {}) }); }} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
            <div>{lbl('Date', true)}<input type="date" style={inputStyle} value={form.date} onChange={e => set('date', e.target.value)} required /></div>
            <div style={{ gridColumn: 'span 2' }}>
              {lbl('Time Slot', true)}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="time" style={{ ...inputStyle, flex: 1 }} value={form.timeStart || ''} onChange={e => set('timeStart', e.target.value)} required />
                <span style={{ color: '#6b7280', fontSize: '13px', flexShrink: 0 }}>to</span>
                <input type="time" style={{ ...inputStyle, flex: 1 }} value={form.timeEnd || ''} onChange={e => set('timeEnd', e.target.value)} required />
              </div>
            </div>
            <div>{lbl('Topic / Story Title', true)}<input style={inputStyle} value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="What will be covered?" required /></div>
            <div>{lbl('Partner Name', true)}<input style={inputStyle} value={form.partnerName} onChange={e => set('partnerName', e.target.value)} required /></div>
            <div>{lbl('Client Name (if relevant)')}<input style={inputStyle} value={form.clientName} onChange={e => set('clientName', e.target.value)} /></div>
            <div>{lbl('Your Name', true)}<input style={inputStyle} value={form.yourName} onChange={e => set('yourName', e.target.value)} required /></div>
            <div>{lbl('Your Email', true)}<input type="email" style={inputStyle} value={form.yourEmail} onChange={e => set('yourEmail', e.target.value)} required /></div>
            <div>{lbl('IBM Team', true)}<input style={inputStyle} value={form.ibmTeam} onChange={e => set('ibmTeam', e.target.value)} placeholder="e.g. UKI Partner Marketing" required /></div>
            {isEdit && <div>{lbl('Status')}<select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>{BOOKING_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>}
          </div>
          <div>{lbl('Participants', true)}<textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.participants} onChange={e => set('participants', e.target.value)} placeholder="List all people who will appear on camera…" required /></div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
            <input type="checkbox" checked={form.approvalsConfirmed} onChange={e => set('approvalsConfirmed', e.target.checked)} style={{ width: '16px', height: '16px', marginTop: '1px', accentColor: '#2563eb', flexShrink: 0 }} />
            <span>All necessary client / partner approvals have been secured</span>
          </label>
          <div>{lbl('Notes')}<textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Special requirements, location preferences, kit needed…" /></div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', borderRadius: '7px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Cancel</button>
            <button type="submit" style={{ padding: '9px 22px', borderRadius: '7px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{isEdit ? 'Save Changes' : 'Add Booking'}</button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Booking Detail Modal ──────────────────────────────────────────────────────
function BookingDetailModal({ booking, onClose, isAdmin, onEdit, onUpdateStatus, onDelete }) {
  const ss = STATUS_STYLES[booking.status] || STATUS_STYLES.Pending;
  const nextStatus = { Pending: 'Confirmed', Confirmed: 'Completed', Completed: null, Cancelled: null };
  const next = nextStatus[booking.status];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '92%', maxWidth: '560px', maxHeight: '88vh', overflowY: 'auto', background: '#fff', borderRadius: '14px', zIndex: 1001, padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700 }}>{booking.topic}</h2>
            <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, ...ss }}>{booking.status}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: '13px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          {[['Date', new Date(booking.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })], ['Time Slot', booking.timeSlot], ['Partner', booking.partnerName], ['Client', booking.clientName || '—'], ['IBM Team', booking.ibmTeam], ['Booked by', booking.yourName], ['Email', booking.yourEmail]].map(([k, v]) => (
            <div key={k}><span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '2px' }}>{k}</span><span>{v}</span></div>
          ))}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>PARTICIPANTS</div>
          <p style={{ margin: 0, fontSize: '13px' }}>{booking.participants}</p>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>APPROVALS</div>
          <p style={{ margin: 0, fontSize: '13px', color: booking.approvalsConfirmed ? '#065f46' : '#991b1b' }}>
            {booking.approvalsConfirmed ? '✓ Approvals confirmed' : '✗ Approvals not yet confirmed'}
          </p>
        </div>
        {booking.notes && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>NOTES</div>
            <p style={{ margin: 0, fontSize: '13px' }}>{booking.notes}</p>
          </div>
        )}
        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
            {next && <button onClick={() => { onUpdateStatus(booking.id, next); onClose(); }} style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#16a34a', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>✓ Mark as {next}</button>}
            {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
              <button onClick={() => { onUpdateStatus(booking.id, 'Cancelled'); onClose(); }} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>✗ Cancel</button>
            )}
            <button onClick={() => onEdit(booking)} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>✏️ Edit</button>
            <button onClick={() => { onDelete(booking.id); onClose(); }} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 500, marginLeft: 'auto' }}>🗑 Delete</button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────
export default function BookFilmingTab({ bookings = [], onAddBooking, onUpdateBooking, onUpdateBookingStatus, onDeleteBooking }) {
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 'admin-manager' || currentUser?.role === 'marketer' || currentUser?.role === 'marketing';
  const isSeller = !isAdmin;

  const nowDate = new Date();
  const [currentMonth, setCurrentMonth] = useState({ year: nowDate.getFullYear(), month: nowDate.getMonth() });
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState(isSeller ? 'request' : 'calendar');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [reqForm, setReqForm] = useState({ date: '', timeStart: '', timeEnd: '', topic: '', partnerName: '', clientName: '', approvalsConfirmed: false, participants: '', yourName: '', yourEmail: '', ibmTeam: '', notes: '' });
  const [reqSubmitted, setReqSubmitted] = useState(false);
  const setReq = (k, v) => setReqForm(f => ({ ...f, [k]: v }));

  const changeMonth = (dir) => setCurrentMonth(cm => { const d = new Date(cm.year, cm.month + dir); return { year: d.getFullYear(), month: d.getMonth() }; });
  const dayBookings = useMemo(() => selectedDate ? bookings.filter(b => b.date === selectedDate) : [], [bookings, selectedDate]);
  const filteredList = useMemo(() => bookings.filter(b => !statusFilter || b.status === statusFilter).sort((a, b) => a.date.localeCompare(b.date)), [bookings, statusFilter]);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    thisMonth: bookings.filter(b => { const d = new Date(b.date + 'T12:00:00'); return d.getMonth() === nowDate.getMonth() && d.getFullYear() === nowDate.getFullYear(); }).length,
  }), [bookings]);

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const sectionTitle = (t) => <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>{t}</h3>;
  const lbl = (t, req) => <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>{t}{req ? ' *' : ''}</label>;

  const handleReqSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddBooking({ ...reqForm, timeSlot: reqForm.timeStart && reqForm.timeEnd ? `${reqForm.timeStart}–${reqForm.timeEnd}` : reqForm.timeStart || '', status: 'Pending' });
      setReqSubmitted(true);
    } catch {
      alert('Failed to submit booking request. Please try again.');
    }
  };
  const clearReq = () => { setReqForm({ date: '', timeStart: '', timeEnd: '', topic: '', partnerName: '', clientName: '', approvalsConfirmed: false, participants: '', yourName: '', yourEmail: '', ibmTeam: '', notes: '' }); setReqSubmitted(false); };

  const viewBtnStyle = (id) => ({ padding: '7px 16px', borderRadius: '7px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', background: view === id ? '#111827' : '#fff', color: view === id ? '#fff' : '#374151' });

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: '0 0 3px', fontSize: '22px', fontWeight: 700 }}>🎬 {isSeller ? 'Book a Filming Session' : 'Filming Management'}</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{isSeller ? 'Request a filming slot — check the calendar for availability first' : 'Production calendar, booking requests and session tracking'}</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button style={viewBtnStyle('calendar')} onClick={() => setView('calendar')}>📅 Calendar</button>
            <button style={viewBtnStyle('list')} onClick={() => setView('list')}>📋 All Bookings</button>
            <button style={viewBtnStyle('request')} onClick={() => setView('request')}>✏️ Book a Session</button>
            <button onClick={() => setShowAddForm(true)} style={{ padding: '7px 16px', borderRadius: '7px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>+ Add Slot</button>
          </div>
        )}
      </div>

      {/* KPI stats — admin/marketing only */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[['Total Bookings', stats.total, '#374151'], ['Pending Review', stats.pending, '#d97706'], ['Confirmed', stats.confirmed, '#16a34a'], ['This Month', stats.thisMonth, '#2563eb']].map(([label, val, color]) => (
            <div key={label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
          <FilmingCalendar bookings={bookings} selectedDate={selectedDate} onSelectDate={setSelectedDate} currentMonth={currentMonth} onChangeMonth={changeMonth} />
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', minHeight: '300px' }}>
            {!selectedDate ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9ca3af' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
                <p style={{ fontSize: '13px' }}>Select a day to see bookings</p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: '#111827' }}>
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', marginLeft: '8px' }}>({dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''})</span>
                </div>
                {dayBookings.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', paddingTop: '24px' }}>No bookings on this day.</p>
                ) : dayBookings.map(b => {
                  const ss = STATUS_STYLES[b.status] || STATUS_STYLES.Pending;
                  return (
                    <div key={b.id} onClick={() => setSelectedBooking(b)} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginBottom: '10px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'} onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{b.topic}</span>
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, ...ss }}>{b.status}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{b.timeSlot}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{b.partnerName}{b.clientName ? ` / ${b.clientName}` : ''}</div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Status:</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value === 'All Statuses' ? '' : e.target.value)} style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none' }}>
              {['All Statuses', ...BOOKING_STATUSES].map(o => <option key={o}>{o}</option>)}
            </select>
            <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: 'auto' }}>{filteredList.length} booking{filteredList.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  {['Date', 'Time', 'Topic', 'Partner', 'Booked By', 'Approvals', 'Status', ...(isAdmin ? ['Actions'] : [])].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>No bookings found.</td></tr>
                ) : filteredList.map((b, i) => {
                  const ss = STATUS_STYLES[b.status] || STATUS_STYLES.Pending;
                  const isPast = new Date(b.date + 'T23:59:59') < nowDate;
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa', opacity: isPast && b.status === 'Pending' ? 0.6 : 1 }}>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 500 }}>{new Date(b.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#6b7280' }}>{b.timeSlot}</td>
                      <td style={{ padding: '10px 12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.topic}</td>
                      <td style={{ padding: '10px 12px', color: '#374151' }}>{b.partnerName}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{b.yourName}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{b.approvalsConfirmed ? '✅' : '⚠️'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {isAdmin ? (
                          <select value={b.status} onChange={e => onUpdateBookingStatus(b.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer', ...ss }}>
                            {BOOKING_STATUSES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, ...ss }}>{b.status}</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => setEditingBooking(b)} style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '11px' }}>✏️</button>
                            <button onClick={() => onDeleteBooking(b.id)} style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', fontSize: '11px', color: '#dc2626' }}>🗑</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOOKING REQUEST FORM */}
      {view === 'request' && (
        reqSubmitted ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Booking Request Submitted!</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>The IBM intern production team will confirm your session shortly.</p>
            <button onClick={clearReq} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Submit Another</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start', gridTemplateRows: 'auto' }}>
            <form onSubmit={handleReqSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>📝 Book a Filming Session</h3>
                <span style={{ fontSize: '13px', color: '#6b7280', maxWidth: '260px', textAlign: 'right' }}>Check the calendar for availability, then fill out the form.</span>
              </div>
              <div>
                {sectionTitle('Session Details')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
                  <div>{lbl('Preferred Date', true)}<input type="date" style={inputStyle} value={reqForm.date} onChange={e => setReq('date', e.target.value)} required /></div>
                  <div style={{ gridColumn: 'span 2' }}>
                    {lbl('Preferred Time Slot', true)}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="time" style={{ ...inputStyle, flex: 1 }} value={reqForm.timeStart || ''} onChange={e => setReq('timeStart', e.target.value)} required />
                      <span style={{ color: '#6b7280', fontSize: '13px', flexShrink: 0 }}>to</span>
                      <input type="time" style={{ ...inputStyle, flex: 1 }} value={reqForm.timeEnd || ''} onChange={e => setReq('timeEnd', e.target.value)} required />
                    </div>
                  </div>
                  <div>{lbl('Topic / Story Title', true)}<input style={inputStyle} value={reqForm.topic} onChange={e => setReq('topic', e.target.value)} placeholder="What will be covered?" required /></div>
                  <div>{lbl('Partner Name', true)}<input style={inputStyle} value={reqForm.partnerName} onChange={e => setReq('partnerName', e.target.value)} required /></div>
                  <div>{lbl('Client Name (if relevant)')}<input style={inputStyle} value={reqForm.clientName} onChange={e => setReq('clientName', e.target.value)} /></div>
                </div>
              </div>
              <div>
                {sectionTitle('Participants & Approvals')}
                {lbl('Name(s) of Individuals to be Filmed', true)}
                <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', marginBottom: '12px' }} value={reqForm.participants} onChange={e => setReq('participants', e.target.value)} placeholder="List all people who will appear on camera…" required />
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" checked={reqForm.approvalsConfirmed} onChange={e => setReq('approvalsConfirmed', e.target.checked)} style={{ width: '16px', height: '16px', marginTop: '1px', accentColor: '#2563eb', flexShrink: 0 }} />
                  <div><div style={{ fontWeight: 500 }}>All necessary client / partner approvals have been secured</div><div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>Approval must be obtained before filming begins</div></div>
                </label>
              </div>
              <div>
                {sectionTitle('Your Contact Details')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
                  <div>{lbl('Your Name', true)}<input style={inputStyle} value={reqForm.yourName} onChange={e => setReq('yourName', e.target.value)} required /></div>
                  <div>{lbl('Your Email', true)}<input type="email" style={inputStyle} value={reqForm.yourEmail} onChange={e => setReq('yourEmail', e.target.value)} required /></div>
                  <div>{lbl('IBM Team', true)}<input style={inputStyle} value={reqForm.ibmTeam} onChange={e => setReq('ibmTeam', e.target.value)} placeholder="e.g., UKI Partner Marketing" required /></div>
                </div>
              </div>
              <div>
                {sectionTitle('Additional Notes')}
                {lbl('Notes')}
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={reqForm.notes} onChange={e => setReq('notes', e.target.value)} placeholder="Special requirements, location preferences, kit needed…" />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <button type="button" onClick={clearReq} style={{ padding: '10px 22px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>Clear Form</button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Submit Booking Request</button>
              </div>
            </form>
            <div style={{ position: 'sticky', top: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>📅 Availability</div>
              <FilmingCalendar bookings={bookings} selectedDate={reqForm.date} onSelectDate={(d) => setReq('date', d || '')} currentMonth={currentMonth} onChangeMonth={changeMonth} />
            </div>
          </div>
        )
      )}

      {/* Modals */}
      {selectedBooking && (
        <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} isAdmin={isAdmin}
          onEdit={(b) => { setSelectedBooking(null); setEditingBooking(b); }}
          onUpdateStatus={(id, status) => { onUpdateBookingStatus(id, status); setSelectedBooking(null); }}
          onDelete={(id) => { onDeleteBooking(id); setSelectedBooking(null); }}
        />
      )}
      {(editingBooking || showAddForm) && (
        <BookingFormModal initial={editingBooking || null}
          onSave={(b) => { editingBooking ? onUpdateBooking(b) : onAddBooking(b); setEditingBooking(null); setShowAddForm(false); }}
          onClose={() => { setEditingBooking(null); setShowAddForm(false); }}
        />
      )}
    </div>
  );
}
