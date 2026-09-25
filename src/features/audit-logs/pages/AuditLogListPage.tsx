// src/features/audit-logs/pages/AuditLogListPage.tsx
import { Column, DataTable } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { AuditAction, AuditLog } from '@/types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useAuditLogs } from '../hooks/useAuditLogs';

export const AuditLogListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [action, setAction] = useState<AuditAction>();
  const [entity, setEntity] = useState<string>();
  const [search, setSearch] = useState<string>();

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading } = useAuditLogs({
    page,
    limit,
    entityName: entity || undefined,
    search: search || undefined,
    action: action || undefined,
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
      minWidth: 130,
      render: (row) => getActionBadge(row.action),
    },
    {
      id: 'entity',
      label: 'Đối tượng thực thể',
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

      <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SearchInput
          placeholder="Tìm theo thực thể, IP, hoặc mã..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
        />

        <FormControl size="small">
          <InputLabel id="action-filter">Lọc theo hành động</InputLabel>
          <Select
            labelId="action-filter"
            value={action}
            label="Lọc theo hành động"
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">Tất cả hành động</MenuItem>
            <MenuItem value="CREATE">CREATE (Tạo mới)</MenuItem>
            <MenuItem value="UPDATE">UPDATE (Cập nhật)</MenuItem>
            <MenuItem value="DELETE">DELETE (Xóa)</MenuItem>
            <MenuItem value="LOGIN">LOGIN (Đăng nhập)</MenuItem>
            <MenuItem value="LOGOUT">LOGOUT (Đăng xuất)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel id="entity-filter">Lọc theo thực thể</InputLabel>
          <Select
            labelId="entity-filter"
            value={entity}
            label="Lọc theo thực thể"
            onChange={(e) => {
              setEntity(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">Tất cả thực thể</MenuItem>
            <MenuItem value="Patient">Bệnh nhân (Patient)</MenuItem>
            <MenuItem value="Appointment">Lịch hẹn (Appointment)</MenuItem>
            <MenuItem value="Doctor">Bác sĩ (Doctor)</MenuItem>
            <MenuItem value="Examination">Phiếu khám (Examination)</MenuItem>
            <MenuItem value="Prescription">Đơn thuốc (Prescription)</MenuItem>
            <MenuItem value="InventoryItem">Kho dược (InventoryItem)</MenuItem>
            <MenuItem value="User">Người dùng (User)</MenuItem>
          </Select>
        </FormControl>
      </div>

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
