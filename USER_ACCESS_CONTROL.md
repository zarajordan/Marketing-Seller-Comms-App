# User Access Control System

## Overview
The UKI IBM Marketing Comms app now includes a comprehensive user access control system that allows administrators to manage user permissions and control which tabs users can access.

## Features

### 1. Role-Based Access Control (RBAC)
Five predefined roles with different permission levels:

#### Administrator
- **Full access** to all features and tabs
- Can manage users and permissions
- Can access the User Access tab
- Color: Red tag

#### Manager
- Can create and manage content
- Can manage events
- Access to most features except User Access
- Color: Purple tag

#### Editor
- Can create and edit communications
- Can use templates and event library
- Cannot manage events or access dashboard
- Color: Blue tag

#### Seller
- Can create communications from events
- Can save and manage their own drafts
- Access to Event Library and Create Comm
- Focused role for sales teams
- Color: Cyan tag

#### Viewer
- Read-only access
- Can view templates and event library
- Can access their own drafts
- Cannot create new content
- Color: Green tag

### 2. Default Permissions by Role

| Tab | Admin | Manager | Editor | Seller | Viewer |
|-----|-------|---------|--------|--------|--------|
| Create Comm | ✅ | ✅ | ✅ | ✅ | ❌ |
| Marketing Spotlight | ✅ | ✅ | ✅ | ❌ | ❌ |
| Templates | ✅ | ✅ | ✅ | ❌ | ✅ |
| Event Library | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Events | ✅ | ✅ | ❌ | ❌ | ❌ |
| My Drafts | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Access | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3. Custom Permissions
Administrators can override default role permissions for individual users:
- Fine-grained control over each tab
- Permissions persist across sessions
- Can reset to role defaults at any time

## User Management

### Adding Users
1. Navigate to the **User Access** tab (admin only)
2. Click **Add User** button
3. Fill in:
   - Full Name (required)
   - Email Address (required)
   - Role (required)
   - Active Status (toggle)
4. Click **Add User**

### Editing Users
1. Click the **Edit** icon (pencil) next to a user
2. Modify user details
3. Click **Save Changes**

### Managing Permissions
1. Click the **View Permissions** icon (eye) next to a user
2. Toggle permissions for each tab
3. Use **Reset to Default Permissions** to restore role defaults
4. Click **Save Permissions**

### Activating/Deactivating Users
- Click the **Lock/Unlock** icon to toggle user status
- Inactive users cannot log in
- Their data is preserved

### Deleting Users
- Click the **Delete** icon (trash can)
- Confirm deletion
- User data is permanently removed

## User Interface Features

### Header Display
- Current user's name and role displayed in header
- Role shown with color-coded tag
- Quick visual identification of access level

### User Switching (Development Feature)
- Click the **Switcher** icon in header
- Cycles through all active users
- Useful for testing different permission levels
- Shows toast notification with new user info

### Dynamic Tab Display
- Only accessible tabs are shown
- Tab order maintained based on permissions
- Seamless user experience

### No Access Message
- Displayed when user has no accessible tabs
- Clear instructions to contact administrator

## Technical Implementation

### Components
- **UserAccessTab.js**: Main user management interface
- **UserContext.js**: Context provider for authentication and permissions
- **App.js**: Integrated access control logic

### Data Storage
- Users stored in `localStorage` under key `app_users`
- Session stored in `localStorage` under key `app_session`
- Permissions stored with each user object

### Context API
The `UserContext` provides:
- `currentUser`: Current logged-in user object
- `isAuthenticated`: Boolean authentication status
- `hasPermission(tabId)`: Check if user can access a tab
- `hasRole(role)`: Check if user has a specific role
- `switchUser(userId)`: Switch to different user
- `getAccessibleTabs()`: Get list of accessible tab IDs

## Usage Examples

### Checking Permissions in Components
```javascript
import { useUser } from '../contexts/UserContext';

function MyComponent() {
  const { hasPermission, currentUser } = useUser();
  
  if (!hasPermission('create-comm')) {
    return <div>Access Denied</div>;
  }
  
  return <div>Welcome, {currentUser.name}!</div>;
}
```

### Conditional Rendering
```javascript
const { hasRole } = useUser();

{hasRole('admin') && (
  <Button>Admin Only Feature</Button>
)}
```

## Security Considerations

### Current Implementation
- Client-side access control
- Suitable for internal tools and demos
- Data stored in browser localStorage

### Production Recommendations
1. **Backend Authentication**: Implement server-side authentication
2. **JWT Tokens**: Use secure token-based authentication
3. **API Authorization**: Validate permissions on backend
4. **Encrypted Storage**: Use secure storage mechanisms
5. **Session Management**: Implement proper session handling
6. **Audit Logging**: Track user actions and permission changes

## Default Setup

### Initial Admin User
On first load, a default admin user is created:
- **Name**: Admin User
- **Email**: admin@ibm.com
- **Role**: Administrator
- **Status**: Active
- **Permissions**: Full access

### Auto-Login (Development)
- App automatically logs in as admin user
- Remove in production environment
- Replace with proper login flow

## Best Practices

### For Administrators
1. Create users with appropriate roles first
2. Only customize permissions when necessary
3. Regularly review user access
4. Deactivate users instead of deleting when possible
5. Use descriptive names and valid email addresses

### For Developers
1. Always check permissions before rendering sensitive content
2. Use `hasPermission()` for tab-level access
3. Use `hasRole()` for feature-level access
4. Handle cases where users have no permissions
5. Test with different user roles

## Troubleshooting

### User Can't Access Any Tabs
- Check if user is active
- Verify role has default permissions
- Check custom permissions haven't disabled all tabs
- Reset to default permissions

### Changes Not Reflecting
- Refresh the page
- Check localStorage for data persistence
- Clear browser cache if needed

### User Switching Not Working
- Ensure multiple active users exist
- Check console for errors
- Verify localStorage data integrity

## Future Enhancements

Potential improvements:
- Login/logout functionality
- Password management
- Multi-factor authentication
- Permission groups/teams
- Activity logging
- Email notifications
- User profile management
- Bulk user operations
- CSV import/export
- Advanced filtering and search

## Support

For issues or questions:
1. Check this documentation
2. Review console logs for errors
3. Verify localStorage data
4. Test with different user roles
5. Contact system administrator

---

**Version**: 1.0  
**Last Updated**: 2026-05-15  
**Created by**: Bob