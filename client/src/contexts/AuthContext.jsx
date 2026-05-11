import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/index.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  const register = useCallback(async (fullName, email, password, role, base) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(fullName, email, password, role, base);
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMe = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authService.getMe();
      setUser(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Get user error:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    getMe,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
