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
  Checkbox,
  Tag,
  Search,
  Tile,
  Grid,
  Column,
  Toggle,
} from '@carbon/react';
import {
  Add,
  Edit,
  TrashCan,
  UserAdmin,
  User,
  View,
  Locked,
  Unlocked,
} from '@carbon/icons-react';
import { toast } from 'react-toastify';

const ROLES = [
  { id: 'admin', label: 'Administrator', color: 'red' },
  { id: 'manager', label: 'Manager', color: 'purple' },
  { id: 'editor', label: 'Editor', color: 'blue' },
  { id: 'seller', label: 'Seller', color: 'cyan' },
  { id: 'viewer', label: 'Viewer', color: 'green' },
];

const TABS = [
  { id: 'create-comm', label: 'Create Comm', description: 'Create and send communications' },
  { id: 'marketing-spotlight', label: 'Marketing Spotlight', description: 'Create marketing spotlight content' },
  { id: 'templates', label: 'Templates', description: 'View and use templates' },
  { id: 'event-library', label: 'Event Library', description: 'Browse event library' },
  { id: 'manage-events', label: 'Manage Events', description: 'Create and manage events' },
  { id: 'drafts', label: 'My Drafts', description: 'View and edit drafts' },
  { id: 'user-access', label: 'User Access', description: 'Manage user permissions' },
];

const DEFAULT_PERMISSIONS = {
  admin: {
    'create-comm': true,
    'marketing-spotlight': true,
    'templates': true,
    'event-library': true,
    'manage-events': true,
    'drafts': true,
    'user-access': true,
  },
  manager: {
    'create-comm': true,
    'marketing-spotlight': true,
    'templates': true,
    'event-library': true,
    'manage-events': true,
    'drafts': true,
    'user-access': false,
  },
  editor: {
    'create-comm': true,
    'marketing-spotlight': true,
    'templates': true,
    'event-library': true,
    'manage-events': false,
    'drafts': true,
    'user-access': false,
  },
  seller: {
    'create-comm': true,
    'marketing-spotlight': false,
    'templates': false,
    'event-library': true,
    'manage-events': false,
    'drafts': true,
    'user-access': false,
  },
  viewer: {
    'create-comm': false,
    'marketing-spotlight': false,
    'templates': true,
    'event-library': true,
    'manage-events': false,
    'drafts': true,
    'user-access': false,
  },
};

const UserAccessTab = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'viewer',
    active: true,
  });
  const [customPermissions, setCustomPermissions] = useState({});

  // Load users from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      setFilteredUsers(parsedUsers);
    } else {
      // Initialize with default admin user
      const defaultUsers = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@ibm.com',
          role: 'admin',
          active: true,
          createdAt: new Date().toISOString(),
          permissions: DEFAULT_PERMISSIONS.admin,
        },
      ];
      setUsers(defaultUsers);
      setFilteredUsers(defaultUsers);
      localStorage.setItem('app_users', JSON.stringify(defaultUsers));
    }
  }, []);

  // Filter users based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      toast.error('A user with this email already exists');
      return;
    }

    const user = {
      id: Date.now().toString(),
      ...newUser,
      createdAt: new Date().toISOString(),
      permissions: DEFAULT_PERMISSIONS[newUser.role],
    };

    const updatedUsers = [...users, user];
    saveUsers(updatedUsers);
    setIsAddModalOpen(false);
    setNewUser({ name: '', email: '', role: 'viewer', active: true });
    toast.success('User added successfully');
  };

  const handleEditUser = () => {
    if (!selectedUser.name.trim() || !selectedUser.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedUsers = users.map((u) =>
      u.id === selectedUser.id
        ? {
            ...selectedUser,
            permissions: selectedUser.permissions || DEFAULT_PERMISSIONS[selectedUser.role],
          }
        : u
    );
    saveUsers(updatedUsers);
    setIsEditModalOpen(false);
    setSelectedUser(null);
    toast.success('User updated successfully');
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter((u) => u.id !== userId);
      saveUsers(updatedUsers);
      toast.success('User deleted successfully');
    }
  };

  const handleToggleActive = (userId) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, active: !u.active } : u
    );
    saveUsers(updatedUsers);
    toast.success('User status updated');
  };

  const openPermissionsModal = (user) => {
    setSelectedUser(user);
    setCustomPermissions(user.permissions || DEFAULT_PERMISSIONS[user.role]);
    setIsPermissionsModalOpen(true);
  };

  const handlePermissionChange = (tabId, value) => {
    setCustomPermissions({
      ...customPermissions,
      [tabId]: value,
    });
  };

  const handleSavePermissions = () => {
    const updatedUsers = users.map((u) =>
      u.id === selectedUser.id
        ? { ...u, permissions: customPermissions }
        : u
    );
    saveUsers(updatedUsers);
    setIsPermissionsModalOpen(false);
    setSelectedUser(null);
    toast.success('Permissions updated successfully');
  };

  const resetToDefaultPermissions = () => {
    if (selectedUser) {
      setCustomPermissions(DEFAULT_PERMISSIONS[selectedUser.role]);
      toast.info('Reset to default permissions for ' + selectedUser.role);
    }
  };

  const getRoleColor = (role) => {
    const roleObj = ROLES.find((r) => r.id === role);
    return roleObj ? roleObj.color : 'gray';
  };

  const getRoleLabel = (role) => {
    const roleObj = ROLES.find((r) => r.id === role);
    return roleObj ? roleObj.label : role;
  };

  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Created' },
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
    createdAt: new Date(user.createdAt).toLocaleDateString(),
    actions: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={View}
          iconDescription="View Permissions"
          hasIconOnly
          onClick={() => openPermissionsModal(user)}
        />
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
        />
        <Button
          kind="ghost"
          size="sm"
          renderIcon={user.active ? Locked : Unlocked}
          iconDescription={user.active ? 'Deactivate' : 'Activate'}
          hasIconOnly
          onClick={() => handleToggleActive(user.id)}
        />
        <Button
          kind="danger--ghost"
          size="sm"
          renderIcon={TrashCan}
          iconDescription="Delete User"
          hasIconOnly
          onClick={() => handleDeleteUser(user.id)}
        />
      </div>
    ),
  }));

  return (
    <div className="user-access-tab">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '8px' }}>User Access Management</h2>
        <p style={{ color: '#525252', marginBottom: '24px' }}>
          Manage user roles and permissions for accessing different tabs and features
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
            >
              Add User
            </Button>
          </Column>
        </Grid>
      </div>

      {/* Role Legend */}
      <Tile style={{ marginBottom: '24px', padding: '16px' }}>
        <h4 style={{ marginBottom: '12px' }}>Role Definitions</h4>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {ROLES.map((role) => (
            <div key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag type={role.color} size="sm">
                {role.label}
              </Tag>
              <span style={{ fontSize: '14px', color: '#525252' }}>
                {role.id === 'admin' && 'Full access to all features'}
                {role.id === 'manager' && 'Can manage content and events'}
                {role.id === 'editor' && 'Can create and edit content'}
                {role.id === 'seller' && 'Can create comms from events and save drafts'}
                {role.id === 'viewer' && 'Read-only access'}
              </span>
            </div>
          ))}
        </div>
      </Tile>

      {/* Users Table */}
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

      {/* Add User Modal */}
      <Modal
        open={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        modalHeading="Add New User"
        primaryButtonText="Add User"
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
        onRequestClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        modalHeading="Edit User"
        primaryButtonText="Save Changes"
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
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, name: e.target.value })
                }
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <TextInput
                id="edit-user-email"
                labelText="Email Address *"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Select
                id="edit-user-role"
                labelText="Role *"
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
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
                onToggle={(checked) =>
                  setSelectedUser({ ...selectedUser, active: checked })
                }
              />
            </div>
          </>
        )}
      </Modal>

      {/* Permissions Modal */}
      <Modal
        open={isPermissionsModalOpen}
        onRequestClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedUser(null);
        }}
        modalHeading={`Manage Permissions - ${selectedUser?.name}`}
        primaryButtonText="Save Permissions"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSavePermissions}
        size="lg"
      >
        {selectedUser && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Role:</strong>{' '}
                <Tag type={getRoleColor(selectedUser.role)} size="sm">
                  {getRoleLabel(selectedUser.role)}
                </Tag>
              </p>
              <Button
                kind="tertiary"
                size="sm"
                onClick={resetToDefaultPermissions}
              >
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
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                        {tab.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#525252' }}>
                        {tab.description}
                      </div>
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

// Made with Bob
