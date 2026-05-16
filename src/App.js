import React, { useState, useRef, useEffect } from 'react';
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Content,
  Theme,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tag,
  Button,
} from '@carbon/react';
import { ColorPalette, UserAvatar, Switcher } from '@carbon/icons-react';
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
import ThemeSelector from './components/ThemeSelector';
import { UserProvider, useUser } from './contexts/UserContext';

// Tab configuration with IDs for permission checking
const TAB_CONFIG = [
  { id: 'create-comm', label: 'Create Comm', component: CreateCommTab },
  { id: 'marketing-spotlight', label: '✨ Marketing Spotlight', component: MarketingSpotlightTab },
  { id: 'templates', label: '📚 Templates', component: TemplatesTab },
  { id: 'event-library', label: '🎯 Event Library', component: EventsTab },
  { id: 'manage-events', label: '📅 Manage Events', component: ManageEventsTab },
  { id: 'drafts', label: 'My Drafts', component: DraftsTab },
  { id: 'user-access', label: '👥 User Access', component: UserAccessTab },
];

function AppContent() {
  const { currentUser, hasPermission, hasRole, switchUser, logout } = useUser();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const createCommRef = useRef(null);
  const marketingSpotlightRef = useRef(null);

  // Get accessible tabs based on user permissions
  const accessibleTabs = TAB_CONFIG.filter((tab) => hasPermission(tab.id));

  // Ensure selected index is valid for accessible tabs
  useEffect(() => {
    if (selectedIndex >= accessibleTabs.length) {
      setSelectedIndex(0);
    }
  }, [accessibleTabs.length, selectedIndex]);

  const handleLoadTemplate = (templateData) => {
    if (createCommRef.current && createCommRef.current.loadFormData) {
      createCommRef.current.loadFormData(templateData);
      // Find the index of Create Comm tab in accessible tabs
      const createCommIndex = accessibleTabs.findIndex((tab) => tab.id === 'create-comm');
      if (createCommIndex !== -1) {
        setSelectedIndex(createCommIndex);
      }
    }
  };

  const handleEditDraft = (draftData, draftId) => {
    // Check if it's a Marketing Spotlight draft
    if (draftData.type === 'Marketing Spotlight') {
      if (marketingSpotlightRef.current && marketingSpotlightRef.current.loadDraft) {
        marketingSpotlightRef.current.loadDraft(draftData, draftId);
        const spotlightIndex = accessibleTabs.findIndex((tab) => tab.id === 'marketing-spotlight');
        if (spotlightIndex !== -1) {
          setSelectedIndex(spotlightIndex);
        }
      }
    } else {
      // Regular comm draft
      if (createCommRef.current && createCommRef.current.loadFormData) {
        createCommRef.current.loadFormData(draftData, draftId);
        const createCommIndex = accessibleTabs.findIndex((tab) => tab.id === 'create-comm');
        if (createCommIndex !== -1) {
          setSelectedIndex(createCommIndex);
        }
      }
    }
  };

  const handleSwitchUser = () => {
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const activeUsers = users.filter((u) => u.active);
    
    if (activeUsers.length > 1) {
      const currentIndex = activeUsers.findIndex((u) => u.id === currentUser?.id);
      const nextIndex = (currentIndex + 1) % activeUsers.length;
      const nextUser = activeUsers[nextIndex];
      
      if (switchUser(nextUser.id)) {
        toast.success(`Switched to ${nextUser.name} (${nextUser.role})`);
        setSelectedIndex(0); // Reset to first accessible tab
      }
    } else {
      toast.info('No other users available to switch to');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      manager: 'purple',
      editor: 'blue',
      seller: 'cyan',
      viewer: 'green',
    };
    return colors[role] || 'gray';
  };

  if (!currentUser) {
    return (
      <Theme theme="white">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <UserAvatar size={64} />
          <h2>No user logged in</h2>
          <p>Please configure users in the User Access tab</p>
        </div>
      </Theme>
    );
  }

  return (
    <Theme theme="white">
      <Header aria-label="UKI IBM Marketing Comms">
        <HeaderName prefix="UKI">
          IBM Marketing Comms - United Kingdom & Ireland
        </HeaderName>
        <HeaderGlobalBar>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginRight: '16px'
          }}>
            <Tag type={getRoleColor(currentUser.role)} size="sm">
              {currentUser.role}
            </Tag>
            <span style={{ fontSize: '14px', color: '#f4f4f4' }}>
              {currentUser.name}
            </span>
          </div>
          <HeaderGlobalAction
            aria-label="Switch User"
            tooltipAlignment="end"
            onClick={handleSwitchUser}
          >
            <Switcher size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction
            aria-label="Theme Selector"
            tooltipAlignment="end"
            onClick={() => setThemeModalOpen(true)}
          >
            <ColorPalette size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      
      <Content>
        <div className="app-container">
          <div className="app-header">
            <h1 className="app-title">UKI IBM Marketing Comms</h1>
            <p className="app-subtitle">Professional Communication Builder for Outlook</p>
          </div>

          {accessibleTabs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              background: '#f4f4f4',
              borderRadius: '8px',
              marginTop: '24px'
            }}>
              <UserAvatar size={48} style={{ marginBottom: '16px' }} />
              <h3>No Accessible Tabs</h3>
              <p style={{ color: '#525252', marginTop: '8px' }}>
                Your account doesn't have permission to access any tabs.
                Please contact an administrator.
              </p>
            </div>
          ) : (
            <Tabs selectedIndex={selectedIndex} onChange={(evt) => setSelectedIndex(evt.selectedIndex)}>
              <TabList aria-label="Communication tabs" contained>
                {accessibleTabs.map((tab) => (
                  <Tab key={tab.id}>{tab.label}</Tab>
                ))}
              </TabList>
              
              <TabPanels>
                {accessibleTabs.map((tab) => {
                  const Component = tab.component;
                  let componentProps = {};

                  // Add refs for specific components
                  if (tab.id === 'create-comm') {
                    componentProps.ref = createCommRef;
                  } else if (tab.id === 'marketing-spotlight') {
                    componentProps.ref = marketingSpotlightRef;
                  } else if (tab.id === 'templates') {
                    componentProps.onUseTemplate = handleLoadTemplate;
                  } else if (tab.id === 'drafts') {
                    componentProps.onEditDraft = handleEditDraft;
                  }

                  return (
                    <TabPanel key={tab.id}>
                      <Component {...componentProps} />
                    </TabPanel>
                  );
                })}
              </TabPanels>
            </Tabs>
          )}
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
