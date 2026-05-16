import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

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

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize user session
  useEffect(() => {
    // First, ensure we have users in localStorage
    let users = JSON.parse(localStorage.getItem('app_users') || '[]');
    
    // If no users exist, create default admin user
    if (users.length === 0) {
      const defaultAdmin = {
        id: '1',
        name: 'Admin User',
        email: 'admin@ibm.com',
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString(),
        permissions: DEFAULT_PERMISSIONS.admin,
      };
      users = [defaultAdmin];
      localStorage.setItem('app_users', JSON.stringify(users));
    }

    // Now check for existing session
    const savedSession = localStorage.getItem('app_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const user = users.find((u) => u.id === session.userId);
        
        if (user && user.active) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        } else {
          // Clear invalid session
          localStorage.removeItem('app_session');
        }
      } catch (error) {
        console.error('Error loading session:', error);
        localStorage.removeItem('app_session');
      }
    }
    
    // Auto-login as admin for development (remove in production)
    const adminUser = users.find((u) => u.role === 'admin' && u.active);
    
    if (adminUser) {
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem('app_session', JSON.stringify({ userId: adminUser.id }));
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.active
    );

    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('app_session', JSON.stringify({ userId: user.id }));
      return { success: true, user };
    }

    return { success: false, error: 'Invalid credentials or inactive account' };
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('app_session');
  };

  // Switch user (for testing/demo purposes)
  const switchUser = (userId) => {
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const user = users.find((u) => u.id === userId && u.active);

    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('app_session', JSON.stringify({ userId: user.id }));
      return true;
    }
    return false;
  };

  // Check if user has permission for a specific tab
  const hasPermission = (tabId) => {
    if (!currentUser) return false;
    
    // Use custom permissions if available, otherwise use role defaults
    const permissions = currentUser.permissions || DEFAULT_PERMISSIONS[currentUser.role];
    return permissions[tabId] === true;
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!currentUser) return false;
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  };

  // Get user's accessible tabs
  const getAccessibleTabs = () => {
    if (!currentUser) return [];
    
    const permissions = currentUser.permissions || DEFAULT_PERMISSIONS[currentUser.role];
    return Object.keys(permissions).filter((tabId) => permissions[tabId] === true);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout,
    switchUser,
    hasPermission,
    hasRole,
    getAccessibleTabs,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;

// Made with Bob
