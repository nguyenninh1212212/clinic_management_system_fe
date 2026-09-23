// src/components/layout/NotificationBell.tsx
import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/endpoints/notifications.api';
import { queryKeys } from '@/api/queryKeys';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications.list({ page: 1, limit: 8 }),
    queryFn: () => notificationsApi.findAll({ page: 1, limit: 8 }),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      const prevData = queryClient.getQueryData(queryKeys.notifications.list({ page: 1, limit: 8 }));
      queryClient.setQueryData(
        queryKeys.notifications.list({ page: 1, limit: 8 }),
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((item: any) =>
              item.id === id ? { ...item, isRead: true } : item,
            ),
          };
        },
      );
      return { prevData };
    },
    onError: (_err, _id, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(
          queryKeys.notifications.list({ page: 1, limit: 8 }),
          context.prevData,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (id: number, link?: string) => {
    markReadMutation.mutate(id);
    handleClose();
    if (link) {
      navigate(link);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        aria-label="thông báo"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { width: 340, maxHeight: 440, borderRadius: 3, mt: 1 },
        }}
      >
        <Box className="px-4 py-2.5 flex items-center justify-between">
          <Typography variant="subtitle2" className="font-bold text-slate-800">
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-medium">
              {unreadCount} mới
            </span>
          )}
        </Box>
        <Divider />

        {isLoading ? (
          <Box className="py-6 flex justify-center">
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box className="py-8 text-center text-slate-400 text-xs">
            Chưa có thông báo nào
          </Box>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleNotificationClick(n.id, n.link)}
              className={`px-4 py-2.5 flex flex-col items-start border-b border-slate-50 transition-colors ${
                !n.isRead ? 'bg-sky-50/50 hover:bg-sky-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between w-full gap-2">
                <Typography
                  variant="body2"
                  className={`text-xs ${!n.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}
                >
                  {n.title}
                </Typography>
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0 mt-1" />
                )}
              </div>
              <Typography variant="caption" className="text-slate-500 line-clamp-2 mt-0.5">
                {n.message}
              </Typography>
              <Typography variant="caption" className="text-slate-400 text-[10px] mt-1">
                {dayjs(n.createdAt).fromNow()}
              </Typography>
            </MenuItem>
          ))
        )}

        <Divider />
        <Box className="p-2 text-center">
          <Button
            size="small"
            fullWidth
            onClick={() => {
              handleClose();
              navigate('/notifications');
            }}
            className="text-xs font-medium text-sky-700"
          >
            Xem tất cả thông báo
          </Button>
        </Box>
      </Menu>
    </>
  );
};
