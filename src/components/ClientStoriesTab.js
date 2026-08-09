import React, { useState } from 'react';

const ClientStoriesTab = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const src = '/client-stories.html';

  const fullscreenOverlay = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
  };

  const embeddedWrap = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 180px)',
    minHeight: '600px',
  };

  const iframeStyle = {
    flex: 1,
    width: '100%',
    height: '100%',
    border: 'none',
  };

  const btnBase = {
    position: 'absolute',
    top: '12px',
    right: '16px',
    zIndex: 10000,
    background: '#161616',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    opacity: 0.85,
    fontFamily: 'inherit',
  };

  const expandBtn = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '8px',
  };

  const expandBtnStyle = {
    background: '#0f62fe',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    padding: '7px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'inherit',
  };

  const ExpandIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 1h5v1.5H2.5V6H1V1zm9 0h5v5h-1.5V2.5H10V1zM1 10h1.5v3.5H6V15H1v-5zm13.5 3.5H11V15h5v-5h-1.5v3.5z"/>
    </svg>
  );

  const CollapseIcon = () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6 1v5H1V4.5h3.5V1H6zm4 0h1.5v3.5H15V6h-5V1zM1 10h5v5H4.5v-3.5H1V10zm9 0h5v1.5h-3.5V15H10v-5z"/>
    </svg>
  );

  if (isFullscreen) {
    return (
      <div style={fullscreenOverlay}>
        <button
          onClick={() => setIsFullscreen(false)}
          style={btnBase}
          title="Exit fullscreen"
        >
          <CollapseIcon /> Exit Fullscreen
        </button>
        <iframe
          src={src}
          title="IBM Client Stories"
          style={iframeStyle}
          allow="fullscreen"
        />
      </div>
    );
  }

  return (
    <div style={embeddedWrap}>
      <div style={expandBtn}>
        <button
          onClick={() => setIsFullscreen(true)}
          style={expandBtnStyle}
        >
          <ExpandIcon /> Open Fullscreen
        </button>
      </div>
      <iframe
        src={src}
        title="IBM Client Stories"
        style={iframeStyle}
        allow="fullscreen"
      />
    </div>
  );
};

export default ClientStoriesTab;
