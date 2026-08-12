import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Content,
  Theme,
} from '@carbon/react';
import {
  UserAvatar,
  Logout,
  Edit,
  Star,
  Template,
  EventsAlt,
  Calendar,
  CheckmarkOutline,
  Upload,
  Document,
  Portfolio,
  UserAdmin,
  ChartBar,
} from '@carbon/icons-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateCommTab from './components/CreateCommTab';
import TemplatesTab from './components/TemplatesTab';
import EventsTab from './components/EventsTab';
import ManageEventsTab from './components/ManageEventsTab';
import DraftsTab from './components/DraftsTab';
import DashboardTab from './components/DashboardTab';
import AIAssistantTab from './components/AIAssistantTab';
import MarketingSpotlightTab from './components/MarketingSpotlightTab';
import UserAccessTab from './components/UserAccessTab';
import SubmitEventTab from './components/SubmitEventTab';
import ForReviewTab from './components/ForReviewTab';
import AnalyticsTab from './components/AnalyticsTab';
import ClientStoriesTab from './components/ClientStoriesTab';
import SubmitPartnerStoryTab from './components/SubmitPartnerStoryTab';
import BookFilmingTab from './components/BookFilmingTab';
import ThemeSelector from './components/ThemeSelector';
import LoginPage from './components/LoginPage';
import SetNewPasswordPage from './components/SetNewPasswordPage';
import { UserProvider, useUser } from './contexts/UserContext';
import { listEvents, listReturnedEvents, listFilmingBookings, createFilmingBooking, updateFilmingBooking, deleteFilmingBooking, listStoryRequests, createStoryRequest, deleteStoryRequest } from './lib/supabaseData';

// ── Sidebar configuration ────────────────────────────────────────────────────
const SIDEBAR_SECTIONS = [
  {
    label: 'Comms',
    items: [
      { id: 'create-comm',         label: 'Create Comm',         icon: Edit },
      { id: 'marketing-spotlight', label: 'Marketing Spotlight', icon: Star },
      { id: 'templates',           label: 'Templates',           icon: Template },
    ],
  },
  {
    label: 'Events',
    items: [
      { id: 'event-library',  label: 'Event Library',  icon: EventsAlt },
      { id: 'manage-events',  label: 'Manage Events',  icon: Calendar },
      { id: 'for-review',     label: 'For Review',     icon: CheckmarkOutline, badge: true },
      { id: 'submit-event',   label: 'Submit Event',   icon: Upload },
    ],
  },
  {
    label: 'Personal',
    items: [
      { id: 'drafts', label: 'My Drafts', icon: Document },
    ],
  },
  {
    label: 'Client Stories',
    items: [
      { id: 'client-stories',        label: 'Client Stories',        icon: Portfolio },
      { id: 'submit-partner-story',  label: 'Submit Story Request',  icon: Upload },
      { id: 'book-filming',          label: 'Book Filming',          icon: Calendar },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: 'user-access', label: 'User Access', icon: UserAdmin },
      { id: 'analytics',   label: 'Analytics',   icon: ChartBar },
    ],
  },
];

// Flat map for component lookup
const TAB_COMPONENTS = {
  'create-comm':         CreateCommTab,
  'marketing-spotlight': MarketingSpotlightTab,
  'templates':           TemplatesTab,
  'event-library':       EventsTab,
  'manage-events':       ManageEventsTab,
  'for-review':          ForReviewTab,
  'submit-event':        SubmitEventTab,
  'drafts':              DraftsTab,
  'user-access':         UserAccessTab,
  'analytics':           AnalyticsTab,
  'client-stories':           ClientStoriesTab,
  'submit-partner-story':     SubmitPartnerStoryTab,
  'book-filming':             BookFilmingTab,
  'dashboard':           DashboardTab,
  'ai-assistant':        AIAssistantTab,
};

// ── Auth wrapper ─────────────────────────────────────────────────────────────
function AppContent() {
  const { currentUser, isAuthenticated, loading, passwordRecoveryMode, login, checkEmail, logout, updatePassword } = useUser();

  const handleLogin = async (userData) => {
    try {
      if (userData.step === 'check') {
        const result = await checkEmail(userData.email);
        if (result.success === false) {
          console.error('Email check failed:', result.error);
          throw new Error(result.error || 'Unable to check email');
        }
        if (result.authStage === 'seller') {
          toast.success(`Welcome, ${result.user.name}!`);
        } else if (result.authStage === 'password') {
          throw new Error('NEEDS_PASSWORD');
        } else {
          throw new Error(result.error || 'Login failed');
        }
      } else {
        const result = await login(userData.email, userData.password);
        if (result.success) {
          toast.success(`Welcome back, ${result.user.name}!`);
        } else {
          throw new Error(result.error || 'Login failed');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('You have been logged out');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '14px', color: '#525252' }}>
        Loading...
      </div>
    );
  }

  if (passwordRecoveryMode) {
    return <SetNewPasswordPage onPasswordUpdated={() => {}} updatePassword={updatePassword} />;
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <MainAppContent onLogout={handleLogout} />;
}

// ── Main app shell ───────────────────────────────────────────────────────────
function MainAppContent({ onLogout }) {
  const { currentUser, hasPermission } = useUser();
  const [selectedTabId, setSelectedTabId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [forReviewCount, setForReviewCount] = useState(0);
  const [returnedEventCount, setReturnedEventCount] = useState(0);
  const [filmingBookings, setFilmingBookings] = useState([]);
  const [storyRequests, setStoryRequests] = useState([]);

  // Load persisted data on mount
  useEffect(() => {
    listFilmingBookings().then(setFilmingBookings).catch(() => {});
    listStoryRequests().then(setStoryRequests).catch(() => {});
  }, []);

  const handleAddStoryRequest = useCallback(async (req) => {
    const saved = await createStoryRequest(req);
    setStoryRequests(rs => [saved, ...rs]);
  }, []);
  const handleDismissStoryRequest = useCallback(async (id) => {
    await deleteStoryRequest(id);
    setStoryRequests(rs => rs.filter(r => r.id !== id));
  }, []);

  const handleAddBooking = useCallback(async (b) => {
    const saved = await createFilmingBooking(b);
    setFilmingBookings(bs => [...bs, saved]);
  }, []);
  const handleUpdateBooking = useCallback(async (b) => {
    const saved = await updateFilmingBooking(b);
    setFilmingBookings(bs => bs.map(x => x.id === saved.id ? saved : x));
  }, []);
  const handleUpdateBookingStatus = useCallback(async (id, status) => {
    const existing = filmingBookings.find(x => x.id === id);
    if (!existing) return;
    const saved = await updateFilmingBooking({ ...existing, status });
    setFilmingBookings(bs => bs.map(x => x.id === id ? saved : x));
  }, [filmingBookings]);
  const handleDeleteBooking = useCallback(async (id) => {
    await deleteFilmingBooking(id);
    setFilmingBookings(bs => bs.filter(x => x.id !== id));
  }, []);

  const createCommRef         = useRef(null);
  const marketingSpotlightRef = useRef(null);
  const submitEventRef        = useRef(null);

  // Compute which tabs the user can access (flat list of IDs)
  const accessibleIds = SIDEBAR_SECTIONS
    .flatMap((s) => s.items)
    .map((i) => i.id)
    .filter((id) => hasPermission(id));

  // Set initial tab once permissions are known
  useEffect(() => {
    if (accessibleIds.length > 0 && !accessibleIds.includes(selectedTabId)) {
      setSelectedTabId(accessibleIds[0]);
    }
  }, [accessibleIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load For Review badge count (event drafts + pending filming bookings)
  const loadReviewCount = useCallback(async () => {
    if (!hasPermission('for-review')) return;
    try {
      const data = await listEvents();
      const draftCount = data.filter((e) => e.status === 'Draft').length;
      const pendingFilming = filmingBookings.filter(b => b.status === 'Pending').length;
      setForReviewCount(draftCount + pendingFilming + storyRequests.length);
    } catch {
      // silently ignore
    }
  }, [hasPermission, filmingBookings, storyRequests]);

  useEffect(() => {
    loadReviewCount();
    window.addEventListener('eventsUpdated', loadReviewCount);
    return () => window.removeEventListener('eventsUpdated', loadReviewCount);
  }, [loadReviewCount]);

  // Load returned-event count for the current user's sidebar badge
  const loadReturnedCount = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      const returned = await listReturnedEvents(currentUser.email);
      setReturnedEventCount(returned.length);
    } catch {
      // silently ignore
    }
  }, [currentUser?.email]);

  useEffect(() => {
    loadReturnedCount();
    window.addEventListener('eventsUpdated', loadReturnedCount);
    return () => window.removeEventListener('eventsUpdated', loadReturnedCount);
  }, [loadReturnedCount]);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const navigateTo = (tabId) => {
    if (accessibleIds.includes(tabId)) setSelectedTabId(tabId);
  };

  const handleLoadTemplate = (templateData) => {
    if (createCommRef.current?.loadFormData) {
      createCommRef.current.loadFormData(templateData);
      navigateTo('create-comm');
    }
  };

  const handleGenerateComm = (selectedEvents) => {
    localStorage.setItem('selected_events_for_comm', JSON.stringify(selectedEvents));
    navigateTo('create-comm');
  };

  const handleEditDraft = (draftData, draftId) => {
    if (!draftData) return;
    const data = typeof draftData === 'string' ? JSON.parse(draftData) : draftData;
    if (data.type === 'Marketing Spotlight') {
      navigateTo('marketing-spotlight');
      marketingSpotlightRef.current?.loadDraft(data, draftId);
    } else if (data.type === 'Event Submission') {
      navigateTo('submit-event');
      submitEventRef.current?.loadDraft(data, draftId);
    } else {
      navigateTo('create-comm');
      createCommRef.current?.loadFormData(data, draftId);
    }
  };

  if (!currentUser) {
    return (
      <Theme theme="white">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
          <UserAvatar size={64} />
          <h2>No user logged in</h2>
          <p>Please configure users in the User Access tab</p>
        </div>
      </Theme>
    );
  }

  // Render the active tab — ref-based tabs stay mounted and are hidden when inactive
  const renderActiveTab = () => {
    if (!selectedTabId) return null;

    // Tabs that need persistent refs — always mounted, shown/hidden via display
    const persistentTabs = [
      { id: 'create-comm',         Component: TAB_COMPONENTS['create-comm'],         ref: createCommRef,         extraProps: { currentUser } },
      { id: 'marketing-spotlight', Component: TAB_COMPONENTS['marketing-spotlight'], ref: marketingSpotlightRef, extraProps: { currentUser } },
      { id: 'submit-event',        Component: TAB_COMPONENTS['submit-event'],        ref: submitEventRef,        extraProps: { onReturnedResolved: loadReturnedCount } },
    ];

    // All other tabs — only render when active
    const renderOther = () => {
      if (persistentTabs.some(t => t.id === selectedTabId)) return null;
      const Component = TAB_COMPONENTS[selectedTabId];
      if (!Component) return null;
      const props = {};
      if (selectedTabId === 'templates')       props.onUseTemplate = handleLoadTemplate;
      if (selectedTabId === 'drafts')          { props.onEditDraft = handleEditDraft; props.currentUser = currentUser; }
      if (selectedTabId === 'event-library')   { props.onGenerateComm = handleGenerateComm; props.currentUser = currentUser; }
      if (selectedTabId === 'for-review')      { props.filmingBookings = filmingBookings; props.onUpdateBookingStatus = handleUpdateBookingStatus; props.onDeleteBooking = handleDeleteBooking; props.storyRequests = storyRequests; props.onDismissStoryRequest = handleDismissStoryRequest; }
      if (selectedTabId === 'submit-partner-story') { props.onAddStoryRequest = handleAddStoryRequest; }
      if (selectedTabId === 'book-filming') { props.bookings = filmingBookings; props.onAddBooking = handleAddBooking; props.onUpdateBooking = handleUpdateBooking; props.onUpdateBookingStatus = handleUpdateBookingStatus; props.onDeleteBooking = handleDeleteBooking; }
      return <Component {...props} />;
    };

    return (
      <>
        {persistentTabs.map(({ id, Component, ref, extraProps }) => (
          <div key={id} style={{ display: selectedTabId === id ? 'block' : 'none' }}>
            <Component ref={ref} {...extraProps} />
          </div>
        ))}
        {renderOther()}
      </>
    );
  };

  return (
    <Theme theme="white">
      {/* ── Topbar ── */}
      <div className="app-topbar">
        <button
          className="app-topbar__sidebar-toggle"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setSidebarCollapsed((c) => !c)}
        >
          <span className="app-topbar__hamburger" />
        </button>
        <span className="app-topbar__logo">IBM</span>
        <div className="app-topbar__divider" />
        <span className="app-topbar__name">IBM UKI MARKETING HUB</span>
        <div className="app-topbar__right">
          <span className="app-topbar__role-pill">{currentUser.role}</span>
          <span className="app-topbar__username">{currentUser.name}</span>
          <button className="app-topbar__icon-btn" aria-label="Logout" title="Logout" onClick={onLogout}>
            <Logout size={18} />
          </button>
        </div>
      </div>

      <Content style={{ paddingTop: 0 }}>
        {/* ── Layout: sidebar + content ── */}
        <div className={`app-layout${sidebarCollapsed ? ' app-layout--collapsed' : ''}`}>

          {/* Sidebar */}
          <nav className="app-sidebar" aria-label="Main navigation">
            {SIDEBAR_SECTIONS.map((section) => {
              const visibleItems = section.items.filter((item) => accessibleIds.includes(item.id));
              if (visibleItems.length === 0) return null;
              return (
                <div key={section.label} className="app-sidebar__section">
                  {!sidebarCollapsed && (
                    <span className="app-sidebar__section-label">{section.label}</span>
                  )}
                  {visibleItems.map((item) => {
                    const isActive = item.id === selectedTabId;
                    const showBadge = item.badge && forReviewCount > 0;
                    const showReturnedBadge = item.id === 'submit-event' && returnedEventCount > 0;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        className={`app-sidebar__item${isActive ? ' app-sidebar__item--active' : ''}`}
                        onClick={() => setSelectedTabId(item.id)}
                        title={sidebarCollapsed ? item.label : undefined}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="app-sidebar__icon"><Icon size={16} /></span>
                        {!sidebarCollapsed && (
                          <span className="app-sidebar__label">{item.label}</span>
                        )}
                        {showBadge && (
                          <span className={`app-sidebar__badge${sidebarCollapsed ? ' app-sidebar__badge--dot' : ''}`}>
                            {sidebarCollapsed ? '' : forReviewCount}
                          </span>
                        )}
                        {showReturnedBadge && (
                          <span className={`app-sidebar__badge app-sidebar__badge--danger${sidebarCollapsed ? ' app-sidebar__badge--dot' : ''}`}>
                            {sidebarCollapsed ? '' : returnedEventCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Main content */}
          <main className="app-main">
            {accessibleIds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', background: '#f4f4f4', borderRadius: '8px', marginTop: '24px' }}>
                <UserAvatar size={48} style={{ marginBottom: '16px' }} />
                <h3>No Accessible Tabs</h3>
                <p style={{ color: '#525252', marginTop: '8px' }}>
                  Your account doesn't have permission to access any tabs.
                  Please contact an administrator.
                </p>
              </div>
            ) : (
              renderActiveTab()
            )}
          </main>
        </div>
      </Content>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        limit={3}
        pauseOnHover={false}
        theme="light"
      />
      <ThemeSelector
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />
    </Theme>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;

// Made with Bob
