// /components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from './useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useSession();

  if (loading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/" />;

  return <>{children}</>;
};

export default ProtectedRoute;
