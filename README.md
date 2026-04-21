# 📧 IBM Marketing Comms, UKI - Communication Builder

A professional web application for creating IBM-branded marketing communications that can be exported to Microsoft Outlook and other formats.

## Features

### 🎨 **Professional Design**
- IBM-branded interface with IBM Plex Sans typography
- Customizable color palette (title, body, subtitle, CTA colors)
- 8 professional font family options
- Adjustable font sizes (12px - 20px)
- Date overlay on banner images

### 📝 **Content Creation**
- Banner/hero image upload with preview
- **Image Gallery**: Choose from curated stock images (Business, Technology, People, Nature, Abstract)
- Main title and subtitle fields
- **Rich Text Editor**: Format text with bold, italic, underline, lists, links, and alignment
- Rich message body with emoji support (160+ emojis)
- **Video Embed**: Add YouTube or Vimeo videos with clickable thumbnails
- Multiple dynamic sections for events/content
- Call-to-action buttons with custom text and links
- Inline image support (multiple images) - upload or choose from gallery
- Location information field

### 📚 **Template Library**
- Pre-built templates for common communication types
- 6 professional templates:
  - **Company Announcement**: Professional updates and news
  - **Newsletter**: Monthly/weekly updates with multiple sections
  - **Event Invitation**: Engaging event invites with RSVP
  - **Product Launch**: Exciting product announcements
  - **Team Update**: Internal team communications
  - **Welcome Email**: Onboarding and welcome messages
- One-click template loading
- Fully customizable after loading

### � **Draft Management**
- Save multiple named drafts with tags and categories
- Tabbed interface (Create Comm / Templates / My Drafts / AI Assistant)
- Load and edit saved drafts
- **Duplicate drafts** to use as templates
- **Share drafts** with team members via link
- **Tags & Categories** for organizing drafts by campaign, department, or type
- Delete unwanted drafts
- Draft preview with title and body snippet

### 📤 **Multiple Export Formats**
- **Outlook (.eml)**: Opens directly in Microsoft Outlook with full formatting and embedded images
- **HTML**: Standalone HTML file for web viewing or email clients
- **PDF**: Print-to-PDF for archiving and sharing (via browser print dialog)
- **Plain Text**: Simple text version for basic distribution
- **Slack**: Post directly to Slack channels via webhook integration

### 💬 **Slack Integration**
- Post communications directly to Slack channels
- Configure webhook URL and channel override
- Option to include/exclude images
- Formatted messages with title, body, CTA buttons, and location

### 👁️ **Preview Mode**
- Live preview of your communication before exporting
- See exactly how it will look with all formatting and images

## How to Use

### 1. Open the Application
Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).

### 2. Create Your Communication

#### Basic Information
- **Banner Image** (Optional):
  - Click "📁 Upload Image" to upload from your computer
  - Click "🖼️ Choose from Gallery" to select from curated stock images
  - Recommended 800px+ width
- **Date**: Enter date text (e.g., "March 2026") - appears below subtitle
- **Main Title**: Your communication headline (required)
- **Subtitle** (Optional): Supporting text in italic style

#### Styling
- **Font Family**: Choose from 8 professional fonts (IBM Plex Sans default)
- **Body Font Size**: Select from 12px to 20px
- **Color Palette**: Customize 4 colors:
  - Title Color
  - Body Text Color
  - Subtitle Color
  - CTA Button Color

#### Content
- **Message Body**: Rich text editor with formatting toolbar
  - **Bold** (Ctrl+B), *Italic* (Ctrl+I), <u>Underline</u> (Ctrl+U)
  - Bullet lists and numbered lists
  - Text alignment (left, center, right)
  - Insert links
  - Add emojis (click 😀 button for 160+ options)
- **CTA Button** (Optional): Add call-to-action with text and link
- **Video URL** (Optional):
  - Paste a YouTube or Vimeo link
  - Automatically generates clickable video thumbnail
  - Supports both YouTube and Vimeo formats
- **Sections**: Add multiple event/content sections with titles and descriptions
- **Inline Images** (Optional):
  - Upload from your computer
  - Choose from image gallery (5 categories: Business, Technology, People, Nature, Abstract)
- **Location** (Optional): Add location or meeting details

### 3. Use Templates (Optional)
Navigate to the "📚 Templates" tab to:
- Browse 6 pre-built professional templates
- Click "Use Template" on any template card
- Template loads into the Create Comm tab with:
  - Pre-written title, subtitle, and body content
  - Appropriate sections and formatting
  - Suggested CTA buttons and links
- Customize the template as needed
- Templates include:
  - **Company Announcement**: Professional updates
  - **Newsletter**: Multi-section updates
  - **Event Invitation**: Event details with RSVP
  - **Product Launch**: Product announcements
  - **Team Update**: Internal communications
  - **Welcome Email**: Onboarding messages

### 4. Save as Draft
- Click "💾 Save as Draft"
- Enter a name for your draft
- **Add tags** (comma-separated) to organize drafts
- **Select a category** (Campaign, Department, Event, Newsletter, Announcement, or Other)
- Access later from "My Drafts" tab

### 5. Manage Drafts
Navigate to the "My Drafts" tab to:
- **Load**: Open a draft for editing
- **Duplicate**: Clone a draft to use as a template
- **Share**: Generate a shareable link to send to team members
  - Link copies to clipboard automatically
  - Recipients can open the link to load the draft
- **Delete**: Remove unwanted drafts
- View draft metadata: name, category, tags, and save date

### 6. Use AI Assistant
Navigate to the "🤖 AI Assistant" tab to:
- Generate content using AI-powered suggestions
- Choose from 6 quick templates (Welcome, Update, Event, Newsletter, Announcement, Thank You)
- Adjust tone (Professional, Friendly, Formal) and length (Short, Medium, Long)
- Insert generated content directly into your communication

### 7. Preview
- Click "👁️ Preview Email" to see how it will look
- Review formatting, colors, and images

### 8. Export

#### Export to Outlook (.eml)
1. Click "✉️ Export to Outlook (.eml)"
2. A `.eml` file downloads with all images embedded
3. Double-click to open in Outlook
4. Email opens ready to send with full formatting

#### Export as HTML
1. Click "📄 Export as HTML"
2. Downloads standalone HTML file
3. Open in browser or import to email clients
4. All images embedded as base64

#### Export as PDF
1. Click "📑 Export as PDF"
2. New window opens with print-ready version
3. Use browser's print dialog (Ctrl+P / Cmd+P)
4. Select "Save as PDF" as printer
5. Save to desired location

#### Export as Plain Text
1. Click "📝 Export as Plain Text"
2. Downloads `.txt` file
3. Simple text format without images
4. Good for basic distribution or archiving

### 9. Post to Slack
1. Click "💬 Post to Slack" button
2. Enter your Slack webhook URL
   - Get this from Slack's Incoming Webhooks app
   - Format: `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`
3. (Optional) Override default channel with `#channel-name` or `@username`
4. Choose whether to include images
5. Click "📤 Send to Slack"
6. Your communication posts to Slack with formatted blocks

**Setting up Slack Webhook:**
1. Go to your Slack workspace settings
2. Navigate to Apps → Incoming Webhooks
3. Click "Add to Slack"
4. Choose a channel and authorize
5. Copy the webhook URL provided

## File Structure

```
Comms App/
├── index.html      # Main HTML interface
├── app.js          # JavaScript functionality
├── styles.css      # IBM-branded styling
└── README.md       # This documentation
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)
## New Features

### Rich Text Editor
The message body now includes a powerful formatting toolbar:
- **Text Formatting**: Bold, Italic, Underline
- **Lists**: Bullet points and numbered lists
- **Alignment**: Left, center, and right alignment
- **Links**: Insert clickable hyperlinks
- **Emojis**: 160+ emojis to add personality

### Image Gallery
Choose from curated stock images instead of uploading:
- **5 Categories**: Business, Technology, People, Nature, Abstract
- **High Quality**: Professional images from Unsplash
- **Easy Selection**: Click to add to banner or inline images
- **Mix & Match**: Combine uploaded and gallery images


## Technical Details

### Email Export (.eml)
- RFC 822 compliant email format
- MIME multipart/related for embedded images
- Base64 encoding for images
- HTML email with inline CSS
- Opens directly in Outlook

### HTML Export
- Standalone HTML5 document
- Embedded CSS styling
- Base64-encoded images
- Responsive design
- Works in all modern browsers

### PDF Export
- Uses browser's native print-to-PDF
- Print-optimized styling
- Includes all images
- Professional layout
- Cross-platform compatible

### Plain Text Export
- UTF-8 encoded
- Structured formatting with headers
- Link URLs included
- No images (text only)
- Universal compatibility

## Tips & Best Practices

### Images
- **Banner**: Use wide images (800-1200px width) for best results
- **Inline Images**: Multiple images display in a grid
- **Formats**: Supports JPG, PNG, GIF, WebP
- **Size**: Keep images under 2MB each for best performance

### Colors
- Use IBM color palette for brand consistency:
  - IBM Blue: #0f62fe
  - Dark Gray: #161616
  - Medium Gray: #525252
- Test color contrast for accessibility

### Content
- Keep titles concise (under 60 characters)
- Use sections to organize multiple events
- Add emojis sparingly for emphasis
- Include clear CTA with actionable text

### Drafts
- Use descriptive names for easy identification
- Save work-in-progress communications
- Duplicate drafts by loading and saving with new name

## Troubleshooting

### .eml File Won't Open
- Ensure Outlook is installed and set as default for .eml files
- Try right-click → "Open with" → "Outlook"
- Check Windows file associations

### Images Not Showing
- Verify images uploaded successfully (preview should show)
- Check image file size (keep under 2MB)
- Try different image format (JPG recommended)

### PDF Export Issues
- Use Chrome or Edge for best PDF results
- Ensure pop-ups are allowed for the site
- Check printer settings in print dialog

### Drafts Not Saving
- Check browser localStorage is enabled
- Clear browser cache if issues persist
- Ensure browser is up to date

## IBM Branding Guidelines

This application follows IBM Design Language:
- **Typography**: IBM Plex Sans font family
- **Colors**: IBM color palette (blue, grays)
- **Layout**: Clean, professional spacing
- **Imagery**: Professional photography recommended

## Future Enhancements

Potential features for future versions:
- Template library with pre-built designs
- Recipient list management
- Send scheduling
- Analytics and tracking
- Multi-language support
- A/B testing for subject lines
- Integration with email platforms
- Approval workflows

## License

Free to use and modify for IBM internal projects.

## Support

For issues or questions:
1. Check browser console for errors
2. Verify file permissions
3. Test in different browser
4. Clear cache and reload

---

**IBM Marketing Comms, UKI** | Professional Communication Builder