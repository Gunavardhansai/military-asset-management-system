import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export const ProtectedRoute = ({ children }) => {
  const { user, loading, getMe } = useAuth();
  const [checkingSession, setCheckingSession] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      const token = localStorage.getItem('token');

      if (!token || user) {
        if (mounted) setCheckingSession(false);
        return;
      }

      await getMe();
      if (mounted) setCheckingSession(false);
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, [getMe, user]);

  if (checkingSession || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-b-emerald-700" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
