import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  InlineLoading,
  Toggle,
} from '@carbon/react';
import { ChevronLeft, ChevronRight, Add, Edit, TrashCan, Star, StarFilled } from '@carbon/icons-react';
import { toast } from 'react-toastify';
import RichTextEditor from '../RichTextEditor';
import {
  listSpAchievements,
  createSpAchievement,
  updateSpAchievement,
  deleteSpAchievement,
  uploadSpImage,
} from '../../lib/supabaseData';

const EMPTY_FORM = {
  title: '',
  partner_slug: '',
  hero_image_url: '',
  achievement_date: '',
  short_overview: '',
  full_summary: '',
  links: [],
  extra_images: [],
  is_featured: false,
};

const PARTNER_OPTIONS = [
  { slug: 'aws', label: 'Amazon Web Services (AWS)' },
  { slug: 'microsoft', label: 'Microsoft' },
  { slug: 'sap', label: 'SAP' },
  { slug: 'salesforce', label: 'Salesforce' },
  { slug: 'google', label: 'Google Cloud' },
  { slug: 'adobe', label: 'Adobe' },
  { slug: 'palo-alto', label: 'Palo Alto Networks' },
  { slug: 'oracle', label: 'Oracle' },
];

function getPartnerLabel(slug) {
  return PARTNER_OPTIONS.find((p) => p.slug === slug)?.label || slug;
}

// ── Admin Achievement Modal ───────────────────────────────────
function AchievementModal({ open, onClose, onSaved, editingItem, partners }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    if (editingItem) {
      setForm({
        title: editingItem.title || '',
        partner_slug: editingItem.partner_slug || '',
        hero_image_url: editingItem.hero_image_url || '',
        achievement_date: editingItem.achievement_date || '',
        short_overview: editingItem.short_overview || '',
        full_summary: editingItem.full_summary || '',
        links: editingItem.links || [],
        extra_images: editingItem.extra_images || [],
        is_featured: editingItem.is_featured || false,
      });
      setHeroPreview(editingItem.hero_image_url || '');
    } else {
      setForm(EMPTY_FORM);
      setHeroPreview('');
    }
    setHeroFile(null);
  }, [editingItem, open]);

  const handleHeroChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHeroFile(file);
    setHeroPreview(URL.createObjectURL(file));
  };

  const handleAddLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    setForm((f) => ({ ...f, links: [...f.links, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }] }));
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (i) => {
    setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.partner_slug) { toast.error('Partner is required'); return; }
    setSaving(true);
    try {
      let heroUrl = form.hero_image_url;
      if (heroFile) heroUrl = await uploadSpImage(heroFile, 'sp-achievements');
      const payload = { ...form, hero_image_url: heroUrl };
      if (editingItem) {
        await updateSpAchievement(editingItem.id, payload);
        toast.success('Achievement updated');
      } else {
        await createSpAchievement({ ...payload, status: 'active' });
        toast.success('Achievement created');
      }
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
      modalHeading={editingItem ? 'Edit Achievement' : 'Add Achievement'}
      primaryButtonText={saving ? 'Saving…' : 'Save'}
      secondaryButtonText="Cancel"
      onRequestSubmit={handleSave}
      onRequestClose={onClose}
      onSecondarySubmit={onClose}
      size="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
        <TextInput
          id="ach-title"
          labelText="Achievement Title *"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <Select
          id="ach-partner"
          labelText="Partner *"
          value={form.partner_slug}
          onChange={(e) => setForm((f) => ({ ...f, partner_slug: e.target.value }))}
        >
          <SelectItem value="" text="Select a partner…" />
          {PARTNER_OPTIONS.map((p) => (
            <SelectItem key={p.slug} value={p.slug} text={p.label} />
          ))}
        </Select>
        <DatePicker
          datePickerType="single"
          value={form.achievement_date}
          onChange={([date]) => {
            if (!date) return;
            const iso = date.toISOString().split('T')[0];
            setForm((f) => ({ ...f, achievement_date: iso }));
          }}
        >
          <DatePickerInput id="ach-date" labelText="Achievement Date" placeholder="YYYY-MM-DD" />
        </DatePicker>
        <TextArea
          id="ach-overview"
          labelText="Short Overview (shown on card)"
          value={form.short_overview}
          onChange={(e) => setForm((f) => ({ ...f, short_overview: e.target.value }))}
          rows={3}
        />
        <RichTextEditor
          label="Full Summary (shown in expanded view)"
          value={form.full_summary}
          onChange={(val) => setForm((f) => ({ ...f, full_summary: val }))}
          placeholder="Write the full achievement summary…"
          minHeight="160px"
        />
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>Hero Image</p>
          {heroPreview && (
            <img src={heroPreview} alt="Hero preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', marginBottom: '0.5rem', borderRadius: 4 }} />
          )}
          <input type="file" accept="image/*" onChange={handleHeroChange} />
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>Links</p>
          {form.links.map((lnk, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ flex: 1, fontSize: '0.875rem' }}>{lnk.label} — {lnk.url}</span>
              <Button kind="ghost" size="sm" renderIcon={TrashCan} iconDescription="Remove" hasIconOnly onClick={() => handleRemoveLink(i)} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <TextInput id="new-link-label" labelText="Label" value={newLinkLabel} onChange={(e) => setNewLinkLabel(e.target.value)} style={{ flex: 1 }} />
            <TextInput id="new-link-url" labelText="URL" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} style={{ flex: 2 }} />
            <Button kind="secondary" size="md" style={{ marginTop: '1.5rem' }} onClick={handleAddLink}>Add</Button>
          </div>
        </div>
        <Toggle
          id="ach-featured"
          labelText="Pin as Featured"
          labelA="No"
          labelB="Yes"
          toggled={form.is_featured}
          onToggle={(val) => setForm((f) => ({ ...f, is_featured: val }))}
        />
      </div>
    </Modal>
  );
}

// ── Seller Submit Modal ───────────────────────────────────────
function SubmitAchievementModal({ open, onClose, onSubmitted, currentUser }) {
  const [form, setForm] = useState({ title: '', partner_slug: '', achievement_date: '', short_overview: '' });
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ title: '', partner_slug: '', achievement_date: '', short_overview: '' });
      setHeroFile(null);
      setHeroPreview('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.partner_slug) { toast.error('Please select a partner'); return; }
    setSaving(true);
    try {
      let heroUrl = null;
      if (heroFile) heroUrl = await uploadSpImage(heroFile, 'sp-achievements');
      await createSpAchievement({
        title: form.title.trim(),
        partner_slug: form.partner_slug,
        short_overview: form.short_overview.trim() || null,
        achievement_date: form.achievement_date || null,
        hero_image_url: heroUrl,
        full_summary: null,
        links: [],
        extra_images: [],
        status: 'pending',
        submitted_by_email: currentUser?.email || '',
        is_featured: false,
        display_order: 0,
      });
      toast.success('Achievement submitted for review!');
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error('Submission failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      modalHeading="Submit a Partnership Achievement"
      primaryButtonText={saving ? 'Submitting…' : 'Submit for Review'}
      secondaryButtonText="Cancel"
      onRequestSubmit={handleSubmit}
      onRequestClose={onClose}
      onSecondarySubmit={onClose}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#525252' }}>Share a partnership achievement for review. Once approved it will appear in the carousel.</p>
        <TextInput id="sub-title" labelText="Achievement Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        <Select id="sub-partner" labelText="Partner *" value={form.partner_slug} onChange={(e) => setForm((f) => ({ ...f, partner_slug: e.target.value }))}>
          <SelectItem value="" text="Select a partner…" />
          {PARTNER_OPTIONS.map((p) => <SelectItem key={p.slug} value={p.slug} text={p.label} />)}
        </Select>
        <DatePicker datePickerType="single" value={form.achievement_date} onChange={([d]) => { if (d) setForm((f) => ({ ...f, achievement_date: d.toISOString().split('T')[0] })); }}>
          <DatePickerInput id="sub-date" labelText="Achievement Date" placeholder="YYYY-MM-DD" />
        </DatePicker>
        <TextArea id="sub-overview" labelText="Overview" value={form.short_overview} onChange={(e) => setForm((f) => ({ ...f, short_overview: e.target.value }))} rows={4} />
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: '#525252' }}>Hero Image (optional)</p>
          {heroPreview && <img src={heroPreview} alt="Preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', marginBottom: '0.5rem', borderRadius: 4 }} />}
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (!f) return; setHeroFile(f); setHeroPreview(URL.createObjectURL(f)); }} />
        </div>
      </div>
    </Modal>
  );
}

// ── Expanded Achievement View ─────────────────────────────────
function AchievementExpandedModal({ open, onClose, achievement }) {
  if (!achievement) return null;
  return (
    <Modal open={open} modalHeading={achievement.title} passiveModal onRequestClose={onClose} size="lg">
      <div style={{ paddingBottom: '1rem' }}>
        {achievement.hero_image_url && (
          <img src={achievement.hero_image_url} alt={achievement.title} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 4, marginBottom: '1rem' }} />
        )}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <Tag type="blue">{getPartnerLabel(achievement.partner_slug)}</Tag>
          {achievement.achievement_date && <span style={{ fontSize: '0.8rem', color: '#525252' }}>{new Date(achievement.achievement_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
          {achievement.is_featured && <Tag type="gold"><StarFilled size={12} style={{ marginRight: 4 }} />Featured</Tag>}
        </div>
        {achievement.full_summary && (
          <div dangerouslySetInnerHTML={{ __html: achievement.full_summary }} style={{ fontSize: '0.9rem', lineHeight: 1.6 }} />
        )}
        {Array.isArray(achievement.links) && achievement.links.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Links</p>
            {achievement.links.map((lnk, i) => (
              <a key={i} href={lnk.url} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '0.875rem', color: '#0f62fe', marginBottom: '0.25rem' }}>{lnk.label || lnk.url}</a>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Main Carousel ─────────────────────────────────────────────
export default function SpAchievementsCarousel({ isAdmin, currentUser, partners = [] }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedItem, setExpandedItem] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await listSpAchievements();
      setAchievements(data);
    } catch (err) {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-rotate
  useEffect(() => {
    if (achievements.length < 2) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % achievements.length);
    }, 20000);
    return () => clearInterval(intervalRef.current);
  }, [achievements.length]);

  const resetInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    if (achievements.length >= 2) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((i) => (i + 1) % achievements.length);
      }, 20000);
    }
  }, [achievements.length]);

  const goTo = (idx) => {
    setActiveIndex(idx);
    resetInterval();
  };
  const prev = () => goTo((activeIndex - 1 + achievements.length) % achievements.length);
  const next = () => goTo((activeIndex + 1) % achievements.length);

  const handleDelete = async () => {
    try {
      await deleteSpAchievement(deleteConfirm.id);
      toast.success('Achievement deleted');
      setDeleteConfirm(null);
      setActiveIndex(0);
      load();
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><InlineLoading description="Loading achievements…" /></div>;

  const current = achievements[activeIndex];

  return (
    <div style={{ background: '#f4f4f4', borderRadius: 8, overflow: 'hidden', marginBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#13161f', borderBottom: '3px solid #0f62fe' }}>
        <h2 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Partnership Achievements</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button kind="ghost" size="sm" style={{ color: '#fff' }} onClick={() => setShowSubmitModal(true)}>Submit Achievement</Button>
          {isAdmin && (
            <>
              <Button kind="primary" size="sm" renderIcon={Add} onClick={() => { setEditingItem(null); setShowAdminModal(true); }}>Add</Button>
            </>
          )}
        </div>
      </div>

      {achievements.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#525252' }}>No achievements yet.</div>
      ) : (
        <>
          {/* Card */}
          <div style={{ display: 'flex', minHeight: 320 }}>
            {/* Hero */}
            <div style={{ flex: '0 0 45%', background: '#262626', position: 'relative', overflow: 'hidden' }}>
              {current?.hero_image_url ? (
                <img src={current.hero_image_url} alt={current.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={64} style={{ color: '#525252' }} />
                </div>
              )}
              {current?.is_featured && (
                <div style={{ position: 'absolute', top: 12, left: 12, background: '#f1c21b', color: '#000', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <StarFilled size={12} /> Featured
                </div>
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <Tag type="blue">{getPartnerLabel(current?.partner_slug)}</Tag>
                  {current?.achievement_date && (
                    <span style={{ fontSize: '0.8rem', color: '#525252', alignSelf: 'center' }}>
                      {new Date(current.achievement_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.75rem' }}>{current?.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#393939', lineHeight: 1.6, margin: 0 }}>{current?.short_overview}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <Button kind="primary" size="sm" onClick={() => setExpandedItem(current)}>View More</Button>
                {isAdmin && (
                  <>
                    <Button kind="ghost" size="sm" renderIcon={Edit} onClick={() => { setEditingItem(current); setShowAdminModal(true); }}>Edit</Button>
                    <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} onClick={() => setDeleteConfirm(current)}>Delete</Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem', background: '#e8e8e8' }}>
            <Button kind="ghost" size="sm" renderIcon={ChevronLeft} iconDescription="Previous" hasIconOnly onClick={prev} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {achievements.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: i === activeIndex ? '#0f62fe' : '#8d8d8d',
                    padding: 0,
                  }}
                />
              ))}
            </div>
            <Button kind="ghost" size="sm" renderIcon={ChevronRight} iconDescription="Next" hasIconOnly onClick={next} />
            <span style={{ fontSize: '0.75rem', color: '#525252' }}>{activeIndex + 1} / {achievements.length}</span>
          </div>
        </>
      )}

      {/* Modals */}
      <AchievementModal
        open={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSaved={load}
        editingItem={editingItem}
        partners={partners}
      />
      <SubmitAchievementModal
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmitted={() => {}}
        currentUser={currentUser}
      />
      <AchievementExpandedModal
        open={!!expandedItem}
        onClose={() => setExpandedItem(null)}
        achievement={expandedItem}
      />
      <Modal
        open={!!deleteConfirm}
        danger
        modalHeading="Delete Achievement"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleDelete}
        onRequestClose={() => setDeleteConfirm(null)}
        onSecondarySubmit={() => setDeleteConfirm(null)}
        size="sm"
      >
        <p>Are you sure you want to delete <strong>{deleteConfirm?.title}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
}
