// src/components/layout/TopBar.tsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import { NotificationBell } from "./NotificationBell";
import { useAuthStore } from "@/stores/auth.store";
import { StatusChip } from "@/components/common/StatusChip";
import { authApi } from "@/api/endpoints/auth.api";
import { useNavigate } from "react-router-dom";
import { useThemeMode } from "@/theme/ThemeModeProvider";

interface TopBarProps {
  onToggleSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  isDesktop: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  isDesktop,
}) => {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      await authApi.logout();
    } catch (err) {
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      className="backdrop-blur z-10 min-h-[72px]"
      sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar className="px-4 sm:px-6  flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isDesktop && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Mở menu điều hướng"
              onClick={onToggleSidebar}
              className="text-slate-700"
            >
              <MenuIcon />
            </IconButton>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Tooltip title={mode === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}>
            <IconButton
              onClick={toggleTheme}
              size="small"
              color="inherit"
              aria-label="Chuyển đổi màu giao diện"
            >
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
          <NotificationBell />

          <Divider
            orientation="vertical"
            flexItem
            className="h-6 my-auto bg-slate-200"
          />

          <button
            onClick={handleOpenUserMenu}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <Avatar
              src={user?.avatar}
              alt={user?.fullName || user?.email}
              sx={{ width: 34, height: 34, bgcolor: "primary.main" }}
              className="text-xs font-semibold text-white"
            >
              {user?.fullName?.charAt(0) ||
                user?.email?.charAt(0).toUpperCase() ||
                "U"}
            </Avatar>
            <div className="hidden md:flex flex-col text-left">
              <Typography
                variant="body2"
                className="font-semibold  leading-tight text-xs"
              >
                {user?.fullName || user?.email?.split("@")[0]}
              </Typography>
              <div className="mt-0.5">
                <StatusChip status={user?.role} type="role" />
              </div>
            </div>
          </button>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseUserMenu}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{
              paper: {
                sx: { width: 230, borderRadius: 3, mt: 1 },
              },
            }}
          >
            <Box className="px-4 py-2 border-b border-slate-100">
              <Typography
                variant="subtitle2"
                className="font-semibold  text-xs"
              >
                {user?.fullName || "Tài khoản"}
              </Typography>
              <Typography
                variant="caption"
                className="truncate block"
                sx={{color:"text.secondary"}}
              >
                {user?.email}
              </Typography>
            </Box>

            <MenuItem
              onClick={() => {
                handleCloseUserMenu();
                navigate("/dashboard");
              }}
              className="text-xs py-2 text-slate-700"
            >
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              Bảng điều khiển
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              className="text-xs py-2 text-rose-600"
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" className="text-rose-600" />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};
