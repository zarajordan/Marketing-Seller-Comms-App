// Sample Events Seed Script
// Run this in the browser console to populate the event management system with sample events

const sampleEvents = [
  {
    id: Date.now() + 1,
    title: 'IBM watsonx.ai Workshop: Building Enterprise AI Solutions',
    date: '2026-05-15',
    time: '10:00 AM - 12:00 PM BST',
    location: 'IBM Client Center, London',
    locationType: 'In-Person',
    summary: 'Hands-on workshop exploring IBM watsonx.ai capabilities for building and deploying enterprise AI models.',
    description: 'Join us for an interactive workshop where you will learn how to leverage IBM watsonx.ai to build, train, and deploy AI models at scale.',
    registrationLink: 'https://ibm.com/events/watsonx-workshop',
    productAreas: ['ai', 'data'],
    eventType: 'workshop',
    targetAudience: 'Technical',
    featured: true,
    status: 'active',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
  {
    id: Date.now() + 2,
    title: 'Quantum Computing Webinar: Real-World Applications',
    date: '2026-05-20',
    time: '2:00 PM - 3:30 PM BST',
    location: 'Virtual Event',
    locationType: 'Virtual',
    summary: 'Discover how quantum computing is solving complex business problems across industries.',
    description: 'Explore the practical applications of quantum computing in finance, pharmaceuticals, logistics, and more.',
    registrationLink: 'https://ibm.com/events/quantum-webinar',
    productAreas: ['quantum', 'cloud'],
    eventType: 'webinar',
    targetAudience: 'Business & Technical',
    featured: true,
    status: 'active',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
  {
    id: Date.now() + 3,
    title: 'Cloud Security Summit 2026',
    date: '2026-06-10',
    time: '9:00 AM - 5:00 PM BST',
    location: 'ExCeL London',
    locationType: 'In-Person',
    summary: 'Full-day conference on cloud security best practices, compliance, and threat protection.',
    description: 'Join security leaders and IBM experts for a comprehensive day of sessions on cloud security.',
    registrationLink: 'https://ibm.com/events/cloud-security-summit',
    productAreas: ['security', 'cloud'],
    eventType: 'conference',
    targetAudience: 'Technical',
    featured: true,
    status: 'active',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
  {
    id: Date.now() + 4,
    title: 'Automation Anywhere: Streamlining Business Processes',
    date: '2026-05-25',
    time: '11:00 AM - 12:00 PM BST',
    location: 'Virtual Event',
    locationType: 'Virtual',
    summary: 'Learn how intelligent automation can transform your business operations and increase efficiency.',
    description: 'Discover how IBM automation solutions can help you streamline workflows and reduce manual tasks.',
    registrationLink: 'https://ibm.com/events/automation-webinar',
    productAreas: ['automation', 'ai'],
    eventType: 'webinar',
    targetAudience: 'Business',
    featured: false,
    status: 'active',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
  {
    id: Date.now() + 5,
    title: 'Data Analytics Masterclass: From Insights to Action',
    date: '2026-06-05',
    time: '1:00 PM - 4:00 PM BST',
    location: 'IBM Offices, Manchester',
    locationType: 'In-Person',
    summary: 'Advanced training on data analytics, visualization, and turning insights into business value.',
    description: 'This masterclass provides hands-on training in advanced data analytics techniques.',
    registrationLink: 'https://ibm.com/events/data-analytics-masterclass',
    productAreas: ['data', 'ai'],
    eventType: 'training',
    targetAudience: 'Technical',
    featured: false,
    status: 'active',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
  {
    id: Date.now() + 6,
    title: 'Hybrid Cloud Strategy Roundtable',
    date: '2026-05-30',
    time: '3:00 PM - 5:00 PM BST',
    location: 'IBM Client Center, Edinburgh',
    locationType: 'In-Person',
    summary: 'Executive roundtable discussion on hybrid cloud adoption strategies and best practices.',
    description: 'An exclusive roundtable for IT leaders to discuss hybrid cloud strategies and challenges.',
    registrationLink: 'https://ibm.com/events/hybrid-cloud-roundtable',
    productAreas: ['cloud', 'infrastructure'],
    eventType: 'networking',
    targetAudience: 'Executive',
    featured: false,
    status: 'active',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
  {
    id: Date.now() + 7,
    title: 'IBM Power Systems Modernization Seminar',
    date: '2026-06-15',
    time: '10:00 AM - 1:00 PM BST',
    location: 'Virtual Event',
    locationType: 'Virtual',
    summary: 'Explore modernization options for IBM Power Systems and AIX environments.',
    description: 'Learn about the latest IBM Power Systems innovations and modernization strategies.',
    registrationLink: 'https://ibm.com/events/power-systems-seminar',
    productAreas: ['infrastructure', 'cloud'],
    eventType: 'seminar',
    targetAudience: 'Technical',
    featured: false,
    status: 'active',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
  {
    id: Date.now() + 8,
    title: 'SAP on IBM Cloud: Migration and Optimization',
    date: '2026-06-20',
    time: '2:00 PM - 3:30 PM BST',
    location: 'Virtual Event',
    locationType: 'Virtual',
    summary: 'Best practices for running SAP workloads on IBM Cloud infrastructure.',
    description: 'Discover how to migrate and optimize your SAP landscape on IBM Cloud.',
    registrationLink: 'https://ibm.com/events/sap-on-cloud',
    productAreas: ['business', 'cloud', 'infrastructure'],
    eventType: 'webinar',
    targetAudience: 'Technical',
    featured: false,
    status: 'active',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
];

function seedEvents() {
  try {
    const existingEvents = JSON.parse(localStorage.getItem('managed_events') || '[]');
    const existingTitles = existingEvents.map(e => e.title);
    const newEvents = sampleEvents.filter(e => !existingTitles.includes(e.title));
    
    if (newEvents.length === 0) {
      console.log('Sample events already exist');
      return;
    }
    
    const updatedEvents = [...existingEvents, ...newEvents];
    localStorage.setItem('managed_events', JSON.stringify(updatedEvents));
    console.log('Added ' + newEvents.length + ' sample events');
  } catch (error) {
    console.error('Error seeding events:', error);
  }
}

seedEvents();
