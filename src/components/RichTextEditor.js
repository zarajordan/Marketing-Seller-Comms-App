import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Select, SelectItem } from '@carbon/react';
import {
  TextBold,
  TextItalic,
  TextUnderline,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  List,
  ListNumbered
} from '@carbon/icons-react';

const RichTextEditor = ({ value, onChange, placeholder, minHeight = '120px' }) => {
  // Custom FontSize extension
  const FontSize = TextStyle.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        fontSize: {
          default: null,
          parseHTML: element => element.style.fontSize,
          renderHTML: attributes => {
            if (!attributes.fontSize) {
              return {};
            }
            return {
              style: `font-size: ${attributes.fontSize}`,
            };
          },
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      FontSize,
      Color,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Sync editor content when value prop changes (e.g., switching between events)
  React.useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent = editor.getHTML();
      // Only update if the content is actually different to avoid cursor jumping
      if (currentContent !== value) {
        editor.commands.setContent(value || '', false);
      }
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

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
        height: '32px'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#e0e0e0';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );

  const FontSizeButton = ({ size, label }) => (
    <button
      type="button"
      onClick={() => {
        editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
      }}
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
        height: '32px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#e0e0e0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {label}
    </button>
  );

  // Common emojis for business communications (matching CreateCommTab and ManageEventsTab)
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

  const insertEmoji = (emoji) => {
    if (!emoji) return;
    editor.chain().focus().insertContent(emoji).run();
  };

  return (
    <div style={{
      border: '2px solid #e0e0e0',
      borderRadius: '4px',
      backgroundColor: 'white',
      overflow: 'hidden'
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '8px',
        backgroundColor: '#f4f4f4',
        borderBottom: '1px solid #e0e0e0',
        alignItems: 'center'
      }}>
        {/* Text Formatting */}
        <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <TextBold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <TextItalic size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <TextUnderline size={16} />
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
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListNumbered size={16} />
          </ToolbarButton>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: '#c6c6c6', margin: '0 4px' }} />

        {/* Emoji Dropdown - matching brief summary */}
        <div style={{ minWidth: '120px' }}>
          <Select
            id="emoji-picker"
            labelText=""
            hideLabel
            size="sm"
            defaultValue=""
            onChange={(e) => {
              insertEmoji(e.target.value);
              e.target.value = '';
            }}
            style={{
              minHeight: '32px',
              height: '32px'
            }}
          >
            <SelectItem value="" text="😊 Emoji" />
            {emojis.map((emoji, index) => (
              <SelectItem key={index} value={emoji} text={emoji} />
            ))}
          </Select>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor}
        style={{
          minHeight: minHeight,
          maxHeight: '400px',
          overflowY: 'auto'
        }}
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
        
        .ProseMirror p {
          margin: 0 0 8px 0;
        }
        
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 24px;
          margin: 8px 0;
        }
        
        .ProseMirror li {
          margin: 4px 0;
        }
        
        .ProseMirror strong {
          font-weight: 600;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
        
        .ProseMirror s {
          text-decoration: line-through;
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #a8a8a8;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;

// Made with Bob
