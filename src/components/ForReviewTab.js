import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonSet,
  Modal,
  Tag,
  Tile,
} from '@carbon/react';
import { Checkmark, TrashCan, View } from '@carbon/icons-react';
import { toast } from 'react-toastify';
import { deleteEvent, listEvents, updateEvent } from '../lib/supabaseData';

const ForReviewTab = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState(null);
  const [rejectConfirmId, setRejectConfirmId] = useState(null);

  useEffect(() => {
    loadDrafts();
    const handleUpdate = () => loadDrafts();
    window.addEventListener('eventsUpdated', handleUpdate);
    return () => window.removeEventListener('eventsUpdated', handleUpdate);
  }, []);

  const loadDrafts = async () => {
    try {
      const data = await listEvents();
      setEvents(data.filter((e) => e.status === 'Draft'));
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const notifyUpdate = () => window.dispatchEvent(new Event('eventsUpdated'));

  const handleApprove = async (event) => {
    try {
      await updateEvent({ ...event, status: 'Active' });
      toast.success(`"${event.title}" approved and published to the Event Library`, {
        icon: <Checkmark size={24} />,
        autoClose: 3000,
      });
      await loadDrafts();
      notifyUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to approve event');
    }
  };

  const handleReject = async (eventId) => {
    try {
      await deleteEvent(eventId);
      toast.success('Submission rejected and removed', { autoClose: 3000 });
      setRejectConfirmId(null);
      await loadDrafts();
      notifyUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to reject event');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#525252' }}>Loading submissions…</div>
    );
  }

  return (
    <div className="for-review-tab">
      <div style={{ marginBottom: '24px' }}>
        <h2>🔍 For Review</h2>
        <p style={{ color: '#525252', marginTop: '8px' }}>
          Events submitted by the marketing team. Approve to publish to the Event Library, or reject to remove the submission.
        </p>
      </div>

      {events.length === 0 ? (
        <Tile style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ marginBottom: '8px' }}>Nothing to review</h3>
          <p style={{ color: '#525252' }}>All submissions have been processed.</p>
        </Tile>
      ) : (
        <div>
          <p style={{ fontSize: '13px', color: '#525252', marginBottom: '20px' }}>
            {events.length} submission{events.length !== 1 ? 's' : ''} awaiting review
          </p>

          {events.map((event) => (
            <div
              key={event.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                background: '#fff',
                marginBottom: '16px',
                overflow: 'hidden',
              }}
            >
              {/* Card header */}
              <div style={{
                background: '#f4f4f4',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e0e0e0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#161616' }}>{event.title}</span>
                  <Tag type="gray" size="sm">Draft</Tag>
                  {event.eventType && <Tag type="blue" size="sm">{event.eventType}</Tag>}
                  {event.industry && <Tag type="green" size="sm">{event.industry}</Tag>}
                </div>
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={View}
                  iconDescription="Preview"
                  hasIconOnly
                  onClick={() => { setPreviewEvent(event); setPreviewOpen(true); }}
                />
              </div>

              {/* Card body */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#6f6f6f', marginBottom: '2px', textTransform: 'uppercase' }}>Date</p>
                    <p style={{ fontSize: '14px', color: '#161616' }}>
                      {event.startDate ? new Date(event.startDate).toLocaleDateString('en-GB') : 'TBD'}
                      {event.endDate ? ` – ${new Date(event.endDate).toLocaleDateString('en-GB')}` : ''}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#6f6f6f', marginBottom: '2px', textTransform: 'uppercase' }}>Location</p>
                    <p style={{ fontSize: '14px', color: '#161616' }}>
                      {(event.locationDetails || '—').replace(/\s*\(Virtual\)\s*/gi, '')}{event.locationType === 'Virtual' ? ' (Virtual)' : ''}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#6f6f6f', marginBottom: '2px', textTransform: 'uppercase' }}>Submitted by</p>
                    <p style={{ fontSize: '14px', color: '#161616' }}>{event.ownerEmail || '—'}</p>
                  </div>
                </div>

                {(event.briefSummary || event.description) && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#6f6f6f', marginBottom: '4px', textTransform: 'uppercase' }}>Summary</p>
                    <div
                      style={{ fontSize: '14px', color: '#525252', lineHeight: '1.5' }}
                      dangerouslySetInnerHTML={{ __html: event.briefSummary || event.description }}
                    />
                  </div>
                )}

                {event.registrationLink && (
                  <p style={{ fontSize: '13px', color: '#525252', marginBottom: '16px' }}>
                    <strong>Registration:</strong>{' '}
                    <a href={event.registrationLink} target="_blank" rel="noreferrer" style={{ color: '#0f62fe' }}>
                      {event.registrationLink}
                    </a>
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
                  <Button
                    kind="primary"
                    renderIcon={Checkmark}
                    onClick={() => handleApprove(event)}
                  >
                    Approve &amp; Publish
                  </Button>
                  <Button
                    kind="danger--ghost"
                    renderIcon={TrashCan}
                    onClick={() => setRejectConfirmId(event.id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        open={previewOpen}
        onRequestClose={() => setPreviewOpen(false)}
        modalHeading="Event Preview"
        passiveModal
        preventCloseOnClickOutside={false}
        size="sm"
      >
        {previewEvent && (
          <div style={{ padding: '16px 0' }}>
            <p><strong>Title:</strong> {previewEvent.title}</p>
            <p><strong>Date:</strong> {previewEvent.startDate ? new Date(previewEvent.startDate).toLocaleDateString('en-GB') : 'TBD'}</p>
            <p><strong>Location:</strong> {(previewEvent.locationDetails || '').replace(/\s*\(Virtual\)\s*/gi, '')}{previewEvent.locationType === 'Virtual' ? ' (Virtual)' : ''}</p>
            <p><strong>Industry:</strong> {previewEvent.industry || '—'}</p>
            <p><strong>Event Type:</strong> {previewEvent.eventType || '—'}</p>
            <p><strong>Target Audience:</strong> {previewEvent.targetAudience || '—'}</p>
            {previewEvent.registrationLink && (
              <p><strong>Registration:</strong>{' '}
                <a href={previewEvent.registrationLink} target="_blank" rel="noreferrer">{previewEvent.registrationLink}</a>
              </p>
            )}
            <p style={{ marginTop: '12px' }}><strong>Summary:</strong></p>
            <div
              style={{ color: '#525252' }}
              dangerouslySetInnerHTML={{ __html: previewEvent.briefSummary || previewEvent.description || 'No summary provided' }}
            />
            {previewEvent.detailedDescription && (
              <>
                <p style={{ marginTop: '12px' }}><strong>Detailed Description:</strong></p>
                <div
                  style={{ color: '#525252' }}
                  dangerouslySetInnerHTML={{ __html: previewEvent.detailedDescription }}
                />
              </>
            )}
            <ButtonSet style={{ marginTop: '24px' }}>
              <Button kind="primary" renderIcon={Checkmark} onClick={() => { handleApprove(previewEvent); setPreviewOpen(false); }}>
                Approve &amp; Publish
              </Button>
              <Button kind="danger--ghost" renderIcon={TrashCan} onClick={() => { setPreviewOpen(false); setRejectConfirmId(previewEvent.id); }}>
                Reject
              </Button>
            </ButtonSet>
          </div>
        )}
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        open={!!rejectConfirmId}
        onRequestClose={() => setRejectConfirmId(null)}
        modalHeading="Reject Submission"
        primaryButtonText="Yes, Reject"
        secondaryButtonText="Cancel"
        danger
        onRequestSubmit={() => handleReject(rejectConfirmId)}
      >
        <p>Are you sure you want to reject this submission? It will be permanently deleted.</p>
      </Modal>
    </div>
  );
};

export default ForReviewTab;
