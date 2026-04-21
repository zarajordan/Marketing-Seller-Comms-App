import React from 'react';
import {
  Grid,
  Column,
  Tile,
} from '@carbon/react';

const DashboardTab = () => {
  const stats = [
    { label: 'Total Communications', value: '24', icon: '✉️' },
    { label: 'Drafts Saved', value: '8', icon: '💾' },
    { label: 'Templates Used', value: '12', icon: '📚' },
    { label: 'This Month', value: '6', icon: '📅' },
  ];

  return (
    <div className="dashboard-tab">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <p>Overview of your communication activities</p>
      </div>

      <Grid>
        {stats.map((stat, index) => (
          <Column key={index} lg={4} md={4} sm={4}>
            <Tile className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </Tile>
          </Column>
        ))}
      </Grid>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <Tile>
          <ul className="activity-list">
            <li>Created "Q1 Marketing Update" - 2 days ago</li>
            <li>Exported "Product Launch" to Outlook - 5 days ago</li>
            <li>Saved "Team Newsletter" as draft - 1 week ago</li>
            <li>Used "Event Invitation" template - 2 weeks ago</li>
          </ul>
        </Tile>
      </div>
    </div>
  );
};

export default DashboardTab;

// Made with Bob
