import React, { useState, useEffect } from 'react';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Button,
  ButtonSet,
  Accordion,
  AccordionItem,
  Tag,
} from '@carbon/react';
import { TrashCan, Edit, Share, Checkmark, Events } from '@carbon/icons-react';
import { toast } from 'react-toastify';

const DraftsTab = ({ onEditDraft }) => {
  const [drafts, setDrafts] = useState([]);
  const [groupedDrafts, setGroupedDrafts] = useState({});

  useEffect(() => {
    loadDrafts();
    
    // Listen for storage changes (when drafts are saved/updated)
    const handleStorageChange = (e) => {
      if (e.key === 'comms_drafts') {
        loadDrafts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-window updates
    const handleDraftsUpdate = () => {
      loadDrafts();
    };
    
    window.addEventListener('draftsUpdated', handleDraftsUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('draftsUpdated', handleDraftsUpdate);
    };
  }, []);

  const loadDrafts = () => {
    const savedDrafts = JSON.parse(localStorage.getItem('comms_drafts') || '[]');
    setDrafts(savedDrafts);
    groupDraftsByMonth(savedDrafts);
  };

  const groupDraftsByMonth = (draftsArray) => {
    const grouped = {};
    
    draftsArray.forEach(draft => {
      const date = new Date(draft.date || draft.savedAt);
      const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(draft);
    });

    // Sort each month's drafts by date (newest first)
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => {
        const dateA = new Date(a.date || a.savedAt);
        const dateB = new Date(b.date || b.savedAt);
        return dateB - dateA;
      });
    });

    // Sort months (newest first)
    const sortedGrouped = {};
    Object.keys(grouped)
      .sort((a, b) => {
        const dateA = new Date(grouped[a][0].date || grouped[a][0].savedAt);
        const dateB = new Date(grouped[b][0].date || grouped[b][0].savedAt);
        return dateB - dateA;
      })
      .forEach(key => {
        sortedGrouped[key] = grouped[key];
      });

    setGroupedDrafts(sortedGrouped);
  };

  const handleDelete = (draftId) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      const updatedDrafts = drafts.filter(d => d.id !== draftId);
      localStorage.setItem('comms_drafts', JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      toast.success('🗑️ Draft deleted successfully!', {
        icon: <Checkmark size={24} />,
        autoClose: 3000,
      });
    }
  };

  const handleEdit = (draft) => {
    if (onEditDraft) {
      onEditDraft(draft.data, draft.id);
      toast.info(`📝 Loading "${draft.name}" for editing...`, { autoClose: 2000 });
    }
  };

  const handleShare = (draft) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${encodeURIComponent(JSON.stringify(draft.data))}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('🔗 Share link copied to clipboard!', {
      icon: <Checkmark size={24} />,
      autoClose: 3000,
    });
  };

  const handleSaveToEventLibrary = (draft) => {
    const eventName = prompt('Enter a name for this event:', draft.name);
    if (eventName) {
      const events = JSON.parse(localStorage.getItem('event_library') || '[]');
      const newEvent = {
        id: Date.now(),
        name: eventName,
        date: new Date().toISOString(),
        data: draft.data
      };
      events.push(newEvent);
      localStorage.setItem('event_library', JSON.stringify(events));
      toast.success(`📅 "${eventName}" added to Event Library!`, {
        icon: <Events size={24} />,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="drafts-tab">
      <div className="drafts-header" style={{ marginBottom: '24px' }}>
        <h2>My Drafts</h2>
        <p style={{ color: '#525252', marginTop: '8px' }}>
          Manage your saved communication drafts - organized by month
        </p>
        {drafts.length > 0 && (
          <Tag type="blue" size="sm" style={{ marginTop: '12px' }}>
            {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'} total
          </Tag>
        )}
      </div>

      {drafts.length === 0 ? (
        <div className="empty-state" style={{
          textAlign: 'center',
          padding: '48px',
          background: '#f4f4f4',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '16px', color: '#525252' }}>
            No drafts saved yet. Create a communication and save it as a draft.
          </p>
        </div>
      ) : (
        <Accordion>
          {Object.keys(groupedDrafts).map((monthYear) => {
            const monthDrafts = groupedDrafts[monthYear];
            return (
              <AccordionItem
                key={monthYear}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '600' }}>{monthYear}</span>
                    <Tag type="gray" size="sm">
                      {monthDrafts.length} {monthDrafts.length === 1 ? 'draft' : 'drafts'}
                    </Tag>
                  </div>
                }
                open={Object.keys(groupedDrafts).indexOf(monthYear) === 0}
              >
                <StructuredListWrapper>
                  <StructuredListHead>
                    <StructuredListRow head>
                      <StructuredListCell head>Title</StructuredListCell>
                      <StructuredListCell head>Date</StructuredListCell>
                      <StructuredListCell head>Preview</StructuredListCell>
                      <StructuredListCell head>Actions</StructuredListCell>
                    </StructuredListRow>
                  </StructuredListHead>
                  <StructuredListBody>
                    {monthDrafts.map((draft) => (
                      <StructuredListRow key={draft.id}>
                        <StructuredListCell>
                          {draft.name || draft.title || 'Untitled'}
                        </StructuredListCell>
                        <StructuredListCell>
                          {new Date(draft.date || draft.savedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </StructuredListCell>
                        <StructuredListCell>
                          <div style={{
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {draft.data?.title || draft.title || 'Untitled'}
                          </div>
                        </StructuredListCell>
                        <StructuredListCell>
                          <ButtonSet>
                            <Button
                              kind="ghost"
                              size="sm"
                              renderIcon={Edit}
                              iconDescription="Edit"
                              hasIconOnly
                              onClick={() => handleEdit(draft)}
                            />
                            <Button
                              kind="ghost"
                              size="sm"
                              renderIcon={Events}
                              iconDescription="Save to Event Library"
                              hasIconOnly
                              onClick={() => handleSaveToEventLibrary(draft)}
                            />
                            <Button
                              kind="ghost"
                              size="sm"
                              renderIcon={Share}
                              iconDescription="Share"
                              hasIconOnly
                              onClick={() => handleShare(draft)}
                            />
                            <Button
                              kind="danger--ghost"
                              size="sm"
                              renderIcon={TrashCan}
                              iconDescription="Delete"
                              hasIconOnly
                              onClick={() => handleDelete(draft.id)}
                            />
                          </ButtonSet>
                        </StructuredListCell>
                      </StructuredListRow>
                    ))}
                  </StructuredListBody>
                </StructuredListWrapper>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default DraftsTab;

// Made with Bob
