// src/features/audit-logs/pages/AuditLogListPage.tsx
import { Column, DataTable } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { AuditAction, AuditLog } from '@/types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useListFilters } from '@/hooks/useListFilters';
import { AuditLogQueryParams } from '@/types';

export const AuditLogListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { filters, replaceFilters } =
    useListFilters<Omit<AuditLogQueryParams, 'page' | 'limit'>>();

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading } = useAuditLogs({
    page,
    limit,
    ...filters,
  });

  const getActionBadge = (act: string) => {
    const actUpper = act.toUpperCase();
    if (actUpper.includes('CREATE') || actUpper.includes('POST')) {
      return (
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
          {act}
        </span>
      );
    }
    if (actUpper.includes('UPDATE') || actUpper.includes('PATCH') || actUpper.includes('PUT')) {
      return (
        <span className="text-xs font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
          {act}
        </span>
      );
    }
    if (actUpper.includes('DELETE')) {
      return (
        <span className="text-xs font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
          {act}
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
        {act}
      </span>
    );
  };

  const columns: Column<AuditLog>[] = [
    {
      id: 'id',
      label: 'Mã log',
      minWidth: 70,
      render: (row) => <span className="font-mono text-slate-400 text-xs">#{row.id}</span>,
    },
    {
      id: 'user',
      label: 'Người thao tác',
      filterFields: [{ key: 'userId', label: 'Mã người dùng', type: 'input' }],
      minWidth: 160,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">
            {row.createdByUser.fullName || row.createdByUser.email || 'Hệ thống'}
          </div>
          {row.ipAddress && (
            <div className="text-[10px] text-slate-400 font-mono">IP: {row.ipAddress}</div>
          )}
        </div>
      ),
    },
    {
      id: 'action',
      label: 'Hành động',
      filterFields: [{
        key: 'action',
        label: 'Hành động',
        type: 'select',
        filters: Object.values(AuditAction).map((value) => ({ text: value, value })),
      }],
      minWidth: 130,
      render: (row) => getActionBadge(row.action),
    },
    {
      id: 'entity',
      label: 'Đối tượng thực thể',
      filterFields: [
        { key: 'entityName', label: 'Tên thực thể', type: 'input' },
        { key: 'entityId', label: 'Mã thực thể', type: 'input' },
      ],
      minWidth: 140,
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-700">{row.entityName}</span>
        </div>
      ),
    },
    {
      id: 'createdAt',
      label: 'Thời gian',
      filterFields: [
        { key: 'dateFrom', label: 'Từ ngày', type: 'date' },
        { key: 'dateTo', label: 'Đến ngày', type: 'date' },
      ],
      minWidth: 140,
      render: (row) => (
        <span className="tabular-nums font-mono text-xs text-slate-600">
          {dayjs(row.createdAt).format('HH:mm:ss DD/MM/YYYY')}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'Chi tiết',
      align: 'right',
      minWidth: 90,
      render: (row) => (
        <Button
          size="small"
          onClick={() => setSelectedLog(row)}
          className="text-xs text-sky-700"
        >
          Xem log
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Nhật ký Kiểm toán & Bảo mật (Audit Logs)"
        subtitle="Ghi nhận vết can thiệp dữ liệu, phân quyền và các thao tác nhạy cảm trên hệ thống"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Nhật ký kiểm toán' }]}
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
        emptyTitle="Chưa có bản ghi nhật ký kiểm toán nào"
        emptyDescription="Các thao tác cập nhật, thêm mới và xóa sẽ được ghi nhận tự động tại đây."
      />

      {/* Log Detail Dialog */}
      <Dialog
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          Chi tiết Vết Kiểm toán #{selectedLog?.id}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          {selectedLog && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400">Người thực hiện:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {selectedLog.createdByUser.fullName || selectedLog.createdByUser.email || 'System'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Hành động:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedLog.action}</div>
                </div>
                <div>
                  <span className="text-slate-400">Thực thể & ID:</span>
                  <div className="font-semibold font-mono text-slate-800 mt-0.5">
                    {selectedLog.entityName}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Thời gian:</span>
                  <div className="font-mono text-slate-800 mt-0.5 tabular-nums">
                    {dayjs(selectedLog.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                  </div>
                </div>
              </div>

              {/* {selectedLog.details && (
                <div>
                  <Typography variant="subtitle2" className="text-xs font-bold text-slate-700 mb-1">
                    Dữ liệu chi tiết:
                  </Typography>
                  <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto max-h-60">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )} */}
            </>
          )}
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setSelectedLog(null)} color="inherit">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
