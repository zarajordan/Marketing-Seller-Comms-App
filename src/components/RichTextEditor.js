import React, { useRef, useCallback } from 'react';
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import ImageBase from '@tiptap/extension-image';
import { Select, SelectItem } from '@carbon/react';
import {
  TextBold,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  List,
  ListNumbered,
  Link as LinkIcon,
  Image as ImageIcon,
} from '@carbon/icons-react';

// ─── Resizable Image Node View ────────────────────────────────────────────────
const ResizableImageView = ({ node, updateAttributes, selected }) => {
  const { src, alt, width } = node.attrs;

  // width is stored as a CSS value like '25%', '50%', '75%', '100%'
  const sizes = [
    { label: 'S (25%)',  value: '25%',  title: 'Small – 25% width' },
    { label: 'M (50%)',  value: '50%',  title: 'Medium – 50% width' },
    { label: 'L (75%)',  value: '75%',  title: 'Large – 75% width' },
    { label: 'Full',     value: '100%', title: 'Full width – 100%' },
  ];

  const currentWidth = width || '100%';

  return (
    <NodeViewWrapper
      as="div"
      style={{
        display: 'block',
        position: 'relative',
        width: currentWidth,
        maxWidth: '100%',
        margin: '4px 0',
      }}
    >
      <img
        src={src}
        alt={alt || ''}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          outline: selected ? '2px solid #0f62fe' : 'none',
          outlineOffset: '2px',
          borderRadius: '2px',
          cursor: 'default',
        }}
      />
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            display: 'flex',
            gap: '4px',
            background: 'rgba(0,0,0,0.72)',
            borderRadius: '4px',
            padding: '4px 6px',
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {sizes.map(({ label, value, title }) => (
            <button
              key={value}
              type="button"
              title={title}
              onClick={() => updateAttributes({ width: value })}
              style={{
                padding: '3px 9px',
                border: 'none',
                borderRadius: '3px',
                background: currentWidth === value ? '#0f62fe' : 'rgba(255,255,255,0.9)',
                color: currentWidth === value ? '#fff' : '#161616',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                lineHeight: '20px',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </NodeViewWrapper>
  );
};

// ─── Custom Image Extension ───────────────────────────────────────────────────
const Image = ImageBase.extend({
  // Make it a block node so it isn't constrained by line-height
  inline: false,
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        // Read back both style="width:…" and width="…" attribute forms
        parseHTML: (el) => el.style.width || el.getAttribute('width') || '100%',
        // Write as both a style and an attribute so email clients pick it up
        renderHTML: (attrs) => {
          const w = attrs.width || '100%';
          return {
            width: w,                              // HTML attribute (email-safe)
            style: `width: ${w}; max-width: 100%; height: auto; display: block;`,
          };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

// ─── Main Editor Component ────────────────────────────────────────────────────
const RichTextEditor = ({ value, onChange, placeholder, minHeight = '120px', label, labelNote }) => {
  const fileInputRef = useRef(null);

  // Custom FontSize extension
  const FontSize = TextStyle.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        fontSize: {
          default: null,
          parseHTML: element => element.style.fontSize,
          renderHTML: attributes => {
            if (!attributes.fontSize) return {};
            return { style: `font-size: ${attributes.fontSize}` };
          },
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      FontSize,
      Color,
      Image.configure({ inline: true }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync editor content when value prop changes
  React.useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== value) {
        editor.commands.setContent(value || '', false);
      }
    }
  }, [editor, value]);

  // Convert uploaded file → base64 and insert
  const handleImageFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      editor.chain().focus().setImage({ src: e.target.result, width: '100%' }).run();
    };
    reader.readAsDataURL(file);
  }, [editor]);

  // Handle paste of image files
  React.useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const onPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          handleImageFile(item.getAsFile());
          return;
        }
      }
    };
    dom.addEventListener('paste', onPaste);
    return () => dom.removeEventListener('paste', onPaste);
  }, [editor, handleImageFile]);

  if (!editor) return null;

  // ─── Sub-components ──────────────────────────────────────────────────────────
  const ToolbarButton = ({ onClick, active, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: '6px 10px',
        border: 'none',
        backgroundColor: active ? '#0f62fe' : 'transparent',
        color: active ? 'white' : '#161616',
        cursor: 'pointer',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        minWidth: '32px',
        height: '32px',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#e0e0e0'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {children}
    </button>
  );

  const FontSizeButton = ({ size, label }) => (
    <button
      type="button"
      onClick={() => editor.chain().focus().setMark('textStyle', { fontSize: size }).run()}
      title={`Font size ${label}`}
      style={{
        padding: '6px 10px',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#161616',
        cursor: 'pointer',
        borderRadius: '4px',
        fontSize: size,
        fontWeight: 'bold',
        transition: 'all 0.2s',
        minWidth: '32px',
        height: '32px',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0e0e0'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {label}
    </button>
  );

  const emojis = [
    '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
    '🔗', '🎨', '💝', '🧑‍💼',
    '😊', '👍', '🎉', '✨', '💡', '🚀', '📅', '📧', '📊', '💼',
    '🎯', '✅', '⭐', '🔔', '📢', '🎓', '🏆', '💪', '🤝', '👏',
    '📱', '💻', '🌟', '🔥', '💯', '📈', '🎊', '🙌', '❤️', '👋',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
    '🏒', '🏑', '🥅', '⛳', '🏹', '🎣', '🥊', '🥋', '⛷️', '🏂',
    '💾', '🖥️', '⌨️', '🖱️', '🖨️', '📡', '🔌', '🔋', '⚡', '🌐',
    '🔒', '🔓', '🔐', '🛡️', '⚙️', '🔧', '🔩', '⚗️', '🧪', '🧬',
  ];

  const insertEmoji = (emoji) => {
    if (!emoji) return;
    editor.chain().focus().insertContent(emoji).run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter the URL:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const openImageByUrl = () => {
    const url = window.prompt('Enter image URL:');
    if (!url) return;
    editor.chain().focus().setImage({ src: url, width: '100%' }).run();
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {label && (
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#525252' }}>
          {label}
          {labelNote && (
            <span style={{ color: '#da1e28', fontWeight: '400', marginLeft: '6px' }}>{labelNote}</span>
          )}
        </label>
      )}
      <div style={{ border: '2px solid #e0e0e0', borderRadius: '4px', backgroundColor: 'white', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          padding: '8px',
          backgroundColor: '#f4f4f4',
          borderBottom: '1px solid #e0e0e0',
          alignItems: 'center',
        }}>
          {/* Text Formatting */}
          <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
              <TextBold size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
              <TextItalic size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
              <TextUnderline size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
              <TextStrikethrough size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Add/Edit Link">
              <LinkIcon size={16} />
            </ToolbarButton>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '24px', backgroundColor: '#c6c6c6', margin: '0 4px' }} />

          {/* Font Sizes */}
          <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
            <FontSizeButton size="12px" label="S" />
            <FontSizeButton size="14px" label="M" />
            <FontSizeButton size="16px" label="L" />
            <FontSizeButton size="18px" label="XL" />
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '24px', backgroundColor: '#c6c6c6', margin: '0 4px' }} />

          {/* Lists */}
          <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
              <ListNumbered size={16} />
            </ToolbarButton>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '24px', backgroundColor: '#c6c6c6', margin: '0 4px' }} />

          {/* Image */}
          <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
            <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Upload image from file">
              <ImageIcon size={16} />
            </ToolbarButton>
            <button
              type="button"
              title="Insert image by URL"
              onClick={openImageByUrl}
              style={{
                padding: '4px 8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#161616',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                height: '32px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0e0e0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              URL
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '24px', backgroundColor: '#c6c6c6', margin: '0 4px' }} />

          {/* Emoji Dropdown */}
          <div style={{ minWidth: '120px' }}>
            <Select
              id="emoji-picker"
              labelText=""
              hideLabel
              size="sm"
              defaultValue=""
              onChange={(e) => { insertEmoji(e.target.value); e.target.value = ''; }}
              style={{ minHeight: '32px', height: '32px' }}
            >
              <SelectItem value="" text="😊 Emoji" />
              {emojis.map((emoji, index) => (
                <SelectItem key={index} value={emoji} text={emoji} />
              ))}
            </Select>
          </div>
        </div>

        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            handleImageFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          style={{ minHeight: minHeight, maxHeight: '400px', overflowY: 'auto' }}
        />

        <style>{`
          .ProseMirror {
            padding: 12px;
            min-height: ${minHeight};
            outline: none;
            font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #161616;
          }
          .ProseMirror p { margin: 0 0 8px 0; }
          .ProseMirror p:last-child { margin-bottom: 0; }
          .ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 8px 0; }
          .ProseMirror ul { list-style-type: disc; }
          .ProseMirror ol { list-style-type: decimal; }
          .ProseMirror li { margin: 4px 0; display: list-item; }
          .ProseMirror strong { font-weight: 600; }
          .ProseMirror em { font-style: italic; }
          .ProseMirror u { text-decoration: underline; }
          .ProseMirror s { text-decoration: line-through; }
          .ProseMirror a { color: #0f62fe; text-decoration: underline; cursor: pointer; }
          .ProseMirror a:hover { color: #0043ce; }
          .ProseMirror:focus { outline: none; }
          .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #a8a8a8;
            pointer-events: none;
            height: 0;
          }
          .ProseMirror img { max-width: 100%; display: block; }
        `}</style>
      </div>
    </div>
  );
};

export default RichTextEditor;

// Made with Bob
