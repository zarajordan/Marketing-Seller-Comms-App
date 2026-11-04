import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button,
  Modal,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  InlineLoading,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';
import { toast } from 'react-toastify';
import { useUser } from '../contexts/UserContext';
import {
  STORE_ROOM_CATEGORIES,
  STORE_ROOM_ADMIN_ROLES,
  listStoreRoomItems,
  listStoreRoomBookings,
  createStoreRoomItem,
  updateStoreRoomItem,
  deleteStoreRoomItem,
  uploadStoreRoomImage,
  listStoreRoomReservations,
  createStoreRoomReservations,
  updateStoreRoomReservation,
} from '../lib/supabaseData';

import StoreRoomSchedule from './StoreRoomSchedule';
import { dayNum, todayNum, fmtDay, windowAvailability } from '../lib/storeRoomAvailability';

const EMPTY_ITEM = {
  name: '', category: 'Merchandise', description: '', image_url: '', quantity: 1,
  storage_area: '', storage_code: '', storage_detail: '', readiness_checklist: '',
};

const STATUS_STYLE = {
  Pending:  { background: '#fcf4d6', color: '#8e6a00' },
  Approved: { background: '#defbe6', color: '#0e6027' },
  Rejected: { background: '#fff1f1', color: '#a2191f' },
  Returned: { background: '#e5e6ea', color: '#393939' },
};

const pill = (active) => ({
  border: active ? '1px solid #0f62fe' : '1px solid #e0e0e0',
  background: active ? '#0f62fe' : '#fff',
  color: active ? '#fff' : '#161616',
  borderRadius: 999, padding: '0.5rem 1.1rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
  transition: 'background 0.15s, border-color 0.15s',
});

const badge = (bg, color) => ({
  display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: bg, color, borderRadius: 999,
  padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.4,
});

// Compact card buttons — Carbon's default buttons are too wide to sit side by side on a card.
const cardBtn = (variant, disabled) => {
  const variants = {
    outline: { background: '#fff', color: '#0f62fe', border: '1px solid #0f62fe' },
    primary: { background: '#0f62fe', color: '#fff', border: '1px solid #0f62fe' },
    added:   { background: '#161616', color: '#fff', border: '1px solid #161616' },
  };
  return {
    ...variants[variant],
    flex: 1, minWidth: 0, height: 40, borderRadius: 8, fontSize: '0.88rem', fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
    fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'background 0.15s, box-shadow 0.15s',
  };
};

const overlayIconBtn = {
  width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.95)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

// ── Item add / edit modal (admin) ─────────────────────────────
function ItemModal({ open, item, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_ITEM);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(item ? { ...EMPTY_ITEM, ...Object.fromEntries(Object.entries(item).map(([k, v]) => [k, v ?? ''])) } : EMPTY_ITEM);
    setPreview(item?.image_url || '');
    setFile(null);
  }, [open, item]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Item name is required'); return; }
    const qty = parseInt(form.quantity, 10);
    if (Number.isNaN(qty) || qty < 0) { toast.error('Quantity must be 0 or more'); return; }
    setSaving(true);
    try {
      const imageUrl = file ? await uploadStoreRoomImage(file) : form.image_url;
      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || null,
        image_url: imageUrl || null,
        quantity: qty,
        storage_area: form.storage_area.trim() || null,
        storage_code: form.storage_code.trim() || null,
        storage_detail: form.storage_detail.trim() || null,
        readiness_checklist: form.readiness_checklist.trim() || null,
      };
      if (item) await updateStoreRoomItem(item.id, payload);
      else await createStoreRoomItem(payload);
      toast.success(item ? 'Item updated' : 'Item added');
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      modalHeading={item ? 'Edit Item' : 'Add Item'}
      primaryButtonText={saving ? 'Saving…' : 'Save'}
      secondaryButtonText="Cancel"
      onRequestSubmit={handleSave}
      onRequestClose={onClose}
      onSecondarySubmit={onClose}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
        <TextInput id="sr-name" labelText="Item name *" value={form.name} onChange={set('name')} />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 2 }}>
            <Select id="sr-category" labelText="Category" value={form.category} onChange={set('category')}>
              {STORE_ROOM_CATEGORIES.map((c) => <SelectItem key={c} value={c} text={c} />)}
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <TextInput id="sr-qty" type="number" min="0" labelText="Total quantity" value={form.quantity} onChange={set('quantity')} />
          </div>
        </div>
        <TextArea id="sr-desc" labelText="Description" rows={3} value={form.description} onChange={set('description')} />
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>Photo</p>
          {preview && <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 4, marginBottom: '0.5rem' }} />}
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (!f) return; setFile(f); setPreview(URL.createObjectURL(f)); }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 2 }}><TextInput id="sr-area" labelText="Storage area" placeholder="e.g. Marketing Cupboard" value={form.storage_area} onChange={set('storage_area')} /></div>
          <div style={{ flex: 1 }}><TextInput id="sr-code" labelText="Location code" placeholder="e.g. MC-CM" value={form.storage_code} onChange={set('storage_code')} /></div>
          <div style={{ flex: 2 }}><TextInput id="sr-detail" labelText="Shelf / box" placeholder="e.g. Box 3" value={form.storage_detail} onChange={set('storage_detail')} /></div>
        </div>
        <TextArea
          id="sr-checklist"
          labelText="Readiness checklist (optional)"
          helperText="Shown to sellers as a 'Readiness checklist' badge, e.g. check bulbs, cables, charge level."
          rows={3}
          value={form.readiness_checklist}
          onChange={set('readiness_checklist')}
        />
      </div>
    </Modal>
  );
}

// ── Item card ─────────────────────────────────────────────────
function ItemCard({ item, inBasket, isAdmin, onDetails, onToggleBasket, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const available = Math.max(0, item.quantity - item.reserved);
  const hasLocation = item.storage_area || item.storage_code || item.storage_detail;
  const unavailable = available === 0;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', border: '1px solid #e0e0e0', borderRadius: 14, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.10)' : '0 1px 2px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {/* Photo */}
      <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#f4f4f4' }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: unavailable ? 0.6 : 1 }} />
          : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a8a8', fontSize: '0.85rem' }}>No photo</div>}
        {isAdmin && (
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
            <button type="button" aria-label="Edit item" title="Edit item" style={overlayIconBtn} onClick={() => onEdit(item)}>
              <Edit size={16} />
            </button>
            <button type="button" aria-label="Delete item" title="Delete item" style={{ ...overlayIconBtn, color: '#da1e28' }} onClick={() => onDelete(item)}>
              <TrashCan size={16} />
            </button>
          </div>
        )}
        <span style={{ position: 'absolute', left: 10, bottom: 10, ...badge('rgba(255,255,255,0.95)', '#393939'), boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
          {item.category}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem 1.15rem 1.15rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.3 }}>{item.name}</h3>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={unavailable ? badge('#fff1f1', '#a2191f') : badge('#defbe6', '#0e6027')}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: unavailable ? '#da1e28' : '#24a148' }} />
            {unavailable ? 'Unavailable' : `${available} available`}
          </span>
          {item.readiness_checklist && <span style={badge('#f1e9ff', '#6929c4')}>Readiness checklist</span>}
        </div>

        {hasLocation && (
          <div style={{ background: '#f4f4f4', borderRadius: 10, padding: '0.65rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {item.storage_area && <div style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.3 }}>{item.storage_area}</div>}
            {(item.storage_code || item.storage_detail) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#393939', flexWrap: 'wrap' }}>
                {item.storage_code && (
                  <span style={{ background: '#161616', color: '#fff', borderRadius: 4, padding: '0.1rem 0.45rem', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.02em' }}>
                    {item.storage_code}
                  </span>
                )}
                {item.storage_detail && <span>{item.storage_detail}</span>}
              </div>
            )}
          </div>
        )}

        {/* Actions — always one row, equal width */}
        <div style={{ marginTop: 'auto', paddingTop: '0.25rem', display: 'flex', gap: '0.6rem' }}>
          <button type="button" style={cardBtn('outline')} onClick={() => onDetails(item)}>View details</button>
          {inBasket ? (
            <button type="button" style={cardBtn('added')} onClick={() => onToggleBasket(item)} title="Click to remove from basket">Added ✓</button>
          ) : (
            <button type="button" style={cardBtn('primary', unavailable)} disabled={unavailable} onClick={() => onToggleBasket(item)}>Request</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Lightbox notice ───────────────────────────────────────────
const LIGHTBOX_NOTICE = 'Each lightbox requires 2 x skins (one per side). Select the correct size, remember to request the lightbox frame separately, and ensure it will fit within your allocated event space.';

function LightboxNotice({ style }) {
  return (
    <div role="note" style={{ background: '#fcf4d6', borderLeft: '4px solid #f1c21b', borderRadius: 6, padding: '0.75rem 1rem', fontSize: '0.9rem', lineHeight: 1.5, color: '#161616', ...style }}>
      <strong>Lightboxes:</strong> {LIGHTBOX_NOTICE}
    </div>
  );
}

// ── Details modal ─────────────────────────────────────────────
function DetailsModal({ item, onClose }) {
  if (!item) return null;
  const available = Math.max(0, item.quantity - item.reserved);
  return (
    <Modal open modalHeading={item.name} passiveModal onRequestClose={onClose} size="md">
      <div style={{ paddingBottom: '1rem' }}>
        {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8, marginBottom: '1rem' }} />}
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#525252' }}>
          {item.category} · {available} of {item.quantity} available
        </p>
        {item.category === 'Lightbox' && <LightboxNotice style={{ marginBottom: '1rem' }} />}
        {item.description && <p style={{ lineHeight: 1.6 }}>{item.description}</p>}
        {(item.storage_area || item.storage_code || item.storage_detail) && (
          <p style={{ marginTop: '1rem' }}>
            <strong>Where to find it:</strong> {[item.storage_area, item.storage_code, item.storage_detail].filter(Boolean).join(' · ')}
          </p>
        )}
        {item.readiness_checklist && (
          <div style={{ marginTop: '1rem', background: '#f1e9ff', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <p style={{ fontWeight: 700, margin: '0 0 0.35rem', color: '#6929c4' }}>Readiness checklist</p>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{item.readiness_checklist}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Request basket ────────────────────────────────────────
const EVENT_TYPES = ['Marketing event', 'Business event'];
const BAY_REQUIRED = ['Unsure', 'Yes', 'No'];
const BAY_BOOKED = ['To be reviewed', 'Yes', 'No', 'Not needed'];

const EMPTY_DETAILS = {
  event_name: '', event_type: '', requester_name: '', event_date: '',
  needed_from: '', needed_to: '', courier: '',
  shipping_address: '', venue_contact: '', contact_telephone: '',
  loading_bay_required: 'Unsure', loading_bay_booked: 'To be reviewed', internal_notes: '',
};

const panel = { background: '#fff', borderRadius: 12, padding: '1.5rem' };
const panelTitle = { margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700 };
const optional = <span style={{ color: '#6f6f6f', fontWeight: 400 }}> (optional)</span>;

function BasketView({ basket, setBasket, bookings, currentUser, isAdmin, onSubmitted, goFind }) {
  const [details, setDetails] = useState({ ...EMPTY_DETAILS, requester_name: currentUser?.name || '' });
  const [submitting, setSubmitting] = useState(false);
  const setD = (k) => (e) => setDetails((d) => ({ ...d, [k]: e.target.value }));

  const setQty = (id, qty) => setBasket((b) => b.map((l) => (l.item.id === id ? { ...l, qty } : l)));
  const remove = (id) => setBasket((b) => b.filter((l) => l.item.id !== id));

  // Availability for the chosen shipping → return window (approved bookings only).
  const datesChosen = details.needed_from && details.needed_to && details.needed_to >= details.needed_from;
  const lineAvail = (item) => (datesChosen ? windowAvailability(bookings, item, details.needed_from, details.needed_to) : null);
  const clashes = basket.filter(({ item, qty }) => { const a = lineAvail(item); return a && a.free < qty; });

  const handleSubmit = async () => {
    const d = details;
    const required = [
      [d.event_name.trim(), 'Event name'],
      [d.event_type, 'Event type'],
      [d.requester_name.trim(), 'Requester name'],
      [d.event_date, 'Event date'],
      [d.shipping_address.trim(), 'Full shipping address'],
      [d.needed_from, 'Date required for shipping'],
      [d.needed_to, 'Expected return date'],
    ];
    const missing = required.find(([v]) => !v);
    if (missing) { toast.error(`${missing[1]} is required`); return; }
    if (d.needed_to < d.needed_from) { toast.error('Expected return date must be on or after the shipping date'); return; }
    if (clashes.length) { toast.error('Some items are already booked for those dates. Change the dates or quantities.'); return; }
    setSubmitting(true);
    try {
      await createStoreRoomReservations(basket.map((l) => ({
        item_id: l.item.id,
        item_name: l.item.name,
        quantity: l.qty,
        requester_name: d.requester_name.trim(),
        requester_email: currentUser?.email,
        event_name: d.event_name.trim(),
        event_type: d.event_type,
        event_date: d.event_date,
        needed_from: d.needed_from,
        needed_to: d.needed_to,
        courier: d.courier.trim() || null,
        shipping_address: d.shipping_address.trim(),
        venue_contact: d.venue_contact.trim() || null,
        contact_telephone: d.contact_telephone.trim() || null,
        loading_bay_required: d.loading_bay_required,
        // These two are completed internally; only admins can see the inputs.
        loading_bay_booked: isAdmin ? d.loading_bay_booked : 'To be reviewed',
        internal_notes: isAdmin ? (d.internal_notes.trim() || null) : null,
        status: 'Pending',
      })));
      setBasket([]);
      setDetails({ ...EMPTY_DETAILS, requester_name: currentUser?.name || '' });
      onSubmitted();
    } catch (err) {
      toast.error('Could not send request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (basket.length === 0) {
    return (
      <div style={{ ...panel, padding: '3rem', textAlign: 'center' }}>
        <p style={{ fontWeight: 600, marginBottom: '1rem' }}>Your request basket is empty</p>
        <Button kind="primary" size="sm" onClick={goFind}>Find an item</Button>
      </div>
    );
  }

  const row = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.25rem 1.5rem' };
  const stack = { display: 'flex', flexDirection: 'column', gap: '1.25rem' };
  const hint = (t) => <span style={{ color: '#6f6f6f', fontWeight: 400 }}> {t}</span>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(0, 2.2fr)', gap: '1.5rem', alignItems: 'start' }}>
      {/* Basket */}
      <div style={panel}>
        <h2 style={panelTitle}>Your request basket</h2>
        {basket.some((l) => l.item.category === 'Lightbox') && <LightboxNotice style={{ margin: '0.5rem 0 1rem' }} />}
        {basket.map(({ item, qty }) => {
          const avail = lineAvail(item);
          const max = Math.max(1, avail ? avail.free : item.quantity - item.reserved);
          const clash = avail && avail.free < qty;
          return (
            <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderTop: '1px solid #e0e0e0' }}>
              <div style={{ width: 72, height: 72, background: '#f4f4f4', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                {item.image_url && <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#525252', margin: '0.15rem 0 0.6rem' }}>
                  {[item.storage_code, item.storage_detail].filter(Boolean).join(' · ') || `${max} available`}
                </div>
                {avail && (
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, margin: '-0.3rem 0 0.6rem', color: clash ? '#a2191f' : '#0e6027' }}>
                    {clash
                      ? (avail.free === 0
                        ? `Not available ${fmtDay(dayNum(details.needed_from))} – ${fmtDay(dayNum(details.needed_to))}`
                        : `Only ${avail.free} available for those dates`)
                      : `${avail.free} available for your dates`}
                    {clash && avail.conflicts.length > 0 && (
                      <span style={{ display: 'block', fontWeight: 400, color: '#525252' }}>
                        Booked {avail.conflicts.map((c) => `${fmtDay(dayNum(c.needed_from))} – ${fmtDay(dayNum(c.needed_to))}`).join(', ')}
                      </span>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ width: 90 }}>
                    <TextInput
                      id={`qty-${item.id}`} type="number" min="1" max={max} labelText="Quantity" value={qty}
                      onChange={(e) => setQty(item.id, Math.min(max, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    />
                  </div>
                  <Button kind="danger" size="sm" onClick={() => remove(item.id)}>Remove</Button>
                </div>
              </div>
            </div>
          );
        })}
        <p style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1rem', margin: 0, fontSize: '0.85rem', color: '#525252' }}>
          Add assets from the Find an item page. Quantities can be adjusted here.
        </p>
      </div>

      {/* Event and delivery details */}
      <div style={panel}>
        <h2 style={panelTitle}>Event and delivery details</h2>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#525252' }}>
          Only requester-facing information is required. Loading-bay administration can be completed internally afterwards.
        </p>

        <div style={row}>
          <TextInput id="rb-event" labelText="Event name *" value={details.event_name} onChange={setD('event_name')} />
          <Select id="rb-type" labelText="Event type *" value={details.event_type} onChange={setD('event_type')}>
            <SelectItem value="" text="Select event type…" />
            {EVENT_TYPES.map((t) => <SelectItem key={t} value={t} text={t} />)}
          </Select>
          <TextInput id="rb-requester" labelText="Requester name *" value={details.requester_name} onChange={setD('requester_name')} />
          <TextInput id="rb-from" type="date" labelText="Date required for shipping *" value={details.needed_from} onChange={setD('needed_from')} />
          <TextInput id="rb-event-date" type="date" labelText="Event date *" value={details.event_date} onChange={setD('event_date')} />
          <TextInput id="rb-to" type="date" labelText="Expected return date *" value={details.needed_to} onChange={setD('needed_to')} />
        </div>

        <div style={{ ...row, marginTop: '1.25rem', alignItems: 'start' }}>
          <div style={stack}>
            <TextArea id="rb-address" labelText="Full shipping address *" rows={5} value={details.shipping_address} onChange={setD('shipping_address')} />
            <TextInput id="rb-venue" labelText={<>Venue contact{optional}</>} value={details.venue_contact} onChange={setD('venue_contact')} />
            <TextInput id="rb-phone" labelText={<>Contact telephone{optional}</>} value={details.contact_telephone} onChange={setD('contact_telephone')} />
          </div>
          <div style={stack}>
            <TextInput id="rb-courier" labelText={<>Courier collecting{hint('(if known)')}</>} value={details.courier} onChange={setD('courier')} />
            <div style={{ background: '#fdf6dd', border: '1px solid #f1c21b', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Internal logistics follow-up</h3>
              <Select id="rb-bay-req" labelText={<>Loading bay required?{hint('(requester can leave as Unsure)')}</>} value={details.loading_bay_required} onChange={setD('loading_bay_required')}>
                {BAY_REQUIRED.map((o) => <SelectItem key={o} value={o} text={o} />)}
              </Select>
              {isAdmin && (
                <>
                  <Select id="rb-bay-booked" labelText={<>Loading bay booked?{hint('(completed by Events Marketing)')}</>} value={details.loading_bay_booked} onChange={setD('loading_bay_booked')}>
                    {BAY_BOOKED.map((o) => <SelectItem key={o} value={o} text={o} />)}
                  </Select>
                  <TextArea id="rb-internal" labelText={<>Internal notes{optional}</>} rows={4} value={details.internal_notes} onChange={setD('internal_notes')} />
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          {clashes.length > 0 && (
            <p style={{ margin: '0 0 0.75rem', color: '#a2191f', fontSize: '0.9rem', fontWeight: 600 }}>
              {clashes.map((c) => c.item.name).join(', ')} {clashes.length === 1 ? 'is' : 'are'} not available in full for these dates. Change the dates or lower the quantity.
            </p>
          )}
          <Button kind="primary" onClick={handleSubmit} disabled={submitting || clashes.length > 0}>{submitting ? 'Sending…' : 'Send request'}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Admin-only logistics editor (applies to every item in the request) ──
function LogisticsEditor({ rows, onChanged }) {
  const first = rows[0];
  const [booked, setBooked] = useState(first.loading_bay_booked || 'To be reviewed');
  const [notes, setNotes] = useState(first.internal_notes || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all(rows.map((r) => updateStoreRoomReservation(r.id, { loading_bay_booked: booked, internal_notes: notes.trim() || null })));
      toast.success('Logistics updated');
      onChanged();
    } catch (err) {
      toast.error('Update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#fdf6dd', border: '1px solid #f1c21b', borderRadius: 12, padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>Internal logistics follow-up</div>
        <div style={{ fontSize: '0.8rem', color: '#6f6f6f' }}>Only visible to the marketing team.</div>
      </div>
      <Select id={`bay-${first.id}`} labelText="Loading bay booked?" value={booked} onChange={(e) => setBooked(e.target.value)}>
        {BAY_BOOKED.map((o) => <SelectItem key={o} value={o} text={o} />)}
      </Select>
      <TextArea id={`inotes-${first.id}`} labelText="Internal notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div><Button size="md" kind="primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save logistics'}</Button></div>
    </div>
  );
}

// Small labelled value used in request cards
function Field({ label, children }) {
  if (!children) return null;
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6f6f6f', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: '0.92rem', color: '#161616', lineHeight: 1.4, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{children}</div>
    </div>
  );
}

const actionBtn = (kind, disabled) => {
  const kinds = {
    approve: { background: '#0f62fe', color: '#fff', border: '1px solid #0f62fe' },
    reject:  { background: '#fff', color: '#da1e28', border: '1px solid #da1e28' },
    outline: { background: '#fff', color: '#0f62fe', border: '1px solid #0f62fe' },
  };
  return {
    ...kinds[kind], height: 34, padding: '0 1rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
    fontFamily: 'inherit', whiteSpace: 'nowrap', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
  };
};

const sectionHeading = { margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700, color: '#161616' };

// ── Reservations list (My reservations / Admin requests) ──────
function ReservationsView({ reservations, items, bookings, admin, onChanged }) {
  // Admins open on Pending so approved requests drop off (they live on the calendar).
  const [statusFilter, setStatusFilter] = useState(admin ? 'Pending' : 'All');
  const [busyId, setBusyId] = useState(null);
  const [expandedKey, setExpandedKey] = useState(null);
  const itemsById = Object.fromEntries(items.map((i) => [i.id, i]));

  const today = todayNum();
  const isOverdue = (r) => r.status === 'Approved' && !!r.needed_to && dayNum(r.needed_to) < today;
  // One basket submission creates one row per item; show them together as a single request.
  const keyOf = (r) => `${r.requester_email}|${r.event_name}|${r.created_at}`;

  const counts = reservations.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
  const rows = reservations.filter((r) => statusFilter === 'All' || r.status === statusFilter);

  const groupMap = new Map();
  rows.forEach((r) => {
    const key = keyOf(r);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(r);
  });
  const groups = [...groupMap.entries()];

  // Why a pending line can't be approved right now (null = fine).
  const clashFor = (r) => {
    const item = itemsById[r.item_id];
    if (!item) return null;
    const { free, conflicts } = windowAvailability(bookings, item, r.needed_from, r.needed_to, r.id);
    if (free >= r.quantity) return null;
    const who = conflicts.map((c) => {
      const full = reservations.find((x) => x.id === c.id);
      return `${full?.event_name || 'another event'} (${fmtDay(dayNum(c.needed_from))} – ${fmtDay(dayNum(c.needed_to))})`;
    }).join(', ');
    return `Only ${free} of "${r.item_name}" free for those dates${who ? ` – clashes with ${who}` : ''}`;
  };

  const act = async (r, status) => {
    if (status === 'Approved') {
      const c = clashFor(r);
      if (c) { toast.error(c); return; }
    }
    setBusyId(r.id);
    try {
      await updateStoreRoomReservation(r.id, { status });
      toast.success(`${r.item_name} marked ${status.toLowerCase()}`);
      onChanged();
    } catch (err) {
      toast.error('Update failed: ' + err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['All', 'Pending', 'Approved', 'Rejected'].map((s) => {
          const n = s === 'All' ? reservations.length : (counts[s] || 0);
          return (
            <button key={s} type="button" style={pill(statusFilter === s)} onClick={() => setStatusFilter(s)}>
              {s} <span style={{ opacity: 0.7, fontWeight: 500 }}>({n})</span>
            </button>
          );
        })}
      </div>

      {groups.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#525252' }}>
          {statusFilter === 'Pending' && admin ? 'No pending requests. Approved bookings are on the “what\'s out & when” calendar.' : admin ? 'No requests.' : 'You have not requested anything yet.'}
        </div>
      ) : groups.map(([key, lines]) => {
        const g = lines[0];
        const open = expandedKey === key;
        return (
          <div key={key} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, marginBottom: '1rem', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{g.event_name || 'Untitled event'}</h3>
                  {g.event_type && <span style={badge('#e5f6ff', '#00539a')}>{g.event_type}</span>}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#525252', marginTop: 4 }}>
                  {lines.length} {lines.length === 1 ? 'item' : 'items'} · requested {fmtDate(g.created_at)}
                </div>
              </div>
              <button type="button" style={actionBtn('outline')} onClick={() => setExpandedKey(open ? null : key)}>
                {open ? 'Hide details' : 'View details'}
              </button>
            </div>

            {/* Key facts */}
            <div style={{ padding: '0 1.25rem 1.1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.9rem 1.5rem' }}>
              <Field label="Requester">{g.requester_name || g.requester_email}</Field>
              <Field label="Event date">{g.event_date ? fmtDate(g.event_date) : ''}</Field>
              <Field label="Ship by">{fmtDate(g.needed_from)}</Field>
              <Field label="Return by">{fmtDate(g.needed_to)}</Field>
            </div>

            {/* Items */}
            <div style={{ borderTop: '1px solid #e0e0e0', background: '#fafafa' }}>
              {lines.map((r, i) => (
                <div key={r.id} style={{ padding: '0.8rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', borderTop: i ? '1px solid #ececec' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 180, fontWeight: 600 }}>
                    {r.item_name} <span style={{ color: '#525252', fontWeight: 500 }}>× {r.quantity}</span>
                  </div>
                  <span style={isOverdue(r) ? badge('#da1e28', '#fff') : badge(STATUS_STYLE[r.status]?.background, STATUS_STYLE[r.status]?.color)}>
                    {isOverdue(r) ? `Overdue – was due ${fmtDay(dayNum(r.needed_to))}` : r.status}
                  </span>
                  {admin && r.status === 'Pending' && clashFor(r) && (
                    <span style={{ flexBasis: '100%', color: '#a2191f', fontSize: '0.82rem', fontWeight: 600 }}>⚠ {clashFor(r)}</span>
                  )}
                  {admin && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {r.status === 'Pending' && (
                        <>
                          <button type="button" style={actionBtn('approve', busyId === r.id)} disabled={busyId === r.id} onClick={() => act(r, 'Approved')}>Approve</button>
                          <button type="button" style={actionBtn('reject', busyId === r.id)} disabled={busyId === r.id} onClick={() => act(r, 'Rejected')}>Reject</button>
                        </>
                      )}
                      {r.status === 'Approved' && (
                        <button type="button" style={actionBtn('outline', busyId === r.id)} disabled={busyId === r.id} onClick={() => act(r, 'Returned')}>Mark returned</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Expanded details */}
            {open && (
              <div style={{ borderTop: '1px solid #e0e0e0', padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <h4 style={sectionHeading}>Delivery</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <Field label="Shipping address">{g.shipping_address}</Field>
                    <Field label="Venue contact">{g.venue_contact}</Field>
                    <Field label="Contact telephone">{g.contact_telephone}</Field>
                    <Field label="Courier collecting">{g.courier}</Field>
                    <Field label="Requester email">{admin ? g.requester_email : ''}</Field>
                    <Field label="Notes">{g.notes}</Field>
                  </div>
                </div>
                <div>
                  <h4 style={sectionHeading}>Logistics</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <Field label="Loading bay required">{g.loading_bay_required}</Field>
                    {!admin && <Field label="Loading bay booked">{g.loading_bay_booked}</Field>}
                    {admin && <LogisticsEditor rows={lines} onChanged={onChanged} />}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────
export default function MarketingStoreRoomTab({ currentUser: propUser }) {
  const { currentUser: contextUser } = useUser();
  const currentUser = contextUser || propUser;
  const isAdmin = STORE_ROOM_ADMIN_ROLES.includes((currentUser?.role || '').toLowerCase());

  const [view, setView] = useState('find');
  const [items, setItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [basket, setBasket] = useState([]);
  const [detailsItem, setDetailsItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showRequestSent, setShowRequestSent] = useState(false);

  const load = useCallback(async () => {
    try {
      const [itemsData, resData, bookingData] = await Promise.all([listStoreRoomItems(), listStoreRoomReservations(), listStoreRoomBookings()]);
      // `reserved` = units out today on approved bookings (items overdue for return still count).
      const today = todayNum();
      const withReserved = itemsData.map((i) => ({
        ...i,
        reserved: bookingData
          .filter((b) => b.item_id === i.id && dayNum(b.needed_from) <= today && Math.max(dayNum(b.needed_to), today) >= today)
          .reduce((n, b) => n + b.quantity, 0),
      }));
      setBookings(bookingData);
      setItems(withReserved);
      setReservations(resData);
      // keep basket lines in sync with fresh availability, drop deleted items
      setBasket((b) => b.map((l) => ({ ...l, item: withReserved.find((i) => i.id === l.item.id) })).filter((l) => l.item));
    } catch (err) {
      toast.error('Failed to load the store room: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (category !== 'All' && i.category !== category) return false;
      if (!q) return true;
      return [i.name, i.description, i.storage_area, i.storage_code, i.storage_detail, i.category]
        .some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [items, category, search]);

  const basketIds = new Set(basket.map((l) => l.item.id));
  const toggleBasket = (item) => {
    if (item.category === 'Lightbox' && !basketIds.has(item.id)) {
      toast.warning(LIGHTBOX_NOTICE, { autoClose: 10000 });
    }
    setBasket((b) => (b.some((l) => l.item.id === item.id) ? b.filter((l) => l.item.id !== item.id) : [...b, { item, qty: 1 }]));
  };

  const myReservations = reservations.filter((r) => r.requester_email === currentUser?.email);
  // Admins see full reservations. Sellers only get anonymous approved bookings (item, quantity, dates).
  const scheduleRows = isAdmin
    ? reservations
    : bookings.map((b) => ({ ...b, status: 'Approved', item_name: items.find((i) => i.id === b.item_id)?.name || 'Item' }));
  const pendingCount = reservations.filter((r) => r.status === 'Pending').length;

  const handleDelete = async () => {
    try {
      await deleteStoreRoomItem(deleteTarget.id);
      toast.success('Item deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const navBtn = (id, label, count) => (
    <button
      key={id}
      type="button"
      onClick={() => setView(id)}
      style={{
        border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', padding: '0.55rem 1.1rem', borderRadius: 999,
        background: view === id ? '#0f62fe' : 'transparent', color: view === id ? '#fff' : '#161616',
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      }}
    >
      {label}
      {count > 0 && <span style={{ background: '#da1e28', color: '#fff', borderRadius: 999, minWidth: 20, height: 20, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{count}</span>}
    </button>
  );

  if (loading) {
    return <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}><InlineLoading description="Loading Marketing Store Room…" /></div>;
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(90deg, #000814 0%, #002d9c 60%, #0f62fe 100%)', color: '#fff', borderRadius: 12, padding: '1.5rem 1.75rem', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Marketing Store Room</h1>
        <p style={{ margin: '0 0 1rem', opacity: 0.85, fontSize: '0.9rem' }}>
          See what merchandise, lightboxes, banners and iPads are available, where to find them, and request what you need for your event.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button kind="secondary" size="md" onClick={() => setView('find')}>Browse assets</Button>
          <Button kind="tertiary" size="md" style={{ color: '#fff', borderColor: '#fff' }} onClick={() => setView('basket')}>Start a request</Button>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '0.6rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {navBtn('find', 'Find an item')}
        {navBtn('basket', 'Request basket', basket.length)}
        {navBtn('mine', 'My requests')}
        {isAdmin && navBtn('requests', 'Admin: requests', pendingCount)}
        {isAdmin && navBtn('schedule', 'Admin: what\'s out & when')}
      </div>

      {view === 'find' && (
        <>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
              {['All', ...STORE_ROOM_CATEGORIES].map((c) => (
                <button key={c} type="button" style={pill(category === c)} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
            <div style={{ flex: '1 1 320px', maxWidth: 520 }}>
              <TextInput
                id="sr-search" labelText="Search" hideLabel
                placeholder="Search by item, cupboard, shelf or box…"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {isAdmin && <Button kind="primary" size="md" renderIcon={Add} onClick={() => { setEditItem(null); setShowItemModal(true); }}>Add item</Button>}
          </div>

          {filtered.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{items.length === 0 ? 'The store room is empty' : 'No items match your search'}</p>
              <p style={{ color: '#525252', margin: 0, fontSize: '0.9rem' }}>
                {items.length === 0
                  ? (isAdmin ? 'Use “Add item” to start building the catalogue.' : 'Items will appear here once the marketing team has added them.')
                  : 'Try a different category or search term.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filtered.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  inBasket={basketIds.has(item.id)}
                  isAdmin={isAdmin}
                  onDetails={setDetailsItem}
                  onToggleBasket={toggleBasket}
                  onEdit={(i) => { setEditItem(i); setShowItemModal(true); }}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </>
      )}

      {view === 'basket' && (
        <BasketView basket={basket} setBasket={setBasket} bookings={bookings} currentUser={currentUser} isAdmin={isAdmin} onSubmitted={() => { load(); setView('mine'); setShowRequestSent(true); }} goFind={() => setView('find')} />
      )}
      {view === 'mine' && <ReservationsView reservations={myReservations} items={items} bookings={bookings} admin={false} onChanged={load} />}
      {view === 'requests' && isAdmin && <ReservationsView reservations={reservations} items={items} bookings={bookings} admin onChanged={load} />}
      {view === 'schedule' && isAdmin && (
        <StoreRoomSchedule items={items} reservations={scheduleRows} admin={isAdmin} currentUser={currentUser} onChanged={load} />
      )}

      <Modal
        open={showRequestSent}
        passiveModal
        modalHeading="Thanks for your request"
        onRequestClose={() => setShowRequestSent(false)}
        size="sm"
      >
        <p style={{ marginBottom: '1rem' }}>
          <strong>Your booking is not confirmed yet.</strong> The Events Marketing team will review your request and follow up with you on Slack to confirm.
        </p>
        <p style={{ color: '#525252', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Please don't assume the items are reserved for you until you've heard back. You can track the status under My requests.
        </p>
        <Button kind="primary" onClick={() => setShowRequestSent(false)}>Got it</Button>
      </Modal>
      <DetailsModal item={detailsItem} onClose={() => setDetailsItem(null)} />
      <ItemModal open={showItemModal} item={editItem} onClose={() => setShowItemModal(false)} onSaved={load} />
      <Modal
        open={!!deleteTarget}
        danger
        modalHeading="Delete Item"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleDelete}
        onRequestClose={() => setDeleteTarget(null)}
        onSecondarySubmit={() => setDeleteTarget(null)}
        size="sm"
      >
        <p>Delete <strong>{deleteTarget?.name}</strong>? Any requests for it will also be removed. This cannot be undone.</p>
      </Modal>
    </div>
  );
}
