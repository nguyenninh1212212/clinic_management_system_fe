// src/features/patients/pages/PatientListPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { StatusChip } from '@/components/common/StatusChip';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { usePatients, useDeletePatient } from '../hooks/usePatients';
import { usePermission } from '@/hooks/usePermission';
import { Patient, Gender } from '@/types';
import dayjs from 'dayjs';

export const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const { canCreateOrEditPatient, canDeletePatient } = usePermission();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');

  const { data, isLoading } = usePatients({
    page,
    limit,
    search: search || undefined,
    gender: gender || undefined,
  });

  const deleteMutation = useDeletePatient();

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Handled by interceptor feedback
    }
  };

  const columns: Column<Patient>[] = [
    {
      id: 'stt',
      label: 'STT',
      minWidth: 60,
      render: (_row, idx) => (
        <span className="text-slate-400 tabular-nums">
          {(page - 1) * limit + idx + 1}
        </span>
      ),
    },
    {
      id: 'fullName',
      label: 'Họ và tên',
      minWidth: 180,
      render: (row) => (
        <div>
          <button
            onClick={() => navigate(`/patients/${row.id}`)}
            className="font-semibold text-sky-700 hover:underline text-left block text-sm"
          >
            {row.fullName}
          </button>
          {row.address && (
            <span className="text-xs text-slate-400 line-clamp-1">{row.address}</span>
          )}
        </div>
      ),
    },
    {
      id: 'gender',
      label: 'Giới tính',
      minWidth: 100,
      render: (row) => <StatusChip status={row.gender} type="gender" />,
    },
    {
      id: 'dateOfBirth',
      label: 'Ngày sinh',
      minWidth: 110,
      render: (row) => (
        <span className="tabular-nums text-slate-600 text-xs">
          {row.dateOfBirth ? dayjs(row.dateOfBirth).format('DD/MM/YYYY') : '—'}
        </span>
      ),
    },
    {
      id: 'phone',
      label: 'Số điện thoại',
      minWidth: 130,
      render: (row) => (
        <span className="tabular-nums font-mono text-slate-700 text-xs font-medium">
          {row.phone || '—'}
        </span>
      ),
    },
    {
      id: 'identityNumber',
      label: 'Số CCCD/CMND',
      minWidth: 140,
      render: (row) => (
        <span className="tabular-nums font-mono text-slate-600 text-xs">
          {row.identityNumber || '—'}
        </span>
      ),
    },
    {
      id: 'createdAt',
      label: 'Ngày đăng ký',
      minWidth: 120,
      render: (row) => (
        <span className="tabular-nums text-slate-500 text-xs">
          {dayjs(row.createdAt).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
      minWidth: 120,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              onClick={() => navigate(`/patients/${row.id}`)}
              className="text-slate-500 hover:text-sky-600"
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {canCreateOrEditPatient && (
            <Tooltip title="Chỉnh sửa">
              <IconButton
                size="small"
                onClick={() => navigate(`/patients/${row.id}/edit`)}
                className="text-slate-500 hover:text-amber-600"
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {canDeletePatient && (
            <Tooltip title="Xóa hồ sơ">
              <IconButton
                size="small"
                onClick={() => {
                  setDeleteId(row.id);
                  setDeleteName(row.fullName);
                }}
                className="text-slate-500 hover:text-rose-600"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Danh sách Bệnh nhân"
        subtitle="Quản lý hồ sơ y tế bệnh nhân ngoại trú và nội trú"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Bệnh nhân' }]}
        action={
          canCreateOrEditPatient && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/patients/new')}
            >
              Thêm bệnh nhân
            </Button>
          )
        }
      />

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchInput
            placeholder="Tìm theo họ tên, số điện thoại hoặc CCCD..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            className="sm:w-80"
          />

          <FormControl size="small" className="sm:w-44">
            <InputLabel id="gender-filter-label">Giới tính</InputLabel>
            <Select
              labelId="gender-filter-label"
              value={gender}
              label="Giới tính"
              onChange={(e) => {
                setGender(e.target.value as Gender | '');
                setPage(1);
              }}
            >
              <MenuItem value="">Tất cả giới tính</MenuItem>
              <MenuItem value={Gender.MALE}>Nam</MenuItem>
              <MenuItem value={Gender.FEMALE}>Nữ</MenuItem>
              <MenuItem value={Gender.OTHER}>Khác</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="text-xs text-slate-500 text-right tabular-nums">
          Tổng số: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> bệnh nhân
        </div>
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
        emptyTitle="Không tìm thấy bệnh nhân"
        emptyDescription="Thử tìm kiếm với từ khóa khác hoặc thêm hồ sơ bệnh nhân mới."
        emptyActionText={canCreateOrEditPatient ? 'Thêm bệnh nhân mới' : undefined}
        onEmptyAction={() => navigate('/patients/new')}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Xóa hồ sơ bệnh nhân?"
        content={`Bạn có chắc chắn muốn xóa hồ sơ của "${deleteName}"? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa vĩnh viễn"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
