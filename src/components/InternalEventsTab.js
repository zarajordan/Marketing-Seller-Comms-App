import React, { useState, useEffect } from 'react';
import {
  Button,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  Modal,
  Tag,
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

const AUDIENCE_TAGS = ['Technology', 'Consulting', 'Both'];

const AUDIENCE_STYLES = {
  Technology: { bg: '#edf5ff', color: '#0043ce' },
  Consulting:  { bg: '#defbe6', color: '#044317' },
  Both:        { bg: '#f6f2ff', color: '#6929c4' },
};

const EMPTY_FORM = {
  title: '',
  summary: '',
  date: '',
  time: '',
  location: '',
  speaker: '',
  contact: '',
  register_url: '',
  audience: 'Both',
  image_url: '',
};

export default function InternalEventsTab() {
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 'admin-manager' || currentUser?.role === 'marketer';

  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterAudience, setFilterAudience] = useState('All');

  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving]               = useState(false);
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);

  // Submit form (for non-admins)
  const [isSubmitOpen, setIsSubmitOpen]   = useState(false);
  const [submitForm, setSubmitForm]       = useState(EMPTY_FORM);
  const [submitImageFile, setSubmitImageFile] = useState(null);
  const [submitImagePreview, setSubmitImagePreview] = useState(null);
  const [submitting, setSubmitting]       = useState(false);

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
      audience:     ev.audience || 'Both',
      image_url:    ev.image_url || '',
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

  const handleSubmit = async () => {
    if (!submitForm.title.trim()) { toast.error('Title is required'); return; }
    if (!submitForm.date) { toast.error('Date is required'); return; }
    setSubmitting(true);
    try {
      let finalForm = { ...submitForm, status: 'pending' };
      if (submitImageFile) {
        finalForm.image_url = await uploadInternalEventImage(submitImageFile);
      }
      await createInternalEvent(finalForm);
      toast.success('Event submitted for review!');
      setIsSubmitOpen(false);
      setSubmitForm(EMPTY_FORM);
      setSubmitImageFile(null);
      setSubmitImagePreview(null);
      await load();
    } catch (err) {
      toast.error(`Failed to submit: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const filtered = events
    .filter(ev => !ev.status || ev.status === 'approved' || isAdmin)
    .filter(ev => {
      const matchSearch   = !search || ev.title?.toLowerCase().includes(search.toLowerCase()) || ev.speaker?.toLowerCase().includes(search.toLowerCase());
      const matchAudience = filterAudience === 'All' || ev.audience === filterAudience;
      return matchSearch && matchAudience;
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
        <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', lineHeight: 1.7, maxWidth: '900px' }}>
          This section highlights upcoming IBMer events, enablement sessions and briefings designed to keep you informed, connected and ahead of the latest business priorities. These events offer valuable opportunities to hear from subject matter experts, expand your network and stay up to date on key initiatives across the business.
        </p>
        <p style={{ margin: '10px 0 0', fontSize: '14px', color: '#1f2937', lineHeight: 1.7, maxWidth: '900px' }}>
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
          <div style={{ minWidth: '180px' }}>
            <Select id="ie-filter" labelText="Audience" value={filterAudience} onChange={e => setFilterAudience(e.target.value)}>
              <SelectItem value="All" text="All" />
              {AUDIENCE_TAGS.map(t => <SelectItem key={t} value={t} text={t} />)}
            </Select>
          </div>
          <Button kind="tertiary" renderIcon={Add} onClick={() => { setSubmitForm(EMPTY_FORM); setSubmitImageFile(null); setSubmitImagePreview(null); setIsSubmitOpen(true); }}>
            Submit an Event
          </Button>
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

      {/* Submit Event Modal (all users) */}
      <Modal
        open={isSubmitOpen}
        modalHeading="Submit an Internal Event"
        primaryButtonText={submitting ? 'Submitting…' : 'Submit for Review'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSubmit}
        onRequestClose={() => setIsSubmitOpen(false)}
        onSecondarySubmit={() => setIsSubmitOpen(false)}
        primaryButtonDisabled={submitting}
        size="md"
      >
        <p style={{ fontSize: '13px', color: '#525252', marginBottom: '16px' }}>
          Your submission will be reviewed by an admin before appearing on the page.
        </p>
        <EventFormFields
          form={submitForm}
          setForm={setSubmitForm}
          imagePreview={submitImagePreview}
          onImageChange={e => handleImageChange(e, setSubmitImageFile, setSubmitImagePreview)}
          onClearImage={() => { setSubmitImageFile(null); setSubmitImagePreview(null); setSubmitForm({ ...submitForm, image_url: '' }); }}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Select id="ie-audience" labelText="Audience" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
          {AUDIENCE_TAGS.map(t => <SelectItem key={t} value={t} text={t} />)}
        </Select>
        <TextInput id="ie-contact" labelText="Contact" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="email or name" />
      </div>
      <TextInput id="ie-register" labelText="Register URL" value={form.register_url} onChange={e => setForm({ ...form, register_url: e.target.value })} placeholder="https://…" />
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
  const audienceStyle = AUDIENCE_STYLES[ev.audience] || AUDIENCE_STYLES['Both'];

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
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', background: audienceStyle.bg, color: audienceStyle.color }}>{ev.audience}</span>
        </div>
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
