import React, { useState, useEffect } from 'react';
import {
  Form,
  Stack,
  TextInput,
  TextArea,
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Select,
  SelectItem,
  MultiSelect,
  Grid,
  Column,
  Modal,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Tag,
  Tile,
  Checkbox,
  IconButton,
  FileUploader,
} from '@carbon/react';
import {
  Add,
  Edit,
  TrashCan,
  View,
  Checkmark,
  Save,
  Close,
  Calendar,
  Location,
  Link as LinkIcon,
  TextBold,
  TextItalic,
  TextUnderline,
  List,
  Copy,
  Document,
} from '@carbon/icons-react';
import { toast } from 'react-toastify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import { useUser } from '../contexts/UserContext';

const PRODUCT_AREAS = [
  { id: 'hybrid-cloud', label: '☁️ Hybrid Cloud & Infrastructure Management', icon: '☁️' },
  { id: 'data-ai', label: '🤖 Data & AI', icon: '🤖' },
  { id: 'automation', label: '⚙️ Business Automation', icon: '⚙️' },
  { id: 'security', label: '🔒 Security', icon: '🔒' },
  { id: 'transaction', label: '💳 Transaction Processing', icon: '💳' },
  { id: 'quantum', label: '🔬 Quantum', icon: '🔬' },
];

const EVENT_TYPES = [
  'Innovation Studio Workshop',
  'Innovation Studio Event',
  'Third Party Event',
  'Webinar',
  'Roundtable',
  'Hospitality Dinner',
];

const TARGET_AUDIENCES = [
  'Technical',
  'Business',
  'Executive',
  'Developer',
  'Data Scientist',
  'IT Manager',
  'C-Suite',
  'All',
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

const INDUSTRIES = [
  'Cross-Industry',
  'Financial Services',
  'Healthcare & Life Sciences',
  'Retail & Consumer Products',
  'Manufacturing',
  'Telecommunications',
  'Energy & Utilities',
  'Government & Public Sector',
  'Transportation & Logistics',
  'Media & Entertainment',
  'Education',
  'Insurance',
  'Travel & Hospitality',
  'Automotive',
  'Aerospace & Defense',
];

const ManageEventsTab = () => {
  const { hasRole } = useUser();
  const isAdmin = hasRole('admin');
  
  const [events, setEvents] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    endDate: '',
    time: '',
    location: '',
    locationType: 'virtual',
    summary: '',
    description: '',
    registrationLink: '',
    seismicLink: '',
    sellerInvite: null, // Will store { name: string, data: string (base64), type: string }
    agenda: '', // Seller-only field, not in client comms
    eventContacts: '', // Seller-only field, not in client comms
    postEventFollowUp: '', // Post event follow-up notes
    postEventDocuments: [], // Array of { name: string, data: string (base64), size: number }
    productAreas: [],
    eventType: 'Webinar',
    targetAudience: 'All',
    targetRoles: [],
    industry: 'Cross-Industry',
    featured: false,
    status: 'Active',
  });

  // Common emojis for business communications
  const emojis = [
    '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
    '🔗', '🎨', '💝', '🧑‍💼',
    '😊', '👍', '🎉', '✨', '💡', '🚀', '📅', '📧', '📊', '💼',
    '🎯', '✅', '⭐', '🔔', '📢', '🎓', '🏆', '💪', '🤝', '👏',
    '📱', '💻', '🌟', '🔥', '💯', '📈', '🎊', '🙌', '❤️', '👋',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
    '🏒', '🏑', '🥅', '⛳', '🏹', '🎣', '🥊', '🥋', '⛷️', '🏂',
    '💾', '🖥️', '⌨️', '🖱️', '🖨️', '📡', '🔌', '🔋', '⚡', '🌐',
    '🔒', '🔓', '🔐', '🛡️', '⚙️', '🔧', '🔩', '⚗️', '🧪', '🧬'
  ];

  const insertEmojiInSummary = (emoji) => {
    if (!emoji || !summaryEditor) return;
    summaryEditor.chain().focus().insertContent(emoji).run();
  };

  // TipTap editor for summary
  const summaryEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: true,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Bold,
      Italic,
      Underline,
    ],
    content: formData.summary || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      if (text.length <= 500) {
        setFormData(prev => ({ ...prev, summary: html }));
      }
    },
  });

  // Update editor content when formData.summary changes (e.g., when editing an event)
  useEffect(() => {
    if (summaryEditor && formData.summary !== summaryEditor.getHTML()) {
      summaryEditor.commands.setContent(formData.summary || '');
    }
  }, [formData.summary, summaryEditor]);

  // TipTap editor for description
  const descriptionEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: true,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Bold,
      Italic,
      Underline,
    ],
    content: formData.description || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({ ...prev, description: html }));
    },
  });

  // Update description editor content when formData.description changes
  useEffect(() => {
    if (descriptionEditor && formData.description !== descriptionEditor.getHTML()) {
      descriptionEditor.commands.setContent(formData.description || '');
    }
  }, [formData.description, descriptionEditor]);

  useEffect(() => {
    loadEvents();
    
    // Listen for event updates (including from this component)
    const handleEventsUpdate = () => {
      loadEvents();
    };
    
    window.addEventListener('eventsUpdated', handleEventsUpdate);
    
    return () => {
      window.removeEventListener('eventsUpdated', handleEventsUpdate);
    };
  }, []);

  const loadEvents = () => {
    const savedEvents = JSON.parse(localStorage.getItem('managed_events') || '[]');
    
    // Auto-archive past events
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today
    
    let hasChanges = false;
    const updatedEvents = savedEvents.map(event => {
      // Check if event is past and still active
      const eventDate = new Date(event.endDate || event.date);
      eventDate.setHours(23, 59, 59, 999); // Set to end of event day
      
      if (eventDate < now && event.status === 'Active') {
        hasChanges = true;
        return { ...event, status: 'Archived' };
      }
      return event;
    });
    
    // Save changes if any events were archived
    if (hasChanges) {
      localStorage.setItem('managed_events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      notifyEventUpdate();
      toast.info('📦 Past events have been automatically archived', { autoClose: 3000 });
    } else {
      setEvents(savedEvents);
    }
  };

  const notifyEventUpdate = () => {
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('eventsUpdated'));
  };

  const handleDuplicate = (event) => {
    const duplicatedEvent = {
      ...event,
      id: Date.now().toString(),
      title: `${event.title} (Copy)`,
      status: 'Draft',
      date: '',
      endDate: '',
      time: '',
    };
    
    setCurrentEvent(null);
    setFormData({
      ...duplicatedEvent,
      productAreas: duplicatedEvent.productAreas || [],
      targetRoles: duplicatedEvent.targetRoles || [],
      seismicLink: duplicatedEvent.seismicLink || '',
      endDate: duplicatedEvent.endDate || '',
      industry: duplicatedEvent.industry || 'Cross-Industry',
    });
    setIsEditing(false);
    setIsFormOpen(true);
    
    toast.success('📋 Event duplicated! Update the date and details.', {
      autoClose: 3000,
      icon: <Copy size={24} />
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProductAreasChange = (selectedItems) => {
    setFormData(prev => ({
      ...prev,
      productAreas: selectedItems.selectedItems.map(item => item.id)
    }));
  };

  const handleTargetRoleToggle = (roleId) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(roleId)
        ? prev.targetRoles.filter(id => id !== roleId)
        : [...prev.targetRoles, roleId]
    }));
  };

  const handleSellerInviteUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if it's a Word document
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a Word document (.doc or .docx)', { autoClose: 3000 });
        return;
      }

      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          sellerInvite: {
            name: file.name,
            data: event.target.result,
            type: file.type,
            size: file.size
          }
        }));
        toast.success(`📄 Seller invite "${file.name}" uploaded successfully`, { autoClose: 3000 });
      };
      reader.onerror = () => {
        toast.error('Failed to upload file', { autoClose: 3000 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSellerInvite = () => {
    setFormData(prev => ({
      ...prev,
      sellerInvite: null
    }));
    toast.info('Seller invite removed', { autoClose: 2000 });
  };

  const handlePostEventDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      // Check file type - allow common document types
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/vnd.ms-powerpoint', // .ppt
        'text/plain', // .txt
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: Please upload a valid document (PDF, Word, Excel, PowerPoint, or Text)`, { autoClose: 3000 });
        return;
      }

      // Check file size (max 5MB per file)
      if (file.size > 5000000) {
        toast.error(`${file.name}: File size must be less than 5MB`, { autoClose: 3000 });
        return;
      }

      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const newDocument = {
          name: file.name,
          data: event.target.result,
          size: file.size,
          type: file.type
        };
        
        setFormData(prev => ({
          ...prev,
          postEventDocuments: [...(prev.postEventDocuments || []), newDocument]
        }));
        
        toast.success(`✅ ${file.name} uploaded successfully`, { autoClose: 2000 });
      };
      reader.readAsDataURL(file);
    });

    // Reset the input
    e.target.value = '';
  };

  const handleRemovePostEventDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      postEventDocuments: prev.postEventDocuments.filter((_, i) => i !== index)
    }));
    toast.info('Document removed', { autoClose: 2000 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure editors have synced their content to formData
    if (summaryEditor) {
      const summaryHTML = summaryEditor.getHTML();
      setFormData(prev => ({ ...prev, summary: summaryHTML }));
    }
    if (descriptionEditor) {
      const descriptionHTML = descriptionEditor.getHTML();
      setFormData(prev => ({ ...prev, description: descriptionHTML }));
    }

    // Validation
    const summaryText = summaryEditor?.getText() || '';
    if (!formData.title || !formData.date || summaryText.trim().length === 0 || !formData.registrationLink) {
      toast.warning('⚠️ Please fill in all required fields', {
        autoClose: 3000,
      });
      return;
    }

    if (formData.productAreas.length === 0) {
      toast.warning('⚠️ Please select at least one product area', {
        autoClose: 3000,
      });
      return;
    }

    // Get the latest content from editors
    const eventData = {
      ...formData,
      summary: summaryEditor?.getHTML() || formData.summary,
      description: descriptionEditor?.getHTML() || formData.description,
      id: isEditing ? currentEvent.id : Date.now(),
      createdDate: isEditing ? currentEvent.createdDate : new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    let updatedEvents;
    if (isEditing) {
      updatedEvents = events.map(e => e.id === currentEvent.id ? eventData : e);
      toast.success('✅ Event updated successfully!', {
        icon: <Checkmark size={24} />,
        autoClose: 3000,
      });
    } else {
      updatedEvents = [...events, eventData];
      toast.success('✅ Event created successfully!', {
        icon: <Checkmark size={24} />,
        autoClose: 3000,
      });
    }

    localStorage.setItem('managed_events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
    notifyEventUpdate();
    handleCloseForm();
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      ...event,
      productAreas: event.productAreas || [],
      targetRoles: event.targetRoles || [],
      seismicLink: event.seismicLink || '',
      endDate: event.endDate || '',
      industry: event.industry || 'Cross-Industry',
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleDelete = (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(e => e.id !== eventId);
      localStorage.setItem('managed_events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      notifyEventUpdate();
      toast.success('🗑️ Event deleted successfully!', {
        icon: <TrashCan size={24} />,
        autoClose: 3000,
      });
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
    setFormData({
      title: '',
      date: '',
      endDate: '',
      time: '',
      location: '',
      locationType: 'virtual',
      summary: '',
      description: '',
      registrationLink: '',
      seismicLink: '',
      sellerInvite: null,
      agenda: '',
      eventContacts: '',
      productAreas: [],
      eventType: 'Webinar',
      targetAudience: 'All',
      targetRoles: [],
      industry: 'Cross-Industry',
      featured: false,
      status: 'Active',
    });
  };

  const getProductAreaLabel = (id) => {
    const area = PRODUCT_AREAS.find(a => a.id === id);
    return area ? area.label : id;
  };

  const getTargetRoleLabel = (id) => {
    const role = TARGET_ROLES.find(r => r.id === id);
    return role ? role.label : id;
  };

  // Group events by month
  const groupEventsByMonth = (eventsList) => {
    const grouped = {};
    eventsList.forEach(event => {
      const date = new Date(event.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(event);
    });
    
    // Sort events within each month by date
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    return grouped;
  };

  const activeEvents = events.filter(e => e.status === 'Active');
  const draftEvents = events.filter(e => e.status === 'Draft');
  const archivedEvents = events.filter(e => e.status === 'Archived');

  const activeEventsByMonth = groupEventsByMonth(activeEvents);
  const draftEventsByMonth = groupEventsByMonth(draftEvents);
  const archivedEventsByMonth = groupEventsByMonth(archivedEvents);

  return (
    <div className="manage-events-tab">
      <div className="events-header" style={{ marginBottom: '24px' }}>
        <h2>📅 Manage Events</h2>
        <p style={{ color: '#525252', marginTop: '8px' }}>
          Create and manage events for the Event Library. Events will be available for sellers to include in their communications.
        </p>
      </div>

      <ButtonSet style={{ marginBottom: '24px' }}>
        <Button
          kind="primary"
          renderIcon={Add}
          onClick={() => setIsFormOpen(true)}
        >
          Create New Event
        </Button>
      </ButtonSet>

      {/* Event Form Modal */}
      <Modal
        open={isFormOpen}
        onRequestClose={handleCloseForm}
        modalHeading={isEditing ? 'Edit Event' : 'Create New Event'}
        primaryButtonText={isEditing ? 'Update Event' : 'Create Event'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSubmit}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Stack gap={6}>
            <TextInput
              id="title"
              name="title"
              labelText="Event Title *"
              placeholder="e.g., IBM Think 2026"
              value={formData.title}
              onChange={handleInputChange}
              required
            />

            <Grid>
              <Column lg={5} md={4} sm={4}>
                <TextInput
                  id="date"
                  name="date"
                  type="date"
                  labelText="Start Date *"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </Column>
              <Column lg={5} md={4} sm={4}>
                <TextInput
                  id="endDate"
                  name="endDate"
                  type="date"
                  labelText="End Date (Optional)"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  helperText="Leave empty for single-day events"
                />
              </Column>
              <Column lg={6} md={4} sm={4}>
                <TextInput
                  id="time"
                  name="time"
                  type="time"
                  labelText="Event Time"
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </Column>
            </Grid>

            <Grid>
              <Column lg={8} md={4} sm={4}>
                <Select
                  id="locationType"
                  name="locationType"
                  labelText="Location Type"
                  value={formData.locationType}
                  onChange={handleInputChange}
                >
                  <SelectItem value="virtual" text="Virtual" />
                  <SelectItem value="in-person" text="In-Person" />
                  <SelectItem value="hybrid" text="Hybrid" />
                </Select>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <TextInput
                  id="location"
                  name="location"
                  labelText="Location Details"
                  placeholder="e.g., London, UK or Zoom"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </Column>
            </Grid>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#161616'
              }}>
                Brief Summary * (500 characters)
              </label>
              <div style={{
                border: '1px solid #8d8d8d',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  padding: '8px',
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#f4f4f4'
                }}>
                  <Button
                    kind="ghost"
                    size="sm"
                    hasIconOnly
                    renderIcon={TextBold}
                    iconDescription="Bold"
                    onClick={() => summaryEditor?.chain().focus().toggleBold().run()}
                    className={summaryEditor?.isActive('bold') ? 'is-active' : ''}
                  />
                  <Button
                    kind="ghost"
                    size="sm"
                    hasIconOnly
                    renderIcon={TextItalic}
                    iconDescription="Italic"
                    onClick={() => summaryEditor?.chain().focus().toggleItalic().run()}
                    className={summaryEditor?.isActive('italic') ? 'is-active' : ''}
                  />
                  <Button
                    kind="ghost"
                    size="sm"
                    hasIconOnly
                    renderIcon={TextUnderline}
                    iconDescription="Underline"
                    onClick={() => summaryEditor?.chain().focus().toggleUnderline().run()}
                    className={summaryEditor?.isActive('underline') ? 'is-active' : ''}
                  />
                  <Button
                    kind="ghost"
                    size="sm"
                    hasIconOnly
                    renderIcon={List}
                    iconDescription="Bullet List"
                    onClick={() => summaryEditor?.chain().focus().toggleBulletList().run()}
                    className={summaryEditor?.isActive('bulletList') ? 'is-active' : ''}
                  />
                  <div style={{ marginLeft: '8px' }}>
                    <Select
                      id="summary-emoji-picker"
                      labelText=""
                      hideLabel
                      size="sm"
                      style={{ minWidth: '100px' }}
                      onChange={(e) => {
                        insertEmojiInSummary(e.target.value);
                        e.target.value = '';
                      }}
                    >
                      <SelectItem value="" text="😊 Emoji" />
                      {emojis.map((emoji) => (
                        <SelectItem key={emoji} value={emoji} text={emoji} />
                      ))}
                    </Select>
                  </div>
                </div>
                <div style={{
                  minHeight: '80px',
                  padding: '12px',
                  backgroundColor: '#ffffff'
                }}>
                  <EditorContent editor={summaryEditor} />
                </div>
              </div>
              <div style={{
                marginTop: '4px',
                fontSize: '12px',
                color: '#525252'
              }}>
                {summaryEditor?.getText().length || 0} / 500 characters
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#161616'
              }}>
                Detailed Description (Optional)
              </label>
              <div style={{
                border: '1px solid #8d8d8d',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  padding: '8px',
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#f4f4f4'
                }}>
                  <Button
                    kind="ghost"
                    size="sm"
                    hasIconOnly
                    renderIcon={TextBold}
                    iconDescription="Bold"
                    onClick={() => descriptionEditor?.chain().focus().toggleBold().run()}
                    className={descriptionEditor?.isActive('bold') ? 'is-active' : ''}
                  />
                  <Button
                    kind="ghost"
                    size="sm"
                    hasIconOnly
                    renderIcon={TextItalic}
                    iconDescription="Italic"
                    onClick={() => descriptionEditor?.chain().focus().toggleItalic().run()}
                    className={descriptionEditor?.isActive('italic') ? 'is-active' : ''}
                  />
                  <Button
                    kind="ghost"
                    size="sm"
                    hasIconOnly
                    renderIcon={TextUnderline}
                    iconDescription="Underline"
                    onClick={() => descriptionEditor?.chain().focus().toggleUnderline().run()}
                    className={descriptionEditor?.isActive('underline') ? 'is-active' : ''}
                  />
                  <Button
                    kind="ghost"
                    size="sm"
                    hasIconOnly
                    renderIcon={List}
                    iconDescription="Bullet List"
                    onClick={() => descriptionEditor?.chain().focus().toggleBulletList().run()}
                    className={descriptionEditor?.isActive('bulletList') ? 'is-active' : ''}
                  />
                </div>
                <div style={{
                  minHeight: '120px',
                  padding: '12px',
                  backgroundColor: '#ffffff'
                }}>
                  <EditorContent editor={descriptionEditor} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#161616'
              }}>
                Event Agenda (Optional - Seller Reference Only)
              </label>
              <p style={{
                fontSize: '12px',
                color: '#525252',
                marginBottom: '8px'
              }}>
                Provide agenda details for sellers. This will NOT appear in client communications.
              </p>
              <TextArea
                id="agenda"
                name="agenda"
                placeholder="e.g., 9:00 AM - Registration, 10:00 AM - Keynote, 11:00 AM - Breakout Sessions..."
                value={formData.agenda}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <TextInput
              id="registrationLink"
              name="registrationLink"
              labelText="Registration Link *"
              placeholder="https://..."
              value={formData.registrationLink}
              onChange={handleInputChange}
              required
            />

            <TextInput
              id="seismicLink"
              name="seismicLink"
              labelText="Seismic Page Link (Optional)"
              placeholder="https://seismic.com/..."
              value={formData.seismicLink}
              onChange={handleInputChange}
              helperText="Link to Seismic page with more event details for sellers"
            />

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#161616'
              }}>
                Seller Invite Document (Optional)
              </label>
              <p style={{
                fontSize: '12px',
                color: '#525252',
                marginBottom: '12px'
              }}>
                Upload a Word document that sellers can download to invite clients to this event
              </p>
              {formData.sellerInvite ? (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f4f4f4',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Document size={20} />
                    <span style={{ fontSize: '14px' }}>{formData.sellerInvite.name}</span>
                    <span style={{ fontSize: '12px', color: '#525252' }}>
                      ({(formData.sellerInvite.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    kind="danger--ghost"
                    size="sm"
                    onClick={handleRemoveSellerInvite}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <input
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleSellerInviteUpload}
                  style={{
                    padding: '8px',
                    border: '1px solid #8d8d8d',
                    borderRadius: '4px',
                    width: '100%',
                    fontSize: '14px'
                  }}
                />
              )}
            </div>

            <MultiSelect
              id="productAreas"
              titleText="Product Areas * (Select all that apply)"
              label="Select product areas"
              items={PRODUCT_AREAS}
              itemToString={(item) => (item ? item.label : '')}
              initialSelectedItems={PRODUCT_AREAS.filter(area =>
                formData.productAreas && formData.productAreas.includes(area.id)
              )}
              onChange={handleProductAreasChange}
            />

            <Grid>
              <Column lg={5} md={4} sm={4}>
                <Select
                  id="eventType"
                  name="eventType"
                  labelText="Event Type"
                  value={formData.eventType}
                  onChange={handleInputChange}
                >
                  {EVENT_TYPES.map(type => (
                    <SelectItem key={type} value={type} text={type} />
                  ))}
                </Select>
              </Column>
              <Column lg={5} md={4} sm={4}>
                <Select
                  id="targetAudience"
                  name="targetAudience"
                  labelText="Target Audience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                >
                  {TARGET_AUDIENCES.map(audience => (
                    <SelectItem key={audience} value={audience} text={audience} />
                  ))}
                </Select>
              </Column>
              <Column lg={6} md={4} sm={4}>
                <Select
                  id="industry"
                  name="industry"
                  labelText="Industry *"
                  value={formData.industry}
                  onChange={handleInputChange}
                >
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry} text={industry} />
                  ))}
                </Select>
              </Column>
            </Grid>

            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#161616'
              }}>
                Target Roles (Select all that apply)
              </label>
              <p style={{
                fontSize: '12px',
                color: '#525252',
                marginBottom: '12px'
              }}>
                Select which roles this event is targeting for invitations
              </p>
              <Grid style={{ marginTop: '8px' }}>
                {TARGET_ROLES.map((role) => (
                  <Column key={role.id} lg={4} md={4} sm={4} style={{ marginBottom: '12px' }}>
                    <Checkbox
                      id={`role-${role.id}`}
                      labelText={role.label}
                      checked={formData.targetRoles && formData.targetRoles.includes(role.id)}
                      onChange={() => handleTargetRoleToggle(role.id)}
                    />
                  </Column>
                ))}
              </Grid>
              {formData.targetRoles && formData.targetRoles.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <Tag type="blue" size="sm">
                    {formData.targetRoles.length} {formData.targetRoles.length === 1 ? 'role' : 'roles'} selected
                  </Tag>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#161616'
              }}>
                Event Contacts (Optional - Seller Reference Only)
              </label>
              <p style={{
                fontSize: '12px',
                color: '#525252',
                marginBottom: '8px'
              }}>
                List key contacts for this event. This will NOT appear in client communications.
              </p>
              <TextArea
                id="eventContacts"
                name="eventContacts"
                placeholder="e.g., Event Manager: John Smith (john.smith@ibm.com), Technical Lead: Jane Doe (jane.doe@ibm.com)"
                value={formData.eventContacts}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#161616'
              }}>
                Post Event Follow-up (Optional)
              </label>
              <p style={{
                fontSize: '12px',
                color: '#525252',
                marginBottom: '8px'
              }}>
                Add follow-up notes, resources, or action items after the event has concluded.
              </p>
              <TextArea
                id="postEventFollowUp"
                name="postEventFollowUp"
                placeholder="e.g., Thank you for attending! Here are the key takeaways and next steps..."
                value={formData.postEventFollowUp}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#161616'
              }}>
                Post Event Documents (Optional)
              </label>
              <p style={{
                fontSize: '12px',
                color: '#525252',
                marginBottom: '12px'
              }}>
                Upload documents related to the event follow-up (presentations, recordings, resources, etc.)
              </p>
              
              {formData.postEventDocuments && formData.postEventDocuments.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  {formData.postEventDocuments.map((doc, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f4f4f4',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Document size={20} />
                        <span style={{ fontSize: '14px' }}>{doc.name}</span>
                        <span style={{ fontSize: '12px', color: '#525252' }}>
                          ({(doc.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        kind="danger--ghost"
                        size="sm"
                        onClick={() => handleRemovePostEventDocument(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                onChange={handlePostEventDocumentUpload}
                style={{
                  padding: '8px',
                  border: '1px solid #8d8d8d',
                  borderRadius: '4px',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
              <p style={{
                fontSize: '11px',
                color: '#525252',
                marginTop: '4px'
              }}>
                Accepted formats: PDF, Word, Excel, PowerPoint, Text. Max 5MB per file.
              </p>
            </div>

            <Select
              id="status"
              name="status"
              labelText="Status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <SelectItem value="Active" text="Active (Visible to sellers)" />
              <SelectItem value="Draft" text="Draft (Not visible)" />
              <SelectItem value="Archived" text="Archived" />
            </Select>
          </Stack>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        open={previewOpen}
        onRequestClose={() => setPreviewOpen(false)}
        modalHeading="Event Preview"
        passiveModal
        size="md"
      >
        {previewEvent && (
          <div style={{ padding: '16px 0' }}>
            <h3 style={{ marginBottom: '16px' }}>{previewEvent.title}</h3>
            <div style={{ marginBottom: '12px' }}>
              <Calendar size={16} style={{ marginRight: '8px' }} />
              <strong>Date:</strong> {new Date(previewEvent.date).toLocaleDateString()}
              {previewEvent.endDate && ` - ${new Date(previewEvent.endDate).toLocaleDateString()}`}
              {previewEvent.time && ` at ${previewEvent.time}`}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Location size={16} style={{ marginRight: '8px' }} />
              <strong>Location:</strong> {previewEvent.location || 'TBD'} ({previewEvent.locationType})
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Type:</strong> {previewEvent.eventType} | <strong>Audience:</strong> {previewEvent.targetAudience}
            </div>
            {previewEvent.industry && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Industry:</strong> <Tag type="green" size="sm">{previewEvent.industry}</Tag>
              </div>
            )}
            {previewEvent.productAreas && previewEvent.productAreas.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Product Areas:</strong>
                <div style={{ marginTop: '8px' }}>
                  {previewEvent.productAreas.map(areaId => (
                    <Tag key={areaId} type="blue" style={{ marginRight: '8px', marginBottom: '8px' }}>
                      {getProductAreaLabel(areaId)}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
            {previewEvent.targetRoles && previewEvent.targetRoles.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Target Roles:</strong>
                <div style={{ marginTop: '8px' }}>
                  {previewEvent.targetRoles.map(roleId => (
                    <Tag key={roleId} type="cyan" style={{ marginRight: '8px', marginBottom: '8px' }}>
                      {getTargetRoleLabel(roleId)}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <strong>Summary:</strong>
              <div
                className="event-summary-preview"
                style={{ marginTop: '8px', color: '#525252', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: previewEvent.summary }}
              />
            </div>
            {previewEvent.description && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Description:</strong>
                <div
                  className="event-summary-preview"
                  style={{
                    marginTop: '8px',
                    color: '#525252',
                    lineHeight: '1.6'
                  }}
                  dangerouslySetInnerHTML={{ __html: previewEvent.description }}
                />
              </div>
            )}
            <div style={{ marginBottom: '12px' }}>
              <LinkIcon size={16} style={{ marginRight: '8px' }} />
              <a
                href={previewEvent.seismicLink || previewEvent.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0f62fe' }}
              >
                {previewEvent.seismicLink ? 'View Event Details on Seismic' : 'Registration Link'}
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Events List */}
      {events.length === 0 ? (
        <Tile style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3 style={{ marginBottom: '16px' }}>📅 No Events Yet</h3>
          <p style={{ color: '#525252', marginBottom: '24px' }}>
            Create your first event to get started.
          </p>
          <Button kind="primary" renderIcon={Add} onClick={() => setIsFormOpen(true)}>
            Create New Event
          </Button>
        </Tile>
      ) : (
        <Stack gap={6}>
          {/* Active Events */}
          {activeEvents.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Active Events ({activeEvents.length})</h3>
              <StructuredListWrapper>
                <StructuredListHead>
                  <StructuredListRow head>
                    <StructuredListCell head>Event Title</StructuredListCell>
                    <StructuredListCell head>Date</StructuredListCell>
                    <StructuredListCell head>Type</StructuredListCell>
                    <StructuredListCell head>Industry</StructuredListCell>
                    <StructuredListCell head>Product Areas</StructuredListCell>
                    <StructuredListCell head>Actions</StructuredListCell>
                  </StructuredListRow>
                </StructuredListHead>
                <StructuredListBody>
                  {Object.entries(activeEventsByMonth).map(([month, monthEvents], monthIndex) => (
                    <React.Fragment key={month}>
                      <StructuredListRow style={{ backgroundColor: '#0f62fe' }}>
                        <StructuredListCell style={{
                          padding: '8px 12px',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          📅 {month} ({monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''})
                        </StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#0f62fe' }}></StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#0f62fe' }}></StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#0f62fe' }}></StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#0f62fe' }}></StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#0f62fe' }}></StructuredListCell>
                      </StructuredListRow>
                      {monthEvents.map((event) => (
                        <StructuredListRow key={event.id}>
                          <StructuredListCell>{event.title}</StructuredListCell>
                          <StructuredListCell>
                            {new Date(event.date).toLocaleDateString()}
                            {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                          </StructuredListCell>
                          <StructuredListCell>{event.eventType}</StructuredListCell>
                          <StructuredListCell>
                            {event.industry && <Tag type="green" size="sm">{event.industry}</Tag>}
                          </StructuredListCell>
                          <StructuredListCell>
                            {event.productAreas.slice(0, 2).map(areaId => {
                              const area = PRODUCT_AREAS.find(a => a.id === areaId);
                              return area ? area.icon : '';
                            }).join(' ')}
                            {event.productAreas.length > 2 && ` +${event.productAreas.length - 2}`}
                          </StructuredListCell>
                          <StructuredListCell>
                            <ButtonSet>
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={View}
                                iconDescription="Preview"
                                hasIconOnly
                                onClick={() => handlePreview(event)}
                              />
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={Copy}
                                iconDescription="Duplicate"
                                hasIconOnly
                                onClick={() => handleDuplicate(event)}
                              />
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={Edit}
                                iconDescription="Edit"
                                hasIconOnly
                                onClick={() => handleEdit(event)}
                              />
                              <Button
                                kind="danger--ghost"
                                size="sm"
                                renderIcon={TrashCan}
                                iconDescription="Delete"
                                hasIconOnly
                                onClick={() => handleDelete(event.id)}
                              />
                            </ButtonSet>
                          </StructuredListCell>
                        </StructuredListRow>
                      ))}
                    </React.Fragment>
                  ))}
                </StructuredListBody>
              </StructuredListWrapper>
            </div>
          )}

          {/* Draft Events */}
          {draftEvents.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Draft Events ({draftEvents.length})</h3>
              <StructuredListWrapper>
                <StructuredListHead>
                  <StructuredListRow head>
                    <StructuredListCell head>Event Title</StructuredListCell>
                    <StructuredListCell head>Date</StructuredListCell>
                    <StructuredListCell head>Type</StructuredListCell>
                    <StructuredListCell head>Industry</StructuredListCell>
                    <StructuredListCell head>Product Areas</StructuredListCell>
                    <StructuredListCell head>Actions</StructuredListCell>
                  </StructuredListRow>
                </StructuredListHead>
                <StructuredListBody>
                  {Object.entries(draftEventsByMonth).map(([month, monthEvents]) => (
                    <React.Fragment key={month}>
                      <StructuredListRow style={{ backgroundColor: '#8d8d8d' }}>
                        <StructuredListCell style={{
                          padding: '8px 12px',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          📅 {month} ({monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''})
                        </StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#8d8d8d' }}></StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#8d8d8d' }}></StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#8d8d8d' }}></StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#8d8d8d' }}></StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#8d8d8d' }}></StructuredListCell>
                      </StructuredListRow>
                      {monthEvents.map((event) => (
                        <StructuredListRow key={event.id}>
                          <StructuredListCell>{event.title}</StructuredListCell>
                          <StructuredListCell>
                            {event.date ? new Date(event.date).toLocaleDateString() : 'Not set'}
                            {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                          </StructuredListCell>
                          <StructuredListCell>{event.eventType}</StructuredListCell>
                          <StructuredListCell>
                            {event.industry && <Tag type="green" size="sm">{event.industry}</Tag>}
                          </StructuredListCell>
                          <StructuredListCell>
                            {event.productAreas.slice(0, 2).map(areaId => {
                              const area = PRODUCT_AREAS.find(a => a.id === areaId);
                              return area ? area.icon : '';
                            }).join(' ')}
                            {event.productAreas.length > 2 && ` +${event.productAreas.length - 2}`}
                          </StructuredListCell>
                          <StructuredListCell>
                            <ButtonSet>
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={View}
                                iconDescription="Preview"
                                hasIconOnly
                                onClick={() => handlePreview(event)}
                              />
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={Copy}
                                iconDescription="Duplicate"
                                hasIconOnly
                                onClick={() => handleDuplicate(event)}
                              />
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={Edit}
                                iconDescription="Edit"
                                hasIconOnly
                                onClick={() => handleEdit(event)}
                              />
                              <Button
                                kind="danger--ghost"
                                size="sm"
                                renderIcon={TrashCan}
                                iconDescription="Delete"
                                hasIconOnly
                                onClick={() => handleDelete(event.id)}
                              />
                            </ButtonSet>
                          </StructuredListCell>
                        </StructuredListRow>
                      ))}
                    </React.Fragment>
                  ))}
                </StructuredListBody>
              </StructuredListWrapper>
            </div>
          )}

          {/* Archived Events */}
          {archivedEvents.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Archived Events ({archivedEvents.length})</h3>
              <StructuredListWrapper>
                <StructuredListHead>
                  <StructuredListRow head>
                    <StructuredListCell head>Event Title</StructuredListCell>
                    <StructuredListCell head>Date</StructuredListCell>
                    <StructuredListCell head>Type</StructuredListCell>
                    <StructuredListCell head>Industry</StructuredListCell>
                    <StructuredListCell head>Actions</StructuredListCell>
                  </StructuredListRow>
                </StructuredListHead>
                <StructuredListBody>
                  {Object.entries(archivedEventsByMonth).map(([month, monthEvents]) => (
                    <React.Fragment key={month}>
                      <StructuredListRow style={{ backgroundColor: '#525252' }}>
                        <StructuredListCell style={{
                          padding: '8px 12px',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          📅 {month} ({monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''})
                        </StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#525252' }}></StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#525252' }}></StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#525252' }}></StructuredListCell>
                        <StructuredListCell style={{ backgroundColor: '#525252' }}></StructuredListCell>
                      </StructuredListRow>
                      {monthEvents.map((event) => (
                        <StructuredListRow key={event.id}>
                          <StructuredListCell>{event.title}</StructuredListCell>
                          <StructuredListCell>
                            {new Date(event.date).toLocaleDateString()}
                            {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                          </StructuredListCell>
                          <StructuredListCell>{event.eventType}</StructuredListCell>
                          <StructuredListCell>
                            {event.industry && <Tag type="green" size="sm">{event.industry}</Tag>}
                          </StructuredListCell>
                          <StructuredListCell>
                            <ButtonSet>
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={View}
                                iconDescription="Preview"
                                hasIconOnly
                                onClick={() => handlePreview(event)}
                              />
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={Copy}
                                iconDescription="Duplicate"
                                hasIconOnly
                                onClick={() => handleDuplicate(event)}
                              />
                              {isAdmin && (
                                <Button
                                  kind="danger--ghost"
                                  size="sm"
                                  renderIcon={TrashCan}
                                  iconDescription="Delete (Admin Only)"
                                  hasIconOnly
                                  onClick={() => handleDelete(event.id)}
                                />
                              )}
                            </ButtonSet>
                          </StructuredListCell>
                        </StructuredListRow>
                      ))}
                    </React.Fragment>
                  ))}
                </StructuredListBody>
              </StructuredListWrapper>
            </div>
          )}
        </Stack>
      )}
    </div>
  );
};

export default ManageEventsTab;

// Made with Bob