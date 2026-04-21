import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  Column,
  Tile,
} from '@carbon/react';

const stockImages = {
  'AI & Innovation': [
    { url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80', alt: 'AI Neural Network' },
    { url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80', alt: 'AI Robot Hand' },
    { url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80', alt: 'AI Technology' },
    { url: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80', alt: 'Machine Learning' },
    { url: 'https://images.unsplash.com/photo-1676277791608-ac5c30f8b1b7?w=800&q=80', alt: 'AI Innovation' },
    { url: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=800&q=80', alt: 'Digital AI' }
  ],
  'Cloud & Data': [
    { url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80', alt: 'Cloud Computing' },
    { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80', alt: 'Data Center' },
    { url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80', alt: 'Server Infrastructure' },
    { url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80', alt: 'Cloud Technology' },
    { url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80', alt: 'Data Analytics' },
    { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', alt: 'Data Visualization' }
  ],
  'Cybersecurity': [
    { url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80', alt: 'Cybersecurity Lock' },
    { url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80', alt: 'Digital Security' },
    { url: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&q=80', alt: 'Network Security' },
    { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', alt: 'Data Protection' },
    { url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80', alt: 'Security Shield' },
    { url: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&q=80', alt: 'Secure Code' }
  ],
  'Digital Transformation': [
    { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', alt: 'Digital Globe' },
    { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', alt: 'Digital Workspace' },
    { url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80', alt: 'Code Development' },
    { url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80', alt: 'Tech Innovation' },
    { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', alt: 'Digital Technology' },
    { url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80', alt: 'Modern Tech' }
  ],
  'Enterprise Solutions': [
    { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', alt: 'Business Strategy' },
    { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', alt: 'Team Collaboration' },
    { url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80', alt: 'Virtual Meeting' },
    { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80', alt: 'Business Innovation' },
    { url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80', alt: 'Enterprise Tech' },
    { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', alt: 'Modern Office' }
  ]
};

const ImageGalleryModal = ({ open, onClose, onSelectImage }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleImageClick = (imageUrl) => {
    onSelectImage(imageUrl);
    onClose();
  };

  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      modalHeading="Choose an Image from Gallery"
      primaryButtonText="Cancel"
      onRequestSubmit={onClose}
      size="lg"
    >
      <Tabs selectedIndex={selectedTab} onChange={(evt) => setSelectedTab(evt.selectedIndex)}>
        <TabList aria-label="Image categories">
          <Tab>AI & Innovation</Tab>
          <Tab>Cloud & Data</Tab>
          <Tab>Cybersecurity</Tab>
          <Tab>Digital Transformation</Tab>
          <Tab>Enterprise Solutions</Tab>
        </TabList>
        
        <TabPanels>
          {Object.entries(stockImages).map(([category, images]) => (
            <TabPanel key={category}>
              <Grid className="image-gallery-grid">
                {images.map((image, index) => (
                  <Column key={index} lg={4} md={4} sm={4}>
                    <Tile 
                      className="gallery-image-tile"
                      onClick={() => handleImageClick(image.url)}
                      style={{ cursor: 'pointer', padding: 0 }}
                    >
                      <img 
                        src={image.url} 
                        alt={image.alt}
                        style={{ 
                          width: '100%', 
                          height: '200px', 
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      <div style={{ padding: '12px' }}>
                        <p style={{ fontSize: '14px', margin: 0 }}>{image.alt}</p>
                      </div>
                    </Tile>
                  </Column>
                ))}
              </Grid>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Modal>
  );
};

export default ImageGalleryModal;

// Made with Bob
