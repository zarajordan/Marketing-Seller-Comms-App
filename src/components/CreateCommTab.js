import React, { useState, useImperativeHandle, forwardRef, useRef, useId } from 'react';
import {
  Form,
  Stack,
  TextInput,
  Select,
  SelectItem,
  Button,
  ButtonSet,
  Grid,
  Column,
  Loading,
  Accordion,
  AccordionItem,
} from '@carbon/react';
import {
  Save,
  FolderOpen,
  View,
  Email,
  Document,
  DocumentPdf,
  Chat,
  Reset,
  Image,
  Checkmark,
  Copy,
  Add,
  TrashCan,
  Events,
  Link,
  List,
  TextColor,
  TextFont,
  TextBold,
  TextItalic,
  TextStrikethrough,
  Code,
} from '@carbon/icons-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TiptapImage from '@tiptap/extension-image';
import FontSize from '@tiptap/extension-text-style';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import ImageGalleryModal from './ImageGalleryModal';

const FontSizeExtension = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize?.replace(/['"]/g, ''),
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}; line-height: 1.45; display: inline;`,
          };
        },
      },
    };
  },
});

const createEditorExtensions = () => [
  StarterKit.configure({
    heading: false,
    link: false,
  }),
  FontSizeExtension,
  Color,
  TiptapImage.configure({
    inline: true,
    allowBase64: true,
  }),
  LinkExtension.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: 'https',
  }),
];

const normalizeEditorHtml = (html) => {
  if (!html || html === '<p></p>') return '';
  return html;
};

const isLikelyHtml = (value = '') => /<\/?[a-z][\s\S]*>/i.test(value);

// Compress image to reduce storage size
const compressImage = (dataUrl, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if image is too large
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with compression
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.src = dataUrl;
  });
};

// Check localStorage quota and clean up if needed
const checkAndCleanupStorage = () => {
  try {
    const drafts = JSON.parse(localStorage.getItem('comms_drafts') || '[]');
    const draftsSize = new Blob([JSON.stringify(drafts)]).size;
    const maxSize = 4 * 1024 * 1024; // 4MB limit (leaving room for other data)

    if (draftsSize > maxSize) {
      // Sort by date and keep only the 10 most recent drafts
      const sortedDrafts = drafts.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      ).slice(0, 10);
      
      localStorage.setItem('comms_drafts', JSON.stringify(sortedDrafts));
      
      toast.info('🧹 Cleaned up old drafts to free storage space', {
        autoClose: 4000,
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Storage cleanup error:', error);
    return false;
  }
};

const convertMarkdownToHTML = (text) => {
  if (!text) return '';
  if (isLikelyHtml(text)) return text;
  
  const applyMarkdown = (str) => {
    return str
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #0f62fe; text-decoration: underline;">$1</a>')
      .replace(/\*\*\s*(.+?)\s*\*\*/g, '<strong>$1</strong>')
      .replace(/\*\s*(.+?)\s*\*/g, '<em>$1</em>')
      .replace(/__\s*(.+?)\s*__/g, '<u>$1</u>')
      .replace(/~~\s*(.+?)\s*~~/g, '<del>$1</del>')
      .replace(/`\s*(.+?)\s*`/g, '<code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
  };
  
  let html = applyMarkdown(text);
  const lines = html.split('\n');
  let inList = false;
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const isBullet = trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ');
    
    if (isBullet) {
      const bulletContent = trimmedLine.substring(2);
      if (!inList) {
        processedLines.push('<ul style="margin: 8px 0; padding-left: 20px;">');
        inList = true;
      }
      processedLines.push(`<li style="margin: 4px 0;">${bulletContent}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }
  }
  
  if (inList) {
    processedLines.push('</ul>');
  }
  
  html = processedLines.join('\n');
  html = html.replace(/\n(?!<\/?ul|<\/?li)/g, '<br>');
  
  return html;
};

const coerceStoredContentToHtml = (value) => {
  if (!value) return '';
  return isLikelyHtml(value) ? value : convertMarkdownToHTML(value);
};

const RichTextEditor = ({
  label,
  content,
  onChange,
  placeholder,
  minHeight = 160,
  textColor = '#161616',
  fontSize = '16px',
  colorLabel = 'Body Colour',
  sizeLabel = 'Text Size',
  defaultTextColor = '#161616',
  colorOptions = [],
  onDefaultColorChange,
  onFontSizeChange,
  fontSizeOptions = [],
  emojiOptions = [],
  onInsertInlineImage,
}) => {
  const editorId = useId();
  const inlineImageInputRef = useRef(null);
  const [inlineImageSize, setInlineImageSize] = useState('48');
  const editor = useEditor({
    immediatelyRender: false,
    extensions: createEditorExtensions(),
    content: coerceStoredContentToHtml(content),
    onUpdate: ({ editor }) => {
      onChange(normalizeEditorHtml(editor.getHTML()));
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor__content',
        style: `color: ${textColor}; font-size: ${fontSize};`,
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    const normalizedContent = coerceStoredContentToHtml(content);
    if (editor.getHTML() !== normalizedContent) {
      editor.commands.setContent(normalizedContent || '<p></p>', false);
    }
  }, [editor, content]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href || 'https://';
    const url = window.prompt('Enter the URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const insertEmoji = (emoji) => {
    if (!emoji) return;
    editor.chain().focus().insertContent(emoji).run();
  };

  const insertInlineImage = (imageUrl, options = {}) => {
    if (!imageUrl) return;
    const width = String(options.width || inlineImageSize || '48').replace(/[^\d]/g, '') || '48';
    const alt = String(options.alt || 'Inline image');

    editor
      .chain()
      .focus()
      .insertContent({ type: 'text', text: ' ' })
      .setImage({
        src: String(imageUrl),
        alt,
        width,
        style: `width: ${width}px; max-width: ${width}px; height: auto; display: inline-block; vertical-align: middle; margin: 0 6px; border-radius: 4px;`,
      })
      .insertContent({ type: 'text', text: ' ' })
      .run();
  };

  const handleInlineImageUpload = () => {
    inlineImageInputRef.current?.click();
  };

  const handleInlineImageFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const imageUrl = loadEvent.target?.result;
      if (!imageUrl) return;
      const alt = window.prompt('Add alt text for this image:', file.name.replace(/\.[^.]+$/, '')) || file.name.replace(/\.[^.]+$/, '');
      insertInlineImage(imageUrl, { width: inlineImageSize, alt });
      toast.success('🖼️ Inline image inserted!', { autoClose: 2000 });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };
 
  return (
    <div className="rich-text-editor">
      <label className="cds--label" style={{ marginBottom: '8px', display: 'block' }}>
        {label}
      </label>
      <div className="rich-text-editor__toolbar">
        <ButtonSet>
          <Button
            kind="ghost"
            size="sm"
            iconDescription="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
          >
            <TextBold size={16} />
          </Button>
          <Button
            kind="ghost"
            size="sm"
            iconDescription="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
          >
            <TextItalic size={16} />
          </Button>
          <Button
            kind="ghost"
            size="sm"
            iconDescription="Toggle bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </Button>
          <Button
            kind="ghost"
            size="sm"
            iconDescription="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <TextStrikethrough size={16} />
          </Button>
          <Button
            kind="ghost"
            size="sm"
            iconDescription="Inline code"
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code size={16} />
          </Button>
          <Button kind="ghost" size="sm" onClick={setLink}>
            Link
          </Button>
          <div className="rich-text-editor__image-control" aria-label="Insert inline image">
            <Button kind="ghost" size="sm" renderIcon={Image} iconDescription="Upload inline image" onClick={handleInlineImageUpload}>
              Image
            </Button>
            <Select
              id={`${editorId}-inline-image-size`}
              labelText=""
              hideLabel
              size="sm"
              value={inlineImageSize}
              onChange={(e) => setInlineImageSize(e.target.value)}
            >
              <SelectItem value="24" text="24px" />
              <SelectItem value="32" text="32px" />
              <SelectItem value="48" text="48px" />
              <SelectItem value="64" text="64px" />
            </Select>
            <Button
              kind="ghost"
              size="sm"
              iconDescription="Choose inline image from gallery"
              onClick={() => onInsertInlineImage?.({
                width: inlineImageSize,
                onSelect: (imageUrl) => {
                  const alt = window.prompt('Add alt text for this image:', 'Inline image') || 'Inline image';
                  insertInlineImage(imageUrl, { width: inlineImageSize, alt });
                  toast.success('🖼️ Inline image inserted from gallery!', { autoClose: 2000 });
                },
              })}
              disabled={!onInsertInlineImage}
            >
              Gallery
            </Button>
            <input
              ref={inlineImageInputRef}
              id={`${editorId}-inline-image-upload`}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleInlineImageFileChange}
            />
          </div>
          <div className="rich-text-editor__emoji-control" aria-label="Insert emoji">
            <Select
              id={`${label.replace(/\s+/g, '-').toLowerCase()}-emoji`}
              labelText=""
              hideLabel
              size="sm"
              defaultValue=""
              onChange={(e) => {
                insertEmoji(e.target.value);
                e.target.value = '';
              }}
            >
              <SelectItem value="" text="Emoji" />
              {emojiOptions.map((emoji) => (
                <SelectItem key={emoji} value={emoji} text={emoji} />
              ))}
            </Select>
          </div>
          <div
            className="rich-text-editor__color-control"
            aria-label={colorLabel}
          >
            <TextColor size={16} />
            <div className="rich-text-editor__color-options" role="listbox" aria-label={colorLabel}>
              {colorOptions.map((option) => {
                const isSelected = (editor.getAttributes('textStyle').color || defaultTextColor) === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`rich-text-editor__color-option${isSelected ? ' rich-text-editor__color-option--selected' : ''}`}
                    onClick={() => {
                      editor.chain().focus().setColor(option.value).run();
                      onDefaultColorChange?.(option.value);
                    }}
                    aria-label={option.label}
                    title={option.label}
                  >
                    <span
                      className="rich-text-editor__color-swatch"
                      style={{ backgroundColor: option.value }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div
            className="rich-text-editor__size-control"
            aria-label={sizeLabel}
          >
            <TextFont size={16} />
            <Select
              id={`${label.replace(/\s+/g, '-').toLowerCase()}-font-size`}
              labelText=""
              hideLabel
              size="sm"
              value={editor.getAttributes('textStyle').fontSize || fontSize}
              onChange={(e) => {
                const selectedSize = e.target.value;
                editor.chain().focus().setMark('textStyle', { fontSize: selectedSize }).run();
                onFontSizeChange?.(selectedSize);
              }}
            >
              {fontSizeOptions.map((option) => (
                <SelectItem key={option} value={option} text={option} />
              ))}
            </Select>
          </div>
        </ButtonSet>
      </div>
      <div
        className="rich-text-editor__surface"
        style={{ minHeight: `${minHeight}px`, color: textColor, fontSize }}
      >
        <EditorContent editor={editor} />
      </div>
      {placeholder && !content && (
        <p style={{ fontSize: '12px', color: '#525252', marginTop: '4px' }}>
          {placeholder}
        </p>
      )}
    </div>
  );
};

const CreateCommTab = forwardRef((props, ref) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [inlineImageGalleryOpen, setInlineImageGalleryOpen] = useState(false);
  const [inlineImageInsertConfig, setInlineImageInsertConfig] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const previewRef = useRef(null);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eventSectionsExpanded, setEventSectionsExpanded] = useState(true);
  const [loadedFromEvents, setLoadedFromEvents] = useState(false);

  // Common emojis for business communications
  const emojis = [
    '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
    '🔗', '🎨', '💝', '🧑‍💼',
    '😊', '👍', '🎉', '✨', '💡', '🚀', '📅', '📧', '📊', '💼',
    '🎯', '✅', '⭐', '🔔', '📢', '🎓', '🏆', '💪', '🤝', '👏',
    '📱', '💻', '🌟', '🔥', '💯', '📈', '🎊', '🙌', '❤️', '👋'
  ];

  // Preset colors for text
  const textColors = [
    { name: 'IBM Blue', color: '#0f62fe' },
    { name: 'Red', color: '#da1e28' },
    { name: 'Green', color: '#24a148' },
    { name: 'Orange', color: '#ff832b' },
    { name: 'Purple', color: '#8a3ffc' },
    { name: 'Teal', color: '#009d9a' },
    { name: 'Magenta', color: '#ee5396' },
    { name: 'Gray', color: '#525252' },
    { name: 'Black', color: '#161616' },
  ];
  const [eventSections, setEventSections] = useState([
    {
      id: Date.now(),
      title: '',
      body: '',
      titleFontSize: '24px',
      bodyFontSize: '16px',
      image: null,
      ctaText: '',
      ctaLink: '',
      videoUrl: '',
      location: '',
    }
  ]);
  const colourOptions = [
    { value: '#161616', label: 'Black' },
    { value: '#525252', label: 'Gray 70' },
    { value: '#0f62fe', label: 'Blue 60' },
    { value: '#002d9c', label: 'Blue 80' },
    { value: '#198038', label: 'Green 60' },
    { value: '#8a3ffc', label: 'Purple 60' },
    { value: '#d12771', label: 'Magenta 60' },
    { value: '#da1e28', label: 'Red 60' },
    { value: '#ff832b', label: 'Orange 40' },
  ];

  const [formData, setFormData] = useState({
    monthYear: '',
    title: '',
    subtitle: '',
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontSize: '16px',
    titleColor: '#161616',
    bodyColor: '#161616',
    subtitleColor: '#525252',
    ctaColor: '#0f62fe',
    body: '',
    contentImage: null,
    ctaText: '',
    ctaLink: '',
    videoUrl: '',
    location: '',
  });

  // Check for selected events from Event Library on mount
  React.useEffect(() => {
    const selectedEventsJson = localStorage.getItem('selected_events_for_comm');
    if (selectedEventsJson && !loadedFromEvents) {
      try {
        const selectedEvents = JSON.parse(selectedEventsJson);
        if (selectedEvents && selectedEvents.length > 0) {
          // Convert events to event sections
          const newEventSections = selectedEvents.map(event => ({
            id: Date.now() + Math.random(),
            title: event.title || '',
            body: event.description || event.summary || '',
            titleFontSize: '24px',
            bodyFontSize: '16px',
            image: null,
            ctaText: event.registrationLink ? 'Register Now' : '',
            ctaLink: event.registrationLink || '',
            videoUrl: '',
            location: event.location || '',
          }));

          setEventSections(newEventSections);
          setLoadedFromEvents(true);
          
          // Clear the selected events from localStorage
          localStorage.removeItem('selected_events_for_comm');
          
          // Show success message
          toast.success(
            `✅ ${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''} loaded successfully! Customize and preview below.`,
            {
              autoClose: 5000,
              icon: <Events size={24} />
            }
          );
        }
      } catch (error) {
        console.error('Error loading selected events:', error);
        toast.error('Failed to load selected events');
      }
    }
  }, [loadedFromEvents]);

  const normalizeEventSectionContent = (section = {}, fallbackBodyFontSize = '16px') => ({
    ...section,
    title: coerceStoredContentToHtml(section.title || ''),
    body: coerceStoredContentToHtml(section.body || ''),
    titleFontSize: section.titleFontSize || '24px',
    bodyFontSize: section.bodyFontSize || fallbackBodyFontSize,
  });

  const normalizeStoredDraftData = (data = {}, options = {}) => {
    const { persistAsHtml = false } = options;
    const normalizedBodyFontSize = data.fontSize || '16px';

    return {
      ...data,
      body: persistAsHtml ? coerceStoredContentToHtml(data.body || '') : (data.body || ''),
      eventSections: (data.eventSections || []).map((section) => {
        const normalizedSection = {
          ...section,
          titleFontSize: section.titleFontSize || '24px',
          bodyFontSize: section.bodyFontSize || normalizedBodyFontSize,
        };

        if (persistAsHtml) {
          normalizedSection.title = coerceStoredContentToHtml(section.title || '');
          normalizedSection.body = coerceStoredContentToHtml(section.body || '');
        }

        return normalizedSection;
      }),
    };
  };

  const migrateStoredDraftsToRichText = () => {
    const drafts = JSON.parse(localStorage.getItem('comms_drafts') || '[]');
    let hasChanges = false;

    const normalizedDrafts = drafts.map((draft) => {
      const normalizedData = normalizeStoredDraftData(draft.data || {}, { persistAsHtml: false });
      const nextDraft = {
        ...draft,
        data: normalizedData,
      };

      if (JSON.stringify(nextDraft) !== JSON.stringify(draft)) {
        hasChanges = true;
      }

      return nextDraft;
    });

    if (hasChanges) {
      localStorage.setItem('comms_drafts', JSON.stringify(normalizedDrafts));
      window.dispatchEvent(new Event('draftsUpdated'));
    }

    return hasChanges;
  };

  // Expose loadFormData method to parent via ref
  useImperativeHandle(ref, () => ({
    loadFormData: (data, draftId = null) => {
      const normalizedData = normalizeStoredDraftData(data, { persistAsHtml: false });
      setFormData(normalizedData);
      if (normalizedData.bannerImage) {
        setBannerImage(normalizedData.bannerImage);
      }
      if (normalizedData.eventSections) {
        setEventSections(normalizedData.eventSections);
      }
      setCurrentDraftId(draftId);
      setLoadedFromEvents(true); // Prevent auto-loading events when loading a draft
    }
  }));

  const handleAddEventSection = () => {
    const newSection = {
      id: Date.now(),
      title: '',
      body: '',
      image: null,
      ctaText: '',
      ctaLink: '',
      videoUrl: '',
      location: '',
      titleFontSize: eventSections[0]?.titleFontSize || '24px',
      bodyFontSize: eventSections[0]?.bodyFontSize || formData.fontSize || '16px',
    };
    setEventSections([...eventSections, newSection]);
    toast.success('✅ New event section added!', {
      icon: <Add size={24} />,
      autoClose: 2000,
    });
  };

  const handleRemoveEventSection = (id) => {
    if (eventSections.length === 1) {
      toast.warning('⚠️ You must have at least one event section', {
        autoClose: 3000,
      });
      return;
    }
    setEventSections(eventSections.filter(section => section.id !== id));
    toast.success('🗑️ Event section removed!', {
      icon: <TrashCan size={24} />,
      autoClose: 2000,
    });
  };

  const handleEventSectionChange = (id, field, value) => {
    setEventSections(eventSections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const handleEventSectionImageUpload = (sectionId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setEventSections(eventSections.map(section =>
            section.id === sectionId ? { ...section, image: event.target.result } : section
          ));
          toast.success('🖼️ Image added to event section!', {
            icon: <Image size={24} />,
            autoClose: 2000,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleContentImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            contentImage: event.target.result
          }));
          toast.success('📸 Content image uploaded!', {
            autoClose: 3000,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };


  const handleResetColors = () => {
    setFormData(prev => ({
      ...prev,
      titleColor: '#161616',
      bodyColor: '#161616',
      subtitleColor: '#525252',
      ctaColor: '#0f62fe',
    }));
    toast.success('🎨 Colors reset to default values!', {
      autoClose: 3000,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleSaveDraft = () => {
    const draftName = prompt('Enter a name for this draft:');
    if (draftName) {
      setIsLoading(true);
      setTimeout(() => {
        try {
          const drafts = JSON.parse(localStorage.getItem('comms_drafts') || '[]');
          const newDraft = {
            id: Date.now(),
            name: draftName,
            date: new Date().toISOString(),
            data: normalizeStoredDraftData({
              ...formData,
              bannerImage: bannerImage,
              eventSections: eventSections
            }, { persistAsHtml: true })
          };
          drafts.push(newDraft);
          
          try {
            localStorage.setItem('comms_drafts', JSON.stringify(drafts));
          } catch (storageError) {
            // Storage quota exceeded - try cleanup and retry
            if (storageError.name === 'QuotaExceededError') {
              checkAndCleanupStorage();
              try {
                localStorage.setItem('comms_drafts', JSON.stringify(drafts));
              } catch (retryError) {
                toast.error('❌ Storage quota exceeded. Please delete some old drafts.', {
                  autoClose: 5000,
                });
                setIsLoading(false);
                return;
              }
            } else {
              throw storageError;
            }
          }
          
          setCurrentDraftId(newDraft.id);
          setIsLoading(false);
          
          // Dispatch custom event to notify DraftsTab
          window.dispatchEvent(new Event('draftsUpdated'));
          
          toast.success(`✅ Draft "${draftName}" saved successfully!`, {
            icon: <Checkmark size={24} />,
            autoClose: 3000,
          });
        } catch (error) {
          console.error('Error saving draft:', error);
          toast.error('❌ Failed to save draft. Please try again.', {
            autoClose: 5000,
          });
          setIsLoading(false);
        }
      }, 500);
    }
  };

  const handleUpdateDraft = () => {
    if (!currentDraftId) {
      toast.warning('⚠️ No draft is currently loaded. Use "Save as Draft" to create a new draft.', {
        autoClose: 5000,
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      try {
        const drafts = JSON.parse(localStorage.getItem('comms_drafts') || '[]');
        const draftIndex = drafts.findIndex(d => d.id === currentDraftId);
        
        if (draftIndex === -1) {
          toast.error('❌ Draft not found. It may have been deleted.', {
            autoClose: 5000,
          });
          setCurrentDraftId(null);
          setIsLoading(false);
          return;
        }

        drafts[draftIndex] = {
          ...drafts[draftIndex],
          date: new Date().toISOString(),
          data: normalizeStoredDraftData({
            ...formData,
            bannerImage: bannerImage,
            eventSections: eventSections
          }, { persistAsHtml: true })
        };

        try {
          localStorage.setItem('comms_drafts', JSON.stringify(drafts));
        } catch (storageError) {
          // Storage quota exceeded - try cleanup and retry
          if (storageError.name === 'QuotaExceededError') {
            checkAndCleanupStorage();
            try {
              localStorage.setItem('comms_drafts', JSON.stringify(drafts));
            } catch (retryError) {
              toast.error('❌ Storage quota exceeded. Please delete some old drafts.', {
                autoClose: 5000,
              });
              setIsLoading(false);
              return;
            }
          } else {
            throw storageError;
          }
        }
        
        setIsLoading(false);
        
        // Dispatch custom event to notify DraftsTab
        window.dispatchEvent(new Event('draftsUpdated'));
        
        toast.success('✅ Draft updated successfully!', {
          icon: <Checkmark size={24} />,
          autoClose: 3000,
        });
      } catch (error) {
        console.error('Error updating draft:', error);
        toast.error('❌ Failed to update draft. Please try again.', {
          autoClose: 5000,
        });
        setIsLoading(false);
      }
    }, 500);
  };

  const handleSaveToEventLibrary = () => {
    const eventName = prompt('Enter a name for this event:');
    if (eventName) {
      setIsLoading(true);
      setTimeout(() => {
        const events = JSON.parse(localStorage.getItem('event_library') || '[]');
        const newEvent = {
          id: Date.now(),
          name: eventName,
          date: new Date().toISOString(),
          data: normalizeStoredDraftData({
            ...formData,
            bannerImage: bannerImage,
            eventSections: eventSections
          }, { persistAsHtml: true })
        };
        events.push(newEvent);
        localStorage.setItem('event_library', JSON.stringify(events));
        setIsLoading(false);
        toast.success(`📅 Event "${eventName}" added to Event Library!`, {
          icon: <Events size={24} />,
          autoClose: 2000,
        });
      }, 500);
    }
  };

  const handleLoadDraft = () => {
    migrateStoredDraftsToRichText();
    const drafts = JSON.parse(localStorage.getItem('comms_drafts') || '[]');
    if (drafts.length === 0) {
      toast.info('ℹ️ No drafts found. Create and save a draft first!', {
        autoClose: 5000,
      });
      return;
    }
    const draftList = drafts.map((d, i) => `${i + 1}. ${d.name}`).join('\n');
    const selection = prompt(`Select a draft:\n${draftList}\n\nEnter number:`);
    if (selection) {
      const index = parseInt(selection) - 1;
      if (drafts[index]) {
        setIsLoading(true);
        setTimeout(() => {
          const normalizedDraftData = normalizeStoredDraftData(drafts[index].data, { persistAsHtml: false });
          setFormData(normalizedDraftData);
          setBannerImage(normalizedDraftData.bannerImage || null);
          setEventSections(normalizedDraftData.eventSections || []);
          setIsLoading(false);
          toast.success(`✅ Draft "${drafts[index].name}" loaded successfully!`, {
            icon: <Checkmark size={24} />,
            autoClose: 3000,
          });
        }, 300);
      }
    }
  };

  const convertMarkdownToHTML = (text) => {
    if (!text) return '';
    if (isLikelyHtml(text)) return text;
    
    // Helper function to apply markdown formatting to text
    const applyMarkdown = (str) => {
      return str
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #0f62fe; text-decoration: underline;">$1</a>')
        .replace(/\*\*\s*(.+?)\s*\*\*/g, '<strong>$1</strong>')
        .replace(/\*\s*(.+?)\s*\*/g, '<em>$1</em>')
        .replace(/__\s*(.+?)\s*__/g, '<u>$1</u>')
        .replace(/~~\s*(.+?)\s*~~/g, '<del>$1</del>')
        .replace(/`\s*(.+?)\s*`/g, '<code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
    };
    
    let html = text;
    
    html = applyMarkdown(html);
    
    const lines = html.split('\n');
    let inList = false;
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isBullet = line.trim().startsWith('- ');
      
      if (isBullet) {
        const bulletContent = line.trim().substring(2);
        if (!inList) {
          processedLines.push('<ul style="margin: 8px 0; padding-left: 20px;">');
          inList = true;
        }
        processedLines.push(`<li style="margin: 4px 0;">${bulletContent}</li>`);
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(line);
      }
    }
    
    if (inList) {
      processedLines.push('</ul>');
    }
    
    html = processedLines.join('\n');
    html = html.replace(/\n(?!<\/?ul|<\/?li)/g, '<br>');
    
    return html;
  };

  const generateEmailHTML = () => {
    const formattedBody = getRenderableHtml(formData.body);
    
    // Generate event sections HTML using table-based layout
    const eventSectionsHTML = eventSections.map(section => {
      const sectionTitle = getRenderableHtml(section.title);
      const sectionBody = getRenderableHtml(section.body);
      return `
      <tr>
        <td style="padding: 20px 20px 0 20px; border-top: 2px solid #e0e0e0;">
          <table width="560" cellpadding="0" cellspacing="0" border="0" style="width: 560px;">
            ${section.title ? `
            <tr>
              <td style="color: ${formData.titleColor}; font-size: ${section.titleFontSize || '24px'}; line-height: 1.3; font-weight: bold; padding-bottom: 16px;">
                ${sectionTitle}
              </td>
            </tr>` : ''}
            ${section.image ? `
            <tr>
              <td style="padding: 16px 0;">
                <img src="${section.image}" alt="Event image" width="560" style="display: block; width: 560px; max-width: 560px; height: auto; border-radius: 4px;">
              </td>
            </tr>` : ''}
            ${section.body ? `
            <tr>
              <td style="font-size: ${section.bodyFontSize || formData.fontSize}; line-height: 1.45; padding-bottom: 20px;">
                ${sectionBody}
              </td>
            </tr>` : ''}
            ${section.ctaText && section.ctaLink ? `
            <tr>
              <td style="padding-bottom: 16px;">
                <a href="${section.ctaLink}" style="display: inline-block; background-color: ${formData.ctaColor}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">
                  ${section.ctaText}
                </a>
              </td>
            </tr>` : ''}
            ${section.videoUrl ? `
            <tr>
              <td style="padding: 24px 0;">
                <a href="${section.videoUrl}" style="color: ${formData.ctaColor}; text-decoration: underline;">Watch Video</a>
              </td>
            </tr>` : ''}
            ${section.location ? `
            <tr>
              <td style="color: ${formData.subtitleColor}; padding-top: 32px;">
                📍 ${section.location}
              </td>
            </tr>` : ''}
          </table>
        </td>
      </tr>`;
    }).join('');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formData.title || 'Email Communication'}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: ${formData.fontFamily};
      font-size: ${formData.fontSize};
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
    /* Mobile responsive styles */
    @media only screen and (max-width: 600px) {
      table[class="email-container"] {
        width: 100% !important;
      }
      img[class="banner"] {
        width: 100% !important;
        height: auto !important;
      }
      img[class="content-image"], img[class="event-image"] {
        width: 100% !important;
        height: auto !important;
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
          ${bannerImage ? `
          <!-- Banner Image Row -->
          <tr>
            <td style="padding: 0;">
              <img src="${bannerImage}" alt="Banner" class="banner" width="600" height="150" style="display: block; width: 600px; height: 150px; max-height: 150px; object-fit: cover;">
            </td>
          </tr>` : ''}
          
          <!-- Content Row -->
          <tr>
            <td class="content-padding" style="padding: 20px;">
              <table width="560" cellpadding="0" cellspacing="0" border="0" style="width: 560px;">
                ${formData.monthYear ? `
                <tr>
                  <td style="color: ${formData.subtitleColor}; font-size: 14px; padding-bottom: 8px;">
                    ${formData.monthYear}
                  </td>
                </tr>` : ''}
                ${formData.title ? `
                <tr>
                  <td style="color: ${formData.titleColor}; font-size: 32px; font-weight: bold; padding-bottom: 8px;">
                    ${formData.title}
                  </td>
                </tr>` : ''}
                ${formData.subtitle ? `
                <tr>
                  <td style="color: ${formData.subtitleColor}; font-size: 18px; padding-bottom: 24px;">
                    ${formData.subtitle}
                  </td>
                </tr>` : ''}
                ${formData.body ? `
                <tr>
                  <td style="line-height: 1.45; padding-bottom: 20px;">
                    ${formattedBody}
                  </td>
                </tr>` : ''}
                ${formData.contentImage ? `
                <tr>
                  <td style="padding: 24px 0;">
                    <img src="${formData.contentImage}" alt="Content image" class="content-image" width="560" style="display: block; width: 560px; max-width: 560px; height: auto; border-radius: 4px;">
                  </td>
                </tr>` : ''}
                ${formData.ctaText && formData.ctaLink ? `
                <tr>
                  <td style="padding-bottom: 16px;">
                    <a href="${formData.ctaLink}" style="display: inline-block; background-color: ${formData.ctaColor}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">
                      ${formData.ctaText}
                    </a>
                  </td>
                </tr>` : ''}
                ${formData.videoUrl ? `
                <tr>
                  <td style="padding: 24px 0;">
                    <a href="${formData.videoUrl}" style="color: ${formData.ctaColor}; text-decoration: underline;">Watch Video</a>
                  </td>
                </tr>` : ''}
                ${formData.location ? `
                <tr>
                  <td style="color: ${formData.subtitleColor}; padding-top: 32px;">
                    📍 ${formData.location}
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>
          
          <!-- Event Sections -->
          ${eventSectionsHTML}
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const handlePreview = () => {
    const htmlContent = generateEmailHTML();
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    }
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportOutlook = () => {
    setIsLoading(true);
    toast.info('📧 Opening Outlook...', { autoClose: 2000 });
    
    setTimeout(() => {
      // Create plain text version for email body
      const textBody = `${formData.monthYear ? formData.monthYear + '\n\n' : ''}${formData.title || ''}\n${formData.subtitle || ''}\n\n${getPlainTextFromContent(formData.body)}\n\n${formData.ctaText && formData.ctaLink ? formData.ctaText + ': ' + formData.ctaLink : ''}\n${formData.videoUrl ? '\nVideo: ' + formData.videoUrl : ''}\n${formData.location ? '\nLocation: ' + formData.location : ''}`;
      
      // Create mailto link that opens Outlook
      const subject = encodeURIComponent(formData.title || 'Email Communication');
      const body = encodeURIComponent(textBody);
      const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
      
      // Try to open in Outlook
      window.location.href = mailtoLink;
      setIsLoading(false);
      toast.success('✅ Outlook opened successfully!', {
        autoClose: 3000,
      });
      
      // Also offer to download .eml file as backup
      setTimeout(() => {
        if (confirm('Email client opened. Would you also like to download an .eml file as backup?')) {
          const htmlContent = generateEmailHTML();
          const emlContent = `Subject: ${formData.title || 'Email Communication'}
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

${htmlContent}`;
          downloadFile(emlContent, `${formData.title || 'email'}.eml`, 'message/rfc822');
          toast.success('📥 EML file downloaded!', {
            autoClose: 3000,
          });
        }
      }, 1000);
    }, 500);
  };

  const handleExportHTML = () => {
    setIsLoading(true);
    toast.info('📄 Generating HTML file...', { autoClose: 1500 });
    
    setTimeout(() => {
      const htmlContent = generateEmailHTML();
      downloadFile(htmlContent, `${formData.title || 'email'}.html`, 'text/html');
      setIsLoading(false);
      toast.success('✅ HTML file downloaded successfully!', {
        icon: <Checkmark size={24} />,
        autoClose: 3000,
      });
    }, 500);
  };

  const handleExportPDF = () => {
    toast.info('💡 Tip: Use "Export as HTML" then print to PDF from your browser (Ctrl/Cmd + P)', {
      autoClose: 5000,
    });
  };


  const handlePostToSlack = () => {
    const slackMessage = `*${formData.title || 'New Communication'}*\n${formData.subtitle || ''}\n\n${getPlainTextFromContent(formData.body)}\n\n${formData.ctaText && formData.ctaLink ? `<${formData.ctaLink}|${formData.ctaText}>` : ''}`;
    navigator.clipboard.writeText(slackMessage);
    toast.success('✅ Slack message copied to clipboard!', {
      icon: <Checkmark size={24} />,
      autoClose: 3000,
    });
  };

  const handleCopyHTMLToClipboard = async () => {
    setIsLoading(true);
    toast.info('📋 Copying HTML to clipboard...', { autoClose: 1500 });
    
    setTimeout(async () => {
      try {
        const htmlContent = generateEmailHTML();
        
        // Create a blob with HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({
          'text/html': blob,
          'text/plain': new Blob([htmlContent], { type: 'text/plain' })
        });
        
        await navigator.clipboard.write([clipboardItem]);
        setIsLoading(false);
        toast.success('✅ HTML copied! Now paste (Ctrl/Cmd + V) directly into Outlook email body', {
          icon: <Checkmark size={24} />,
          autoClose: 5000,
        });
      } catch (err) {
        // Fallback for browsers that don't support ClipboardItem
        try {
          const htmlContent = generateEmailHTML();
          await navigator.clipboard.writeText(htmlContent);
          setIsLoading(false);
          toast.success('✅ HTML copied as text! Paste into Outlook and it will render as formatted email', {
            icon: <Checkmark size={24} />,
            autoClose: 5000,
          });
        } catch (fallbackErr) {
          setIsLoading(false);
          toast.error('❌ Failed to copy to clipboard. Please try Export as HTML instead.', {
            autoClose: 4000,
          });
        }
      }
    }, 500);
  };

  const handleExportJPG = async () => {
    setIsLoading(true);
    toast.info('🖼️ Generating JPG image...', { autoClose: 2000 });
    
    const htmlContent = generateEmailHTML();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '600px';
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: 600,
        logging: false,
      });
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${formData.title || 'email'}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsLoading(false);
        toast.success('✅ JPG image downloaded successfully!', {
          icon: <Checkmark size={24} />,
          autoClose: 3000,
        });
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error generating JPG:', error);
      setIsLoading(false);
      toast.error('❌ Error generating JPG. Please try again.', {
        autoClose: 5000,
      });
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  const getPlainTextFromContent = (value) => {
    if (!value) return '';
    if (!isLikelyHtml(value)) return value;

    const container = document.createElement('div');
    container.innerHTML = value;

    const listItems = Array.from(container.querySelectorAll('li'));
    listItems.forEach((item) => {
      item.insertAdjacentText('afterbegin', '• ');
    });

    return (container.textContent || '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const getRenderableHtml = (value) => {
    if (!value) return '';
    return isLikelyHtml(value) ? value : convertMarkdownToHTML(value);
  };


  const applyEventSectionFormat = (sectionId, formatType, field = 'body') => {
    const section = eventSections.find(s => s.id === sectionId);
    if (!section) return;

    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;
    const fieldValue = section[field] || '';
    const selectedText = fieldValue.substring(start, end);
    
    // For bullet list, don't require selection
    if (formatType !== 'bullet' && !selectedText) {
      toast.warning('⚠️ Please select text to format', {
        autoClose: 3000,
      });
      return;
    }

    let formattedText = '';
    let formatName = '';
    let newCursorPos = start;
    
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        formatName = 'Bold';
        newCursorPos = start + formattedText.length;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        formatName = 'Italic';
        newCursorPos = start + formattedText.length;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        formatName = 'Underline';
        newCursorPos = start + formattedText.length;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        formatName = 'Strikethrough';
        newCursorPos = start + formattedText.length;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        formatName = 'Code';
        newCursorPos = start + formattedText.length;
        break;
      case 'bullet':
        if (selectedText) {
          // Convert selected lines to bullet points
          const lines = selectedText.split('\n');
          formattedText = lines.map(line => line.trim() ? `• ${line.trim()}` : line).join('\n');
          formatName = 'Bullet List';
          newCursorPos = start + formattedText.length;
        } else {
          // Insert a single bullet point
          formattedText = '• ';
          formatName = 'Bullet Point';
          newCursorPos = start + 2; // Position cursor after bullet
        }
        break;
      default:
        formattedText = selectedText;
        newCursorPos = start + formattedText.length;
    }

    const newValue = fieldValue.substring(0, start) + formattedText + fieldValue.substring(end);
    handleEventSectionChange(sectionId, field, newValue);
    
    toast.success(`✨ ${formatName} applied!`, { autoClose: 1500 });
    
    setTimeout(() => {
      inputElement.focus();
      inputElement.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleClearForm = () => {
    if (confirm('Are you sure you want to clear the form?')) {
      setIsLoading(true);
      setTimeout(() => {
        setFormData({
          monthYear: '',
          title: '',
          subtitle: '',
          fontFamily: 'IBM Plex Sans, sans-serif',
          fontSize: '16px',
          titleColor: '#161616',
          bodyColor: '#161616',
          subtitleColor: '#525252',
          ctaColor: '#0f62fe',
          body: '',
          contentImage: null,
          ctaText: '',
          ctaLink: '',
          videoUrl: '',
          location: '',
        });
        setBannerImage(null);
        setCurrentDraftId(null);
        setEventSections([{
          id: Date.now(),
          title: '',
          body: '',
          ctaText: '',
          ctaLink: '',
          videoUrl: '',
          location: '',
        }]);
        setIsLoading(false);
        toast.success('🗑️ Form cleared successfully!', {
          autoClose: 3000,
        });
      }, 300);
    }
  };

  const handleUploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 5) {
          toast.warning('⚠️ Image is large and will be compressed to save storage space', {
            autoClose: 4000,
          });
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            // Compress the image before storing
            const compressedImage = await compressImage(event.target.result);
            setBannerImage(compressedImage);
            
            toast.success('✅ Image uploaded and optimized', {
              autoClose: 2000,
            });
          } catch (error) {
            console.error('Image compression error:', error);
            // Fallback to original if compression fails
            setBannerImage(event.target.result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleChooseFromGallery = () => {
    setGalleryOpen(true);
  };

  const handleOpenInlineImageGallery = (config) => {
    setInlineImageInsertConfig(config);
    setInlineImageGalleryOpen(true);
  };

  const handleSelectImage = (imageUrl) => {
    setBannerImage(imageUrl);
  };

  const handleSelectInlineGalleryImage = (imageUrl) => {
    inlineImageInsertConfig?.onSelect?.(imageUrl);
    setInlineImageGalleryOpen(false);
    setInlineImageInsertConfig(null);
  };

  const handleCloseInlineImageGallery = () => {
    setInlineImageGalleryOpen(false);
    setInlineImageInsertConfig(null);
  };

  return (
    <div className="create-comm-tab" style={{ position: 'relative' }}>
      {isLoading && (
        <div className="create-comm-tab__loading-overlay">
          <Loading description="Processing..." withOverlay={false} />
        </div>
      )}
      <div className="create-comm-tab__hero">
        <div>
          <p className="create-comm-tab__eyebrow">Carbon communication builder</p>
          <h2 className="create-comm-tab__title">Create communication</h2>
          <p className="create-comm-tab__subtitle">
            Build polished internal comms with rich text, reusable colour controls, and flexible additional sections.
          </p>
        </div>
        <div className="create-comm-tab__hero-meta">
          <span className="create-comm-tab__hero-pill">Draft-ready</span>
          <span className="create-comm-tab__hero-pill">Email export</span>
          <span className="create-comm-tab__hero-pill">Carbon styled</span>
        </div>
      </div>
      <Form onSubmit={handleSubmit}>
        <Stack gap={7}>
          {/* Banner Image Section */}
          <div className="form-section form-section--panel">
            <div className="form-section__header">
              <div>
                <p className="form-section__eyebrow">Visual assets</p>
                <h3 className="section-title">Banner/Hero Image</h3>
              </div>
              <p className="form-section__description">Optional hero artwork for the top of your communication.</p>
            </div>
            <ButtonSet className="banner-actions">
              <Button kind="secondary" renderIcon={FolderOpen} onClick={handleUploadImage}>
                Upload Image
              </Button>
              <Button kind="secondary" onClick={handleChooseFromGallery}>
                Choose from Gallery
              </Button>
            </ButtonSet>
            {bannerImage && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '12px', color: '#525252', marginBottom: '8px' }}>
                  Banner Preview (Outlook recommended: 600px × 90-200px)
                </p>
                <img
                  src={bannerImage}
                  alt="Selected banner"
                  style={{
                    width: '600px',
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    display: 'block'
                  }}
                />
                <Button
                  kind="danger--ghost"
                  size="sm"
                  onClick={() => setBannerImage(null)}
                  style={{ marginTop: '8px' }}
                >
                  Remove Image
                </Button>
              </div>
            )}
          </div>

          {/* Date Field */}
          <TextInput
            id="monthYear"
            name="monthYear"
            labelText="Date"
            placeholder="e.g., March 2026"
            value={formData.monthYear}
            onChange={handleInputChange}
            helperText="Appears at the top of the email"
          />

          {/* Title Field */}
          <TextInput
            id="title"
            name="title"
            labelText="Main Title"
            placeholder="e.g., UKI Marketing Spotlight"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          {/* Subtitle Field */}
          <TextInput
            id="subtitle"
            name="subtitle"
            labelText="Subtitle (Optional)"
            placeholder="e.g., A Summer of Sport"
            value={formData.subtitle}
            onChange={handleInputChange}
          />

          {/* Font Settings */}
          <div className="form-section form-section--panel">
            <div className="form-section__header">
              <div>
                <p className="form-section__eyebrow">Typography</p>
                <h3 className="section-title">Font settings</h3>
              </div>
              <p className="form-section__description">Set default typography for the main body and additional sections.</p>
            </div>
          <Grid>
            <Column lg={8} md={4} sm={4}>
              <Select
                id="fontFamily"
                name="fontFamily"
                labelText="Font Family"
                value={formData.fontFamily}
                onChange={handleInputChange}
              >
                <SelectItem value="Arial, sans-serif" text="Arial" />
                <SelectItem value="'Helvetica Neue', Helvetica, sans-serif" text="Helvetica" />
                <SelectItem value="'IBM Plex Sans', sans-serif" text="IBM Plex Sans" />
                <SelectItem value="Georgia, serif" text="Georgia" />
                <SelectItem value="'Times New Roman', serif" text="Times New Roman" />
                <SelectItem value="'Courier New', monospace" text="Courier New" />
                <SelectItem value="Verdana, sans-serif" text="Verdana" />
                <SelectItem value="Tahoma, sans-serif" text="Tahoma" />
              </Select>
            </Column>
            <Column lg={8} md={4} sm={4}>
              <Select
                id="fontSize"
                name="fontSize"
                labelText="Body Font Size"
                value={formData.fontSize}
                onChange={handleInputChange}
              >
                <SelectItem value="11px" text="11px" />
                <SelectItem value="12px" text="12px" />
                <SelectItem value="13px" text="13px" />
                <SelectItem value="14px" text="14px" />
                <SelectItem value="15px" text="15px" />
                <SelectItem value="16px" text="16px (Default)" />
                <SelectItem value="17px" text="17px" />
                <SelectItem value="18px" text="18px" />
                <SelectItem value="19px" text="19px" />
                <SelectItem value="20px" text="20px" />
                <SelectItem value="21px" text="21px" />
                <SelectItem value="22px" text="22px" />
              </Select>
            </Column>
          </Grid>

          <Grid>
            <Column lg={8} md={4} sm={4}>
              <Select
                id="eventTitleFontSize"
                name="eventTitleFontSize"
                labelText="Additional Section Title Size"
                value={eventSections[0]?.titleFontSize || '24px'}
                onChange={(e) => {
                  const { value } = e.target;
                  setEventSections(prev => prev.map(section => ({
                    ...section,
                    titleFontSize: value
                  })));
                }}
              >
                <SelectItem value="18px" text="18px" />
                <SelectItem value="20px" text="20px" />
                <SelectItem value="22px" text="22px" />
                <SelectItem value="24px" text="24px (Default)" />
                <SelectItem value="26px" text="26px" />
                <SelectItem value="28px" text="28px" />
                <SelectItem value="30px" text="30px" />
              </Select>
            </Column>
            <Column lg={8} md={4} sm={4}>
              <Select
                id="eventBodyFontSize"
                name="eventBodyFontSize"
                labelText="Additional Section Body Size"
                value={eventSections[0]?.bodyFontSize || formData.fontSize}
                onChange={(e) => {
                  const { value } = e.target;
                  setEventSections(prev => prev.map(section => ({
                    ...section,
                    bodyFontSize: value
                  })));
                }}
              >
                <SelectItem value="11px" text="11px" />
                <SelectItem value="12px" text="12px" />
                <SelectItem value="13px" text="13px" />
                <SelectItem value="14px" text="14px" />
                <SelectItem value="15px" text="15px" />
                <SelectItem value="16px" text="16px (Default)" />
                <SelectItem value="17px" text="17px" />
                <SelectItem value="18px" text="18px" />
                <SelectItem value="19px" text="19px" />
                <SelectItem value="20px" text="20px" />
                <SelectItem value="21px" text="21px" />
                <SelectItem value="22px" text="22px" />
              </Select>
            </Column>
          </Grid>
          </div>

          {/* Color Palette Section */}
          <div className="form-section form-section--panel color-palette">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>Color Palette</h3>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={Reset}
                onClick={handleResetColors}
              >
                Reset to Default Colors
              </Button>
            </div>
            <Grid>
              <Column lg={4} md={2} sm={2}>
                <TextInput
                  id="titleColor"
                  name="titleColor"
                  labelText="Title Color"
                  type="color"
                  value={formData.titleColor}
                  onChange={handleInputChange}
                />
              </Column>
              <Column lg={4} md={2} sm={2}>
                <TextInput
                  id="bodyColor"
                  name="bodyColor"
                  labelText="Body Text Color"
                  type="color"
                  value={formData.bodyColor}
                  onChange={handleInputChange}
                />
              </Column>
              <Column lg={4} md={2} sm={2}>
                <TextInput
                  id="subtitleColor"
                  name="subtitleColor"
                  labelText="Subtitle Color"
                  type="color"
                  value={formData.subtitleColor}
                  onChange={handleInputChange}
                />
              </Column>
              <Column lg={4} md={2} sm={2}>
                <TextInput
                  id="ctaColor"
                  name="ctaColor"
                  labelText="CTA Button Color"
                  type="color"
                  value={formData.ctaColor}
                  onChange={handleInputChange}
                />
              </Column>
            </Grid>
          </div>

          {/* Message Body */}
          <div className="form-section form-section--panel">
            <div className="form-section__header">
              <div>
                <p className="form-section__eyebrow">Content</p>
                <h3 className="section-title">Message body</h3>
              </div>
              <p className="form-section__description">Compose the main message using the Carbon-aligned rich text editor.</p>
            </div>
          <RichTextEditor
            label="Message Body"
            content={formData.body}
            onChange={(value) => setFormData(prev => ({ ...prev, body: value }))}
            placeholder="Enter your main message content..."
            minHeight={220}
            textColor={formData.bodyColor}
            fontSize={formData.fontSize}
            colorLabel="Body Colour"
            sizeLabel="Body Size"
            defaultTextColor={formData.bodyColor}
            colorOptions={colourOptions}
            onDefaultColorChange={(value) => setFormData(prev => ({ ...prev, bodyColor: value }))}
            onFontSizeChange={(value) => setFormData(prev => ({ ...prev, fontSize: value }))}
            fontSizeOptions={['11px', '12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px', '20px', '21px', '22px']}
            emojiOptions={emojis}
            onInsertInlineImage={handleOpenInlineImageGallery}
          />
          </div>

          {/* CTA Fields */}
          <TextInput
            id="ctaText"
            name="ctaText"
            labelText="Call-to-Action Button Text (Optional)"
            placeholder="e.g., UKI MCC Page"
            value={formData.ctaText}
            onChange={handleInputChange}
          />

          <TextInput
            id="ctaLink"
            name="ctaLink"
            labelText="Call-to-Action Button Link (Optional)"
            type="url"
            placeholder="https://example.com"
            value={formData.ctaLink}
            onChange={handleInputChange}
          />

          {/* Video URL */}
          <TextInput
            id="videoUrl"
            name="videoUrl"
            labelText="Video URL (Optional)"
            type="url"
            placeholder="YouTube or Vimeo URL"
            value={formData.videoUrl}
            onChange={handleInputChange}
            helperText="Paste a YouTube or Vimeo link. A clickable thumbnail will be embedded in the email."
          />

          {/* Main Content Image */}
          <div className="form-section form-section--panel form-section--compact">
            <div className="form-section__header">
              <div>
                <p className="form-section__eyebrow">Media</p>
                <h3 className="section-title">Main content image</h3>
              </div>
              <p className="form-section__description">Optional image block displayed within the body content.</p>
            </div>
            <div className="content-image-panel">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Main Content Image (Optional)
            </label>
            {formData.contentImage ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={formData.contentImage}
                  alt="Content preview"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '200px',
                    display: 'block',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0'
                  }}
                />
                <Button
                  kind="danger--ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, contentImage: null }))}
                  style={{ marginTop: '0.5rem' }}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <Button
                kind="tertiary"
                size="sm"
                renderIcon={Image}
                onClick={handleContentImageUpload}
              >
                Upload Image
              </Button>
            )}
            <p className="content-image-panel__helper">
              Add an image to your main content. Recommended: Keep images under 500KB for best email performance.
            </p>
            </div>
          </div>

          {/* Location */}
          <TextInput
            id="location"
            name="location"
            labelText="Location (Optional)"
            placeholder="Meeting location or URL"
            value={formData.location}
            onChange={handleInputChange}
          />

          {/* Event Sections - Collapsible */}
          <div className="form-section form-section--panel form-section--events">
            <div className="form-section__header">
              <div>
                <p className="form-section__eyebrow">Additional content</p>
                <h3 className="section-title">Additional event sections</h3>
              </div>
              <p className="form-section__description">Add supporting stories, events, webinars, and follow-up calls to action.</p>
            </div>
            <Accordion>
              <AccordionItem
                title={
                  <div className="event-sections__accordion-title">
                    <span className="event-sections__accordion-heading">Additional Event Sections ({eventSections.length})</span>
                  </div>
                }
                open={eventSectionsExpanded}
              >
                <div className="event-sections">
                  <div className="event-sections__intro">
                    <p className="event-sections__description">
                      Add multiple events to your communication. Each event can have its own title, description, CTA, and location.
                    </p>
                    <Button kind="primary" size="sm" renderIcon={Add} onClick={handleAddEventSection}>
                      Add Event
                    </Button>
                  </div>

                  {eventSections.map((section, index) => (
                    <div
                      key={section.id}
                      className="event-section-card"
                    >
                      <div className="event-section-card__header">
                        <div>
                          <p className="event-section-card__eyebrow">Section {index + 1}</p>
                          <h4 className="event-section-card__title">Event details</h4>
                        </div>
                        {eventSections.length > 1 && (
                          <Button
                            kind="danger--ghost"
                            size="sm"
                            renderIcon={TrashCan}
                            onClick={() => handleRemoveEventSection(section.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <Stack gap={5}>
                        <RichTextEditor
                          label="Event Title"
                          content={section.title}
                          onChange={(value) => handleEventSectionChange(section.id, 'title', value)}
                          placeholder="e.g., Webinar: AI in Marketing"
                          minHeight={120}
                          textColor={formData.titleColor}
                          fontSize={section.titleFontSize || '24px'}
                          colorLabel="Title Colour"
                          sizeLabel="Title Size"
                          defaultTextColor={formData.titleColor}
                          colorOptions={colourOptions}
                          onDefaultColorChange={(value) => setFormData(prev => ({ ...prev, titleColor: value }))}
                          onFontSizeChange={(value) => handleEventSectionChange(section.id, 'titleFontSize', value)}
                          fontSizeOptions={['18px', '20px', '22px', '24px', '26px', '28px', '30px']}
                          emojiOptions={emojis}
                          onInsertInlineImage={handleOpenInlineImageGallery}
                        />

                        <RichTextEditor
                          label="Event Description"
                          content={section.body}
                          onChange={(value) => handleEventSectionChange(section.id, 'body', value)}
                          placeholder="Describe this event..."
                          minHeight={180}
                          textColor={formData.bodyColor}
                          fontSize={section.bodyFontSize || formData.fontSize}
                          colorLabel="Body Colour"
                          sizeLabel="Body Size"
                          defaultTextColor={formData.bodyColor}
                          colorOptions={colourOptions}
                          onDefaultColorChange={(value) => setFormData(prev => ({ ...prev, bodyColor: value }))}
                          onFontSizeChange={(value) => handleEventSectionChange(section.id, 'bodyFontSize', value)}
                          fontSizeOptions={['11px', '12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px', '20px', '21px', '22px']}
                          emojiOptions={emojis}
                          onInsertInlineImage={handleOpenInlineImageGallery}
                        />

                        <div style={{ marginTop: '24px' }}>
                          <TextInput
                            id={`event-cta-text-${section.id}`}
                            labelText="CTA Button Text (Optional)"
                            placeholder="e.g., Register Now"
                            value={section.ctaText}
                            onChange={(e) => handleEventSectionChange(section.id, 'ctaText', e.target.value)}
                          />
                        </div>

                        <TextInput
                          id={`event-cta-link-${section.id}`}
                          labelText="CTA Button Link (Optional)"
                          type="url"
                          placeholder="https://example.com/register"
                          value={section.ctaLink}
                          onChange={(e) => handleEventSectionChange(section.id, 'ctaLink', e.target.value)}
                        />

                        <TextInput
                          id={`event-video-${section.id}`}
                          labelText="Video URL (Optional)"
                          type="url"
                          placeholder="YouTube or Vimeo URL"
                          value={section.videoUrl}
                          onChange={(e) => handleEventSectionChange(section.id, 'videoUrl', e.target.value)}
                        />

                        <TextInput
                          id={`event-location-${section.id}`}
                          labelText="Location (Optional)"
                          placeholder="Event location or URL"
                          value={section.location}
                          onChange={(e) => handleEventSectionChange(section.id, 'location', e.target.value)}
                        />

                        <div style={{ marginTop: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                            Event Image (Optional)
                          </label>
                          {section.image ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <img
                                src={section.image}
                                alt="Event preview"
                                style={{
                                  maxWidth: '300px',
                                  maxHeight: '200px',
                                  display: 'block',
                                  borderRadius: '4px',
                                  border: '1px solid #e0e0e0'
                                }}
                              />
                              <Button
                                kind="danger--ghost"
                                size="sm"
                                onClick={() => handleEventSectionChange(section.id, 'image', null)}
                                style={{ marginTop: '0.5rem' }}
                              >
                                Remove Image
                              </Button>
                            </div>
                          ) : (
                            <Button
                              kind="tertiary"
                              size="sm"
                              renderIcon={Image}
                              onClick={() => handleEventSectionImageUpload(section.id)}
                            >
                              Upload Image
                            </Button>
                          )}
                          <p style={{ fontSize: '0.75rem', color: '#6f6f6f', marginTop: '0.5rem' }}>
                            Recommended: Keep images under 500KB for best email performance
                          </p>
                        </div>
                      </Stack>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <div className="action-buttons__group action-buttons__group--primary">
              <div className="action-buttons__group-header">
                <p className="action-buttons__eyebrow">Drafts</p>
                <h4 className="action-buttons__title">Save your work</h4>
              </div>
              <ButtonSet>
                <Button kind="secondary" renderIcon={Save} onClick={handleSaveDraft}>
                  Save as Draft
                </Button>
                {currentDraftId && (
                  <Button kind="primary" renderIcon={Save} onClick={handleUpdateDraft}>
                    Update Draft
                  </Button>
                )}
              </ButtonSet>
            </div>

            <div className="action-buttons__group action-buttons__group--preview">
              <div className="action-buttons__group-header">
                <p className="action-buttons__eyebrow">Review</p>
                <h4 className="action-buttons__title">Preview before export</h4>
              </div>
              <ButtonSet>
                <Button kind="tertiary" renderIcon={View} onClick={handlePreview}>
                  Preview Email
                </Button>
              </ButtonSet>
            </div>

            <div className="action-buttons__group action-buttons__group--export">
              <div className="action-buttons__group-header">
                <p className="action-buttons__eyebrow">Outputs</p>
                <h4 className="action-buttons__title">Export and share</h4>
              </div>
              <ButtonSet>
                <Button kind="secondary" renderIcon={Document} onClick={handleExportHTML}>
                  Export as HTML
                </Button>
                <Button kind="secondary" renderIcon={DocumentPdf} onClick={handleExportPDF}>
                  Export as PDF
                </Button>
                <Button kind="secondary" renderIcon={Image} onClick={handleExportJPG}>
                  Export as JPG
                </Button>
                <Button kind="secondary" renderIcon={Chat} onClick={handlePostToSlack}>
                  Post to Slack
                </Button>
              </ButtonSet>
            </div>

            <div className="action-buttons__group action-buttons__group--danger">
              <div className="action-buttons__group-header">
                <p className="action-buttons__eyebrow">Reset</p>
                <h4 className="action-buttons__title">Start over</h4>
              </div>
              <ButtonSet>
                <Button kind="danger--tertiary" renderIcon={Reset} onClick={handleClearForm}>
                  Clear Form
                </Button>
              </ButtonSet>
            </div>
          </div>
        </Stack>
      </Form>
      
      <ImageGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelectImage={handleSelectImage}
      />

      <ImageGalleryModal
        open={inlineImageGalleryOpen}
        onClose={handleCloseInlineImageGallery}
        onSelectImage={handleSelectInlineGalleryImage}
      />
    </div>
  );
});

export default CreateCommTab;

// Made with Bob
