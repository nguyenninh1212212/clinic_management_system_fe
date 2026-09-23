// src/routes/RoleRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types';
import { Alert, Box, Button } from '@mui/material';

interface RoleRouteProps {
  roles: UserRole[];
  children: React.ReactElement;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ roles, children }) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = roles.includes(user.role);

  if (!hasAccess) {
    return (
      <Box className="p-8 max-w-lg mx-auto text-center">
        <Alert severity="error" className="mb-4">
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ Quản trị viên (Super Admin).
        </Alert>
        <Button variant="outlined" onClick={() => window.history.back()}>
          Quay lại
        </Button>
      </Box>
    );
  }

  return children;
};
