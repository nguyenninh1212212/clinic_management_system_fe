// src/components/layout/NotificationBell.tsx
import React, { useEffect, useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/endpoints/notifications.api";
import { queryKeys } from "@/api/queryKeys";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { createNotificationSocket } from "@/features/notifications/service/notificationSocketService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!token) return;
    const handleNotification = () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    };
    const socket = createNotificationSocket(token, handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [queryClient, token]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [...queryKeys.notifications.all, "bell"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      notificationsApi.findAll({ page: pageParam, limit: 8 }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  const notifications = data?.pages.flatMap((page) => page.data) || [];
  const unreadCount =
    data?.pages[0]?.unRead ?? notifications.filter((n) => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.all },
        (cached: any) => {
          if (cached?.pages) {
            return {
              ...cached,
              pages: cached.pages.map((page: any) => ({
                ...page,
                data: page.data.map((item: any) =>
                  item.id === id ? { ...item, isRead: true } : item,
                ),
              })),
            };
          }
          return cached && Array.isArray(cached.data)
            ? {
                ...cached,
                data: cached.data.map((item: any) =>
                  item.id === id ? { ...item, isRead: true } : item,
                ),
              }
            : cached;
        },
      );
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

  const handleNotificationsScroll = (
    event: React.UIEvent<HTMLDivElement>,
  ) => {
    const list = event.currentTarget;
    const nearBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 24;
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        className="text-slate-600 hover: hover:bg-slate-100"
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
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: { sx: { width: 340, maxHeight: 440, borderRadius: 3, mt: 1 } },
        }}
      >
        <Box className="px-4 py-2.5 flex items-center justify-between">
          <Typography variant="subtitle2" className="font-bold ">
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
          <Box
            className="max-h-90 overflow-y-auto"
            onScroll={handleNotificationsScroll}
          >
            {notifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleNotificationClick(n.id, n.link)}
              className={`px-4 py-2.5 flex flex-col  border-b border-slate-50 transition-colors ${
                !n.isRead ? "bg-sky-50/50 hover:bg-sky-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <Typography
                  variant="body2"
                  className="min-w-0 flex-1 whitespace-normal break-words text-xs leading-5"
                >
                  {n.title}
                </Typography>
                {!n.isRead && (
                  <IconButton
                    size="small"
                    aria-label="Đánh dấu đã đọc"
                    title="Đánh dấu đã đọc"
                    onClick={(event) => {
                      event.stopPropagation();
                      markReadMutation.mutate(n.id);
                    }}
                    className="-mr-1 -mt-1 shrink-0 text-sky-600 hover:text-emerald-600"
                  >
                    <CheckCircleOutlineIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
              <div className="flex w-full flex-col gap-2">
                <Typography
                  variant="caption"
                  className="mt-0.5 whitespace-normal break-words leading-5"
                >
                  {n.message}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-slate-400 text-[10px] mt-1"
                >
                  {dayjs(n.createdAt).fromNow()}
                </Typography>
              </div>
            </MenuItem>
            ))}
            {isFetchingNextPage && (
              <Box className="flex justify-center py-3">
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>
        )}

      </Menu>
    </>
  );
};
