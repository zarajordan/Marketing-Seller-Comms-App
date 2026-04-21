import React from 'react';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Button,
  ButtonSet,
} from '@carbon/react';
import { TrashCan, Edit, Share } from '@carbon/icons-react';

const DraftsTab = () => {
  const drafts = [
    {
      id: '1',
      title: 'Q1 Marketing Update',
      date: '2026-03-15',
      preview: 'Quarterly marketing highlights and upcoming campaigns...',
    },
    {
      id: '2',
      title: 'Product Launch Announcement',
      date: '2026-03-10',
      preview: 'Exciting new product features and availability...',
    },
    {
      id: '3',
      title: 'Team Newsletter',
      date: '2026-03-05',
      preview: 'Monthly team updates and achievements...',
    },
  ];

  return (
    <div className="drafts-tab">
      <div className="drafts-header">
        <h2>My Drafts</h2>
        <p>Manage your saved communication drafts</p>
      </div>

      {drafts.length === 0 ? (
        <div className="empty-state">
          <p>No drafts saved yet. Create a communication and save it as a draft.</p>
        </div>
      ) : (
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
            {drafts.map((draft) => (
              <StructuredListRow key={draft.id}>
                <StructuredListCell>{draft.title}</StructuredListCell>
                <StructuredListCell>{draft.date}</StructuredListCell>
                <StructuredListCell>{draft.preview}</StructuredListCell>
                <StructuredListCell>
                  <ButtonSet>
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={Edit}
                      iconDescription="Edit"
                      hasIconOnly
                    />
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={Share}
                      iconDescription="Share"
                      hasIconOnly
                    />
                    <Button
                      kind="danger--ghost"
                      size="sm"
                      renderIcon={TrashCan}
                      iconDescription="Delete"
                      hasIconOnly
                    />
                  </ButtonSet>
                </StructuredListCell>
              </StructuredListRow>
            ))}
          </StructuredListBody>
        </StructuredListWrapper>
      )}
    </div>
  );
};

export default DraftsTab;

// Made with Bob
