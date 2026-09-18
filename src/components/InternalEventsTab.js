import React, { useState, useEffect } from 'react';
import {
  Button,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  Modal,
} from '@carbon/react';
import { Add, TrashCan, Edit, Location, Time, UserMultiple, Launch, Events } from '@carbon/icons-react';
import { toast } from 'react-toastify';
import { useUser } from '../contexts/UserContext';
import {
  listInternalEvents,
  createInternalEvent,
  updateInternalEvent,
  deleteInternalEvent,
  uploadInternalEventImage,
} from '../lib/supabaseData';

const SEGMENTS = ['Technology', 'Consulting', 'Both'];
const PRODUCTS = ['IBM Z', 'Power', 'Storage', 'Security', 'Automation', 'Hybrid Cloud', 'Data & AI', 'Sustainability', 'Other'];
const INDUSTRIES = ['Financial Services', 'Healthcare', 'Government', 'Retail', 'Telco', 'Energy', 'Manufacturing', 'Cross-Industry', 'Other'];

const EMPTY_FORM = {
  title: '',
  summary: '',
  date: '',
  time: '',
  location: '',
  speaker: '',
  contact: '',
  register_url: '',
  image_url: '',
  segment: '',
  product: '',
  industry: '',
};

export default function InternalEventsTab() {
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 'admin-manager' || currentUser?.role === 'marketer';

  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterSegment, setFilterSegment]   = useState('All');
  const [filterProduct, setFilterProduct]   = useState('All');
  const [filterIndustry, setFilterIndustry] = useState('All');

  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving]               = useState(false);
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listInternalEvents();
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load internal events');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEdit = (ev) => {
    setForm({
      title:        ev.title || '',
      summary:      ev.summary || '',
      date:         ev.date || '',
      time:         ev.time || '',
      location:     ev.location || '',
      speaker:      ev.speaker || '',
      contact:      ev.contact || '',
      register_url: ev.register_url || '',
      image_url:    ev.image_url || '',
      segment:      ev.segment || '',
      product:      ev.product || '',
      industry:     ev.industry || '',
    });
    setEditingId(ev.id);
    setImageFile(null);
    setImagePreview(ev.image_url || null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e, setter, previewSetter) => {
    const file = e.target.files[0];
    if (!file) return;
    setter(file);
    previewSetter(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      let finalForm = { ...form };
      if (imageFile) {
        finalForm.image_url = await uploadInternalEventImage(imageFile);
      }
      if (editingId) {
        await updateInternalEvent(editingId, finalForm);
        toast.success('Event updated');
      } else {
        await createInternalEvent(finalForm);
        toast.success('Event added');
      }
      setIsModalOpen(false);
      await load();
    } catch (err) {
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteInternalEvent(id);
      toast.success('Event deleted');
      setDeleteConfirm(null);
      await load();
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  const filtered = events
    .filter(ev => !ev.status || ev.status !== 'pending')
    .filter(ev => {
      const matchSearch   = !search || ev.title?.toLowerCase().includes(search.toLowerCase()) || ev.speaker?.toLowerCase().includes(search.toLowerCase());
      const matchSegment  = filterSegment === 'All' || ev.segment === filterSegment;
      const matchProduct  = filterProduct === 'All' || ev.product === filterProduct;
      const matchIndustry = filterIndustry === 'All' || ev.industry === filterIndustry;
      return matchSearch && matchSegment && matchProduct && matchIndustry;
    })
    .sort((a, b) => (a.date || '') > (b.date || '') ? 1 : -1);

  return (
    <div className="internal-events-tab">

      {/* Header */}
      <div style={{ padding: '24px', marginBottom: '0', background: 'linear-gradient(135deg, #060c2a 0%, #0f1f60 55%, #162880 100%)', borderBottom: '2px solid rgba(69,137,255,0.3)' }}>
        <h2 style={{ color: '#fff', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Events size={24} />
          INTERNAL IBM EVENTS
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0', fontSize: '14px' }}>
          Upcoming IBMer events, enablement sessions and briefings.
        </p>
      </div>

      {/* Intro */}
      <div style={{ background: '#f4f7ff', borderBottom: '1px solid #dde4f5', padding: '20px 24px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', lineHeight: 1.7 }}>
          This section highlights upcoming IBMer events, enablement sessions and briefings designed to keep you informed, connected and ahead of the latest business priorities. These events offer valuable opportunities to hear from subject matter experts, expand your network and stay up to date on key initiatives across the business.
        </p>
        <p style={{ margin: '10px 0 0', fontSize: '14px', color: '#1f2937', lineHeight: 1.7 }}>
          We encourage all IBMers to review and attend relevant sessions where possible. In addition, participation in eligible events contributes towards your <strong>YourLearning hours</strong>, helping you continue your growth while staying connected to what's happening across IBM.
        </p>
      </div>

      <div style={{ padding: '24px' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <TextInput
              id="ie-search"
              labelText="Search"
              placeholder="Search by title or speaker…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <Select id="ie-filter-segment" labelText="Segment" value={filterSegment} onChange={e => setFilterSegment(e.target.value)}>
              <SelectItem value="All" text="All Segments" />
              {SEGMENTS.map(s => <SelectItem key={s} value={s} text={s} />)}
            </Select>
          </div>
          <div style={{ minWidth: '160px' }}>
            <Select id="ie-filter-product" labelText="Product" value={filterProduct} onChange={e => setFilterProduct(e.target.value)}>
              <SelectItem value="All" text="All Products" />
              {PRODUCTS.map(p => <SelectItem key={p} value={p} text={p} />)}
            </Select>
          </div>
          <div style={{ minWidth: '160px' }}>
            <Select id="ie-filter-industry" labelText="Industry" value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}>
              <SelectItem value="All" text="All Industries" />
              {INDUSTRIES.map(i => <SelectItem key={i} value={i} text={i} />)}
            </Select>
          </div>
          {isAdmin && (
            <Button renderIcon={Add} onClick={openAdd}>
              Add Event
            </Button>
          )}
        </div>

        {/* Cards */}
        {loading ? (
          <p style={{ color: '#525252' }}>Loading events…</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#525252' }}>
            <Events size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No events found</p>
            <p style={{ fontSize: '14px' }}>Check back soon for upcoming IBMer events.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filtered.map(ev => (
              <EventCard
                key={ev.id}
                ev={ev}
                isAdmin={isAdmin}
                onEdit={() => openEdit(ev)}
                onDelete={() => setDeleteConfirm(ev)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Admin Add/Edit Modal */}
      <Modal
        open={isModalOpen}
        modalHeading={editingId ? 'Edit Internal Event' : 'Add Internal Event'}
        primaryButtonText={saving ? 'Saving…' : editingId ? 'Update' : 'Add'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSave}
        onRequestClose={() => setIsModalOpen(false)}
        onSecondarySubmit={() => setIsModalOpen(false)}
        primaryButtonDisabled={saving}
        size="md"
      >
        <EventFormFields
          form={form}
          setForm={setForm}
          imagePreview={imagePreview}
          onImageChange={e => handleImageChange(e, setImageFile, setImagePreview)}
          onClearImage={() => { setImageFile(null); setImagePreview(null); setForm({ ...form, image_url: '' }); }}
        />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteConfirm}
        danger
        modalHeading="Delete Event"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestSubmit={() => handleDelete(deleteConfirm.id)}
        onRequestClose={() => setDeleteConfirm(null)}
        onSecondarySubmit={() => setDeleteConfirm(null)}
      >
        <p>Are you sure you want to delete <strong>{deleteConfirm?.title}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
}

// ── Shared form fields ────────────────────────────────────────────────────────
function EventFormFields({ form, setForm, imagePreview, onImageChange, onClearImage }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
      <TextInput id="ie-title" labelText="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      <TextArea id="ie-summary" labelText="Summary" rows={4} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} placeholder="Describe what IBMers can expect from this event…" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <TextInput id="ie-date" labelText="Date *" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        <TextInput id="ie-time" labelText="Time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="e.g. 10:00 – 11:30 BST" />
      </div>
      <TextInput id="ie-location" labelText="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. IBM South Bank or Microsoft Teams" />
      <TextInput id="ie-speaker" labelText="Speaker(s)" value={form.speaker} onChange={e => setForm({ ...form, speaker: e.target.value })} placeholder="e.g. Jane Smith, VP Technology" />
      <TextInput id="ie-contact" labelText="Contact" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="email or name" />
      <TextInput id="ie-register" labelText="Register URL" value={form.register_url} onChange={e => setForm({ ...form, register_url: e.target.value })} placeholder="https://…" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <Select id="ie-segment" labelText="Segment" value={form.segment} onChange={e => setForm({ ...form, segment: e.target.value })}>
          <SelectItem value="" text="— Select —" />
          {SEGMENTS.map(s => <SelectItem key={s} value={s} text={s} />)}
        </Select>
        <Select id="ie-product" labelText="Product" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })}>
          <SelectItem value="" text="— Select —" />
          {PRODUCTS.map(p => <SelectItem key={p} value={p} text={p} />)}
        </Select>
        <Select id="ie-industry" labelText="Industry" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
          <SelectItem value="" text="— Select —" />
          {INDUSTRIES.map(i => <SelectItem key={i} value={i} text={i} />)}
        </Select>
      </div>
      <div>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#161616', marginBottom: '6px' }}>Event Image (optional)</p>
        <input type="file" accept="image/*" onChange={onImageChange} style={{ fontSize: '13px', color: '#161616' }} />
        {imagePreview && (
          <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
            <img src={imagePreview} alt="Preview" style={{ height: '90px', borderRadius: '6px', border: '1px solid #e5e7eb', objectFit: 'cover' }} />
            <button onClick={onClearImage} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#da1e28', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────────────────────────
function EventCard({ ev, isAdmin, onEdit, onDelete }) {
  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

      {/* Image */}
      <div style={{ background: 'linear-gradient(135deg, #060c2a 0%, #0f1f60 100%)', aspectRatio: '16/7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        {ev.image_url
          ? <img src={ev.image_url} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Events size={40} style={{ color: 'rgba(255,255,255,0.15)' }} />
        }
        {ev.status === 'pending' && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#f1c21b', color: '#161616', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>PENDING REVIEW</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#161616', lineHeight: 1.4 }}>{ev.title}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {ev.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f62fe', fontWeight: 600 }}>
              <Time size={14} />
              {formatDate(ev.date)}{ev.time ? ` · ${ev.time}` : ''}
            </div>
          )}
          {ev.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#525252' }}>
              <Location size={14} />
              {ev.location}
            </div>
          )}
          {ev.speaker && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#525252' }}>
              <UserMultiple size={14} />
              {ev.speaker}
            </div>
          )}
        </div>

        {ev.summary && (
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#525252', lineHeight: 1.6 }}>{ev.summary}</p>
        )}

        {ev.contact && (
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#8d8d8d' }}>
            Contact: <a href={ev.contact.includes('@') ? `mailto:${ev.contact}` : undefined} style={{ color: '#0f62fe' }}>{ev.contact}</a>
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #f4f4f4', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {ev.register_url && (
          <Button kind="primary" size="sm" renderIcon={Launch} href={ev.register_url} target="_blank" rel="noopener noreferrer">
            Register
          </Button>
        )}
        {isAdmin && (
          <>
            <Button kind="ghost" size="sm" renderIcon={Edit} onClick={onEdit}>Edit</Button>
            <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} onClick={onDelete}>Delete</Button>
          </>
        )}
      </div>
    </div>
  );
}
