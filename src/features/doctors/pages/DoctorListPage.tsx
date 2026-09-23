// src/features/doctors/pages/DoctorListPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
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
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useDoctors, useDeleteDoctor } from '../hooks/useDoctors';
import { useSpecialtiesDropdown } from '@/features/specialties/hooks/useSpecialties';
import { usePermission } from '@/hooks/usePermission';
import { Doctor, DoctorDegree } from '@/types';

export const DoctorListPage: React.FC = () => {
  const navigate = useNavigate();
  const { canManageDoctors, canDeleteDoctor } = usePermission();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [specialtyId, setSpecialtyId] = useState<number | ''>('');
  const [degree, setDegree] = useState<DoctorDegree | ''>('');

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const { data: specialties } = useSpecialtiesDropdown();
  const { data, isLoading } = useDoctors({
    page,
    limit,
    search: search || undefined,
    specialtyId: specialtyId ? Number(specialtyId) : undefined,
    degree: degree || undefined,
  });

  const deleteMutation = useDeleteDoctor();

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Handled by interceptor
    }
  };

  const getDegreeLabel = (d?: DoctorDegree) => {
    switch (d) {
      case DoctorDegree.MD:
        return 'Bác sĩ Đa khoa (MD)';
      case DoctorDegree.MASTER:
        return 'Thạc sĩ Y khoa';
      case DoctorDegree.PHD:
        return 'Tiến sĩ Y khoa';
      case DoctorDegree.PROFESSOR:
        return 'Giáo sư';
      case DoctorDegree.ASSOCIATE_PROFESSOR:
        return 'Phó Giáo sư';
      default:
        return d || '—';
    }
  };

  const columns: Column<Doctor>[] = [
    {
      id: 'avatar',
      label: 'Ảnh',
      minWidth: 60,
      render: (row) => (
        <Avatar
          src={row.user?.avatar}
          sx={{ width: 34, height: 34, bgcolor: '#0284c7' }}
          className="text-xs font-semibold"
        >
          {row.user?.fullName?.charAt(0) || 'D'}
        </Avatar>
      ),
    },
    {
      id: 'fullName',
      label: 'Bác sĩ',
      minWidth: 180,
      render: (row) => (
        <div>
          <button
            onClick={() => navigate(`/doctors/${row.id}`)}
            className="font-semibold text-sky-700 hover:underline text-left text-sm"
          >
            {row.user?.fullName || 'Bác sĩ'}
          </button>
          <div className="text-xs text-slate-400">{row.user?.email}</div>
        </div>
      ),
    },
    {
      id: 'specialty',
      label: 'Chuyên khoa',
      minWidth: 140,
      render: (row) => (
        <span className="font-medium text-slate-700">
          {row.specialty?.name || 'Chưa phân chuyên khoa'}
        </span>
      ),
    },
    {
      id: 'degree',
      label: 'Học vị / Học hàm',
      minWidth: 160,
      render: (row) => (
        <span className="text-xs text-sky-800 font-medium bg-sky-50 px-2 py-0.5 rounded">
          {getDegreeLabel(row.degree)}
        </span>
      ),
    },
    {
      id: 'licenseNumber',
      label: 'Số CCHN',
      minWidth: 130,
      render: (row) => (
        <span className="font-mono text-xs tabular-nums text-slate-600 font-medium">
          {row.licenseNumber}
        </span>
      ),
    },
    {
      id: 'yearsOfExperience',
      label: 'Kinh nghiệm',
      minWidth: 120,
      render: (row) => (
        <span className="tabular-nums text-xs text-slate-700 font-medium">
          {row.yearsOfExperience ? `${row.yearsOfExperience} năm` : 'Chưa cập nhật'}
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
              onClick={() => navigate(`/doctors/${row.id}`)}
              className="text-slate-500 hover:text-sky-600"
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {canManageDoctors && (
            <Tooltip title="Chỉnh sửa">
              <IconButton
                size="small"
                onClick={() => navigate(`/doctors/${row.id}/edit`)}
                className="text-slate-500 hover:text-amber-600"
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {canDeleteDoctor && (
            <Tooltip title="Xóa bác sĩ">
              <IconButton
                size="small"
                onClick={() => {
                  setDeleteId(row.id);
                  setDeleteName(row.user?.fullName || row.licenseNumber);
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
        title="Danh sách Bác sĩ"
        subtitle="Quản lý thông tin chứng chỉ hành nghề, chuyên khoa và năng lực y tế"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Bác sĩ' }]}
        action={
          canManageDoctors && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/doctors/new')}
            >
              Thêm bác sĩ
            </Button>
          )
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <SearchInput
            placeholder="Tìm theo tên hoặc số CCHN..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />

          <FormControl size="small">
            <InputLabel id="specialty-filter">Chuyên khoa</InputLabel>
            <Select
              labelId="specialty-filter"
              value={specialtyId}
              label="Chuyên khoa"
              onChange={(e) => {
                setSpecialtyId(e.target.value as number | '');
                setPage(1);
              }}
            >
              <MenuItem value="">Tất cả chuyên khoa</MenuItem>
              {specialties?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel id="degree-filter">Học vị</InputLabel>
            <Select
              labelId="degree-filter"
              value={degree}
              label="Học vị"
              onChange={(e) => {
                setDegree(e.target.value as DoctorDegree | '');
                setPage(1);
              }}
            >
              <MenuItem value="">Tất cả học vị</MenuItem>
              <MenuItem value={DoctorDegree.MD}>Bác sĩ (MD)</MenuItem>
              <MenuItem value={DoctorDegree.MASTER}>Thạc sĩ</MenuItem>
              <MenuItem value={DoctorDegree.PHD}>Tiến sĩ</MenuItem>
              <MenuItem value={DoctorDegree.ASSOCIATE_PROFESSOR}>Phó Giáo sư</MenuItem>
              <MenuItem value={DoctorDegree.PROFESSOR}>Giáo sư</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="text-xs text-slate-500 text-right tabular-nums">
          Tổng số: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> bác sĩ
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
        emptyTitle="Chưa có bác sĩ nào phù hợp"
        emptyDescription="Thử bỏ lọc hoặc thêm hồ sơ bác sĩ mới vào hệ thống."
        emptyActionText={canManageDoctors ? 'Thêm bác sĩ mới' : undefined}
        onEmptyAction={() => navigate('/doctors/new')}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Xóa hồ sơ bác sĩ?"
        content={`Bạn có chắc muốn xóa hồ sơ bác sĩ "${deleteName}"? Thao tác này chỉ dành cho Super Admin.`}
        confirmText="Xóa hồ sơ"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
