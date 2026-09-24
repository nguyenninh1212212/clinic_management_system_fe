// src/components/layout/TopBar.tsx
import React, { useState } from 'react';
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import LockResetIcon from '@mui/icons-material/LockReset';
import { NotificationBell } from './NotificationBell';
import { useAuthStore } from '@/stores/auth.store';
import { StatusChip } from '@/components/common/StatusChip';
import { authApi } from '@/api/endpoints/auth.api';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

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
      // Ignore network errors on logout
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      className="bg-white/95 backdrop-blur border-b border-slate-200 z-10"
    >
      <Toolbar className="px-4 sm:px-6 min-h-[60px] flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand / Breadcrumb */}
        <div className="flex items-center gap-3">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onToggleSidebar}
            className="md:hidden text-slate-700"
          >
            <MenuIcon />
          </IconButton>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Phòng khám Đa khoa Quốc tế</span>
            <span>·</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Hệ thống vận hành
            </span>
          </div>
        </div>
        {/* Right: Notification Bell & User Account */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          <Divider orientation="vertical" flexItem className="h-6 my-auto bg-slate-200" />

          <button
            onClick={handleOpenUserMenu}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <Avatar
              src={user?.avatar}
              alt={user?.fullName || user?.email}
              sx={{ width: 34, height: 34, bgcolor: '#0284c7' }}
              className="text-xs font-semibold text-white"
            >
              {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <div className="hidden md:flex flex-col text-left">
              <Typography variant="body2" className="font-semibold text-slate-900 leading-tight text-xs">
                {user?.fullName || user?.email?.split('@')[0]}
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
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: { width: 230, borderRadius: 3, mt: 1 },
              },
            }}
          >
            <Box className="px-4 py-2 border-b border-slate-100">
              <Typography variant="subtitle2" className="font-semibold text-slate-900 text-xs">
                {user?.fullName || 'Tài khoản'}
              </Typography>
              <Typography variant="caption" className="text-slate-500 truncate block">
                {user?.email}
              </Typography>
            </Box>

            <MenuItem
              onClick={() => {
                handleCloseUserMenu();
                navigate('/dashboard');
              }}
              className="text-xs py-2 text-slate-700"
            >
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              Bảng điều khiển
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} className="text-xs py-2 text-rose-600">
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
