import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { findUserByEmail, logActivity } from '../lib/supabaseData';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordRecoveryMode, setPasswordRecoveryMode] = useState(false);

  useEffect(() => {
    // Safety net — never stay stuck on loading
    const timeout = setTimeout(() => setLoading(false), 5000);

    // Restore session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        try {
          const user = await findUserByEmail(session.user.email);
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error loading user from session:', error);
        }
      }
      clearTimeout(timeout);
      setLoading(false);
    });

    // Listen for auth changes (token refresh and sign out only)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' && session?.user?.email) {
        try {
          const user = await findUserByEmail(session.user.email);
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error loading user on token refresh:', error);
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecoveryMode(true);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setPasswordRecoveryMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Step 1 — checkEmail(): query users table and determine authStage.
  // Returns authStage 'seller' (direct access) or 'password' (needs Step 2).
  const checkEmail = async (email) => {
    try {
      const user = await findUserByEmail(email);
      if (user) {
      const role = (user.role || '').toLowerCase();
      // admin-manager and marketer need a password
      if (role !== 'seller' && role !== 'marketing') {
        return { authStage: 'password' };
      }
      // seller / marketing — direct access
      if (!user.active) {
        return { success: false, error: 'Account is inactive. Please contact an administrator.' };
      }
      setCurrentUser(user);
      setIsAuthenticated(true);
      logActivity('login', { userEmail: user.email, userName: user.name, userRole: user.role });
      return { authStage: 'seller', user };
    }

    // Not in the DB — treat as regular IBM employee, Event Library only
    const guestUser = {
      id: null,
      name: email.split('@')[0],
      email,
      role: 'seller',
      active: true,
      permissions: { 'event-library': true, 'client-stories': true, 'submit-partner-story': true, 'book-filming': true, 'social-tiles': true, 'csr': true },
    };
    setCurrentUser(guestUser);
    setIsAuthenticated(true);
    logActivity('login', { userEmail: guestUser.email, userName: guestUser.name, userRole: guestUser.role });
    return { authStage: 'seller', user: guestUser };
    } catch (err) {
      console.error('Error in checkEmail:', err);
      return { success: false, error: err.message || 'Unable to check email. Please try again.' };
    }
  };

  const login = async (email, password) => {
    const signInPromise = supabase.auth.signInWithPassword({ email, password });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Sign-in timed out. Please check your connection and try again.')), 15000)
    );

    let data, error;
    try {
      ({ data, error } = await Promise.race([signInPromise, timeoutPromise]));
    } catch (timeoutErr) {
      return { success: false, error: timeoutErr.message };
    }

    if (error) {
      return { success: false, error: error.message };
    }

    try {
      const userPromise = findUserByEmail(data.user.email);
      const timeoutPromise2 = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('User lookup timed out. Please try again.')), 10000)
      );
      const user = await Promise.race([userPromise, timeoutPromise2]);
      if (!user) {
        await supabase.auth.signOut();
        return { success: false, error: 'Account not found or inactive. Contact an administrator.' };
      }
      setCurrentUser(user);
      setIsAuthenticated(true);
      logActivity('login', { userEmail: user.email, userName: user.name, userRole: user.role });
      return { success: true, user };
    } catch (err) {
      await supabase.auth.signOut();
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, error: error.message };
    }
    setPasswordRecoveryMode(false);
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const switchUser = async (email, password) => {
    const result = await login(email, password);
    return result.success;
  };

  const hasPermission = (tabId) => {
    if (!currentUser) return false;
    return currentUser.permissions?.[tabId] === true;
  };

  const hasRole = (role) => {
    if (!currentUser) return false;
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  };

  const getAccessibleTabs = () => {
    if (!currentUser?.permissions) return [];
    return Object.keys(currentUser.permissions).filter((tabId) => currentUser.permissions[tabId] === true);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    passwordRecoveryMode,
    login,
    checkEmail,
    logout,
    resetPassword,
    updatePassword,
    switchUser,
    hasPermission,
    hasRole,
    getAccessibleTabs,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
