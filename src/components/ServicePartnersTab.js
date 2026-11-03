import React from 'react';
import StrategicPartnershipsTab from './StrategicPartnershipsTab';

// UKI Service Partners — same structure as Strategic Partnerships, but a blank
// canvas: no seeded partners, contacts or copy. Admins populate everything.
export default function ServicePartnersTab({ currentUser }) {
  return <StrategicPartnershipsTab currentUser={currentUser} variant="service" />;
}
