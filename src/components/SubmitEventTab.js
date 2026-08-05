import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  Button,
  ButtonSet,
  Checkbox,
  Select,
  SelectItem,
  Stack,
  Tag,
  TextInput,
  Tile,
} from '@carbon/react';
import { Add, TrashCan, Checkmark, UserFollow, SendAlt, Save } from '@carbon/icons-react';
import { toast } from 'react-toastify';
import { createEvent, saveDraft, updateDraft } from '../lib/supabaseData';
import RichTextEditor from './RichTextEditor';
import { useUser } from '../contexts/UserContext';

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

const DEFAULT_POST_EVENT_FOLLOW_UP = `<p><strong>For Select:</strong></p><p>For Select T clients, the BAU follow up process in ISC will apply.</p><p><strong>For Named:</strong></p><ol><li><p><strong>Locate the attendee in ISC:</strong> Access the relevant dashboard for your client segment and account (linked in the enablement deck) to identify event attendees.</p></li><li><p><strong>View the individual's interactions:</strong> Open the individual record and go to the Marketo Sales Insights tab to explore the individual's timeline, historical insights, and their latest score.</p></li><li><p><strong>Agree on follow‑up:</strong> Agree who from the account team is most appropriate to follow up with the individual, checking their email and phone permissions before.</p></li><li><p><strong>Update status:</strong> When Sales is actively engaging, update the Contact Status to 'Prospecting'. This step is crucial for tracking progression and ROI from events.</p></li></ol><p>For more detailed guidance, links to the ISC dashboards, and FAQ's, please refer to the UKI RevTech Enablement for Named Accounts deck.</p><p>If you have any questions, please contact the Marketing Lead that is aligned to your client segment or platform.</p>`;

const EMPTY_FORM = {
  title: '',
  startDate: '',
  endDate: '',
  eventTime: '',
  locationType: 'Virtual',
  locationDetails: '',
  regions: [],
  contacts: [],
  briefSummary: '',
  detailedDescription: '',
  eventAgenda: '',
  registrationLink: '',
  seismicLink: '',
  inviteProcess: '',
  productAreas: [],
  eventType: 'Webinar',
  targetAudience: 'All',
  industry: 'Cross-Industry',
  targetRoles: [],
  otherRole: '',
  status: 'Draft',
  postEventFollowUp: DEFAULT_POST_EVENT_FOLLOW_UP,
  category: 'ibm',
};

const SECTION_STYLE = {
  background: '#6929c4',
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

const SubmitEventTab = forwardRef((props, ref) => {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [briefSummaryCount, setBriefSummaryCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentDraftId, setCurrentDraftId] = useState(null);

  useImperativeHandle(ref, () => ({
    loadDraft: (draftData, draftId) => {
      setFormData({ ...EMPTY_FORM, ...draftData });
      setBriefSummaryCount((draftData.briefSummary || '').replace(/<[^>]*>/g, '').length);
      setCurrentDraftId(draftId);
      setSubmitted(false);
      setErrors({});
    },
  }));

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

  const validate = () => {
    const e = {};
    if (!formData.title.trim())                                          e.title = 'Event title is required';
    if (!formData.startDate)                                             e.startDate = 'Start date is required';
    if (!formData.eventTime)                                             e.eventTime = 'Event time is required';
    if (!formData.locationDetails.trim())                                e.locationDetails = 'Location details are required';
    if (!formData.briefSummary || formData.briefSummary.replace(/<[^>]*>/g, '').trim() === '')
                                                                         e.briefSummary = 'Brief summary is required';
    if (!formData.detailedDescription || formData.detailedDescription.replace(/<[^>]*>/g, '').trim() === '')
                                                                         e.detailedDescription = 'Detailed description is required';
    if (!formData.eventAgenda || formData.eventAgenda.replace(/<[^>]*>/g, '').trim() === '')
                                                                         e.eventAgenda = 'Event agenda is required';
    if (!formData.registrationLink.trim())                               e.registrationLink = 'Registration link is required';
    if (!formData.productAreas[0])                                       e.productAreas = 'Please select a product area';
    if (formData.targetRoles.length === 0)                               e.targetRoles = 'Please select at least one target role';
    return e;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warning('Please fill in all required fields');
      return;
    }

    try {
      await createEvent({
        ...formData,
        status: 'Draft',
        ownerEmail: currentUser?.email || '',
      });
      toast.success('Event submitted for review!', { icon: <Checkmark size={24} />, autoClose: 3000 });
      setFormData(EMPTY_FORM);
      setBriefSummaryCount(0);
      setErrors({});
      setSubmitted(true);
    } catch (error) {
      toast.error(error.message || 'Failed to submit event');
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      toast.warning('Please enter an event title before saving a draft');
      return;
    }
    try {
      const draftData = { ...formData, type: 'Event Submission' };
      if (currentDraftId) {
        await updateDraft(currentDraftId, currentUser.email, draftData);
        toast.success('Draft updated!', { icon: <Save size={20} />, autoClose: 2000 });
      } else {
        const saved = await saveDraft(currentUser.email, formData.title, draftData);
        setCurrentDraftId(saved.id);
        toast.success('Draft saved!', { icon: <Save size={20} />, autoClose: 2000 });
      }
      window.dispatchEvent(new Event('draftsUpdated'));
    } catch (err) {
      toast.error(err.message || 'Failed to save draft');
    }
  };

  const handleSubmitAnother = () => {
    setSubmitted(false);
    setCurrentDraftId(null);
  };

  if (submitted) {
    return (
      <div className="submit-event-tab">
        <Tile style={{ textAlign: 'center', padding: '64px 24px', maxWidth: '600px', margin: '48px auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ marginBottom: '12px' }}>Event Submitted for Review</h2>
          <p style={{ color: '#525252', marginBottom: '8px' }}>
            Your event has been saved as a <strong>Draft</strong> and is now awaiting review by an admin or manager.
          </p>
          <p style={{ color: '#525252', marginBottom: '32px' }}>
            Once approved it will be published to the Event Library.
          </p>
          <ButtonSet>
            <Button kind="primary" renderIcon={Add} onClick={handleSubmitAnother}>
              Submit Another Event
            </Button>
          </ButtonSet>
        </Tile>
      </div>
    );
  }

  return (
    <div className="submit-event-tab">
      <div style={{ marginBottom: '24px' }}>
        <h2>📝 Submit an Event</h2>
        <p style={{ color: '#525252', marginTop: '8px' }}>
          Fill in the details below to submit an event for admin review. It will be saved as a Draft until approved.
        </p>
      </div>

      <div style={{ background: '#f6f2ff', border: '1px solid #d4bbff', borderRadius: '4px', padding: '12px 16px', fontSize: '13px', color: '#6929c4', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        ℹ️ Your submission will be reviewed by an admin or manager before it appears in the Event Library. Fields marked <strong>*</strong> are required.
      </div>

      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        background: '#fff',
        width: '100%',
        maxWidth: '1200px',
      }}>
        {/* Header */}
        <div style={{ background: '#161616', color: '#fff', padding: '16px 24px' }}>
          <span style={{ fontSize: '18px', fontWeight: '400' }}>New Event Submission</span>
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
              invalid={!!errors.title}
              invalidText={errors.title}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#525252', display: 'block', marginBottom: '8px' }}>Start Date *</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                  style={{ width: '100%', height: '40px', padding: '0 12px', border: `1px solid ${errors.startDate ? '#da1e28' : '#8d8d8d'}`, fontSize: '14px', background: '#fff', boxSizing: 'border-box' }} />
                {errors.startDate && <p style={{ fontSize: '12px', color: '#da1e28', marginTop: '4px' }}>{errors.startDate}</p>}
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#525252', display: 'block', marginBottom: '8px' }}>End Date <span style={{ fontWeight: '400' }}>(Optional)</span></label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                  style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #8d8d8d', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }} />
                <p style={{ fontSize: '12px', color: '#6f6f6f', marginTop: '4px' }}>Leave empty for single-day events</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#525252', display: 'block', marginBottom: '8px' }}>Event Time *</label>
                <input type="time" name="eventTime" value={formData.eventTime} onChange={handleInputChange}
                  style={{ width: '100%', height: '40px', padding: '0 12px', border: `1px solid ${errors.eventTime ? '#da1e28' : '#8d8d8d'}`, fontSize: '14px', background: '#fff', boxSizing: 'border-box' }} />
                {errors.eventTime && <p style={{ fontSize: '12px', color: '#da1e28', marginTop: '4px' }}>{errors.eventTime}</p>}
              </div>
            </div>

            <TextInput
              id="locationDetails"
              name="locationDetails"
              labelText="Location Details *"
              placeholder="e.g., London, UK or Zoom"
              value={formData.locationDetails}
              onChange={handleInputChange}
              invalid={!!errors.locationDetails}
              invalidText={errors.locationDetails}
            />
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Region <span style={{ fontSize: '13px', fontWeight: '400', color: '#525252' }}>(Select all that apply)</span></p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' }}>
                {['North', 'South', 'Midlands (Birmingham)', 'Ireland', 'Scotland', 'Wales', 'Europe', 'London', 'Virtual'].map((region) => (
                  <Checkbox
                    key={region}
                    id={`region-submit-${region}`}
                    labelText={region}
                    checked={formData.regions.includes(region)}
                    onChange={() => handleCheckboxToggle('regions', region)}
                  />
                ))}
              </div>
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
              {errors.briefSummary && <p style={{ fontSize: '12px', color: '#da1e28', marginTop: '4px' }}>{errors.briefSummary}</p>}
            </div>

            <div>
              <RichTextEditor
                label="Detailed Description *"
                value={formData.detailedDescription}
                onChange={(val) => setFormData((prev) => ({ ...prev, detailedDescription: val }))}
                placeholder="Add more detail about the event..."
                minHeight="160px"
              />
              {errors.detailedDescription && <p style={{ fontSize: '12px', color: '#da1e28', marginTop: '4px' }}>{errors.detailedDescription}</p>}
            </div>

            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Event Agenda * <span style={{ fontSize: '13px', fontWeight: '400', color: '#525252' }}>(Seller Reference Only — will NOT appear in client communications)</span></p>
              <RichTextEditor
                value={formData.eventAgenda}
                onChange={(val) => setFormData((prev) => ({ ...prev, eventAgenda: val }))}
                placeholder="Outline the event agenda..."
                minHeight="160px"
              />
              {errors.eventAgenda && <p style={{ fontSize: '12px', color: '#da1e28', marginTop: '4px' }}>{errors.eventAgenda}</p>}
            </div>
          </Stack>

          {/* ── Seller Resources ── */}
          <div style={{ ...SECTION_STYLE, marginTop: '28px' }}>🔗 Seller Resources</div>

          <Stack gap={5}>
            <TextInput
              id="registrationLink"
              name="registrationLink"
              labelText="Registration Link *"
              placeholder="https://..."
              value={formData.registrationLink}
              onChange={handleInputChange}
              invalid={!!errors.registrationLink}
              invalidText={errors.registrationLink}
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
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Seller Invite Document (Optional)</p>
              <p style={{ fontSize: '13px', color: '#525252', marginBottom: '8px' }}>Upload a Word document that sellers can download to invite clients to this event</p>
              <input type="file" accept=".doc,.docx" style={{ width: '100%', padding: '8px', border: '1px solid #8d8d8d', background: '#fff', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Business Partner Invite Document (Optional)</p>
              <p style={{ fontSize: '13px', color: '#525252', marginBottom: '8px' }}>Upload a Word document that business partners can download to invite clients to this event</p>
              <input type="file" accept=".doc,.docx" style={{ width: '100%', padding: '8px', border: '1px solid #8d8d8d', background: '#fff', fontSize: '14px', boxSizing: 'border-box' }} />
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
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Product Areas * <span style={{ fontSize: '13px', fontWeight: '400', color: '#525252' }}>(Select all that apply)</span></p>
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
              {errors.productAreas && <p style={{ fontSize: '12px', color: '#da1e28', marginTop: '8px' }}>{errors.productAreas}</p>}
            </div>

            <Select id="category" name="category" labelText="Category *" value={formData.category} onChange={handleInputChange}>
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
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#161616', marginBottom: '4px' }}>Target Roles * <span style={{ fontSize: '13px', fontWeight: '400', color: '#525252' }}>(Select all that apply)</span></p>
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
              {errors.targetRoles && <p style={{ fontSize: '12px', color: '#da1e28', marginTop: '8px' }}>{errors.targetRoles}</p>}
            </div>
          </Stack>

          {/* ── Additional Notes ── */}
          <div style={{ ...SECTION_STYLE, marginTop: '28px' }}>📊 Additional Notes</div>

          <Stack gap={5}>
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
          </Stack>

          {/* Submitted by notice */}
          <div style={{ marginTop: '28px', padding: '12px 16px', background: '#f4f4f4', borderRadius: '4px', fontSize: '13px', color: '#525252' }}>
            Submitting as: <strong>{currentUser?.name}</strong> ({currentUser?.email})
            <Tag type="gray" size="sm" style={{ marginLeft: '8px' }}>Draft — Pending Review</Tag>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid #e0e0e0', marginTop: '32px' }}>
            <Button
              kind="secondary"
              style={{ flex: 1 }}
              onClick={() => { setFormData(EMPTY_FORM); setBriefSummaryCount(0); setErrors({}); setCurrentDraftId(null); }}
            >
              Clear Form
            </Button>
            <Button kind="tertiary" renderIcon={Save} style={{ flex: 1 }} onClick={handleSaveDraft}>
              {currentDraftId ? 'Update Draft' : 'Save Draft'}
            </Button>
            <Button kind="primary" renderIcon={SendAlt} style={{ flex: 1 }} onClick={handleSubmit}>
              Submit for Review
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
});

export default SubmitEventTab;
