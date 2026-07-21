import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { findUserByEmail } from '../lib/supabaseData';

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

  const login = async (email, password) => {
    console.log('UserContext.login: calling signInWithPassword');

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

    console.log('UserContext.login: result', { data, error });

    if (error) {
      return { success: false, error: error.message };
    }

    try {
      const userPromise = findUserByEmail(data.user.email);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('User lookup timed out. Please try again.')), 10000)
      );
      const user = await Promise.race([userPromise, timeoutPromise]);
      console.log('UserContext.login: findUserByEmail result', user);
      if (!user) {
        await supabase.auth.signOut();
        return { success: false, error: 'Account not found or inactive. Contact an administrator.' };
      }
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (err) {
      console.error('UserContext.login: findUserByEmail error', err);
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
