import React, { useState, useEffect } from 'react';
import {
  Button,
  Tag,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  Modal,
} from '@carbon/react';
import { Add, TrashCan, Edit, PlayFilledAlt, VideoFilled } from '@carbon/icons-react';
import { toast } from 'react-toastify';
import { useUser } from '../contexts/UserContext';
import {
  listOnDemandRecordings,
  createOnDemandRecording,
  updateOnDemandRecording,
  deleteOnDemandRecording,
  uploadOnDemandThumbnail,
} from '../lib/supabaseData';

const SEGMENTS = ['Technology', 'Consulting', 'Both'];
const PRODUCTS = ['IBM Z', 'Power', 'Storage', 'Security', 'Automation', 'Hybrid Cloud', 'Data & AI', 'Sustainability', 'Other'];
const INDUSTRIES = ['Financial Services', 'Healthcare', 'Government', 'Retail', 'Telco', 'Energy', 'Manufacturing', 'Cross-Industry', 'Other'];

const EMPTY_FORM = {
  title: '',
  description: '',
  event_date: '',
  recording_url: '',
  thumbnail_url: '',
  duration: '',
  presenter: '',
  segment: '',
  product: '',
  industry: '',
};

export default function OnDemandTab() {
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 'admin-manager';

  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterSegment, setFilterSegment]   = useState('All');
  const [filterProduct, setFilterProduct]   = useState('All');
  const [filterIndustry, setFilterIndustry] = useState('All');

  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving]               = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listOnDemandRecordings();
      setRecordings(data);
    } catch (err) {
      toast.error('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setIsModalOpen(true);
  };

  const openEdit = (rec) => {
    setForm({
      title:         rec.title || '',
      description:   rec.description || '',
      event_date:    rec.event_date || '',
      recording_url: rec.recording_url || '',
      thumbnail_url: rec.thumbnail_url || '',
      duration:      rec.duration || '',
      presenter:     rec.presenter || '',
      segment:       rec.segment || '',
      product:       rec.product || '',
      industry:      rec.industry || '',
    });
    setEditingId(rec.id);
    setThumbnailFile(null);
    setThumbnailPreview(rec.thumbnail_url || null);
    setIsModalOpen(true);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.recording_url.trim()) { toast.error('Recording URL is required'); return; }
    setSaving(true);
    try {
      let finalForm = { ...form };
      if (thumbnailFile) {
        const url = await uploadOnDemandThumbnail(thumbnailFile);
        finalForm = { ...finalForm, thumbnail_url: url };
      }
      if (editingId) {
        await updateOnDemandRecording(editingId, finalForm);
        toast.success('Recording updated');
      } else {
        await createOnDemandRecording(finalForm);
        toast.success('Recording added');
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
      await deleteOnDemandRecording(id);
      toast.success('Recording deleted');
      setDeleteConfirm(null);
      await load();
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  const filtered = recordings.filter(r => {
    const matchSearch   = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.presenter?.toLowerCase().includes(search.toLowerCase());
    const matchSegment  = filterSegment === 'All' || r.segment === filterSegment;
    const matchProduct  = filterProduct === 'All' || r.product === filterProduct;
    const matchIndustry = filterIndustry === 'All' || r.industry === filterIndustry;
    return matchSearch && matchSegment && matchProduct && matchIndustry;
  });

  return (
    <div className="on-demand-tab">

      {/* Header */}
      <div style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, #060c2a 0%, #0f1f60 55%, #162880 100%)', borderBottom: '2px solid rgba(69,137,255,0.3)' }}>
        <h2 style={{ color: '#fff', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <VideoFilled size={24} />
          ON DEMAND
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0' }}>
          Recordings from previous virtual events — watch at your own pace.
        </p>
      </div>

      <div style={{ padding: '0 24px 24px' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '220px' }}>
            <TextInput
              id="od-search"
              labelText="Search"
              placeholder="Search by title or presenter…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <Select id="od-filter-segment" labelText="Segment" value={filterSegment} onChange={e => setFilterSegment(e.target.value)}>
              <SelectItem value="All" text="All Segments" />
              {SEGMENTS.map(s => <SelectItem key={s} value={s} text={s} />)}
            </Select>
          </div>
          <div style={{ minWidth: '160px' }}>
            <Select id="od-filter-product" labelText="Product" value={filterProduct} onChange={e => setFilterProduct(e.target.value)}>
              <SelectItem value="All" text="All Products" />
              {PRODUCTS.map(p => <SelectItem key={p} value={p} text={p} />)}
            </Select>
          </div>
          <div style={{ minWidth: '160px' }}>
            <Select id="od-filter-industry" labelText="Industry" value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}>
              <SelectItem value="All" text="All Industries" />
              {INDUSTRIES.map(i => <SelectItem key={i} value={i} text={i} />)}
            </Select>
          </div>
          {isAdmin && (
            <Button renderIcon={Add} onClick={openAdd}>
              Add Recording
            </Button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <p style={{ color: '#525252' }}>Loading recordings…</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#525252' }}>
            <VideoFilled size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No recordings found</p>
            <p style={{ fontSize: '14px' }}>
              {isAdmin ? 'Add the first recording using the button above.' : 'Check back later for recordings.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map(rec => (
              <RecordingCard
                key={rec.id}
                rec={rec}
                isAdmin={isAdmin}
                onEdit={() => openEdit(rec)}
                onDelete={() => setDeleteConfirm(rec)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={isModalOpen}
        modalHeading={editingId ? 'Edit Recording' : 'Add Recording'}
        primaryButtonText={saving ? 'Saving…' : (editingId ? 'Update' : 'Add')}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSave}
        onRequestClose={() => setIsModalOpen(false)}
        onSecondarySubmit={() => setIsModalOpen(false)}
        primaryButtonDisabled={saving}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
          <TextInput
            id="od-title"
            labelText="Title *"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <TextArea
            id="od-description"
            labelText="Description"
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <TextInput
              id="od-presenter"
              labelText="Presenter(s)"
              value={form.presenter}
              onChange={e => setForm({ ...form, presenter: e.target.value })}
            />
            <TextInput
              id="od-event-date"
              labelText="Original Event Date"
              type="date"
              value={form.event_date}
              onChange={e => setForm({ ...form, event_date: e.target.value })}
            />
          </div>
          <TextInput
            id="od-duration"
            labelText="Duration (e.g. 45 mins)"
            value={form.duration}
            onChange={e => setForm({ ...form, duration: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Select id="od-segment" labelText="Segment" value={form.segment} onChange={e => setForm({ ...form, segment: e.target.value })}>
              <SelectItem value="" text="— Select —" />
              {SEGMENTS.map(s => <SelectItem key={s} value={s} text={s} />)}
            </Select>
            <Select id="od-product" labelText="Product" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })}>
              <SelectItem value="" text="— Select —" />
              {PRODUCTS.map(p => <SelectItem key={p} value={p} text={p} />)}
            </Select>
            <Select id="od-industry" labelText="Industry" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
              <SelectItem value="" text="— Select —" />
              {INDUSTRIES.map(i => <SelectItem key={i} value={i} text={i} />)}
            </Select>
          </div>
          <TextInput
            id="od-recording-url"
            labelText="Recording URL *"
            placeholder="https://ibm.webex.com/… or https://youtu.be/…"
            value={form.recording_url}
            onChange={e => setForm({ ...form, recording_url: e.target.value })}
          />
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#161616', marginBottom: '6px' }}>Thumbnail Image (optional)</p>
            <input
              id="od-thumbnail-file"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              style={{ fontSize: '13px', color: '#161616' }}
            />
            {thumbnailPreview && (
              <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  style={{ height: '90px', borderRadius: '6px', border: '1px solid #e5e7eb', objectFit: 'cover' }}
                />
                <button
                  onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); setForm({ ...form, thumbnail_url: '' }); }}
                  style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#da1e28', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteConfirm}
        danger
        modalHeading="Delete Recording"
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

function RecordingCard({ rec, isAdmin, onEdit, onDelete }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {/* Thumbnail */}
      <div style={{ position: 'relative', background: '#060c2a', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {rec.thumbnail_url
          ? <img src={rec.thumbnail_url} alt={rec.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <VideoFilled size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
        }
        <a
          href={rec.recording_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
        >
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(15,98,254,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.4)', transition: 'transform 0.15s' }}>
            <PlayFilledAlt size={28} style={{ color: '#fff', marginLeft: '3px' }} />
          </div>
        </a>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {rec.duration && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: '#f4f4f4', color: '#525252' }}>{rec.duration} mins</span>
          </div>
        )}
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#161616', lineHeight: 1.4 }}>{rec.title}</h3>
        {rec.presenter && <p style={{ margin: 0, fontSize: '12px', color: '#525252' }}>Presenter: {rec.presenter}</p>}
        {rec.event_date && <p style={{ margin: 0, fontSize: '12px', color: '#8d8d8d' }}>{new Date(rec.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
        {rec.description && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#525252', lineHeight: 1.5 }}>{rec.description}</p>}
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div style={{ padding: '8px 16px 12px', display: 'flex', gap: '8px', borderTop: '1px solid #f4f4f4' }}>
          <Button kind="ghost" size="sm" renderIcon={Edit} onClick={onEdit}>Edit</Button>
          <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} onClick={onDelete}>Delete</Button>
        </div>
      )}
    </div>
  );
}
