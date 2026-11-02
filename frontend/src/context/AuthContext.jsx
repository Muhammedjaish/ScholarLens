import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authAPI.getCurrentUser();
        if (response.success) {
          setUser(response.user);
        }
      } catch (err) {
        console.warn('Failed to load user profile with current token:', err.message);
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (username, password) => {
    const response = await authAPI.login({ username, password });
    if (response.success && response.token) {
      localStorage.setItem('auth_token', response.token);
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    if (response.success && response.token) {
      localStorage.setItem('auth_token', response.token);
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        setUser(response.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

