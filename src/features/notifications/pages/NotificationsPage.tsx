// src/features/notifications/pages/NotificationsPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/endpoints/notifications.api';
import { queryKeys } from '@/api/queryKeys';
import { notifyApiFeedback } from '@/api/axios';
import { Notification } from '@/types';
import dayjs from 'dayjs';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications.list({ page, limit }),
    queryFn: () => notificationsApi.findAll({ page, limit }),
    staleTime: 10_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      notifyApiFeedback('Đã xóa thông báo', 'info');
    },
  });

  const columns: Column<Notification>[] = [
    {
      id: 'status',
      label: '',
      minWidth: 40,
      render: (row) =>
        !row.isRead ? (
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 block" title="Chưa đọc" />
        ) : (
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 block" title="Đã đọc" />
        ),
    },
    {
      id: 'title',
      label: 'Nội dung thông báo',
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
                ? 'font-bold text-slate-900 group-hover:text-sky-600'
                : 'font-medium text-slate-700'
            }`}
          >
            {row.title}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{row.message}</div>
        </div>
      ),
    },
    {
      id: 'createdAt',
      label: 'Thời gian gửi',
      minWidth: 150,
      render: (row) => (
        <span className="tabular-nums text-xs text-slate-500">
          {dayjs(row.createdAt).format('HH:mm DD/MM/YYYY')}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
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
              onClick={() => deleteMutation.mutate(row.id)}
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
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Thông báo' }]}
      />

      <DataTable
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        pagination={data?.pagination}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        emptyTitle="Không có thông báo nào"
        emptyDescription="Bạn đã đọc hết các thông báo hệ thống."
      />
    </div>
  );
};
