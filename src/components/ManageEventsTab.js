import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonSet,
  Checkbox,
  Modal,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Stack,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
  TextInput,
  Tile,
  Tag,
} from '@carbon/react';
import { Add, Edit, TrashCan, View, Checkmark, UserFollow, Copy } from '@carbon/icons-react';
import { toast } from 'react-toastify';
import { createEvent, deleteEvent, listEvents, updateEvent, uploadEventDocument } from '../lib/supabaseData';
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

const EMPTY_FORM = {
  title: '',
  startDate: '',
  endDate: '',
  eventTime: '',
  locationType: 'Virtual',
  locationDetails: '',
  regions: [],
  inviteOnly: false,
  contacts: [],
  speakers: [],
  briefSummary: '',
  detailedDescription: '',
  eventAgenda: '',
  registrationLink: '',
  seismicLink: '',
  sellerInviteUrl: '',
  partnerInviteUrl: '',
  seismicPageRequired: null,
  eventStream: '',
  inviteProcess: '',
  productAreas: [],
  eventType: 'Webinar',
  targetAudience: 'All',
  industry: 'Cross-Industry',
  targetRoles: [],
  otherRole: '',
  status: 'Active',
  postEventFollowUp: '',
  category: 'ibm',
  promoteOurPresence: '',
  promoteDocuments: [],
};

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

const ManageEventsTab = () => {
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [briefSummaryCount, setBriefSummaryCount] = useState(0);

  useEffect(() => {
    loadEvents();
    const handleEventsUpdate = () => loadEvents();
    window.addEventListener('eventsUpdated', handleEventsUpdate);
    return () => window.removeEventListener('eventsUpdated', handleEventsUpdate);
  }, []);

  const loadEvents = async () => {
    try {
      const data = await listEvents();
      setEvents(data);
    } catch {
      toast.error('Failed to load events');
    }
  };

  const notifyEventUpdate = () => window.dispatchEvent(new Event('eventsUpdated'));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'briefSummary') setBriefSummaryCount(value.length);
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

  const handleAddContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', email: '', imageUrl: '' }],
    }));
  };

  const handleContactChange = (index, field, value) => {
    setFormData((prev) => {
      const contacts = [...prev.contacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, contacts };
    });
  };

  const handleContactImageUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => handleContactChange(index, 'imageUrl', e.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveContact = (index) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpeaker = () => {
    setFormData((prev) => ({
      ...prev,
      speakers: [...prev.speakers, { name: '', role: '', imageUrl: '' }],
    }));
  };

  const handleSpeakerChange = (index, field, value) => {
    setFormData((prev) => {
      const speakers = [...prev.speakers];
      speakers[index] = { ...speakers[index], [field]: value };
      return { ...prev, speakers };
    });
  };

  const handleSpeakerImageUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => handleSpeakerChange(index, 'imageUrl', e.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveSpeaker = (index) => {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.title || !formData.startDate) {
      toast.warning('Please fill in Event Title and Start Date');
      return;
    }

    try {
      if (isEditing && currentEvent) {
        await updateEvent({ ...currentEvent, ...formData });
        toast.success('Event updated successfully', { icon: <Checkmark size={24} />, autoClose: 3000 });
      } else {
        await createEvent(formData);
        toast.success('Event added successfully', { icon: <Checkmark size={24} />, autoClose: 3000 });
      }
      await loadEvents();
      notifyEventUpdate();
      handleCloseForm();
    } catch (error) {
      toast.error(error.message || 'Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title || '',
      startDate: event.startDate || event.date || '',
      endDate: event.endDate || '',
      eventTime: event.eventTime || '',
      locationType: event.locationType || 'Virtual',
      locationDetails: event.locationDetails || event.location || '',
      regions: event.regions || [],
      inviteOnly: event.inviteOnly || false,
      contacts: event.contacts || [],
      speakers: event.speakers || [],
      briefSummary: event.briefSummary || event.description || '',
      detailedDescription: event.detailedDescription || '',
      eventAgenda: event.eventAgenda || '',
      registrationLink: event.registrationLink || '',
      seismicLink: event.seismicLink || '',
      sellerInviteUrl: event.sellerInviteUrl || '',
      partnerInviteUrl: event.partnerInviteUrl || '',
      seismicPageRequired: event.seismicPageRequired ?? null,
      eventStream: event.eventStream || '',
      productAreas: event.productAreas || [],
      eventType: event.eventType || 'Webinar',
      targetAudience: event.targetAudience || 'All',
      industry: event.industry || 'Cross-Industry',
      targetRoles: event.targetRoles || [],
      otherRole: event.otherRole || '',
      status: event.status || 'Active',
      postEventFollowUp: event.postEventFollowUp || '',
      category: event.category || 'ibm',
      promoteOurPresence: event.promoteOurPresence || '',
      promoteDocuments: event.promoteDocuments || [],
    });
    setBriefSummaryCount((event.briefSummary || event.description || '').length);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDuplicate = async (event) => {
    try {
      const duplicate = {
        ...event,
        title: `${event.title} (Copy)`,
        status: 'Draft',
      };
      // Remove id so createEvent generates a new one
      delete duplicate.id;
      await createEvent(duplicate);
      await loadEvents();
      notifyEventUpdate();
      toast.success('Event duplicated as Draft');
    } catch (error) {
      toast.error(error.message || 'Failed to duplicate event');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(eventId);
      await loadEvents();
      notifyEventUpdate();
      toast.success('Event deleted successfully', { icon: <TrashCan size={24} />, autoClose: 3000 });
    } catch (error) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const handlePreview = (event) => {
    setPreviewEvent(event);
    setPreviewOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setCurrentEvent(null);
    setFormData(EMPTY_FORM);
    setBriefSummaryCount(0);
  };

  // Group events by month
  const groupedEvents = events.reduce((groups, event) => {
    const date = event.startDate || event.date;
    const month = date
      ? new Date(date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      : 'Date TBD';
    if (!groups[month]) groups[month] = [];
    groups[month].push(event);
    return groups;
  }, {});

  return (
    <div className="manage-events-tab">
      <div style={{ marginBottom: '24px' }}>
        <h2>📅 Manage Events</h2>
        <p style={{ color: '#525252', marginTop: '8px' }}>Create and manage events for the UKI Marketing team.</p>
      </div>

      <ButtonSet style={{ marginBottom: '24px' }}>
        <Button kind="primary" renderIcon={Add} onClick={() => setIsFormOpen(true)}>
          Create New Event
        </Button>
      </ButtonSet>

      {/* ── Create / Edit Form Panel ── */}
      {isFormOpen && (
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          marginBottom: '32px',
          background: '#fff',
          width: '100%',
          maxWidth: '1200px',
        }}>
          {/* Header */}
          <div style={{ background: '#161616', color: '#fff', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '18px', fontWeight: '400' }}>{isEditing ? 'Edit Event' : 'Create New Event'}</span>
            <button type="button" onClick={handleCloseForm} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px', padding: '0 4px', lineHeight: 1 }}>✕</button>
          </div>
          {/* Body */}
          <div style={{ padding: '24px' }}>

          {/* ── Basic Information ── */}
          <div style={SECTION_STYLE}>🗓 Basic Information</div>

          <Stack gap={5}>
            <TextInput
              id="title"
              name="title"
              labelText="Event Title *"
              placeholder="e.g., IBM Think 2026"
              value={formData.title}
              onChange={handleInputChange}
            />

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
                <p style={{ fontSize: '12px', color: '#6f6f6f', marginTop: '4px' }}>Leave empty for single-day events</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#525252', display: 'block', marginBottom: '8px' }}>Event Time</label>
                <input type="time" name="eventTime" value={formData.eventTime} onChange={handleInputChange}
                  style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #8d8d8d', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }} />
              </div>
            </div>

            <TextInput
              id="locationDetails"
              name="locationDetails"
              labelText="Location Details"
              placeholder="e.g., London, UK or Zoom"
              value={formData.locationDetails}
              onChange={handleInputChange}
            />
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Region <span style={{ fontSize: '13px', fontWeight: '400', color: '#525252' }}>(Select all that apply)</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
                {['North', 'South', 'Midlands (Birmingham)', 'Ireland', 'Scotland', 'Wales', 'Europe', 'London', 'Virtual', 'America', 'EMEA'].map((region) => (
                  <Checkbox
                    key={region}
                    id={`region-manage-${region}`}
                    labelText={region}
                    checked={formData.regions.includes(region)}
                    onChange={() => handleCheckboxToggle('regions', region)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '8px' }}>Is this an invite only event?</p>
              <Checkbox
                id="inviteOnly-manage"
                labelText="Yes, this is an invite only event"
                checked={!!formData.inviteOnly}
                onChange={(_, { checked }) => setFormData((prev) => ({ ...prev, inviteOnly: checked }))}
              />
            </div>
          </Stack>

          {/* ── Event Contacts ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '28px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserFollow size={18} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#161616' }}>Event Contacts (Optional - Seller Reference Only)</span>
            </div>
            <Button kind="tertiary" size="sm" renderIcon={Add} onClick={handleAddContact}>
              Add Contact
            </Button>
          </div>

          <div style={INFO_BOX_STYLE}>
            ℹ️ Add key contacts for this event with their name, email, and profile image. This information is for <strong>seller reference only</strong> and will NOT appear in client communications.
          </div>

          {formData.contacts.map((contact, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'flex-end' }}>
              <TextInput
                id={`contact-name-${i}`}
                labelText="Name"
                value={contact.name}
                onChange={(e) => handleContactChange(i, 'name', e.target.value)}
              />
              <TextInput
                id={`contact-email-${i}`}
                labelText="Email"
                value={contact.email}
                onChange={(e) => handleContactChange(i, 'email', e.target.value)}
              />
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#525252', display: 'block', marginBottom: '8px' }}>Profile Image</label>
                {contact.imageUrl && (
                  <img src={contact.imageUrl} alt="Preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', marginBottom: '6px', display: 'block', border: '1px solid #e0e0e0' }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleContactImageUpload(i, e.target.files[0])}
                  style={{ width: '100%', fontSize: '13px', padding: '6px', border: '1px solid #8d8d8d', background: '#fff', boxSizing: 'border-box' }}
                />
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
            <Button kind="tertiary" size="sm" renderIcon={Add} onClick={handleAddSpeaker}>
              Add Speaker
            </Button>
          </div>

          {formData.speakers.map((speaker, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'flex-end' }}>
              <TextInput
                id={`speaker-name-${i}`}
                labelText="Name"
                value={speaker.name}
                onChange={(e) => handleSpeakerChange(i, 'name', e.target.value)}
              />
              <TextInput
                id={`speaker-role-${i}`}
                labelText="Role"
                value={speaker.role}
                onChange={(e) => handleSpeakerChange(i, 'role', e.target.value)}
              />
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#525252', display: 'block', marginBottom: '8px' }}>Photo</label>
                {speaker.imageUrl && (
                  <img src={speaker.imageUrl} alt="Preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', marginBottom: '6px', display: 'block', border: '1px solid #e0e0e0' }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSpeakerImageUpload(i, e.target.files[0])}
                  style={{ width: '100%', fontSize: '13px', padding: '6px', border: '1px solid #8d8d8d', background: '#fff', boxSizing: 'border-box' }}
                />
              </div>
              <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Remove" hasIconOnly onClick={() => handleRemoveSpeaker(i)} />
            </div>
          ))}

          {/* ── Content & Description ── */}
          <div style={{ ...SECTION_STYLE, marginTop: '28px' }}>📝 Content & Description</div>

          <Stack gap={5}>
            <div>
              <RichTextEditor
                label="Brief Summary * (500 characters)"
                value={formData.briefSummary}
                onChange={(val) => {
                  setBriefSummaryCount(val.replace(/<[^>]*>/g, '').length);
                  setFormData((prev) => ({ ...prev, briefSummary: val }));
                }}
                placeholder="Write a concise summary of this event..."
                minHeight="160px"
              />
              <p style={{ fontSize: '12px', color: '#6f6f6f', marginTop: '4px' }}>{briefSummaryCount} / 500 characters</p>
            </div>

            <RichTextEditor
              label="Detailed Description (Optional)"
              value={formData.detailedDescription}
              onChange={(val) => setFormData((prev) => ({ ...prev, detailedDescription: val }))}
              placeholder="Add more detail about the event..."
              minHeight="160px"
            />

            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Event Agenda (Optional - Seller Reference Only)</p>
              <p style={{ fontSize: '13px', color: '#525252', marginBottom: '8px' }}>Provide agenda details for sellers. This will NOT appear in client communications.</p>
              <RichTextEditor
                value={formData.eventAgenda}
                onChange={(val) => setFormData((prev) => ({ ...prev, eventAgenda: val }))}
                placeholder="Outline the event agenda..."
                minHeight="160px"
              />
            </div>
          </Stack>

          {/* ── Seller Resources ── */}
          <div style={{ ...SECTION_STYLE, marginTop: '28px' }}>🔗 Seller Resources</div>

          <Stack gap={5}>
            <TextInput
              id="registrationLink"
              name="registrationLink"
              labelText="Registration Link (Optional)"
              placeholder="https://..."
              value={formData.registrationLink}
              onChange={handleInputChange}
            />
            <div>
              <TextInput
                id="seismicLink"
                name="seismicLink"
                labelText="Seismic Page Link (Optional)"
                placeholder="https://seismic.com/..."
                value={formData.seismicLink}
                onChange={handleInputChange}
              />
              <p style={{ fontSize: '12px', color: '#6f6f6f', marginTop: '4px' }}>Link to Seismic page with more event details for sellers</p>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '8px' }}>Do you want a Seismic page created?</p>
              <RadioButtonGroup
                name="seismicPageRequired"
                valueSelected={formData.seismicPageRequired}
                onChange={(val) => setFormData((prev) => ({ ...prev, seismicPageRequired: val }))}
                orientation="horizontal"
              >
                <RadioButton labelText="Yes" value="yes" id="seismic-yes" />
                <RadioButton labelText="No" value="no" id="seismic-no" />
              </RadioButtonGroup>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Seller Invite Document (Optional)</p>
              <p style={{ fontSize: '13px', color: '#525252', marginBottom: '8px' }}>Upload a Word document that sellers can download to invite clients to this event</p>
              {formData.sellerInviteUrl && <p style={{ fontSize: '12px', color: '#198038', marginBottom: '6px' }}>✓ Uploaded: <a href={formData.sellerInviteUrl} target="_blank" rel="noopener noreferrer">View document</a></p>}
              <input type="file" accept=".doc,.docx" style={{ width: '100%', padding: '8px', border: '1px solid #8d8d8d', background: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const url = await uploadEventDocument(file, 'seller-invites');
                    setFormData((prev) => ({ ...prev, sellerInviteUrl: url }));
                    toast.success('Seller invite uploaded');
                  } catch (err) { toast.error('Upload failed: ' + err.message); }
                }}
              />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Business Partner Invite Document (Optional)</p>
              <p style={{ fontSize: '13px', color: '#525252', marginBottom: '8px' }}>Upload a Word document that business partners can download to invite clients to this event</p>
              {formData.partnerInviteUrl && <p style={{ fontSize: '12px', color: '#198038', marginBottom: '6px' }}>✓ Uploaded: <a href={formData.partnerInviteUrl} target="_blank" rel="noopener noreferrer">View document</a></p>}
              <input type="file" accept=".doc,.docx" style={{ width: '100%', padding: '8px', border: '1px solid #8d8d8d', background: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const url = await uploadEventDocument(file, 'partner-invites');
                    setFormData((prev) => ({ ...prev, partnerInviteUrl: url }));
                    toast.success('Partner invite uploaded');
                  } catch (err) { toast.error('Upload failed: ' + err.message); }
                }}
              />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Invite Process (Optional)</p>
              <p style={{ fontSize: '13px', color: '#525252', marginBottom: '8px' }}>Describe the process sellers should follow to invite clients to this event</p>
              <RichTextEditor
                value={formData.inviteProcess}
                onChange={(val) => setFormData((prev) => ({ ...prev, inviteProcess: val }))}
                placeholder="Outline the invite process..."
                minHeight="140px"
              />
            </div>
          </Stack>

          {/* ── Targeting & Audience ── */}
          <div style={{ ...SECTION_STYLE, marginTop: '28px' }}>🎯 Target Audience & Products</div>

          <Stack gap={5}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '8px' }}>Area of Business</p>
              <RadioButtonGroup
                name="eventStream"
                valueSelected={formData.eventStream}
                onChange={(val) => setFormData((prev) => ({ ...prev, eventStream: val }))}
                orientation="horizontal"
              >
                <RadioButton labelText="Consulting" value="Consulting" id="stream-consulting-manage" />
                <RadioButton labelText="Technology" value="Technology" id="stream-technology-manage" />
                <RadioButton labelText="Technology & Consulting" value="Technology & Consulting" id="stream-both-manage" />
              </RadioButtonGroup>
            </div>

            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Product Areas <span style={{ fontSize: '13px', fontWeight: '400', color: '#525252' }}>(Select all that apply)</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                {PRODUCT_AREAS.map((area) => (
                  <Checkbox
                    key={area.id}
                    id={`product-${area.id}`}
                    labelText={area.label}
                    checked={formData.productAreas.includes(area.id)}
                    onChange={() => {
                      if (area.id === 'all-products') {
                        setFormData((prev) => ({ ...prev, productAreas: prev.productAreas.includes('all-products') ? [] : ['all-products'] }));
                      } else {
                        setFormData((prev) => {
                          const without = prev.productAreas.filter((x) => x !== 'all-products');
                          return { ...prev, productAreas: without.includes(area.id) ? without.filter((x) => x !== area.id) : [...without, area.id] };
                        });
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <Select id="category" name="category" labelText="Category" value={formData.category} onChange={handleInputChange}>
              <SelectItem value="ibm" text="IBM Event" />
              <SelectItem value="thirdParty" text="3rd Party Event" />
              <SelectItem value="onDemand" text="On-Demand/Webinar" />
            </Select>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
              <Select id="eventType" name="eventType" labelText="Event Type" value={formData.eventType} onChange={handleInputChange}>
                <SelectItem value="Webinar" text="Webinar" />
                <SelectItem value="In-Person" text="Event" />
                <SelectItem value="Workshop" text="Workshop" />
                <SelectItem value="Conference" text="Conference" />
                <SelectItem value="Roundtable" text="Roundtable" />
                <SelectItem value="Other" text="Other" />
              </Select>
              <Select id="targetAudience" name="targetAudience" labelText="Target Audience" value={formData.targetAudience} onChange={handleInputChange}>
                <SelectItem value="All" text="All" />
                <SelectItem value="Sellers" text="Sellers" />
                <SelectItem value="Clients" text="Clients" />
                <SelectItem value="Clients & Partners" text="Clients & Partners" />
                <SelectItem value="Partners" text="Partners" />
              </Select>
              <Select id="industry" name="industry" labelText="Industry *" value={formData.industry} onChange={handleInputChange}>
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
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Target Roles (Select all that apply)</p>
              <p style={{ fontSize: '13px', color: '#525252', marginBottom: '12px' }}>Select which roles this event is targeting for invitations</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
                {TARGET_ROLES.map((role) => (
                  <Checkbox
                    key={role.id}
                    id={`role-${role.id}`}
                    labelText={role.label}
                    checked={formData.targetRoles.includes(role.id)}
                    onChange={() => handleCheckboxToggle('targetRoles', role.id)}
                  />
                ))}
              </div>
              {formData.targetRoles.includes('other') && (
                <TextInput
                  id="otherRole"
                  name="otherRole"
                  labelText="Please specify role"
                  placeholder="Enter role..."
                  value={formData.otherRole}
                  onChange={handleInputChange}
                  style={{ marginTop: '12px' }}
                />
              )}
            </div>
          </Stack>

          {/* ── Marketing & Status ── */}
          <div style={{ ...SECTION_STYLE, marginTop: '28px' }}>📊 Marketing & Status</div>

          <Stack gap={5}>
            <Select id="status" name="status" labelText="Status" value={formData.status} onChange={handleInputChange}>
              <SelectItem value="Active" text="Active (Visible to sellers)" />
              <SelectItem value="Draft" text="Draft (Hidden from sellers)" />
              <SelectItem value="Archived" text="Archived" />
            </Select>

            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Post Event Follow-up (Optional)</p>
              <p style={{ fontSize: '13px', color: '#525252', marginBottom: '8px' }}>Add follow-up notes, resources, or action items after the event has concluded.</p>
              <RichTextEditor
                value={formData.postEventFollowUp}
                onChange={(val) => setFormData((prev) => ({ ...prev, postEventFollowUp: val }))}
                placeholder="Post-event notes, recordings, resources..."
                minHeight="160px"
              />
            </div>

            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Post Event Documents (Optional)</p>
              <p style={{ fontSize: '13px', color: '#525252', marginBottom: '8px' }}>Upload documents related to the event follow-up (presentations, recordings, resources, etc.)</p>
              <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" style={{ width: '100%', padding: '8px', border: '1px solid #8d8d8d', background: '#fff', fontSize: '14px', boxSizing: 'border-box' }} />
              <p style={{ fontSize: '12px', color: '#6f6f6f', marginTop: '4px' }}>Accepted formats: PDF, Word, Excel, PowerPoint, Text. Max 5MB per file.</p>
            </div>

            {/* ── Promote Our Presence ── */}
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Promote Our Presence (Optional)</p>
              <p style={{ fontSize: '13px', color: '#525252', marginBottom: '8px' }}>Describe how IBM's presence at this event should be promoted. This text will be available for sellers to share.</p>
              <RichTextEditor
                value={formData.promoteOurPresence}
                onChange={(val) => setFormData((prev) => ({ ...prev, promoteOurPresence: val }))}
                placeholder="e.g., Join us at stand 42 where we'll be showcasing our latest AI solutions..."
                minHeight="160px"
              />
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#525252', marginBottom: '6px' }}>Attach Promotional Documents (Optional)</p>
                <p style={{ fontSize: '13px', color: '#525252', marginBottom: '8px' }}>Upload supporting materials such as brochures, presentations, or slide decks.</p>
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
                <input
                  type="file"
                  multiple
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                  style={{ width: '100%', padding: '8px', border: '1px solid #8d8d8d', background: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    if (!files.length) return;
                    const uploaded = [];
                    for (const file of files) {
                      try {
                        const url = await uploadEventDocument(file, 'promote-presence');
                        uploaded.push({ name: file.name, url });
                        toast.success(`Uploaded: ${file.name}`);
                      } catch (err) {
                        toast.error(`Failed to upload ${file.name}: ${err.message}`);
                      }
                    }
                    if (uploaded.length) {
                      setFormData((prev) => ({ ...prev, promoteDocuments: [...(prev.promoteDocuments || []), ...uploaded] }));
                    }
                    e.target.value = '';
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6f6f6f', marginTop: '4px' }}>Accepted formats: PDF, PowerPoint, Word, Excel. Max 5MB per file.</p>
              </div>
            </div>
          </Stack>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid #e0e0e0', marginTop: '32px' }}>
            <Button kind="secondary" onClick={handleCloseForm} style={{ flex: 1 }}>Cancel</Button>
            <Button kind="primary" onClick={handleSubmit} style={{ flex: 1 }}>{isEditing ? 'Update Event' : 'Create Event'}</Button>
          </div>

          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      <Modal open={previewOpen} onRequestClose={() => setPreviewOpen(false)} modalHeading="Event Preview" passiveModal preventCloseOnClickOutside={false} size="sm">
        {previewEvent && (
          <div style={{ padding: '16px 0' }}>
            <p><strong>Title:</strong> {previewEvent.title}</p>
            <p><strong>Date:</strong> {previewEvent.startDate || previewEvent.date ? new Date(previewEvent.startDate || previewEvent.date).toLocaleDateString('en-GB') : 'TBD'}</p>
            <p><strong>Location:</strong> {(previewEvent.locationDetails || '').replace(/\s*\(Virtual\)\s*/gi, '')}</p>
            <p><strong>Status:</strong> {previewEvent.status || 'Active'}</p>
            <p style={{ marginTop: '12px' }}><strong>Summary:</strong></p>
            <div className="event-summary-preview" style={{ color: '#525252' }} dangerouslySetInnerHTML={{ __html: previewEvent.briefSummary || previewEvent.description || 'No summary provided' }} />
            {previewEvent.registrationLink && (
              <p style={{ marginTop: '12px' }}><strong>Registration:</strong> <a href={previewEvent.registrationLink} target="_blank" rel="noreferrer">{previewEvent.registrationLink}</a></p>
            )}
          </div>
        )}
      </Modal>

      {/* ── Events List ── */}
      {events.length === 0 ? (
        <Tile style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3 style={{ marginBottom: '16px' }}>No Events Yet</h3>
          <p style={{ color: '#525252', marginBottom: '24px' }}>Create your first event to get started.</p>
          <Button kind="primary" renderIcon={Add} onClick={() => setIsFormOpen(true)}>Create New Event</Button>
        </Tile>
      ) : (
        Object.entries(groupedEvents).map(([month, monthEvents]) => (
          <div key={month} style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#525252' }}>📅 {month} ({monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''})</span>
            </div>
            <StructuredListWrapper>
              <StructuredListHead>
                <StructuredListRow head>
                  <StructuredListCell head>Event Title</StructuredListCell>
                  <StructuredListCell head>Date</StructuredListCell>
                  <StructuredListCell head>Event Type</StructuredListCell>
                  <StructuredListCell head>Status</StructuredListCell>
                  <StructuredListCell head>Actions</StructuredListCell>
                </StructuredListRow>
              </StructuredListHead>
              <StructuredListBody>
                {monthEvents.map((event) => (
                  <StructuredListRow key={event.id}>
                    <StructuredListCell>{event.title}</StructuredListCell>
                    <StructuredListCell>
                      {event.startDate || event.date ? new Date(event.startDate || event.date).toLocaleDateString('en-GB') : 'TBD'}
                    </StructuredListCell>
                    <StructuredListCell>{event.eventType || '—'}</StructuredListCell>
                    <StructuredListCell>
                      <Tag type={event.status === 'Active' ? 'green' : event.status === 'Draft' ? 'gray' : 'cool-gray'} size="sm">
                        {event.status || 'Active'}
                      </Tag>
                    </StructuredListCell>
                    <StructuredListCell>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button kind="ghost" size="sm" renderIcon={View} iconDescription="Preview" hasIconOnly onClick={() => handlePreview(event)} />
                        <Button kind="ghost" size="sm" renderIcon={Edit} iconDescription="Edit" hasIconOnly onClick={() => handleEdit(event)} />
                        <Button kind="ghost" size="sm" renderIcon={Copy} iconDescription="Duplicate" hasIconOnly onClick={() => handleDuplicate(event)} />
                        <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} iconDescription="Delete" hasIconOnly onClick={() => handleDelete(event.id)} />
                      </div>
                    </StructuredListCell>
                  </StructuredListRow>
                ))}
              </StructuredListBody>
            </StructuredListWrapper>
          </div>
        ))
      )}
    </div>
  );
};

export default ManageEventsTab;

// Made with Bob
