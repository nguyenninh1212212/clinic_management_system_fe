// src/features/positions/pages/PositionListPage.tsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { positionsApi } from '@/api/endpoints/positions.api';
import { queryKeys } from '@/api/queryKeys';
import { notifyApiFeedback } from '@/api/axios';
import { Position, PositionLevel, CreatePositionDto, UpdatePositionDto } from '@/types';
import { usePermission } from '@/hooks/usePermission';

export const PositionListPage: React.FC = () => {
  const { isSuperAdmin, isAdmin } = usePermission();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<PositionLevel | ''>('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [positionCode, setPositionCode] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [level, setLevel] = useState<PositionLevel>(PositionLevel.STAFF);
  const [description, setDescription] = useState('');

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.positions.list({
      page,
      limit,
      search: search || undefined,
      level: levelFilter || undefined,
    }),
    queryFn: () =>
      positionsApi.findAll({
        page,
        limit,
        search: search || undefined,
        level: levelFilter || undefined,
      }),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreatePositionDto) => positionsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
      setDialogOpen(false);
      notifyApiFeedback('Thêm vị trí công việc thành công', 'info');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdatePositionDto }) =>
      positionsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
      setDialogOpen(false);
      notifyApiFeedback('Cập nhật vị trí thành công', 'info');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => positionsApi.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
      setDeleteId(null);
      notifyApiFeedback('Đã xóa vị trí công tác', 'info');
    },
  });

  const handleOpenCreate = () => {
    setEditingPosition(null);
    setPositionCode('');
    setPositionTitle('');
    setLevel(PositionLevel.STAFF);
    setDescription('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (pos: Position) => {
    setEditingPosition(pos);
    setPositionCode(pos.positionCode);
    setPositionTitle(pos.positionTitle);
    setLevel(pos.level);
    setDescription(pos.description || '');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!positionCode.trim() || !positionTitle.trim()) return;

    if (editingPosition) {
      await updateMutation.mutateAsync({
        id: editingPosition.id,
        dto: {
          positionCode: positionCode.trim(),
          positionTitle: positionTitle.trim(),
          level,
          description: description.trim() || undefined,
        },
      });
    } else {
      await createMutation.mutateAsync({
        positionCode: positionCode.trim(),
        positionTitle: positionTitle.trim(),
        level,
        description: description.trim() || undefined,
        isActive: true,
      });
    }
  };

  const columns: Column<Position>[] = [
    {
      id: 'id',
      label: 'Mã',
      minWidth: 60,
      render: (row) => <span className="font-mono text-slate-500">#{row.id}</span>,
    },
    {
      id: 'positionCode',
      label: 'Mã chức danh',
      minWidth: 140,
      render: (row) => (
        <span className="font-mono font-semibold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded">
          {row.positionCode}
        </span>
      ),
    },
    {
      id: 'positionTitle',
      label: 'Tên chức danh / Vị trí',
      minWidth: 200,
      render: (row) => (
        <div className="flex items-center gap-2">
          <BadgeOutlinedIcon fontSize="small" className="text-sky-600" />
          <span className="font-semibold text-slate-800 text-sm">{row.positionTitle}</span>
        </div>
      ),
    },
    {
      id: 'level',
      label: 'Cấp bậc',
      minWidth: 130,
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700">
          {row.level}
        </span>
      ),
    },
    {
      id: 'description',
      label: 'Mô tả vị trí',
      minWidth: 240,
      render: (row) => (
        <span className="text-slate-600 text-xs">{row.description || '—'}</span>
      ),
    },
    {
      id: 'isActive',
      label: 'Trạng thái',
      minWidth: 120,
      render: (row) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            row.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {row.isActive ? 'Đang áp dụng' : 'Tạm dừng'}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
      minWidth: 110,
      render: (row) => {
        if (!isSuperAdmin && !isAdmin) return null;
        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip title="Chỉnh sửa chức vụ">
              <IconButton
                size="small"
                onClick={() => handleOpenEdit(row)}
                className="text-slate-500 hover:text-amber-600"
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa chức vụ">
              <IconButton
                size="small"
                onClick={() => {
                  setDeleteId(row.id);
                  setDeleteName(row.positionTitle);
                }}
                className="text-slate-500 hover:text-rose-600"
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Danh mục Vị trí & Chức danh Công việc"
        subtitle="Quản lý hệ thống cấp bậc, chức vụ và phân quyền ngạch lương nhân sự phòng khám"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Vị trí công việc' }]}
        action={
          (isSuperAdmin || isAdmin) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Thêm vị trí mới
            </Button>
          )
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchInput
            placeholder="Tìm theo mã hoặc tên vị trí..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            className="sm:w-80"
          />

          <FormControl size="small" className="sm:w-48">
            <InputLabel id="pos-level-label">Cấp bậc</InputLabel>
            <Select
              labelId="pos-level-label"
              value={levelFilter}
              label="Cấp bậc"
              onChange={(e) => {
                setLevelFilter(e.target.value as PositionLevel | '');
                setPage(1);
              }}
            >
              <MenuItem value="">Tất cả cấp bậc</MenuItem>
              {Object.values(PositionLevel).map((lvl) => (
                <MenuItem key={lvl} value={lvl}>
                  {lvl}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Tổng số: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> vị trí
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
        emptyTitle="Chưa có chức vụ nào"
        emptyDescription="Thiết lập các vị trí công tác để gán cho tài khoản nhân viên."
        emptyActionText="Thêm vị trí đầu tiên"
        onEmptyAction={handleOpenCreate}
      />

      {/* Position Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          {editingPosition ? 'Cập nhật vị trí công việc' : 'Thêm vị trí công việc mới'}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Mã vị trí (Code) *"
              fullWidth
              size="small"
              value={positionCode}
              onChange={(e) => setPositionCode(e.target.value)}
              placeholder="VD: DOC_SENIOR, NURSE_LEAD..."
            />

            <FormControl fullWidth size="small">
              <InputLabel id="dialog-pos-level-label">Cấp bậc *</InputLabel>
              <Select
                labelId="dialog-pos-level-label"
                value={level}
                label="Cấp bậc *"
                onChange={(e) => setLevel(e.target.value as PositionLevel)}
              >
                {Object.values(PositionLevel).map((lvl) => (
                  <MenuItem key={lvl} value={lvl}>
                    {lvl}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <TextField
            label="Tên chức danh công việc *"
            fullWidth
            size="small"
            value={positionTitle}
            onChange={(e) => setPositionTitle(e.target.value)}
            placeholder="VD: Bác sĩ chuyên khoa II, Điều dưỡng trưởng..."
          />

          <TextField
            label="Mô tả chức năng nhiệm vụ"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả tóm tắt quyền hạn và trách nhiệm của vị trí..."
          />
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!positionCode.trim() || !positionTitle.trim() || createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu vị trí'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        title="Xóa vị trí công tác?"
        content={`Bạn có chắc muốn xóa chức vụ "${deleteName}"? Thao tác có thể ảnh hưởng đến người dùng đang giữ vị trí này.`}
        confirmText="Xóa chức vụ"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
