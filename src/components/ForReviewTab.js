import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Modal,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Stack,
  Tag,
  TextInput,
  Tile,
} from '@carbon/react';
import { Add, Checkmark, Edit, TrashCan, UserFollow, View } from '@carbon/icons-react';
import { toast } from 'react-toastify';
import { deleteEvent, listEvents, updateEvent, uploadEventDocument } from '../lib/supabaseData';
import RichTextEditor from './RichTextEditor';

const PRODUCT_AREAS = [
  { id: 'all-products', label: '🌐 All Products' },
  { id: 'hybrid-cloud', label: '☁️ Hybrid Cloud & Infrastructure Management' },
  { id: 'data-ai', label: '🤖 Data & AI' },
  { id: 'automation', label: '⚙️ Business Automation' },
  { id: 'security', label: '🔒 Security' },
  { id: 'transaction', label: '💳 Transaction Processing' },
  { id: 'quantum', label: '🔬 Quantum' },
];

const TARGET_ROLES = [
  { id: 'ceo', label: 'CEO' }, { id: 'cfo', label: 'CFO' },
  { id: 'coo', label: 'COO' }, { id: 'chro', label: 'CHRO' },
  { id: 'cmo', label: 'CMO' }, { id: 'cio', label: 'CIO' },
  { id: 'cto', label: 'CTO' }, { id: 'cdo', label: 'CDO' },
  { id: 'senior-it', label: 'Senior IT' }, { id: 'senior-lob', label: 'Senior LOB' },
  { id: 'it-practitioners', label: 'IT Practitioners' }, { id: 'other', label: 'Other' },
];

const SECTION_STYLE = {
  background: '#0f62fe',
  color: '#fff',
  padding: '10px 16px',
  borderRadius: '4px',
  fontWeight: '600',
  fontSize: '14px',
  marginTop: '24px',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxSizing: 'border-box',
};

const INFO_BOX_STYLE = {
  background: '#edf5ff',
  border: '1px solid #d0e2ff',
  borderRadius: '4px',
  padding: '12px 16px',
  fontSize: '13px',
  color: '#0043ce',
  marginBottom: '16px',
  display: 'flex',
  gap: '8px',
  alignItems: 'flex-start',
};

const ForReviewTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState(null);
  const [rejectConfirmId, setRejectConfirmId] = useState(null);

  // Edit state
  const [editingEvent, setEditingEvent] = useState(null); // the original event being edited
  const [formData, setFormData] = useState(null);
  const [briefSummaryCount, setBriefSummaryCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDrafts();
    const handleUpdate = () => loadDrafts();
    window.addEventListener('eventsUpdated', handleUpdate);
    return () => window.removeEventListener('eventsUpdated', handleUpdate);
  }, []);

  const loadDrafts = async () => {
    try {
      const data = await listEvents();
      setEvents(data.filter((e) => e.status === 'Draft'));
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const notifyUpdate = () => window.dispatchEvent(new Event('eventsUpdated'));

  const handleApprove = async (event) => {
    try {
      await updateEvent({ ...event, status: 'Active' });
      toast.success(`"${event.title}" approved and published to the Event Library`, {
        icon: <Checkmark size={24} />,
        autoClose: 3000,
      });
      await loadDrafts();
      notifyUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to approve event');
    }
  };

  const handleReject = async (eventId) => {
    try {
      await deleteEvent(eventId);
      toast.success('Submission rejected and removed', { autoClose: 3000 });
      setRejectConfirmId(null);
      await loadDrafts();
      notifyUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to reject event');
    }
  };

  // ── Edit handlers ──────────────────────────────────────────────────────────

  const handleOpenEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      startDate: event.startDate || '',
      endDate: event.endDate || '',
      eventTime: event.eventTime || '',
      locationType: event.locationType || 'Virtual',
      locationDetails: event.locationDetails || '',
      regions: event.regions || [],
      inviteOnly: event.inviteOnly || false,
      contacts: event.contacts || [],
      speakers: event.speakers || [],
      briefSummary: event.briefSummary || '',
      detailedDescription: event.detailedDescription || '',
      eventAgenda: event.eventAgenda || '',
      registrationLink: event.registrationLink || '',
      seismicLink: event.seismicLink || '',
      sellerInviteUrl: event.sellerInviteUrl || '',
      partnerInviteUrl: event.partnerInviteUrl || '',
      seismicPageRequired: event.seismicPageRequired ?? null,
      eventStream: event.eventStream || '',
      inviteProcess: event.inviteProcess || '',
      productAreas: event.productAreas || [],
      eventType: event.eventType || 'Webinar',
      targetAudience: event.targetAudience || 'All',
      industry: event.industry || 'Cross-Industry',
      targetRoles: event.targetRoles || [],
      otherRole: event.otherRole || '',
      status: 'Draft',
      postEventFollowUp: event.postEventFollowUp || '',
      category: event.category || 'ibm',
      promoteOurPresence: event.promoteOurPresence || '',
      promoteDocuments: event.promoteDocuments || [],
    });
    setBriefSummaryCount((event.briefSummary || '').replace(/<[^>]*>/g, '').length);
  };

  const handleCloseEdit = () => {
    setEditingEvent(null);
    setFormData(null);
    setBriefSummaryCount(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxToggle = (field, id) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      };
    });
  };

  const handleAddContact = () => setFormData((prev) => ({ ...prev, contacts: [...prev.contacts, { name: '', email: '', imageUrl: '' }] }));
  const handleContactChange = (i, field, value) => setFormData((prev) => { const c = [...prev.contacts]; c[i] = { ...c[i], [field]: value }; return { ...prev, contacts: c }; });
  const handleContactImageUpload = (i, file) => { if (!file) return; const r = new FileReader(); r.onload = (e) => handleContactChange(i, 'imageUrl', e.target.result); r.readAsDataURL(file); };
  const handleRemoveContact = (i) => setFormData((prev) => ({ ...prev, contacts: prev.contacts.filter((_, idx) => idx !== i) }));

  const handleAddSpeaker = () => setFormData((prev) => ({ ...prev, speakers: [...prev.speakers, { name: '', role: '', imageUrl: '' }] }));
  const handleSpeakerChange = (i, field, value) => setFormData((prev) => { const s = [...prev.speakers]; s[i] = { ...s[i], [field]: value }; return { ...prev, speakers: s }; });
  const handleSpeakerImageUpload = (i, file) => { if (!file) return; const r = new FileReader(); r.onload = (e) => handleSpeakerChange(i, 'imageUrl', e.target.result); r.readAsDataURL(file); };
  const handleRemoveSpeaker = (i) => setFormData((prev) => ({ ...prev, speakers: prev.speakers.filter((_, idx) => idx !== i) }));

  const handleSaveEdit = async () => {
    if (!formData.title.trim()) {
      toast.warning('Event title is required');
      return;
    }
    setSaving(true);
    try {
      await updateEvent({ ...editingEvent, ...formData });
      toast.success('Changes saved — event still pending review', { icon: <Checkmark size={24} />, autoClose: 3000 });
      await loadDrafts();
      notifyUpdate();
      handleCloseEdit();
    } catch (err) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndApprove = async () => {
    if (!formData.title.trim()) {
      toast.warning('Event title is required');
      return;
    }
    setSaving(true);
    try {
      await updateEvent({ ...editingEvent, ...formData, status: 'Active' });
      toast.success(`"${formData.title}" saved and published to the Event Library`, { icon: <Checkmark size={24} />, autoClose: 3000 });
      await loadDrafts();
      notifyUpdate();
      handleCloseEdit();
    } catch (err) {
      toast.error(err.message || 'Failed to save and approve');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#525252' }}>Loading submissions…</div>;
  }

  // If we're in edit mode, render the edit form full-width
  if (editingEvent && formData) {
    return (
      <div className="for-review-tab">
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button kind="ghost" size="sm" onClick={handleCloseEdit}>← Back to submissions</Button>
          <span style={{ color: '#525252', fontSize: '13px' }}>Editing: <strong>{editingEvent.title}</strong></span>
        </div>

        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', padding: '12px 16px', fontSize: '13px', color: '#856404', marginBottom: '24px', display: 'flex', gap: '8px' }}>
          ✏️ You are editing a <strong>pending submission</strong>. Saving will keep it as Draft. Use "Save &amp; Approve" to publish immediately.
        </div>

        <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', background: '#fff', width: '100%', maxWidth: '1200px' }}>
          <div style={{ background: '#161616', color: '#fff', padding: '16px 24px' }}>
            <span style={{ fontSize: '18px', fontWeight: '400' }}>Edit Submission</span>
          </div>

          <div style={{ padding: '24px' }}>

            {/* ── Basic Information ── */}
            <div style={SECTION_STYLE}>🗓 Basic Information</div>
            <Stack gap={5}>
              <TextInput id="rv-title" name="title" labelText="Event Title *" value={formData.title} onChange={handleInputChange} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#525252', display: 'block', marginBottom: '8px' }}>Start Date *</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                    style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #8d8d8d', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#525252', display: 'block', marginBottom: '8px' }}>End Date (Optional)</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                    style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #8d8d8d', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#525252', display: 'block', marginBottom: '8px' }}>Event Time</label>
                  <input type="time" name="eventTime" value={formData.eventTime} onChange={handleInputChange}
                    style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #8d8d8d', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }} />
                </div>
              </div>

              <TextInput id="rv-location" name="locationDetails" labelText="Location Details" value={formData.locationDetails} onChange={handleInputChange} />

              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Region <span style={{ fontSize: '13px', fontWeight: '400', color: '#525252' }}>(Select all that apply)</span></p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
                  {['North', 'South', 'Midlands (Birmingham)', 'Ireland', 'Scotland', 'Wales', 'Europe', 'London', 'Virtual'].map((region) => (
                    <Checkbox key={region} id={`rv-region-${region}`} labelText={region} checked={formData.regions.includes(region)} onChange={() => handleCheckboxToggle('regions', region)} />
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '8px' }}>Is this an invite only event?</p>
                <Checkbox id="rv-inviteOnly" labelText="Yes, this is an invite only event" checked={!!formData.inviteOnly}
                  onChange={(_, { checked }) => setFormData((prev) => ({ ...prev, inviteOnly: checked }))} />
              </div>
            </Stack>

            {/* ── Event Contacts ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '28px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserFollow size={18} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#161616' }}>Event Contacts (Optional)</span>
              </div>
              <Button kind="tertiary" size="sm" renderIcon={Add} onClick={handleAddContact}>Add Contact</Button>
            </div>
            <div style={INFO_BOX_STYLE}>ℹ️ Seller reference only — will NOT appear in client communications.</div>
            {formData.contacts.map((contact, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'flex-end' }}>
                <TextInput id={`rv-contact-name-${i}`} labelText="Name" value={contact.name} onChange={(e) => handleContactChange(i, 'name', e.target.value)} />
                <TextInput id={`rv-contact-email-${i}`} labelText="Email" value={contact.email} onChange={(e) => handleContactChange(i, 'email', e.target.value)} />
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#525252', display: 'block', marginBottom: '8px' }}>Profile Image</label>
                  {contact.imageUrl && <img src={contact.imageUrl} alt="Preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', marginBottom: '6px', display: 'block' }} />}
                  <input type="file" accept="image/*" onChange={(e) => handleContactImageUpload(i, e.target.files[0])}
                    style={{ width: '100%', fontSize: '13px', padding: '6px', border: '1px solid #8d8d8d', background: '#fff', boxSizing: 'border-box' }} />
                </div>
                <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Remove" hasIconOnly onClick={() => handleRemoveContact(i)} />
              </div>
            ))}

            {/* ── Speakers ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '28px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserFollow size={18} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#161616' }}>Speakers (Optional)</span>
              </div>
              <Button kind="tertiary" size="sm" renderIcon={Add} onClick={handleAddSpeaker}>Add Speaker</Button>
            </div>
            {formData.speakers.map((speaker, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'flex-end' }}>
                <TextInput id={`rv-speaker-name-${i}`} labelText="Name" value={speaker.name} onChange={(e) => handleSpeakerChange(i, 'name', e.target.value)} />
                <TextInput id={`rv-speaker-role-${i}`} labelText="Role" value={speaker.role} onChange={(e) => handleSpeakerChange(i, 'role', e.target.value)} />
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#525252', display: 'block', marginBottom: '8px' }}>Photo</label>
                  {speaker.imageUrl && <img src={speaker.imageUrl} alt="Preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', marginBottom: '6px', display: 'block' }} />}
                  <input type="file" accept="image/*" onChange={(e) => handleSpeakerImageUpload(i, e.target.files[0])}
                    style={{ width: '100%', fontSize: '13px', padding: '6px', border: '1px solid #8d8d8d', background: '#fff', boxSizing: 'border-box' }} />
                </div>
                <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Remove" hasIconOnly onClick={() => handleRemoveSpeaker(i)} />
              </div>
            ))}

            {/* ── Content & Description ── */}
            <div style={{ ...SECTION_STYLE, marginTop: '28px' }}>📝 Content & Description</div>
            <Stack gap={5}>
              <div>
                <RichTextEditor label="Brief Summary * (500 characters)" value={formData.briefSummary}
                  onChange={(val) => { setBriefSummaryCount(val.replace(/<[^>]*>/g, '').length); setFormData((prev) => ({ ...prev, briefSummary: val })); }}
                  placeholder="Write a concise summary of this event..." minHeight="160px" />
                <p style={{ fontSize: '12px', color: '#6f6f6f', marginTop: '4px' }}>{briefSummaryCount} / 500 characters</p>
              </div>
              <RichTextEditor label="Detailed Description (Optional)" value={formData.detailedDescription}
                onChange={(val) => setFormData((prev) => ({ ...prev, detailedDescription: val }))} placeholder="Add more detail about the event..." minHeight="160px" />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Event Agenda (Optional — Seller Reference Only)</p>
                <RichTextEditor value={formData.eventAgenda} onChange={(val) => setFormData((prev) => ({ ...prev, eventAgenda: val }))}
                  placeholder="Outline the event agenda..." minHeight="160px" />
              </div>
            </Stack>

            {/* ── Seller Resources ── */}
            <div style={{ ...SECTION_STYLE, marginTop: '28px' }}>🔗 Seller Resources</div>
            <Stack gap={5}>
              <TextInput id="rv-regLink" name="registrationLink" labelText="Registration Link (Optional)" placeholder="https://..." value={formData.registrationLink} onChange={handleInputChange} />
              <TextInput id="rv-seismicLink" name="seismicLink" labelText="Seismic Page Link (Optional)" placeholder="https://seismic.com/..." value={formData.seismicLink} onChange={handleInputChange} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '8px' }}>Do you want a Seismic page created?</p>
                <RadioButtonGroup name="rv-seismicPageRequired" valueSelected={formData.seismicPageRequired}
                  onChange={(val) => setFormData((prev) => ({ ...prev, seismicPageRequired: val }))} orientation="horizontal">
                  <RadioButton labelText="Yes" value="yes" id="rv-seismic-yes" />
                  <RadioButton labelText="No" value="no" id="rv-seismic-no" />
                </RadioButtonGroup>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Seller Invite Document (Optional)</p>
                {formData.sellerInviteUrl && <p style={{ fontSize: '12px', color: '#198038', marginBottom: '6px' }}>✓ Uploaded: <a href={formData.sellerInviteUrl} target="_blank" rel="noopener noreferrer">View document</a></p>}
                <input type="file" accept=".doc,.docx" style={{ width: '100%', padding: '8px', border: '1px solid #8d8d8d', background: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                  onChange={async (e) => { const file = e.target.files[0]; if (!file) return; try { const url = await uploadEventDocument(file, 'seller-invites'); setFormData((prev) => ({ ...prev, sellerInviteUrl: url })); toast.success('Seller invite uploaded'); } catch (err) { toast.error('Upload failed: ' + err.message); } }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Business Partner Invite Document (Optional)</p>
                {formData.partnerInviteUrl && <p style={{ fontSize: '12px', color: '#198038', marginBottom: '6px' }}>✓ Uploaded: <a href={formData.partnerInviteUrl} target="_blank" rel="noopener noreferrer">View document</a></p>}
                <input type="file" accept=".doc,.docx" style={{ width: '100%', padding: '8px', border: '1px solid #8d8d8d', background: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                  onChange={async (e) => { const file = e.target.files[0]; if (!file) return; try { const url = await uploadEventDocument(file, 'partner-invites'); setFormData((prev) => ({ ...prev, partnerInviteUrl: url })); toast.success('Partner invite uploaded'); } catch (err) { toast.error('Upload failed: ' + err.message); } }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Invite Process (Optional)</p>
                <RichTextEditor value={formData.inviteProcess} onChange={(val) => setFormData((prev) => ({ ...prev, inviteProcess: val }))}
                  placeholder="Outline the invite process..." minHeight="140px" />
              </div>
            </Stack>

            {/* ── Target Audience & Products ── */}
            <div style={{ ...SECTION_STYLE, marginTop: '28px' }}>🎯 Target Audience & Products</div>
            <Stack gap={5}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '8px' }}>Area of Business</p>
                <RadioButtonGroup name="rv-eventStream" valueSelected={formData.eventStream}
                  onChange={(val) => setFormData((prev) => ({ ...prev, eventStream: val }))} orientation="horizontal">
                  <RadioButton labelText="Consulting" value="Consulting" id="rv-stream-consulting" />
                  <RadioButton labelText="Technology" value="Technology" id="rv-stream-technology" />
                  <RadioButton labelText="Technology & Consulting" value="Technology & Consulting" id="rv-stream-both" />
                </RadioButtonGroup>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Product Areas <span style={{ fontSize: '13px', fontWeight: '400', color: '#525252' }}>(Select all that apply)</span></p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                  {PRODUCT_AREAS.map((area) => (
                    <Checkbox key={area.id} id={`rv-product-${area.id}`} labelText={area.label} checked={formData.productAreas.includes(area.id)}
                      onChange={() => {
                        if (area.id === 'all-products') {
                          setFormData((prev) => ({ ...prev, productAreas: prev.productAreas.includes('all-products') ? [] : ['all-products'] }));
                        } else {
                          setFormData((prev) => {
                            const without = prev.productAreas.filter((x) => x !== 'all-products');
                            return { ...prev, productAreas: without.includes(area.id) ? without.filter((x) => x !== area.id) : [...without, area.id] };
                          });
                        }
                      }} />
                  ))}
                </div>
              </div>
              <Select id="rv-category" name="category" labelText="Category" value={formData.category} onChange={handleInputChange}>
                <SelectItem value="ibm" text="IBM Event" />
                <SelectItem value="thirdParty" text="3rd Party Event" />
                <SelectItem value="onDemand" text="On-Demand/Webinar" />
              </Select>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
                <Select id="rv-eventType" name="eventType" labelText="Event Type" value={formData.eventType} onChange={handleInputChange}>
                  <SelectItem value="Webinar" text="Webinar" />
                  <SelectItem value="In-Person" text="Event" />
                  <SelectItem value="Workshop" text="Workshop" />
                  <SelectItem value="Conference" text="Conference" />
                  <SelectItem value="Roundtable" text="Roundtable" />
                  <SelectItem value="Other" text="Other" />
                </Select>
                <Select id="rv-targetAudience" name="targetAudience" labelText="Target Audience" value={formData.targetAudience} onChange={handleInputChange}>
                  <SelectItem value="All" text="All" />
                  <SelectItem value="Sellers" text="Sellers" />
                  <SelectItem value="Clients" text="Clients" />
                  <SelectItem value="Clients & Partners" text="Clients & Partners" />
                  <SelectItem value="Partners" text="Partners" />
                </Select>
                <Select id="rv-industry" name="industry" labelText="Industry" value={formData.industry} onChange={handleInputChange}>
                  <SelectItem value="Cross-Industry" text="Cross-Industry" />
                  <SelectItem value="Automotive" text="Automotive" />
                  <SelectItem value="Banking & Financial Markets" text="Banking & Financial Markets" />
                  <SelectItem value="Chemical & Petroleum" text="Chemical & Petroleum" />
                  <SelectItem value="Consumer Goods" text="Consumer Goods" />
                  <SelectItem value="Defence" text="Defence" />
                  <SelectItem value="Education" text="Education" />
                  <SelectItem value="Electronics" text="Electronics" />
                  <SelectItem value="Energy & Utilities" text="Energy & Utilities" />
                  <SelectItem value="Financial Services" text="Financial Services" />
                  <SelectItem value="Government" text="Government" />
                  <SelectItem value="Healthcare" text="Healthcare" />
                  <SelectItem value="Insurance" text="Insurance" />
                  <SelectItem value="Life Sciences" text="Life Sciences" />
                  <SelectItem value="Manufacturing" text="Manufacturing" />
                  <SelectItem value="Media & Entertainment" text="Media & Entertainment" />
                  <SelectItem value="Public Sector" text="Public Sector" />
                  <SelectItem value="Retail" text="Retail" />
                  <SelectItem value="Telecommunications" text="Telecommunications" />
                  <SelectItem value="Travel & Transport" text="Travel & Transport" />
                </Select>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Target Roles <span style={{ fontSize: '13px', fontWeight: '400', color: '#525252' }}>(Select all that apply)</span></p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
                  {TARGET_ROLES.map((role) => (
                    <Checkbox key={role.id} id={`rv-role-${role.id}`} labelText={role.label} checked={formData.targetRoles.includes(role.id)} onChange={() => handleCheckboxToggle('targetRoles', role.id)} />
                  ))}
                </div>
                {formData.targetRoles.includes('other') && (
                  <TextInput id="rv-otherRole" name="otherRole" labelText="Please specify role" placeholder="Enter role..."
                    value={formData.otherRole} onChange={handleInputChange} style={{ marginTop: '12px' }} />
                )}
              </div>
            </Stack>

            {/* ── Additional Notes ── */}
            <div style={{ ...SECTION_STYLE, marginTop: '28px' }}>📊 Additional Notes</div>
            <Stack gap={5}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Post Event Follow-up (Optional)</p>
                <RichTextEditor value={formData.postEventFollowUp} onChange={(val) => setFormData((prev) => ({ ...prev, postEventFollowUp: val }))}
                  placeholder="Post-event notes, recordings, resources..." minHeight="160px" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Promote Our Presence (Optional)</p>
                <p style={{ fontSize: '13px', color: '#525252', marginBottom: '8px' }}>Describe how IBM's presence at this event should be promoted.</p>
                <RichTextEditor value={formData.promoteOurPresence} onChange={(val) => setFormData((prev) => ({ ...prev, promoteOurPresence: val }))}
                  placeholder="e.g., Join us at stand 42 where we'll be showcasing our latest AI solutions..." minHeight="160px" />
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#525252', marginBottom: '6px' }}>Attach Promotional Documents (Optional)</p>
                  {formData.promoteDocuments && formData.promoteDocuments.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '8px' }}>
                      {formData.promoteDocuments.map((doc, idx) => (
                        <li key={idx} style={{ fontSize: '12px', color: '#198038', marginBottom: '4px' }}>
                          ✓ <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name}</a>
                          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, promoteDocuments: prev.promoteDocuments.filter((_, i) => i !== idx) }))}
                            style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#da1e28', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <input type="file" multiple accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                    style={{ width: '100%', padding: '8px', border: '1px solid #8d8d8d', background: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      if (!files.length) return;
                      const uploaded = [];
                      for (const file of files) {
                        try { const url = await uploadEventDocument(file, 'promote-presence'); uploaded.push({ name: file.name, url }); toast.success(`Uploaded: ${file.name}`); }
                        catch (err) { toast.error(`Failed to upload ${file.name}: ${err.message}`); }
                      }
                      if (uploaded.length) setFormData((prev) => ({ ...prev, promoteDocuments: [...(prev.promoteDocuments || []), ...uploaded] }));
                      e.target.value = '';
                    }} />
                  <p style={{ fontSize: '12px', color: '#6f6f6f', marginTop: '4px' }}>Accepted formats: PDF, PowerPoint, Word, Excel. Max 5MB per file.</p>
                </div>
              </div>
            </Stack>

            {/* ── Footer actions ── */}
            <div style={{ display: 'flex', gap: '0', borderTop: '1px solid #e0e0e0', marginTop: '32px' }}>
              <Button kind="secondary" style={{ flex: 1 }} onClick={handleCloseEdit} disabled={saving}>Cancel</Button>
              <Button kind="tertiary" style={{ flex: 1 }} onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes (keep as Draft)'}
              </Button>
              <Button kind="primary" renderIcon={Checkmark} style={{ flex: 1 }} onClick={handleSaveAndApprove} disabled={saving}>
                {saving ? 'Saving…' : 'Save & Approve'}
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── Normal list view ────────────────────────────────────────────────────────
  return (
    <div className="for-review-tab">
      <div style={{ marginBottom: '24px' }}>
        <h2>🔍 For Review</h2>
        <p style={{ color: '#525252', marginTop: '8px' }}>
          Events submitted by the marketing team. Approve to publish to the Event Library, or reject to remove the submission.
        </p>
      </div>

      {events.length === 0 ? (
        <Tile style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ marginBottom: '8px' }}>Nothing to review</h3>
          <p style={{ color: '#525252' }}>All submissions have been processed.</p>
        </Tile>
      ) : (
        <div>
          <p style={{ fontSize: '13px', color: '#525252', marginBottom: '20px' }}>
            {events.length} submission{events.length !== 1 ? 's' : ''} awaiting review
          </p>

          {events.map((event) => (
            <div key={event.id} style={{ border: '1px solid #e0e0e0', borderRadius: '4px', background: '#fff', marginBottom: '16px', overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{ background: '#f4f4f4', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#161616' }}>{event.title}</span>
                  <Tag type="gray" size="sm">Draft</Tag>
                  {event.eventType && <Tag type="blue" size="sm">{event.eventType}</Tag>}
                  {event.industry && <Tag type="green" size="sm">{event.industry}</Tag>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button kind="ghost" size="sm" renderIcon={View} iconDescription="Preview" hasIconOnly
                    onClick={() => { setPreviewEvent(event); setPreviewOpen(true); }} />
                  <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" hasIconOnly
                    onClick={() => handleOpenEdit(event)} />
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#6f6f6f', marginBottom: '2px', textTransform: 'uppercase' }}>Date</p>
                    <p style={{ fontSize: '14px', color: '#161616' }}>
                      {event.startDate ? new Date(event.startDate).toLocaleDateString('en-GB') : 'TBD'}
                      {event.endDate ? ` – ${new Date(event.endDate).toLocaleDateString('en-GB')}` : ''}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#6f6f6f', marginBottom: '2px', textTransform: 'uppercase' }}>Location</p>
                    <p style={{ fontSize: '14px', color: '#161616' }}>{(event.locationDetails || '—').replace(/\s*\(Virtual\)\s*/gi, '')}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#6f6f6f', marginBottom: '2px', textTransform: 'uppercase' }}>Submitted by</p>
                    <p style={{ fontSize: '14px', color: '#161616' }}>{event.ownerEmail || '—'}</p>
                  </div>
                </div>

                {(event.briefSummary || event.description) && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#6f6f6f', marginBottom: '4px', textTransform: 'uppercase' }}>Summary</p>
                    <div style={{ fontSize: '14px', color: '#525252', lineHeight: '1.5' }}
                      dangerouslySetInnerHTML={{ __html: event.briefSummary || event.description }} />
                  </div>
                )}

                {event.registrationLink && (
                  <p style={{ fontSize: '13px', color: '#525252', marginBottom: '16px' }}>
                    <strong>Registration:</strong>{' '}
                    <a href={event.registrationLink} target="_blank" rel="noreferrer" style={{ color: '#0f62fe' }}>{event.registrationLink}</a>
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
                  <Button kind="ghost" size="sm" renderIcon={Edit} onClick={() => handleOpenEdit(event)}>
                    Edit Before Approving
                  </Button>
                  <Button kind="primary" renderIcon={Checkmark} onClick={() => handleApprove(event)}>
                    Approve &amp; Publish
                  </Button>
                  <Button kind="danger--ghost" renderIcon={TrashCan} onClick={() => setRejectConfirmId(event.id)}>
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal open={previewOpen} onRequestClose={() => setPreviewOpen(false)} modalHeading="Event Preview" passiveModal size="sm">
        {previewEvent && (
          <div style={{ padding: '16px 0' }}>
            <p><strong>Title:</strong> {previewEvent.title}</p>
            <p><strong>Date:</strong> {previewEvent.startDate ? new Date(previewEvent.startDate).toLocaleDateString('en-GB') : 'TBD'}</p>
            <p><strong>Location:</strong> {(previewEvent.locationDetails || '').replace(/\s*\(Virtual\)\s*/gi, '')}</p>
            <p><strong>Industry:</strong> {previewEvent.industry || '—'}</p>
            <p><strong>Event Type:</strong> {previewEvent.eventType || '—'}</p>
            <p><strong>Target Audience:</strong> {previewEvent.targetAudience || '—'}</p>
            {previewEvent.registrationLink && (
              <p><strong>Registration:</strong>{' '}
                <a href={previewEvent.registrationLink} target="_blank" rel="noreferrer">{previewEvent.registrationLink}</a>
              </p>
            )}
            <p style={{ marginTop: '12px' }}><strong>Summary:</strong></p>
            <div style={{ color: '#525252' }} dangerouslySetInnerHTML={{ __html: previewEvent.briefSummary || previewEvent.description || 'No summary provided' }} />
            {previewEvent.detailedDescription && (
              <>
                <p style={{ marginTop: '12px' }}><strong>Detailed Description:</strong></p>
                <div style={{ color: '#525252' }} dangerouslySetInnerHTML={{ __html: previewEvent.detailedDescription }} />
              </>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
              <Button kind="ghost" size="sm" renderIcon={Edit} onClick={() => { setPreviewOpen(false); handleOpenEdit(previewEvent); }}>Edit</Button>
              <Button kind="primary" size="sm" renderIcon={Checkmark} onClick={() => { handleApprove(previewEvent); setPreviewOpen(false); }}>Approve &amp; Publish</Button>
              <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} onClick={() => { setPreviewOpen(false); setRejectConfirmId(previewEvent.id); }}>Reject</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal open={!!rejectConfirmId} onRequestClose={() => setRejectConfirmId(null)} modalHeading="Reject Submission"
        primaryButtonText="Yes, Reject" secondaryButtonText="Cancel" danger onRequestSubmit={() => handleReject(rejectConfirmId)}>
        <p>Are you sure you want to reject this submission? It will be permanently deleted.</p>
      </Modal>
    </div>
  );
};

export default ForReviewTab;
