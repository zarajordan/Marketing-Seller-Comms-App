import { supabase } from './supabaseClient';

export const TAB_PERMISSIONS = [
  'create-comm',
  'marketing-spotlight',
  'templates',
  'event-library',
  'manage-events',
  'for-review',
  'submit-event',
  'drafts',
  'user-access',
  'analytics',
  'archive',
];

export const ROLE_CONFIG = {
  'admin-manager': {
    label: 'Admin Manager',
    color: 'red',
  },
  marketer: {
    label: 'Marketer',
    color: 'purple',
  },
  marketing: {
    label: 'Marketing',
    color: 'teal',
  },
  seller: {
    label: 'Seller',
    color: 'cyan',
  },
};

export const getDefaultPermissions = (role) => {
  if (role === 'admin-manager') {
    return TAB_PERMISSIONS.reduce((permissions, tabId) => {
      permissions[tabId] = true;
      return permissions;
    }, {});
  }

  if (role === 'marketing') {
    return TAB_PERMISSIONS.reduce((permissions, tabId) => {
      permissions[tabId] = tabId === 'event-library' || tabId === 'submit-event' || tabId === 'drafts' || tabId === 'archive';
      return permissions;
    }, {});
  }

  // seller — or any unrecognised/unauthorised role — gets Event Library only
  return TAB_PERMISSIONS.reduce((permissions, tabId) => {
    permissions[tabId] = tabId === 'event-library';
    return permissions;
  }, {});
};

export const getUserPermissions = async (user) => {
  const defaultPermissions = getDefaultPermissions(user.role);

  if (user.role !== 'marketer') {
    return defaultPermissions;
  }

  const { data, error } = await supabase
    .from('user_tab_permissions')
    .select('tab_id, enabled')
    .eq('user_email', user.email);

  if (error) {
    throw error;
  }

  return data.reduce((permissions, entry) => {
    permissions[entry.tab_id] = entry.enabled;
    return permissions;
  }, { ...defaultPermissions });
};

export const listUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  const usersWithPermissions = await Promise.all(
    data.map(async (user) => ({
      ...user,
      permissions: await getUserPermissions(user),
    }))
  );

  return usersWithPermissions;
};

export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    permissions: await getUserPermissions(data),
  };
};

export const createUser = async (user) => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  await replaceMarketerPermissions(data, user.permissions || getDefaultPermissions(data.role));

  return {
    ...data,
    permissions: await getUserPermissions(data),
  };
};

export const updateUser = async (user) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    })
    .eq('id', user.id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  await replaceMarketerPermissions(data, user.permissions || getDefaultPermissions(data.role));

  return {
    ...data,
    permissions: await getUserPermissions(data),
  };
};

export const deleteUser = async (user) => {
  await supabase.from('user_tab_permissions').delete().eq('user_email', user.email);

  const { error } = await supabase.from('users').delete().eq('id', user.id);

  if (error) {
    throw error;
  }
};

export const replaceMarketerPermissions = async (user, permissions) => {
  await supabase.from('user_tab_permissions').delete().eq('user_email', user.email);

  if (user.role !== 'marketer') {
    return;
  }

  const rows = Object.entries(permissions).map(([tab_id, enabled]) => ({
    user_email: user.email,
    tab_id,
    enabled,
  }));

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from('user_tab_permissions').insert(rows);

  if (error) {
    throw error;
  }
};

export const mapEventRowToAppEvent = (row) => ({
  id: row.id,
  title: row.title || '',
  // legacy fields
  description: row.brief_summary || row.description || '',
  date: row.start_date || row.event_date || '',
  location: (row.location_details || row.location || '').replace(/\s*\(Virtual\)\s*/gi, '').trim(),
  ownerEmail: row.owner_email || '',
  // new fields
  startDate: row.start_date || row.event_date || '',
  endDate: row.end_date || '',
  eventTime: row.event_time || '',
  locationType: row.location_type || 'Virtual',
  locationDetails: (row.location_details || row.location || '').replace(/\s*\(Virtual\)\s*/gi, '').trim(),
  inviteOnly: row.invite_only || false,
  contacts: row.contacts || [],
  speakers: row.speakers || [],
  briefSummary: row.brief_summary || row.description || '',
  detailedDescription: row.detailed_description || '',
  eventAgenda: row.event_agenda || '',
  registrationLink: row.registration_link || '',
  seismicLink: row.seismic_link || '',
  seismicPageRequired: row.seismic_page_required ?? null,
  sellerInviteUrl: row.seller_invite_url || '',
  partnerInviteUrl: row.partner_invite_url || '',
  productAreas: row.product_areas || [],
  eventType: row.event_type || 'Webinar',
  targetAudience: row.target_audience || 'All',
  industry: row.industry || 'Cross-Industry',
  targetRoles: row.target_roles || [],
  otherRole: row.other_role || '',
  eventStream: row.event_stream || '',
  status: row.status || 'Active',
  postEventFollowUp: row.post_event_follow_up || '',
  category: row.category || 'ibm',
  regions: row.regions || [],
  inviteProcess: row.invite_process || '',
  promoteOurPresence: row.promote_our_presence || '',
  promoteDocuments: row.promote_documents || [],
});

export const mapEventFormToRow = (event) => ({
  title: event.title,
  start_date: event.startDate || event.date || null,
  end_date: event.endDate || null,
  event_time: event.eventTime || null,
  location_type: event.locationType || 'Virtual',
  location_details: event.locationDetails || event.location || '',
  invite_only: event.inviteOnly || false,
  contacts: event.contacts || [],
  speakers: event.speakers || [],
  brief_summary: event.briefSummary || event.description || '',
  detailed_description: event.detailedDescription || '',
  event_agenda: event.eventAgenda || '',
  registration_link: event.registrationLink || '',
  seismic_link: event.seismicLink || '',
  seismic_page_required: event.seismicPageRequired ?? null,
  seller_invite_url: event.sellerInviteUrl || '',
  partner_invite_url: event.partnerInviteUrl || '',
  product_areas: event.productAreas || [],
  event_type: event.eventType || 'Webinar',
  target_audience: event.targetAudience || 'All',
  industry: event.industry || 'Cross-Industry',
  target_roles: event.targetRoles || [],
  other_role: event.otherRole || '',
  event_stream: event.eventStream || '',
  status: event.status || 'Active',
  post_event_follow_up: event.postEventFollowUp || '',
  category: event.category || 'ibm',
  regions: event.regions || [],
  invite_process: event.inviteProcess || '',
  promote_our_presence: event.promoteOurPresence || '',
  promote_documents: event.promoteDocuments || [],
  // keep legacy column populated for backwards compat
  description: event.briefSummary || event.description || '',
  event_date: event.startDate || event.date || null,
  location: event.locationDetails || event.location || '',
  owner_email: event.ownerEmail || null,
});

export const uploadEventDocument = async (file, folder) => {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('event-documents').upload(fileName, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('event-documents').getPublicUrl(fileName);
  return data.publicUrl;
};

export const listEvents = async () => {
  const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(mapEventRowToAppEvent);
};

export const createEvent = async (event) => {
  const { data, error } = await supabase
    .from('events')
    .insert(mapEventFormToRow(event))
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapEventRowToAppEvent(data);
};

export const updateEvent = async (event) => {
  const { data, error } = await supabase
    .from('events')
    .update(mapEventFormToRow(event))
    .eq('id', event.id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapEventRowToAppEvent(data);
};

export const deleteEvent = async (eventId) => {
  const { error } = await supabase.from('events').delete().eq('id', eventId);

  if (error) {
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Drafts — stored in Supabase, scoped to the owner's email
// ---------------------------------------------------------------------------

export const listDrafts = async (ownerEmail) => {
  const { data, error } = await supabase
    .from('comms_drafts')
    .select('*')
    .eq('owner_email', ownerEmail)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    date: row.updated_at,
    data: row.draft_data,
  }));
};

export const saveDraft = async (ownerEmail, name, draftData) => {
  const { data, error } = await supabase
    .from('comms_drafts')
    .insert({
      owner_email: ownerEmail,
      name,
      draft_data: draftData,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return { id: data.id, name: data.name, date: data.updated_at, data: data.draft_data };
};

export const updateDraft = async (draftId, ownerEmail, draftData) => {
  const { data, error } = await supabase
    .from('comms_drafts')
    .update({
      draft_data: draftData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', draftId)
    .eq('owner_email', ownerEmail)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return { id: data.id, name: data.name, date: data.updated_at, data: data.draft_data };
};

export const deleteDraft = async (draftId, ownerEmail) => {
  const { error } = await supabase
    .from('comms_drafts')
    .delete()
    .eq('id', draftId)
    .eq('owner_email', ownerEmail);

  if (error) {
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Activity logging — writes to the activity_log table
// ---------------------------------------------------------------------------

export const logActivity = async (eventType, payload = {}) => {
  try {
    await supabase.from('activity_log').insert({
      event_type: eventType,
      user_email: payload.userEmail || null,
      user_name: payload.userName || null,
      user_role: payload.userRole || null,
      metadata: payload.metadata || null,
      created_at: new Date().toISOString(),
    });
  } catch {
    // non-critical — never let logging break the app
  }
};

// ---------------------------------------------------------------------------
// Analytics queries — read from activity_log
// ---------------------------------------------------------------------------

export const getAnalyticsSummary = async (days = 90) => {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const prevSince = new Date(Date.now() - days * 2 * 86400000).toISOString();

  const [curr, prev] = await Promise.all([
    supabase.from('activity_log').select('event_type, user_email, metadata, created_at').gte('created_at', since),
    supabase.from('activity_log').select('event_type, user_email, created_at').gte('created_at', prevSince).lt('created_at', since),
  ]);

  const rows = (curr.error ? [] : curr.data) || [];
  const prevRows = (prev.error ? [] : prev.data) || [];

  const visits  = rows.filter((r) => r.event_type === 'login').length;
  const comms   = rows.filter((r) => r.event_type === 'comm_generated').length;
  const users   = new Set(rows.map((r) => r.user_email).filter(Boolean)).size;
  const eventsArr = rows.filter((r) => r.event_type === 'comm_generated').map((r) => r.metadata?.eventCount || 0);
  const avgEvents = eventsArr.length ? (eventsArr.reduce((a, b) => a + b, 0) / eventsArr.length).toFixed(1) : null;

  const pVisits = prevRows.filter((r) => r.event_type === 'login').length;
  const pComms  = prevRows.filter((r) => r.event_type === 'comm_generated').length;
  const pUsers  = new Set(prevRows.map((r) => r.user_email).filter(Boolean)).size;

  const pct = (a, b) => b === 0 ? null : Math.round(((a - b) / b) * 100);

  // Day-of-week counts (0=Mon … 6=Sun)
  const dowCounts = Array.from({ length: 7 }, (_, i) => ({ dow: i, count: 0 }));
  rows.forEach((r) => {
    const d = new Date(r.created_at).getDay(); // 0=Sun
    const mon = (d + 6) % 7; // convert to Mon=0
    dowCounts[mon].count++;
  });

  return { visits, comms, users, avgEvents, visitsDelta: pct(visits, pVisits), commsDelta: pct(comms, pComms), usersDelta: pct(users, pUsers), avgEventsDelta: null, dowCounts };
};

export const getAnalyticsMonthly = async (days = 90) => {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await supabase.from('activity_log').select('event_type, created_at').gte('created_at', since);
  const rows = (error ? [] : data) || [];

  const map = {};
  rows.forEach((r) => {
    const m = new Date(r.created_at).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    if (!map[m]) map[m] = { month: m, visits: 0, comms: 0 };
    if (r.event_type === 'login') map[m].visits++;
    if (r.event_type === 'comm_generated') map[m].comms++;
  });

  return Object.values(map).sort((a, b) => new Date('1 ' + a.month) - new Date('1 ' + b.month));
};

export const getAnalyticsTopEvents = async (days = 90) => {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await supabase.from('activity_log').select('metadata').eq('event_type', 'comm_generated').gte('created_at', since);
  const rows = (error ? [] : data) || [];

  const counts = {};
  rows.forEach((r) => {
    (r.metadata?.eventTitles || []).forEach((title) => {
      counts[title] = (counts[title] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
};

export const getAnalyticsUserBreakdown = async (days = 90) => {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await supabase.from('activity_log').select('event_type, user_email, user_name, user_role, metadata, created_at').gte('created_at', since);
  const rows = (error ? [] : data) || [];

  const map = {};
  rows.forEach((r) => {
    const key = r.user_email || 'unknown';
    if (!map[key]) map[key] = { email: key, name: r.user_name || key, role: r.user_role || '—', visits: 0, comms: 0, totalEvents: 0, lastActive: null };
    if (r.event_type === 'login') map[key].visits++;
    if (r.event_type === 'comm_generated') {
      map[key].comms++;
      map[key].totalEvents += r.metadata?.eventCount || 0;
    }
    if (!map[key].lastActive || r.created_at > map[key].lastActive) map[key].lastActive = r.created_at;
  });

  return Object.values(map)
    .map((u) => ({ ...u, avgEvents: u.comms ? (u.totalEvents / u.comms).toFixed(1) : null }))
    .sort((a, b) => b.comms - a.comms);
};

export const archiveExpiredEvents = async () => {
  const today = new Date().toISOString().split('T')[0];
  // Find all Active events whose end_date (or start_date if no end) is before today
  const { data, error } = await supabase
    .from('events')
    .select('id, start_date, end_date')
    .eq('status', 'Active');

  if (error || !data) return;

  const expiredIds = data
    .filter(row => {
      const dateToCheck = row.end_date || row.start_date;
      return dateToCheck && dateToCheck < today;
    })
    .map(row => row.id);

  if (expiredIds.length === 0) return;

  await supabase
    .from('events')
    .update({ status: 'Archived' })
    .in('id', expiredIds);
};
