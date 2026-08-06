import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Column,
  FilterableMultiSelect,
  Grid,
  Loading,
  Modal,
  Search,
  Select,
  SelectItem,
  Tag,
  Tile,
} from '@carbon/react';
import {
  Calendar,
  Location,
  Time,
  Document,
  UserFollow,
  Filter,
  Close,
  Renew,
} from '@carbon/icons-react';
import { toast } from 'react-toastify';
import { listEvents, updateEvent } from '../lib/supabaseData';

const PRODUCT_AREAS = [
  { id: 'hybrid-cloud', label: '☁️ Hybrid Cloud & Infrastructure Management' },
  { id: 'data-ai', label: '🤖 Data & AI' },
  { id: 'automation', label: '⚙️ Business Automation' },
  { id: 'security', label: '🔒 Security' },
  { id: 'transaction', label: '💳 Transaction Processing' },
  { id: 'quantum', label: '🔬 Quantum' },
];

const INDUSTRIES = [
  { id: 'Cross-Industry', label: 'Cross-Industry' },
  { id: 'Defence', label: 'Defence' },
  { id: 'Financial Services', label: 'Financial Services' },
  { id: 'Healthcare', label: 'Healthcare' },
  { id: 'Manufacturing', label: 'Manufacturing' },
  { id: 'Public Sector', label: 'Public Sector' },
  { id: 'Retail', label: 'Retail' },
  { id: 'Telecommunications', label: 'Telecoms' },
];

const highlight = (text, term) => {
  if (!term || !text) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === term.toLowerCase()
      ? <mark key={i} style={{ background: '#f1c21b', color: '#161616', padding: '0 1px', borderRadius: '2px' }}>{part}</mark>
      : part
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'Date TBD';
  const date = new Date(dateString);
  return isNaN(date) ? dateString : date.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
};

export default function ArchiveTab() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductAreas, setSelectedProductAreas] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [previewEvent, setPreviewEvent] = useState(null);
  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    loadArchive();
    const handleUpdate = () => loadArchive();
    window.addEventListener('eventsUpdated', handleUpdate);
    return () => window.removeEventListener('eventsUpdated', handleUpdate);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchTerm, selectedProductAreas, selectedRegions, selectedIndustries]);

  const loadArchive = async () => {
    setLoading(true);
    try {
      const data = await listEvents();
      const archived = data.filter(e => e.status === 'Archived');
      setEvents(archived);
    } catch {
      toast.error('Failed to load archive');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.title?.toLowerCase().includes(term) ||
        e.briefSummary?.toLowerCase().includes(term) ||
        e.locationDetails?.toLowerCase().includes(term)
      );
    }

    if (selectedProductAreas.length > 0) {
      filtered = filtered.filter(e => e.productAreas?.some(a => selectedProductAreas.includes(a)));
    }
    if (selectedRegions.length > 0) {
      filtered = filtered.filter(e => e.regions?.some(r => selectedRegions.includes(r)));
    }
    if (selectedIndustries.length > 0) {
      filtered = filtered.filter(e => selectedIndustries.includes(e.industry));
    }

    filtered.sort((a, b) => new Date(b.startDate || b.date) - new Date(a.startDate || a.date));
    setFilteredEvents(filtered);
  };

  // Group by year (most recent first)
  const groupByYear = (evs) => {
    const groups = {};
    evs.forEach(e => {
      const d = e.startDate || e.date;
      const year = d ? new Date(d).getFullYear().toString() : 'Unknown';
      if (!groups[year]) groups[year] = [];
      groups[year].push(e);
    });
    return groups;
  };

  useEffect(() => {
    const groups = groupByYear(filteredEvents);
    const allExpanded = {};
    Object.keys(groups).forEach(y => { allExpanded[y] = true; });
    setExpandedMonths(allExpanded);
  }, [filteredEvents]);

  const eventsByYear = groupByYear(filteredEvents);

  const handleRestore = async (event) => {
    try {
      await updateEvent({ ...event, status: 'Active' });
      toast.success(`"${event.title}" restored to Event Library`);
      window.dispatchEvent(new Event('eventsUpdated'));
      await loadArchive();
    } catch (err) {
      toast.error(err.message || 'Failed to restore event');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedProductAreas([]);
    setSelectedRegions([]);
    setSelectedIndustries([]);
  };

  return (
    <div className="archive-tab" style={{ padding: '0' }}>

      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ marginBottom: '8px' }}>🗄️ Event Archive</h2>
            <p style={{ color: '#525252', fontSize: '14px' }}>
              Past events are automatically archived here once their date has passed.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Tag type="cool-gray" size="md">{events.length} archived event{events.length !== 1 ? 's' : ''}</Tag>
            <Button kind="ghost" size="sm" renderIcon={Filter} onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div style={{ padding: '16px', backgroundColor: '#f4f4f4', borderRadius: '4px', marginTop: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '2', minWidth: '250px' }}>
                <Search
                  labelText="Search archive"
                  placeholder="Search by title, description, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm('')}
                  size="lg"
                />
              </div>
              <div style={{ flex: '1.5', minWidth: '200px' }}>
                <FilterableMultiSelect
                  id="archive-product-filter"
                  titleText="Product Areas"
                  placeholder="Filter by product area"
                  items={PRODUCT_AREAS}
                  itemToString={(item) => item ? item.label : ''}
                  onChange={({ selectedItems }) => setSelectedProductAreas(selectedItems.map(i => i.id))}
                  size="lg"
                />
              </div>
              <div style={{ flex: '1.5', minWidth: '180px' }}>
                <FilterableMultiSelect
                  id="archive-region-filter"
                  titleText="Region"
                  placeholder="Filter by region"
                  items={['North', 'South', 'Midlands (Birmingham)', 'Ireland', 'Scotland', 'Wales', 'Europe', 'London', 'Virtual'].map(r => ({ id: r, label: r }))}
                  itemToString={(item) => item ? item.label : ''}
                  onChange={({ selectedItems }) => setSelectedRegions(selectedItems.map(i => i.id))}
                  size="lg"
                />
              </div>
              <div style={{ flex: '1.5', minWidth: '180px' }}>
                <FilterableMultiSelect
                  id="archive-industry-filter"
                  titleText="Industry"
                  placeholder="Filter by industry"
                  items={INDUSTRIES}
                  itemToString={(item) => item ? item.label : ''}
                  onChange={({ selectedItems }) => setSelectedIndustries(selectedItems.map(i => i.id))}
                  size="lg"
                />
              </div>
            </div>
            {(searchTerm || selectedProductAreas.length > 0 || selectedRegions.length > 0 || selectedIndustries.length > 0) && (
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button kind="ghost" size="sm" renderIcon={Close} onClick={handleClearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Loading description="Loading archive…" withOverlay={false} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🗄️</div>
            <h3 style={{ marginBottom: '8px' }}>
              {events.length === 0 ? 'No Archived Events Yet' : 'No Events Match Your Filters'}
            </h3>
            <p style={{ color: '#525252' }}>
              {events.length === 0
                ? 'Events are automatically moved here once their date has passed.'
                : 'Try adjusting your filters to find archived events.'}
            </p>
            {events.length > 0 && (
              <Button kind="tertiary" style={{ marginTop: '16px' }} onClick={handleClearFilters}>Clear all filters</Button>
            )}
          </div>
        ) : (
          Object.entries(eventsByYear)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, yearEvents]) => (
              <div key={year} style={{ marginBottom: '32px' }}>
                {/* Year header */}
                <div
                  onClick={() => setExpandedMonths(prev => ({ ...prev, [year]: !prev[year] }))}
                  style={{ backgroundColor: '#393939', color: 'white', padding: '12px 20px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', userSelect: 'none' }}
                >
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                    🗄️ {year} ({yearEvents.length} event{yearEvents.length !== 1 ? 's' : ''})
                  </h3>
                  <span style={{ fontSize: '20px' }}>{expandedMonths[year] ? '▼' : '▶'}</span>
                </div>

                {expandedMonths[year] && (
                  <Grid>
                    {yearEvents.map(event => (
                      <Column key={event.id} lg={8} md={8} sm={4}>
                        <Tile style={{ padding: '20px', marginBottom: '16px', border: '1px solid #e0e0e0', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', opacity: 0.9 }}>

                          {/* Title */}
                          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#393939' }}>
                              {highlight(event.title, searchTerm)}
                            </h4>
                            <Tag type="cool-gray" size="sm">Archived</Tag>
                          </div>

                          {/* Summary */}
                          <div
                            className="event-summary-preview"
                            style={{ color: '#6f6f6f', fontSize: '13px', lineHeight: '1.5', marginBottom: '12px' }}
                            dangerouslySetInnerHTML={{ __html: event.briefSummary || event.description || '<p>No description provided</p>' }}
                          />

                          {/* Date / Location */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px', fontSize: '13px', color: '#6f6f6f' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={16} />
                              <span>
                                {formatDate(event.startDate || event.date)}
                                {event.endDate ? ` – ${formatDate(event.endDate)}` : ''}
                              </span>
                            </div>
                            {event.eventTime && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Time size={16} />
                                <span>{event.eventTime}</span>
                              </div>
                            )}
                            {(event.locationDetails || event.location) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Location size={16} />
                                <span>{(event.locationDetails || event.location).replace(/\s*\(Virtual\)\s*/gi, '').trim()}</span>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            {event.eventType && <Tag type="gray" size="sm">{event.eventType}</Tag>}
                            {event.industry && event.industry !== 'Cross-Industry' && <Tag type="gray" size="sm">{event.industry}</Tag>}
                          </div>

                          {/* Actions */}
                          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '8px' }}>
                            <Button kind="ghost" size="sm" onClick={() => setPreviewEvent(event)}>
                              View details
                            </Button>
                            <Button kind="ghost" size="sm" renderIcon={Renew} onClick={() => handleRestore(event)}>
                              Restore to Library
                            </Button>
                          </div>
                        </Tile>
                      </Column>
                    ))}
                  </Grid>
                )}
              </div>
            ))
        )}
      </div>

      {/* Detail Modal */}
      {previewEvent && (
        <Modal
          open={!!previewEvent}
          onRequestClose={() => setPreviewEvent(null)}
          modalHeading={previewEvent.title}
          primaryButtonText="Restore to Library"
          secondaryButtonText="Close"
          onRequestSubmit={() => { handleRestore(previewEvent); setPreviewEvent(null); }}
          size="lg"
        >
          <div style={{ padding: '8px 0' }}>

            <div style={{ marginBottom: '16px' }}>
              <Tag type="cool-gray" size="md">Archived</Tag>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: '24px' }}>
              <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Summary</h5>
              <div className="event-summary-preview" style={{ color: '#525252', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: previewEvent.briefSummary || previewEvent.description || '<p>No summary provided</p>' }} />
            </div>

            {/* Event Details */}
            <div style={{ marginBottom: '24px' }}>
              <h5 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>Event Details</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} />
                  <span><strong>Date:</strong> {formatDate(previewEvent.startDate || previewEvent.date)}{previewEvent.endDate ? ` – ${formatDate(previewEvent.endDate)}` : ''}</span>
                </div>
                {previewEvent.eventTime && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Time size={16} /><span><strong>Time:</strong> {previewEvent.eventTime}</span>
                  </div>
                )}
                {(previewEvent.locationDetails || previewEvent.location) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Location size={16} /><span><strong>Location:</strong> {(previewEvent.locationDetails || previewEvent.location).replace(/\s*\(Virtual\)\s*/gi, '').trim()}</span>
                  </div>
                )}
                {previewEvent.eventType && <div><strong>Type:</strong> {previewEvent.eventType}</div>}
                {previewEvent.targetAudience && <div><strong>Target Audience:</strong> {previewEvent.targetAudience}</div>}
                {previewEvent.industry && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><strong>Industry:</strong> <Tag type="gray" size="sm">{previewEvent.industry}</Tag></div>}
                {previewEvent.regions && previewEvent.regions.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong>Regions:</strong>
                    {previewEvent.regions.map(r => <Tag key={r} type="teal" size="sm">{r}</Tag>)}
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Description */}
            {previewEvent.detailedDescription && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Detailed Description</h5>
                <div className="event-summary-preview" style={{ color: '#525252', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: previewEvent.detailedDescription }} />
              </div>
            )}

            {/* Speakers */}
            {previewEvent.speakers && previewEvent.speakers.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserFollow size={16} /> Speakers
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {previewEvent.speakers.map((speaker, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f4f4f4', borderRadius: '4px', minWidth: '200px' }}>
                      {speaker.imageUrl
                        ? <img src={speaker.imageUrl} alt={speaker.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6929c4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: 600, flexShrink: 0 }}>{speaker.name?.charAt(0) || '?'}</div>
                      }
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{speaker.name}</div>
                        {speaker.role && <div style={{ fontSize: '12px', color: '#525252' }}>{speaker.role}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post Event Follow-up */}
            {previewEvent.postEventFollowUp && (
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Post Event Follow-up</h5>
                <div className="event-summary-preview"
                  style={{ padding: '12px', backgroundColor: '#e8f4ff', borderRadius: '4px', fontSize: '13px', lineHeight: '1.6', borderLeft: '4px solid #0f62fe' }}
                  dangerouslySetInnerHTML={{ __html: previewEvent.postEventFollowUp }} />
              </div>
            )}

            {/* Promote Our Presence */}
            {(previewEvent.promoteOurPresence || previewEvent.promoteDocuments?.length > 0) && (
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f6f2ff', borderRadius: '4px', borderLeft: '4px solid #6929c4' }}>
                <h5 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#6929c4' }}>📣 Promote Our Presence</h5>
                {previewEvent.promoteOurPresence && (
                  <div className="event-summary-preview" style={{ color: '#161616', fontSize: '13px', lineHeight: '1.6', marginBottom: previewEvent.promoteDocuments?.length > 0 ? '12px' : 0 }}
                    dangerouslySetInnerHTML={{ __html: previewEvent.promoteOurPresence }} />
                )}
                {previewEvent.promoteDocuments?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {previewEvent.promoteDocuments.map((doc, i) => (
                      <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#6929c4', color: '#fff', borderRadius: '4px', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}>
                        <Document size={14} /> {doc.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Registration links */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {previewEvent.registrationLink && (
                <a href={previewEvent.registrationLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', backgroundColor: '#0f62fe', color: '#fff', padding: '10px 16px', textDecoration: 'none', borderRadius: '4px', fontWeight: 500 }}>
                  Registration Link →
                </a>
              )}
              {previewEvent.seismicLink && (
                <a href={previewEvent.seismicLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', backgroundColor: '#393939', color: '#fff', padding: '10px 16px', textDecoration: 'none', borderRadius: '4px', fontWeight: 500 }}>
                  View on Seismic →
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
