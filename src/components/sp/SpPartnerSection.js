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
  listSpStories, createSpStory, updateSpStory, deleteSpStory,
  listSpAssets, createSpAsset, updateSpAsset, deleteSpAsset,
  listSpSocialKits, createSpSocialKit, updateSpSocialKit, deleteSpSocialKit,
  updateSpPartner,
  uploadSpImage,
} from '../../lib/supabaseData';

const RESOURCE_CATEGORIES = [
  'Success Stories & Case Studies',
  'Blogs',
  'On-Demand, Demos & Videos',
  'Useful Resources & Links',
  'IBV Research',
  'Enablement - IBM & Partner',
  'Other',
];

const CATEGORY_COLORS = {
  'Success Stories & Case Studies': 'green',
  'Blogs': 'blue',
  'On-Demand, Demos & Videos': 'purple',
  'Useful Resources & Links': 'teal',
  'IBV Research': 'cyan',
  'Enablement - IBM & Partner': 'magenta',
  'Other': 'gray',
};

const CATEGORY_ICONS = {
  'Success Stories & Case Studies': '📋',
  'Blogs': '📰',
  'On-Demand, Demos & Videos': '🎬',
  'Useful Resources & Links': '🔗',
  'IBV Research': '📈',
  'Enablement - IBM & Partner': '🎓',
  'Other': '📁',
};

function normalizeStory(s) {
  let category = 'Other';
  const ct = s.content_type || '';
  if (ct === 'Case Study' || ct === 'Success Stories & Case Studies') category = 'Success Stories & Case Studies';
  else if (ct === 'Blog' || ct === 'Blogs') category = 'Blogs';
  else if (ct === 'Video' || ct === 'Podcast' || ct === 'Webinar' || ct === 'On-Demand, Demos & Videos') category = 'On-Demand, Demos & Videos';
  else if (ct === 'Infographic' || ct === 'Useful Resources & Links') category = 'Useful Resources & Links';
  else if (ct === 'IBV' || ct === 'IBV Research') category = 'IBV Research';
  else if (ct === 'Enablement - IBM & Partner') category = 'Enablement - IBM & Partner';
  else if (RESOURCE_CATEGORIES.includes(ct)) category = ct;

  return {
    _rawType: 'story',
    id: s.id,
    title: s.title || '',
    category,
    description: s.description || '',
    date: s.story_date || '',
    url: s.external_url || '',
    thumbnail_url: s.thumbnail_url || '',
    raw: s,
  };
}

function normalizeAsset(a) {
  let category = 'Other';
  const at = a.asset_type || '';
  if (at === 'PDF' || at === 'Link' || at === 'Useful Resources & Links') category = 'Useful Resources & Links';
  else if (at === 'Case Study' || at === 'Success Stories & Case Studies') category = 'Success Stories & Case Studies';
  else if (at === 'IBV' || at === 'IBV Research') category = 'IBV Research';
  else if (at === 'Deck' || at === 'Template' || at === 'Enablement - IBM & Partner') category = 'Enablement - IBM & Partner';
  else if (at === 'Blog' || at === 'Blogs') category = 'Blogs';
  else if (at === 'Video' || at === 'On-Demand, Demos & Videos') category = 'On-Demand, Demos & Videos';
  else if (RESOURCE_CATEGORIES.includes(at)) category = at;

  return {
    _rawType: 'asset',
    id: a.id,
    title: a.title || '',
    category,
    description: a.description || '',
    date: a.asset_date || '',
    url: a.file_url || '',
    thumbnail_url: '',
    raw: a,
  };
}

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
// ── SUCCESS STORIES & RESOURCES SECTION ───────────────────────
// ══════════════════════════════════════════════════════════════
function SuccessStoriesAndResourcesSection({ partnerSlug, isAdmin, searchTerm }) {
  const [items, setItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Success Stories & Case Studies',
    description: '',
    date: '',
    url: '',
    thumbnail_url: '',
  });
  const [fileUpload, setFileUpload] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [storiesData, assetsData] = await Promise.all([
        listSpStories(partnerSlug),
        listSpAssets(partnerSlug),
      ]);
      const normalizedStories = (storiesData || []).map(normalizeStory);
      const normalizedAssets = (assetsData || []).map(normalizeAsset);
      const combined = [...normalizedStories, ...normalizedAssets];
      // Sort newest date first
      combined.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setItems(combined);
    } catch (err) {
      toast.error('Failed to load stories and resources');
    }
  }, [partnerSlug]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      title: '',
      category: 'Success Stories & Case Studies',
      description: '',
      date: new Date().toISOString().split('T')[0],
      url: '',
      thumbnail_url: '',
    });
    setFileUpload(null);
    setThumbPreview('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      category: item.category || 'Success Stories & Case Studies',
      description: item.description || '',
      date: item.date || '',
      url: item.url || '',
      thumbnail_url: item.thumbnail_url || '',
    });
    setFileUpload(null);
    setThumbPreview(item.thumbnail_url || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      let fileUrl = form.url;
      if (fileUpload) {
        const bucket = (form.category === 'Blogs' || form.category === 'Success Stories & Case Studies' || form.category === 'On-Demand, Demos & Videos')
          ? 'sp-stories'
          : 'sp-assets';
        fileUrl = await uploadSpImage(fileUpload, bucket);
      }

      if (editing) {
        if (editing._rawType === 'story') {
          let ct = 'Blog';
          if (form.category === 'Success Stories & Case Studies') ct = 'Case Study';
          else if (form.category === 'On-Demand, Demos & Videos') ct = 'Video';
          else if (form.category === 'Useful Resources & Links') ct = 'Infographic';
          const fields = {
            title: form.title,
            content_type: ct,
            description: form.description,
            story_date: form.date,
            external_url: fileUrl,
            thumbnail_url: (fileUpload && fileUpload.type?.startsWith('image/')) ? fileUrl : (form.thumbnail_url || ''),
            partner_slug: partnerSlug,
          };
          await updateSpStory(editing.id, partnerSlug, fields);
          toast.success('Updated successfully');
        } else {
          let at = 'PDF';
          if (form.category === 'Useful Resources & Links') at = (fileUrl?.startsWith('http') && !fileUpload) ? 'Link' : 'PDF';
          else if (form.category === 'Success Stories & Case Studies') at = 'Case Study';
          else if (form.category === 'IBV Research') at = 'IBV';
          else if (form.category === 'Enablement - IBM & Partner') at = 'Deck';
          else if (form.category === 'Other') at = 'Other';
          const fields = {
            title: form.title,
            asset_type: at,
            description: form.description,
            asset_date: form.date,
            file_url: fileUrl,
            partner_slug: partnerSlug,
          };
          await updateSpAsset(editing.id, partnerSlug, fields);
          toast.success('Updated successfully');
        }
      } else {
        // Create new item
        if (form.category === 'Blogs' || form.category === 'On-Demand, Demos & Videos' || (form.category === 'Success Stories & Case Studies' && fileUpload?.type?.startsWith('image/'))) {
          let ct = 'Blog';
          if (form.category === 'Success Stories & Case Studies') ct = 'Case Study';
          else if (form.category === 'On-Demand, Demos & Videos') ct = 'Video';
          const fields = {
            title: form.title,
            content_type: ct,
            description: form.description,
            story_date: form.date,
            external_url: fileUrl,
            thumbnail_url: (fileUpload && fileUpload.type?.startsWith('image/')) ? fileUrl : '',
            partner_slug: partnerSlug,
          };
          await createSpStory(fields);
          toast.success('Added to Success Stories & Resources');
        } else {
          let at = 'PDF';
          if (form.category === 'Useful Resources & Links') at = (fileUrl?.startsWith('http') && !fileUpload) ? 'Link' : 'PDF';
          else if (form.category === 'Success Stories & Case Studies') at = 'Case Study';
          else if (form.category === 'IBV Research') at = 'IBV';
          else if (form.category === 'Enablement - IBM & Partner') at = 'Deck';
          else if (form.category === 'Other') at = 'Other';
          const fields = {
            title: form.title,
            asset_type: at,
            description: form.description,
            asset_date: form.date,
            file_url: fileUrl,
            partner_slug: partnerSlug,
          };
          await createSpAsset(fields);
          toast.success('Added to Success Stories & Resources');
        }
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
      if (deleteTarget._rawType === 'story') {
        await deleteSpStory(deleteTarget.id, partnerSlug);
      } else {
        await deleteSpAsset(deleteTarget.id, partnerSlug);
      }
      toast.success('Item deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  let filtered = items;
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter((i) => (i.title + ' ' + i.description + ' ' + i.category).toLowerCase().includes(q));
  }
  if (filterCategory !== 'All') {
    filtered = filtered.filter((i) => i.category === filterCategory);
  }

  const getActionLabel = (item) => {
    if (item.category === 'On-Demand, Demos & Videos') return 'Watch / View';
    if (item.category === 'Blogs') return 'Read Blog';
    if (item.category === 'Success Stories & Case Studies') return 'Read Case Study';
    if (item.url?.toLowerCase().endsWith('.pdf')) return 'Download PDF';
    return 'Open Resource';
  };

  return (
    <div>
      <SectionHeader title="Success Stories & Resources" isAdmin={isAdmin} onAdd={openAdd} addLabel="Add Item" />

      {/* Filter Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {['All', ...RESOURCE_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 16,
              border: '1px solid',
              borderColor: filterCategory === cat ? '#0f62fe' : '#e0e0e0',
              background: filterCategory === cat ? '#0f62fe' : '#fff',
              color: filterCategory === cat ? '#fff' : '#393939',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: '#525252', fontSize: '0.875rem' }}>No stories or resources found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.map((item) => (
            <div
              key={`${item._rawType}-${item.id}`}
              style={{
                background: '#f4f4f4',
                borderRadius: 8,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #e0e0e0',
              }}
            >
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  style={{ width: '100%', height: 140, objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 80,
                    background: '#e8f0fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                  }}
                >
                  {CATEGORY_ICONS[item.category] || '📁'}
                </div>
              )}

              <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Tag type={CATEGORY_COLORS[item.category] || 'gray'} size="sm">
                    {item.category}
                  </Tag>
                  {item.date && (
                    <span style={{ fontSize: '0.75rem', color: '#525252' }}>
                      {new Date(item.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 0.35rem', lineHeight: 1.4, color: '#161616' }}>
                  {item.title}
                </p>

                {item.description && (
                  <p style={{ fontSize: '0.8rem', color: '#525252', margin: '0 0 0.75rem', lineHeight: 1.5, flex: 1 }}>
                    {item.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e8e8e8' }}>
                  {item.url ? (
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={item.url.toLowerCase().endsWith('.pdf') ? Download : Launch}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ paddingLeft: '0.5rem' }}
                    >
                      {getActionLabel(item)}
                    </Button>
                  ) : <span />}

                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={Edit}
                        iconDescription="Edit"
                        hasIconOnly
                        onClick={() => openEdit(item)}
                      />
                      <Button
                        kind="danger--ghost"
                        size="sm"
                        renderIcon={TrashCan}
                        iconDescription="Delete"
                        hasIconOnly
                        onClick={() => setDeleteTarget(item)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={showModal}
        modalHeading={editing ? 'Edit Item' : 'Add Item'}
        primaryButtonText={saving ? 'Saving…' : 'Save'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSave}
        onRequestClose={() => setShowModal(false)}
        onSecondarySubmit={() => setShowModal(false)}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
          <TextInput
            id="ssr-title"
            labelText="Title *"
            placeholder="Enter title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />

          <Select
            id="ssr-category"
            labelText="Category *"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {RESOURCE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat} text={cat} />
            ))}
          </Select>

          <TextArea
            id="ssr-desc"
            labelText="Description"
            placeholder="Brief summary of this story, video, demo, or resource"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />

          <DatePicker
            datePickerType="single"
            value={form.date}
            onChange={([d]) => {
              if (d) setForm((f) => ({ ...f, date: d.toISOString().split('T')[0] }));
            }}
          >
            <DatePickerInput id="ssr-date" labelText="Date" placeholder="YYYY-MM-DD" />
          </DatePicker>

          <TextInput
            id="ssr-url"
            labelText="URL / External Link"
            placeholder="https://..."
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          />

          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>
              Upload File or Thumbnail Image (Optional)
            </p>
            {thumbPreview && (
              <img
                src={thumbPreview}
                alt="Preview"
                style={{ width: '100%', maxHeight: 120, objectFit: 'cover', marginBottom: '0.5rem', borderRadius: 4 }}
              />
            )}
            <input
              type="file"
              onChange={(e) => {
                const f = e.target.files[0];
                if (!f) return;
                setFileUpload(f);
                if (f.type?.startsWith('image/')) {
                  setThumbPreview(URL.createObjectURL(f));
                }
              }}
            />
            {fileUpload && (
              <p style={{ fontSize: '0.75rem', color: '#525252', marginTop: '0.25rem' }}>
                Selected: {fileUpload.name}
              </p>
            )}
          </div>
        </div>
      </Modal>

      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.title}
      />
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
  const [form, setForm] = useState({ overview_html: '', logo_url: '', custom_link_label: '', custom_link_url: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setForm({
      overview_html: partner.overview_html || '',
      logo_url: partner.logo_url || '',
      custom_link_label: partner.custom_link_label || '',
      custom_link_url: partner.custom_link_url || '',
    });
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
          <TextInput
            id="partner-custom-link-label"
            labelText="Card Link Wording"
            placeholder="e.g. Explore IBM Consulting for Microsoft"
            value={form.custom_link_label}
            onChange={(e) => setForm((f) => ({ ...f, custom_link_label: e.target.value }))}
          />
          <TextInput
            id="partner-custom-link-url"
            labelText="Card Link URL"
            placeholder="https://www.ibm.com/..."
            value={form.custom_link_url}
            onChange={(e) => setForm((f) => ({ ...f, custom_link_url: e.target.value }))}
          />
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

      {/* Success Stories & Resources */}
      <div style={sectionDivider}>
        <SuccessStoriesAndResourcesSection partnerSlug={partner.slug} isAdmin={isAdmin} searchTerm={searchTerm} />
      </div>

      {/* Social Kits */}
      <div style={sectionDivider}>
        <SocialKitsSection partnerSlug={partner.slug} isAdmin={isAdmin} searchTerm={searchTerm} />
      </div>
    </div>
  );
}
