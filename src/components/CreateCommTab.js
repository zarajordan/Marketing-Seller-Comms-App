import React, { useState } from 'react';
import {
  Form,
  Stack,
  TextInput,
  Select,
  SelectItem,
  Button,
  FileUploader,
  ColorPicker,
  TextArea,
  ButtonSet,
  Grid,
  Column,
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
} from '@carbon/icons-react';
import ImageGalleryModal from './ImageGalleryModal';

const CreateCommTab = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
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
    ctaText: '',
    ctaLink: '',
    videoUrl: '',
    location: '',
  });

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
      const drafts = JSON.parse(localStorage.getItem('comms_drafts') || '[]');
      drafts.push({
        id: Date.now(),
        name: draftName,
        date: new Date().toISOString(),
        data: formData
      });
      localStorage.setItem('comms_drafts', JSON.stringify(drafts));
      alert('Draft saved successfully!');
    }
  };

  const handleLoadDraft = () => {
    const drafts = JSON.parse(localStorage.getItem('comms_drafts') || '[]');
    if (drafts.length === 0) {
      alert('No drafts found');
      return;
    }
    const draftList = drafts.map((d, i) => `${i + 1}. ${d.name}`).join('\n');
    const selection = prompt(`Select a draft:\n${draftList}\n\nEnter number:`);
    if (selection) {
      const index = parseInt(selection) - 1;
      if (drafts[index]) {
        setFormData(drafts[index].data);
        alert('Draft loaded successfully!');
      }
    }
  };

  const handlePreview = () => {
    alert('Preview functionality - would open a modal with email preview');
  };

  const handleExportOutlook = () => {
    alert('Export to Outlook (.eml) - functionality would generate and download .eml file');
  };

  const handleExportHTML = () => {
    alert('Export as HTML - functionality would generate and download HTML file');
  };

  const handleExportPDF = () => {
    alert('Export as PDF - functionality would generate and download PDF file');
  };

  const handleExportText = () => {
    alert('Export as Plain Text - functionality would generate and download text file');
  };

  const handlePostToSlack = () => {
    alert('Post to Slack - functionality would integrate with Slack API');
  };

  const handleClearForm = () => {
    if (confirm('Are you sure you want to clear the form?')) {
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
        ctaText: '',
        ctaLink: '',
        videoUrl: '',
        location: '',
      });
    }
  };

  const handleUploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setBannerImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleChooseFromGallery = () => {
    setGalleryOpen(true);
  };

  const handleSelectImage = (imageUrl) => {
    setBannerImage(imageUrl);
  };

  return (
    <div className="create-comm-tab">
      <Form onSubmit={handleSubmit}>
        <Stack gap={6}>
          {/* Banner Image Section */}
          <div className="form-section">
            <h3 className="section-title">Banner/Hero Image (Optional)</h3>
            <ButtonSet>
              <Button kind="secondary" renderIcon={FolderOpen} onClick={handleUploadImage}>
                Upload Image
              </Button>
              <Button kind="secondary" onClick={handleChooseFromGallery}>
                Choose from Gallery
              </Button>
            </ButtonSet>
            {bannerImage && (
              <div style={{ marginTop: '16px' }}>
                <img
                  src={bannerImage}
                  alt="Selected banner"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0'
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
                <SelectItem value="12px" text="12px - Small" />
                <SelectItem value="14px" text="14px - Regular" />
                <SelectItem value="16px" text="16px - Medium" />
                <SelectItem value="18px" text="18px - Large" />
                <SelectItem value="20px" text="20px - Extra Large" />
              </Select>
            </Column>
          </Grid>

          {/* Color Palette Section */}
          <div className="form-section color-palette">
            <h3 className="section-title">Color Palette</h3>
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
          <TextArea
            id="body"
            name="body"
            labelText="Message Body"
            placeholder="Enter your main message content"
            value={formData.body}
            onChange={handleInputChange}
            rows={8}
            required
          />

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

          {/* Location */}
          <TextInput
            id="location"
            name="location"
            labelText="Location (Optional)"
            placeholder="Meeting location or URL"
            value={formData.location}
            onChange={handleInputChange}
          />

          {/* Action Buttons */}
          <div className="action-buttons">
            <ButtonSet>
              <Button kind="secondary" renderIcon={Save} onClick={handleSaveDraft}>
                Save as Draft
              </Button>
              <Button kind="secondary" renderIcon={FolderOpen} onClick={handleLoadDraft}>
                Load Draft
              </Button>
            </ButtonSet>

            <ButtonSet>
              <Button kind="tertiary" renderIcon={View} onClick={handlePreview}>
                Preview Email
              </Button>
            </ButtonSet>

            <ButtonSet>
              <Button kind="primary" renderIcon={Email} onClick={handleExportOutlook}>
                Export to Outlook (.eml)
              </Button>
              <Button kind="secondary" renderIcon={Document} onClick={handleExportHTML}>
                Export as HTML
              </Button>
              <Button kind="secondary" renderIcon={DocumentPdf} onClick={handleExportPDF}>
                Export as PDF
              </Button>
              <Button kind="secondary" renderIcon={Document} onClick={handleExportText}>
                Export as Plain Text
              </Button>
              <Button kind="secondary" renderIcon={Chat} onClick={handlePostToSlack}>
                Post to Slack
              </Button>
              <Button kind="danger--tertiary" renderIcon={Reset} onClick={handleClearForm}>
                Clear Form
              </Button>
            </ButtonSet>
          </div>
        </Stack>
      </Form>
      
      <ImageGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelectImage={handleSelectImage}
      />
    </div>
  );
};

export default CreateCommTab;

// Made with Bob
