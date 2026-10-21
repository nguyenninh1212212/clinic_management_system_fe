// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { isMedicalUser } from '@/features/auth/utils/medical-session';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, accessToken, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !accessToken || !isMedicalUser(user)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
