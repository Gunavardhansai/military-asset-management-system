import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export const ProtectedRoute = ({ children }) => {
  const { user, loading, getMe } = useAuth();

  useEffect(() => {
    if (!user && !loading) {
      getMe();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-military-600"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return children;
};
