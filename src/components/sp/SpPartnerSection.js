import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Modal,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  DatePicker,
  DatePickerInput,
  Tag,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  InlineLoading,
  SkeletonText,
  Toggle,
} from '@carbon/react';
import { Add, Edit, TrashCan, Download, Launch, Copy, CheckmarkFilled } from '@carbon/icons-react';
import { toast } from 'react-toastify';
import RichTextEditor from '../RichTextEditor';
import {
  listSpContacts, createSpContact, updateSpContact, deleteSpContact,
  listSpTeamMembers, createSpTeamMember, updateSpTeamMember, deleteSpTeamMember,
  listSpStories, createSpStory, updateSpStory, deleteSpStory,
  listSpAssets, createSpAsset, updateSpAsset, deleteSpAsset,
  listSpSocialKits, createSpSocialKit, updateSpSocialKit, deleteSpSocialKit,
  updateSpPartner,
  uploadSpImage,
} from '../../lib/supabaseData';

const CONTENT_TYPES = ['Case Study', 'Blog', 'Video', 'Podcast', 'Infographic', 'Webinar'];
const ASSET_TYPES = ['PDF', 'Deck', 'Link', 'IBV', 'Case Study', 'Template', 'Other'];

const CONTENT_TYPE_COLORS = {
  'Case Study': 'green',
  'Blog': 'blue',
  'Video': 'purple',
  'Podcast': 'teal',
  'Infographic': 'cyan',
  'Webinar': 'magenta',
};

const ASSET_TYPE_ICONS = {
  'PDF': '📄',
  'Deck': '📊',
  'Link': '🔗',
  'IBV': '📈',
  'Case Study': '📋',
  'Template': '📝',
  'Other': '📁',
};

// ── Shared section header ─────────────────────────────────────
function SectionHeader({ title, isAdmin, onAdd, addLabel = 'Add' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h4>
      {isAdmin && (
        <Button kind="ghost" size="sm" renderIcon={Add} onClick={onAdd}>{addLabel}</Button>
      )}
    </div>
  );
}

// ── Shared delete confirm ─────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm, itemName }) {
  return (
    <Modal
      open={open}
      danger
      modalHeading="Confirm Delete"
      primaryButtonText="Delete"
      secondaryButtonText="Cancel"
      onRequestSubmit={onConfirm}
      onRequestClose={onClose}
      onSecondarySubmit={onClose}
      size="sm"
    >
      <p>Are you sure you want to delete <strong>{itemName}</strong>? This cannot be undone.</p>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════
// ── CONTACTS SECTION ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function ContactsSection({ partnerSlug, isAdmin, searchTerm }) {
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', job_title: '', email: '', photo_url: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await listSpContacts(partnerSlug);
    setContacts(data);
  }, [partnerSlug]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', job_title: '', email: '', photo_url: '' });
    setPhotoFile(null);
    setPhotoPreview('');
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name || '', job_title: c.job_title || '', email: c.email || '', photo_url: c.photo_url || '' });
    setPhotoFile(null);
    setPhotoPreview(c.photo_url || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      let photoUrl = form.photo_url;
      if (photoFile) photoUrl = await uploadSpImage(photoFile, 'sp-contacts');
      const fields = { ...form, photo_url: photoUrl, partner_slug: partnerSlug };
      if (editing) {
        await updateSpContact(editing.id, partnerSlug, fields);
        toast.success('Contact updated');
      } else {
        await createSpContact(fields);
        toast.success('Contact added');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSpContact(deleteTarget.id, partnerSlug);
      toast.success('Contact deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const filtered = searchTerm
    ? contacts.filter((c) => (c.name + ' ' + c.job_title + ' ' + c.email).toLowerCase().includes(searchTerm.toLowerCase()))
    : contacts;

  return (
    <div>
      <SectionHeader title="Partner Contacts" isAdmin={isAdmin} onAdd={openAdd} addLabel="Add Contact" />
      {filtered.length === 0 ? (
        <p style={{ color: '#525252', fontSize: '0.875rem' }}>No contacts yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {filtered.map((c) => (
            <div key={c.id} style={{ background: '#f4f4f4', borderRadius: 8, padding: '1rem', textAlign: 'center', position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e0e0e0', margin: '0 auto 0.5rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.photo_url
                  ? <img src={c.photo_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '1.5rem' }}>👤</span>
                }
              </div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: '0 0 0.25rem' }}>{c.name}</p>
              {c.job_title && <p style={{ fontSize: '0.75rem', color: '#525252', margin: '0 0 0.25rem' }}>{c.job_title}</p>}
              {c.email && <a href={`mailto:${c.email}`} style={{ fontSize: '0.75rem', color: '#0f62fe' }}>{c.email}</a>}
              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" hasIconOnly onClick={() => openEdit(c)} />
                  <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" hasIconOnly onClick={() => setDeleteTarget(c)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} modalHeading={editing ? 'Edit Contact' : 'Add Contact'} primaryButtonText={saving ? 'Saving…' : 'Save'} secondaryButtonText="Cancel" onRequestSubmit={handleSave} onRequestClose={() => setShowModal(false)} onSecondarySubmit={() => setShowModal(false)} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
          <TextInput id="c-name" labelText="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <TextInput id="c-title" labelText="Job Title" value={form.job_title} onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))} />
          <TextInput id="c-email" labelText="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>Photo</p>
            {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem', display: 'block' }} />}
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (!f) return; setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }} />
          </div>
        </div>
      </Modal>
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} itemName={deleteTarget?.name} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── TEAM MEMBERS SECTION ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function TeamMembersSection({ partnerSlug, isAdmin, searchTerm }) {
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', contact_link: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await listSpTeamMembers(partnerSlug);
    setMembers(data);
  }, [partnerSlug]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ name: '', role: '', contact_link: '' }); setShowModal(true); };
  const openEdit = (m) => { setEditing(m); setForm({ name: m.name || '', role: m.role || '', contact_link: m.contact_link || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const fields = { ...form, partner_slug: partnerSlug };
      if (editing) {
        await updateSpTeamMember(editing.id, partnerSlug, fields);
        toast.success('Team member updated');
      } else {
        await createSpTeamMember(fields);
        toast.success('Team member added');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSpTeamMember(deleteTarget.id, partnerSlug);
      toast.success('Team member deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const filtered = searchTerm
    ? members.filter((m) => (m.name + ' ' + m.role).toLowerCase().includes(searchTerm.toLowerCase()))
    : members;

  return (
    <div>
      <SectionHeader title="IBM Team" isAdmin={isAdmin} onAdd={openAdd} addLabel="Add Member" />
      {filtered.length === 0 ? (
        <p style={{ color: '#525252', fontSize: '0.875rem' }}>No team members listed.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {filtered.map((m) => (
            <div key={m.id} style={{ background: '#f4f4f4', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{m.name}</p>
                {m.role && <Tag type="gray" size="sm">{m.role}</Tag>}
                {m.contact_link && (
                  <a href={m.contact_link} target={m.contact_link.startsWith('mailto') ? '_self' : '_blank'} rel="noreferrer" style={{ fontSize: '0.75rem', color: '#0f62fe', display: 'block', marginTop: '0.25rem' }}>
                    {m.contact_link.startsWith('mailto') ? 'Email' : 'LinkedIn'}
                  </a>
                )}
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" hasIconOnly onClick={() => openEdit(m)} />
                  <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" hasIconOnly onClick={() => setDeleteTarget(m)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} modalHeading={editing ? 'Edit Team Member' : 'Add Team Member'} primaryButtonText={saving ? 'Saving…' : 'Save'} secondaryButtonText="Cancel" onRequestSubmit={handleSave} onRequestClose={() => setShowModal(false)} onSecondarySubmit={() => setShowModal(false)} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
          <TextInput id="tm-name" labelText="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <TextInput id="tm-role" labelText="Role (e.g. Partner Lead)" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
          <TextInput id="tm-contact" labelText="Contact Link (email or LinkedIn URL)" value={form.contact_link} onChange={(e) => setForm((f) => ({ ...f, contact_link: e.target.value }))} />
        </div>
      </Modal>
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} itemName={deleteTarget?.name} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// ── STORIES SECTION ───────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function StoriesSection({ partnerSlug, isAdmin, searchTerm }) {
  const [stories, setStories] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ title: '', content_type: 'Blog', thumbnail_url: '', description: '', story_date: '', external_url: '' });
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await listSpStories(partnerSlug);
    setStories(data);
  }, [partnerSlug]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ title: '', content_type: 'Blog', thumbnail_url: '', description: '', story_date: '', external_url: '' }); setThumbFile(null); setThumbPreview(''); setShowModal(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ title: s.title || '', content_type: s.content_type || 'Blog', thumbnail_url: s.thumbnail_url || '', description: s.description || '', story_date: s.story_date || '', external_url: s.external_url || '' });
    setThumbFile(null);
    setThumbPreview(s.thumbnail_url || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      let thumbUrl = form.thumbnail_url;
      if (thumbFile) thumbUrl = await uploadSpImage(thumbFile, 'sp-stories');
      const fields = { ...form, thumbnail_url: thumbUrl, partner_slug: partnerSlug };
      if (editing) {
        await updateSpStory(editing.id, partnerSlug, fields);
        toast.success('Story updated');
      } else {
        await createSpStory(fields);
        toast.success('Story added');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSpStory(deleteTarget.id, partnerSlug);
      toast.success('Story deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  let filtered = stories;
  if (searchTerm) filtered = filtered.filter((s) => (s.title + ' ' + s.description).toLowerCase().includes(searchTerm.toLowerCase()));
  if (filterType !== 'All') filtered = filtered.filter((s) => s.content_type === filterType);

  return (
    <div>
      <SectionHeader title="Success Stories & Content" isAdmin={isAdmin} onAdd={openAdd} addLabel="Add Story" />
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['All', ...CONTENT_TYPES].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: 16,
              border: '1px solid',
              borderColor: filterType === t ? '#0f62fe' : '#e0e0e0',
              background: filterType === t ? '#0f62fe' : '#fff',
              color: filterType === t ? '#fff' : '#393939',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >{t}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p style={{ color: '#525252', fontSize: '0.875rem' }}>No stories found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {filtered.map((s) => (
            <div key={s.id} style={{ background: '#f4f4f4', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {s.thumbnail_url
                ? <img src={s.thumbnail_url} alt={s.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: 140, background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📰</div>
              }
              <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Tag type={CONTENT_TYPE_COLORS[s.content_type] || 'gray'} size="sm">{s.content_type}</Tag>
                  {s.story_date && <span style={{ fontSize: '0.75rem', color: '#525252' }}>{new Date(s.story_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>}
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: '0 0 0.25rem', lineHeight: 1.4 }}>{s.title}</p>
                {s.description && <p style={{ fontSize: '0.8rem', color: '#525252', margin: '0 0 0.5rem', lineHeight: 1.5, flex: 1 }}>{s.description}</p>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                  {s.external_url && <Button kind="ghost" size="sm" renderIcon={Launch} href={s.external_url} target="_blank" rel="noreferrer">Read More</Button>}
                  {isAdmin && (
                    <>
                      <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" hasIconOnly onClick={() => openEdit(s)} />
                      <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" hasIconOnly onClick={() => setDeleteTarget(s)} />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} modalHeading={editing ? 'Edit Story' : 'Add Story'} primaryButtonText={saving ? 'Saving…' : 'Save'} secondaryButtonText="Cancel" onRequestSubmit={handleSave} onRequestClose={() => setShowModal(false)} onSecondarySubmit={() => setShowModal(false)} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
          <TextInput id="st-title" labelText="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Select id="st-type" labelText="Content Type" value={form.content_type} onChange={(e) => setForm((f) => ({ ...f, content_type: e.target.value }))}>
            {CONTENT_TYPES.map((t) => <SelectItem key={t} value={t} text={t} />)}
          </Select>
          <TextArea id="st-desc" labelText="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
          <DatePicker datePickerType="single" value={form.story_date} onChange={([d]) => { if (d) setForm((f) => ({ ...f, story_date: d.toISOString().split('T')[0] })); }}>
            <DatePickerInput id="st-date" labelText="Date" placeholder="YYYY-MM-DD" />
          </DatePicker>
          <TextInput id="st-url" labelText="External URL" value={form.external_url} onChange={(e) => setForm((f) => ({ ...f, external_url: e.target.value }))} />
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>Thumbnail Image</p>
            {thumbPreview && <img src={thumbPreview} alt="Preview" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', marginBottom: '0.5rem', borderRadius: 4 }} />}
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (!f) return; setThumbFile(f); setThumbPreview(URL.createObjectURL(f)); }} />
          </div>
        </div>
      </Modal>
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} itemName={deleteTarget?.title} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── ASSETS SECTION ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function AssetsSection({ partnerSlug, isAdmin, searchTerm }) {
  const [assets, setAssets] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ title: '', asset_type: 'PDF', file_url: '', description: '', asset_date: '' });
  const [assetFile, setAssetFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await listSpAssets(partnerSlug);
    setAssets(data);
  }, [partnerSlug]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ title: '', asset_type: 'PDF', file_url: '', description: '', asset_date: '' }); setAssetFile(null); setShowModal(true); };
  const openEdit = (a) => { setEditing(a); setForm({ title: a.title || '', asset_type: a.asset_type || 'PDF', file_url: a.file_url || '', description: a.description || '', asset_date: a.asset_date || '' }); setAssetFile(null); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      let fileUrl = form.file_url;
      if (assetFile) fileUrl = await uploadSpImage(assetFile, 'sp-assets');
      const fields = { ...form, file_url: fileUrl, partner_slug: partnerSlug };
      if (editing) {
        await updateSpAsset(editing.id, partnerSlug, fields);
        toast.success('Asset updated');
      } else {
        await createSpAsset(fields);
        toast.success('Asset added');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSpAsset(deleteTarget.id, partnerSlug);
      toast.success('Asset deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  let filtered = assets;
  if (searchTerm) filtered = filtered.filter((a) => (a.title + ' ' + a.description).toLowerCase().includes(searchTerm.toLowerCase()));
  if (filterType !== 'All') filtered = filtered.filter((a) => a.asset_type === filterType);

  return (
    <div>
      <SectionHeader title="Assets & Resources" isAdmin={isAdmin} onAdd={openAdd} addLabel="Add Asset" />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['All', ...ASSET_TYPES].map((t) => (
          <button key={t} onClick={() => setFilterType(t)} style={{ padding: '0.25rem 0.75rem', borderRadius: 16, border: '1px solid', borderColor: filterType === t ? '#0f62fe' : '#e0e0e0', background: filterType === t ? '#0f62fe' : '#fff', color: filterType === t ? '#fff' : '#393939', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>{t}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p style={{ color: '#525252', fontSize: '0.875rem' }}>No assets found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map((a) => (
            <div key={a.id} style={{ background: '#f4f4f4', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{ASSET_TYPE_ICONS[a.asset_type] || '📁'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{a.title}</p>
                  <Tag type="gray" size="sm">{a.asset_type}</Tag>
                  {a.asset_date && <span style={{ fontSize: '0.75rem', color: '#525252' }}>{new Date(a.asset_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>}
                </div>
                {a.description && <p style={{ fontSize: '0.8rem', color: '#525252', margin: 0, lineHeight: 1.4 }}>{a.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexShrink: 0 }}>
                {a.file_url && (
                  <Button kind="ghost" size="sm" renderIcon={a.asset_type === 'Link' ? Launch : Download} href={a.file_url} target="_blank" rel="noreferrer">
                    {a.asset_type === 'Link' ? 'Open' : 'Download'}
                  </Button>
                )}
                {isAdmin && (
                  <>
                    <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" hasIconOnly onClick={() => openEdit(a)} />
                    <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" hasIconOnly onClick={() => setDeleteTarget(a)} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} modalHeading={editing ? 'Edit Asset' : 'Add Asset'} primaryButtonText={saving ? 'Saving…' : 'Save'} secondaryButtonText="Cancel" onRequestSubmit={handleSave} onRequestClose={() => setShowModal(false)} onSecondarySubmit={() => setShowModal(false)} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
          <TextInput id="as-title" labelText="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Select id="as-type" labelText="Asset Type" value={form.asset_type} onChange={(e) => setForm((f) => ({ ...f, asset_type: e.target.value }))}>
            {ASSET_TYPES.map((t) => <SelectItem key={t} value={t} text={t} />)}
          </Select>
          <TextArea id="as-desc" labelText="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          <DatePicker datePickerType="single" value={form.asset_date} onChange={([d]) => { if (d) setForm((f) => ({ ...f, asset_date: d.toISOString().split('T')[0] })); }}>
            <DatePickerInput id="as-date" labelText="Date" placeholder="YYYY-MM-DD" />
          </DatePicker>
          <TextInput id="as-url" labelText="External URL (if link/external resource)" value={form.file_url} onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))} />
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>Upload File (overrides URL above)</p>
            <input type="file" onChange={(e) => { const f = e.target.files[0]; if (!f) return; setAssetFile(f); }} />
            {assetFile && <p style={{ fontSize: '0.75rem', color: '#525252', marginTop: '0.25rem' }}>Selected: {assetFile.name}</p>}
          </div>
        </div>
      </Modal>
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} itemName={deleteTarget?.title} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── SOCIAL KITS SECTION ───────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function SocialKitsSection({ partnerSlug, isAdmin, searchTerm }) {
  const [kits, setKits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ title: '', post_copy: '', graphic_url: '', downloadable_assets: [] });
  const [graphicFile, setGraphicFile] = useState(null);
  const [graphicPreview, setGraphicPreview] = useState('');
  const [newAssetLabel, setNewAssetLabel] = useState('');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const load = useCallback(async () => {
    const data = await listSpSocialKits(partnerSlug);
    setKits(data);
  }, [partnerSlug]);

  useEffect(() => { load(); }, [load]);

  const handleCopy = (kit) => {
    navigator.clipboard.writeText(kit.post_copy || '');
    setCopiedId(kit.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Post copy copied to clipboard!');
  };

  const openAdd = () => { setEditing(null); setForm({ title: '', post_copy: '', graphic_url: '', downloadable_assets: [] }); setGraphicFile(null); setGraphicPreview(''); setShowModal(true); };
  const openEdit = (k) => {
    setEditing(k);
    setForm({ title: k.title || '', post_copy: k.post_copy || '', graphic_url: k.graphic_url || '', downloadable_assets: k.downloadable_assets || [] });
    setGraphicFile(null);
    setGraphicPreview(k.graphic_url || '');
    setShowModal(true);
  };

  const handleAddAssetLink = () => {
    if (!newAssetLabel.trim() || !newAssetUrl.trim()) return;
    setForm((f) => ({ ...f, downloadable_assets: [...f.downloadable_assets, { label: newAssetLabel.trim(), url: newAssetUrl.trim() }] }));
    setNewAssetLabel('');
    setNewAssetUrl('');
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      let graphicUrl = form.graphic_url;
      if (graphicFile) graphicUrl = await uploadSpImage(graphicFile, 'sp-social-kits');
      const fields = { ...form, graphic_url: graphicUrl, partner_slug: partnerSlug };
      if (editing) {
        await updateSpSocialKit(editing.id, partnerSlug, fields);
        toast.success('Social kit updated');
      } else {
        await createSpSocialKit(fields);
        toast.success('Social kit added');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSpSocialKit(deleteTarget.id, partnerSlug);
      toast.success('Social kit deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const filtered = searchTerm
    ? kits.filter((k) => (k.title + ' ' + k.post_copy).toLowerCase().includes(searchTerm.toLowerCase()))
    : kits;

  return (
    <div>
      <SectionHeader title="Social Kits" isAdmin={isAdmin} onAdd={openAdd} addLabel="Add Social Kit" />
      {filtered.length === 0 ? (
        <p style={{ color: '#525252', fontSize: '0.875rem' }}>No social kits yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((k) => (
            <div key={k.id} style={{ background: '#f4f4f4', borderRadius: 8, padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {k.graphic_url && (
                <img src={k.graphic_url} alt={k.title} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{k.title}</p>
                  {isAdmin && (
                    <>
                      <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" hasIconOnly onClick={() => openEdit(k)} />
                      <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" hasIconOnly onClick={() => setDeleteTarget(k)} />
                    </>
                  )}
                </div>
                {k.post_copy && (
                  <div style={{ background: '#e8e8e8', borderRadius: 4, padding: '0.75rem', marginBottom: '0.5rem', position: 'relative' }}>
                    <p style={{ fontSize: '0.85rem', margin: '0 2rem 0 0', lineHeight: 1.6, color: '#393939', whiteSpace: 'pre-wrap' }}>{k.post_copy}</p>
                    <button
                      onClick={() => handleCopy(k)}
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: copiedId === k.id ? '#24a148' : '#525252', padding: 4 }}
                      title="Copy to clipboard"
                    >
                      {copiedId === k.id ? <CheckmarkFilled size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                )}
                {Array.isArray(k.downloadable_assets) && k.downloadable_assets.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {k.downloadable_assets.map((a, i) => (
                      <Button key={i} kind="secondary" size="sm" renderIcon={Download} href={a.url} target="_blank" rel="noreferrer">{a.label}</Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} modalHeading={editing ? 'Edit Social Kit' : 'Add Social Kit'} primaryButtonText={saving ? 'Saving…' : 'Save'} secondaryButtonText="Cancel" onRequestSubmit={handleSave} onRequestClose={() => setShowModal(false)} onSecondarySubmit={() => setShowModal(false)} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
          <TextInput id="sk-title" labelText="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <TextArea id="sk-copy" labelText="Post Copy" value={form.post_copy} onChange={(e) => setForm((f) => ({ ...f, post_copy: e.target.value }))} rows={5} />
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>Graphic</p>
            {graphicPreview && <img src={graphicPreview} alt="Preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', marginBottom: '0.5rem', borderRadius: 4 }} />}
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (!f) return; setGraphicFile(f); setGraphicPreview(URL.createObjectURL(f)); }} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>Downloadable Assets</p>
            {form.downloadable_assets.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ flex: 1, fontSize: '0.875rem' }}>{a.label}</span>
                <Button kind="ghost" size="sm" renderIcon={TrashCan} iconDescription="Remove" hasIconOnly onClick={() => setForm((f) => ({ ...f, downloadable_assets: f.downloadable_assets.filter((_, idx) => idx !== i) }))} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <TextInput id="sk-al" labelText="Label" value={newAssetLabel} onChange={(e) => setNewAssetLabel(e.target.value)} style={{ flex: 1 }} />
              <TextInput id="sk-au" labelText="URL" value={newAssetUrl} onChange={(e) => setNewAssetUrl(e.target.value)} style={{ flex: 2 }} />
              <Button kind="secondary" size="md" style={{ marginTop: '1.5rem' }} onClick={handleAddAssetLink}>Add</Button>
            </div>
          </div>
        </div>
      </Modal>
      <DeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} itemName={deleteTarget?.title} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── LOGO LOCKUP SECTION ───────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function LogoLockupSection({ partner, isAdmin, onPartnerUpdated }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ logo_lockup_status: 'not-approved', logo_lockup_guidance: '' });
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setForm({
      logo_lockup_status: partner.logo_lockup_status || 'not-approved',
      logo_lockup_guidance: partner.logo_lockup_guidance || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSpPartner(partner.id, form);
      toast.success('Logo lock-up updated');
      setShowModal(false);
      onPartnerUpdated();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isApproved = partner.logo_lockup_status === 'approved';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Logo Lock-Up Agreement</h4>
        {isAdmin && <Button kind="ghost" size="sm" renderIcon={Edit} onClick={openEdit}>Edit</Button>}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Tag type={isApproved ? 'green' : 'red'} size="md">
          {isApproved ? '✓ Approved' : '✗ Not Approved'}
        </Tag>
        {partner.logo_lockup_guidance && (
          <div dangerouslySetInnerHTML={{ __html: partner.logo_lockup_guidance }} style={{ fontSize: '0.875rem', color: '#393939', lineHeight: 1.6 }} />
        )}
      </div>

      <Modal open={showModal} modalHeading="Edit Logo Lock-Up" primaryButtonText={saving ? 'Saving…' : 'Save'} secondaryButtonText="Cancel" onRequestSubmit={handleSave} onRequestClose={() => setShowModal(false)} onSecondarySubmit={() => setShowModal(false)} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
          <Select id="ll-status" labelText="Status" value={form.logo_lockup_status} onChange={(e) => setForm((f) => ({ ...f, logo_lockup_status: e.target.value }))}>
            <SelectItem value="approved" text="Approved" />
            <SelectItem value="not-approved" text="Not Approved" />
          </Select>
          <RichTextEditor label="Guidance Text" value={form.logo_lockup_guidance} onChange={(val) => setForm((f) => ({ ...f, logo_lockup_guidance: val }))} placeholder="Add branding guidance…" minHeight="120px" />
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── PARTNER OVERVIEW ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function PartnerOverview({ partner, isAdmin, onPartnerUpdated }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ overview_html: '', logo_url: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setForm({ overview_html: partner.overview_html || '', logo_url: partner.logo_url || '' });
    setLogoFile(null);
    setLogoPreview(partner.logo_url || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let logoUrl = form.logo_url;
      if (logoFile) logoUrl = await uploadSpImage(logoFile, 'sp-partner-logos');
      await updateSpPartner(partner.id, { ...form, logo_url: logoUrl });
      toast.success('Partner overview updated');
      setShowModal(false);
      onPartnerUpdated();
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1 }}>
          {partner.logo_url && (
            <img src={partner.logo_url} alt={partner.display_name} style={{ height: 48, objectFit: 'contain', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            {partner.overview_html
              ? <div dangerouslySetInnerHTML={{ __html: partner.overview_html }} style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#161616' }} />
              : <p style={{ color: '#525252', fontSize: '0.875rem' }}>No overview yet.</p>
            }
          </div>
        </div>
        {isAdmin && <Button kind="ghost" size="sm" renderIcon={Edit} onClick={openEdit}>Edit Overview</Button>}
      </div>

      <Modal open={showModal} modalHeading="Edit Partner Overview" primaryButtonText={saving ? 'Saving…' : 'Save'} secondaryButtonText="Cancel" onRequestSubmit={handleSave} onRequestClose={() => setShowModal(false)} onSecondarySubmit={() => setShowModal(false)} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>Partner Logo</p>
            {logoPreview && <img src={logoPreview} alt="Logo preview" style={{ height: 48, objectFit: 'contain', marginBottom: '0.5rem', display: 'block' }} />}
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (!f) return; setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }} />
          </div>
          <RichTextEditor label="Partner Overview" value={form.overview_html} onChange={(val) => setForm((f) => ({ ...f, overview_html: val }))} placeholder="Strategic focus, UKI priorities, value prop, key solutions…" minHeight="200px" />
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── MAIN PARTNER SECTION ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════
export default function SpPartnerSection({ partner, isAdmin, searchTerm, onPartnerUpdated }) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Trigger lazy load when first rendered (accordion opened)
  useEffect(() => {
    if (loaded) return;
    setLoading(true);
    // The sub-sections load their own data, so we just mark as loaded
    // after a tick to allow the skeleton to show briefly
    const timer = setTimeout(() => {
      setLoaded(true);
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [loaded]);

  if (loading) {
    return (
      <div style={{ padding: '1rem' }}>
        <SkeletonText width="60%" heading />
        <SkeletonText paragraph lineCount={3} />
      </div>
    );
  }

  const sectionDivider = { borderTop: '1px solid #e0e0e0', paddingTop: '1.5rem', marginTop: '1.5rem' };

  return (
    <div style={{ padding: '0.5rem 0 1rem' }}>
      {/* Overview */}
      <PartnerOverview partner={partner} isAdmin={isAdmin} onPartnerUpdated={onPartnerUpdated} />

      {/* Logo Lock-Up */}
      <div style={sectionDivider}>
        <LogoLockupSection partner={partner} isAdmin={isAdmin} onPartnerUpdated={onPartnerUpdated} />
      </div>

      {/* Contacts */}
      <div style={sectionDivider}>
        <ContactsSection partnerSlug={partner.slug} isAdmin={isAdmin} searchTerm={searchTerm} />
      </div>

      {/* Team Members */}
      <div style={sectionDivider}>
        <TeamMembersSection partnerSlug={partner.slug} isAdmin={isAdmin} searchTerm={searchTerm} />
      </div>

      {/* Stories */}
      <div style={sectionDivider}>
        <StoriesSection partnerSlug={partner.slug} isAdmin={isAdmin} searchTerm={searchTerm} />
      </div>

      {/* Assets */}
      <div style={sectionDivider}>
        <AssetsSection partnerSlug={partner.slug} isAdmin={isAdmin} searchTerm={searchTerm} />
      </div>

      {/* Social Kits */}
      <div style={sectionDivider}>
        <SocialKitsSection partnerSlug={partner.slug} isAdmin={isAdmin} searchTerm={searchTerm} />
      </div>
    </div>
  );
}
