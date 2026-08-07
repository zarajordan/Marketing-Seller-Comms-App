import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { saveDraft, updateDraft, listEvents } from '../lib/supabaseData';
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
  RadioButtonGroup,
  RadioButton,
  Search,
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
import RichTextEditor from './RichTextEditor';

const InlineEditableIntroText = ({ value, onChange }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  const handleOpen = () => { setDraft(value); setModalOpen(true); };
  const handleSave = () => { onChange(draft); setModalOpen(false); };
  const handleCancel = () => { setDraft(value); setModalOpen(false); };

  return (
    <>
      <div
        onClick={handleOpen}
        title="Click to edit intro text"
        style={{ background: '#f4f4f4', border: '1px dashed #c6c6c6', borderRadius: '4px', padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '10px' }}
      >
        <Edit size={16} style={{ color: '#0f62fe', marginTop: '2px', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: '#393939', lineHeight: '1.5' }}>📝 Intro Text — {value}</span>
      </div>

      <Modal
        open={modalOpen}
        onRequestClose={handleCancel}
        modalHeading="Edit Intro Text"
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSave}
        size="sm"
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ fontSize: '13px', color: '#525252', marginBottom: '16px' }}>
            This text appears at the top of the email below the banner, before the event listings.
          </p>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '12px', border: '1px solid #8d8d8d', fontSize: '14px', lineHeight: '1.6', resize: 'vertical', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' }}
          />
        </div>
      </Modal>
    </>
  );
};

const MarketingSpotlightTab = forwardRef(({ currentUser, ...props }, ref) => {
  const [month, setMonth] = useState('May');
  const [year, setYear] = useState('2026');
  const [quarter, setQuarter] = useState('Q2');
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importEvents, setImportEvents] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importSearch, setImportSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(null); // Track which draft is being edited
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [colorScheme, setColorScheme] = useState('navy-teal'); // Color scheme selector
  const [fontFamily, setFontFamily] = useState('ibm-plex'); // Font family selector
  const [layoutStyle, setLayoutStyle] = useState('classic'); // Layout style: 'classic' | 'modern'
  
  // Custom banner headings
  const [bannerTitle, setBannerTitle] = useState('UKI Marketing Spotlight');
  const [bannerSubtitle, setBannerSubtitle] = useState("Don't miss what's coming up in");
  const [heroImageUrl, setHeroImageUrl] = useState('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80');
  const [introText, setIntroText] = useState('Please see below for the latest update on all upcoming events you can use to drive client engagement, deepen relationships and open new opportunities.');
  
  // Custom color overrides
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [customColors, setCustomColors] = useState({
    header: '#8a3ffc',
    summaryBg: '#e8f4ff',
    summaryBorder: '#0f62fe',
    featured: '#8a3ffc',
    ibmBorder: '#0f62fe',
    ibmColor: '#0f62fe',
    thirdPartyBorder: '#198038',
    thirdPartyColor: '#8a3ffc',
    onDemandBorder: '#8a3ffc',
    onDemandColor: '#0072c3',
  });
  
  // Resource links state
  const [newsLinks, setNewsLinks] = useState([]);
  const [podcastLinks, setPodcastLinks] = useState([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const [editingNewsLink, setEditingNewsLink] = useState(null);
  const [editingPodcastLink, setEditingPodcastLink] = useState(null);
  const [newsLinkForm, setNewsLinkForm] = useState({ title: '', url: '', description: '' });
  const [podcastLinkForm, setPodcastLinkForm] = useState({ title: '', url: '', description: '' });
  
  // Custom sections state
  const [customSections, setCustomSections] = useState([]);
  
  // RevTech Enablement and Results state
  const [revTechContent, setRevTechContent] = useState('');
  const [revTechLinks, setRevTechLinks] = useState([]);
  const [revTechEvents, setRevTechEvents] = useState([]);
  const [showRevTechModal, setShowRevTechModal] = useState(false);
  const [showRevTechContentModal, setShowRevTechContentModal] = useState(false);
  const [showRevTechEventModal, setShowRevTechEventModal] = useState(false);
  const [editingRevTechLink, setEditingRevTechLink] = useState(null);
  const [revTechLinkForm, setRevTechLinkForm] = useState({ title: '', url: '', description: '' });
  const [revTechEventForm, setRevTechEventForm] = useState({
    title: '',
    date: '',
    category: 'ibm',
    location: '',
    audience: '',
    registrationLink: '',
    contactEmail: '',
    seismicLink: '',
    featured: false
  });
  const [showCustomSectionModal, setShowCustomSectionModal] = useState(false);
  const [editingCustomSection, setEditingCustomSection] = useState(null);
  const [customSectionForm, setCustomSectionForm] = useState({ title: '', content: '', links: [], events: [] });
  const [showCustomSectionLinkModal, setShowCustomSectionLinkModal] = useState(false);
  const [showCustomSectionEventModal, setShowCustomSectionEventModal] = useState(false);
  const [editingCustomSectionForLink, setEditingCustomSectionForLink] = useState(null);
  const [customSectionEventForm, setCustomSectionEventForm] = useState({
    title: '',
    date: '',
    category: 'ibm',
    location: '',
    audience: '',
    registrationLink: '',
    contactEmail: '',
    seismicLink: '',
    featured: false
  });
  const [customSectionLinkForm, setCustomSectionLinkForm] = useState({ title: '', url: '', description: '' });
  
  // Emoji suggestions based on keywords
  const getEmojiSuggestion = (title) => {
    const lowerTitle = title.toLowerCase();
    const emojiMap = {
      'news': '📰',
      'article': '📄',
      'blog': '✍️',
      'podcast': '🎙️',
      'video': '🎥',
      'webinar': '💻',
      'event': '📅',
      'resource': '📚',
      'tool': '🔧',
      'guide': '📖',
      'report': '📊',
      'case': '💼',
      'study': '🔬',
      'research': '🔍',
      'insight': '💡',
      'trend': '📈',
      'update': '🔔',
      'announcement': '📢',
      'launch': '🚀',
      'product': '📦',
      'service': '⚙️',
      'solution': '✅',
      'training': '🎓',
      'certification': '🏆',
      'award': '🥇',
      'partner': '🤝',
      'community': '👥',
      'social': '💬',
      'media': '📱',
      'download': '⬇️',
      'link': '🔗',
      'external': '🌐',
      'internal': '🏢',
      'demo': '🎬',
      'tutorial': '📺',
      'tip': '💭',
      'best': '⭐',
      'practice': '✨',
    };
    
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (lowerTitle.includes(keyword)) {
        return emoji;
      }
    }
    return '📌'; // Default emoji
  };

  // Color scheme configurations
  const colorSchemes = {
    'navy-teal': {
      name: 'Professional Navy & Teal',
      header: '#1e3a8a',
      footer: '#1e3a8a',
      summaryBg: '#dbeafe',
      summaryBorder: '#1e40af',
      summaryLabelColor: '#525252',
      sectionHeaderColor: '#161616',
      sectionHeaderBg: '#dbeafe',
      sectionHeaderBorder: '#1e3a8a',
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
      footer: '#4f46e5',
      summaryBg: '#e0e7ff',
      summaryBorder: '#4f46e5',
      summaryLabelColor: '#525252',
      sectionHeaderColor: '#161616',
      sectionHeaderBg: '#e0e7ff',
      sectionHeaderBorder: '#4f46e5',
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
      footer: '#374151',
      summaryBg: '#fef3c7',
      summaryBorder: '#d97706',
      summaryLabelColor: '#525252',
      sectionHeaderColor: '#161616',
      sectionHeaderBg: '#f3f4f6',
      sectionHeaderBorder: '#374151',
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
      footer: '#0530AD',
      summaryBg: '#e6eeff',
      summaryBorder: '#0530AD',
      summaryLabelColor: '#525252',
      sectionHeaderColor: '#161616',
      sectionHeaderBg: '#e6eeff',
      sectionHeaderBorder: '#0530AD',
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
    'all-blue': {
      name: 'All Blue',
      header: '#0f62fe',
      footer: '#0f62fe',
      summaryBg: '#ffffff',
      summaryBorder: '#0f62fe',
      summaryLabelColor: '#0f62fe',
      sectionHeaderColor: '#ffffff',
      sectionHeaderBg: '#0f62fe',
      sectionHeaderBorder: '#0043ce',
      featured: '#0f62fe',
      ibmBg: '#0f62fe',
      ibmBorder: '#0043ce',
      ibmColor: '#0f62fe',
      thirdPartyBg: '#0f62fe',
      thirdPartyBorder: '#0043ce',
      thirdPartyColor: '#0f62fe',
      onDemandBg: '#0f62fe',
      onDemandBorder: '#0043ce',
      onDemandColor: '#0f62fe',
    },
    'pastel-spring': {
      name: 'Pastel Spring',
      header: '#4caf50',
      footer: '#4caf50',
      summaryBg: '#fef9e7',
      summaryBorder: '#a8d5ba',
      summaryLabelColor: '#525252',
      sectionHeaderColor: '#161616',
      sectionHeaderBg: '#e8f5e9',
      sectionHeaderBorder: '#4caf50',
      featured: '#a8d5ba',
      ibmBg: '#e8f5e9',
      ibmBorder: '#81c784',
      ibmColor: '#4caf50',
      thirdPartyBg: '#fff3e0',
      thirdPartyBorder: '#ffb74d',
      thirdPartyColor: '#ff9800',
      onDemandBg: '#f3e5f5',
      onDemandBorder: '#ba68c8',
      onDemandColor: '#9c27b0',
    },
    'pastel-ocean': {
      name: 'Pastel Ocean',
      header: '#0288d1',
      footer: '#0288d1',
      summaryBg: '#e1f5fe',
      summaryBorder: '#4fc3f7',
      summaryLabelColor: '#525252',
      sectionHeaderColor: '#161616',
      sectionHeaderBg: '#e1f5fe',
      sectionHeaderBorder: '#0288d1',
      featured: '#4fc3f7',
      ibmBg: '#e1f5fe',
      ibmBorder: '#4fc3f7',
      ibmColor: '#0288d1',
      thirdPartyBg: '#e0f2f1',
      thirdPartyBorder: '#4db6ac',
      thirdPartyColor: '#00897b',
      onDemandBg: '#f1f8e9',
      onDemandBorder: '#aed581',
      onDemandColor: '#689f38',
    },
    'pastel-sunset': {
      name: 'Pastel Sunset',
      header: '#c2185b',
      footer: '#c2185b',
      summaryBg: '#fff3e0',
      summaryBorder: '#ff8a65',
      summaryLabelColor: '#525252',
      sectionHeaderColor: '#161616',
      sectionHeaderBg: '#f8bbd0',
      sectionHeaderBorder: '#c2185b',
      featured: '#ff8a65',
      ibmBg: '#ffe0b2',
      ibmBorder: '#ffb74d',
      ibmColor: '#f57c00',
      thirdPartyBg: '#f8bbd0',
      thirdPartyBorder: '#f06292',
      thirdPartyColor: '#c2185b',
      onDemandBg: '#e1bee7',
      onDemandBorder: '#ba68c8',
      onDemandColor: '#8e24aa',
    },
    'pastel-lavender': {
      name: 'Pastel Lavender',
      header: '#673ab7',
      footer: '#673ab7',
      summaryBg: '#f3e5f5',
      summaryBorder: '#9575cd',
      summaryLabelColor: '#525252',
      sectionHeaderColor: '#161616',
      sectionHeaderBg: '#ede7f6',
      sectionHeaderBorder: '#673ab7',
      featured: '#9575cd',
      ibmBg: '#ede7f6',
      ibmBorder: '#9575cd',
      ibmColor: '#673ab7',
      thirdPartyBg: '#e8eaf6',
      thirdPartyBorder: '#7986cb',
      thirdPartyColor: '#3f51b5',
      onDemandBg: '#e0f2f1',
      onDemandBorder: '#4db6ac',
      onDemandColor: '#00897b',
    },
    'pastel-mint': {
      name: 'Pastel Mint',
      header: '#00897b',
      footer: '#00897b',
      summaryBg: '#e0f2f1',
      summaryBorder: '#4db6ac',
      summaryLabelColor: '#525252',
      sectionHeaderColor: '#161616',
      sectionHeaderBg: '#e0f2f1',
      sectionHeaderBorder: '#00897b',
      featured: '#4db6ac',
      ibmBg: '#e0f2f1',
      ibmBorder: '#4db6ac',
      ibmColor: '#00897b',
      thirdPartyBg: '#f1f8e9',
      thirdPartyBorder: '#aed581',
      thirdPartyColor: '#689f38',
      onDemandBg: '#fff9c4',
      onDemandBorder: '#ffd54f',
      onDemandColor: '#f9a825',
    },
    'pastel-peach': {
      name: 'Pastel Peach',
      header: '#fb8c00',
      footer: '#fb8c00',
      summaryBg: '#fff3e0',
      summaryBorder: '#ffab91',
      summaryLabelColor: '#525252',
      sectionHeaderColor: '#161616',
      sectionHeaderBg: '#ffe0b2',
      sectionHeaderBorder: '#fb8c00',
      featured: '#ffab91',
      ibmBg: '#ffe0b2',
      ibmBorder: '#ffb74d',
      ibmColor: '#fb8c00',
      thirdPartyBg: '#fff9c4',
      thirdPartyBorder: '#fff176',
      thirdPartyColor: '#fbc02d',
      onDemandBg: '#f0f4c3',
      onDemandBorder: '#dce775',
      onDemandColor: '#afb42b',
    },
    'summer-sports': {
      name: 'Summer of Sports (Wimbledon)',
      header: '#582C83',
      footer: '#582C83',
      summaryBg: '#f0f4f0',
      summaryBorder: '#00843D',
      summaryLabelColor: '#525252',
      sectionHeaderColor: '#ffffff',
      sectionHeaderBg: '#582C83',
      sectionHeaderBorder: '#3d1f5c',
      featured: '#582C83',
      ibmBg: '#e8f0e8',
      ibmBorder: '#00843D',
      ibmColor: '#00843D',
      thirdPartyBg: '#e8f0e8',
      thirdPartyBorder: '#00843D',
      thirdPartyColor: '#00843D',
      onDemandBg: '#e8f0e8',
      onDemandBorder: '#00843D',
      onDemandColor: '#00843D',
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

  const currentColors = useCustomColors
    ? { ...colorSchemes[colorScheme], ...customColors }
    : colorSchemes[colorScheme];
  const currentFont = fontFamilies[fontFamily];

  // Form state for adding/editing events
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    location: '',
    audience: '',
    category: 'ibm',
    industry: 'Cross-Industry',
    featured: false,
    registrationLink: '',
    contactEmail: '',
    seismicLink: '',
  });

  const resetEventForm = () => {
    setEventForm({
      title: '',
      date: '',
      location: '',
      audience: '',
      category: 'ibm',
      industry: 'Cross-Industry',
      featured: false,
      registrationLink: '',
      contactEmail: '',
      seismicLink: '',
    });
    setEditingEvent(null);
  };

  // Helper: format a date range from startDate/endDate into a display string
  const formatLibraryDateRange = (startDate, endDate) => {
    if (!startDate) return '';
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    // Parse YYYY-MM-DD directly to avoid UTC/local timezone offset issues
    const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
    const startDay = sDay;
    const startMonth = months[sMonth - 1];
    if (!endDate || endDate === startDate) {
      return `${startDay} ${startMonth}`;
    }
    const [, eMonth, eDay] = endDate.split('-').map(Number);
    const endDay = eDay;
    const endMonth = months[eMonth - 1];
    if (startMonth === endMonth) {
      return `${startDay}–${endDay} ${endMonth}`;
    }
    return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
  };

  // Helper: map an Event Library event object into the eventForm shape
  const mapLibraryEventToForm = (libraryEvent) => ({
    title: libraryEvent.title || '',
    date: formatLibraryDateRange(libraryEvent.startDate, libraryEvent.endDate),
    location: libraryEvent.locationDetails || '',
    registrationLink: libraryEvent.registrationLink || '',
    seismicLink: libraryEvent.seismicLink || '',
    category: libraryEvent.category || 'ibm',
    industry: libraryEvent.industry || 'Cross-Industry',
    audience: libraryEvent.targetAudience === 'All' ? '' : (libraryEvent.targetAudience || ''),
    contactEmail: libraryEvent.contacts?.[0]?.email ?? '',
    featured: false,
  });

  // Fetch active upcoming events when the import modal opens
  useEffect(() => {
    if (!importModalOpen) return;
    setImportLoading(true);
    setImportSearch('');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    listEvents()
      .then((all) => {
        const filtered = all.filter(
          (e) => e.status === 'Active' && e.startDate && new Date(e.startDate) >= today
        );
        setImportEvents(filtered);
      })
      .catch(() => setImportEvents([]))
      .finally(() => setImportLoading(false));
  }, [importModalOpen]);

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

  // RevTech Enablement and Results Handlers
  const handleAddRevTechLink = () => {
    if (!revTechLinkForm.title || !revTechLinkForm.url) {
      toast.error('Please enter both title and URL');
      return;
    }

    if (editingRevTechLink !== null) {
      // Update existing link
      const updatedLinks = [...revTechLinks];
      updatedLinks[editingRevTechLink] = {
        id: revTechLinks[editingRevTechLink].id,
        ...revTechLinkForm
      };
      setRevTechLinks(updatedLinks);
      toast.success('Rev Tech link updated');
    } else {
      // Add new link
      const newLink = {
        id: Date.now(),
        ...revTechLinkForm
      };
      setRevTechLinks([...revTechLinks, newLink]);
      toast.success('Rev Tech link added');
    }

    setRevTechLinkForm({ title: '', url: '', description: '' });
    setEditingRevTechLink(null);
    setShowRevTechModal(false);
  };

  const handleEditRevTechLink = (index) => {
    setRevTechLinkForm(revTechLinks[index]);
    setEditingRevTechLink(index);
    setShowRevTechModal(true);
  };

  const handleDeleteRevTechLink = (index) => {
    const updatedLinks = revTechLinks.filter((_, i) => i !== index);
    setRevTechLinks(updatedLinks);
    toast.success('Rev Tech link deleted');
  };

  const handleMoveRevTechLink = (index, direction) => {
    const newLinks = [...revTechLinks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    setRevTechLinks(newLinks);
  };

  const handleAddRevTechEvent = () => {
    if (!revTechEventForm.title || !revTechEventForm.date) {
      toast.error('Please enter event title and date');
      return;
    }

    const newEvent = {
      id: Date.now(),
      ...revTechEventForm,
      category: revTechEventForm.category === 'thirdParty' ? 'third-party' :
                revTechEventForm.category === 'onDemand' ? 'on-demand' : 'ibm'
    };

    setRevTechEvents([...revTechEvents, newEvent]);
    
    setRevTechEventForm({
      title: '',
      date: '',
      category: 'ibm',
      location: '',
      audience: '',
      registrationLink: '',
      contactEmail: '',
      seismicLink: '',
      featured: false
    });
    setShowRevTechEventModal(false);
    toast.success('Event added to Rev Tech section!');
  };

  const handleDeleteRevTechEvent = (eventId) => {
    setRevTechEvents(revTechEvents.filter(e => e.id !== eventId));
    toast.success('Event removed from Rev Tech section');
  };

  // Custom Section Handlers
  const handleAddCustomSection = () => {
    if (!customSectionForm.title) {
      toast.error('Please enter a section title');
      return;
    }

    console.log('Adding/Updating custom section:', customSectionForm);
    
    if (editingCustomSection !== null) {
      const updatedSections = [...customSections];
      updatedSections[editingCustomSection] = {
        ...customSections[editingCustomSection],
        title: customSectionForm.title,
        content: customSectionForm.content,
      };
      console.log('Updated sections:', updatedSections);
      setCustomSections(updatedSections);
      toast.success('Section updated!');
    } else {
      const newSection = {
        id: Date.now(),
        title: customSectionForm.title,
        content: customSectionForm.content,
        links: [],
        events: []
      };
      console.log('New section:', newSection);
      setCustomSections([...customSections, newSection]);
      toast.success('Section added!');
    }

    setCustomSectionForm({ title: '', content: '', links: [], events: [] });
    setEditingCustomSection(null);
    setShowCustomSectionModal(false);
  };

  const handleEditCustomSection = (index) => {
    setCustomSectionForm({
      title: customSections[index].title,
      content: customSections[index].content || '',
      links: customSections[index].links,
      events: customSections[index].events || []
    });
    setEditingCustomSection(index);
    setShowCustomSectionModal(true);
  };

  const handleDeleteCustomSection = (index) => {
    const updatedSections = customSections.filter((_, i) => i !== index);
    setCustomSections(updatedSections);
    toast.success('Section deleted');
  };

  const handleMoveCustomSection = (index, direction) => {
    const newSections = [...customSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setCustomSections(newSections);
  };

  const handleAddLinkToCustomSection = () => {
    if (!customSectionLinkForm.title || !customSectionLinkForm.url) {
      toast.error('Please enter both title and URL');
      return;
    }

    if (editingCustomSectionForLink === null) {
      toast.error('No section selected');
      return;
    }

    const updatedSections = [...customSections];
    const newLink = {
      id: Date.now(),
      ...customSectionLinkForm
    };
    updatedSections[editingCustomSectionForLink].links.push(newLink);
    setCustomSections(updatedSections);
    
    setCustomSectionLinkForm({ title: '', url: '', description: '' });
    setShowCustomSectionLinkModal(false);
    setEditingCustomSectionForLink(null);
    toast.success('Link added to section');
  };

  const handleDeleteLinkFromCustomSection = (sectionIndex, linkIndex) => {
    const updatedSections = [...customSections];
    updatedSections[sectionIndex].links = updatedSections[sectionIndex].links.filter((_, i) => i !== linkIndex);
    setCustomSections(updatedSections);
    toast.success('Link deleted');
  };

  const handleAddEventToCustomSection = () => {
    if (!customSectionEventForm.title || !customSectionEventForm.date) {
      toast.error('Please enter event title and date');
      return;
    }

    if (editingCustomSectionForLink === null) {
      toast.error('No section selected');
      return;
    }

    const updatedSections = [...customSections];
    if (!updatedSections[editingCustomSectionForLink].events) {
      updatedSections[editingCustomSectionForLink].events = [];
    }

    // Create new event for this custom section only
    const newEvent = {
      id: Date.now(),
      ...customSectionEventForm,
      category: customSectionEventForm.category === 'thirdParty' ? 'third-party' :
                customSectionEventForm.category === 'onDemand' ? 'on-demand' : 'ibm'
    };

    updatedSections[editingCustomSectionForLink].events.push(newEvent);
    setCustomSections(updatedSections);
    
    setCustomSectionEventForm({
      title: '',
      date: '',
      category: 'ibm',
      location: '',
      audience: '',
      registrationLink: '',
      contactEmail: '',
      seismicLink: '',
      featured: false
    });
    setShowCustomSectionEventModal(false);
    setEditingCustomSectionForLink(null);
    toast.success('Event added to section!');
  };

  const handleDeleteEventFromCustomSection = (sectionIndex, eventId) => {
    const updatedSections = [...customSections];
    updatedSections[sectionIndex].events = updatedSections[sectionIndex].events.filter(e => e.id !== eventId);
    setCustomSections(updatedSections);
    toast.success('Event removed from section');
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

  const buildDraftData = () => ({
    title: draftName.trim() || (currentDraftId ? undefined : `${month} ${year} Marketing Spotlight`),
    type: 'Marketing Spotlight',
    month,
    year,
    quarter,
    events,
    eventCount: events.length,
    newsLinks,
    podcastLinks,
    revTechContent,
    revTechLinks,
    revTechEvents,
    bannerTitle,
    bannerSubtitle,
    useCustomColors,
    customColors,
    customSections,
    colorScheme,
    fontFamily,
  });

  const handleSaveToDrafts = async () => {
    if (!draftName.trim()) {
      toast.error('Please enter a name for the draft');
      return;
    }

    if (!currentUser?.email) {
      toast.error('You must be logged in to save drafts.');
      return;
    }

    try {
      const saved = await saveDraft(currentUser.email, draftName.trim(), buildDraftData());
      setCurrentDraftId(saved.id);
      window.dispatchEvent(new Event('draftsUpdated'));
      setShowSaveDraftModal(false);
      setDraftName('');
      toast.success(`✅ Saved to Drafts: ${saved.name}`);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(`❌ Failed to save draft: ${error.message}`, { autoClose: 8000 });
    }
  };

  const handleUpdateDraft = async () => {
    if (events.length === 0) {
      toast.error('Please add at least one event before updating');
      return;
    }

    if (!currentDraftId) {
      toast.error('No draft to update. Please save as new draft first.');
      return;
    }

    if (!currentUser?.email) {
      toast.error('You must be logged in to save drafts.');
      return;
    }

    try {
      const updated = await updateDraft(currentDraftId, currentUser.email, buildDraftData());
      window.dispatchEvent(new Event('draftsUpdated'));
      toast.success(`✅ Updated Draft: ${updated.name}`);
    } catch (error) {
      console.error('Error updating draft:', error);
      toast.error(`❌ Failed to update draft: ${error.message}`, { autoClose: 8000 });
    }
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

    const html = layoutStyle === 'modern' ? generateModernEmailHTML() : generateEmailHTML();
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
      setRevTechLinks(draftData.revTechLinks || []);
      setBannerTitle(draftData.bannerTitle || 'UKI Marketing Spotlight');
      setBannerSubtitle(draftData.bannerSubtitle || "Don't miss what's coming up in");
      setUseCustomColors(draftData.useCustomColors || false);
      if (draftData.customColors) {
        setCustomColors(draftData.customColors);
      }
      setCustomSections(draftData.customSections || []);
      setCurrentDraftId(draftId || null); // Track the draft ID for updates
      toast.success('Draft loaded successfully!');
    }
  }));

  useEffect(() => {
    const stored = localStorage.getItem('load_draft_marketing_spotlight');
    if (stored) {
      try {
        const { data, id } = JSON.parse(stored);
        setMonth(data.month || 'May');
        setYear(data.year || '2026');
        setQuarter(data.quarter || 'Q2');
        setEvents(data.events || []);
        setNewsLinks(data.newsLinks || []);
        setPodcastLinks(data.podcastLinks || []);
        setRevTechLinks(data.revTechLinks || []);
        setBannerTitle(data.bannerTitle || 'UKI Marketing Spotlight');
        setBannerSubtitle(data.bannerSubtitle || "Don't miss what's coming up in");
        setUseCustomColors(data.useCustomColors || false);
        if (data.customColors) setCustomColors(data.customColors);
        setCustomSections(data.customSections || []);
        setCurrentDraftId(id || null);
        toast.success('Draft loaded successfully!');
      } catch {}
      localStorage.removeItem('load_draft_marketing_spotlight');
    }
  }, []);

  const generateEmailHTML = () => {
    // Get featured events from ALL categories first
    const featuredEvents = events.filter(e => e.featured).slice(0, 3); // Show up to 3 featured events
    
    // Filter by category and SORT by date - featured events will appear in BOTH featured section AND their category section
    const ibmEvents = sortEventsByDate(events.filter(e => e.category === 'ibm'));
    const thirdPartyEvents = sortEventsByDate(events.filter(e => e.category === 'thirdParty'));
    const onDemandEvents = sortEventsByDate(events.filter(e => e.category === 'onDemand'));

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
          <td width="48%" valign="top" style="padding-right: 8px; padding-bottom: 10px; height: 100%;" class="column-cell">
            <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-left: 3px solid ${borderColor}; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); height: 100%;" class="event-card">
              <tr>
                <td style="padding: 10px;" valign="top">
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
                  ${event1.contactEmail && !event1.registrationLink ? `
                  <p style="margin: 0 0 8px 0; font-size: 10px; color: #525252; font-style: italic;">
                    Invite only, contact: <a href="mailto:${event1.contactEmail}" style="color: ${currentColors.ibmBorder}; text-decoration: none;">${event1.contactEmail}</a>
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
            <td width="48%" valign="top" style="padding-left: 8px; padding-bottom: 10px; height: 100%;" class="column-cell">
              <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-left: 3px solid ${borderColor}; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); height: 100%;" class="event-card">
                <tr>
                  <td style="padding: 10px;" valign="top">
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
                    ${event2.contactEmail && !event2.registrationLink ? `
                    <p style="margin: 0 0 8px 0; font-size: 10px; color: #525252; font-style: italic;">
                      Invite only, contact: <a href="mailto:${event2.contactEmail}" style="color: ${currentColors.ibmBorder}; text-decoration: none;">${event2.contactEmail}</a>
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
                      ${bannerTitle}
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.95); font-weight: 400; line-height: 1.3;">
                      ${bannerSubtitle} ${quarter}
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
                    <div style="font-size: 10px; color: ${currentColors.summaryLabelColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      📅 IBM Events
                    </div>
                  </td>
                  <td width="33%" align="center" valign="top" style="padding: 8px 5px; border-left: 1px solid rgba(0,0,0,0.1); border-right: 1px solid rgba(0,0,0,0.1);">
                    <div style="font-size: 24px; font-weight: 700; color: ${currentColors.thirdPartyColor}; line-height: 1; margin-bottom: 6px;">
                      ${thirdPartyEvents.length}
                    </div>
                    <div style="font-size: 10px; color: ${currentColors.summaryLabelColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      🤝 3rd Party
                    </div>
                  </td>
                  <td width="33%" align="center" valign="top" style="padding: 8px 5px;">
                    <div style="font-size: 24px; font-weight: 700; color: ${currentColors.onDemandColor}; line-height: 1; margin-bottom: 6px;">
                      ${onDemandEvents.length}
                    </div>
                    <div style="font-size: 10px; color: ${currentColors.summaryLabelColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      💻 On-Demand
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
                ${introText}
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
                🎾 Featured Events 🏆
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
            <td width="33%" valign="top" style="${paddingStyle}; height: 100%;" class="column-cell">
              <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-left: 3px solid ${borderColor}; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); height: 100%;" class="event-card">
                <tr>
                  <td style="padding: 10px;" valign="top">
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
                    ${event.contactEmail && !event.registrationLink ? `
                    <p style="margin: 0 0 8px 0; font-size: 10px; color: #525252; font-style: italic;">
                      Invite only, contact: <a href="mailto:${event.contactEmail}" style="color: ${currentColors.ibmBorder}; text-decoration: none;">${event.contactEmail}</a>
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
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.sectionHeaderBg}" style="border-radius: 4px; border-left: 3px solid ${currentColors.sectionHeaderBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: ${currentColors.sectionHeaderColor}; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                IBM Events
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

    ${thirdPartyEvents.filter(e => !e.featured).length > 0 ? `
    <!-- 3rd Party Events Section -->
    <tr>
      <td style="padding: 15px 15px 10px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.sectionHeaderBg}" style="border-radius: 4px; border-left: 3px solid ${currentColors.sectionHeaderBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: ${currentColors.sectionHeaderColor}; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                3rd Party Events
              </h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        ${generateTwoColumnGrid(
          thirdPartyEvents.filter(e => !e.featured),
          currentColors.thirdPartyBorder,
          '3rd Party',
          currentColors.thirdPartyBorder
        )}
      </td>
    </tr>
    ` : ''}

    ${onDemandEvents.filter(e => !e.featured).length > 0 ? `
    <!-- On-Demand Section -->
    <tr>
      <td style="padding: 15px 15px 10px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.sectionHeaderBg}" style="border-radius: 4px; border-left: 3px solid ${currentColors.sectionHeaderBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: ${currentColors.sectionHeaderColor}; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                On-Demand Webinars
              </h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        ${generateTwoColumnGrid(
          onDemandEvents.filter(e => !e.featured),
          currentColors.onDemandBorder,
          'Webinar',
          currentColors.onDemandBorder
        )}
      </td>
    </tr>
    ` : ''}

    ${newsLinks.length > 0 ? `
    <!-- Thought Leadership & On Demand Assets Section -->
    <tr>
      <td style="padding: 15px 15px 10px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.sectionHeaderBg}" style="border-radius: 4px; border-left: 3px solid ${currentColors.sectionHeaderBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: ${currentColors.sectionHeaderColor}; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                📰 Thought Leadership & On Demand Assets
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
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.sectionHeaderBg}" style="border-radius: 4px; border-left: 3px solid ${currentColors.sectionHeaderBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: ${currentColors.sectionHeaderColor}; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
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

    ${(revTechContent || revTechLinks.length > 0 || revTechEvents.length > 0) ? `
    <!-- RevTech Enablement and Results Section -->
    <tr>
      <td style="padding: 15px 15px 10px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.sectionHeaderBg}" style="border-radius: 4px; border-left: 3px solid ${currentColors.sectionHeaderBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: ${currentColors.sectionHeaderColor}; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                🚀 RevTech Enablement and Results
              </h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${revTechContent ? `
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius: 4px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 12px; font-size: 12px; color: #161616; line-height: 1.5; font-family: ${currentFont.family}, Arial, sans-serif;">
              ${revTechContent}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ` : ''}
    ${revTechLinks.length > 0 ? `
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius: 4px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 12px;">
              ${revTechLinks.map((link, index) => `
                <div style="margin-bottom: ${index < revTechLinks.length - 1 ? '10px' : '0'}; padding-bottom: ${index < revTechLinks.length - 1 ? '10px' : '0'}; ${index < revTechLinks.length - 1 ? 'border-bottom: 1px solid #f4f4f4;' : ''}">
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
    ${revTechEvents.length > 0 ? `
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        ${generateTwoColumnGrid(
          revTechEvents,
          revTechEvents[0]?.category === 'ibm' ? currentColors.ibmBorder :
          revTechEvents[0]?.category === 'third-party' ? currentColors.thirdPartyBorder :
          currentColors.onDemandBorder,
          'Event',
          currentColors.featured
        )}
      </td>
    </tr>
    ` : ''}
    ` : ''}

    ${customSections.map(section => `
    <!-- Custom Section: ${section.title} -->
    <tr>
      <td style="padding: 15px 15px 10px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.sectionHeaderBg}" style="border-radius: 4px; border-left: 3px solid ${currentColors.sectionHeaderBorder}; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <h2 style="margin: 0; font-size: 14px; color: ${currentColors.sectionHeaderColor}; font-family: ${currentFont.family}, Arial, sans-serif; font-weight: 700; letter-spacing: 0.3px;">
                ${section.title}
              </h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${section.content ? `
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius: 4px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 12px; font-size: 12px; color: #161616; line-height: 1.5; font-family: ${currentFont.family}, Arial, sans-serif;">
              ${section.content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ` : ''}
    ${section.links && section.links.length > 0 ? `
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius: 4px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 12px;">
              ${section.links.map((link, index) => `
                <div style="margin-bottom: ${index < section.links.length - 1 ? '10px' : '0'}; padding-bottom: ${index < section.links.length - 1 ? '10px' : '0'}; ${index < section.links.length - 1 ? 'border-bottom: 1px solid #f4f4f4;' : ''}">
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
    ${section.events && section.events.length > 0 ? `
    <tr>
      <td style="padding: 0 15px 15px 15px;">
        ${generateTwoColumnGrid(
          section.events,
          section.events[0]?.category === 'ibm' ? currentColors.ibmBorder :
          section.events[0]?.category === 'third-party' ? currentColors.thirdPartyBorder :
          currentColors.onDemandBorder,
          'Event',
          currentColors.featured
        )}
      </td>
    </tr>
    ` : ''}
    `).join('')}

    <!-- Footer -->
    <tr>
      <td style="padding: 0; border-top: 3px solid ${currentColors.footer};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${currentColors.footer}" style="background-color: ${currentColors.footer};">
          <tr>
            <td bgcolor="${currentColors.footer}" style="background-color: ${currentColors.footer}; padding: 20px 15px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #ffffff; font-weight: 600;">
                Questions? Reply to this email
              </p>
              <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.8); line-height: 1.4;">
                © ${year} IBM Corporation. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
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
    const html = layoutStyle === 'modern' ? generateModernEmailHTML() : generateEmailHTML();
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(html);
    previewWindow.document.close();
  };

  const handleCopyHTML = () => {
    const html = layoutStyle === 'modern' ? generateModernEmailHTML() : generateEmailHTML();
    navigator.clipboard.writeText(html).then(() => {
      toast.success('✨ Email HTML copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };


  // ─── Modern Layout HTML Generator ───────────────────────────────────────────
  const generateModernEmailHTML = () => {
    const currentColors = (() => {
      if (useCustomColors) {
        // Build a merged object — fill missing keys from navy-teal defaults
        const base = {
          header: '#1a3a4a', footer: '#1a3a4a',
          summaryBg: '#e8f6f3', summaryBorder: '#2ec4a5', summaryLabelColor: '#1a3a4a',
          sectionHeaderColor: '#ffffff', sectionHeaderBg: '#1a3a4a', sectionHeaderBorder: '#2ec4a5',
          featured: '#2ec4a5',
          ibmBg: '#f0faf7', ibmBorder: '#2ec4a5', ibmColor: '#1a3a4a',
          thirdPartyBg: '#f0f4ff', thirdPartyBorder: '#4a6fa5', thirdPartyColor: '#2d3a7c',
          onDemandBg: '#fff8f0', onDemandBorder: '#e07b39', onDemandColor: '#b35a1a',
        };
        return { ...base, ...customColors };
      }
      // Resolve from colorSchemes map (same pattern as classic generator)
      const schemeKey = colorScheme;
      const schemes = {
        'navy-teal': { header: '#1a3a4a', footer: '#1a3a4a', summaryBg: '#e8f6f3', summaryBorder: '#2ec4a5', summaryLabelColor: '#1a3a4a', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#1a3a4a', sectionHeaderBorder: '#2ec4a5', featured: '#2ec4a5', ibmBg: '#f0faf7', ibmBorder: '#2ec4a5', ibmColor: '#1a3a4a', thirdPartyBg: '#f0f4ff', thirdPartyBorder: '#4a6fa5', thirdPartyColor: '#2d3a7c', onDemandBg: '#fff8f0', onDemandBorder: '#e07b39', onDemandColor: '#b35a1a' },
        'indigo-coral': { header: '#3730a3', footer: '#3730a3', summaryBg: '#fff0ed', summaryBorder: '#ef4444', summaryLabelColor: '#3730a3', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#3730a3', sectionHeaderBorder: '#ef4444', featured: '#ef4444', ibmBg: '#f5f3ff', ibmBorder: '#6366f1', ibmColor: '#3730a3', thirdPartyBg: '#fff5f5', thirdPartyBorder: '#ef4444', thirdPartyColor: '#b91c1c', onDemandBg: '#f0fdf4', onDemandBorder: '#22c55e', onDemandColor: '#166534' },
        'charcoal-gold': { header: '#1c1c1e', footer: '#1c1c1e', summaryBg: '#fffbeb', summaryBorder: '#d97706', summaryLabelColor: '#1c1c1e', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#1c1c1e', sectionHeaderBorder: '#d97706', featured: '#d97706', ibmBg: '#fffbeb', ibmBorder: '#d97706', ibmColor: '#1c1c1e', thirdPartyBg: '#f9fafb', thirdPartyBorder: '#6b7280', thirdPartyColor: '#374151', onDemandBg: '#f5f3ff', onDemandBorder: '#7c3aed', onDemandColor: '#5b21b6' },
        'ibm-official': { header: '#0530AD', footer: '#0530AD', summaryBg: '#edf5ff', summaryBorder: '#0f62fe', summaryLabelColor: '#0530AD', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#0530AD', sectionHeaderBorder: '#0f62fe', featured: '#0f62fe', ibmBg: '#edf5ff', ibmBorder: '#0f62fe', ibmColor: '#0530AD', thirdPartyBg: '#f2f4f8', thirdPartyBorder: '#4589ff', thirdPartyColor: '#0043ce', onDemandBg: '#f6f2ff', onDemandBorder: '#8a3ffc', onDemandColor: '#6929c4' },
        'all-blue': { header: '#0f62fe', footer: '#0043ce', summaryBg: '#edf5ff', summaryBorder: '#0f62fe', summaryLabelColor: '#0043ce', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#0043ce', sectionHeaderBorder: '#4589ff', featured: '#4589ff', ibmBg: '#edf5ff', ibmBorder: '#0f62fe', ibmColor: '#0043ce', thirdPartyBg: '#f2f4f8', thirdPartyBorder: '#4589ff', thirdPartyColor: '#0043ce', onDemandBg: '#f6f2ff', onDemandBorder: '#8a3ffc', onDemandColor: '#6929c4' },
        'summer-sports': { header: '#2d572c', footer: '#2d572c', summaryBg: '#f0f9f0', summaryBorder: '#4caf50', summaryLabelColor: '#2d572c', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#2d572c', sectionHeaderBorder: '#81c784', featured: '#4caf50', ibmBg: '#f0f9f0', ibmBorder: '#4caf50', ibmColor: '#2d572c', thirdPartyBg: '#fffde7', thirdPartyBorder: '#ffb300', thirdPartyColor: '#e65100', onDemandBg: '#f3e5f5', onDemandBorder: '#9c27b0', onDemandColor: '#6a1b9a' },
        'pastel-spring': { header: '#b06ab3', footer: '#b06ab3', summaryBg: '#fdf6ff', summaryBorder: '#b06ab3', summaryLabelColor: '#7b2d8b', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#b06ab3', sectionHeaderBorder: '#d4a0d7', featured: '#d4a0d7', ibmBg: '#fdf6ff', ibmBorder: '#b06ab3', ibmColor: '#7b2d8b', thirdPartyBg: '#f0fff4', thirdPartyBorder: '#68d391', thirdPartyColor: '#276749', onDemandBg: '#fff5f7', onDemandBorder: '#fc8181', onDemandColor: '#c53030' },
        'pastel-ocean': { header: '#2b6cb0', footer: '#2b6cb0', summaryBg: '#ebf8ff', summaryBorder: '#63b3ed', summaryLabelColor: '#2b6cb0', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#2b6cb0', sectionHeaderBorder: '#90cdf4', featured: '#63b3ed', ibmBg: '#ebf8ff', ibmBorder: '#63b3ed', ibmColor: '#2b6cb0', thirdPartyBg: '#e6fffa', thirdPartyBorder: '#4fd1c5', thirdPartyColor: '#234e52', onDemandBg: '#fefcbf', onDemandBorder: '#f6e05e', onDemandColor: '#744210' },
        'pastel-sunset': { header: '#c05621', footer: '#c05621', summaryBg: '#fffaf0', summaryBorder: '#ed8936', summaryLabelColor: '#c05621', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#c05621', sectionHeaderBorder: '#fbd38d', featured: '#ed8936', ibmBg: '#fff5f5', ibmBorder: '#fc8181', ibmColor: '#c53030', thirdPartyBg: '#fffaf0', thirdPartyBorder: '#ed8936', thirdPartyColor: '#c05621', onDemandBg: '#faf5ff', onDemandBorder: '#b794f4', onDemandColor: '#553c9a' },
        'pastel-lavender': { header: '#553c9a', footer: '#553c9a', summaryBg: '#faf5ff', summaryBorder: '#b794f4', summaryLabelColor: '#553c9a', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#553c9a', sectionHeaderBorder: '#d6bcfa', featured: '#b794f4', ibmBg: '#faf5ff', ibmBorder: '#b794f4', ibmColor: '#553c9a', thirdPartyBg: '#ebf8ff', thirdPartyBorder: '#90cdf4', thirdPartyColor: '#2b6cb0', onDemandBg: '#f0fff4', onDemandBorder: '#68d391', onDemandColor: '#276749' },
        'pastel-mint': { header: '#276749', footer: '#276749', summaryBg: '#f0fff4', summaryBorder: '#68d391', summaryLabelColor: '#276749', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#276749', sectionHeaderBorder: '#9ae6b4', featured: '#68d391', ibmBg: '#f0fff4', ibmBorder: '#68d391', ibmColor: '#276749', thirdPartyBg: '#ebf8ff', thirdPartyBorder: '#90cdf4', thirdPartyColor: '#2b6cb0', onDemandBg: '#fffbeb', onDemandBorder: '#f6e05e', onDemandColor: '#744210' },
        'pastel-peach': { header: '#c05621', footer: '#c05621', summaryBg: '#fffaf0', summaryBorder: '#fbd38d', summaryLabelColor: '#c05621', sectionHeaderColor: '#ffffff', sectionHeaderBg: '#c05621', sectionHeaderBorder: '#fbd38d', featured: '#ed8936', ibmBg: '#fff5f5', ibmBorder: '#fc8181', ibmColor: '#c53030', thirdPartyBg: '#fffaf0', thirdPartyBorder: '#ed8936', thirdPartyColor: '#c05621', onDemandBg: '#faf5ff', onDemandBorder: '#b794f4', onDemandColor: '#553c9a' },
      };
      return schemes[schemeKey] || schemes['navy-teal'];
    })();

    const ibmCount = events.filter(e => e.category === 'ibm').length;
    const thirdPartyCount = events.filter(e => e.category === 'thirdParty').length;
    const onDemandCount = events.filter(e => e.category === 'onDemand').length;

    // ── Section ribbon helper ──────────────────────────────────────────────────
    const sectionRibbon = (title, icon) => `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
        <tr>
          <td bgcolor="${currentColors.sectionHeaderBg}" style="padding:14px 24px; border-radius:4px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:16px; font-weight:700; color:${currentColors.sectionHeaderColor}; font-family:Arial,sans-serif;">${title}</td>
                <td align="right" style="font-size:22px; color:${currentColors.sectionHeaderColor};">${icon}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;

    // ── 2-column card grid helper ──────────────────────────────────────────────
    const twoColumnCards = (items) => {
      if (!items || items.length === 0) return '';
      let rows = '';
      for (let i = 0; i < items.length; i += 2) {
        const a = items[i];
        const b = items[i + 1];
        const cardStyle = `padding:20px; background:#ffffff; border-radius:6px; border:1px solid #e5e7eb; vertical-align:top;`;
        const cardA = `
          <td width="48%" style="${cardStyle}">
            <p style="margin:0 0 6px 0; font-size:20px; color:${currentColors.ibmBorder};">&#9660;</p>
            <p style="margin:0 0 8px 0; font-size:14px; font-weight:700; color:#1f2328; font-family:Arial,sans-serif;">${a.title || a.name || ''}</p>
            <p style="margin:0; font-size:13px; color:#57606a; font-family:Arial,sans-serif; line-height:1.5;">${a.description || a.content || ''}</p>
          </td>`;
        const cardB = b ? `
          <td width="4%">&nbsp;</td>
          <td width="48%" style="${cardStyle}">
            <p style="margin:0 0 6px 0; font-size:20px; color:${currentColors.ibmBorder};">&#9660;</p>
            <p style="margin:0 0 8px 0; font-size:14px; font-weight:700; color:#1f2328; font-family:Arial,sans-serif;">${b.title || b.name || ''}</p>
            <p style="margin:0; font-size:13px; color:#57606a; font-family:Arial,sans-serif; line-height:1.5;">${b.description || b.content || ''}</p>
          </td>` : `<td width="4%">&nbsp;</td><td width="48%">&nbsp;</td>`;
        rows += `
          <tr>
            ${cardA}
            ${cardB}
          </tr>
          <tr><td colspan="3" style="padding-top:12px;"></td></tr>`;
      }
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px; background:${currentColors.summaryBg}; padding:20px; border-radius:4px;">
          <tr><td style="padding:0 4px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
          </td></tr>
        </table>`;
    };

    // ── Event card helper (single event) ──────────────────────────────────────
    const eventCard = (ev, borderColor) => `
      <td style="padding:20px; background:#ffffff; border-radius:6px; border:1px solid #e5e7eb; border-left:4px solid ${borderColor}; vertical-align:top;">
        <p style="margin:0 0 6px 0; font-size:13px; font-weight:700; color:#1f2328; font-family:Arial,sans-serif;">${ev.title || ''}</p>
        ${ev.date ? `<p style="margin:0 0 4px 0; font-size:12px; color:#57606a; font-family:Arial,sans-serif;">&#128197; ${ev.date}</p>` : ''}
        ${ev.location ? `<p style="margin:0 0 4px 0; font-size:12px; color:#57606a; font-family:Arial,sans-serif;">&#128205; ${ev.location}</p>` : ''}
        ${ev.audience ? `<p style="margin:0 0 8px 0; font-size:12px; color:#57606a; font-family:Arial,sans-serif;">${ev.audience}</p>` : ''}
        ${ev.registrationLink ? `<a href="${ev.registrationLink}" style="display:inline-block; padding:6px 14px; background:${borderColor}; color:#ffffff; font-size:11px; font-weight:600; text-decoration:none; border-radius:3px; font-family:Arial,sans-serif;">Register</a>` : ''}
      </td>`;

    // ── 2-column event grid helper ─────────────────────────────────────────────
    const twoColumnEventGrid = (eventsList, borderColor, bgColor) => {
      if (!eventsList || eventsList.length === 0) return '';
      let rows = '';
      for (let i = 0; i < eventsList.length; i += 2) {
        const a = eventsList[i];
        const b = eventsList[i + 1];
        rows += `
          <tr>
            ${eventCard(a, borderColor)}
            <td width="12" style="font-size:0;">&nbsp;</td>
            ${b ? eventCard(b, borderColor) : '<td>&nbsp;</td>'}
          </tr>
          <tr><td colspan="3" style="padding-top:12px; font-size:0;">&nbsp;</td></tr>`;
      }
      return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px; background:${bgColor}; padding:16px; border-radius:4px;">
          <tr><td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
          </td></tr>
        </table>`;
    };

    const ibmEvents = events.filter(e => e.category === 'ibm');
    const thirdPartyEvents = events.filter(e => e.category === 'thirdParty');
    const onDemandEvents = events.filter(e => e.category === 'onDemand');
    const featuredEvents = events.filter(e => e.featured);

    const ibmEventsHTML = ibmEvents.length > 0 ? `
      ${sectionRibbon('IBM Events', '&#127775;')}
      ${twoColumnEventGrid(ibmEvents, currentColors.ibmBorder, currentColors.ibmBg)}` : '';

    const thirdPartyEventsHTML = thirdPartyEvents.length > 0 ? `
      ${sectionRibbon('3rd Party Events', '&#127942;')}
      ${twoColumnEventGrid(thirdPartyEvents, currentColors.thirdPartyBorder, currentColors.thirdPartyBg)}` : '';

    const onDemandEventsHTML = onDemandEvents.length > 0 ? `
      ${sectionRibbon('On-Demand Webinars', '&#127909;')}
      ${twoColumnEventGrid(onDemandEvents, currentColors.onDemandBorder, currentColors.onDemandBg)}` : '';

    const featuredEventsHTML = featuredEvents.length > 0 ? `
      ${sectionRibbon('&#11088; Featured Events', '&#127942;')}
      ${twoColumnEventGrid(featuredEvents, currentColors.featured, currentColors.summaryBg)}` : '';

    // ── Custom sections HTML ───────────────────────────────────────────────────
    const customSectionsHTML = customSections.map(sec => {
      const items = (sec.links && sec.links.length > 0) ? sec.links
        : (sec.events && sec.events.length > 0) ? sec.events.map(e => ({ title: e.title, description: e.date ? `${e.date}${e.location ? ' · ' + e.location : ''}` : '' }))
        : [];
      return `
        ${sectionRibbon(sec.title || 'Section', '&#10033;')}
        ${twoColumnCards(items)}`;
    }).join('');

    // ── News links HTML ────────────────────────────────────────────────────────
    const newsHTML = newsLinks.length > 0 ? `
      ${sectionRibbon('Thought Leadership &amp; Resources', '&#128218;')}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
        ${newsLinks.map(l => `
          <tr>
            <td style="padding:12px 0; border-top:1px solid #e5e7eb; font-family:Arial,sans-serif;">
              <a href="${l.url}" style="font-size:14px; font-weight:600; color:${currentColors.ibmBorder}; text-decoration:none;">${l.title}</a>
              ${l.description ? `<p style="margin:4px 0 0 0; font-size:12px; color:#57606a;">${l.description}</p>` : ''}
            </td>
          </tr>`).join('')}
      </table>` : '';

    // ── Podcast links HTML ─────────────────────────────────────────────────────
    const podcastHTML = podcastLinks.length > 0 ? `
      ${sectionRibbon('Podcasts &amp; Webinars', '&#127911;')}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
        ${podcastLinks.map(l => `
          <tr>
            <td style="padding:12px 0; border-top:1px solid #e5e7eb; font-family:Arial,sans-serif;">
              <a href="${l.url}" style="font-size:14px; font-weight:600; color:${currentColors.ibmBorder}; text-decoration:none;">${l.title}</a>
              ${l.description ? `<p style="margin:4px 0 0 0; font-size:12px; color:#57606a;">${l.description}</p>` : ''}
            </td>
          </tr>`).join('')}
      </table>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${bannerTitle} — ${month} ${year}</title>
  <style>
    body { margin:0; padding:0; background:#f4f4f4; }
    .email-wrapper { background:#f4f4f4; padding:24px 0; }
    @media only screen and (max-width:620px) {
      .email-container { width:100% !important; }
    }
  </style>
</head>
<body>
<div class="email-wrapper">
<!-- Hidden preheader -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${month} ${year} ${bannerTitle} — ${bannerSubtitle} ${quarter}</div>

<!-- Outer container -->
<table class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="width:600px;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,sans-serif;border:1px solid #d0d7de;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

  <!-- ── HERO HEADER ─────────────────────────────────────────────────────── -->
  <tr>
    <td style="padding:0; background-color:${currentColors.header};">
      <div style="position:relative; width:600px; height:240px; overflow:hidden; background-color:${currentColors.header}; display:block; line-height:0; font-size:0;">
        ${heroImageUrl ? `
        <!-- Full-bleed image -->
        <img src="${heroImageUrl}" width="600" height="240" alt="" role="presentation" border="0"
          style="display:block; width:600px; height:240px; object-fit:cover; object-position:center top; position:absolute; top:0; left:0; z-index:0;">
        <!-- Colour overlay at 75% opacity — covers image with theme colour -->
        <div style="position:absolute; top:0; left:0; width:600px; height:240px; background-color:${currentColors.header}; opacity:0.75; z-index:1;"></div>` : ''}
        <!-- Text layer — always on top -->
        <div style="position:absolute; top:0; left:0; width:600px; height:240px; z-index:2; box-sizing:border-box; padding:40px 32px 32px 32px; display:flex; flex-direction:column; justify-content:flex-end;">
          <div style="display:inline-block; background:rgba(255,255,255,0.20); border:1px solid rgba(255,255,255,0.40); border-radius:20px; padding:4px 14px; font-size:11px; color:#ffffff; font-family:Arial,sans-serif; margin-bottom:14px; letter-spacing:0.5px; width:fit-content;">${month} ${year}</div>
          <div style="font-size:30px; font-weight:700; color:#ffffff; font-family:Arial,sans-serif; line-height:1.2; margin-bottom:8px; text-shadow:0 1px 4px rgba(0,0,0,0.4);">${bannerTitle}</div>
          <div style="font-size:14px; color:rgba(255,255,255,0.92); font-family:Arial,sans-serif; text-shadow:0 1px 3px rgba(0,0,0,0.3);">${bannerSubtitle} ${quarter} ${year}</div>
        </div>
      </div>
    </td>
  </tr>

  <!-- ── INTRO TEXT ─────────────────────────────────────────────────────── -->
  <tr>
    <td style="padding:28px 32px 20px 32px; background:#ffffff;">
      <p style="margin:0 0 12px 0; font-size:15px; color:#1f2328; font-family:Arial,sans-serif;">Hi team,</p>
      <p style="margin:0; font-size:13px; color:#57606a; font-family:Arial,sans-serif; line-height:1.7;">${introText}</p>
    </td>
  </tr>

  <!-- ── STATS SUMMARY ──────────────────────────────────────────────────── -->
  <tr>
    <td style="padding:0 32px 8px 32px; background:#ffffff;">
      ${sectionRibbon('A little data we can feel good about', '&#9641;')}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px; background:${currentColors.summaryBg}; border-radius:4px; border:1px solid ${currentColors.summaryBorder};">
        <tr>
          <td width="33%" align="center" style="padding:20px 8px;">
            <p style="margin:0; font-size:28px; font-weight:700; color:${currentColors.ibmColor}; font-family:Arial,sans-serif;">${ibmCount}</p>
            <p style="margin:4px 0 0 0; font-size:11px; color:#57606a; font-family:Arial,sans-serif; text-transform:uppercase; letter-spacing:0.5px;">IBM Events</p>
          </td>
          <td width="33%" align="center" style="padding:20px 8px; border-left:1px solid ${currentColors.summaryBorder}; border-right:1px solid ${currentColors.summaryBorder};">
            <p style="margin:0; font-size:28px; font-weight:700; color:${currentColors.thirdPartyColor}; font-family:Arial,sans-serif;">${thirdPartyCount}</p>
            <p style="margin:4px 0 0 0; font-size:11px; color:#57606a; font-family:Arial,sans-serif; text-transform:uppercase; letter-spacing:0.5px;">3rd Party Events</p>
          </td>
          <td width="33%" align="center" style="padding:20px 8px;">
            <p style="margin:0; font-size:28px; font-weight:700; color:${currentColors.onDemandColor}; font-family:Arial,sans-serif;">${onDemandCount}</p>
            <p style="margin:4px 0 0 0; font-size:11px; color:#57606a; font-family:Arial,sans-serif; text-transform:uppercase; letter-spacing:0.5px;">On-Demand</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── FEATURED EVENTS ───────────────────────────────────────────────── -->
  ${featuredEventsHTML ? `<tr><td style="padding:0 32px 8px 32px; background:#ffffff;">${featuredEventsHTML}</td></tr>` : ''}

  <!-- ── IBM EVENTS ────────────────────────────────────────────────────── -->
  ${ibmEventsHTML ? `<tr><td style="padding:0 32px 8px 32px; background:#ffffff;">${ibmEventsHTML}</td></tr>` : ''}

  <!-- ── 3RD PARTY EVENTS ──────────────────────────────────────────────── -->
  ${thirdPartyEventsHTML ? `<tr><td style="padding:0 32px 8px 32px; background:#ffffff;">${thirdPartyEventsHTML}</td></tr>` : ''}

  <!-- ── ON-DEMAND EVENTS ──────────────────────────────────────────────── -->
  ${onDemandEventsHTML ? `<tr><td style="padding:0 32px 8px 32px; background:#ffffff;">${onDemandEventsHTML}</td></tr>` : ''}

  <!-- ── CUSTOM SECTIONS ────────────────────────────────────────────────── -->
  ${customSectionsHTML ? `<tr><td style="padding:0 32px 8px 32px; background:#ffffff;">${customSectionsHTML}</td></tr>` : ''}

  <!-- ── NEWS LINKS ─────────────────────────────────────────────────────── -->
  ${newsHTML ? `<tr><td style="padding:0 32px 8px 32px; background:#ffffff;">${newsHTML}</td></tr>` : ''}

  <!-- ── PODCAST LINKS ──────────────────────────────────────────────────── -->
  ${podcastHTML ? `<tr><td style="padding:0 32px 8px 32px; background:#ffffff;">${podcastHTML}</td></tr>` : ''}

  <!-- ── SPACER ─────────────────────────────────────────────────────────── -->
  <tr><td style="height:24px; background:#ffffff;"></td></tr>

  <!-- ── FOOTER ─────────────────────────────────────────────────────────── -->
  <tr>
    <td bgcolor="${currentColors.footer}" style="padding:24px 32px; border-top:4px solid ${currentColors.sectionHeaderBorder};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:12px; color:rgba(255,255,255,0.9); font-family:Arial,sans-serif; line-height:1.6;">
            Questions? Reply to this email.<br>
            <span style="color:rgba(255,255,255,0.6);">© ${year} IBM Corporation. All rights reserved.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
<!-- End outer container -->
</div>
</body>
</html>`;
  };


  // Helper function to parse and sort events by date
  const parseEventDate = (dateString) => {
    // Handle date ranges like "16-17 June" or "11-12th June"
    const rangeMatch = dateString.match(/(\d+)(?:st|nd|rd|th)?[-–](\d+)(?:st|nd|rd|th)?\s+(\w+)/);
    if (rangeMatch) {
      const day = parseInt(rangeMatch[1]);
      const monthName = rangeMatch[3];
      const date = new Date(`${monthName} ${day}, ${year}`);
      console.log(`Parsed range date "${dateString}" as:`, date);
      return date;
    }
    
    // Handle single dates like "3 June" or "13th May"
    const singleMatch = dateString.match(/(\d+)(?:st|nd|rd|th)?\s+(\w+)/);
    if (singleMatch) {
      const day = parseInt(singleMatch[1]);
      const monthName = singleMatch[2];
      const date = new Date(`${monthName} ${day}, ${year}`);
      console.log(`Parsed single date "${dateString}" as:`, date);
      return date;
    }
    
    // If we can't parse it, return a far future date so it appears last
    console.log(`Could not parse date "${dateString}", using far future date`);
    return new Date('9999-12-31');
  };

  const sortEventsByDate = (eventsList) => {
    return [...eventsList].sort((a, b) => {
      const dateA = parseEventDate(a.date);
      const dateB = parseEventDate(b.date);
      return dateA - dateB;
    });
  };

  const ibmEvents = sortEventsByDate(events.filter(e => e.category === 'ibm'));
  const thirdPartyEvents = sortEventsByDate(events.filter(e => e.category === 'thirdParty'));
  const onDemandEvents = sortEventsByDate(events.filter(e => e.category === 'onDemand'));
  
  // Sort all events by date for display in the UI
  const sortedEvents = sortEventsByDate(events);

  return (
    <div className="marketing-spotlight-tab">
      <div style={{ padding: '24px', marginBottom: '2rem', background: 'linear-gradient(135deg, #060c2a 0%, #0f1f60 55%, #162880 100%)', borderBottom: '2px solid rgba(69,137,255,0.3)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '8px' }}>
          <Star size={24} />
          ✨ MARKETING SPOTLIGHT EMAIL BUILDER
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <Select
                id="colorScheme"
                labelText="🎨 Color Scheme"
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value)}
              >
                <SelectItem value="navy-teal" text="Professional Navy & Teal" />
                <SelectItem value="indigo-coral" text="Modern Indigo & Coral" />
                <SelectItem value="charcoal-gold" text="Executive Charcoal & Gold" />
                <SelectItem value="ibm-official" text="Official IBM Brand Colors" />
                <SelectItem value="all-blue" text="All Blue" />
                <SelectItem value="summer-sports" text="🎾 Summer of Sports (Wimbledon)" />
                <SelectItem value="pastel-spring" text="🌸 Pastel Spring" />
                <SelectItem value="pastel-ocean" text="🌊 Pastel Ocean" />
                <SelectItem value="pastel-sunset" text="🌅 Pastel Sunset" />
                <SelectItem value="pastel-lavender" text="💜 Pastel Lavender" />
                <SelectItem value="pastel-mint" text="🍃 Pastel Mint" />
                <SelectItem value="pastel-peach" text="🍑 Pastel Peach" />
              </Select>
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
            </div>
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#525252', marginBottom: '0.5rem' }}>📐 Layout Style</p>
              <RadioButtonGroup
                name="layoutStyle"
                valueSelected={layoutStyle}
                onChange={(val) => setLayoutStyle(val)}
                orientation="horizontal"
              >
                <RadioButton id="layout-classic" labelText="Classic" value="classic" />
                <RadioButton id="layout-modern" labelText="Modern" value="modern" />
              </RadioButtonGroup>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <TextInput
                id="bannerTitle"
                labelText="📝 Banner Title"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                placeholder="UKI Marketing Spotlight"
              />
              <TextInput
                id="bannerSubtitle"
                labelText="📝 Banner Subtitle"
                value={bannerSubtitle}
                onChange={(e) => setBannerSubtitle(e.target.value)}
                placeholder="Don't miss what's coming up in"
              />
            </div>
            {layoutStyle === 'modern' && (
              <div style={{ marginTop: '1rem' }}>
                <TextInput
                  id="heroImageUrl"
                  labelText="🖼️ Hero Image URL (Modern layout)"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  helperText="Paste any image URL. Leave blank for a solid colour header."
                />
              </div>
            )}
            
            {/* Custom Color Overrides */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>🎨 Custom Color Overrides</h4>
                <Checkbox
                  id="useCustomColors"
                  labelText="Enable Custom Colors"
                  checked={useCustomColors}
                  onChange={(e) => setUseCustomColors(e.target.checked)}
                />
              </div>
              
              {useCustomColors && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {[
                    { key: 'header', label: 'Header Background', placeholder: '#8a3ffc' },
                    { key: 'featured', label: 'Featured Event Color', placeholder: '#8a3ffc' },
                    { key: 'summaryBg', label: 'Summary Background', placeholder: '#e8f4ff' },
                    { key: 'summaryBorder', label: 'Summary Border', placeholder: '#0f62fe' },
                    { key: 'ibmBorder', label: 'IBM Events Border', placeholder: '#0f62fe' },
                    { key: 'ibmColor', label: 'IBM Events Text', placeholder: '#0f62fe' },
                    { key: 'thirdPartyBorder', label: '3rd Party Border', placeholder: '#198038' },
                    { key: 'thirdPartyColor', label: '3rd Party Text', placeholder: '#8a3ffc' },
                    { key: 'onDemandBorder', label: 'On-Demand Border', placeholder: '#8a3ffc' },
                    { key: 'onDemandColor', label: 'On-Demand Text', placeholder: '#0072c3' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: '600', color: '#525252' }}>
                        {label}
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={customColors[key]}
                          onChange={(e) => setCustomColors({...customColors, [key]: e.target.value})}
                          style={{
                            width: '50px',
                            height: '40px',
                            border: '1px solid #8d8d8d',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        />
                        <TextInput
                          id={`${key}Color`}
                          labelText=""
                          value={customColors[key]}
                          onChange={(e) => setCustomColors({...customColors, [key]: e.target.value})}
                          placeholder={placeholder}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                <div style={{ fontSize: '14px', color: '#525252' }}>Webinars</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#fdd13a' }}>{events.filter(e => e.featured).length}</div>
                <div style={{ fontSize: '14px', color: '#525252' }}>Featured Events</div>
              </div>
            </div>
          </Tile>
        </Column>

        {/* Inline Editable Intro Text */}
        <Column lg={16}>
          <div style={{ marginBottom: '1rem' }}>
            {introText !== null && (
              <InlineEditableIntroText value={introText} onChange={setIntroText} />
            )}
          </div>
        </Column>

        {/* Events List */}
        <Column lg={16}>
          <Tile style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>📅 Events ({events.length})</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  kind="secondary"
                  renderIcon={Download}
                  onClick={() => setImportModalOpen(true)}
                >
                  Import from Event Library
                </Button>
                <Button
                  kind="primary"
                  renderIcon={Add}
                  onClick={() => setShowAddModal(true)}
                >
                  Add Event
                </Button>
              </div>
            </div>

            {events.length === 0 ? (
              <div style={{ color: '#525252', textAlign: 'center', padding: '2rem 0' }}>
                No events added yet. Click "Add Event" to get started.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {sortedEvents.map((event) => {
                  // Find the original index in the unsorted events array
                  const originalIndex = events.findIndex(e => e.id === event.id);
                  return (
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
                            👥 {event.audience}{event.industry ? ` · ${event.industry}` : ''}
                          </p>
                        )}
                        {!event.audience && event.industry && (
                          <p style={{ margin: '0.25rem 0', fontSize: '14px', color: '#525252' }}>
                            🏭 {event.industry}
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
                          onClick={() => handleEditEvent(originalIndex)}
                        />
                        <Button
                          kind="danger--ghost"
                          size="sm"
                          renderIcon={TrashCan}
                          iconDescription="Delete"
                          hasIconOnly
                          onClick={() => handleDeleteEvent(originalIndex)}
                        />
                      </ButtonSet>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </Tile>
        </Column>

        {/* Thought Leadership & On Demand Assets Links */}
        <Column lg={16}>
          <Tile style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>📰 Thought Leadership & On Demand Assets ({newsLinks.length})</h3>
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
              <div style={{ color: '#525252', textAlign: 'center', padding: '1rem 0' }}>
                No news links added yet. These will appear at the bottom of your communication.
              </div>
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
              <div style={{ color: '#525252', textAlign: 'center', padding: '1rem 0' }}>
                No podcast/webinar links added yet. These will appear at the bottom of your communication.
              </div>
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

        {/* RevTech Enablement and Results */}
        <Column lg={16}>
          <Tile style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>🚀 RevTech Enablement and Results</h3>
              <Button
                kind="primary"
                size="sm"
                renderIcon={Edit}
                onClick={() => setShowRevTechContentModal(true)}
              >
                Edit Content
              </Button>
            </div>

            {/* Content Display */}
            {revTechContent && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#161616',
                  margin: '0.5rem 0 1rem 0',
                  padding: '0.75rem',
                  background: '#f4f4f4',
                  borderRadius: '4px'
                }}
                dangerouslySetInnerHTML={{ __html: revTechContent }}
              />
            )}

            {/* Links Section */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Links ({revTechLinks.length})</h4>
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={Add}
                  onClick={() => {
                    setRevTechLinkForm({ title: '', url: '', description: '' });
                    setEditingRevTechLink(null);
                    setShowRevTechModal(true);
                  }}
                >
                  Add Link
                </Button>
              </div>

              {revTechLinks.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#525252', margin: '0.5rem 0' }}>
                  No links added yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {revTechLinks.map((link, index) => (
                    <div
                      key={link.id}
                      style={{
                        padding: '0.5rem',
                        background: 'white',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '13px', fontWeight: '500' }}>
                          {link.title}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#8a3ffc', wordBreak: 'break-all' }}>
                          {link.url}
                        </p>
                        {link.description && (
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '11px', color: '#525252' }}>
                            {link.description}
                          </p>
                        )}
                      </div>
                      <Button
                        kind="danger--ghost"
                        size="sm"
                        renderIcon={TrashCan}
                        iconDescription="Delete link"
                        hasIconOnly
                        onClick={() => handleDeleteRevTechLink(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Events Section */}
            {revTechEvents.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '12px', fontWeight: '600', color: '#525252' }}>
                  Events in this section:
                </h5>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {revTechEvents.map((event) => (
                    <div
                      key={event.id}
                      style={{
                        padding: '0.5rem',
                        background: 'white',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        borderLeft: `3px solid ${
                          event.category === 'ibm' ? currentColors.ibmBorder :
                          event.category === 'third-party' ? currentColors.thirdPartyBorder :
                          currentColors.onDemandBorder
                        }`
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '13px', fontWeight: '500' }}>
                          {event.title}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#525252' }}>
                          📅 {event.date} | {event.category === 'ibm' ? '🏢 IBM' : event.category === 'third-party' ? '🤝 3rd Party' : '📺 On-Demand'}
                        </p>
                      </div>
                      <Button
                        kind="danger--ghost"
                        size="sm"
                        renderIcon={TrashCan}
                        iconDescription="Remove event"
                        hasIconOnly
                        onClick={() => handleDeleteRevTechEvent(event.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              kind="ghost"
              size="sm"
              renderIcon={Add}
              onClick={() => setShowRevTechEventModal(true)}
              style={{ marginTop: '0.5rem' }}
            >
              Add Event
            </Button>
          </Tile>
        </Column>

        {/* Custom Sections */}
        <Column lg={16}>
          <Tile style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>📋 Custom Sections</h3>
              <Button
                kind="primary"
                size="sm"
                renderIcon={Add}
                type="button"
                onClick={(e) => {
                  console.log('=== ADD SECTION BUTTON CLICKED ===');
                  console.log('Event:', e);
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Setting showCustomSectionModal to true');
                  setEditingCustomSection(null);
                  setCustomSectionForm({ title: '', content: '', links: [], events: [] });
                  setShowCustomSectionModal(true);
                  console.log('State should be updated now');
                }}
              >
                Add Section
              </Button>
            </div>

            {customSections.length === 0 ? (
              <div style={{ color: '#525252', textAlign: 'center', padding: '1rem 0' }}>
                No custom sections added yet. Add sections to include additional content in your communication.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {customSections.map((section, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      background: '#f4f4f4',
                      borderRadius: '4px',
                      borderLeft: `4px solid ${currentColors.featured}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                        {section.title}
                      </h4>
                      <ButtonSet>
                        <Button
                          kind="ghost"
                          size="sm"
                          renderIcon={Edit}
                          iconDescription="Edit section"
                          hasIconOnly
                          onClick={() => handleEditCustomSection(index)}
                        />
                        <Button
                          kind="ghost"
                          size="sm"
                          iconDescription="Move up"
                          hasIconOnly
                          disabled={index === 0}
                          onClick={() => handleMoveCustomSection(index, 'up')}
                        >
                          ↑
                        </Button>
                        <Button
                          kind="ghost"
                          size="sm"
                          iconDescription="Move down"
                          hasIconOnly
                          disabled={index === customSections.length - 1}
                          onClick={() => handleMoveCustomSection(index, 'down')}
                        >
                          ↓
                        </Button>
                        <Button
                          kind="danger--ghost"
                          size="sm"
                          renderIcon={TrashCan}
                          iconDescription="Delete section"
                          hasIconOnly
                          onClick={() => handleDeleteCustomSection(index)}
                        />
                      </ButtonSet>
                    </div>

                    {section.content && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#161616',
                          margin: '0.5rem 0',
                          padding: '0.5rem',
                          background: 'white',
                          borderRadius: '4px'
                        }}
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    )}

                    {section.links.length === 0 ? (
                      <div style={{ fontSize: '12px', color: '#525252', margin: '0.5rem 0' }}>
                        No links added to this section yet.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {section.links.map((link, linkIndex) => (
                          <div
                            key={linkIndex}
                            style={{
                              padding: '0.5rem',
                              background: 'white',
                              borderRadius: '4px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'start'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: '0 0 0.25rem 0', fontSize: '13px', fontWeight: '500' }}>
                                {link.title}
                              </p>
                              <p style={{ margin: 0, fontSize: '11px', color: '#8a3ffc', wordBreak: 'break-all' }}>
                                {link.url}
                              </p>
                              {link.description && (
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '11px', color: '#525252' }}>
                                  {link.description}
                                </p>
                              )}
                            </div>
                            <Button
                              kind="danger--ghost"
                              size="sm"
                              renderIcon={TrashCan}
                              iconDescription="Delete link"
                              hasIconOnly
                              onClick={() => handleDeleteLinkFromCustomSection(index, linkIndex)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {section.events && section.events.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '12px', fontWeight: '600', color: '#525252' }}>
                          Events in this section:
                        </h5>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          {section.events.map((event) => (
                            <div
                              key={event.id}
                              style={{
                                padding: '0.5rem',
                                background: 'white',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                borderLeft: `3px solid ${
                                  event.category === 'ibm' ? currentColors.ibmBorder :
                                  event.category === 'third-party' ? currentColors.thirdPartyBorder :
                                  currentColors.onDemandBorder
                                }`
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '13px', fontWeight: '500' }}>
                                  {event.title}
                                </p>
                                <p style={{ margin: 0, fontSize: '11px', color: '#525252' }}>
                                  📅 {event.date} | {event.category === 'ibm' ? '🏢 IBM' : event.category === 'third-party' ? '🤝 3rd Party' : '📺 On-Demand'}
                                </p>
                              </div>
                              <Button
                                kind="danger--ghost"
                                size="sm"
                                renderIcon={TrashCan}
                                iconDescription="Remove event"
                                hasIconOnly
                                onClick={() => handleDeleteEventFromCustomSection(index, event.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <ButtonSet style={{ marginTop: '0.5rem' }}>
                      <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={Add}
                        onClick={() => {
                          setEditingCustomSectionForLink(index);
                          setCustomSectionLinkForm({ title: '', url: '', description: '' });
                          setShowCustomSectionLinkModal(true);
                        }}
                      >
                        Add Link
                      </Button>
                      <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={Add}
                        onClick={() => {
                          setEditingCustomSectionForLink(index);
                          setShowCustomSectionEventModal(true);
                        }}
                      >
                        Add Event
                      </Button>
                    </ButtonSet>
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

      {/* Import from Event Library Modal */}
      <Modal
        open={importModalOpen}
        onRequestClose={() => setImportModalOpen(false)}
        modalHeading="Import from Event Library"
        passiveModal
        size="sm"
      >
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search events..."
            value={importSearch}
            onChange={(e) => setImportSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '14px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        {importLoading ? (
          <p style={{ color: '#525252', fontSize: '14px' }}>Loading events...</p>
        ) : (() => {
          const filtered = importEvents.filter((e) =>
            e.title.toLowerCase().includes(importSearch.toLowerCase())
          );
          if (filtered.length === 0) {
            return (
              <p style={{ color: '#525252', fontSize: '14px', textAlign: 'center', padding: '1rem 0' }}>
                No active upcoming events found.
              </p>
            );
          }
          return (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filtered.map((e) => (
                <div
                  key={e.id}
                  onClick={() => {
                    setEventForm(mapLibraryEventToForm(e));
                    setEditingEvent(null);
                    setImportModalOpen(false);
                    setShowAddModal(true);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: '#fff',
                  }}
                  onMouseEnter={(ev) => ev.currentTarget.style.backgroundColor = '#f4f4f4'}
                  onMouseLeave={(ev) => ev.currentTarget.style.backgroundColor = '#fff'}
                >
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{e.title}</div>
                  <div style={{ fontSize: '12px', color: '#525252' }}>
                    {formatLibraryDateRange(e.startDate, e.endDate)}
                    {e.locationDetails ? ` · ${e.locationDetails}` : ''}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </Modal>

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
        size="sm"
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                {eventForm.date ? (
                  <TextInput
                    id="event-date-display"
                    labelText="Date *"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  />
                ) : (
                  <DatePicker
                    datePickerType="range"
                    onChange={(dates) => {
                      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                         'July', 'August', 'September', 'October', 'November', 'December'];
                      if (dates && dates.length === 2 && dates[1]) {
                        const start = new Date(dates[0]);
                        const end = new Date(dates[1]);
                        const startDay = start.getDate();
                        const endDay = end.getDate();
                        const startMonth = monthNames[start.getMonth()];
                        const endMonth = monthNames[end.getMonth()];
                        const sameDay = start.getDate() === end.getDate() && start.getMonth() === end.getMonth();
                        const formattedDate = sameDay
                          ? `${startDay} ${startMonth}`
                          : startMonth === endMonth
                            ? `${startDay}–${endDay} ${startMonth}`
                            : `${startDay} ${startMonth}–${endDay} ${endMonth}`;
                        setEventForm({ ...eventForm, date: formattedDate });
                      } else if (dates && dates.length >= 1 && dates[0]) {
                        const start = new Date(dates[0]);
                        const formattedDate = `${start.getDate()} ${monthNames[start.getMonth()]}`;
                        setEventForm({ ...eventForm, date: formattedDate });
                      }
                    }}
                  >
                    <DatePickerInput
                      id="event-date-start"
                      labelText="Date *"
                      placeholder="Start date"
                    />
                    <DatePickerInput
                      id="event-date-end"
                      labelText="End Date (optional)"
                      placeholder="End date"
                    />
                  </DatePicker>
                )}
              </div>
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
              <Select
                id="event-industry"
                labelText="Industry"
                value={eventForm.industry}
                onChange={(e) => setEventForm({ ...eventForm, industry: e.target.value })}
              >
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
              id="event-contact-email"
              labelText="Contact Email (For Invite-Only Events)"
              placeholder="e.g., john.doe@ibm.com"
              value={eventForm.contactEmail}
              onChange={(e) => setEventForm({ ...eventForm, contactEmail: e.target.value })}
              helperText="Use this for invite-only events instead of a registration link"
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
              disabled={
                !eventForm.featured &&
                events.filter(e => e.featured).length >= 3 &&
                (editingEvent === null || !events[editingEvent]?.featured)
              }
            />
            {!eventForm.featured && events.filter(e => e.featured).length >= 3 && (
              <p style={{ fontSize: '12px', color: '#da1e28', marginTop: '0.5rem' }}>
                ⚠️ Maximum of 3 featured events reached. Unmark an existing featured event to add a new one.
              </p>
            )}
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
        size="sm"
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
        size="sm"
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

      {/* Rev Tech Link Modal */}
      <Modal
        open={showRevTechModal}
        onRequestClose={() => {
          setShowRevTechModal(false);
          setRevTechLinkForm({ title: '', url: '', description: '' });
          setEditingRevTechLink(null);
        }}
        modalHeading={editingRevTechLink !== null ? 'Edit Rev Tech Link' : 'Add Rev Tech Link'}
        primaryButtonText={editingRevTechLink !== null ? 'Update Link' : 'Add Link'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleAddRevTechLink}
        size="sm"
      >
        <Form>
          <Stack gap={5}>
            <TextInput
              id="revtech-title"
              labelText="Link Title *"
              placeholder="e.g., Revenue Enablement Success Story"
              value={revTechLinkForm.title}
              onChange={(e) => setRevTechLinkForm({ ...revTechLinkForm, title: e.target.value })}
            />

            <TextInput
              id="revtech-url"
              labelText="URL *"
              placeholder="https://..."
              value={revTechLinkForm.url}
              onChange={(e) => setRevTechLinkForm({ ...revTechLinkForm, url: e.target.value })}
            />

            <TextArea
              id="revtech-description"
              labelText="Description (Optional)"
              placeholder="Brief description of the resource"
              rows={3}
              value={revTechLinkForm.description}
              onChange={(e) => setRevTechLinkForm({ ...revTechLinkForm, description: e.target.value })}
            />
          </Stack>
        </Form>
      </Modal>

      {/* Rev Tech Content Modal */}
      <Modal
        open={showRevTechContentModal}
        onRequestClose={() => setShowRevTechContentModal(false)}
        modalHeading="Edit Rev Tech Content"
        primaryButtonText="Save Content"
        secondaryButtonText="Cancel"
        onRequestSubmit={() => {
          setShowRevTechContentModal(false);
          toast.success('Rev Tech content updated!');
        }}
        size="sm"
      >
        <Form>
          <Stack gap={5}>
            <RichTextEditor
              label="Section Content (Optional)"
              value={revTechContent}
              onChange={(value) => setRevTechContent(value)}
              placeholder="Add any additional information, announcements, or formatted text here..."
            />
          </Stack>
        </Form>
      </Modal>

      {/* Rev Tech Event Modal */}
      <Modal
        open={showRevTechEventModal}
        onRequestClose={() => {
          setShowRevTechEventModal(false);
          setRevTechEventForm({
            title: '',
            date: '',
            category: 'ibm',
            location: '',
            audience: '',
            registrationLink: '',
            contactEmail: '',
            seismicLink: '',
            featured: false
          });
        }}
        modalHeading="Add Event to Rev Tech Section"
        primaryButtonText="Add Event"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleAddRevTechEvent}
        size="sm"
      >
        <Form>
          <Stack gap={6}>
            <TextInput
              id="revtech-event-title"
              labelText="Event Title *"
              placeholder="e.g., From AI Ambition to Business Value"
              value={revTechEventForm.title}
              onChange={(e) => setRevTechEventForm({ ...revTechEventForm, title: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <DatePicker
                  datePickerType="single"
                  onChange={(dates) => {
                    if (dates && dates.length > 0) {
                      const date = new Date(dates[0]);
                      const day = date.getDate();
                      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                         'July', 'August', 'September', 'October', 'November', 'December'];
                      const monthName = monthNames[date.getMonth()];
                      const formattedDate = `${day} ${monthName}`;
                      setRevTechEventForm({ ...revTechEventForm, date: formattedDate });
                    }
                  }}
                >
                  <DatePickerInput
                    id="revtech-event-date"
                    labelText="Date *"
                    placeholder="mm/dd/yyyy"
                    value={revTechEventForm.date}
                  />
                </DatePicker>
              </div>
              <Select
                id="revtech-event-category"
                labelText="Category *"
                value={revTechEventForm.category}
                onChange={(e) => setRevTechEventForm({ ...revTechEventForm, category: e.target.value })}
              >
                <SelectItem value="ibm" text="IBM Event" />
                <SelectItem value="thirdParty" text="3rd Party Event" />
                <SelectItem value="onDemand" text="On-Demand/Webinar" />
              </Select>
            </div>

            <TextInput
              id="revtech-event-location"
              labelText="Location"
              placeholder="e.g., The Ivy Soho Brasserie, London"
              value={revTechEventForm.location}
              onChange={(e) => setRevTechEventForm({ ...revTechEventForm, location: e.target.value })}
            />

            <TextArea
              id="revtech-event-audience"
              labelText="Target Audience"
              placeholder="e.g., 12-15 Senior Leaders, C-Suite executives"
              rows={2}
              value={revTechEventForm.audience}
              onChange={(e) => setRevTechEventForm({ ...revTechEventForm, audience: e.target.value })}
            />

            <TextInput
              id="revtech-event-registration-link"
              labelText="Registration Link (Optional)"
              placeholder="https://registration-url.com"
              value={revTechEventForm.registrationLink}
              onChange={(e) => setRevTechEventForm({ ...revTechEventForm, registrationLink: e.target.value })}
            />

            <TextInput
              id="revtech-event-contact-email"
              labelText="Contact Email (For Invite-Only Events)"
              placeholder="e.g., john.doe@ibm.com"
              value={revTechEventForm.contactEmail}
              onChange={(e) => setRevTechEventForm({ ...revTechEventForm, contactEmail: e.target.value })}
              helperText="Use this for invite-only events instead of a registration link"
            />

            <TextInput
              id="revtech-event-seismic-link"
              labelText="Seismic Page Link (Optional)"
              placeholder="https://seismic-page-url.com"
              value={revTechEventForm.seismicLink}
              onChange={(e) => setRevTechEventForm({ ...revTechEventForm, seismicLink: e.target.value })}
            />

            <p style={{ fontSize: '12px', color: '#525252', fontStyle: 'italic', margin: '0.5rem 0' }}>
              Note: This event will only appear in the Rev Tech section, not in the main event categories.
            </p>
          </Stack>
        </Form>
      </Modal>

      {/* Custom Section Modal */}
      <Modal
        key="custom-section-modal"
        open={showCustomSectionModal}
        modalLabel="Custom Sections"
        onRequestClose={() => {
          console.log('Modal close requested');
          setShowCustomSectionModal(false);
          setCustomSectionForm({ title: '', content: '', links: [] });
          setEditingCustomSection(null);
        }}
        modalHeading={editingCustomSection !== null ? 'Edit Custom Section' : 'Add Custom Section'}
        primaryButtonText={editingCustomSection !== null ? 'Update Section' : 'Add Section'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleAddCustomSection}
        size="sm"
        preventCloseOnClickOutside={false}
      >
        <Form>
          <Stack gap={5}>
            <TextInput
              id="custom-section-title"
              labelText="Section Title *"
              placeholder="e.g., Resources, Training, Community"
              value={customSectionForm.title}
              onChange={(e) => setCustomSectionForm({ ...customSectionForm, title: e.target.value })}
            />

            <RichTextEditor
              label="Section Content (Optional)"
              value={customSectionForm.content}
              onChange={(value) => setCustomSectionForm({ ...customSectionForm, content: value })}
              placeholder="Add any additional information, announcements, or formatted text here..."
            />
          </Stack>
        </Form>
      </Modal>

      {/* Custom Section Link Modal */}
      <Modal
        open={showCustomSectionLinkModal}
        onRequestClose={() => {
          setShowCustomSectionLinkModal(false);
          setCustomSectionLinkForm({ title: '', url: '', description: '' });
          setEditingCustomSectionForLink(null);
        }}
        modalHeading="Add Link to Section"
        primaryButtonText="Add Link"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleAddLinkToCustomSection}
        size="sm"
      >
        <Form>
          <Stack gap={5}>
            <TextInput
              id="custom-link-title"
              labelText="Link Title *"
              placeholder="e.g., Getting Started Guide"
              value={customSectionLinkForm.title}
              onChange={(e) => setCustomSectionLinkForm({ ...customSectionLinkForm, title: e.target.value })}
            />

            <TextInput
              id="custom-link-url"
              labelText="URL *"
              placeholder="https://..."
              value={customSectionLinkForm.url}
              onChange={(e) => setCustomSectionLinkForm({ ...customSectionLinkForm, url: e.target.value })}
            />

            <TextArea
              id="custom-link-description"
              labelText="Description (Optional)"
              placeholder="Brief description of the link"
              rows={3}
              value={customSectionLinkForm.description}
              onChange={(e) => setCustomSectionLinkForm({ ...customSectionLinkForm, description: e.target.value })}
            />
          </Stack>
        </Form>
      </Modal>

      {/* Custom Section Event Modal */}
      <Modal
        open={showCustomSectionEventModal}
        onRequestClose={() => {
          setShowCustomSectionEventModal(false);
          setCustomSectionEventForm({
            title: '',
            date: '',
            category: 'ibm',
            location: '',
            audience: '',
            registrationLink: '',
            contactEmail: '',
            seismicLink: '',
            featured: false
          });
          setEditingCustomSectionForLink(null);
        }}
        modalHeading="Add Event to Section"
        primaryButtonText="Add Event"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleAddEventToCustomSection}
        size="sm"
      >
        <Form>
          <Stack gap={6}>
            <TextInput
              id="custom-event-title"
              labelText="Event Title *"
              placeholder="e.g., From AI Ambition to Business Value"
              value={customSectionEventForm.title}
              onChange={(e) => setCustomSectionEventForm({ ...customSectionEventForm, title: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <DatePicker
                  datePickerType="single"
                  onChange={(dates) => {
                    if (dates && dates.length > 0) {
                      const date = new Date(dates[0]);
                      const day = date.getDate();
                      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                         'July', 'August', 'September', 'October', 'November', 'December'];
                      const monthName = monthNames[date.getMonth()];
                      const formattedDate = `${day} ${monthName}`;
                      setCustomSectionEventForm({ ...customSectionEventForm, date: formattedDate });
                    }
                  }}
                >
                  <DatePickerInput
                    id="custom-event-date"
                    labelText="Date *"
                    placeholder="mm/dd/yyyy"
                    value={customSectionEventForm.date}
                  />
                </DatePicker>
              </div>
              <Select
                id="custom-event-category"
                labelText="Category *"
                value={customSectionEventForm.category}
                onChange={(e) => setCustomSectionEventForm({ ...customSectionEventForm, category: e.target.value })}
              >
                <SelectItem value="ibm" text="IBM Event" />
                <SelectItem value="thirdParty" text="3rd Party Event" />
                <SelectItem value="onDemand" text="On-Demand/Webinar" />
              </Select>
            </div>

            <TextInput
              id="custom-event-location"
              labelText="Location"
              placeholder="e.g., The Ivy Soho Brasserie, London"
              value={customSectionEventForm.location}
              onChange={(e) => setCustomSectionEventForm({ ...customSectionEventForm, location: e.target.value })}
            />

            <TextArea
              id="custom-event-audience"
              labelText="Target Audience"
              placeholder="e.g., 12-15 Senior Leaders, C-Suite executives"
              rows={2}
              value={customSectionEventForm.audience}
              onChange={(e) => setCustomSectionEventForm({ ...customSectionEventForm, audience: e.target.value })}
            />

            <TextInput
              id="custom-event-registration-link"
              labelText="Registration Link (Optional)"
              placeholder="https://registration-url.com"
              value={customSectionEventForm.registrationLink}
              onChange={(e) => setCustomSectionEventForm({ ...customSectionEventForm, registrationLink: e.target.value })}
            />

            <TextInput
              id="custom-event-contact-email"
              labelText="Contact Email (For Invite-Only Events)"
              placeholder="e.g., john.doe@ibm.com"
              value={customSectionEventForm.contactEmail}
              onChange={(e) => setCustomSectionEventForm({ ...customSectionEventForm, contactEmail: e.target.value })}
              helperText="Use this for invite-only events instead of a registration link"
            />

            <TextInput
              id="custom-event-seismic-link"
              labelText="Seismic Page Link (Optional)"
              placeholder="https://seismic-page-url.com"
              value={customSectionEventForm.seismicLink}
              onChange={(e) => setCustomSectionEventForm({ ...customSectionEventForm, seismicLink: e.target.value })}
            />

            <p style={{ fontSize: '12px', color: '#525252', fontStyle: 'italic', margin: '0.5rem 0' }}>
              Note: This event will only appear in this custom section, not in the main event categories.
            </p>
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
