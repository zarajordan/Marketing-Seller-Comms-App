# Event Management System Documentation

## Overview

The Event Management System is a comprehensive solution for IBM Marketing team members to create and manage events, and for sellers to browse, filter, and select events to include in their communications.

## System Architecture

The system consists of two main components:

### 1. **Manage Events Tab** (Marketing Team)
- Create, edit, and manage events
- Set event status (Active, Draft, Archived)
- Organize events by product areas
- Preview events before publishing

### 2. **Event Library Tab** (Sellers)
- Browse active events
- Filter by product areas, event types, and dates
- Search events by keywords
- Select multiple events
- Generate communications with selected events

## Getting Started

### For Marketing Team Members

#### Creating a New Event

1. Navigate to the **📅 Manage Events** tab
2. Click **Create New Event** button
3. Fill in the event details:
   - **Title**: Event name (required)
   - **Date**: Event date (required)
   - **Time**: Event time (optional)
   - **Location**: Physical address or "Virtual Event"
   - **Location Type**: In-Person, Virtual, or Hybrid
   - **Summary**: Brief description (required, max 200 chars)
   - **Full Description**: Detailed event information
   - **Registration Link**: URL for event registration
   - **Product Areas**: Select relevant IBM product categories
   - **Event Type**: Webinar, Workshop, Conference, etc.
   - **Target Audience**: Business, Technical, or Executive
   - **Featured**: Mark as featured event

4. Click **Create Event** to save as draft or **Create & Publish** to make it active

#### Managing Events

**Active Events**
- Visible to all sellers in the Event Library
- Can be edited or archived
- Featured events appear at the top

**Draft Events**
- Not visible to sellers
- Can be edited and published when ready
- Useful for planning future events

**Archived Events**
- Hidden from sellers
- Preserved for historical records
- Can be reactivated if needed

#### Editing Events

1. Find the event in the appropriate section
2. Click **Edit** button
3. Make your changes
4. Click **Update Event** to save

#### Event Preview

- Click **Preview** to see how the event will appear to sellers
- Review all details before publishing

### For Sellers

#### Browsing Events

1. Navigate to the **🎯 Event Library** tab
2. All active events are displayed as cards
3. Featured events are marked with a ⭐ badge
4. Upcoming events are marked with a green badge

#### Filtering Events

**Product Area Filter**
- Select one or more product areas (AI, Data, Cloud, etc.)
- Only events matching selected areas will be shown

**Event Type Filter**
- Filter by event format (Webinar, Workshop, Conference, etc.)

**Date Range Filter**
- **All Events**: Show all events
- **Upcoming**: Show only future events
- **Past**: Show only past events

**Search**
- Search by event title, description, or location
- Real-time filtering as you type

#### Selecting Events

1. Click on an event card to select it (or use the checkbox)
2. Selected events are highlighted with a blue border
3. Selection count is shown in the top-right corner
4. Use **Select all** checkbox to select all filtered events

#### Viewing Event Details

- Click **View full details** on any event card
- Modal shows complete event information
- Can select/deselect from the preview modal

#### Generating Communications

1. Select one or more events
2. Click **Generate Communication** button
3. System automatically switches to **Create Comm** tab
4. Event sections are pre-populated with selected events
5. Customize the communication as needed
6. Preview and send

## Product Areas

The system supports 8 IBM product areas:

- 🤖 **AI & Machine Learning**: watsonx.ai, AI solutions
- 📊 **Data & Analytics**: Data platforms, analytics tools
- ⚙️ **Automation**: RPA, process automation
- ☁️ **Cloud & Hybrid Cloud**: IBM Cloud, hybrid solutions
- 🔬 **Quantum Computing**: IBM Quantum services
- 🏗️ **Infrastructure & Systems**: Power Systems, mainframes
- 🔒 **Security**: Security solutions, threat protection
- 💼 **Business Applications**: SAP, enterprise apps

## Event Types

- **Webinar**: Online presentation or seminar
- **Workshop**: Hands-on training session
- **Conference**: Large-scale multi-track event
- **Seminar**: Educational session
- **Training**: Formal training course
- **Networking Event**: Networking opportunity
- **Product Launch**: New product announcement
- **Other**: Custom event type

## Target Audiences

- **Business**: Business decision-makers, executives
- **Technical**: Developers, architects, IT professionals
- **Executive**: C-level executives, senior leadership
- **Business & Technical**: Mixed audience

## Data Storage

All event data is stored in browser localStorage:

- **managed_events**: All events (active, draft, archived)
- **selected_events_for_comm**: Temporarily stores selected events for communication generation

## Tips and Best Practices

### For Marketing Team

1. **Use Clear Titles**: Make event titles descriptive and engaging
2. **Write Compelling Summaries**: The summary appears in event cards - make it count
3. **Select Relevant Product Areas**: Help sellers find events for their accounts
4. **Mark Featured Events**: Highlight your most important events
5. **Keep Events Updated**: Edit events if details change
6. **Archive Old Events**: Keep the library clean and relevant
7. **Use Draft Status**: Prepare events in advance without publishing

### For Sellers

1. **Use Filters Effectively**: Narrow down events by product area and type
2. **Check Event Dates**: Focus on upcoming events for timely communications
3. **Read Full Details**: Click "View full details" before selecting
4. **Select Multiple Events**: Create comprehensive communications with multiple events
5. **Customize Generated Content**: Always review and personalize the auto-generated content
6. **Save as Draft**: Save your work if you need to come back later

## Workflow Example

### Marketing Team Workflow

1. **Plan Event**: Decide on event details, speakers, agenda
2. **Create Draft**: Enter event information in Manage Events tab
3. **Review**: Use preview to check all details
4. **Publish**: Change status to Active when ready
5. **Monitor**: Check event engagement and registrations
6. **Archive**: Move to archived after event concludes

### Seller Workflow

1. **Identify Need**: Determine which events are relevant for your accounts
2. **Filter Events**: Use product area and type filters
3. **Review Options**: Read event details and summaries
4. **Select Events**: Choose 1-3 relevant events
5. **Generate Comm**: Click Generate Communication button
6. **Customize**: Personalize the message for your audience
7. **Preview**: Check the final output
8. **Send**: Export or copy to Outlook

## Troubleshooting

### Events Not Showing in Event Library

- Check that events are marked as "Active" (not Draft or Archived)
- Verify filters are not too restrictive
- Clear all filters and try again

### Selected Events Not Loading in Create Comm

- Ensure you clicked "Generate Communication" button
- Check browser console for errors
- Try refreshing the page

### Cannot Edit Event

- Verify you're in the Manage Events tab (not Event Library)
- Check that the event exists and hasn't been deleted

## Browser Compatibility

The system works best in modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Support

For technical issues or feature requests, contact the development team.

## Version History

- **v1.0** (April 2026): Initial release
  - Event creation and management
  - Event library with filtering
  - Multi-select and communication generation
  - 8 product areas and 8 event types

---

**Made with Bob** 🤖