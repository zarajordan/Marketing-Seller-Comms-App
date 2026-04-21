import React, { useState } from 'react';
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  Content,
  Theme,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@carbon/react';
import CreateCommTab from './components/CreateCommTab';
import TemplatesTab from './components/TemplatesTab';
import EventsTab from './components/EventsTab';
import DraftsTab from './components/DraftsTab';
import DashboardTab from './components/DashboardTab';
import AIAssistantTab from './components/AIAssistantTab';

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Theme theme="white">
      <Header aria-label="IBM Marketing Comms">
        <HeaderName prefix="IBM">
          Marketing Comms - United Kingdom & Ireland
        </HeaderName>
        <HeaderGlobalBar />
      </Header>
      
      <Content>
        <div className="app-container">
          <div className="app-header">
            <h1 className="app-title">IBM Marketing Comms</h1>
            <p className="app-subtitle">Professional Communication Builder for Outlook</p>
          </div>

          <Tabs selectedIndex={selectedIndex} onChange={(evt) => setSelectedIndex(evt.selectedIndex)}>
            <TabList aria-label="Communication tabs" contained>
              <Tab>Create Comm</Tab>
              <Tab>📚 Templates</Tab>
              <Tab>🎯 Event Library</Tab>
              <Tab>My Drafts</Tab>
              <Tab>📊 Dashboard</Tab>
              <Tab>🤖 AI Assistant</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <CreateCommTab />
              </TabPanel>
              <TabPanel>
                <TemplatesTab />
              </TabPanel>
              <TabPanel>
                <EventsTab />
              </TabPanel>
              <TabPanel>
                <DraftsTab />
              </TabPanel>
              <TabPanel>
                <DashboardTab />
              </TabPanel>
              <TabPanel>
                <AIAssistantTab />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </Content>
    </Theme>
  );
}

export default App;

// Made with Bob
