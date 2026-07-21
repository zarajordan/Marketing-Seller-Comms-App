import React, { useState, useEffect } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  Modal,
  TextInput,
  Select,
  SelectItem,
  Tag,
  Search,
  Tile,
  Grid,
  Column,
  Toggle,
  InlineLoading,
} from '@carbon/react';
import {
  Add,
  Edit,
  TrashCan,
  UserAdmin,
  View,
  Locked,
  Unlocked,
} from '@carbon/icons-react';
import { toast } from 'react-toastify';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  replaceMarketerPermissions,
  ROLE_CONFIG,
  TAB_PERMISSIONS,
  getDefaultPermissions,
} from '../lib/supabaseData';
import { useUser } from '../contexts/UserContext';

const TABS = [
  { id: 'create-comm', label: 'Create Comm', description: 'Create and send communications' },
  { id: 'marketing-spotlight', label: 'Marketing Spotlight', description: 'Create marketing spotlight content' },
  { id: 'templates', label: 'Templates', description: 'View and use templates' },
  { id: 'event-library', label: 'Event Library', description: 'Browse event library' },
  { id: 'manage-events', label: 'Manage Events', description: 'Create and manage events' },
  { id: 'drafts', label: 'My Drafts', description: 'View and edit drafts' },
  { id: 'user-access', label: 'User Access', description: 'Manage user permissions' },
];

const ROLES = Object.entries(ROLE_CONFIG).map(([id, cfg]) => ({ id, ...cfg }));

const UserAccessTab = () => {
  const { hasRole } = useUser();
  const isAdminManager = hasRole('admin-manager');

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'marketer', active: true });
  const [customPermissions, setCustomPermissions] = useState({});

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await listUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            u.role.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, users]);

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      toast.error('A user with this email already exists');
      return;
    }

    setSaving(true);
    try {
      await createUser(newUser);
      await fetchUsers();
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', role: 'marketer', active: true });
      toast.success('User added successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to add user');
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser.name.trim() || !selectedUser.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await updateUser(selectedUser);
      await fetchUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
      toast.success('User updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setSaving(true);
    try {
      await deleteUser(user);
      await fetchUsers();
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    setSaving(true);
    try {
      await updateUser({ ...user, active: !user.active });
      await fetchUsers();
      toast.success('User status updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    } finally {
      setSaving(false);
    }
  };

  const openPermissionsModal = (user) => {
    setSelectedUser(user);
    setCustomPermissions(user.permissions || getDefaultPermissions(user.role));
    setIsPermissionsModalOpen(true);
  };

  const handlePermissionChange = (tabId, value) => {
    setCustomPermissions({ ...customPermissions, [tabId]: value });
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      await replaceMarketerPermissions(selectedUser, customPermissions);
      await fetchUsers();
      setIsPermissionsModalOpen(false);
      setSelectedUser(null);
      toast.success('Permissions updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaultPermissions = () => {
    if (selectedUser) {
      setCustomPermissions(getDefaultPermissions(selectedUser.role));
      toast.info('Reset to default permissions for ' + selectedUser.role);
    }
  };

  const getRoleColor = (role) => ROLE_CONFIG[role]?.color || 'gray';
  const getRoleLabel = (role) => ROLE_CONFIG[role]?.label || role;

  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = filteredUsers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: (
      <Tag type={getRoleColor(user.role)} size="sm">
        {getRoleLabel(user.role)}
      </Tag>
    ),
    status: (
      <Tag type={user.active ? 'green' : 'gray'} size="sm">
        {user.active ? 'Active' : 'Inactive'}
      </Tag>
    ),
    actions: (
      <div style={{ display: 'flex', gap: '8px' }}>
        {user.role === 'marketer' && (
          <Button
            kind="ghost"
            size="sm"
            renderIcon={View}
            iconDescription="Manage Permissions"
            hasIconOnly
            onClick={() => openPermissionsModal(user)}
            disabled={!isAdminManager}
          />
        )}
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Edit}
          iconDescription="Edit User"
          hasIconOnly
          onClick={() => {
            setSelectedUser(user);
            setIsEditModalOpen(true);
          }}
          disabled={!isAdminManager}
        />
        <Button
          kind="ghost"
          size="sm"
          renderIcon={user.active ? Locked : Unlocked}
          iconDescription={user.active ? 'Deactivate' : 'Activate'}
          hasIconOnly
          onClick={() => handleToggleActive(user)}
          disabled={!isAdminManager}
        />
        <Button
          kind="danger--ghost"
          size="sm"
          renderIcon={TrashCan}
          iconDescription="Delete User"
          hasIconOnly
          onClick={() => handleDeleteUser(user)}
          disabled={!isAdminManager}
        />
      </div>
    ),
  }));

  return (
    <div className="user-access-tab">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '8px' }}>User Access Management</h2>
        <p style={{ color: '#525252', marginBottom: '24px' }}>
          Manage user roles and tab access permissions
        </p>

        <Grid narrow>
          <Column lg={8} md={6} sm={4}>
            <Search
              placeholder="Search users by name, email, or role..."
              labelText="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </Column>
          <Column lg={8} md={2} sm={4}>
            <Button
              renderIcon={Add}
              onClick={() => setIsAddModalOpen(true)}
              style={{ width: '100%' }}
              disabled={!isAdminManager}
            >
              Add User
            </Button>
          </Column>
        </Grid>
      </div>

      <Tile style={{ marginBottom: '24px', padding: '16px' }}>
        <h4 style={{ marginBottom: '12px' }}>Role Definitions</h4>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {ROLES.map((role) => (
            <div key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag type={role.color} size="sm">{role.label}</Tag>
              <span style={{ fontSize: '14px', color: '#525252' }}>
                {role.id === 'admin-manager' && 'Full access to all tabs and user management'}
                {role.id === 'marketer' && 'Tab access assigned individually by admin manager'}
                {role.id === 'seller' && 'Event Library access only'}
              </span>
            </div>
          ))}
        </div>
      </Tile>

      {loadingUsers ? (
        <InlineLoading description="Loading users..." />
      ) : (
        <>
          <DataTable rows={rows} headers={headers}>
            {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataTable>

          {filteredUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#525252' }}>
              <UserAdmin size={48} style={{ marginBottom: '16px' }} />
              <p>No users found</p>
            </div>
          )}
        </>
      )}

      {/* Add User Modal */}
      <Modal
        open={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        modalHeading="Add New User"
        primaryButtonText={saving ? 'Adding...' : 'Add User'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleAddUser}
      >
        <div style={{ marginBottom: '16px' }}>
          <TextInput
            id="new-user-name"
            labelText="Full Name *"
            placeholder="Enter user's full name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <TextInput
            id="new-user-email"
            labelText="Email Address *"
            placeholder="user@ibm.com"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <Select
            id="new-user-role"
            labelText="Role *"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            {ROLES.map((role) => (
              <SelectItem key={role.id} value={role.id} text={role.label} />
            ))}
          </Select>
        </div>
        <div>
          <Toggle
            id="new-user-active"
            labelText="Active Status"
            labelA="Inactive"
            labelB="Active"
            toggled={newUser.active}
            onToggle={(checked) => setNewUser({ ...newUser, active: checked })}
          />
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={isEditModalOpen}
        onRequestClose={() => { setIsEditModalOpen(false); setSelectedUser(null); }}
        modalHeading="Edit User"
        primaryButtonText={saving ? 'Saving...' : 'Save Changes'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleEditUser}
      >
        {selectedUser && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <TextInput
                id="edit-user-name"
                labelText="Full Name *"
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <TextInput
                id="edit-user-email"
                labelText="Email Address *"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Select
                id="edit-user-role"
                labelText="Role *"
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
              >
                {ROLES.map((role) => (
                  <SelectItem key={role.id} value={role.id} text={role.label} />
                ))}
              </Select>
            </div>
            <div>
              <Toggle
                id="edit-user-active"
                labelText="Active Status"
                labelA="Inactive"
                labelB="Active"
                toggled={selectedUser.active}
                onToggle={(checked) => setSelectedUser({ ...selectedUser, active: checked })}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Permissions Modal — marketer only */}
      <Modal
        open={isPermissionsModalOpen}
        onRequestClose={() => { setIsPermissionsModalOpen(false); setSelectedUser(null); }}
        modalHeading={`Manage Permissions — ${selectedUser?.name}`}
        primaryButtonText={saving ? 'Saving...' : 'Save Permissions'}
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSavePermissions}
        size="lg"
      >
        {selectedUser && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <Button kind="tertiary" size="sm" onClick={resetToDefaultPermissions}>
                Reset to Default Permissions
              </Button>
            </div>
            <div style={{ marginTop: '24px' }}>
              <h5 style={{ marginBottom: '16px' }}>Tab Access Permissions</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {TABS.map((tab) => (
                  <div
                    key={tab.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{tab.label}</div>
                      <div style={{ fontSize: '12px', color: '#525252' }}>{tab.description}</div>
                    </div>
                    <Toggle
                      id={`permission-${tab.id}`}
                      labelText=""
                      hideLabel
                      toggled={customPermissions[tab.id] || false}
                      onToggle={(checked) => handlePermissionChange(tab.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UserAccessTab;
