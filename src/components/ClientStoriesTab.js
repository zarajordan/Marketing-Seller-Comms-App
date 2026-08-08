import React, { useState } from 'react';

const ClientStoriesTab = () => {
  const [isFullscreen, setIsFullscreen] = useState(true);
  
  // Use environment variable for client stories URL, with fallback to local file
  const CLIENT_STORIES_URL = process.env.REACT_APP_CLIENT_STORIES_URL || '/client-stories.html';

  return (
    <>
      {/* Normal embedded view */}
      {!isFullscreen && (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', minHeight: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button
              onClick={() => setIsFullscreen(true)}
              style={{
                background: '#0f62fe',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 1h5v1.5H2.5V6H1V1zm9 0h5v5h-1.5V2.5H10V1zM1 10h1.5v3.5H6V15H1v-5zm13.5 3.5H11V15h5v-5h-1.5v3.5z"/>
              </svg>
              Open Fullscreen
            </button>
          </div>
          <iframe
            src={CLIENT_STORIES_URL}
            title="IBM Client Stories"
            style={{ flex: 1, width: '100%', border: 'none', borderRadius: '4px' }}
            allow="fullscreen"
          />
        </div>
      )}

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <button
            onClick={() => setIsFullscreen(false)}
            title="Exit fullscreen"
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              zIndex: 10000,
              background: '#161616',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: 0.85,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 1v5H1V4.5h3.5V1H6zm4 0h1.5v3.5H15V6h-5V1zM1 10h5v5H4.5v-3.5H1V10zm9 0h5v1.5h-3.5V15H10v-5z"/>
            </svg>
            Exit Fullscreen
          </button>
          <iframe
            src={CLIENT_STORIES_URL}
            title="IBM Client Stories"
            style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
            allow="fullscreen"
          />
        </div>
      )}
    </>
  );
};

export default ClientStoriesTab;
