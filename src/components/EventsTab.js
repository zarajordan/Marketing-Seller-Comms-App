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
  DatePicker,
  DatePickerInput,
  Loading,
  TextInput,
  TextArea,
  Select,
  SelectItem,
} from '@carbon/react';
import {
  Calendar,
  Location,
  Time,
  Checkmark,
  ArrowRight,
  Filter,
  Close,
  Document,
} from '@carbon/icons-react';
import { toast } from 'react-toastify';

const PRODUCT_AREAS = [
  { id: 'ai', label: '🤖 AI & Machine Learning', icon: '🤖' },
  { id: 'data', label: '📊 Data & Analytics', icon: '📊' },
  { id: 'automation', label: '⚙️ Automation', icon: '⚙️' },
  { id: 'cloud', label: '☁️ Cloud & Hybrid Cloud', icon: '☁️' },
  { id: 'quantum', label: '🔬 Quantum Computing', icon: '🔬' },
  { id: 'infrastructure', label: '🏗️ Infrastructure & Systems', icon: '🏗️' },
  { id: 'security', label: '🔒 Security', icon: '🔒' },
  { id: 'business', label: '💼 Business Applications', icon: '💼' },
];

const EVENT_TYPES = [
  { id: 'webinar', label: 'Webinar' },
  { id: 'workshop', label: 'Workshop' },
  { id: 'conference', label: 'Conference' },
  { id: 'seminar', label: 'Seminar' },
  { id: 'training', label: 'Training' },
  { id: 'networking', label: 'Networking Event' },
  { id: 'product-launch', label: 'Product Launch' },
  { id: 'other', label: 'Other' },
];

const INDUSTRIES = [
  { id: 'cross-industry', label: 'Cross-Industry' },
  { id: 'financial-services', label: 'Financial Services' },
  { id: 'healthcare', label: 'Healthcare & Life Sciences' },
  { id: 'retail', label: 'Retail & Consumer Products' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'telecommunications', label: 'Telecommunications' },
  { id: 'energy', label: 'Energy & Utilities' },
  { id: 'government', label: 'Government & Public Sector' },
  { id: 'transportation', label: 'Transportation & Logistics' },
  { id: 'media', label: 'Media & Entertainment' },
  { id: 'education', label: 'Education' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'travel', label: 'Travel & Hospitality' },
  { id: 'automotive', label: 'Automotive' },
  { id: 'aerospace', label: 'Aerospace & Defense' },
];

const TARGET_ROLES = [
  { id: 'ceo', label: 'CEO' },
  { id: 'cfo', label: 'CFO' },
  { id: 'coo', label: 'COO' },
  { id: 'chro', label: 'CHRO' },
  { id: 'cmo', label: 'CMO' },
  { id: 'cio', label: 'CIO' },
  { id: 'cto', label: 'CTO' },
  { id: 'cdo', label: 'CDO' },
  { id: 'senior-it', label: 'Senior IT' },
  { id: 'senior-lob', label: 'Senior LOB' },
  { id: 'it-practitioners', label: 'IT Practitioners' },
  { id: 'other', label: 'Other' },
];

const EventsTab = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductAreas, setSelectedProductAreas] = useState([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [dateFilter, setDateFilter] = useState('all'); // all, upcoming, past
  const [previewEvent, setPreviewEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);
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
    
    // Listen for storage changes (when ManageEventsTab updates events)
    const handleStorageChange = (e) => {
      if (e.key === 'managed_events') {
        loadEvents();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-window updates
    const handleEventsUpdate = () => {
      loadEvents();
    };
    
    window.addEventListener('eventsUpdated', handleEventsUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('eventsUpdated', handleEventsUpdate);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchTerm, selectedProductAreas, selectedEventTypes, selectedIndustries, dateFilter]);

  const loadEvents = () => {
    setLoading(true);
    try {
      // Load events from the new event management system
      const managedEvents = JSON.parse(localStorage.getItem('managed_events') || '[]');
      
      // Filter only active events for sellers (case-insensitive)
      const activeEvents = managedEvents.filter(event =>
        event.status && event.status.toLowerCase() === 'active'
      );
      
      setEvents(activeEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(term) ||
        event.summary?.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term)
      );
    }

    // Product area filter
    if (selectedProductAreas.length > 0) {
      filtered = filtered.filter(event =>
        event.productAreas?.some(area => selectedProductAreas.includes(area))
      );
    }

    // Event type filter
    if (selectedEventTypes.length > 0) {
      filtered = filtered.filter(event =>
        selectedEventTypes.includes(event.eventType)
      );
    }

    // Industry filter
    if (selectedIndustries.length > 0) {
      filtered = filtered.filter(event =>
        selectedIndustries.includes(event.industry)
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'upcoming') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now;
      });
    } else if (dateFilter === 'past') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate < now;
      });
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

    setFilteredEvents(filtered);
  };

  // Group events by month
  const groupEventsByMonth = (events) => {
    const grouped = {};
    events.forEach(event => {
      const date = new Date(event.date);
      const monthYear = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(event);
    });
    return grouped;
  };

  const eventsByMonth = groupEventsByMonth(filteredEvents);
  const [expandedMonths, setExpandedMonths] = React.useState({});

  React.useEffect(() => {
    // Auto-expand all months by default
    const allMonths = {};
    Object.keys(eventsByMonth).forEach(month => {
      allMonths[month] = true;
    });
    setExpandedMonths(allMonths);
  }, [filteredEvents]);

  const toggleMonth = (month) => {
    setExpandedMonths(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
  };

  const handleEventSelection = (eventId) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(e => e.id));
    }
  };

  const handleGenerateCommunication = () => {
    if (selectedEvents.length === 0) {
      toast.warning('Please select at least one event', { autoClose: 3000 });
      return;
    }

    // Open personalization modal
    setPersonalizationModalOpen(true);
  };

  const handleConfirmGeneration = () => {
    const selectedEventData = events
      .filter(e => selectedEvents.includes(e.id))
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date chronologically
    
    // Determine greeting
    const greeting = useGenericGreeting
      ? 'Hi'
      : recipientName.trim()
        ? `Dear ${recipientName.trim()}`
        : 'Hi';
    
    // Determine sign-off
    const signOff = useGenericSignOff
      ? { name: 'IBM UKI Marketing Team', title: '', picture: '' }
      : {
          name: senderName.trim() || 'IBM UKI Marketing Team',
          title: senderTitle.trim(),
          picture: profilePicture
        };
    
    // Prepare custom colors
    const customColors = {
      banner: customBannerColor,
      accent: customAccentColor
    };
    
    // Generate HTML communication with personalized greeting, sign-off, and custom colors
    const htmlContent = generateHTMLCommunication(selectedEventData, greeting, signOff, customColors);
    
    // Create and download the file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IBM_Events_Communication_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(
      `✅ Communication generated! Check your Downloads folder.`,
      {
        autoClose: 5000,
        icon: <Checkmark size={24} />
      }
    );
    
    // Reset and close
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
    setSelectedEvents([]);
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, or GIF)', { autoClose: 3000 });
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 500000) {
      toast.error('Image size must be less than 500KB', { autoClose: 3000 });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result);
      toast.success('Profile picture uploaded successfully!', { autoClose: 2000 });
    };
    reader.onerror = () => {
      toast.error('Failed to upload image. Please try again.', { autoClose: 3000 });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture('');
    // Reset file input
    const fileInput = document.getElementById('profile-picture-upload');
    if (fileInput) fileInput.value = '';
  };

  const generateHTMLCommunication = (selectedEventData, greeting = 'Dear Colleague', signOff = { name: 'IBM UKI Marketing Team', title: '', picture: '' }, customColors = { banner: '#0f62fe', accent: '#0f62fe' }) => {
    // Use custom colors directly
    const bannerGradient = `linear-gradient(135deg, ${customColors.banner} 0%, ${customColors.banner} 100%)`;
    const accentColor = customColors.accent;
    // Generate event sections using the same table-based format as CreateCommTab
    const eventsHTML = selectedEventData.map(event => {
      return `
      <tr>
        <td style="padding: 24px 20px 0 20px; border-top: 1px solid #e0e0e0;">
          <table width="560" cellpadding="0" cellspacing="0" border="0" style="width: 560px;">
            <tr>
              <td style="color: #161616; font-size: 15px; font-weight: bold; padding-bottom: 12px;">
                ${event.title}${event.featured ? ' ⭐' : ''}
              </td>
            </tr>
            <tr>
              <td style="color: #525252; line-height: 1.5; padding-bottom: 12px; font-size: 13px;">
                ${event.summary}
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 16px;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="color: #525252; font-size: 13px; padding-right: 20px;">
                      📅 <strong>${formatDate(event.date)}${event.endDate ? ` - ${formatDate(event.endDate)}` : ''}</strong>
                    </td>
                    ${event.time ? `
                    <td style="color: #525252; font-size: 13px; padding-right: 20px;">
                      🕐 <strong>${event.time}</strong>
                    </td>
                    ` : ''}
                  </tr>
                  ${event.location ? `
                  <tr>
                    <td colspan="2" style="color: #525252; font-size: 13px; padding-top: 8px;">
                      📍 <strong>${event.location}</strong> (${event.locationType})
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </td>
            </tr>
            ${event.registrationLink ? `
            <tr>
              <td style="padding-bottom: 12px;">
                <a href="${event.registrationLink}" style="display: inline-block; background-color: ${accentColor}; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 13px;">
                  Register Now →
                </a>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IBM Events - ${new Date().toLocaleDateString()}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'IBM Plex Sans', Arial, Helvetica, sans-serif;
      font-size: 16px;
      background-color: #f5f5f5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    a {
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      table[class="email-container"] {
        width: 100% !important;
      }
      td[class="content-padding"] {
        padding: 20px 15px !important;
      }
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Main Email Container - Fixed 600px width -->
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: ${customColors.banner}; padding: 32px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 600;">
                IBM Events
              </h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 16px;">
                Upcoming Events & Opportunities
              </p>
            </td>
          </tr>
          
          <!-- Colored Banner -->
          <tr>
            <td style="background: ${bannerGradient}; padding: 0; height: 8px;">
            </td>
          </tr>
          
          <!-- Content Row -->
          <tr>
            <td class="content-padding" style="padding: 32px 20px 16px 20px;">
              <table width="560" cellpadding="0" cellspacing="0" border="0" style="width: 560px;">
                <tr>
                  <td style="color: #161616; line-height: 1.5; padding-bottom: 16px; font-size: 13px;">
                    ${greeting},
                  </td>
                </tr>
                <tr>
                  <td style="color: #161616; line-height: 1.5; padding-bottom: 24px; font-size: 13px;">
                    ${customBlurb.trim() || "We're excited to share these upcoming IBM events with you. These events offer valuable opportunities to learn about the latest innovations, connect with experts, and discover how IBM solutions can help drive your business forward."}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Event Sections -->
          ${eventsHTML}
          
          <!-- Closing -->
          <tr>
            <td style="padding: 16px 20px 32px 20px;">
              <table width="560" cellpadding="0" cellspacing="0" border="0" style="width: 560px;">
                <tr>
                  <td style="color: #161616; line-height: 1.5; padding-bottom: 12px; font-size: 13px;">
                    We look forward to seeing you at these events!
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        ${signOff.picture ? `
                        <td style="padding-right: 16px; vertical-align: top;">
                          <img src="${signOff.picture}" alt="${signOff.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; display: block;" />
                        </td>
                        ` : ''}
                        <td style="vertical-align: top;">
                          <div style="color: #161616; line-height: 1.5; font-size: 13px;">
                            Best regards,<br>
                            <strong>${signOff.name}</strong>${signOff.title ? `<br>${signOff.title}` : ''}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f4; padding: 24px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; font-size: 12px; color: #525252;">
                © ${new Date().getFullYear()} IBM Corporation. All rights reserved.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #525252;">
                Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedProductAreas([]);
    setSelectedEventTypes([]);
    setSelectedIndustries([]);
    setDateFilter('all');
    setSelectedEvents([]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const getProductAreaLabel = (areaId) => {
    const area = PRODUCT_AREAS.find(a => a.id === areaId);
    return area ? area.label : areaId;
  };

  const getEventTypeLabel = (typeId) => {
    const type = EVENT_TYPES.find(t => t.id === typeId);
    return type ? type.label : typeId;
  };

  const isEventUpcoming = (dateString) => {
    return new Date(dateString) >= new Date();
  };

  return (
    <div className="events-tab" style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ 
        padding: '24px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div>
            <h2 style={{ marginBottom: '8px' }}>🎯 Event Library</h2>
            <p style={{ color: '#525252', fontSize: '14px' }}>
              Browse and select events to include in your communications
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {selectedEvents.length > 0 && (
              <Tag type="blue" size="md">
                {selectedEvents.length} selected
              </Tag>
            )}
            <Button
              kind="ghost"
              size="sm"
              renderIcon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f4f4f4',
            borderRadius: '4px',
            marginTop: '16px'
          }}>
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
                  onChange={({ selectedItems }) => {
                    setSelectedProductAreas(selectedItems.map(item => item.id));
                  }}
                  size="lg"
                />
              </div>
              <div style={{ flex: '1.5', minWidth: '200px' }}>
                <FilterableMultiSelect
                  id="event-type-filter"
                  titleText="Event Type"
                  placeholder="Filter by type"
                  items={EVENT_TYPES}
                  itemToString={(item) => item ? item.label : ''}
                  onChange={({ selectedItems }) => {
                    setSelectedEventTypes(selectedItems.map(item => item.id));
                  }}
                  size="lg"
                />
              </div>
              <div style={{ flex: '1.5', minWidth: '200px' }}>
                <FilterableMultiSelect
                  id="industry-filter"
                  titleText="Industry"
                  placeholder="Filter by industry"
                  items={INDUSTRIES}
                  itemToString={(item) => item ? item.label : ''}
                  onChange={({ selectedItems }) => {
                    setSelectedIndustries(selectedItems.map(item => item.label));
                  }}
                  size="lg"
                />
              </div>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <Select
                  id="date-filter"
                  labelText="Date Range"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  size="lg"
                >
                  <SelectItem value="all" text="All Events" />
                  <SelectItem value="upcoming" text="Upcoming" />
                  <SelectItem value="past" text="Past" />
                </Select>
              </div>
            </div>
            
            {(searchTerm || selectedProductAreas.length > 0 || selectedEventTypes.length > 0 || selectedIndustries.length > 0 || dateFilter !== 'all') && (
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={Close}
                  onClick={handleClearFilters}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      {filteredEvents.length > 0 && (
        <div style={{ 
          padding: '16px 24px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f4f4f4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Checkbox
              id="select-all"
              labelText={`Select all (${filteredEvents.length})`}
              checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
              indeterminate={selectedEvents.length > 0 && selectedEvents.length < filteredEvents.length}
              onChange={handleSelectAll}
            />
            <span style={{ color: '#525252', fontSize: '14px' }}>
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </span>
          </div>
          <Button
            kind="primary"
            size="md"
            renderIcon={ArrowRight}
            disabled={selectedEvents.length === 0}
            onClick={handleGenerateCommunication}
          >
            Generate Communication ({selectedEvents.length})
          </Button>
        </div>
      )}

      {/* Events Grid */}
      <div style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Loading description="Loading events..." withOverlay={false} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 24px',
            backgroundColor: '#f4f4f4',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginBottom: '16px' }}>
              {events.length === 0 ? '📅 No Events Available' : '🔍 No Events Match Your Filters'}
            </h3>
            <p style={{ color: '#525252', marginBottom: '24px' }}>
              {events.length === 0 
                ? 'No active events have been created yet. Marketing team members can create events in the Manage Events tab.'
                : 'Try adjusting your filters or search terms to find events.'
              }
            </p>
            {events.length > 0 && (
              <Button kind="tertiary" onClick={handleClearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div>
            {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
              <div key={month} style={{ marginBottom: '32px' }}>
                {/* Month Header Ribbon */}
                <div
                  onClick={() => toggleMonth(month)}
                  style={{
                    backgroundColor: '#0f62fe',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    userSelect: 'none'
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                    📅 {month} ({monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''})
                  </h3>
                  <span style={{ fontSize: '20px' }}>
                    {expandedMonths[month] ? '▼' : '▶'}
                  </span>
                </div>

                {/* Month Events */}
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
                            backgroundColor: selectedEvents.includes(event.id) ? '#f0f7ff' : '#ffffff',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onClick={() => handleEventSelection(event.id)}
                        >
                  {/* Selection Checkbox */}
                  <div
                    style={{ position: 'absolute', top: '16px', right: '16px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      id={`event-${event.id}`}
                      labelText=""
                      hideLabel
                      checked={selectedEvents.includes(event.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleEventSelection(event.id);
                      }}
                    />
                  </div>

                  {/* Event Header */}
                  <div style={{ marginBottom: '12px', paddingRight: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                        {event.title}
                      </h4>
                      {event.featured && (
                        <Tag type="purple" size="sm">⭐ Featured</Tag>
                      )}
                      {isEventUpcoming(event.date) && (
                        <Tag type="green" size="sm">Upcoming</Tag>
                      )}
                    </div>
                    <div
                      className="event-summary-preview"
                      style={{
                        color: '#525252',
                        fontSize: '14px',
                        margin: '8px 0',
                        lineHeight: '1.5'
                      }}
                      dangerouslySetInnerHTML={{ __html: event.summary }}
                    />
                  </div>

                  {/* Event Details */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#525252'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} />
                      <span>{formatDate(event.date)}{event.endDate && ` - ${formatDate(event.endDate)}`}</span>
                    </div>
                    {event.time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Time size={16} />
                        <span>{formatTime(event.time)}</span>
                      </div>
                    )}
                    {event.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Location size={16} />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Event Type and Industry */}
                  <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {event.eventType && (
                      <Tag type="cool-gray" size="sm">
                        {getEventTypeLabel(event.eventType)}
                      </Tag>
                    )}
                    {event.industry && (
                      <Tag type="green" size="sm">
                        {event.industry}
                      </Tag>
                    )}
                  </div>

                  {/* Product Areas */}
                  {event.productAreas && event.productAreas.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '8px',
                      marginTop: '12px'
                    }}>
                      {event.productAreas.map(areaId => {
                        const area = PRODUCT_AREAS.find(a => a.id === areaId);
                        return area ? (
                          <Tag key={areaId} type="blue" size="sm">
                            {area.icon} {area.label.replace(/^[^\s]+ /, '')}
                          </Tag>
                        ) : null;
                      })}
                    </div>
                  )}

                          {/* View Details Button */}
                          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                            <Button
                              kind="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewEvent(event);
                              }}
                            >
                              View full details
                            </Button>
                          </div>
                        </Tile>
                      </Column>
                    ))}
                  </Grid>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personalization Modal */}
      <Modal
        open={personalizationModalOpen}
        onRequestClose={() => {
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
        }}
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
          
          {/* Greeting Section */}
          <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e0e0e0' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Greeting</h4>
            
            <div style={{ marginBottom: '16px' }}>
              <Checkbox
                id="generic-greeting"
                labelText="Use generic greeting (for multiple recipients)"
                checked={useGenericGreeting}
                onChange={(e) => {
                  setUseGenericGreeting(e.target.checked);
                  if (e.target.checked) {
                    setRecipientName('');
                  }
                }}
              />
            </div>

            {!useGenericGreeting && (
              <TextInput
                id="recipient-name"
                labelText="Recipient Name (optional)"
                placeholder="e.g., John Smith"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                helperText="Leave blank to use 'Hi'"
              />
            )}

            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f4f4f4',
              borderRadius: '4px',
              borderLeft: '4px solid #0f62fe'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#161616' }}>
                <strong>Preview:</strong> {useGenericGreeting
                  ? 'Hi'
                  : recipientName.trim()
                    ? `Dear ${recipientName.trim()}`
                    : 'Hi'}
              </p>
            </div>
          </div>

          {/* Custom Blurb Section */}
          <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e0e0e0' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Introduction Message</h4>
            
            <p style={{ marginBottom: '16px', color: '#525252', fontSize: '14px' }}>
              Write a custom message to introduce the events to your client. This will appear below the greeting and above the event listings.
            </p>

            <TextArea
              id="custom-blurb"
              labelText="Custom Introduction (optional)"
              placeholder="e.g., I thought these upcoming events might be of interest to you and your team..."
              value={customBlurb}
              onChange={(e) => setCustomBlurb(e.target.value)}
              rows={4}
              helperText="Leave blank to use the default message"
            />

            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f4f4f4',
              borderRadius: '4px',
              borderLeft: '4px solid #0f62fe'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#161616', whiteSpace: 'pre-wrap' }}>
                <strong>Preview:</strong><br/>
                {customBlurb.trim() || "We're excited to share these upcoming IBM events with you. These events offer valuable opportunities to learn about the latest innovations, connect with experts, and discover how IBM solutions can help drive your business forward."}
              </p>
            </div>
          </div>

          {/* Brand Colors Section */}
          <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e0e0e0' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Brand Colors</h4>
            
            <p style={{ marginBottom: '16px', color: '#525252', fontSize: '14px' }}>
              Customize the colors to match your client's brand
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="banner-color" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#161616' }}>
                  Header & Banner Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    id="banner-color"
                    value={customBannerColor}
                    onChange={(e) => setCustomBannerColor(e.target.value)}
                    style={{ width: '50px', height: '40px', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <TextInput
                    id="banner-color-text"
                    value={customBannerColor}
                    onChange={(e) => setCustomBannerColor(e.target.value)}
                    placeholder="#0f62fe"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="accent-color" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#161616' }}>
                  Button Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    id="accent-color"
                    value={customAccentColor}
                    onChange={(e) => setCustomAccentColor(e.target.value)}
                    style={{ width: '50px', height: '40px', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <TextInput
                    id="accent-color-text"
                    value={customAccentColor}
                    onChange={(e) => setCustomAccentColor(e.target.value)}
                    placeholder="#0f62fe"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${customBannerColor} 0%, ${customBannerColor} 100%)`,
                height: '8px'
              }}>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f4f4f4' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#525252' }}>
                  <strong>Preview:</strong> Header and banner will use your selected colors
                </p>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px' }}>Button preview:</span>
                  <div style={{
                    padding: '6px 12px',
                    backgroundColor: customAccentColor,
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>Register Now →</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sign-off Section */}
          <div>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Sign-off</h4>
            
            <div style={{ marginBottom: '16px' }}>
              <Checkbox
                id="generic-signoff"
                labelText="Use generic sign-off (IBM UKI Marketing Team)"
                checked={useGenericSignOff}
                onChange={(e) => {
                  setUseGenericSignOff(e.target.checked);
                  if (e.target.checked) {
                    setSenderName('');
                    setSenderTitle('');
                  }
                }}
              />
            </div>

            {!useGenericSignOff && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TextInput
                  id="sender-name"
                  labelText="Your Name (optional)"
                  placeholder="e.g., Sarah Johnson"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  helperText="Leave blank to use 'IBM UKI Marketing Team'"
                />
                <TextInput
                  id="sender-title"
                  labelText="Your Title (optional)"
                  placeholder="e.g., Senior Account Manager"
                  value={senderTitle}
                  onChange={(e) => setSenderTitle(e.target.value)}
                />
              </div>
            )}

            {/* Profile Picture Upload */}
            {!useGenericSignOff && (
              <div style={{ marginTop: '24px' }}>
                <h5 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
                  Profile Picture (Optional)
                </h5>
                <p style={{ marginBottom: '12px', fontSize: '12px', color: '#525252' }}>
                  Upload your photo to personalize the signature. Recommended: Square image, max 500KB
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {profilePicture ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={profilePicture}
                        alt="Profile preview"
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #0f62fe'
                        }}
                      />
                      <Button
                        kind="danger--ghost"
                        size="sm"
                        onClick={handleRemoveProfilePicture}
                        style={{ marginTop: '8px' }}
                      >
                        Remove Picture
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="profile-picture-upload"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleProfilePictureUpload}
                        style={{ display: 'none' }}
                      />
                      <Button
                        kind="tertiary"
                        size="sm"
                        onClick={() => document.getElementById('profile-picture-upload').click()}
                      >
                        Upload Picture
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f4f4f4',
              borderRadius: '4px',
              borderLeft: '4px solid #0f62fe'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#161616' }}>
                <strong>Preview:</strong><br/>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  {!useGenericSignOff && profilePicture && (
                    <img
                      src={profilePicture}
                      alt="Profile preview"
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #0f62fe'
                      }}
                    />
                  )}
                  <div>
                    Best regards,<br/>
                    <strong>{useGenericSignOff
                      ? 'IBM UKI Marketing Team'
                      : senderName.trim() || 'IBM UKI Marketing Team'}</strong>
                    {!useGenericSignOff && senderTitle.trim() && <><br/>{senderTitle.trim()}</>}
                  </div>
                </div>
              </p>
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
          primaryButtonText="Select Event"
          secondaryButtonText="Close"
          onRequestSubmit={() => {
            handleEventSelection(previewEvent.id);
            setPreviewEvent(null);
          }}
          size="lg"
        >
          <div style={{ padding: '16px 0' }}>
            {/* Event Summary */}
            <div style={{ marginBottom: '24px' }}>
              <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Summary</h5>
              <div
                className="event-summary-preview"
                style={{ color: '#525252', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: previewEvent.summary }}
              />
            </div>

            {/* Event Details */}
            <div style={{ marginBottom: '24px' }}>
              <h5 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>Event Details</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} />
                  <span><strong>Date:</strong> {formatDate(previewEvent.date)}{previewEvent.endDate && ` - ${formatDate(previewEvent.endDate)}`}</span>
                </div>
                {previewEvent.time && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Time size={16} />
                    <span><strong>Time:</strong> {formatTime(previewEvent.time)}</span>
                  </div>
                )}
                {previewEvent.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Location size={16} />
                    <span><strong>Location:</strong> {previewEvent.location} ({previewEvent.locationType})</span>
                  </div>
                )}
                {previewEvent.eventType && (
                  <div>
                    <strong>Type:</strong> {getEventTypeLabel(previewEvent.eventType)}
                  </div>
                )}
                {previewEvent.targetAudience && (
                  <div>
                    <strong>Target Audience:</strong> {previewEvent.targetAudience}
                  </div>
                )}
                {previewEvent.industry && (
                  <div>
                    <strong>Industry:</strong> <Tag type="green" size="sm">{previewEvent.industry}</Tag>
                  </div>
                )}
              </div>
            </div>

            {/* Full Description */}
            {previewEvent.description && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Description</h5>
                <div
                  className="event-summary-preview"
                  style={{ color: '#525252', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: previewEvent.description }}
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
                    return area ? (
                      <Tag key={areaId} type="blue" size="md">
                        {area.label}
                      </Tag>
                    ) : null;
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
                    const role = TARGET_ROLES.find(r => r.id === roleId);
                    return role ? (
                      <Tag key={roleId} type="cyan" size="md">
                        {role.label}
                      </Tag>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Registration Link */}
            {previewEvent.registrationLink && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Registration</h5>
                <a
                  href={previewEvent.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#0f62fe',
                    color: '#ffffff',
                    padding: '10px 16px',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontWeight: 500
                  }}
                >
                  Register Now →
                </a>
              </div>
            )}

            {/* Seismic Link */}
            {previewEvent.seismicLink && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Event Details</h5>
                <a
                  href={previewEvent.seismicLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#0f62fe',
                    color: '#ffffff',
                    padding: '10px 16px',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontWeight: 500
                  }}
                >
                  View on Seismic →
                </a>
              </div>
            )}

            {/* Seller Invite Download */}
            {previewEvent.sellerInvite && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Seller Resources</h5>
                <p style={{ fontSize: '12px', color: '#525252', marginBottom: '12px' }}>
                  Download the client invitation document to share with your clients
                </p>
                <Button
                  kind="tertiary"
                  size="md"
                  renderIcon={Document}
                  onClick={() => {
                    // Create a download link from the base64 data
                    const link = document.createElement('a');
                    link.href = previewEvent.sellerInvite.data;
                    link.download = previewEvent.sellerInvite.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Download Seller Invite ({previewEvent.sellerInvite.name})
                </Button>
              </div>
            )}

            {/* Event Agenda */}
            {previewEvent.agenda && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Event Agenda</h5>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f4f4f4',
                  borderRadius: '4px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {previewEvent.agenda}
                </div>
              </div>
            )}

            {/* Event Contacts */}
            {previewEvent.eventContacts && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Event Contacts</h5>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f4f4f4',
                  borderRadius: '4px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {previewEvent.eventContacts}
                </div>
              </div>
            )}

            {/* Post Event Follow-up */}
            {previewEvent.postEventFollowUp && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Post Event Follow-up</h5>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#e8f4ff',
                  borderRadius: '4px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  borderLeft: '4px solid #0f62fe'
                }}>
                  {previewEvent.postEventFollowUp}
                </div>
              </div>
            )}

            {/* Post Event Documents */}
            {previewEvent.postEventDocuments && previewEvent.postEventDocuments.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Post Event Documents</h5>
                <p style={{ fontSize: '12px', color: '#525252', marginBottom: '12px' }}>
                  Download resources and materials from this event
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {previewEvent.postEventDocuments.map((doc, index) => (
                    <Button
                      key={index}
                      kind="tertiary"
                      size="md"
                      renderIcon={Document}
                      onClick={() => {
                        // Create a download link from the base64 data
                        const link = document.createElement('a');
                        link.href = doc.data;
                        link.download = doc.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      style={{ justifyContent: 'flex-start' }}
                    >
                      {doc.name} ({(doc.size / 1024).toFixed(1)} KB)
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EventsTab;

// Made with Bob
