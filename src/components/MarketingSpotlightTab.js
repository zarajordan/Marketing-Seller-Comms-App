import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  Grid,
  Column,
  Tile,
  Tag,
  Button,
  ButtonSet,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  Modal,
  Form,
  Stack,
  Checkbox,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import {
  Star,
  Add,
  TrashCan,
  View,
  Copy,
  Save,
  Reset,
  Edit,
  Download,
  DocumentAdd,
} from '@carbon/icons-react';
import { toast } from 'react-toastify';

const MarketingSpotlightTab = forwardRef((props, ref) => {
  const [month, setMonth] = useState('May');
  const [year, setYear] = useState('2026');
  const [quarter, setQuarter] = useState('Q2');
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(null); // Track which draft is being edited
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [colorScheme, setColorScheme] = useState('ibm-current'); // Color scheme selector
  const [fontFamily, setFontFamily] = useState('ibm-plex'); // Font family selector
  
  // Resource links state
  const [newsLinks, setNewsLinks] = useState([]);
  const [podcastLinks, setPodcastLinks] = useState([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const [editingNewsLink, setEditingNewsLink] = useState(null);
  const [editingPodcastLink, setEditingPodcastLink] = useState(null);
  const [newsLinkForm, setNewsLinkForm] = useState({ title: '', url: '', description: '' });
  const [podcastLinkForm, setPodcastLinkForm] = useState({ title: '', url: '', description: '' });

  // Color scheme configurations
  const colorSchemes = {
    'ibm-current': {
      name: 'IBM Brand Colors (Current)',
      header: '#8a3ffc',
      summaryBg: '#e8f4ff',
      summaryBorder: '#0f62fe',
      featured: '#8a3ffc',
      ibmBg: '#e8f4ff',
      ibmBorder: '#0f62fe',
      ibmColor: '#0f62fe',
      thirdPartyBg: '#f0f7f0',
      thirdPartyBorder: '#198038',
      thirdPartyColor: '#8a3ffc',
      onDemandBg: '#f6f2ff',
      onDemandBorder: '#8a3ffc',
      onDemandColor: '#0072c3',
    },
    'navy-teal': {
      name: 'Professional Navy & Teal',
      header: '#1e3a8a',
      summaryBg: '#dbeafe',
      summaryBorder: '#1e40af',
      featured: '#1e3a8a',
      ibmBg: '#dbeafe',
      ibmBorder: '#1e40af',
      ibmColor: '#1e40af',
      thirdPartyBg: '#ccfbf1',
      thirdPartyBorder: '#0891b2',
      thirdPartyColor: '#0891b2',
      onDemandBg: '#d1fae5',
      onDemandBorder: '#0d9488',
      onDemandColor: '#0d9488',
    },
    'indigo-coral': {
      name: 'Modern Indigo & Coral',
      header: '#4f46e5',
      summaryBg: '#e0e7ff',
      summaryBorder: '#4f46e5',
      featured: '#4f46e5',
      ibmBg: '#e0e7ff',
      ibmBorder: '#4f46e5',
      ibmColor: '#4f46e5',
      thirdPartyBg: '#ffedd5',
      thirdPartyBorder: '#f97316',
      thirdPartyColor: '#f97316',
      onDemandBg: '#fce7f3',
      onDemandBorder: '#ec4899',
      onDemandColor: '#ec4899',
    },
    'charcoal-gold': {
      name: 'Executive Charcoal & Gold',
      header: '#374151',
      summaryBg: '#fef3c7',
      summaryBorder: '#d97706',
      featured: '#374151',
      ibmBg: '#f3f4f6',
      ibmBorder: '#1f2937',
      ibmColor: '#1f2937',
      thirdPartyBg: '#fef3c7',
      thirdPartyBorder: '#d97706',
      thirdPartyColor: '#d97706',
      onDemandBg: '#cffafe',
      onDemandBorder: '#0891b2',
      onDemandColor: '#0891b2',
    },
    'ibm-official': {
      name: 'Official IBM Brand Colors',
      header: '#0530AD',
      summaryBg: '#e6eeff',
      summaryBorder: '#0530AD',
      featured: '#0530AD',
      ibmBg: '#e6eeff',
      ibmBorder: '#0530AD',
      ibmColor: '#0530AD',
      thirdPartyBg: '#f5f5f5',
      thirdPartyBorder: '#000000',
      thirdPartyColor: '#000000',
      onDemandBg: '#e6eeff',
      onDemandBorder: '#0530AD',
      onDemandColor: '#0530AD',
    },
  };

  // Font family configurations
  const fontFamilies = {
    'ibm-plex': {
      name: 'IBM Plex Sans',
      family: "'IBM Plex Sans', Arial, sans-serif",
      googleFont: 'IBM+Plex+Sans:wght@400;600'
    },
    'inter': {
      name: 'Inter',
      family: "'Inter', Arial, sans-serif",
      googleFont: 'Inter:wght@400;600'
    },
    'roboto': {
      name: 'Roboto',
      family: "'Roboto', Arial, sans-serif",
      googleFont: 'Roboto:wght@400;700'
    },
    'open-sans': {
      name: 'Open Sans',
      family: "'Open Sans', Arial, sans-serif",
      googleFont: 'Open+Sans:wght@400;600'
    },
    'lato': {
      name: 'Lato',
      family: "'Lato', Arial, sans-serif",
      googleFont: 'Lato:wght@400;700'
    },
    'montserrat': {
      name: 'Montserrat',
      family: "'Montserrat', Arial, sans-serif",
      googleFont: 'Montserrat:wght@400;600'
    },
  };

  const currentColors = colorSchemes[colorScheme];
  const currentFont = fontFamilies[fontFamily];

  // Form state for adding/editing events
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    location: '',
    audience: '',
    category: 'ibm',
    featured: false,
    registrationLink: '',
    seismicLink: '',
  });

  const resetEventForm = () => {
    setEventForm({
      title: '',
      date: '',
      location: '',
      audience: '',
      category: 'ibm',
      featured: false,
      registrationLink: '',
      seismicLink: '',
    });
    setEditingEvent(null);
  };

  const handleAddEvent = () => {
    if (!eventForm.title || !eventForm.date) {
      toast.error('Please fill in at least the title and date');
      return;
    }

    if (editingEvent !== null) {
      // Update existing event
      const updatedEvents = [...events];
      updatedEvents[editingEvent] = { ...eventForm, id: Date.now() };
      setEvents(updatedEvents);
      toast.success('Event updated successfully');
    } else {
      // Add new event
      setEvents([...events, { ...eventForm, id: Date.now() }]);
      toast.success('Event added successfully');
    }

    resetEventForm();
    setShowAddModal(false);
  };

  const handleEditEvent = (index) => {
    setEventForm(events[index]);
    setEditingEvent(index);
    setShowAddModal(true);
  };

  const handleDeleteEvent = (index) => {
    const updatedEvents = events.filter((_, i) => i !== index);
    setEvents(updatedEvents);
    toast.success('Event deleted');
  };

  // Resource Links Handlers
  const handleAddNewsLink = () => {
    if (!newsLinkForm.title || !newsLinkForm.url) {
      toast.error('Please enter both title and URL');
      return;
    }

    if (editingNewsLink !== null) {
      // Update existing link
      const updatedLinks = [...newsLinks];
      updatedLinks[editingNewsLink] = {
        id: newsLinks[editingNewsLink].id,
        ...newsLinkForm
      };
      setNewsLinks(updatedLinks);
      toast.success('News link updated');
    } else {
      // Add new link
      const newLink = {
        id: Date.now(),
        ...newsLinkForm
      };
      setNewsLinks([...newsLinks, newLink]);
      toast.success('News link added');
    }

    setNewsLinkForm({ title: '', url: '', description: '' });
    setEditingNewsLink(null);
    setShowNewsModal(false);
  };

  const handleEditNewsLink = (index) => {
    setNewsLinkForm(newsLinks[index]);
    setEditingNewsLink(index);
    setShowNewsModal(true);
  };

  const handleDeleteNewsLink = (index) => {
    const updatedLinks = newsLinks.filter((_, i) => i !== index);
    setNewsLinks(updatedLinks);
    toast.success('News link deleted');
  };

  const handleMoveNewsLink = (index, direction) => {
    const newLinks = [...newsLinks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    setNewsLinks(newLinks);
  };

  const handleAddPodcastLink = () => {
    if (!podcastLinkForm.title || !podcastLinkForm.url) {
      toast.error('Please enter both title and URL');
      return;
    }

    if (editingPodcastLink !== null) {
      // Update existing link
      const updatedLinks = [...podcastLinks];
      updatedLinks[editingPodcastLink] = {
        id: podcastLinks[editingPodcastLink].id,
        ...podcastLinkForm
      };
      setPodcastLinks(updatedLinks);
      toast.success('Podcast link updated');
    } else {
      // Add new link
      const newLink = {
        id: Date.now(),
        ...podcastLinkForm
      };
      setPodcastLinks([...podcastLinks, newLink]);
      toast.success('Podcast link added');
    }

    setPodcastLinkForm({ title: '', url: '', description: '' });
    setEditingPodcastLink(null);
    setShowPodcastModal(false);
  };

  const handleEditPodcastLink = (index) => {
    setPodcastLinkForm(podcastLinks[index]);
    setEditingPodcastLink(index);
    setShowPodcastModal(true);
  };

  const handleDeletePodcastLink = (index) => {
    const updatedLinks = podcastLinks.filter((_, i) => i !== index);
    setPodcastLinks(updatedLinks);
    toast.success('Podcast link deleted');
  };

  const handleMovePodcastLink = (index, direction) => {
    const newLinks = [...podcastLinks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    setPodcastLinks(newLinks);
  };

  const handleOpenSaveDraftModal = () => {
    if (events.length === 0) {
      toast.error('Please add at least one event before saving');
      return;
    }
    // Set default name
    setDraftName(`${month} ${year} Marketing Spotlight`);
    setShowSaveDraftModal(true);
  };

  const handleSaveToDrafts = () => {
    if (!draftName.trim()) {
      toast.error('Please enter a name for the draft');
      return;
    }

    // Get existing drafts
    const existingDrafts = JSON.parse(localStorage.getItem('comms_drafts') || '[]');
    
    // Create new draft matching DraftsTab expected structure
    const newDraft = {
      id: Date.now(),
      name: draftName.trim(),
      date: new Date().toISOString(),
      data: {
        title: draftName.trim(),
        type: 'Marketing Spotlight',
        month,
        year,
        quarter,
        events,
        eventCount: events.length,
        newsLinks,
        podcastLinks,
        content: generateEmailHTML(),
      }
    };
    
    // Add to drafts
    existingDrafts.push(newDraft);
    localStorage.setItem('comms_drafts', JSON.stringify(existingDrafts));
    
    // Set current draft ID so we can update it later
    setCurrentDraftId(newDraft.id);
    
    // Dispatch custom event to notify DraftsTab
    window.dispatchEvent(new Event('draftsUpdated'));
    
    setShowSaveDraftModal(false);
    setDraftName('');
    toast.success(`✅ Saved to Drafts: ${newDraft.name}`);
  };

  const handleUpdateDraft = () => {
    if (events.length === 0) {
      toast.error('Please add at least one event before updating');
      return;
    }

    if (!currentDraftId) {
      toast.error('No draft to update. Please save as new draft first.');
      return;
    }

    // Get existing drafts
    const existingDrafts = JSON.parse(localStorage.getItem('comms_drafts') || '[]');
    
    // Find and update the current draft
    const draftIndex = existingDrafts.findIndex(d => d.id === currentDraftId);
    
    if (draftIndex === -1) {
      toast.error('Draft not found. Saving as new draft instead.');
      handleSaveToDrafts();
      return;
    }

    // Get the existing draft to preserve its name
    const existingDraft = existingDrafts[draftIndex];

    // Update the draft, preserving the original name
    existingDrafts[draftIndex] = {
      id: currentDraftId,
      name: existingDraft.name, // Preserve original name
      date: new Date().toISOString(),
      data: {
        title: existingDraft.name, // Use the preserved name
        type: 'Marketing Spotlight',
        month,
        year,
        quarter,
        events,
        eventCount: events.length,
        newsLinks,
        podcastLinks,
        content: generateEmailHTML(),
      }
    };
    
    localStorage.setItem('comms_drafts', JSON.stringify(existingDrafts));
    
    // Dispatch custom event to notify DraftsTab
    window.dispatchEvent(new Event('draftsUpdated'));
    
    toast.success(`✅ Updated Draft: ${existingDraft.name}`);
  };

  const handleSaveQuickDraft = () => {
    const draft = {
      month,
      year,
      quarter,
      events,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('marketingSpotlightQuickDraft', JSON.stringify(draft));
    toast.success('Quick draft saved!');
  };

  const handleLoadQuickDraft = () => {
    const saved = localStorage.getItem('marketingSpotlightQuickDraft');
    if (saved) {
      const draft = JSON.parse(saved);
      setMonth(draft.month);
      setYear(draft.year);
      setQuarter(draft.quarter);
      setEvents(draft.events || []);
      toast.success('Quick draft loaded!');
    } else {
      toast.info('No quick draft found');
    }
  };

  const handleExportHTML = () => {
    if (events.length === 0) {
      toast.error('Please add at least one event before exporting');
      return;
    }

    const html = generateEmailHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Marketing-Spotlight-${month}-${year}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`📥 Downloaded: Marketing-Spotlight-${month}-${year}.html`);
  };

  const handleReset = () => {
    setMonth('May');
    setYear('2026');
    setQuarter('Q2');
    setEvents([]);
    toast.info('Form reset');
  };

  // Expose loadDraft method to parent component
  useImperativeHandle(ref, () => ({
    loadDraft: (draftData, draftId) => {
      setMonth(draftData.month || 'May');
      setYear(draftData.year || '2026');
      setQuarter(draftData.quarter || 'Q2');
      setEvents(draftData.events || []);
      setNewsLinks(draftData.newsLinks || []);
      setPodcastLinks(draftData.podcastLinks || []);
      setCurrentDraftId(draftId || null); // Track the draft ID for updates
      toast.success('Draft loaded successfully!');
    }
  }));

  const generateEmailHTML = () => {
    // Get featured events from ALL categories first
    const featuredEvents = events.filter(e => e.featured).slice(0, 3); // Show up to 3 featured events
    
    // Filter by category - featured events will appear in BOTH featured section AND their category section
    const ibmEvents = events.filter(e => e.category === 'ibm');
    const thirdPartyEvents = events.filter(e => e.category === 'thirdParty');
    const onDemandEvents = events.filter(e => e.category === 'onDemand');

    // Helper function to generate two-column event grid
    const generateTwoColumnGrid = (eventsList, borderColor, categoryLabel, categoryColor) => {
      if (eventsList.length === 0) return '';
      
      let html = '<table width="100%" cellpadding="0" cellspacing="0" border="0" class="two-column-table">';
      
      for (let i = 0; i < eventsList.length; i += 2) {
        const event1 = eventsList[i];
        const event2 = eventsList[i + 1];
        
        html += '<tr>';
        
        // First column
        html += `
          <td width="48%" valign="top" style="padding-right: 8px; padding-bottom: 10px;" class="column-cell">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-left: 3px solid ${borderColor}; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);" class="event-card">
              <tr>
                <td style="padding: 10px;">
                  <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #161616; font-family: ${currentFont.family}, Arial, sans-serif; line-height: 1.3; font-weight: 700;">
                    ${event1.title}
                  </h4>
                  <p style="margin: 0 0 3px 0; font-size: 10px; color: #525252; font-weight: 600;">
                    📅 ${event1.date}
                  </p>
                  <p style="margin: 0 0 8px 0; font-size: 10px; color: #525252;">
                    📍 ${event1.location}
                  </p>
                  ${event1.audience ? `
                  <p style="margin: 0 0 8px 0; font-size: 11px; color: #393939; line-height: 1.3; border-top: 1px solid #e0e0e0; padding-top: 8px;">
                    ${event1.audience}
                  </p>
                  ` : ''}
                  ${(event1.registrationLink || event1.seismicLink) ? `
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 8px;">
                    <tr>
                      ${event1.registrationLink ? `
                      <td style="padding-right: 5px; padding-bottom: 4px;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td bgcolor="${currentColors.ibmBorder}" style="border-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                              <a href="${event1.registrationLink}" style="color: #ffffff; padding: 5px 10px; text-decoration: none; font-size: 10px; font-weight: 700; display: block; letter-spacing: 0.2px;">
                                Register
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      ` : ''}
                      ${event1.seismicLink ? `
                      <td style="padding-bottom: 4px;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td bgcolor="${currentColors.featured}" style="border-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                              <a href="${event1.seismicLink}" style="color: #ffffff; padding: 5px 10px; text-decoration: none; font-size: 10px; font-weight: 700; display: block; letter-spacing: 0.2px;">
                                Seismic
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                      ` : ''}
                    </tr>
                  </table>
                  ` : ''}
                </td>
              </tr>
            </table>
          </td>
        `;
        
        // Second column (if exists)
        if (event2) {
          html += `
            <td width="48%" valign="top" style="padding-left: 8px; padding-bottom: 10px;" class="column-cell">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-left: 3px solid ${borderColor}; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);" class="event-card">
                <tr>
                  <td style="padding: 10px;">
                    <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #161616; font-family: ${currentFont.family}, Arial, sans-serif; line-height: 1.3; font-weight: 700;">
                      ${event2.title}
                    </h4>
                    <p style="margin: 0 0 3px 0; font-size: 10px; color: #525252; font-weight: 600;">
                      📅 ${event2.date}
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 10px; color: #525252;">
                      📍 ${event2.location}
                    </p>
                    ${event2.audience ? `
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #393939; line-height: 1.3; border-top: 1px solid #e0e0e0; padding-top: 8px;">
                      ${event2.audience}
                    </p>
                    ` : ''}
                    ${(event2.registrationLink || event2.seismicLink) ? `
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 8px;">
                      <tr>
                        ${event2.registrationLink ? `
                        <td style="padding-right: 5px; padding-bottom: 4px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td bgcolor="${currentColors.ibmBorder}" style="border-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                                <a href="${event2.registrationLink}" style="color: #ffffff; padding: 5px 10px; text-decoration: none; font-size: 10px; font-weight: 700; display: block; letter-spacing: 0.2px;">
                                  Register
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                        ` : ''}
                        ${event2.seismicLink ? `
                        <td style="padding-bottom: 4px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td bgcolor="${currentColors.featured}" style="border-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                                <a href="${event2.seismicLink}" style="color: #ffffff; padding: 5px 10px; text-decoration: none; font-size: 10px; font-weight: 700; display: block; letter-spacing: 0.2px;">
                                  Seismic
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                        ` : ''}
                      </tr>
                    </table>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          `;
        } else {
          // Empty cell for alignment
          html += '<td width="48%" valign="top" style="padding-left: 8px;" class="column-cell"></td>';
        }
        
        html += '</tr>';
      }
      
      html += '</table>';
      return html;
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>UKI Marketing Spotlight - ${month} ${year}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    
    @media only screen and (max-width: 600px) {
      .two-column-table { width: 100% !important; }
      .column-cell {
        display: block !important;
        width: 100% !important;
        padding: 0 0 12px 0 !important;
      }
      .event-card { margin-bottom: 12px !important; }
      .mobile-padding { padding: 15px !important; }
      .mobile-text { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: ${currentFont.family}, Arial, sans-serif;">
  
  <!-- Preheader Text (Hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${month} ${year} Marketing Spotlight - Don't miss what's coming up in ${quarter}
  </div>
  
  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4" style="padding: 20px 0;">
    <tr>
      <td align="center" style="padding: 0;">
        
        <!-- Email Content Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width: 600px; width: 100%; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header Section -->
          <tr>
            <td bgcolor="${currentColors.header}" style="padding: 20px 15px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <div style="font-size: 12px; margin-bottom: 6px; color: rgba(255,255,255,0.9); font-weight: 500; letter-spacing: 0.5px;">
                      ${month} ${year}
                    </div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.2; font-family: ${currentFont.family}, Arial, sans-serif;">
                      UKI Marketing Spotlight
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.95); font-weight: 400; line-height: 1.3;">
                      Don't miss what's coming up in ${quarter}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quick Summary Section -->
          <tr>
            <td bgcolor="${currentColors.summaryBg}" style="padding: 15px; border-bottom: 2px solid ${currentColors.summaryBorder};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" align="center" valign="top" style="padding: 8px 5px;">
                    <div style="font-size: 24px; font-weight: 700; color: ${currentColors.ibmColor}; line-height: 1; margin-bottom: 6px;">
                      ${ibmEvents.length}
                    </div>
                    <div style="font-size: 10px; color: #525252; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      IBM Events
                    </div>
                  </td>
                  <td width="33%" align="center" valign="top" style="padding: 8px 5px; border-left: 1px solid rgba(0,0,0,0.1); border-right: 1px solid rgba(0,0,0,0.1);">
                    <div style="font-size: 24px; font-weight: 700; color: ${currentColors.thirdPartyColor}; line-height: 1; margin-bottom: 6px;">
                      ${thirdPartyEvents.length}
                    </div>
                    <div style="font-size: 10px; color: #525252; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      3rd Party
                    </div>
                  </td>
                  <td width="33%" align="center" valign="top" style="padding: 8px 5px;">
                    <div style="font-size: 24px; font-weight: 700; color: ${currentColors.onDemandColor}; line-height: 1; margin-bottom: 6px;">
                      ${onDemandEvents.length}
                    </div>
                    <div style="font-size: 10px; color: #525252; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      On-Demand
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- View Calendar Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td bgcolor="${currentColors.ibmBorder}" style="border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                          <a href="https://ibm.seismic.com/apps/doccenter/861ea1fd-99e0-44d7-9135-85412e5c28d1/doc/%2Fdd3359e5f7-a856-a91b-7688-41024b2ac637%2FdfNTY4NmVhOWItY2RkNS04ZWY3LTZkNzItZTQwZjczMWUyMjk1,PT0=,Q3Jvc3MgQnJhbmQ=%2FdfNDRmODBlMzMtY2ViMC0zMDI1LTVhNDEtNzg2OTg4MWVmZDBl,Others%2FdfOTRiYmU4NTQtNWY4NC03Y2QyLWZjYWUtOGIxYmFmZjkyZThk,PT0=,RXZlbnQ=%2Flf4eacf404-6c5d-4bab-b9fb-210600acd4f8/grid/?anchorId=1457083b-03ad-43dc-b9e3-98419ca9ab2d"
                             style="color: #ffffff; padding: 7px 16px; text-decoration: none; font-size: 11px; font-weight: 600; display: block; letter-spacing: 0.3px;">
                            View Full Calendar
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Intro Text -->
          <tr>
            <td style="padding: 15px 20px; background-color: #fafafa; border-bottom: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #393939; line-height: 1.5; font-size: 12px; text-align: center;">
                Please see below for the latest update on all upcoming events you can use to drive client engagement, deepen relationships and open new opportunities.
              </p>
            </td>
          </tr>

    ${featuredEvents.length > 0 ? `
    <!-- Featured Events Section -->
    <tr>
      <td style="padding: 15px 15px 10px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.featured}" style="border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: #ffffff; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                ⭐ Featured Events
              </h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="three-column-table">
          <tr>
            ${featuredEvents.map((event, index) => {
              // Determine category label and color
              let categoryLabel = 'IBM Event';
              let categoryColor = currentColors.ibmBorder;
              let borderColor = currentColors.ibmBorder;
              
              if (event.category === 'thirdParty') {
                categoryLabel = '3rd Party Event';
                categoryColor = currentColors.thirdPartyBorder;
                borderColor = currentColors.thirdPartyBorder;
              } else if (event.category === 'onDemand') {
                categoryLabel = 'On-Demand';
                categoryColor = currentColors.onDemandBorder;
                borderColor = currentColors.onDemandBorder;
              }
              
              const paddingStyle = index === 0 ? 'padding-right: 5px; padding-bottom: 10px;' :
                                   index === 1 ? 'padding-left: 5px; padding-right: 5px; padding-bottom: 10px;' :
                                   'padding-left: 5px; padding-bottom: 10px;';
              
              return `
            <td width="33%" valign="top" style="${paddingStyle}" class="column-cell">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-left: 3px solid ${borderColor}; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);" class="event-card">
                <tr>
                  <td style="padding: 10px;">
                    <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #161616; font-family: ${currentFont.family}, Arial, sans-serif; line-height: 1.3; font-weight: 700;">
                      ${event.title}
                    </h4>
                    <p style="margin: 0 0 3px 0; font-size: 10px; color: #525252; font-weight: 600;">
                      📅 ${event.date}
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 10px; color: #525252;">
                      📍 ${event.location}
                    </p>
                    ${event.audience ? `
                    <p style="margin: 0 0 8px 0; font-size: 11px; color: #393939; line-height: 1.3; border-top: 1px solid #e0e0e0; padding-top: 8px;">
                      ${event.audience}
                    </p>
                    ` : ''}
                    ${(event.registrationLink || event.seismicLink) ? `
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 8px;">
                      <tr>
                        ${event.registrationLink ? `
                        <td style="padding-right: 5px; padding-bottom: 4px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td bgcolor="${currentColors.ibmBorder}" style="border-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                                <a href="${event.registrationLink}" style="color: #ffffff; padding: 5px 10px; text-decoration: none; font-size: 10px; font-weight: 700; display: block; letter-spacing: 0.2px;">
                                  Register
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                        ` : ''}
                        ${event.seismicLink ? `
                        <td style="padding-bottom: 4px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td bgcolor="${currentColors.featured}" style="border-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                                <a href="${event.seismicLink}" style="color: #ffffff; padding: 5px 10px; text-decoration: none; font-size: 10px; font-weight: 700; display: block; letter-spacing: 0.2px;">
                                  Seismic
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                        ` : ''}
                      </tr>
                    </table>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
            `;
            }).join('')}
          </tr>
        </table>
      </td>
    </tr>
    ` : ''}

    ${ibmEvents.filter(e => !e.featured).length > 0 ? `
    <!-- IBM Events Section -->
    <tr>
      <td style="padding: 15px 15px 10px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.ibmBg}" style="border-radius: 4px; border-left: 3px solid ${currentColors.ibmBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: #161616; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                📅 IBM Events
              </h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        ${generateTwoColumnGrid(
          ibmEvents.filter(e => !e.featured),
          currentColors.ibmBorder,
          'IBM Event',
          currentColors.ibmBorder
        )}
      </td>
    </tr>
    ` : ''}

    ${thirdPartyEvents.length > 0 ? `
    <!-- 3rd Party Events Section -->
    <tr>
      <td style="padding: 15px 15px 10px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.thirdPartyBg}" style="border-radius: 4px; border-left: 3px solid ${currentColors.thirdPartyBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: #161616; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                🤝 3rd Party Events
              </h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        ${generateTwoColumnGrid(
          thirdPartyEvents,
          currentColors.thirdPartyBorder,
          '3rd Party',
          currentColors.thirdPartyBorder
        )}
      </td>
    </tr>
    ` : ''}

    ${onDemandEvents.length > 0 ? `
    <!-- On-Demand Section -->
    <tr>
      <td style="padding: 15px 15px 10px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.onDemandBg}" style="border-radius: 4px; border-left: 3px solid ${currentColors.onDemandBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: #161616; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                💻 On-Demand Webinars
              </h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        ${generateTwoColumnGrid(
          onDemandEvents,
          currentColors.onDemandBorder,
          'Webinar',
          currentColors.onDemandBorder
        )}
      </td>
    </tr>
    ` : ''}

    ${newsLinks.length > 0 ? `
    <!-- News & Thought Leadership Section -->
    <tr>
      <td style="padding: 15px 15px 10px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#e8f4ff" style="border-radius: 4px; border-left: 3px solid ${currentColors.ibmBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: #161616; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                📰 News & Thought Leadership
              </h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius: 4px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 12px;">
              ${newsLinks.map((link, index) => `
                <div style="margin-bottom: ${index < newsLinks.length - 1 ? '10px' : '0'}; padding-bottom: ${index < newsLinks.length - 1 ? '10px' : '0'}; ${index < newsLinks.length - 1 ? 'border-bottom: 1px solid #f4f4f4;' : ''}">
                  <a href="${link.url}" style="color: ${currentColors.ibmBorder}; text-decoration: none; font-weight: 700; font-size: 13px; display: block; margin-bottom: 4px; line-height: 1.3;">
                    ${link.title}
                  </a>
                  ${link.description ? `
                  <p style="margin: 0; font-size: 11px; color: #525252; line-height: 1.4;">
                    ${link.description}
                  </p>
                  ` : ''}
                </div>
              `).join('')}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ` : ''}

    ${podcastLinks.length > 0 ? `
    <!-- Podcasts & Webinars Section -->
    <tr>
      <td style="padding: 15px 15px 10px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f6f2ff" style="border-radius: 4px; border-left: 3px solid ${currentColors.featured}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: #161616; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                🎙️ Podcasts & Webinars
              </h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius: 4px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 12px;">
              ${podcastLinks.map((link, index) => `
                <div style="margin-bottom: ${index < podcastLinks.length - 1 ? '10px' : '0'}; padding-bottom: ${index < podcastLinks.length - 1 ? '10px' : '0'}; ${index < podcastLinks.length - 1 ? 'border-bottom: 1px solid #f4f4f4;' : ''}">
                  <a href="${link.url}" style="color: ${currentColors.featured}; text-decoration: none; font-weight: 700; font-size: 13px; display: block; margin-bottom: 4px; line-height: 1.3;">
                    ${link.title}
                  </a>
                  ${link.description ? `
                  <p style="margin: 0; font-size: 11px; color: #525252; line-height: 1.4;">
                    ${link.description}
                  </p>
                  ` : ''}
                </div>
              `).join('')}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ` : ''}

    <!-- Footer -->
    <tr>
      <td style="background: linear-gradient(135deg, #0f62fe 0%, #0043ce 100%); padding: 20px 15px; text-align: center; border-top: 3px solid ${currentColors.header};">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #ffffff; font-weight: 600;">
          Questions? Contact the UKI Marketing Team
        </p>
        <p style="margin: 0; font-size: 11px; color: #d0e2ff; line-height: 1.4;">
          © ${year} IBM Corporation. All rights reserved.
        </p>
      </td>
    </tr>

        </table>
        <!-- Email Content Ends Here -->
      </td>
    </tr>
  </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  };

  const handlePreview = () => {
    const html = generateEmailHTML();
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(html);
    previewWindow.document.close();
  };

  const handleCopyHTML = () => {
    const html = generateEmailHTML();
    navigator.clipboard.writeText(html).then(() => {
      toast.success('✨ Email HTML copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const ibmEvents = events.filter(e => e.category === 'ibm');
  const thirdPartyEvents = events.filter(e => e.category === 'thirdParty');
  const onDemandEvents = events.filter(e => e.category === 'onDemand');

  return (
    <div className="marketing-spotlight-tab">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Star size={24} />
          ✨ Marketing Spotlight Email Builder
        </h2>
        <p style={{ color: '#525252', marginTop: '0.5rem' }}>
          Create your monthly Marketing Spotlight email with Quick Summary, Featured Events, and collapsible sections.
        </p>
      </div>

      <Grid>
        {/* Email Settings */}
        <Column lg={16}>
          <Tile style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>📧 Email Settings</h3>
            <Grid>
              <Column lg={5} md={4} sm={4}>
                <Select
                  id="month"
                  labelText="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <SelectItem value="January" text="January" />
                  <SelectItem value="February" text="February" />
                  <SelectItem value="March" text="March" />
                  <SelectItem value="April" text="April" />
                  <SelectItem value="May" text="May" />
                  <SelectItem value="June" text="June" />
                  <SelectItem value="July" text="July" />
                  <SelectItem value="August" text="August" />
                  <SelectItem value="September" text="September" />
                  <SelectItem value="October" text="October" />
                  <SelectItem value="November" text="November" />
                  <SelectItem value="December" text="December" />
                </Select>
              </Column>
              <Column lg={5} md={4} sm={4}>
                <TextInput
                  id="year"
                  labelText="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </Column>
              <Column lg={6} md={4} sm={4}>
                <Select
                  id="quarter"
                  labelText="Quarter"
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                >
                  <SelectItem value="Q1" text="Q1 (Jan-Mar)" />
                  <SelectItem value="Q2" text="Q2 (Apr-Jun)" />
                  <SelectItem value="Q3" text="Q3 (Jul-Sep)" />
                  <SelectItem value="Q4" text="Q4 (Oct-Dec)" />
                </Select>
              </Column>
            </Grid>
            <Grid style={{ marginTop: '1rem' }}>
              <Column lg={8} md={4} sm={4}>
                <Select
                  id="colorScheme"
                  labelText="🎨 Color Scheme"
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                >
                  <SelectItem value="ibm-current" text="IBM Brand Colors (Current)" />
                  <SelectItem value="navy-teal" text="Professional Navy & Teal" />
                  <SelectItem value="indigo-coral" text="Modern Indigo & Coral" />
                  <SelectItem value="charcoal-gold" text="Executive Charcoal & Gold" />
                  <SelectItem value="ibm-official" text="Official IBM Brand Colors" />
                </Select>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <Select
                  id="fontFamily"
                  labelText="✍️ Font Family"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                >
                  <SelectItem value="ibm-plex" text="IBM Plex Sans" />
                  <SelectItem value="inter" text="Inter" />
                  <SelectItem value="roboto" text="Roboto" />
                  <SelectItem value="open-sans" text="Open Sans" />
                  <SelectItem value="lato" text="Lato" />
                  <SelectItem value="montserrat" text="Montserrat" />
                </Select>
              </Column>
            </Grid>
          </Tile>
        </Column>

        {/* Event Summary */}
        <Column lg={16}>
          <Tile style={{ marginBottom: '1rem', padding: '1.5rem', background: currentColors.summaryBg }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: currentColors.ibmColor }}>{ibmEvents.length}</div>
                <div style={{ fontSize: '14px', color: '#525252' }}>IBM Events</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: currentColors.thirdPartyColor }}>{thirdPartyEvents.length}</div>
                <div style={{ fontSize: '14px', color: '#525252' }}>3rd Party Events</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: currentColors.onDemandColor }}>{onDemandEvents.length}</div>
                <div style={{ fontSize: '14px', color: '#525252' }}>On-Demand Resources</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#fdd13a' }}>{events.filter(e => e.featured).length}</div>
                <div style={{ fontSize: '14px', color: '#525252' }}>Featured Events</div>
              </div>
            </div>
          </Tile>
        </Column>

        {/* Events List */}
        <Column lg={16}>
          <Tile style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>📅 Events ({events.length})</h3>
              <Button
                kind="primary"
                renderIcon={Add}
                onClick={() => setShowAddModal(true)}
              >
                Add Event
              </Button>
            </div>

            {events.length === 0 ? (
              <p style={{ color: '#525252', textAlign: 'center', padding: '2rem 0' }}>
                No events added yet. Click "Add Event" to get started.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    style={{
                      padding: '1rem',
                      background: '#f4f4f4',
                      borderRadius: '4px',
                      borderLeft: `4px solid ${
                        event.category === 'ibm' ? currentColors.ibmBorder :
                        event.category === 'thirdParty' ? currentColors.thirdPartyBorder : currentColors.onDemandBorder
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <Tag type={event.category === 'ibm' ? 'blue' : event.category === 'thirdParty' ? 'purple' : 'cyan'} size="sm">
                            {event.category === 'ibm' ? 'IBM Event' : event.category === 'thirdParty' ? '3rd Party' : 'On-Demand'}
                          </Tag>
                          {event.featured && <Tag type="red" size="sm">⭐ Featured</Tag>}
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '16px' }}>{event.title}</h4>
                        <p style={{ margin: '0.25rem 0', fontSize: '14px', color: '#525252' }}>
                          📆 {event.date} {event.location && `• 📍 ${event.location}`}
                        </p>
                        {event.audience && (
                          <p style={{ margin: '0.25rem 0', fontSize: '14px', color: '#525252' }}>
                            👥 {event.audience}
                          </p>
                        )}
                      </div>
                      <ButtonSet>
                        <Button
                          kind="ghost"
                          size="sm"
                          renderIcon={Edit}
                          iconDescription="Edit"
                          hasIconOnly
                          onClick={() => handleEditEvent(index)}
                        />
                        <Button
                          kind="danger--ghost"
                          size="sm"
                          renderIcon={TrashCan}
                          iconDescription="Delete"
                          hasIconOnly
                          onClick={() => handleDeleteEvent(index)}
                        />
                      </ButtonSet>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tile>
        </Column>

        {/* News & Thought Leadership Links */}
        <Column lg={16}>
          <Tile style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>📰 News & Thought Leadership ({newsLinks.length})</h3>
              <Button
                kind="primary"
                size="sm"
                renderIcon={Add}
                onClick={() => {
                  setNewsLinkForm({ title: '', url: '', description: '' });
                  setEditingNewsLink(null);
                  setShowNewsModal(true);
                }}
              >
                Add Link
              </Button>
            </div>

            {newsLinks.length === 0 ? (
              <p style={{ color: '#525252', textAlign: 'center', padding: '1rem 0' }}>
                No news links added yet. These will appear at the bottom of your communication.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {newsLinks.map((link, index) => (
                  <div
                    key={link.id}
                    style={{
                      padding: '0.75rem',
                      background: '#f4f4f4',
                      borderRadius: '4px',
                      borderLeft: `4px solid ${currentColors.ibmBorder}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '14px' }}>{link.title}</h4>
                        <p style={{ margin: '0.25rem 0', fontSize: '12px', color: '#0f62fe', wordBreak: 'break-all' }}>
                          {link.url}
                        </p>
                        {link.description && (
                          <p style={{ margin: '0.25rem 0', fontSize: '12px', color: '#525252' }}>
                            {link.description}
                          </p>
                        )}
                      </div>
                      <ButtonSet>
                        <Button
                          kind="ghost"
                          size="sm"
                          renderIcon={Edit}
                          iconDescription="Edit"
                          hasIconOnly
                          onClick={() => handleEditNewsLink(index)}
                        />
                        <Button
                          kind="ghost"
                          size="sm"
                          iconDescription="Move up"
                          hasIconOnly
                          disabled={index === 0}
                          onClick={() => handleMoveNewsLink(index, 'up')}
                        >
                          ↑
                        </Button>
                        <Button
                          kind="ghost"
                          size="sm"
                          iconDescription="Move down"
                          hasIconOnly
                          disabled={index === newsLinks.length - 1}
                          onClick={() => handleMoveNewsLink(index, 'down')}
                        >
                          ↓
                        </Button>
                        <Button
                          kind="danger--ghost"
                          size="sm"
                          renderIcon={TrashCan}
                          iconDescription="Delete"
                          hasIconOnly
                          onClick={() => handleDeleteNewsLink(index)}
                        />
                      </ButtonSet>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tile>
        </Column>

        {/* Podcasts & Webinars Links */}
        <Column lg={16}>
          <Tile style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>🎙️ Podcasts & Webinars ({podcastLinks.length})</h3>
              <Button
                kind="primary"
                size="sm"
                renderIcon={Add}
                onClick={() => {
                  setPodcastLinkForm({ title: '', url: '', description: '' });
                  setEditingPodcastLink(null);
                  setShowPodcastModal(true);
                }}
              >
                Add Link
              </Button>
            </div>

            {podcastLinks.length === 0 ? (
              <p style={{ color: '#525252', textAlign: 'center', padding: '1rem 0' }}>
                No podcast/webinar links added yet. These will appear at the bottom of your communication.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {podcastLinks.map((link, index) => (
                  <div
                    key={link.id}
                    style={{
                      padding: '0.75rem',
                      background: '#f4f4f4',
                      borderRadius: '4px',
                      borderLeft: `4px solid ${currentColors.featured}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '14px' }}>{link.title}</h4>
                        <p style={{ margin: '0.25rem 0', fontSize: '12px', color: '#8a3ffc', wordBreak: 'break-all' }}>
                          {link.url}
                        </p>
                        {link.description && (
                          <p style={{ margin: '0.25rem 0', fontSize: '12px', color: '#525252' }}>
                            {link.description}
                          </p>
                        )}
                      </div>
                      <ButtonSet>
                        <Button
                          kind="ghost"
                          size="sm"
                          renderIcon={Edit}
                          iconDescription="Edit"
                          hasIconOnly
                          onClick={() => handleEditPodcastLink(index)}
                        />
                        <Button
                          kind="ghost"
                          size="sm"
                          iconDescription="Move up"
                          hasIconOnly
                          disabled={index === 0}
                          onClick={() => handleMovePodcastLink(index, 'up')}
                        >
                          ↑
                        </Button>
                        <Button
                          kind="ghost"
                          size="sm"
                          iconDescription="Move down"
                          hasIconOnly
                          disabled={index === podcastLinks.length - 1}
                          onClick={() => handleMovePodcastLink(index, 'down')}
                        >
                          ↓
                        </Button>
                        <Button
                          kind="danger--ghost"
                          size="sm"
                          renderIcon={TrashCan}
                          iconDescription="Delete"
                          hasIconOnly
                          onClick={() => handleDeletePodcastLink(index)}
                        />
                      </ButtonSet>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tile>
        </Column>

        {/* Actions */}
        <Column lg={16}>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: '600' }}>Quick Actions</h4>
            <ButtonSet>
              <Button
                kind="secondary"
                renderIcon={Reset}
                onClick={handleReset}
              >
                Reset All
              </Button>
              <Button
                kind="secondary"
                renderIcon={View}
                onClick={handlePreview}
                disabled={events.length === 0}
              >
                Preview
              </Button>
            </ButtonSet>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: '600' }}>Export & Save</h4>
            <ButtonSet>
              <Button
                kind="tertiary"
                renderIcon={DocumentAdd}
                onClick={handleOpenSaveDraftModal}
                disabled={events.length === 0}
              >
                Save to Drafts Tab
              </Button>
              <Button
                kind="tertiary"
                renderIcon={Save}
                onClick={handleUpdateDraft}
                disabled={events.length === 0 || !currentDraftId}
              >
                Update Draft
              </Button>
              <Button
                kind="secondary"
                renderIcon={Download}
                onClick={handleExportHTML}
                disabled={events.length === 0}
              >
                Export HTML File
              </Button>
              <Button
                kind="primary"
                renderIcon={Copy}
                onClick={handleCopyHTML}
                disabled={events.length === 0}
              >
                Copy HTML
              </Button>
            </ButtonSet>
          </div>
        </Column>
      </Grid>

      {/* Add/Edit Event Modal */}
      <Modal
        open={showAddModal}
        onRequestClose={() => {
          setShowAddModal(false);
          resetEventForm();
        }}
        modalHeading={editingEvent !== null ? 'Edit Event' : 'Add New Event'}
        primaryButtonText={editingEvent !== null ? 'Update Event' : 'Add Event'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleAddEvent}
        size="lg"
      >
        <Form>
          <Stack gap={6}>
            <TextInput
              id="event-title"
              labelText="Event Title *"
              placeholder="e.g., From AI Ambition to Business Value"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            />

            <Grid>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="event-date"
                  labelText="Date *"
                  placeholder="e.g., 3 June or 16-17 June"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                />
              </Column>
              <Column lg={8} md={4} sm={4}>
                <Select
                  id="event-category"
                  labelText="Category *"
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                >
                  <SelectItem value="ibm" text="IBM Event" />
                  <SelectItem value="thirdParty" text="3rd Party Event" />
                  <SelectItem value="onDemand" text="On-Demand/Webinar" />
                </Select>
              </Column>
            </Grid>

            <TextInput
              id="event-location"
              labelText="Location"
              placeholder="e.g., The Ivy Soho Brasserie, London"
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
            />

            <TextArea
              id="event-audience"
              labelText="Target Audience"
              placeholder="e.g., 12-15 Senior Leaders, C-Suite executives"
              rows={2}
              value={eventForm.audience}
              onChange={(e) => setEventForm({ ...eventForm, audience: e.target.value })}
            />

            <TextInput
              id="event-registration-link"
              labelText="Registration Link (Optional)"
              placeholder="https://registration-url.com"
              value={eventForm.registrationLink}
              onChange={(e) => setEventForm({ ...eventForm, registrationLink: e.target.value })}
            />

            <TextInput
              id="event-seismic-link"
              labelText="Seismic Page Link (Optional)"
              placeholder="https://seismic-page-url.com"
              value={eventForm.seismicLink}
              onChange={(e) => setEventForm({ ...eventForm, seismicLink: e.target.value })}
            />

            <Checkbox
              id="event-featured"
              labelText="Mark as Featured Event (will appear in top section)"
              checked={eventForm.featured}
              onChange={(e) => setEventForm({ ...eventForm, featured: e.target.checked })}
            />
          </Stack>
        </Form>
      </Modal>

      {/* News Link Modal */}
      <Modal
        open={showNewsModal}
        onRequestClose={() => {
          setShowNewsModal(false);
          setNewsLinkForm({ title: '', url: '', description: '' });
          setEditingNewsLink(null);
        }}
        modalHeading={editingNewsLink !== null ? 'Edit News Link' : 'Add News Link'}
        primaryButtonText={editingNewsLink !== null ? 'Update Link' : 'Add Link'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleAddNewsLink}
        size="md"
      >
        <Form>
          <Stack gap={5}>
            <TextInput
              id="news-title"
              labelText="Link Title *"
              placeholder="e.g., IBM Announces New AI Capabilities"
              value={newsLinkForm.title}
              onChange={(e) => setNewsLinkForm({ ...newsLinkForm, title: e.target.value })}
            />

            <TextInput
              id="news-url"
              labelText="URL *"
              placeholder="https://..."
              value={newsLinkForm.url}
              onChange={(e) => setNewsLinkForm({ ...newsLinkForm, url: e.target.value })}
            />

            <TextArea
              id="news-description"
              labelText="Description (Optional)"
              placeholder="Brief description of the article or resource"
              rows={3}
              value={newsLinkForm.description}
              onChange={(e) => setNewsLinkForm({ ...newsLinkForm, description: e.target.value })}
            />
          </Stack>
        </Form>
      </Modal>

      {/* Podcast Link Modal */}
      <Modal
        open={showPodcastModal}
        onRequestClose={() => {
          setShowPodcastModal(false);
          setPodcastLinkForm({ title: '', url: '', description: '' });
          setEditingPodcastLink(null);
        }}
        modalHeading={editingPodcastLink !== null ? 'Edit Podcast/Webinar Link' : 'Add Podcast/Webinar Link'}
        primaryButtonText={editingPodcastLink !== null ? 'Update Link' : 'Add Link'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleAddPodcastLink}
        size="md"
      >
        <Form>
          <Stack gap={5}>
            <TextInput
              id="podcast-title"
              labelText="Link Title *"
              placeholder="e.g., AI in Action: Customer Success Stories"
              value={podcastLinkForm.title}
              onChange={(e) => setPodcastLinkForm({ ...podcastLinkForm, title: e.target.value })}
            />

            <TextInput
              id="podcast-url"
              labelText="URL *"
              placeholder="https://..."
              value={podcastLinkForm.url}
              onChange={(e) => setPodcastLinkForm({ ...podcastLinkForm, url: e.target.value })}
            />

            <TextArea
              id="podcast-description"
              labelText="Description (Optional)"
              placeholder="Brief description of the podcast or webinar"
              rows={3}
              value={podcastLinkForm.description}
              onChange={(e) => setPodcastLinkForm({ ...podcastLinkForm, description: e.target.value })}
            />
          </Stack>
        </Form>
      </Modal>

      {/* Save Draft Modal */}
      <Modal
        open={showSaveDraftModal}
        onRequestClose={() => {
          setShowSaveDraftModal(false);
          setDraftName('');
        }}
        modalHeading="Save to Drafts"
        primaryButtonText="Save Draft"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSaveToDrafts}
        size="sm"
      >
        <Form>
          <TextInput
            id="draft-name"
            labelText="Draft Name"
            placeholder="e.g., May 2026 Marketing Spotlight"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            autoFocus
          />
          <p style={{ marginTop: '1rem', fontSize: '14px', color: '#525252' }}>
            This draft will be saved to the Drafts tab where you can edit it later.
          </p>
        </Form>
      </Modal>
    </div>
  );
});

export default MarketingSpotlightTab;

// Made with Bob
