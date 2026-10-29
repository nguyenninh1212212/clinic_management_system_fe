import React from "react";
import { Alert, Box, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { getPageAccess, hasAccess } from "./access-control";

export const PageAccessGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const rule = getPageAccess(pathname);

  if (rule && !hasAccess(user, rule)) {
    return (
      <Box className="mx-auto max-w-lg p-8 text-center">
        <Alert severity="error" className="mb-4">Bạn không có quyền truy cập trang này.</Alert>
        <Button variant="outlined" onClick={() => navigate("/dashboard", { replace: true })}>
          Về trang chủ
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};
