// src/features/notifications/pages/NotificationsPage.tsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { useListFilters } from "@/hooks/useListFilters";
import {
  useNotifications,
  useMarkNotificationRead,
  useDeleteNotification,
} from "../hooks/useNotifications";
import { CreateNotificationDto, Notification, NotificationQueryParams } from "@/types";
import dayjs from "dayjs";
import { createNotificationSocket } from "@/features/notifications/service/notificationSocketService";
import type { NotificationPayload } from "@/features/notifications/service/notificationSocketService";
import { selectAccessToken, useAuthStore } from "@/stores/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const { filters, replaceFilters } =
    useListFilters<Omit<NotificationQueryParams, "page" | "limit">>();

  const { data, isLoading } = useNotifications({ page, limit, ...filters });
  const markReadMutation = useMarkNotificationRead();
  const deleteMutation = useDeleteNotification();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);
  const [createForm, setCreateForm] = useState<CreateNotificationDto>({
    userId: "",
    title: "",
    message: "",
    type: "SYSTEM",
    link: "",
  });

  const token = useAuthStore(selectAccessToken);

  const handleNotification = useCallback(
    (payload: NotificationPayload) => {
      if (payload.id == null) return;
      queryClient.setQueriesData({ queryKey: queryKeys.notifications.all }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data)) return cached;
        const exists = cached.data.some((item: Notification) => item.id === payload.id);
        if (exists) return { ...cached, data: cached.data.map((item: Notification) => item.id === payload.id ? { ...item, ...payload } : item) };
        if (!payload.createdAt || payload.isRead === undefined || !payload.userId || cached.pagination?.page !== 1) return cached;
        return { ...cached, data: [{ ...payload } as Notification, ...cached.data].slice(0, cached.pagination.limit), pagination: { ...cached.pagination, total: cached.pagination.total + 1 } };
      });
    },
    [queryClient],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync([deleteTarget.id]);
    setDeleteTarget(null);
  };

  useEffect(() => {
    if (!token) return;

    const socket = createNotificationSocket(token, handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [token, handleNotification]);
  const columns: Column<Notification>[] = [
    {
      id: "status",
      label: "",
      filterFields: [{ key: "isRead", label: "Đã đọc", type: "boolean" }],
      minWidth: 40,
      render: (row) =>
        !row.isRead ? (
          <span
            className="w-2.5 h-2.5 rounded-full bg-sky-600 block"
            title="Chưa đọc"
          />
        ) : (
          <span
            className="w-2.5 h-2.5 rounded-full bg-slate-300 block"
            title="Đã đọc"
          />
        ),
    },
    {
      id: "title",
      label: "Nội dung thông báo",
      filterFields: [
        { key: "search", label: "Tìm thông báo", type: "input" },
        { key: "type", label: "Loại thông báo", type: "input" },
      ],
      minWidth: 320,
      render: (row) => (
        <div
          onClick={() => {
            if (!row.isRead) markReadMutation.mutate(row.id);
            if (row.link) navigate(row.link);
          }}
          className="cursor-pointer group"
        >
          <div
            className={`text-sm ${
              !row.isRead
                ? "font-bold text-slate-900 group-hover:text-sky-600"
                : "font-medium text-slate-700"
            }`}
          >
            {row.title}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{row.message}</div>
        </div>
      ),
    },
    {
      id: "createdAt",
      label: "Thời gian gửi",
      filterFields: [
        { key: "dateFrom", label: "Từ ngày", type: "date" },
        { key: "dateTo", label: "Đến ngày", type: "date" },
      ],
      minWidth: 150,
      render: (row) => (
        <span className="tabular-nums text-xs text-slate-500">
          {dayjs(row.createdAt).format("HH:mm DD/MM/YYYY")}
        </span>
      ),
    },
    {
      id: "actions",
      label: "Thao tác",
      align: "right",
      minWidth: 100,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {!row.isRead && (
            <Tooltip title="Đánh dấu đã đọc">
              <IconButton
                size="small"
                onClick={() => markReadMutation.mutate(row.id)}
                className="text-slate-500 hover:text-emerald-600"
              >
                <CheckCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Xóa thông báo">
            <IconButton
              size="small"
              onClick={() => setDeleteTarget(row)}
              className="text-slate-400 hover:text-rose-600"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Trung tâm Thông báo"
        subtitle="Thông báo hệ thống, nhắc nhở lịch hẹn và cảnh báo tồn kho dược"
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Thông báo" },
        ]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Tạo thông báo
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        pagination={data?.pagination}
        filters={filters}
        onFilterChange={(nextFilters) => {
          replaceFilters(nextFilters);
          setPage(1);
        }}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        emptyTitle="Không có thông báo nào"
        emptyDescription="Bạn đã đọc hết các thông báo hệ thống."
      />


      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa thông báo"
        content={`Bạn có chắc muốn xóa thông báo “${deleteTarget?.title || ""}”?`}
        confirmText="Xóa thông báo"
        isLoading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
