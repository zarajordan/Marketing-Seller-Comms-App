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
      permissions[tabId] = tabId === 'event-library' || tabId === 'submit-event';
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
  location: row.location_details || row.location || '',
  ownerEmail: row.owner_email || '',
  // new fields
  startDate: row.start_date || row.event_date || '',
  endDate: row.end_date || '',
  eventTime: row.event_time || '',
  locationType: row.location_type || 'Virtual',
  locationDetails: row.location_details || row.location || '',
  contacts: row.contacts || [],
  briefSummary: row.brief_summary || row.description || '',
  detailedDescription: row.detailed_description || '',
  eventAgenda: row.event_agenda || '',
  registrationLink: row.registration_link || '',
  seismicLink: row.seismic_link || '',
  productAreas: row.product_areas || [],
  eventType: row.event_type || 'Webinar',
  targetAudience: row.target_audience || 'All',
  industry: row.industry || 'Cross-Industry',
  targetRoles: row.target_roles || [],
  otherRole: row.other_role || '',
  status: row.status || 'Active',
  postEventFollowUp: row.post_event_follow_up || '',
  category: row.category || 'ibm',
  regions: row.regions || [],
  inviteProcess: row.invite_process || '',
});

export const mapEventFormToRow = (event) => ({
  title: event.title,
  start_date: event.startDate || event.date || null,
  end_date: event.endDate || null,
  event_time: event.eventTime || null,
  location_type: event.locationType || 'Virtual',
  location_details: event.locationDetails || event.location || '',
  contacts: event.contacts || [],
  brief_summary: event.briefSummary || event.description || '',
  detailed_description: event.detailedDescription || '',
  event_agenda: event.eventAgenda || '',
  registration_link: event.registrationLink || '',
  seismic_link: event.seismicLink || '',
  product_areas: event.productAreas || [],
  event_type: event.eventType || 'Webinar',
  target_audience: event.targetAudience || 'All',
  industry: event.industry || 'Cross-Industry',
  target_roles: event.targetRoles || [],
  other_role: event.otherRole || '',
  status: event.status || 'Active',
  post_event_follow_up: event.postEventFollowUp || '',
  category: event.category || 'ibm',
  regions: event.regions || [],
  invite_process: event.inviteProcess || '',
  // keep legacy column populated for backwards compat
  description: event.briefSummary || event.description || '',
  event_date: event.startDate || event.date || null,
  location: event.locationDetails || event.location || '',
  owner_email: event.ownerEmail || null,
});

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
