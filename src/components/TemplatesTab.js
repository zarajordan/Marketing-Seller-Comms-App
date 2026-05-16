import React from 'react';
import {
  Grid,
  Column,
  Tile,
  Button,
} from '@carbon/react';
import { Checkmark } from '@carbon/icons-react';
import { toast } from 'react-toastify';

const templates = [
  {
    id: 'announcement',
    icon: '📢',
    title: 'Company Announcement',
    description: 'Professional announcement for company news, updates, or important information',
    includes: 'Title, subtitle, body text, CTA button',
    data: {
      monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      title: 'Important Company Announcement',
      subtitle: 'Updates and Information',
      fontFamily: 'IBM Plex Sans, sans-serif',
      fontSize: '16px',
      titleColor: '#161616',
      bodyColor: '#161616',
      subtitleColor: '#525252',
      ctaColor: '#0f62fe',
      body: 'We are excited to share important updates with you. This announcement contains key information about recent developments and upcoming changes.\n\nPlease review the details carefully and reach out if you have any questions.',
      ctaText: 'Learn More',
      ctaLink: 'https://example.com',
      videoUrl: '',
      location: '',
    },
  },
  {
    id: 'newsletter',
    icon: '📰',
    title: 'Newsletter',
    description: 'Monthly or weekly newsletter with multiple sections for updates and highlights',
    includes: 'Banner, title, multiple sections, inline images',
    data: {
      monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      title: 'Monthly Newsletter',
      subtitle: 'Your monthly digest of news and updates',
      fontFamily: 'IBM Plex Sans, sans-serif',
      fontSize: '16px',
      titleColor: '#161616',
      bodyColor: '#161616',
      subtitleColor: '#525252',
      ctaColor: '#0f62fe',
      body: '📰 Top Stories\n\nHighlight 1: Brief description of the first major update or news item.\n\nHighlight 2: Information about another important development.\n\nHighlight 3: Additional news or updates worth sharing.\n\n🎯 Upcoming Events\n\nStay tuned for exciting events and opportunities coming your way.',
      ctaText: 'Read Full Newsletter',
      ctaLink: 'https://example.com/newsletter',
      videoUrl: '',
      location: '',
    },
  },
  {
    id: 'event',
    icon: '🎉',
    title: 'Event Invitation',
    description: 'Engaging invitation for events, webinars, conferences, or team gatherings',
    includes: 'Banner, date, location, RSVP button, event details',
    data: {
      monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      title: 'You\'re Invited!',
      subtitle: 'Join us for an exciting event',
      fontFamily: 'IBM Plex Sans, sans-serif',
      fontSize: '16px',
      titleColor: '#161616',
      bodyColor: '#161616',
      subtitleColor: '#525252',
      ctaColor: '#0f62fe',
      body: '📅 Date: [Event Date]\n⏰ Time: [Event Time]\n📍 Location: [Event Location]\n\nWe are thrilled to invite you to our upcoming event. Join us for an engaging experience filled with networking, learning, and collaboration.\n\nAgenda:\n• Welcome and introductions\n• Keynote presentation\n• Interactive sessions\n• Networking reception\n\nDon\'t miss this opportunity to connect with colleagues and industry leaders!',
      ctaText: 'RSVP Now',
      ctaLink: 'https://example.com/rsvp',
      videoUrl: '',
      location: '[Event Location]',
    },
  },
  {
    id: 'product',
    icon: '🚀',
    title: 'Product Launch',
    description: 'Exciting announcement for new products, features, or service launches',
    includes: 'Hero image, product highlights, features, CTA',
    data: {
      monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      title: 'Introducing Our Latest Innovation',
      subtitle: 'The future is here',
      fontFamily: 'IBM Plex Sans, sans-serif',
      fontSize: '16px',
      titleColor: '#161616',
      bodyColor: '#161616',
      subtitleColor: '#525252',
      ctaColor: '#0f62fe',
      body: '🚀 We\'re excited to announce the launch of our newest product!\n\nKey Features:\n✓ Feature 1: Enhanced performance and reliability\n✓ Feature 2: Intuitive user interface\n✓ Feature 3: Advanced security features\n✓ Feature 4: Seamless integration capabilities\n\nThis innovative solution is designed to transform the way you work and deliver exceptional results.\n\nBe among the first to experience the future of [product category].',
      ctaText: 'Get Started',
      ctaLink: 'https://example.com/product',
      videoUrl: '',
      location: '',
    },
  },
  {
    id: 'team-update',
    icon: '👥',
    title: 'Team Update',
    description: 'Internal communication for team news, achievements, and updates',
    includes: 'Team highlights, achievements, upcoming events',
    data: {
      monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      title: 'Team Update',
      subtitle: 'Celebrating our achievements together',
      fontFamily: 'IBM Plex Sans, sans-serif',
      fontSize: '16px',
      titleColor: '#161616',
      bodyColor: '#161616',
      subtitleColor: '#525252',
      ctaColor: '#0f62fe',
      body: '👥 Team Highlights\n\n🎉 Achievements:\n• Successfully completed [project name]\n• Reached [milestone]\n• Welcomed new team members\n\n📊 Key Metrics:\n• [Metric 1]: [Value]\n• [Metric 2]: [Value]\n\n🎯 Looking Ahead:\n• Upcoming projects and initiatives\n• Team events and activities\n• Professional development opportunities\n\nThank you for your continued dedication and hard work!',
      ctaText: 'View Full Update',
      ctaLink: 'https://example.com/team',
      videoUrl: '',
      location: '',
    },
  },
  {
    id: 'quarterly-review',
    icon: '📊',
    title: 'Quarterly Review',
    description: 'Comprehensive quarterly business review and performance summary',
    includes: 'Metrics, achievements, goals, charts',
    data: {
      monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      title: 'Q[X] Business Review',
      subtitle: 'Performance summary and insights',
      fontFamily: 'IBM Plex Sans, sans-serif',
      fontSize: '16px',
      titleColor: '#161616',
      bodyColor: '#161616',
      subtitleColor: '#525252',
      ctaColor: '#0f62fe',
      body: '📊 Quarterly Performance Overview\n\n✅ Key Achievements:\n• Achievement 1: [Description]\n• Achievement 2: [Description]\n• Achievement 3: [Description]\n\n📈 Performance Metrics:\n• Revenue: [Value] ([% change])\n• Customer Growth: [Value] ([% change])\n• Market Share: [Value] ([% change])\n\n🎯 Strategic Priorities:\n• Priority 1: [Description]\n• Priority 2: [Description]\n• Priority 3: [Description]\n\n💡 Looking Forward:\nOur focus for the next quarter includes [key initiatives and goals].',
      ctaText: 'View Full Report',
      ctaLink: 'https://example.com/quarterly-review',
      videoUrl: '',
      location: '',
    },
  },
  {
    id: 'weekly-event-summary',
    icon: '📅',
    title: 'Weekly Event Summary',
    description: 'Structured weekly summary with Studio Workshops, IBM Events, and Third Party Events',
    includes: 'Multiple event sections, dates, locations, registration links, contact details',
    data: {
      monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      title: 'Weekly Event Summary',
      subtitle: 'Your guide to upcoming events and opportunities',
      fontFamily: 'IBM Plex Sans, sans-serif',
      fontSize: '16px',
      titleColor: '#161616',
      bodyColor: '#161616',
      subtitleColor: '#525252',
      ctaColor: '#0f62fe',
      body: '🏢 Studio Workshops\n\nAccelerating Business Transformation\n🗓️ 23rd April 2026\n📍 Innovation Studio\n🔗 Seismic Page | External Registration\n👤 Chantelle Omotosho / Zara Jordan\n\nDiscover how organisations across industries are using IBM Business Automation to optimise processes, boost productivity, and unlock new value.\n\nBobathon\n🗓️ 13th May 2026\n📍 Innovation Studio\n🔗 Seismic Page | External Registration\n👤 Zara Jordan\n\nInvite your clients to this practical introduction to IBM Bob, where we will show how Bob can be applied within their business—without requiring deep technical expertise. This workshop is designed for line of business and operational leaders who want a clear, practical introduction to Bob—focused on real outcomes rather than technical complexity.\n\n🎯 IBM Events\n\n[Add IBM hosted events here]\n\n🌐 Third Party Events\n\nIntelligence Squared: The Age of Growth\n🗓️ Multiple, April-September 2026\n\nEvent 1 - The Age of Growth (Client Transformation) - 16 April 2026\nEvent 2 - The Age of Intelligence (Cybersecurity) - 13 May 2026\nEvent 3 - The Age of Change (Client Zero) - 24 September 2026\nEvent 4 - The Age of Becoming (Quantum) - 18 November 2026\n\n📍 City of London\n🔗 Seismic Page\n\nOur collaboration with Intelligence Squared brings together IBM\'s leadership in AI and innovation with one of the world\'s leading forums for debate and ideas.\n\nGartner Data & Analytics Summit\n🗓️ 11th-13th May 2026\n📍 City of London\n🔗 Seismic Page | Event Website\n\nInvite your clients to join the premier conference for CDAOs, heads of AI, and data and analytics leaders to uncover the latest in data management, AI trends, and governance.',
      ctaText: 'View All Events',
      ctaLink: 'https://example.com/events',
      videoUrl: '',
      location: '',
    },
  },
];

const TemplatesTab = ({ onUseTemplate }) => {
  const handleUseTemplate = (template) => {
    if (onUseTemplate) {
      onUseTemplate(template.data);
      toast.success(`✅ "${template.title}" template loaded successfully!`, {
        icon: <Checkmark size={24} />,
        autoClose: 2000,
      });
    }
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
                onClick={() => handleUseTemplate(template)}
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
