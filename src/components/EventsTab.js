import React, { useState, useEffect } from 'react';
import {
  Search,
  Button,
  Tag,
  Checkbox,
  Modal,
  Tile,
  Grid,
  Column,
  FilterableMultiSelect,
  Loading,
  Select,
  SelectItem,
  TextInput,
  TextArea,
} from '@carbon/react';
import {
  Calendar,
  Location,
  Time,
  ArrowRight,
  Filter,
  Close,
  Document,
  UserFollow,
  Checkmark,
} from '@carbon/icons-react';
import { toast } from 'react-toastify';
import { listEvents, logActivity, archiveExpiredEvents } from '../lib/supabaseData';

const PRODUCT_AREAS = [
  { id: 'hybrid-cloud', label: '☁️ Hybrid Cloud & Infrastructure Management' },
  { id: 'data-ai', label: '🤖 Data & AI' },
  { id: 'automation', label: '⚙️ Business Automation' },
  { id: 'security', label: '🔒 Security' },
  { id: 'transaction', label: '💳 Transaction Processing' },
  { id: 'quantum', label: '🔬 Quantum' },
];

const EVENT_TYPES = [
  { id: 'Webinar',    label: 'Webinar' },
  { id: 'In-Person',  label: 'Event' },
  { id: 'Workshop',   label: 'Workshop' },
  { id: 'Conference', label: 'Conference' },
  { id: 'Roundtable', label: 'Roundtable' },
  { id: 'Other',      label: 'Other' },
];

// #2 — border colour per event type
const EVENT_TYPE_COLOR = {
  'Webinar':    '#0f62fe',
  'In-Person':  '#005d5d',
  'Workshop':   '#005d5d',
  'Conference': '#6929c4',
  'Roundtable': '#b28600',
  'Other':      '#525252',
};

// #3 — "days away" pill
const getDaysAwayPill = (dateStr) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (diff < 0) return null;
  let label, bg, color;
  if (diff === 0)       { label = 'Today';           bg = '#fff1f1'; color = '#da1e28'; }
  else if (diff === 1)  { label = 'Tomorrow';         bg = '#fff1f1'; color = '#da1e28'; }
  else if (diff <= 7)   { label = `In ${diff} days`;  bg = '#fff1f1'; color = '#da1e28'; }
  else if (diff <= 30)  { label = `In ${Math.ceil(diff / 7)} week${Math.ceil(diff / 7) > 1 ? 's' : ''}`; bg = '#ffd6ae'; color = '#8a3800'; }
  else                  { label = `In ${Math.ceil(diff / 30)} month${Math.ceil(diff / 30) > 1 ? 's' : ''}`; bg = '#defbe6'; color = '#044317'; }
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, background: bg, color, whiteSpace: 'nowrap' }}>{label}</span>;
};

const INDUSTRIES = [
  { id: 'Cross-Industry', label: 'Cross-Industry' },
  { id: 'Defence', label: 'Defence' },
  { id: 'Financial Services', label: 'Financial Services' },
  { id: 'Healthcare', label: 'Healthcare' },
  { id: 'Manufacturing', label: 'Manufacturing' },
  { id: 'Public Sector', label: 'Public Sector' },
  { id: 'Retail', label: 'Retail' },
  { id: 'Telecoms', label: 'Telecoms' },
];

const highlight = (text, term) => {
  if (!term || !text) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? <mark key={i} style={{ background: '#f1c21b', color: '#161616', padding: '0 1px', borderRadius: '2px' }}>{part}</mark> : part
  );
};

const highlightHtml = (html, term) => {
  if (!term || !html) return html;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`(${escaped})`, 'gi'), '<mark style="background:#f1c21b;color:#161616;padding:0 1px;border-radius:2px">$1</mark>');
};

const EventsTab = ({ onGenerateComm, currentUser }) => {
  const [events, setEvents] = useState([]);
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductAreas, setSelectedProductAreas] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [dateFilter, setDateFilter] = useState('upcoming');
  const [selectedTypeChip, setSelectedTypeChip] = useState('All'); // #5
  const [previewEvent, setPreviewEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showArchive, setShowArchive] = useState(false);

  // Personalization modal state
  const [personalizationModalOpen, setPersonalizationModalOpen] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [useGenericGreeting, setUseGenericGreeting] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderTitle, setSenderTitle] = useState('');
  const [useGenericSignOff, setUseGenericSignOff] = useState(false);
  const [customBlurb, setCustomBlurb] = useState('');
  const [customBannerColor, setCustomBannerColor] = useState('#0f62fe');
  const [customAccentColor, setCustomAccentColor] = useState('#0f62fe');
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    loadEvents();
    const handleEventsUpdate = () => loadEvents();
    window.addEventListener('eventsUpdated', handleEventsUpdate);
    return () => window.removeEventListener('eventsUpdated', handleEventsUpdate);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, archivedEvents, searchTerm, selectedProductAreas, selectedRegions, selectedIndustries, dateFilter, showArchive, selectedTypeChip]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Auto-archive any events whose date has passed
      await archiveExpiredEvents().catch(() => {});
      const data = await listEvents();
      setEvents(data.filter(e => !e.status || e.status === 'Active'));
      setArchivedEvents(data.filter(e => e.status === 'Archived'));
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreEvent = async (event) => {
    try {
      const { updateEvent } = await import('../lib/supabaseData');
      await updateEvent({ ...event, status: 'Active' });
      toast.success(`"${event.title}" restored to Event Library`);
      window.dispatchEvent(new Event('eventsUpdated'));
    } catch (err) {
      toast.error(err.message || 'Failed to restore event');
    }
  };

  const applyFilters = () => {
    let filtered = showArchive ? [...archivedEvents] : [...events];

    // #5 — type chip filter
    if (selectedTypeChip !== 'All') {
      filtered = filtered.filter(event => event.eventType === selectedTypeChip);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(term) ||
        event.briefSummary?.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.locationDetails?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term)
      );
    }

    if (selectedProductAreas.length > 0) {
      filtered = filtered.filter(event =>
        event.productAreas?.some(area => selectedProductAreas.includes(area))
      );
    }

    if (selectedRegions.length > 0) {
      filtered = filtered.filter(event =>
        event.regions?.some(r => selectedRegions.includes(r))
      );
    }

    if (selectedIndustries.length > 0) {
      filtered = filtered.filter(event => selectedIndustries.includes(event.industry));
    }

    const now = new Date();
    if (dateFilter === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.startDate || event.date) >= now);
    } else if (dateFilter === 'past') {
      filtered = filtered.filter(event => new Date(event.startDate || event.date) < now);
    }

    filtered.sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));
    setFilteredEvents(filtered);
  };

  const groupEventsByMonth = (eventsToGroup) => {
    const grouped = {};
    eventsToGroup.forEach(event => {
      const dateStr = event.startDate || event.date;
      const date = dateStr ? new Date(dateStr) : null;
      const monthYear = date && !isNaN(date)
        ? date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
        : 'Date TBD';
      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(event);
    });
    return grouped;
  };

  const eventsByMonth = groupEventsByMonth(filteredEvents);

  useEffect(() => {
    const allMonths = {};
    Object.keys(eventsByMonth).forEach(month => { allMonths[month] = true; });
    setExpandedMonths(allMonths);
  }, [filteredEvents]);

  const toggleMonth = (month) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const toggleSelectEvent = (eventId) => {
    setSelectedEvents(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(e => e.id));
    }
  };

  const resetPersonalizationModal = () => {
    setPersonalizationModalOpen(false);
    setRecipientName('');
    setUseGenericGreeting(false);
    setSenderName('');
    setSenderTitle('');
    setUseGenericSignOff(false);
    setCustomBlurb('');
    setCustomBannerColor('#0f62fe');
    setCustomAccentColor('#0f62fe');
    setProfilePicture('');
  };

  const handleGenerateCommunication = () => {
    if (selectedEvents.length === 0) {
      toast.warning('Please select at least one event', { autoClose: 3000 });
      return;
    }
    setPersonalizationModalOpen(true);
  };

  const handleConfirmGeneration = () => {
    const selectedEventData = events
      .filter(e => selectedEvents.includes(e.id))
      .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));

    // Log the comm generation activity
    logActivity('comm_generated', {
      userEmail: currentUser?.email,
      userName: currentUser?.name,
      userRole: currentUser?.role,
      metadata: {
        eventCount: selectedEventData.length,
        eventTitles: selectedEventData.map(e => e.title),
      },
    });

    const greeting = useGenericGreeting
      ? 'Hi'
      : recipientName.trim() ? `Dear ${recipientName.trim()}` : 'Hi';

    const signOff = useGenericSignOff
      ? { name: 'IBM UKI Marketing Team', title: '', picture: '' }
      : { name: senderName.trim() || 'IBM UKI Marketing Team', title: senderTitle.trim(), picture: profilePicture };

    const customColors = { banner: customBannerColor, accent: customAccentColor };
    const htmlContent = generateHTMLCommunication(selectedEventData, greeting, signOff, customColors);

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IBM_Events_Communication_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`✅ Communication generated! Check your Downloads folder.`, { autoClose: 5000, icon: <Checkmark size={24} /> });
    resetPersonalizationModal();
    setSelectedEvents([]);
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, or GIF)', { autoClose: 3000 });
      return;
    }
    if (file.size > 500000) {
      toast.error('Image size must be less than 500KB', { autoClose: 3000 });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => { setProfilePicture(reader.result); toast.success('Profile picture uploaded!', { autoClose: 2000 }); };
    reader.onerror = () => toast.error('Failed to upload image.', { autoClose: 3000 });
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture('');
    const el = document.getElementById('profile-picture-upload');
    if (el) el.value = '';
  };

  const generateHTMLCommunication = (selectedEventData, greeting, signOff, customColors) => {
    const accentColor = customColors.accent;
    const eventsHTML = selectedEventData.map(event => `
      <tr>
        <td style="padding: 24px 20px 0 20px; border-top: 1px solid #e0e0e0;">
          <table width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;">
            <tr><td style="color:#161616;font-size:15px;font-weight:bold;padding-bottom:12px;">${event.title}</td></tr>
            <tr><td style="color:#525252;line-height:1.5;padding-bottom:12px;font-size:13px;">${event.briefSummary || event.description || ''}</td></tr>
            <tr>
              <td style="padding-bottom:16px;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="color:#525252;font-size:13px;padding-right:20px;">📅 <strong>${formatDate(event.startDate || event.date)}${event.endDate ? ` - ${formatDate(event.endDate)}` : ''}</strong></td>
                    ${event.eventTime ? `<td style="color:#525252;font-size:13px;padding-right:20px;">🕐 <strong>${event.eventTime}</strong></td>` : ''}
                  </tr>
                  ${(event.locationDetails || event.location) ? `<tr><td colspan="2" style="color:#525252;font-size:13px;padding-top:8px;">📍 <strong>${event.locationDetails || event.location}</strong></td></tr>` : ''}
                </table>
              </td>
            </tr>
            ${event.registrationLink ? `<tr><td style="padding-bottom:12px;"><a href="${event.registrationLink}" style="display:inline-block;background-color:${accentColor};color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;font-weight:500;font-size:13px;">Register Now →</a></td></tr>` : ''}
          </table>
        </td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IBM Events - ${new Date().toLocaleDateString()}</title>
  <style>
    body { margin:0; padding:0; font-family:'IBM Plex Sans',Arial,Helvetica,sans-serif; background-color:#f5f5f5; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    a { text-decoration:none; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;">
    <tr><td align="center" style="padding:20px 0;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;background-color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <tr><td style="background-color:${customColors.banner};padding:32px 20px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:32px;font-weight:600;">IBM Events</h1>
          <p style="margin:8px 0 0 0;color:#fff;font-size:16px;">Upcoming Events & Opportunities</p>
        </td></tr>
        <tr><td style="background:${customColors.banner};height:8px;"></td></tr>
        <tr><td style="padding:32px 20px 16px 20px;">
          <table width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;">
            <tr><td style="color:#161616;line-height:1.5;padding-bottom:16px;font-size:13px;">${greeting},</td></tr>
            <tr><td style="color:#161616;line-height:1.5;padding-bottom:24px;font-size:13px;">${customBlurb.trim() || "We're excited to share these upcoming IBM events with you."}</td></tr>
          </table>
        </td></tr>
        ${eventsHTML}
        <tr><td style="padding:16px 20px 32px 20px;">
          <table width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;">
            <tr><td style="color:#161616;line-height:1.5;padding-bottom:12px;font-size:13px;">We look forward to seeing you at these events!</td></tr>
            <tr><td style="padding-top:16px;">
              <table cellpadding="0" cellspacing="0" border="0"><tr>
                ${signOff.picture ? `<td style="padding-right:16px;vertical-align:top;"><img src="${signOff.picture}" alt="${signOff.name}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;" /></td>` : ''}
                <td style="vertical-align:top;"><div style="color:#161616;line-height:1.5;font-size:13px;">Best regards,<br><strong>${signOff.name}</strong>${signOff.title ? `<br>${signOff.title}` : ''}</div></td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background-color:#f4f4f4;padding:24px 20px;text-align:center;border-top:1px solid #e0e0e0;">
          <p style="margin:0;font-size:12px;color:#525252;">© ${new Date().getFullYear()} IBM Corporation. All rights reserved.</p>
          <p style="margin:8px 0 0 0;font-size:12px;color:#525252;">Generated on ${new Date().toLocaleDateString()}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedProductAreas([]);
    setSelectedRegions([]);
    setSelectedIndustries([]);
    setDateFilter('all');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return isNaN(date) ? dateString : date.toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className="events-tab" style={{ padding: '0' }}>

      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '2px solid rgba(69,137,255,0.3)', background: 'linear-gradient(135deg, #060c2a 0%, #0f1f60 55%, #162880 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ marginBottom: '8px', color: '#ffffff', fontWeight: 700, letterSpacing: '0.04em' }}>{showArchive ? '🗄️ EVENT ARCHIVE' : '🎯 EVENT LIBRARY'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              {showArchive
                ? 'Past events are automatically archived here once their date has passed.'
                : 'Browse and select events to include in your communications'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {!showArchive && selectedEvents.length > 0 && (
              <Tag type="blue" size="md">{selectedEvents.length} selected</Tag>
            )}
            <Button
              kind={showArchive ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => { setShowArchive(false); setSearchTerm(''); }}
              style={{ borderBottom: !showArchive ? '2px solid #4589ff' : 'none', color: !showArchive ? '#fff' : 'rgba(255,255,255,0.6)' }}
            >
              🎯 Live Events ({events.length})
            </Button>
            <Button
              kind={showArchive ? 'ghost' : 'ghost'}
              size="sm"
              onClick={() => { setShowArchive(true); setSearchTerm(''); setSelectedEvents([]); }}
              style={{ borderBottom: showArchive ? '2px solid #4589ff' : 'none', color: showArchive ? '#fff' : 'rgba(255,255,255,0.6)' }}
            >
              🗄️ Archive ({archivedEvents.length})
            </Button>
            <Button kind="ghost" size="sm" renderIcon={Filter} onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div style={{ padding: '16px', backgroundColor: '#f4f4f4', borderRadius: '4px', marginTop: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '2', minWidth: '250px' }}>
                <Search
                  labelText="Search events"
                  placeholder="Search by title, description, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm('')}
                  size="lg"
                />
              </div>
              <div style={{ flex: '1.5', minWidth: '200px' }}>
                <FilterableMultiSelect
                  id="product-area-filter"
                  titleText="Product Areas"
                  placeholder="Filter by product area"
                  items={PRODUCT_AREAS}
                  itemToString={(item) => item ? item.label : ''}
                  onChange={({ selectedItems }) => setSelectedProductAreas(selectedItems.map(i => i.id))}
                  size="lg"
                />
              </div>
              <div style={{ flex: '1.5', minWidth: '180px' }}>
                <FilterableMultiSelect
                  id="region-filter"
                  titleText="Region"
                  placeholder="Filter by region"
                  items={['North', 'South', 'Midlands (Birmingham)', 'Ireland', 'Scotland', 'Wales', 'Europe', 'London', 'Virtual', 'America', 'EMEA'].map(r => ({ id: r, label: r }))}
                  itemToString={(item) => item ? item.label : ''}
                  onChange={({ selectedItems }) => setSelectedRegions(selectedItems.map(i => i.id))}
                  size="lg"
                />
              </div>
              <div style={{ flex: '1.5', minWidth: '180px' }}>
                <FilterableMultiSelect
                  id="industry-filter"
                  titleText="Industry"
                  placeholder="Filter by industry"
                  items={INDUSTRIES}
                  itemToString={(item) => item ? item.label : ''}
                  onChange={({ selectedItems }) => setSelectedIndustries(selectedItems.map(i => i.id))}
                  size="lg"
                />
              </div>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <Select id="date-filter" labelText="Date Range" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} size="lg">
                  <SelectItem value="all" text="All Events" />
                  <SelectItem value="upcoming" text="Upcoming" />
                  <SelectItem value="past" text="Past" />
                </Select>
              </div>
            </div>
            {(searchTerm || selectedProductAreas.length > 0 || selectedRegions.length > 0 || selectedIndustries.length > 0 || dateFilter !== 'all') && (
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button kind="ghost" size="sm" renderIcon={Close} onClick={handleClearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* #5 — Type chips + event count */}
      {!showArchive && (
        <div style={{ padding: '10px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#57606a', marginRight: '4px' }}>Quick filter:</span>
          {['All', ...EVENT_TYPES.map(t => t.id)].map(type => {
            const count = type === 'All' ? events.length : events.filter(e => e.eventType === type).length;
            if (type !== 'All' && count === 0) return null;
            const label = type === 'All' ? 'All' : (EVENT_TYPES.find(t => t.id === type)?.label || type);
            const isActive = selectedTypeChip === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedTypeChip(type)}
                style={{
                  padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                  borderColor: isActive ? '#0f1f60' : '#e0e0e0',
                  background: isActive ? '#0f1f60' : '#fff',
                  color: isActive ? '#fff' : '#525252',
                }}
              >
                {label} <span style={{ opacity: 0.7 }}>({count})</span>
              </button>
            );
          })}
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#57606a' }}>
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}

      {/* Top action bar — select-all + generate button */}
      {!showArchive && filteredEvents.length > 0 && (
        <div style={{ padding: '10px 24px', background: 'linear-gradient(90deg, #060c2a 0%, #0c1a4a 100%)', borderBottom: '2px solid rgba(69,137,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Checkbox
              id="select-all"
              labelText={`Select all (${filteredEvents.length})`}
              checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
              indeterminate={selectedEvents.length > 0 && selectedEvents.length < filteredEvents.length}
              onChange={handleSelectAll}
            />
            {selectedEvents.length > 0 && (
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                {selectedEvents.length} selected
              </span>
            )}
          </div>
          {(() => {
            const hasInviteOnly = selectedEvents.some(id => events.find(e => e.id === id)?.inviteOnly);
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {hasInviteOnly && (
                  <span style={{ color: '#ff8389', fontSize: '13px', fontWeight: 500 }}>
                    🔒 Remove invite-only events to generate
                  </span>
                )}
                <Button
                  kind="primary"
                  size="md"
                  renderIcon={ArrowRight}
                  disabled={selectedEvents.length === 0 || hasInviteOnly}
                  onClick={handleGenerateCommunication}
                >
                  Generate Comm ({selectedEvents.length})
                </Button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Events Grid */}
      <div style={{ padding: '24px', backgroundColor: '#f4f4f4', minHeight: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Loading description="Loading events..." withOverlay={false} />
          </div>
        ) : showArchive ? (
          /* ── Archive view ── */
          filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🗄️</div>
              <h3 style={{ marginBottom: '8px' }}>{archivedEvents.length === 0 ? 'No Archived Events Yet' : 'No Events Match Your Filters'}</h3>
              <p style={{ color: '#525252' }}>
                {archivedEvents.length === 0 ? 'Events are automatically moved here once their date has passed.' : 'Try adjusting your filters.'}
              </p>
              {archivedEvents.length > 0 && <Button kind="tertiary" style={{ marginTop: '16px' }} onClick={handleClearFilters}>Clear filters</Button>}
            </div>
          ) : (
            Object.entries(
              filteredEvents.reduce((groups, e) => {
                const year = e.startDate || e.date ? new Date(e.startDate || e.date).getFullYear().toString() : 'Unknown';
                if (!groups[year]) groups[year] = [];
                groups[year].push(e);
                return groups;
              }, {})
            ).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearEvents]) => (
              <div key={year} style={{ marginBottom: '32px' }}>
                <div onClick={() => toggleMonth(year)}
                  style={{ background: 'linear-gradient(135deg, #060c2a 0%, #0f1f60 55%, #162880 100%)', borderLeft: '3px solid #4589ff', color: 'white', padding: '12px 20px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', userSelect: 'none' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>🗄️ {year} ({yearEvents.length} event{yearEvents.length !== 1 ? 's' : ''})</h3>
                  <span style={{ fontSize: '20px' }}>{expandedMonths[year] !== false ? '▼' : '▶'}</span>
                </div>
                {expandedMonths[year] !== false && (
                  <Grid>
                    {yearEvents.map(event => (
                      <Column key={event.id} lg={8} md={8} sm={4}>
                        <Tile style={{ padding: '20px', marginBottom: '16px', border: '1px solid #e0e0e0', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', opacity: 0.9 }}>
                          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#393939' }}>{highlight(event.title, searchTerm)}</h4>
                            <Tag type="cool-gray" size="sm">Archived</Tag>
                          </div>
                          <div className="event-summary-preview"
                            style={{ color: '#6f6f6f', fontSize: '13px', lineHeight: '1.5', marginBottom: '12px' }}
                            dangerouslySetInnerHTML={{ __html: event.briefSummary || event.description || '<p>No description provided</p>' }} />
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px', fontSize: '13px', color: '#6f6f6f' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={16} />
                              <span>{formatDate(event.startDate || event.date)}{event.endDate ? ` – ${formatDate(event.endDate)}` : ''}</span>
                            </div>
                            {(event.locationDetails || event.location) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Location size={16} />
                                <span>{(event.locationDetails || event.location).replace(/\s*\(Virtual\)\s*/gi, '').trim()}</span>
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            {event.eventType && <Tag type="gray" size="sm">{event.eventType}</Tag>}
                            {event.industry && event.industry !== 'Cross-Industry' && <Tag type="gray" size="sm">{event.industry}</Tag>}
                          </div>
                          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '8px' }}>
                            <Button kind="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setPreviewEvent(event); logActivity('event_viewed', { userEmail: currentUser?.email, userName: currentUser?.name, userRole: currentUser?.role, metadata: { eventId: event.id, eventTitle: event.title } }); }}>View full details</Button>
                            <Button kind="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRestoreEvent(event); }}>Restore to Library</Button>
                          </div>
                        </Tile>
                      </Column>
                    ))}
                  </Grid>
                )}
              </div>
            ))
          )
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '16px' }}>
              {events.length === 0 ? '📅 No Events Available' : '🔍 No Events Match Your Filters'}
            </h3>
            <p style={{ color: '#525252', marginBottom: '24px' }}>
              {events.length === 0
                ? 'No active events have been created yet. Marketing team members can create events in the Manage Events tab.'
                : 'Try adjusting your filters or search terms to find events.'}
            </p>
            {events.length > 0 && (
              <Button kind="tertiary" onClick={handleClearFilters}>Clear all filters</Button>
            )}
          </div>
        ) : (
          Object.entries(eventsByMonth).map(([month, monthEvents]) => (
            <div key={month} style={{ marginBottom: '32px' }}>
              {/* Month Header */}
              <div
                onClick={() => toggleMonth(month)}
                style={{ background: 'linear-gradient(135deg, #060c2a 0%, #0f1f60 55%, #162880 100%)', borderLeft: '3px solid #4589ff', color: 'white', padding: '12px 20px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', userSelect: 'none' }}
              >
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                  📅 {month} ({monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''})
                </h3>
                <span style={{ fontSize: '20px' }}>{expandedMonths[month] ? '▼' : '▶'}</span>
              </div>

              {expandedMonths[month] && (
                <Grid>
                  {monthEvents.map((event) => (
                    <Column key={event.id} lg={8} md={8} sm={4}>
                      <Tile
                        style={{
                          padding: '20px',
                          marginBottom: '16px',
                          cursor: 'pointer',
                          border: selectedEvents.includes(event.id) ? '2px solid #0f62fe' : '1px solid #e0e0e0',
                          borderLeft: `4px solid ${EVENT_TYPE_COLOR[event.eventType] || '#e0e0e0'}`, // #2
                          backgroundColor: selectedEvents.includes(event.id) ? '#edf5ff' : '#ffffff',
                          transition: 'all 0.15s ease',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                        onClick={() => { if (!event.inviteOnly) toggleSelectEvent(event.id); }}
                      >
                        {/* Checkbox top-right — hidden for invite-only events */}
                        {!event.inviteOnly && (
                          <div style={{ position: 'absolute', top: '16px', right: '16px' }} onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              id={`event-${event.id}`}
                              labelText=""
                              hideLabel
                              checked={selectedEvents.includes(event.id)}
                              onChange={() => toggleSelectEvent(event.id)}
                            />
                          </div>
                        )}

                        {/* Title */}
                        <div style={{ marginBottom: '10px', paddingRight: '40px' }}>
                          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{highlight(event.title, searchTerm)}</h4>
                          {event.inviteOnly && (
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#da1e28', fontWeight: 600 }}>
                              🔒 Invite Only — contact event owner to include in your comm
                            </p>
                          )}
                        </div>

                        {/* Summary — rendered HTML to preserve line breaks */}
                        <div
                          className="event-summary-preview"
                          style={{ color: '#525252', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}
                          dangerouslySetInnerHTML={{ __html: highlightHtml(event.briefSummary || event.description || '<p>No description provided</p>', searchTerm) }}
                        />

                        {/* Date / Location */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px', fontSize: '14px', color: '#525252' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={16} />
                            <span>
                              {formatDate(event.startDate || event.date)}
                              {event.endDate ? ` – ${formatDate(event.endDate)}` : ''}
                            </span>
                          </div>
                          {getDaysAwayPill(event.startDate || event.date) /* #3 */}
                          {event.eventTime && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Time size={16} />
                              <span>{event.eventTime}</span>
                            </div>
                          )}
                          {(event.locationDetails || event.location) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Location size={16} />
                              <span>{highlight((event.locationDetails || event.location).replace(/\s*\(Virtual\)\s*/gi, '').trim(), searchTerm)}</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          {event.eventType && <Tag type="blue" size="sm">{event.eventType}</Tag>}
                          {event.industry && event.industry !== 'Cross-Industry' && <Tag type="green" size="sm">{event.industry}</Tag>}
                          {event.promoteOurPresence && <Tag type="purple" size="sm">📣 Promote Our Presence</Tag>}
                        </div>

                        {/* Event Contacts */}
                        {event.contacts && event.contacts.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', gap: '-4px' }}>
                              {event.contacts.slice(0, 4).map((contact, i) => (
                                contact.imageUrl ? (
                                  <img
                                    key={i}
                                    src={contact.imageUrl}
                                    alt={contact.name}
                                    title={`${contact.name}${contact.email ? ` — ${contact.email}` : ''}`}
                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', marginLeft: i === 0 ? 0 : '-8px', position: 'relative', zIndex: event.contacts.length - i }}
                                  />
                                ) : (
                                  <div
                                    key={i}
                                    title={`${contact.name}${contact.email ? ` — ${contact.email}` : ''}`}
                                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0f62fe', border: '2px solid #fff', marginLeft: i === 0 ? 0 : '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600, position: 'relative', zIndex: event.contacts.length - i }}
                                  >
                                    {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                                  </div>
                                )
                              ))}
                            </div>
                            <span style={{ fontSize: '12px', color: '#525252' }}>
                              {event.contacts.length === 1
                                ? event.contacts[0].name
                                : `${event.contacts[0].name}${event.contacts.length > 1 ? ` +${event.contacts.length - 1} more` : ''}`}
                            </span>
                          </div>
                        )}

                        {/* View details */}
                        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                          <Button kind="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setPreviewEvent(event); logActivity('event_viewed', { userEmail: currentUser?.email, userName: currentUser?.name, userRole: currentUser?.role, metadata: { eventId: event.id, eventTitle: event.title } }); }}>
                            View full details
                          </Button>
                        </div>
                      </Tile>
                    </Column>
                  ))}
                </Grid>
              )}
            </div>
          ))
        )}
      </div>

      {/* #4 — Sticky bottom action bar */}
      {!showArchive && (
        <div style={{
          position: 'sticky', bottom: 0, zIndex: 100,
          background: '#0f1f60', borderTop: '2px solid #4589ff',
          padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          transition: 'opacity 0.2s', opacity: selectedEvents.length > 0 ? 1 : 0.4, pointerEvents: selectedEvents.length > 0 ? 'auto' : 'none',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#fff', fontSize: '14px' }}>
            <span>
              {selectedEvents.length > 0
                ? <><span style={{ background: '#4589ff', borderRadius: '12px', padding: '2px 10px', fontWeight: 700, marginRight: '8px' }}>{selectedEvents.length}</span> event{selectedEvents.length !== 1 ? 's' : ''} selected</>
                : 'Select events above to generate a comm'}
            </span>
          </div>
          {(() => {
            const hasInviteOnly = selectedEvents.some(id => events.find(e => e.id === id)?.inviteOnly);
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {hasInviteOnly && (
                  <span style={{ color: '#ff8389', fontSize: '13px', fontWeight: 500 }}>
                    🔒 Remove invite-only events to generate
                  </span>
                )}
                <Button
                  kind="primary"
                  size="md"
                  renderIcon={ArrowRight}
                  disabled={selectedEvents.length === 0 || hasInviteOnly}
                  onClick={handleGenerateCommunication}
                >
                  Generate Comm ({selectedEvents.length})
                </Button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Personalization Modal */}
      <Modal
        open={personalizationModalOpen}
        onRequestClose={resetPersonalizationModal}
        modalHeading="Personalize Your Communication"
        primaryButtonText="Generate Communication"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleConfirmGeneration}
        size="sm"
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{ marginBottom: '24px', color: '#525252' }}>
            Choose how you'd like to address the recipient(s) in this communication.
          </p>

          {/* Greeting */}
          <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e0e0e0' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Greeting</h4>
            <div style={{ marginBottom: '16px' }}>
              <Checkbox id="generic-greeting" labelText="Use generic greeting (for multiple recipients)" checked={useGenericGreeting}
                onChange={(e) => { setUseGenericGreeting(e.target.checked); if (e.target.checked) setRecipientName(''); }} />
            </div>
            {!useGenericGreeting && (
              <TextInput id="recipient-name" labelText="Recipient Name (optional)" placeholder="e.g., John Smith"
                value={recipientName} onChange={(e) => setRecipientName(e.target.value)} helperText="Leave blank to use 'Hi'" />
            )}
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f4f4f4', borderRadius: '4px', borderLeft: '4px solid #0f62fe' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#161616' }}>
                <strong>Preview:</strong> {useGenericGreeting ? 'Hi' : recipientName.trim() ? `Dear ${recipientName.trim()}` : 'Hi'}
              </p>
            </div>
          </div>

          {/* Introduction Message */}
          <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e0e0e0' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Introduction Message</h4>
            <p style={{ marginBottom: '16px', color: '#525252', fontSize: '14px' }}>
              Write a custom message to introduce the events to your client.
            </p>
            <TextArea id="custom-blurb" labelText="Custom Introduction (optional)"
              placeholder="e.g., I thought these upcoming events might be of interest to you and your team..."
              value={customBlurb} onChange={(e) => setCustomBlurb(e.target.value)} rows={4}
              helperText="Leave blank to use the default message" />
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f4f4f4', borderRadius: '4px', borderLeft: '4px solid #0f62fe' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#161616', whiteSpace: 'pre-wrap' }}>
                <strong>Preview:</strong><br />
                {customBlurb.trim() || "We're excited to share these upcoming IBM events with you. These events offer valuable opportunities to learn about the latest innovations, connect with experts, and discover how IBM solutions can help drive your business forward."}
              </p>
            </div>
          </div>

          {/* Brand Colors */}
          <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e0e0e0' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Brand Colors</h4>
            <p style={{ marginBottom: '16px', color: '#525252', fontSize: '14px' }}>Customize the colors to match your client's brand</p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#161616' }}>Header & Banner Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="color" value={customBannerColor} onChange={(e) => setCustomBannerColor(e.target.value)}
                    style={{ width: '50px', height: '40px', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer' }} />
                  <TextInput id="banner-color-text" labelText="" value={customBannerColor} onChange={(e) => setCustomBannerColor(e.target.value)} placeholder="#0f62fe" />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#161616' }}>Button Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="color" value={customAccentColor} onChange={(e) => setCustomAccentColor(e.target.value)}
                    style={{ width: '50px', height: '40px', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer' }} />
                  <TextInput id="accent-color-text" labelText="" value={customAccentColor} onChange={(e) => setCustomAccentColor(e.target.value)} placeholder="#0f62fe" />
                </div>
              </div>
            </div>
            <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ background: customBannerColor, height: '8px' }} />
              <div style={{ padding: '12px', backgroundColor: '#f4f4f4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#525252' }}><strong>Button preview:</strong></span>
                <div style={{ padding: '6px 12px', backgroundColor: customAccentColor, borderRadius: '4px', color: '#fff', fontSize: '12px', fontWeight: 500 }}>Register Now →</div>
              </div>
            </div>
          </div>

          {/* Sign-off */}
          <div>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Sign-off</h4>
            <div style={{ marginBottom: '16px' }}>
              <Checkbox id="generic-signoff" labelText="Use generic sign-off (IBM UKI Marketing Team)" checked={useGenericSignOff}
                onChange={(e) => { setUseGenericSignOff(e.target.checked); if (e.target.checked) { setSenderName(''); setSenderTitle(''); } }} />
            </div>
            {!useGenericSignOff && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TextInput id="sender-name" labelText="Your Name (optional)" placeholder="e.g., Sarah Johnson"
                  value={senderName} onChange={(e) => setSenderName(e.target.value)} helperText="Leave blank to use 'IBM UKI Marketing Team'" />
                <TextInput id="sender-title" labelText="Your Title (optional)" placeholder="e.g., Senior Account Manager"
                  value={senderTitle} onChange={(e) => setSenderTitle(e.target.value)} />
              </div>
            )}
            {!useGenericSignOff && (
              <div style={{ marginTop: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Profile Picture (Optional)</h5>
                <p style={{ marginBottom: '12px', fontSize: '12px', color: '#525252' }}>Upload your photo to personalise the signature. Square image, max 500KB.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {profilePicture ? (
                    <div>
                      <img src={profilePicture} alt="Profile preview"
                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0f62fe', display: 'block', marginBottom: '8px' }} />
                      <Button kind="danger--ghost" size="sm" onClick={handleRemoveProfilePicture}>Remove Picture</Button>
                    </div>
                  ) : (
                    <div>
                      <input type="file" id="profile-picture-upload" accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleProfilePictureUpload} style={{ display: 'none' }} />
                      <Button kind="tertiary" size="sm" onClick={() => document.getElementById('profile-picture-upload').click()}>
                        Upload Picture
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f4f4f4', borderRadius: '4px', borderLeft: '4px solid #0f62fe' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#161616' }}><strong>Preview:</strong></p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                {!useGenericSignOff && profilePicture && (
                  <img src={profilePicture} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0f62fe' }} />
                )}
                <div style={{ fontSize: '14px', color: '#161616' }}>
                  Best regards,<br />
                  <strong>{useGenericSignOff ? 'IBM UKI Marketing Team' : senderName.trim() || 'IBM UKI Marketing Team'}</strong>
                  {!useGenericSignOff && senderTitle.trim() && <><br />{senderTitle.trim()}</>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {previewEvent && (
        <Modal
          open={!!previewEvent}
          onRequestClose={() => setPreviewEvent(null)}
          modalHeading={previewEvent.title}
          primaryButtonText={selectedEvents.includes(previewEvent.id) ? '✓ Selected' : 'Select Event'}
          secondaryButtonText="Close"
          onRequestSubmit={() => { toggleSelectEvent(previewEvent.id); setPreviewEvent(null); }}
          size="lg"
        >
          <div style={{ padding: '8px 0' }}>

            {/* Summary */}
            <div style={{ marginBottom: '24px' }}>
              <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Summary</h5>
              <div
                className="event-summary-preview"
                style={{ color: '#525252', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: previewEvent.briefSummary || previewEvent.description || '<p>No summary provided</p>' }}
              />
            </div>

            {/* Event Details */}
            <div style={{ marginBottom: '24px' }}>
              <h5 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>Event Details</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} />
                  <span><strong>Date:</strong> {formatDate(previewEvent.startDate || previewEvent.date)}{previewEvent.endDate ? ` – ${formatDate(previewEvent.endDate)}` : ''}</span>
                </div>
                {previewEvent.eventTime && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Time size={16} /><span><strong>Time:</strong> {previewEvent.eventTime}</span>
                  </div>
                )}
                {(previewEvent.locationDetails || previewEvent.location) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Location size={16} /><span><strong>Location:</strong> {(previewEvent.locationDetails || previewEvent.location).replace(/\s*\(Virtual\)\s*/gi, '').trim()}</span>
                  </div>
                )}
                {previewEvent.eventType && <div><strong>Type:</strong> {previewEvent.eventType}</div>}
                {previewEvent.targetAudience && <div><strong>Target Audience:</strong> {previewEvent.targetAudience}</div>}
                {previewEvent.industry && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>Industry:</strong> <Tag type="green" size="sm">{previewEvent.industry}</Tag>
                  </div>
                )}
                {previewEvent.eventStream && <div><strong>Area of Business:</strong> {previewEvent.eventStream}</div>}
                {previewEvent.regions && previewEvent.regions.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong>Regions:</strong>
                    {previewEvent.regions.map(r => <Tag key={r} type="teal" size="sm">{r}</Tag>)}
                  </div>
                )}
                {previewEvent.inviteOnly && <div><Tag type="red" size="sm">🔒 Invite Only</Tag></div>}
              </div>
            </div>

            {/* Detailed Description */}
            {previewEvent.detailedDescription && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Detailed Description</h5>
                <div
                  className="event-summary-preview"
                  style={{ color: '#525252', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: previewEvent.detailedDescription }}
                />
              </div>
            )}

            {/* Product Areas */}
            {previewEvent.productAreas && previewEvent.productAreas.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Product Areas</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {previewEvent.productAreas.map(areaId => {
                    const area = PRODUCT_AREAS.find(a => a.id === areaId);
                    return area ? <Tag key={areaId} type="blue" size="md">{area.label}</Tag> : null;
                  })}
                </div>
              </div>
            )}

            {/* Target Roles */}
            {previewEvent.targetRoles && previewEvent.targetRoles.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Target Roles</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {previewEvent.targetRoles.map(roleId => {
                    const label = roleId === 'other'
                      ? (previewEvent.otherRole || 'Other')
                      : roleId.toUpperCase();
                    return <Tag key={roleId} type="cyan" size="md">{label}</Tag>;
                  })}
                </div>
              </div>
            )}

            {/* Event Contacts */}
            {previewEvent.contacts && previewEvent.contacts.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserFollow size={16} /> Event Contacts
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {previewEvent.contacts.map((contact, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f4f4f4', borderRadius: '4px', minWidth: '220px' }}>
                      {contact.imageUrl ? (
                        <img
                          src={contact.imageUrl}
                          alt={contact.name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0f62fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 600, flexShrink: 0 }}>
                          {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{contact.name || '—'}</div>
                        {contact.email && <div style={{ fontSize: '12px', color: '#525252' }}>{contact.email}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers */}
            {previewEvent.speakers && previewEvent.speakers.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserFollow size={16} /> Speakers
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {previewEvent.speakers.map((speaker, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f4f4f4', borderRadius: '4px', minWidth: '220px' }}>
                      {speaker.imageUrl ? (
                        <img
                          src={speaker.imageUrl}
                          alt={speaker.name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#6929c4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 600, flexShrink: 0 }}>
                          {speaker.name ? speaker.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{speaker.name || '—'}</div>
                        {speaker.role && <div style={{ fontSize: '12px', color: '#525252' }}>{speaker.role}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Agenda */}
            {previewEvent.eventAgenda && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Event Agenda</h5>
                <div
                  className="event-summary-preview"
                  style={{ padding: '12px', backgroundColor: '#f4f4f4', borderRadius: '4px', fontSize: '13px', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: previewEvent.eventAgenda }}
                />
              </div>
            )}

            {/* Invite Process */}
            {previewEvent.inviteProcess && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Invite Process</h5>
                <div
                  className="event-summary-preview"
                  style={{ padding: '12px', backgroundColor: '#f4f4f4', borderRadius: '4px', fontSize: '13px', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: previewEvent.inviteProcess }}
                />
              </div>
            )}

            {/* Registration & Seismic buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {previewEvent.registrationLink && (
                <a href={previewEvent.registrationLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', backgroundColor: '#0f62fe', color: '#fff', padding: '10px 16px', textDecoration: 'none', borderRadius: '4px', fontWeight: 500 }}>
                  Register Now →
                </a>
              )}
              {previewEvent.seismicLink && (
                <a href={previewEvent.seismicLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', backgroundColor: '#393939', color: '#fff', padding: '10px 16px', textDecoration: 'none', borderRadius: '4px', fontWeight: 500 }}>
                  View on Seismic →
                </a>
              )}
              {previewEvent.sellerInviteUrl && (
                <a href={previewEvent.sellerInviteUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', backgroundColor: '#6929c4', color: '#fff', padding: '10px 16px', textDecoration: 'none', borderRadius: '4px', fontWeight: 500 }}>
                  📄 Download Seller Invite
                </a>
              )}
              {previewEvent.partnerInviteUrl && (
                <a href={previewEvent.partnerInviteUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', backgroundColor: '#005d5d', color: '#fff', padding: '10px 16px', textDecoration: 'none', borderRadius: '4px', fontWeight: 500 }}>
                  📄 Download Partner Invite
                </a>
              )}
            </div>

            {/* Post Event Follow-up */}
            {previewEvent.postEventFollowUp && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Post Event Follow-up</h5>
                <div
                  className="event-summary-preview"
                  style={{ padding: '12px', backgroundColor: '#e8f4ff', borderRadius: '4px', fontSize: '13px', lineHeight: '1.6', borderLeft: '4px solid #0f62fe' }}
                  dangerouslySetInnerHTML={{ __html: previewEvent.postEventFollowUp }}
                />
              </div>
            )}

            {/* Promote Our Presence */}
            {(previewEvent.promoteOurPresence || (previewEvent.promoteDocuments && previewEvent.promoteDocuments.length > 0)) && (
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f6f2ff', borderRadius: '4px', borderLeft: '4px solid #6929c4' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#6929c4' }}>📣 Promote Our Presence</h5>
                {previewEvent.promoteOurPresence && (
                  <div
                    className="event-summary-preview"
                    style={{ color: '#161616', fontSize: '13px', lineHeight: '1.6', marginBottom: previewEvent.promoteDocuments && previewEvent.promoteDocuments.length > 0 ? '12px' : '0' }}
                    dangerouslySetInnerHTML={{ __html: previewEvent.promoteOurPresence }}
                  />
                )}
                {previewEvent.promoteDocuments && previewEvent.promoteDocuments.length > 0 && (
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#525252', marginBottom: '6px' }}>Attached Documents:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {previewEvent.promoteDocuments.map((doc, i) => (
                        <a
                          key={i}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#6929c4', color: '#fff', borderRadius: '4px', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}
                        >
                          <Document size={14} /> {doc.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </Modal>
      )}
    </div>
  );
};

export default EventsTab;
