import React from 'react';
import {
  Grid,
  Column,
  Tile,
  Button,
} from '@carbon/react';

const templates = [
  {
    id: 'announcement',
    icon: '📢',
    title: 'Company Announcement',
    description: 'Professional announcement for company news, updates, or important information',
    includes: 'Title, subtitle, body text, CTA button',
  },
  {
    id: 'newsletter',
    icon: '📰',
    title: 'Newsletter',
    description: 'Monthly or weekly newsletter with multiple sections for updates and highlights',
    includes: 'Banner, title, multiple sections, inline images',
  },
  {
    id: 'event',
    icon: '🎉',
    title: 'Event Invitation',
    description: 'Engaging invitation for events, webinars, conferences, or team gatherings',
    includes: 'Banner, date, location, RSVP button, event details',
  },
  {
    id: 'product',
    icon: '🚀',
    title: 'Product Launch',
    description: 'Exciting announcement for new products, features, or service launches',
    includes: 'Hero image, product highlights, features, CTA',
  },
  {
    id: 'team-update',
    icon: '👥',
    title: 'Team Update',
    description: 'Internal communication for team news, achievements, and updates',
    includes: 'Team highlights, achievements, upcoming events',
  },
  {
    id: 'quarterly-review',
    icon: '📊',
    title: 'Quarterly Review',
    description: 'Comprehensive quarterly business review and performance summary',
    includes: 'Metrics, achievements, goals, charts',
  },
];

const TemplatesTab = () => {
  const handleUseTemplate = (templateId) => {
    console.log('Using template:', templateId);
    // Template loading logic would go here
  };

  return (
    <div className="templates-tab">
      <div className="templates-header">
        <h2>📚 Template Library</h2>
        <p className="templates-description">
          Choose from pre-built templates to get started quickly. Click "Use Template" to load it into the editor.
        </p>
      </div>

      <Grid>
        {templates.map((template) => (
          <Column key={template.id} lg={8} md={4} sm={4}>
            <Tile className="template-card">
              <div className="template-icon">{template.icon}</div>
              <h3>{template.title}</h3>
              <p className="template-description">{template.description}</p>
              <div className="template-preview">
                <strong>Includes:</strong> {template.includes}
              </div>
              <Button
                kind="primary"
                size="sm"
                onClick={() => handleUseTemplate(template.id)}
              >
                Use Template
              </Button>
            </Tile>
          </Column>
        ))}
      </Grid>
    </div>
  );
};

export default TemplatesTab;

// Made with Bob
